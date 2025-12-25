import { db } from './db';
import { 
  encryptedAiSessions, 
  encryptedConversationMessages,
  encryptionKeysRegistry,
  conversationRestorePoints,
  conversationSearchIndex,
  type InsertEncryptedAiSession,
  type InsertEncryptedConversationMessage,
  type EncryptedAiSession,
  type EncryptedConversationMessage
} from '@shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import {
  encryptConversationObject,
  decryptConversationObject,
  generateSessionId,
  generateKeyId,
  hashKeywords,
  detectLanguage
} from './crypto-service';

interface ConversationMessage {
  role: 'user' | 'ai' | 'system';
  content: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

interface DecryptedMessage extends ConversationMessage {
  id: string;
  sequenceNumber: number;
}

class ConversationStorageService {
  private autoSaveIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private messageBuffers: Map<string, ConversationMessage[]> = new Map();

  async createSession(ownerId?: string, ownerName?: string): Promise<EncryptedAiSession> {
    const sessionId = generateSessionId();
    const keyId = generateKeyId();

    await db.insert(encryptionKeysRegistry).values({
      keyId,
      algorithm: 'AES-256-GCM',
      purpose: 'conversation',
      version: 1,
      isActive: true,
      isRevoked: false,
    });

    const [session] = await db.insert(encryptedAiSessions).values({
      sessionId,
      ownerId,
      ownerName,
      keyId,
      encryptionVersion: 'AES-256-GCM',
      totalMessages: 0,
      totalTokens: 0,
      status: 'active',
      autoSaveEnabled: true,
      autoSaveIntervalSeconds: 120,
    }).returning();

    return session;
  }

  async saveMessage(
    sessionDbId: string, 
    message: ConversationMessage, 
    sequenceNumber: number
  ): Promise<EncryptedConversationMessage> {
    const encryptedContent = encryptConversationObject({
      content: message.content,
      metadata: message.metadata,
    });

    const keywordHashes = hashKeywords(message.content);
    const searchableHash = keywordHashes.length > 0 ? keywordHashes[0] : null;

    const [saved] = await db.insert(encryptedConversationMessages).values({
      sessionId: sessionDbId,
      messageType: message.role,
      sequenceNumber,
      encryptedContent,
      searchableHash,
      tokenCount: Math.ceil(message.content.length / 4),
      timestamp: message.timestamp || new Date(),
    }).returning();

    await db.update(encryptedAiSessions)
      .set({ 
        totalMessages: sql`${encryptedAiSessions.totalMessages} + 1`,
        updatedAt: new Date(),
        lastAutoSaveAt: new Date(),
      })
      .where(eq(encryptedAiSessions.id, sessionDbId));

    if (keywordHashes.length > 0) {
      await db.insert(conversationSearchIndex).values({
        sessionId: sessionDbId,
        messageId: saved.id,
        keywordHashes,
        detectedLanguage: detectLanguage(message.content),
        messageTimestamp: saved.timestamp,
      });
    }

    return saved;
  }

  async getSessionMessages(sessionDbId: string): Promise<DecryptedMessage[]> {
    const messages = await db.select()
      .from(encryptedConversationMessages)
      .where(eq(encryptedConversationMessages.sessionId, sessionDbId))
      .orderBy(encryptedConversationMessages.sequenceNumber);

    return messages.map(msg => {
      const decrypted = decryptConversationObject<{ content: string; metadata?: Record<string, any> }>(
        msg.encryptedContent
      );
      return {
        id: msg.id,
        role: msg.messageType as 'user' | 'ai' | 'system',
        content: decrypted.content,
        metadata: decrypted.metadata,
        sequenceNumber: msg.sequenceNumber,
        timestamp: msg.timestamp,
      };
    });
  }

  async getSessions(ownerId?: string): Promise<EncryptedAiSession[]> {
    if (ownerId) {
      return await db.select()
        .from(encryptedAiSessions)
        .where(eq(encryptedAiSessions.ownerId, ownerId))
        .orderBy(desc(encryptedAiSessions.createdAt));
    }
    return await db.select()
      .from(encryptedAiSessions)
      .orderBy(desc(encryptedAiSessions.createdAt));
  }

  async getSessionById(sessionDbId: string): Promise<EncryptedAiSession | undefined> {
    const [session] = await db.select()
      .from(encryptedAiSessions)
      .where(eq(encryptedAiSessions.id, sessionDbId));
    return session;
  }

  async getSessionBySessionId(sessionId: string): Promise<EncryptedAiSession | undefined> {
    const [session] = await db.select()
      .from(encryptedAiSessions)
      .where(eq(encryptedAiSessions.sessionId, sessionId));
    return session;
  }

  async updateSessionTitle(sessionDbId: string, title: string, titleAr?: string): Promise<void> {
    await db.update(encryptedAiSessions)
      .set({ title, titleAr, updatedAt: new Date() })
      .where(eq(encryptedAiSessions.id, sessionDbId));
  }

  async closeSession(sessionDbId: string): Promise<void> {
    await db.update(encryptedAiSessions)
      .set({ 
        status: 'closed', 
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(encryptedAiSessions.id, sessionDbId));

    const intervalId = this.autoSaveIntervals.get(sessionDbId);
    if (intervalId) {
      clearInterval(intervalId);
      this.autoSaveIntervals.delete(sessionDbId);
    }
  }

  async createRestorePoint(sessionDbId: string, name?: string): Promise<void> {
    const messages = await this.getSessionMessages(sessionDbId);
    const encryptedSnapshot = encryptConversationObject(messages);

    await db.insert(conversationRestorePoints).values({
      sessionId: sessionDbId,
      name: name || `Auto-restore ${new Date().toISOString()}`,
      encryptedSnapshot,
      messageCount: messages.length,
      lastMessageId: messages.length > 0 ? messages[messages.length - 1].id : null,
      isAutomatic: !name,
    });
  }

  async getRestorePoints(sessionDbId: string) {
    return await db.select()
      .from(conversationRestorePoints)
      .where(eq(conversationRestorePoints.sessionId, sessionDbId))
      .orderBy(desc(conversationRestorePoints.createdAt));
  }

  async restoreFromPoint(restorePointId: string): Promise<DecryptedMessage[]> {
    const [point] = await db.select()
      .from(conversationRestorePoints)
      .where(eq(conversationRestorePoints.id, restorePointId));

    if (!point) {
      throw new Error('Restore point not found');
    }

    const messages = decryptConversationObject<DecryptedMessage[]>(point.encryptedSnapshot);

    await db.update(conversationRestorePoints)
      .set({ 
        restoredCount: sql`${conversationRestorePoints.restoredCount} + 1`,
        lastRestoredAt: new Date(),
      })
      .where(eq(conversationRestorePoints.id, restorePointId));

    return messages;
  }

  async searchConversations(keyword: string, sessionDbId?: string): Promise<DecryptedMessage[]> {
    const keywordHash = hashKeywords(keyword)[0];
    if (!keywordHash) return [];

    let query = db.select({
      messageId: conversationSearchIndex.messageId,
      sessionId: conversationSearchIndex.sessionId,
    })
    .from(conversationSearchIndex)
    .where(
      sql`${conversationSearchIndex.keywordHashes}::jsonb @> ${JSON.stringify([keywordHash])}::jsonb`
    );

    const results = await query;
    
    const messages: DecryptedMessage[] = [];
    for (const result of results) {
      if (sessionDbId && result.sessionId !== sessionDbId) continue;
      
      const [msg] = await db.select()
        .from(encryptedConversationMessages)
        .where(eq(encryptedConversationMessages.id, result.messageId));
      
      if (msg) {
        const decrypted = decryptConversationObject<{ content: string; metadata?: Record<string, any> }>(
          msg.encryptedContent
        );
        messages.push({
          id: msg.id,
          role: msg.messageType as 'user' | 'ai' | 'system',
          content: decrypted.content,
          metadata: decrypted.metadata,
          sequenceNumber: msg.sequenceNumber,
          timestamp: msg.timestamp,
        });
      }
    }

    return messages;
  }

  async deleteSession(sessionDbId: string): Promise<void> {
    await db.delete(encryptedAiSessions)
      .where(eq(encryptedAiSessions.id, sessionDbId));
  }

  startAutoSave(sessionDbId: string, intervalSeconds: number = 120) {
    if (this.autoSaveIntervals.has(sessionDbId)) {
      return;
    }

    const intervalId = setInterval(async () => {
      const buffer = this.messageBuffers.get(sessionDbId) || [];
      if (buffer.length > 0) {
        await this.createRestorePoint(sessionDbId);
        this.messageBuffers.set(sessionDbId, []);
        console.log(`[Nova AI] Auto-saved session ${sessionDbId}`);
      }
    }, intervalSeconds * 1000);

    this.autoSaveIntervals.set(sessionDbId, intervalId);
    console.log(`[Nova AI] Auto-save started for session ${sessionDbId} (every ${intervalSeconds}s)`);
  }

  addToBuffer(sessionDbId: string, message: ConversationMessage) {
    const buffer = this.messageBuffers.get(sessionDbId) || [];
    buffer.push(message);
    this.messageBuffers.set(sessionDbId, buffer);
  }

  async getStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    totalMessages: number;
  }> {
    const sessions = await db.select().from(encryptedAiSessions);
    const activeSessions = sessions.filter(s => s.status === 'active').length;
    const totalMessages = sessions.reduce((sum, s) => sum + (s.totalMessages || 0), 0);

    return {
      totalSessions: sessions.length,
      activeSessions,
      totalMessages,
    };
  }
}

export const conversationStorage = new ConversationStorageService();

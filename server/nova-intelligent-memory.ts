import { db } from './db';
import { 
  novaAiMemory, 
  novaSessions, 
  users,
  conversationMessages,
  sovereignConversations
} from '@shared/schema';
import { eq, desc, and, sql, or } from 'drizzle-orm';
import type { Express, Request, Response } from 'express';

// ==================== Nova Intelligent Memory Service ====================
// Real database-backed memory system for intelligent conversations
// نظام ذاكرة ذكي مدعوم بقاعدة بيانات حقيقية للمحادثات الذكية

interface MemoryEntry {
  id: string;
  type: string;
  title: string;
  content: string;
  importance: string;
  keywords: string[];
  relatedIds: string[];
  metadata: Record<string, any>;
  createdAt: Date;
  accessCount: number;
}

interface ConversationContext {
  userId: string;
  sessionId: string;
  recentMessages: Array<{ role: string; content: string; timestamp: Date }>;
  userPreferences: Record<string, any>;
  longTermMemories: MemoryEntry[];
  costEstimate: number;
}

class NovaIntelligentMemoryService {
  
  // ==================== Memory Storage ====================
  
  async storeMemory(
    userId: string,
    type: string,
    title: string,
    content: string,
    importance: string = 'medium',
    keywords: string[] = [],
    metadata: Record<string, any> = {}
  ): Promise<string> {
    const [memory] = await db.insert(novaAiMemory).values({
      memoryType: type,
      title,
      content,
      importance,
      keywords,
      relatedMemories: [],
      context: { userId },
      metadata,
      accessCount: 0,
      lastAccessedAt: new Date(),
    }).returning();
    
    console.log(`[Nova Memory] Stored ${type} memory: ${title}`);
    return memory.id;
  }
  
  // ==================== Memory Retrieval ====================
  
  async retrieveRelevantMemories(
    userId: string,
    query: string,
    limit: number = 10,
    types?: string[]
  ): Promise<MemoryEntry[]> {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    
    // Get all memories for this user (stored in context.userId)
    const allMemories = await db.select()
      .from(novaAiMemory)
      .where(sql`${novaAiMemory.context}->>'userId' = ${userId}`)
      .orderBy(desc(novaAiMemory.lastAccessedAt))
      .limit(100);
    
    // Filter by type if specified
    let filtered = allMemories;
    if (types && types.length > 0) {
      filtered = allMemories.filter(m => types.includes(m.memoryType));
    }
    
    // Score by relevance
    const scored = filtered.map(mem => {
      let score = mem.importance === 'critical' ? 10 : 
                  mem.importance === 'high' ? 7 : 
                  mem.importance === 'medium' ? 5 : 3;
      
      // Keyword matching
      const memContent = (mem.content || '').toLowerCase();
      const memTitle = (mem.title || '').toLowerCase();
      for (const word of queryWords) {
        if (memContent.includes(word)) score += 2;
        if (memTitle.includes(word)) score += 3;
        if (mem.keywords?.includes(word)) score += 3;
      }
      
      // Recency bonus
      const daysSinceAccess = (Date.now() - new Date(mem.lastAccessedAt || mem.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceAccess < 1) score += 3;
      else if (daysSinceAccess < 7) score += 1;
      
      // Access frequency bonus
      const accessCount = mem.accessCount || 0;
      score += Math.min(accessCount / 10, 2);
      
      return { memory: mem, score };
    });
    
    // Sort by score and return top results
    scored.sort((a, b) => b.score - a.score);
    const topMemories = scored.slice(0, limit);
    
    // Update access times
    for (const { memory } of topMemories) {
      await db.update(novaAiMemory)
        .set({
          lastAccessedAt: new Date(),
          accessCount: (memory.accessCount || 0) + 1,
        })
        .where(eq(novaAiMemory.id, memory.id));
    }
    
    return topMemories.map(({ memory }) => ({
      id: memory.id,
      type: memory.memoryType,
      title: memory.title,
      content: memory.content,
      importance: memory.importance,
      keywords: memory.keywords || [],
      relatedIds: memory.relatedMemories || [],
      metadata: memory.metadata || {},
      createdAt: memory.createdAt,
      accessCount: memory.accessCount || 0,
    }));
  }
  
  // ==================== User Preferences ====================
  
  async getUserPreferences(userId: string): Promise<Record<string, any>> {
    const prefMemories = await db.select()
      .from(novaAiMemory)
      .where(and(
        sql`${novaAiMemory.context}->>'userId' = ${userId}`,
        eq(novaAiMemory.memoryType, 'preference')
      ))
      .orderBy(desc(novaAiMemory.importance));
    
    const preferences: Record<string, any> = {};
    for (const mem of prefMemories) {
      const meta = mem.metadata as Record<string, any>;
      if (meta?.key) {
        preferences[meta.key] = meta.value;
      }
    }
    
    return preferences;
  }
  
  async setUserPreference(userId: string, key: string, value: any): Promise<void> {
    // Check if preference exists
    const existing = await db.select()
      .from(novaAiMemory)
      .where(and(
        sql`${novaAiMemory.context}->>'userId' = ${userId}`,
        eq(novaAiMemory.memoryType, 'preference'),
        sql`${novaAiMemory.metadata}->>'key' = ${key}`
      ));
    
    if (existing.length > 0) {
      await db.update(novaAiMemory)
        .set({
          metadata: { sourceType: 'preference', tags: [key], confidence: 1, version: 1 },
          content: `${key}: ${JSON.stringify(value)}`,
          updatedAt: new Date(),
        })
        .where(eq(novaAiMemory.id, existing[0].id));
    } else {
      await this.storeMemory(
        userId,
        'preference',
        `Preference: ${key}`,
        `${key}: ${JSON.stringify(value)}`,
        'high',
        [key],
        { key, value }
      );
    }
  }
  
  // ==================== Learning from Conversations ====================
  
  async learnFromConversation(
    userId: string,
    conversationId: string,
    summary: string,
    learnings: string[],
    keywords: string[]
  ): Promise<void> {
    // Store conversation summary as learning
    await this.storeMemory(
      userId,
      'learning',
      `Conversation Summary`,
      summary,
      'medium',
      keywords,
      { conversationId, learnings, timestamp: new Date() }
    );
    
    // Extract and store individual learnings
    for (const learning of learnings) {
      await this.storeMemory(
        userId,
        'learning',
        `Learning`,
        learning,
        'medium',
        keywords,
        { conversationId, type: 'extracted_learning' }
      );
    }
    
    console.log(`[Nova Memory] Learned ${learnings.length} items from conversation ${conversationId}`);
  }
  
  // ==================== Build Conversation Context ====================
  
  async buildConversationContext(
    userId: string,
    sessionId: string,
    currentMessage: string
  ): Promise<ConversationContext> {
    // Get recent messages from sovereign conversations
    const messages = await db.select()
      .from(conversationMessages)
      .where(eq(conversationMessages.conversationId, sessionId))
      .orderBy(desc(conversationMessages.createdAt))
      .limit(10);
    
    const recentMessages = messages.reverse().map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.createdAt,
    }));
    
    // Get user preferences
    const userPreferences = await this.getUserPreferences(userId);
    
    // Get relevant long-term memories
    const longTermMemories = await this.retrieveRelevantMemories(
      userId,
      currentMessage,
      5,
      ['learning', 'context', 'decision']
    );
    
    // Estimate cost based on context size
    const tokenEstimate = recentMessages.reduce((sum, m) => sum + m.content.length / 4, 0) +
      longTermMemories.reduce((sum, m) => sum + m.content.length / 4, 0) +
      currentMessage.length / 4;
    const costEstimate = tokenEstimate * 0.00001;
    
    return {
      userId,
      sessionId,
      recentMessages,
      userPreferences,
      longTermMemories,
      costEstimate,
    };
  }
  
  // ==================== Session Management ====================
  
  async createSession(
    userId: string,
    title?: string
  ): Promise<string> {
    const [session] = await db.insert(novaSessions).values({
      userId,
      title: title || 'New Conversation',
      status: 'active',
      messageCount: 0,
      contextSnapshot: {},
    }).returning();
    
    return session.id;
  }
  
  async appendMessage(
    sessionId: string,
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Insert into conversation_messages table
    await db.insert(conversationMessages).values({
      conversationId,
      role,
      content,
      metadata: metadata || {},
    });
    
    // Update session message count
    await db.update(novaSessions)
      .set({
        messageCount: sql`${novaSessions.messageCount} + 1`,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(novaSessions.id, sessionId));
  }
  
  async getSessionHistory(sessionId: string): Promise<Array<{ role: string; content: string; timestamp: Date }>> {
    const messages = await db.select()
      .from(conversationMessages)
      .where(eq(conversationMessages.conversationId, sessionId))
      .orderBy(conversationMessages.createdAt);
    
    return messages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.createdAt,
    }));
  }
  
  async getUserSessions(userId: string, limit: number = 20): Promise<any[]> {
    return await db.select()
      .from(novaSessions)
      .where(eq(novaSessions.userId, userId))
      .orderBy(desc(novaSessions.updatedAt))
      .limit(limit);
  }
  
  // ==================== Memory Statistics ====================
  
  async getMemoryStats(userId: string): Promise<{
    totalMemories: number;
    byType: Record<string, number>;
    oldestMemory: Date | null;
    newestMemory: Date | null;
  }> {
    const memories = await db.select()
      .from(novaAiMemory)
      .where(sql`${novaAiMemory.context}->>'userId' = ${userId}`);
    
    const byType: Record<string, number> = {};
    let oldest: Date | null = null;
    let newest: Date | null = null;
    
    for (const mem of memories) {
      byType[mem.memoryType] = (byType[mem.memoryType] || 0) + 1;
      
      const created = new Date(mem.createdAt);
      if (!oldest || created < oldest) oldest = created;
      if (!newest || created > newest) newest = created;
    }
    
    return {
      totalMemories: memories.length,
      byType,
      oldestMemory: oldest,
      newestMemory: newest,
    };
  }
}

// Singleton instance
export const novaMemory = new NovaIntelligentMemoryService();

// ==================== API Routes ====================

export function registerNovaIntelligentMemoryRoutes(app: Express) {
  const requireAuth = (req: Request, res: Response, next: any) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        errorAr: "المصادقة مطلوبة",
      });
    }
    next();
  };

  // ==================== Create Session ====================
  app.post("/api/nova/intelligent/sessions", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { title } = req.body;
      
      const sessionId = await novaMemory.createSession(user.id, title);
      
      res.json({
        success: true,
        sessionId,
        message: "Session created",
        messageAr: "تم إنشاء الجلسة",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ==================== Get User Sessions ====================
  app.get("/api/nova/intelligent/sessions", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const sessions = await novaMemory.getUserSessions(user.id);
      
      res.json({ success: true, sessions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ==================== Get Session History ====================
  app.get("/api/nova/intelligent/sessions/:sessionId/history", requireAuth, async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const history = await novaMemory.getSessionHistory(sessionId);
      
      res.json({ success: true, history });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ==================== Store Memory ====================
  app.post("/api/nova/intelligent/memory", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { type, title, content, importance, keywords, metadata } = req.body;
      
      const memoryId = await novaMemory.storeMemory(
        user.id,
        type || 'context',
        title || 'Memory',
        content,
        importance || 'medium',
        keywords || [],
        metadata || {}
      );
      
      res.json({
        success: true,
        memoryId,
        message: "Memory stored",
        messageAr: "تم تخزين الذاكرة",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ==================== Retrieve Relevant Memories ====================
  app.post("/api/nova/intelligent/memory/search", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { query, limit, types } = req.body;
      
      const memories = await novaMemory.retrieveRelevantMemories(
        user.id,
        query || '',
        limit || 10,
        types
      );
      
      res.json({ success: true, memories, count: memories.length });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ==================== Get/Set Preferences ====================
  app.get("/api/nova/intelligent/preferences", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const preferences = await novaMemory.getUserPreferences(user.id);
      
      res.json({ success: true, preferences });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/nova/intelligent/preferences", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { key, value } = req.body;
      
      await novaMemory.setUserPreference(user.id, key, value);
      
      res.json({
        success: true,
        message: "Preference saved",
        messageAr: "تم حفظ التفضيل",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ==================== Memory Statistics ====================
  app.get("/api/nova/intelligent/memory/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const stats = await novaMemory.getMemoryStats(user.id);
      
      res.json({ success: true, stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ==================== Build Context ====================
  app.post("/api/nova/intelligent/context", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { sessionId, message } = req.body;
      
      const context = await novaMemory.buildConversationContext(
        user.id,
        sessionId,
        message || ''
      );
      
      res.json({ success: true, context });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  console.log("[Nova Intelligent Memory] Routes registered at /api/nova/intelligent/*");
}

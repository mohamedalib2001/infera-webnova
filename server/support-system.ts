/**
 * Intelligent Support System Service
 * نظام الدعم الذكي
 * 
 * AI-powered support system with:
 * - AI-first engagement
 * - Smart routing and escalation
 * - Knowledge base integration
 * - Agent copilot assistance
 */

import { db } from "./db";
import { eq, desc, asc, and, sql, isNull, gte, lte, or, like } from "drizzle-orm";
import {
  supportSessions,
  supportMessages,
  supportKnowledgeBase,
  supportAgents,
  supportSlaPolicies,
  supportRoutingRules,
  supportAnalytics,
  supportDiagnostics,
  users,
  type SupportSession,
  type SupportMessage,
  type SupportKnowledgeBase,
  type SupportAgent,
  type SupportSlaPolicy,
  type SupportRoutingRule,
  type InsertSupportSession,
  type InsertSupportMessage,
} from "@shared/schema";
import { aiExecutionLayer } from "./ai-execution-layer";

// ==================== AI SUPPORT ASSISTANT ====================

interface AIAssistantResponse {
  content: string;
  contentAr?: string;
  confidence: number;
  suggestedCategory?: string;
  suggestedPriority?: string;
  knowledgeBaseArticles?: string[];
  shouldEscalate: boolean;
  escalationReason?: string;
  diagnosticSuggestions?: string[];
}

interface RoutingRecommendation {
  agentId?: string;
  agentName?: string;
  priority: string;
  estimatedResponseTime: number;
  reason: string;
}

class SupportAIAssistant {
  private readonly serviceId = 'support_ai';
  private readonly confidenceThreshold = 0.7;

  async analyzeAndRespond(
    sessionId: string,
    userMessage: string,
    context: {
      category?: string;
      previousMessages?: Array<{ role: string; content: string }>;
      platformContext?: Record<string, unknown>;
    }
  ): Promise<AIAssistantResponse> {
    try {
      const knowledgeArticles = await this.searchKnowledgeBase(userMessage);
      
      const systemPrompt = this.buildSystemPrompt(knowledgeArticles, context);
      
      const messages = [
        ...(context.previousMessages || []),
        { role: 'user', content: userMessage }
      ];

      const response = await aiExecutionLayer.executeAI(this.serviceId, messages as any, {
        overrideSystemPrompt: systemPrompt,
        temperature: 0.3,
      });

      if (!response.success) {
        return {
          content: "I apologize, but I'm having trouble processing your request. Let me connect you with a human agent.",
          contentAr: "أعتذر، لكنني أواجه صعوبة في معالجة طلبك. دعني أوصلك بوكيل بشري.",
          confidence: 0,
          shouldEscalate: true,
          escalationReason: 'AI processing error',
        };
      }

      const aiContent = response.content || '';
      const analysis = this.analyzeResponse(aiContent, userMessage, knowledgeArticles);

      return {
        content: aiContent,
        confidence: analysis.confidence,
        suggestedCategory: analysis.category,
        suggestedPriority: analysis.priority,
        knowledgeBaseArticles: knowledgeArticles.map(a => a.id),
        shouldEscalate: analysis.confidence < this.confidenceThreshold,
        escalationReason: analysis.confidence < this.confidenceThreshold 
          ? `AI confidence ${(analysis.confidence * 100).toFixed(0)}% below threshold`
          : undefined,
        diagnosticSuggestions: analysis.diagnostics,
      };
    } catch (error) {
      console.error('AI Support Assistant error:', error);
      return {
        content: "I encountered an error. A human agent will assist you shortly.",
        contentAr: "واجهت خطأ. سيساعدك وكيل بشري قريباً.",
        confidence: 0,
        shouldEscalate: true,
        escalationReason: 'System error',
      };
    }
  }

  private buildSystemPrompt(
    articles: SupportKnowledgeBase[],
    context: { category?: string; platformContext?: Record<string, unknown> }
  ): string {
    const knowledgeContext = articles.length > 0
      ? `\n\nRelevant Knowledge Base Articles:\n${articles.map(a => `- ${a.title}: ${a.content.substring(0, 500)}`).join('\n')}`
      : '';

    const platformInfo = context.platformContext
      ? `\n\nPlatform Context:\n${JSON.stringify(context.platformContext, null, 2)}`
      : '';

    return `You are an AI Support Assistant for Infra Web Nova - a sovereign-grade platform for building digital platforms.

Your capabilities:
1. Understand and analyze user issues
2. Provide step-by-step solutions
3. Reference knowledge base articles
4. Identify issue severity and urgency
5. Know when to escalate to human agents

Guidelines:
- Be professional, helpful, and concise
- Provide bilingual responses when appropriate (English/Arabic)
- If you're uncertain, express your confidence level
- For complex technical issues, suggest escalation
- Never expose sensitive system information
- Tag issues appropriately (billing, AI, API, security, UI, etc.)

${knowledgeContext}${platformInfo}

Respond helpfully to the user's issue. If you cannot resolve it with high confidence, recommend escalation.`;
  }

  private async searchKnowledgeBase(query: string): Promise<SupportKnowledgeBase[]> {
    try {
      const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      
      if (keywords.length === 0) return [];

      const articles = await db.query.supportKnowledgeBase.findMany({
        where: and(
          eq(supportKnowledgeBase.isPublished, true),
          or(
            ...keywords.map(keyword => 
              or(
                like(supportKnowledgeBase.title, `%${keyword}%`),
                like(supportKnowledgeBase.content, `%${keyword}%`)
              )
            )
          )
        ),
        limit: 5,
        orderBy: [desc(supportKnowledgeBase.aiRelevanceScore)],
      });

      return articles;
    } catch (error) {
      console.error('Knowledge base search error:', error);
      return [];
    }
  }

  private analyzeResponse(
    aiResponse: string,
    userMessage: string,
    articles: SupportKnowledgeBase[]
  ): {
    confidence: number;
    category: string;
    priority: string;
    diagnostics: string[];
  } {
    let confidence = 0.8;
    
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    if (articles.length > 0) confidence += 0.1;
    if (lowerResponse.includes('not sure') || lowerResponse.includes('uncertain')) confidence -= 0.2;
    if (lowerResponse.includes('escalate') || lowerResponse.includes('human agent')) confidence -= 0.3;
    if (aiResponse.length < 50) confidence -= 0.2;

    const categoryKeywords: Record<string, string[]> = {
      billing: ['payment', 'invoice', 'subscription', 'charge', 'refund', 'price'],
      ai: ['model', 'claude', 'openai', 'ai', 'artificial', 'intelligence', 'copilot'],
      api: ['api', 'endpoint', 'rest', 'request', 'response', 'error code'],
      security: ['password', 'login', 'authentication', 'permission', 'access', 'hack'],
      ui: ['interface', 'button', 'screen', 'display', 'design', 'dark mode'],
      account: ['account', 'profile', 'settings', 'email', 'user'],
      performance: ['slow', 'speed', 'timeout', 'loading', 'performance'],
    };

    let category = 'general';
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(k => lowerMessage.includes(k))) {
        category = cat;
        break;
      }
    }

    let priority = 'medium';
    const urgentKeywords = ['urgent', 'emergency', 'down', 'critical', 'broken', 'not working'];
    const lowKeywords = ['question', 'wondering', 'curious', 'feature request'];
    
    if (urgentKeywords.some(k => lowerMessage.includes(k))) priority = 'high';
    if (lowKeywords.some(k => lowerMessage.includes(k))) priority = 'low';

    const diagnostics: string[] = [];
    if (lowerMessage.includes('error')) diagnostics.push('Check error logs');
    if (lowerMessage.includes('api')) diagnostics.push('Review API call history');
    if (lowerMessage.includes('slow')) diagnostics.push('Check performance metrics');

    confidence = Math.max(0, Math.min(1, confidence));

    return { confidence, category, priority, diagnostics };
  }

  async summarizeSession(sessionId: string): Promise<{ summary: string; summaryAr: string }> {
    try {
      const messages = await db.query.supportMessages.findMany({
        where: eq(supportMessages.sessionId, sessionId),
        orderBy: [asc(supportMessages.createdAt)],
      });

      if (messages.length === 0) {
        return { summary: 'No messages in session', summaryAr: 'لا توجد رسائل في الجلسة' };
      }

      const conversation = messages.map(m => 
        `${m.senderType}: ${m.content}`
      ).join('\n');

      const response = await aiExecutionLayer.executeAI(this.serviceId, [
        { role: 'user', content: `Summarize this support conversation in 2-3 sentences:\n\n${conversation}` }
      ], {
        overrideSystemPrompt: 'You are a summarization assistant. Provide concise, professional summaries.',
        maxTokens: 200,
      });

      return {
        summary: response.content || 'Unable to generate summary',
        summaryAr: response.content || 'تعذر إنشاء الملخص',
      };
    } catch (error) {
      console.error('Session summarization error:', error);
      return { summary: 'Summary unavailable', summaryAr: 'الملخص غير متاح' };
    }
  }

  async suggestAgentResponse(
    sessionId: string,
    agentId: string
  ): Promise<{ suggestion: string; confidence: number }> {
    try {
      const messages = await db.query.supportMessages.findMany({
        where: eq(supportMessages.sessionId, sessionId),
        orderBy: [asc(supportMessages.createdAt)],
        limit: 20,
      });

      const conversation = messages.map(m => ({
        role: m.senderType === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const response = await aiExecutionLayer.executeAI(this.serviceId, [
        ...conversation,
        { role: 'user', content: 'Suggest a helpful response for the support agent to send:' }
      ] as any, {
        overrideSystemPrompt: 'You are an AI copilot for support agents. Suggest professional, helpful responses.',
        maxTokens: 500,
      });

      return {
        suggestion: response.content || '',
        confidence: 0.85,
      };
    } catch (error) {
      console.error('Agent suggestion error:', error);
      return { suggestion: '', confidence: 0 };
    }
  }
}

// ==================== SUPPORT SESSION MANAGER ====================

class SupportSessionManager {
  private ticketCounter = 0;

  async generateTicketNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    
    const todayStart = new Date(date.setHours(0, 0, 0, 0));
    const todayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const todayCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(supportSessions)
      .where(
        and(
          gte(supportSessions.createdAt, todayStart),
          lte(supportSessions.createdAt, todayEnd)
        )
      );
    
    const count = (todayCount[0]?.count || 0) + 1;
    return `SUP-${dateStr}-${count.toString().padStart(4, '0')}`;
  }

  async createSession(data: {
    userId?: string;
    userEmail?: string;
    userName?: string;
    subject: string;
    channel: string;
    category?: string;
    priority?: string;
    platformContext?: Record<string, unknown>;
  }): Promise<SupportSession> {
    const ticketNumber = await this.generateTicketNumber();
    
    const sla = await this.getSLAPolicy(data.priority || 'medium');
    const now = new Date();
    
    const [session] = await db.insert(supportSessions).values({
      ticketNumber,
      userId: data.userId,
      userEmail: data.userEmail,
      userName: data.userName,
      subject: data.subject,
      channel: data.channel as any,
      category: data.category || 'general',
      priority: data.priority || 'medium',
      status: 'open',
      aiHandled: data.channel === 'ai_chat',
      slaId: sla?.id,
      slaFirstResponseDue: sla ? new Date(now.getTime() + sla.firstResponseTime * 60000) : null,
      slaResolutionDue: sla ? new Date(now.getTime() + sla.resolutionTime * 60000) : null,
      platformContext: data.platformContext || {},
    }).returning();

    return session;
  }

  async getSession(sessionId: string): Promise<SupportSession | null> {
    return db.query.supportSessions.findFirst({
      where: eq(supportSessions.id, sessionId),
    }) || null;
  }

  async updateSession(
    sessionId: string,
    data: Partial<InsertSupportSession>
  ): Promise<SupportSession | null> {
    const [session] = await db
      .update(supportSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supportSessions.id, sessionId))
      .returning();
    return session || null;
  }

  async addMessage(data: {
    sessionId: string;
    senderType: 'user' | 'agent' | 'ai' | 'system';
    senderId?: string;
    senderName?: string;
    content: string;
    contentAr?: string;
    isAiGenerated?: boolean;
    aiConfidence?: number;
    aiModelUsed?: string;
    isInternal?: boolean;
    attachments?: Array<{ type: string; url: string; name: string }>;
  }): Promise<SupportMessage> {
    const [message] = await db.insert(supportMessages).values({
      sessionId: data.sessionId,
      senderType: data.senderType,
      senderId: data.senderId,
      senderName: data.senderName,
      content: data.content,
      contentAr: data.contentAr,
      isAiGenerated: data.isAiGenerated || false,
      aiConfidence: data.aiConfidence,
      aiModelUsed: data.aiModelUsed,
      isInternal: data.isInternal || false,
      attachments: data.attachments || [],
      contentType: 'text',
    }).returning();

    await db
      .update(supportSessions)
      .set({ updatedAt: new Date() })
      .where(eq(supportSessions.id, data.sessionId));

    return message;
  }

  async getMessages(sessionId: string, includeInternal: boolean = false): Promise<SupportMessage[]> {
    const conditions = [eq(supportMessages.sessionId, sessionId)];
    
    if (!includeInternal) {
      conditions.push(eq(supportMessages.isInternal, false));
    }

    return db.query.supportMessages.findMany({
      where: and(...conditions),
      orderBy: [asc(supportMessages.createdAt)],
    });
  }

  async assignAgent(sessionId: string, agentId: string): Promise<SupportSession | null> {
    const [session] = await db
      .update(supportSessions)
      .set({
        assignedAgentId: agentId,
        assignedAt: new Date(),
        status: 'in_progress',
        updatedAt: new Date(),
      })
      .where(eq(supportSessions.id, sessionId))
      .returning();

    if (session) {
      await db
        .update(supportAgents)
        .set({ 
          currentChatCount: sql`${supportAgents.currentChatCount} + 1`,
          status: 'busy',
        })
        .where(eq(supportAgents.userId, agentId));
    }

    return session || null;
  }

  async resolveSession(
    sessionId: string,
    resolvedBy: string,
    resolutionType: string,
    notes?: string
  ): Promise<SupportSession | null> {
    const now = new Date();
    const session = await this.getSession(sessionId);
    
    const [updated] = await db
      .update(supportSessions)
      .set({
        status: 'resolved',
        resolvedAt: now,
        resolvedBy,
        resolutionType,
        resolutionNotes: notes,
        closedAt: now,
        slaResolutionMet: session?.slaResolutionDue ? now <= session.slaResolutionDue : null,
        updatedAt: now,
      })
      .where(eq(supportSessions.id, sessionId))
      .returning();

    if (session?.assignedAgentId) {
      await db
        .update(supportAgents)
        .set({
          currentChatCount: sql`GREATEST(0, ${supportAgents.currentChatCount} - 1)`,
          totalSessionsHandled: sql`${supportAgents.totalSessionsHandled} + 1`,
        })
        .where(eq(supportAgents.userId, session.assignedAgentId));
    }

    return updated || null;
  }

  private async getSLAPolicy(priority: string): Promise<SupportSlaPolicy | null> {
    return db.query.supportSlaPolicies.findFirst({
      where: and(
        eq(supportSlaPolicies.isActive, true),
        or(
          eq(supportSlaPolicies.targetPriority, priority),
          isNull(supportSlaPolicies.targetPriority)
        )
      ),
      orderBy: [asc(supportSlaPolicies.priority)],
    }) || null;
  }

  async getOpenSessions(filters?: {
    status?: string;
    priority?: string;
    channel?: string;
    agentId?: string;
    limit?: number;
  }): Promise<SupportSession[]> {
    const conditions: any[] = [];
    
    if (filters?.status) {
      conditions.push(eq(supportSessions.status, filters.status));
    }
    if (filters?.priority) {
      conditions.push(eq(supportSessions.priority, filters.priority));
    }
    if (filters?.channel) {
      conditions.push(eq(supportSessions.channel, filters.channel));
    }
    if (filters?.agentId) {
      conditions.push(eq(supportSessions.assignedAgentId, filters.agentId));
    }

    return db.query.supportSessions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(supportSessions.createdAt)],
      limit: filters?.limit || 50,
    });
  }

  async getUserSessions(userId: string): Promise<SupportSession[]> {
    return db.query.supportSessions.findMany({
      where: eq(supportSessions.userId, userId),
      orderBy: [desc(supportSessions.createdAt)],
      limit: 20,
    });
  }
}

// ==================== SMART ROUTING ENGINE ====================

class SmartRoutingEngine {
  async getRoutingRecommendation(session: SupportSession): Promise<RoutingRecommendation> {
    const rules = await db.query.supportRoutingRules.findMany({
      where: eq(supportRoutingRules.isActive, true),
      orderBy: [asc(supportRoutingRules.priority)],
    });

    for (const rule of rules) {
      if (this.matchesRule(session, rule)) {
        if (rule.routeToAgentId) {
          const agent = await db.query.supportAgents.findFirst({
            where: eq(supportAgents.id, rule.routeToAgentId),
          });
          
          if (agent && agent.status === 'available' && agent.currentChatCount < agent.maxConcurrentChats) {
            return {
              agentId: agent.userId,
              agentName: agent.displayName,
              priority: rule.priorityOverride || session.priority,
              estimatedResponseTime: agent.averageResponseTime || 300,
              reason: `Matched rule: ${rule.name}`,
            };
          }
        }

        if (rule.routeToSkill) {
          const agent = await this.findAgentBySkill(rule.routeToSkill);
          if (agent) {
            return {
              agentId: agent.userId,
              agentName: agent.displayName,
              priority: rule.priorityOverride || session.priority,
              estimatedResponseTime: agent.averageResponseTime || 300,
              reason: `Matched skill: ${rule.routeToSkill}`,
            };
          }
        }
      }
    }

    const availableAgent = await this.findNextAvailableAgent();
    
    return {
      agentId: availableAgent?.userId,
      agentName: availableAgent?.displayName,
      priority: session.priority,
      estimatedResponseTime: availableAgent?.averageResponseTime || 600,
      reason: availableAgent ? 'Round-robin assignment' : 'No agents available',
    };
  }

  private matchesRule(session: SupportSession, rule: SupportRoutingRule): boolean {
    if (rule.matchCategory && rule.matchCategory !== session.category) return false;
    if (rule.matchPriority && rule.matchPriority !== session.priority) return false;
    if (rule.matchChannel && rule.matchChannel !== session.channel) return false;
    
    if (rule.matchKeywords && Array.isArray(rule.matchKeywords) && rule.matchKeywords.length > 0) {
      const subject = session.subject.toLowerCase();
      const hasKeyword = (rule.matchKeywords as string[]).some(k => 
        subject.includes(k.toLowerCase())
      );
      if (!hasKeyword) return false;
    }

    return true;
  }

  private async findAgentBySkill(skill: string): Promise<SupportAgent | null> {
    const agents = await db.query.supportAgents.findMany({
      where: and(
        eq(supportAgents.status, 'available'),
      ),
      orderBy: [
        desc(supportAgents.averageRating),
        asc(supportAgents.currentChatCount),
      ],
    });

    return agents.find(a => 
      Array.isArray(a.skills) && 
      (a.skills as string[]).includes(skill) &&
      a.currentChatCount < a.maxConcurrentChats
    ) || null;
  }

  private async findNextAvailableAgent(): Promise<SupportAgent | null> {
    return db.query.supportAgents.findFirst({
      where: and(
        eq(supportAgents.status, 'available'),
        sql`${supportAgents.currentChatCount} < ${supportAgents.maxConcurrentChats}`,
      ),
      orderBy: [
        asc(supportAgents.currentChatCount),
        desc(supportAgents.averageRating),
      ],
    }) || null;
  }
}

// ==================== KNOWLEDGE BASE MANAGER ====================

class KnowledgeBaseManager {
  async searchArticles(query: string, limit: number = 10): Promise<SupportKnowledgeBase[]> {
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    if (keywords.length === 0) {
      return db.query.supportKnowledgeBase.findMany({
        where: eq(supportKnowledgeBase.isPublished, true),
        limit,
        orderBy: [desc(supportKnowledgeBase.viewCount)],
      });
    }

    return db.query.supportKnowledgeBase.findMany({
      where: and(
        eq(supportKnowledgeBase.isPublished, true),
        or(
          ...keywords.flatMap(keyword => [
            like(supportKnowledgeBase.title, `%${keyword}%`),
            like(supportKnowledgeBase.content, `%${keyword}%`),
          ])
        )
      ),
      limit,
      orderBy: [desc(supportKnowledgeBase.aiRelevanceScore), desc(supportKnowledgeBase.viewCount)],
    });
  }

  async getArticle(slug: string): Promise<SupportKnowledgeBase | null> {
    const article = await db.query.supportKnowledgeBase.findFirst({
      where: eq(supportKnowledgeBase.slug, slug),
    });

    if (article) {
      await db
        .update(supportKnowledgeBase)
        .set({ viewCount: sql`${supportKnowledgeBase.viewCount} + 1` })
        .where(eq(supportKnowledgeBase.id, article.id));
    }

    return article || null;
  }

  async createArticle(data: {
    slug: string;
    title: string;
    titleAr?: string;
    content: string;
    contentAr?: string;
    category: string;
    subcategory?: string;
    tags?: string[];
    isPublished?: boolean;
    isInternal?: boolean;
    createdBy: string;
  }): Promise<SupportKnowledgeBase> {
    const [article] = await db.insert(supportKnowledgeBase).values({
      ...data,
      isPublished: data.isPublished ?? false,
      isInternal: data.isInternal ?? false,
    }).returning();
    return article;
  }

  async updateArticle(
    id: string,
    data: Partial<SupportKnowledgeBase>,
    updatedBy: string
  ): Promise<SupportKnowledgeBase | null> {
    const [article] = await db
      .update(supportKnowledgeBase)
      .set({ ...data, updatedBy, updatedAt: new Date() })
      .where(eq(supportKnowledgeBase.id, id))
      .returning();
    return article || null;
  }

  async markHelpful(id: string, helpful: boolean): Promise<void> {
    const field = helpful ? 'helpfulCount' : 'notHelpfulCount';
    await db
      .update(supportKnowledgeBase)
      .set({ [field]: sql`${supportKnowledgeBase[field]} + 1` })
      .where(eq(supportKnowledgeBase.id, id));
  }
}

// ==================== AGENT MANAGER ====================

class AgentManager {
  async getAgent(userId: string): Promise<SupportAgent | null> {
    return db.query.supportAgents.findFirst({
      where: eq(supportAgents.userId, userId),
    }) || null;
  }

  async getAvailableAgents(): Promise<SupportAgent[]> {
    return db.query.supportAgents.findMany({
      where: eq(supportAgents.status, 'available'),
      orderBy: [asc(supportAgents.currentChatCount)],
    });
  }

  async updateStatus(userId: string, status: string): Promise<SupportAgent | null> {
    const [agent] = await db
      .update(supportAgents)
      .set({ status, lastActiveAt: new Date(), updatedAt: new Date() })
      .where(eq(supportAgents.userId, userId))
      .returning();
    return agent || null;
  }

  async createAgent(data: {
    userId: string;
    displayName: string;
    displayNameAr?: string;
    skills?: string[];
    languages?: string[];
    supervisorId?: string;
  }): Promise<SupportAgent> {
    const [agent] = await db.insert(supportAgents).values({
      userId: data.userId,
      displayName: data.displayName,
      displayNameAr: data.displayNameAr,
      skills: data.skills || [],
      languages: data.languages || ['en', 'ar'],
      supervisorId: data.supervisorId,
      status: 'offline',
    }).returning();
    return agent;
  }

  async getAgentStats(userId: string): Promise<{
    totalSessions: number;
    averageRating: number;
    averageResponseTime: number;
    todaySessions: number;
  }> {
    const agent = await this.getAgent(userId);
    if (!agent) {
      return { totalSessions: 0, averageRating: 0, averageResponseTime: 0, todaySessions: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySessions = await db
      .select({ count: sql<number>`count(*)` })
      .from(supportSessions)
      .where(
        and(
          eq(supportSessions.assignedAgentId, userId),
          gte(supportSessions.createdAt, today)
        )
      );

    return {
      totalSessions: agent.totalSessionsHandled,
      averageRating: agent.averageRating || 0,
      averageResponseTime: agent.averageResponseTime || 0,
      todaySessions: todaySessions[0]?.count || 0,
    };
  }
}

// ==================== EXPORT SERVICES ====================

export const supportAI = new SupportAIAssistant();
export const supportSessions$ = new SupportSessionManager();
export const routingEngine = new SmartRoutingEngine();
export const knowledgeBase = new KnowledgeBaseManager();
export const agentManager = new AgentManager();

export {
  SupportAIAssistant,
  SupportSessionManager,
  SmartRoutingEngine,
  KnowledgeBaseManager,
  AgentManager,
};

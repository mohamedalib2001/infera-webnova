/**
 * ==================== NOVA AI MEMORY SERVICE ====================
 * نظام ذاكرة نوفا AI - السياق المستمر والتعلم التراكمي
 * 
 * Three integrated systems:
 * 1. Memory System - Long-term persistent memory
 * 2. Context System - Working memory for current session
 * 3. Platform State - Real-time platform monitoring
 */

import { Express, Request, Response } from "express";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import os from "os";
import { execSync } from "child_process";
import { db } from "./db";
import { 
  sessions,
  novaAiMemory,
  novaAiContext,
  novaPlatformState,
  insertNovaAiMemorySchema,
  insertNovaAiContextSchema,
  isRootOwner,
  type NovaAiMemory,
  type NovaAiContext,
  type NovaPlatformState,
  type InsertNovaAiMemory,
} from "@shared/schema";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

const anthropic = new Anthropic();

// ==================== EMBEDDING UTILITIES ====================

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'من', 'في', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
  ]);
  
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 50);
}

function generateEmbedding(text: string): number[] {
  if (!text || text.trim().length === 0) {
    return new Array(256).fill(0);
  }
  
  const keywords = extractKeywords(text);
  if (keywords.length === 0) {
    return new Array(256).fill(0);
  }
  
  const embedding = new Array(256).fill(0);
  
  keywords.forEach((word, idx) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash;
    }
    hash = Math.abs(hash);
    
    for (let i = 0; i < 8; i++) {
      const pos = (hash + i * 31) % 256;
      embedding[pos] += 1 / (idx + 1);
    }
  });
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }
  
  return embedding;
}

function isValidEmbedding(embedding: number[] | null | undefined): boolean {
  if (!embedding || !Array.isArray(embedding) || embedding.length !== 256) {
    return false;
  }
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0.001;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const mag = Math.sqrt(normA) * Math.sqrt(normB);
  return mag === 0 ? 0 : dot / mag;
}

// ==================== NOVA MEMORY OPERATIONS ====================

class NovaMemorySystem {
  
  async createMemory(data: InsertNovaAiMemory): Promise<NovaAiMemory> {
    const fullText = `${data.title} ${data.content}`;
    const embedding = generateEmbedding(fullText);
    const keywords = extractKeywords(fullText);
    
    const [memory] = await db
      .insert(novaAiMemory)
      .values({
        ...data,
        embedding,
        keywords,
      })
      .returning();
    
    return memory;
  }
  
  async searchMemories(query: string, limit: number = 10): Promise<Array<NovaAiMemory & { similarity: number }>> {
    const queryEmbedding = generateEmbedding(query);
    
    if (!isValidEmbedding(queryEmbedding)) {
      return [];
    }
    
    const memories = await db
      .select()
      .from(novaAiMemory)
      .orderBy(desc(novaAiMemory.createdAt))
      .limit(100);
    
    const scored = memories
      .filter(mem => isValidEmbedding(mem.embedding as number[]))
      .map(mem => ({
        ...mem,
        similarity: cosineSimilarity(queryEmbedding, mem.embedding as number[])
      }))
      .filter(mem => mem.similarity > 0.01)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    
    for (const mem of scored.slice(0, 5)) {
      await db
        .update(novaAiMemory)
        .set({ 
          accessCount: sql`${novaAiMemory.accessCount} + 1`,
          lastAccessedAt: new Date()
        })
        .where(eq(novaAiMemory.id, mem.id));
    }
    
    return scored;
  }
  
  async getRecentMemories(type?: string, limit: number = 20): Promise<NovaAiMemory[]> {
    const query = db.select().from(novaAiMemory);
    
    if (type) {
      return query
        .where(eq(novaAiMemory.memoryType, type))
        .orderBy(desc(novaAiMemory.createdAt))
        .limit(limit);
    }
    
    return query.orderBy(desc(novaAiMemory.createdAt)).limit(limit);
  }
  
  async getMemoryById(id: string): Promise<NovaAiMemory | null> {
    const [memory] = await db
      .select()
      .from(novaAiMemory)
      .where(eq(novaAiMemory.id, id));
    return memory || null;
  }
  
  async deleteMemory(id: string): Promise<boolean> {
    const result = await db
      .delete(novaAiMemory)
      .where(eq(novaAiMemory.id, id));
    return true;
  }
  
  async getMemoryStats(): Promise<{
    totalMemories: number;
    byType: Record<string, number>;
    byImportance: Record<string, number>;
    recentActivity: number;
  }> {
    const all = await db.select().from(novaAiMemory);
    
    const byType: Record<string, number> = {};
    const byImportance: Record<string, number> = {};
    
    for (const mem of all) {
      byType[mem.memoryType] = (byType[mem.memoryType] || 0) + 1;
      byImportance[mem.importance] = (byImportance[mem.importance] || 0) + 1;
    }
    
    const oneHourAgo = new Date(Date.now() - 3600000);
    const recent = all.filter(m => new Date(m.createdAt) > oneHourAgo);
    
    return {
      totalMemories: all.length,
      byType,
      byImportance,
      recentActivity: recent.length,
    };
  }
}

// ==================== NOVA CONTEXT SYSTEM ====================

class NovaContextSystem {
  
  async getOrCreateContext(sessionId: string, userId?: string): Promise<NovaAiContext> {
    const [existing] = await db
      .select()
      .from(novaAiContext)
      .where(eq(novaAiContext.sessionId, sessionId));
    
    if (existing) {
      return existing;
    }
    
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const [context] = await db
      .insert(novaAiContext)
      .values({
        sessionId,
        userId,
        expiresAt,
        conversationHistory: [],
        insights: [],
      })
      .returning();
    
    return context;
  }
  
  async updateContext(sessionId: string, updates: Partial<NovaAiContext>): Promise<NovaAiContext | null> {
    const [updated] = await db
      .update(novaAiContext)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(novaAiContext.sessionId, sessionId))
      .returning();
    
    return updated || null;
  }
  
  async addToConversation(sessionId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    const [ctx] = await db
      .select()
      .from(novaAiContext)
      .where(eq(novaAiContext.sessionId, sessionId));
    
    if (!ctx) return;
    
    const history = (ctx.conversationHistory || []) as Array<{role: string; content: string; timestamp: string}>;
    history.push({
      role,
      content,
      timestamp: new Date().toISOString(),
    });
    
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    await db
      .update(novaAiContext)
      .set({ conversationHistory: history, updatedAt: new Date() })
      .where(eq(novaAiContext.sessionId, sessionId));
  }
  
  async addInsight(sessionId: string, type: string, message: string, priority: string): Promise<void> {
    const [ctx] = await db
      .select()
      .from(novaAiContext)
      .where(eq(novaAiContext.sessionId, sessionId));
    
    if (!ctx) return;
    
    const insights = (ctx.insights || []) as Array<{type: string; message: string; priority: string; timestamp: string}>;
    insights.push({
      type,
      message,
      priority,
      timestamp: new Date().toISOString(),
    });
    
    if (insights.length > 20) {
      insights.splice(0, insights.length - 20);
    }
    
    await db
      .update(novaAiContext)
      .set({ insights, updatedAt: new Date() })
      .where(eq(novaAiContext.sessionId, sessionId));
  }
  
  async cleanExpiredContexts(): Promise<number> {
    const deleted = await db
      .delete(novaAiContext)
      .where(lte(novaAiContext.expiresAt, new Date()))
      .returning({ id: novaAiContext.id });
    return deleted.length;
  }
}

// ==================== NOVA PLATFORM MONITORING ====================

class NovaPlatformMonitor {
  private requestCount = 0;
  private errorCount = 0;
  private latencySum = 0;
  private requestsLastMinute: number[] = [];
  
  recordRequest(latencyMs: number, isError: boolean = false): void {
    const now = Date.now();
    this.requestsLastMinute = this.requestsLastMinute.filter(t => now - t < 60000);
    this.requestsLastMinute.push(now);
    this.requestCount++;
    this.latencySum += latencyMs;
    if (isError) this.errorCount++;
  }
  
  private getDiskUsage(): number {
    try {
      const output = execSync("df -P / | tail -1 | awk '{print $5}'", { encoding: 'utf8' });
      return parseInt(output.replace('%', '').trim()) || 0;
    } catch {
      return 0;
    }
  }
  
  async captureSnapshot(): Promise<NovaPlatformState> {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    
    let cpuUsage = 0;
    for (const cpu of cpus) {
      let total = 0;
      for (const type in cpu.times) {
        total += (cpu.times as any)[type];
      }
      cpuUsage += (100 - (cpu.times.idle / total * 100));
    }
    cpuUsage /= cpus.length;
    
    const now = Date.now();
    this.requestsLastMinute = this.requestsLastMinute.filter(t => now - t < 60000);
    
    let activeSessions = 0;
    try {
      const sessionCount = await db.select().from(sessions);
      activeSessions = sessionCount.filter(s => new Date((s as any).expire) > new Date()).length;
    } catch {}
    
    const systemMetrics = {
      cpuUsage: Math.round(cpuUsage * 10) / 10,
      memoryUsage: Math.round(((totalMem - freeMem) / totalMem) * 1000) / 10,
      diskUsage: this.getDiskUsage(),
      uptime: os.uptime(),
    };
    
    const applicationMetrics = {
      activeUsers: activeSessions,
      activeSessions: activeSessions,
      requestsPerMinute: this.requestsLastMinute.length,
      averageLatency: this.requestCount > 0 ? Math.round(this.latencySum / this.requestCount) : 0,
      errorRate: this.requestCount > 0 ? Math.round((this.errorCount / this.requestCount) * 1000) / 10 : 0,
    };
    
    const dbStart = Date.now();
    let dbResponseTime = 5;
    try {
      await db.select().from(sessions).limit(1);
      dbResponseTime = Date.now() - dbStart;
    } catch {}
    
    const processMemory = process.memoryUsage();
    const heapUsedPercent = (processMemory.heapUsed / processMemory.heapTotal) * 100;
    
    const serviceHealth = [
      { name: "Database", status: (dbResponseTime < 100 ? "healthy" : dbResponseTime < 500 ? "degraded" : "down") as "healthy" | "degraded" | "down", lastCheck: new Date().toISOString(), responseTime: dbResponseTime },
      { name: "AI Engine", status: "healthy" as const, lastCheck: new Date().toISOString(), responseTime: 150 },
      { name: "WebSocket", status: "healthy" as const, lastCheck: new Date().toISOString(), responseTime: 2 },
      { name: "Memory", status: (heapUsedPercent < 80 ? "healthy" : heapUsedPercent < 95 ? "degraded" : "down") as "healthy" | "degraded" | "down", lastCheck: new Date().toISOString(), responseTime: Math.round(heapUsedPercent) },
    ];
    
    const overallHealth = serviceHealth.every(s => s.status === "healthy") 
      ? "healthy" 
      : serviceHealth.some(s => s.status === "down") 
        ? "critical" 
        : "degraded";
    
    const [snapshot] = await db
      .insert(novaPlatformState)
      .values({
        snapshotTime: new Date(),
        systemMetrics,
        applicationMetrics,
        serviceHealth,
        recentEvents: [],
        aiInsights: [],
        overallHealth,
      })
      .returning();
    
    return snapshot;
  }
  
  async getLatestSnapshot(): Promise<NovaPlatformState | null> {
    const [latest] = await db
      .select()
      .from(novaPlatformState)
      .orderBy(desc(novaPlatformState.snapshotTime))
      .limit(1);
    return latest || null;
  }
  
  async getHistoricalSnapshots(hours: number = 24): Promise<NovaPlatformState[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return db
      .select()
      .from(novaPlatformState)
      .where(gte(novaPlatformState.snapshotTime, since))
      .orderBy(desc(novaPlatformState.snapshotTime));
  }
  
  async getRealTimeMetrics(): Promise<{
    system: typeof this extends never ? never : ReturnType<typeof os.cpus>;
    process: NodeJS.MemoryUsage;
    uptime: number;
  }> {
    return {
      system: os.cpus(),
      process: process.memoryUsage(),
      uptime: process.uptime(),
    };
  }
}

// ==================== SINGLETON INSTANCES ====================

export const novaMemory = new NovaMemorySystem();
export const novaContext = new NovaContextSystem();
export const novaPlatformMonitor = new NovaPlatformMonitor();

// ==================== AUTH MIDDLEWARE ====================

function requireNovaAuth(req: Request, res: Response, next: Function): void {
  const user = (req as any).user;
  
  if (!req.isAuthenticated || !req.isAuthenticated() || !user) {
    res.status(401).json({ success: false, error: "يجب تسجيل الدخول | Authentication required" });
    return;
  }
  
  next();
}

function requireOwnerAuth(req: Request, res: Response, next: Function): void {
  const user = (req as any).user;
  
  if (!req.isAuthenticated || !req.isAuthenticated() || !user) {
    res.status(401).json({ success: false, error: "يجب تسجيل الدخول | Authentication required" });
    return;
  }
  
  const allowedRoles = ['owner', 'sovereign', 'ROOT_OWNER'];
  const hasOwnerAccess = user.isOwner || 
    user.email === process.env.OWNER_EMAIL || 
    isRootOwner(user.role) ||
    allowedRoles.includes(user.role);
  
  if (!hasOwnerAccess) {
    res.status(403).json({ success: false, error: "صلاحيات المالك مطلوبة | Owner access required" });
    return;
  }
  
  next();
}

// ==================== API ROUTES ====================

export function registerNovaMemoryRoutes(app: Express): void {
  
  // ==================== MEMORY ENDPOINTS (Owner Only) ====================
  
  app.post("/api/nova/memory", requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const data = insertNovaAiMemorySchema.parse(req.body);
      const memory = await novaMemory.createMemory(data);
      res.json({ success: true, memory, message: "تم حفظ الذاكرة بنجاح" });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });
  
  app.get("/api/nova/memory/search", requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!query) {
        return res.status(400).json({ success: false, error: "Query required" });
      }
      
      const memories = await novaMemory.searchMemories(query, limit);
      res.json({ success: true, memories, count: memories.length });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.get("/api/nova/memory/recent", requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const type = req.query.type as string;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const memories = await novaMemory.getRecentMemories(type, limit);
      res.json({ success: true, memories, count: memories.length });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.get("/api/nova/memory/stats", requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const stats = await novaMemory.getMemoryStats();
      res.json({ success: true, stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.get("/api/nova/memory/:id", requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const memory = await novaMemory.getMemoryById(req.params.id);
      if (!memory) {
        return res.status(404).json({ success: false, error: "Memory not found" });
      }
      res.json({ success: true, memory });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.delete("/api/nova/memory/:id", requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      await novaMemory.deleteMemory(req.params.id);
      res.json({ success: true, message: "تم حذف الذاكرة" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // ==================== CONTEXT ENDPOINTS (Owner Only) ====================
  
  app.get("/api/nova/context/:sessionId", requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      const context = await novaContext.getOrCreateContext(req.params.sessionId, userId);
      res.json({ success: true, context });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.patch("/api/nova/context/:sessionId", requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const context = await novaContext.updateContext(req.params.sessionId, req.body);
      res.json({ success: true, context });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.post("/api/nova/context/:sessionId/message", requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const { role, content } = req.body;
      await novaContext.addToConversation(req.params.sessionId, role, content);
      res.json({ success: true, message: "تمت إضافة الرسالة" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.post("/api/nova/context/:sessionId/insight", requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const { type, message, priority } = req.body;
      await novaContext.addInsight(req.params.sessionId, type, message, priority);
      res.json({ success: true, message: "تمت إضافة الرؤية" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // ==================== PLATFORM STATE ENDPOINTS (Owner Only) ====================
  
  app.get("/api/nova/platform/snapshot", requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const snapshot = await novaPlatformMonitor.captureSnapshot();
      res.json({ success: true, snapshot });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.get("/api/nova/platform/latest", requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const snapshot = await novaPlatformMonitor.getLatestSnapshot();
      res.json({ success: true, snapshot });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.get("/api/nova/platform/history", requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const hours = parseInt(req.query.hours as string) || 24;
      const snapshots = await novaPlatformMonitor.getHistoricalSnapshots(hours);
      res.json({ success: true, snapshots, count: snapshots.length });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.get("/api/nova/platform/realtime", requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const metrics = await novaPlatformMonitor.getRealTimeMetrics();
      res.json({ success: true, metrics });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // ==================== DASHBOARD COMBINED ENDPOINT (Owner Only) ====================
  
  app.get("/api/nova/dashboard", requireOwnerAuth, async (req: Request, res: Response) => {
    try {
      const [memoryStats, latestSnapshot, recentMemories] = await Promise.all([
        novaMemory.getMemoryStats(),
        novaPlatformMonitor.getLatestSnapshot(),
        novaMemory.getRecentMemories(undefined, 10),
      ]);
      
      res.json({
        success: true,
        dashboard: {
          memory: memoryStats,
          platform: latestSnapshot,
          recentMemories,
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  console.log("[Nova Memory] Routes registered at /api/nova/memory/*, /api/nova/context/*, /api/nova/platform/*");
}

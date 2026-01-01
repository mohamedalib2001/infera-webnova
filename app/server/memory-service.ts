/**
 * ==================== INSTITUTIONAL MEMORY SERVICE ====================
 * نظام الذاكرة المؤسسية لـ INFERA WebNova
 * 
 * Provides persistent, semantic-searchable memory for:
 * - Architecture decisions (ADRs)
 * - Deployment records
 * - Incident reports
 * - Lessons learned
 * - Requirements and constraints
 */

import { Express, Request, Response } from "express";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";
import { eq, and, or, like, desc, sql } from "drizzle-orm";
import {
  institutionalMemory,
  insertInstitutionalMemorySchema,
  memoryNodeTypes,
  type InstitutionalMemory,
  type InsertInstitutionalMemory,
} from "@shared/schema";

// Initialize Anthropic for embeddings (using Claude for text processing)
const anthropic = new Anthropic();

// ==================== EMBEDDING SERVICE ====================

// Simple keyword-based embedding for now (can be upgraded to vector DB later)
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'this', 'that',
    'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our',
    'you', 'your', 'he', 'she', 'him', 'her', 'his', 'i', 'me', 'my',
    // Arabic stop words
    'من', 'في', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
    'التي', 'الذي', 'هو', 'هي', 'هم', 'نحن', 'أنت', 'أنا', 'كان', 'يكون',
  ]);
  
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ') // Keep alphanumeric and Arabic
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 50); // Max 50 keywords
}

// Generate simple numeric embedding for similarity search
function generateSimpleEmbedding(text: string): number[] {
  const keywords = extractKeywords(text);
  const embedding = new Array(256).fill(0);
  
  keywords.forEach((word, idx) => {
    const hash = simpleHash(word);
    for (let i = 0; i < 8; i++) {
      const pos = (hash + i * 31) % 256;
      embedding[pos] += 1 / (idx + 1); // Earlier words have more weight
    }
  });
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }
  
  return embedding;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Calculate cosine similarity between two embeddings
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

// ==================== AI-POWERED MEMORY ANALYSIS ====================

interface MemoryAnalysis {
  summary: string;
  summaryAr: string;
  suggestedRelations: string[];
  importance: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
}

async function analyzeMemoryWithAI(
  title: string,
  content: string,
  nodeType: string
): Promise<MemoryAnalysis> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Analyze this institutional memory entry and provide:
1. A one-sentence summary (English)
2. A one-sentence summary (Arabic)
3. Importance level (critical/high/medium/low)
4. 3-5 relevant tags for categorization

Type: ${nodeType}
Title: ${title}
Content: ${content}

Respond in JSON format:
{
  "summary": "...",
  "summaryAr": "...",
  "importance": "...",
  "tags": ["...", "..."]
}`
        }
      ]
    });
    
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const parsed = JSON.parse(responseText);
    
    return {
      summary: parsed.summary || title,
      summaryAr: parsed.summaryAr || '',
      suggestedRelations: [],
      importance: parsed.importance || 'medium',
      tags: parsed.tags || [],
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    return {
      summary: title,
      summaryAr: '',
      suggestedRelations: [],
      importance: 'medium',
      tags: [],
    };
  }
}

// ==================== TYPED INSERT/UPDATE HELPERS ====================

// These helpers ensure type safety when working with JSONB fields
// They accept domain-safe inputs and return properly typed values for Drizzle

type MemoryInsertInput = Omit<InsertInstitutionalMemory, 'embedding' | 'keywords'>;
type MemoryInsertData = typeof institutionalMemory.$inferInsert;

function prepareMemoryInsert(data: MemoryInsertInput): MemoryInsertData {
  // Generate embedding and keywords from content
  const fullText = `${data.title} ${data.content} ${data.context || ''}`;
  const embedding = generateSimpleEmbedding(fullText);
  const keywords = extractKeywords(fullText);
  
  // Return properly typed insert data
  return {
    ...data,
    embedding,
    keywords,
  } as MemoryInsertData;
}

type MemoryUpdateInput = Partial<Omit<InsertInstitutionalMemory, 'embedding' | 'keywords'>>;

function prepareMemoryUpdate(
  data: MemoryUpdateInput, 
  existing: InstitutionalMemory
): Partial<MemoryInsertData> {
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: new Date(),
  };
  
  // Regenerate embedding if content changed
  if (data.title || data.content || data.context) {
    const fullText = `${data.title || existing.title} ${data.content || existing.content} ${data.context || existing.context || ''}`;
    updateData.embedding = generateSimpleEmbedding(fullText);
    updateData.keywords = extractKeywords(fullText);
  }
  
  return updateData as Partial<MemoryInsertData>;
}

// ==================== MEMORY CRUD OPERATIONS ====================

// Create a new memory entry with auto-generated embedding and keywords
async function createMemory(data: InsertInstitutionalMemory): Promise<InstitutionalMemory> {
  // Use typed helper to prepare insert data
  const insertData = prepareMemoryInsert(data);
  
  const [memory] = await db
    .insert(institutionalMemory)
    .values(insertData)
    .returning();
  
  return memory;
}

// Get memory by ID
async function getMemoryById(id: string): Promise<InstitutionalMemory | null> {
  const [memory] = await db
    .select()
    .from(institutionalMemory)
    .where(eq(institutionalMemory.id, id))
    .limit(1);
  
  return memory || null;
}

// List memories with filters
interface ListMemoriesOptions {
  projectId?: string;
  organizationId?: string;
  nodeType?: string;
  status?: string;
  importance?: string;
  limit?: number;
  offset?: number;
}

async function listMemories(options: ListMemoriesOptions = {}): Promise<{
  memories: InstitutionalMemory[];
  total: number;
}> {
  const conditions = [];
  
  if (options.projectId) {
    conditions.push(eq(institutionalMemory.projectId, options.projectId));
  }
  if (options.organizationId) {
    conditions.push(eq(institutionalMemory.organizationId, options.organizationId));
  }
  if (options.nodeType) {
    conditions.push(eq(institutionalMemory.nodeType, options.nodeType));
  }
  if (options.status) {
    conditions.push(eq(institutionalMemory.status, options.status));
  }
  if (options.importance) {
    conditions.push(eq(institutionalMemory.importance, options.importance));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(institutionalMemory)
    .where(whereClause);
  
  const memories = await db
    .select()
    .from(institutionalMemory)
    .where(whereClause)
    .orderBy(desc(institutionalMemory.createdAt))
    .limit(options.limit || 50)
    .offset(options.offset || 0);
  
  return {
    memories,
    total: countResult?.count || 0,
  };
}

// Semantic search for memories
async function searchMemories(
  query: string,
  options: {
    projectId?: string;
    organizationId?: string;
    nodeTypes?: string[];
    limit?: number;
  } = {}
): Promise<Array<InstitutionalMemory & { similarity: number }>> {
  const queryEmbedding = generateSimpleEmbedding(query);
  
  // Get all matching memories - always filter by active status
  const statusCondition = eq(institutionalMemory.status, 'active');
  const additionalConditions = [];
  
  if (options.projectId) {
    additionalConditions.push(eq(institutionalMemory.projectId, options.projectId));
  }
  if (options.organizationId) {
    additionalConditions.push(eq(institutionalMemory.organizationId, options.organizationId));
  }
  if (options.nodeTypes && options.nodeTypes.length > 0) {
    additionalConditions.push(
      or(...options.nodeTypes.map(t => eq(institutionalMemory.nodeType, t)))
    );
  }
  
  // Build where clause - statusCondition is always included
  const whereClause = additionalConditions.length > 0
    ? and(statusCondition, ...additionalConditions)
    : statusCondition;
  
  const memories = await db
    .select()
    .from(institutionalMemory)
    .where(whereClause);
  
  // Calculate similarity and rank
  const ranked = memories
    .map(memory => ({
      ...memory,
      similarity: memory.embedding 
        ? cosineSimilarity(queryEmbedding, memory.embedding as number[])
        : 0,
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, options.limit || 10);
  
  return ranked;
}

// Update memory with auto-regenerated embedding if content changed
async function updateMemory(
  id: string,
  data: Partial<InsertInstitutionalMemory>
): Promise<InstitutionalMemory | null> {
  // Get existing memory to merge with updates
  const existing = await getMemoryById(id);
  if (!existing) {
    return null;
  }
  
  // Use typed helper to prepare update data
  const updateData = prepareMemoryUpdate(data, existing);
  
  const [updated] = await db
    .update(institutionalMemory)
    .set(updateData)
    .where(eq(institutionalMemory.id, id))
    .returning();
  
  return updated || null;
}

// Archive memory (soft delete)
async function archiveMemory(id: string): Promise<boolean> {
  const [result] = await db
    .update(institutionalMemory)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(eq(institutionalMemory.id, id))
    .returning();
  
  return !!result;
}

// Supersede memory with a new version
async function supersedeMemory(
  oldId: string,
  newData: InsertInstitutionalMemory
): Promise<InstitutionalMemory> {
  // Create the new memory
  const newMemory = await createMemory(newData);
  
  // Mark old memory as superseded
  await db
    .update(institutionalMemory)
    .set({
      status: 'superseded',
      supersededBy: newMemory.id,
      updatedAt: new Date(),
    })
    .where(eq(institutionalMemory.id, oldId));
  
  return newMemory;
}

// Link related memories
async function linkMemories(sourceId: string, targetId: string): Promise<boolean> {
  const source = await getMemoryById(sourceId);
  if (!source) return false;
  
  const relatedIds = (source.relatedMemoryIds || []) as string[];
  if (!relatedIds.includes(targetId)) {
    relatedIds.push(targetId);
    await db
      .update(institutionalMemory)
      .set({
        relatedMemoryIds: relatedIds,
        updatedAt: new Date(),
      })
      .where(eq(institutionalMemory.id, sourceId));
  }
  
  return true;
}

// Get related memories
async function getRelatedMemories(id: string): Promise<InstitutionalMemory[]> {
  const memory = await getMemoryById(id);
  if (!memory || !memory.relatedMemoryIds) return [];
  
  const relatedIds = memory.relatedMemoryIds as string[];
  if (relatedIds.length === 0) return [];
  
  const related = await db
    .select()
    .from(institutionalMemory)
    .where(
      or(...relatedIds.map(rid => eq(institutionalMemory.id, rid)))
    );
  
  return related;
}

// ==================== MEMORY STATISTICS ====================

interface MemoryStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byImportance: Record<string, number>;
  recentlyUpdated: number;
}

async function getMemoryStats(options: {
  projectId?: string;
  organizationId?: string;
} = {}): Promise<MemoryStats> {
  const conditions = [];
  if (options.projectId) {
    conditions.push(eq(institutionalMemory.projectId, options.projectId));
  }
  if (options.organizationId) {
    conditions.push(eq(institutionalMemory.organizationId, options.organizationId));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const memories = await db
    .select()
    .from(institutionalMemory)
    .where(whereClause);
  
  const stats: MemoryStats = {
    total: memories.length,
    byType: {},
    byStatus: {},
    byImportance: {},
    recentlyUpdated: 0,
  };
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  memories.forEach(memory => {
    stats.byType[memory.nodeType] = (stats.byType[memory.nodeType] || 0) + 1;
    stats.byStatus[memory.status || 'active'] = (stats.byStatus[memory.status || 'active'] || 0) + 1;
    stats.byImportance[memory.importance || 'medium'] = (stats.byImportance[memory.importance || 'medium'] || 0) + 1;
    
    if (memory.updatedAt && memory.updatedAt > weekAgo) {
      stats.recentlyUpdated++;
    }
  });
  
  return stats;
}

// ==================== API SCHEMA VALIDATION ====================

const createMemorySchema = insertInstitutionalMemorySchema.extend({
  nodeType: z.enum(memoryNodeTypes),
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(100000),
});

const updateMemorySchema = createMemorySchema.partial();

const searchMemorySchema = z.object({
  query: z.string().min(1).max(1000),
  projectId: z.string().optional(),
  organizationId: z.string().optional(),
  nodeTypes: z.array(z.enum(memoryNodeTypes)).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// ==================== AUTH MIDDLEWARE ====================

const requireAuth = (req: Request, res: Response, next: Function) => {
  const session = (req as any).session;
  if (!session?.userId && !session?.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      errorAr: "المصادقة مطلوبة",
    });
  }
  next();
};

// ==================== REGISTER API ROUTES ====================

export function registerMemoryRoutes(app: Express): void {
  
  // Create memory entry
  app.post("/api/memory", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = createMemorySchema.parse(req.body);
      const session = (req as any).session;
      
      const memory = await createMemory({
        ...data,
        createdBy: session.userId || session.user?.id,
      });
      
      res.status(201).json({
        success: true,
        memory,
        message: "Memory created successfully",
        messageAr: "تم إنشاء الذاكرة بنجاح",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors.map(e => e.message).join(", "),
        });
      }
      console.error("Create memory error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create memory",
        errorAr: "فشل إنشاء الذاكرة",
      });
    }
  });
  
  // Get memory by ID
  app.get("/api/memory/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const memory = await getMemoryById(req.params.id);
      
      if (!memory) {
        return res.status(404).json({
          success: false,
          error: "Memory not found",
          errorAr: "الذاكرة غير موجودة",
        });
      }
      
      // Get related memories
      const related = await getRelatedMemories(req.params.id);
      
      res.json({
        success: true,
        memory,
        related,
      });
    } catch (error) {
      console.error("Get memory error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get memory",
        errorAr: "فشل جلب الذاكرة",
      });
    }
  });
  
  // List memories
  app.get("/api/memory", requireAuth, async (req: Request, res: Response) => {
    try {
      const options: ListMemoriesOptions = {
        projectId: req.query.projectId as string,
        organizationId: req.query.organizationId as string,
        nodeType: req.query.nodeType as string,
        status: req.query.status as string,
        importance: req.query.importance as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };
      
      const result = await listMemories(options);
      
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("List memories error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to list memories",
        errorAr: "فشل عرض الذكريات",
      });
    }
  });
  
  // Semantic search
  app.post("/api/memory/search", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = searchMemorySchema.parse(req.body);
      
      const results = await searchMemories(data.query, {
        projectId: data.projectId,
        organizationId: data.organizationId,
        nodeTypes: data.nodeTypes,
        limit: data.limit,
      });
      
      res.json({
        success: true,
        results,
        query: data.query,
        total: results.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors.map(e => e.message).join(", "),
        });
      }
      console.error("Search memory error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to search memories",
        errorAr: "فشل البحث في الذكريات",
      });
    }
  });
  
  // Update memory
  app.patch("/api/memory/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = updateMemorySchema.parse(req.body);
      
      const memory = await updateMemory(req.params.id, data);
      
      if (!memory) {
        return res.status(404).json({
          success: false,
          error: "Memory not found",
          errorAr: "الذاكرة غير موجودة",
        });
      }
      
      res.json({
        success: true,
        memory,
        message: "Memory updated successfully",
        messageAr: "تم تحديث الذاكرة بنجاح",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors.map(e => e.message).join(", "),
        });
      }
      console.error("Update memory error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update memory",
        errorAr: "فشل تحديث الذاكرة",
      });
    }
  });
  
  // Archive memory
  app.delete("/api/memory/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const success = await archiveMemory(req.params.id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: "Memory not found",
          errorAr: "الذاكرة غير موجودة",
        });
      }
      
      res.json({
        success: true,
        message: "Memory archived successfully",
        messageAr: "تم أرشفة الذاكرة بنجاح",
      });
    } catch (error) {
      console.error("Archive memory error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to archive memory",
        errorAr: "فشل أرشفة الذاكرة",
      });
    }
  });
  
  // Supersede memory
  app.post("/api/memory/:id/supersede", requireAuth, async (req: Request, res: Response) => {
    try {
      const data = createMemorySchema.parse(req.body);
      const session = (req as any).session;
      
      const newMemory = await supersedeMemory(req.params.id, {
        ...data,
        createdBy: session.userId || session.user?.id,
      });
      
      res.status(201).json({
        success: true,
        memory: newMemory,
        supersededId: req.params.id,
        message: "Memory superseded successfully",
        messageAr: "تم استبدال الذاكرة بنجاح",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors.map(e => e.message).join(", "),
        });
      }
      console.error("Supersede memory error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to supersede memory",
        errorAr: "فشل استبدال الذاكرة",
      });
    }
  });
  
  // Link memories
  app.post("/api/memory/:id/link", requireAuth, async (req: Request, res: Response) => {
    try {
      const { targetId } = req.body;
      
      if (!targetId) {
        return res.status(400).json({
          success: false,
          error: "targetId is required",
        });
      }
      
      const success = await linkMemories(req.params.id, targetId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: "Source memory not found",
          errorAr: "الذاكرة المصدر غير موجودة",
        });
      }
      
      res.json({
        success: true,
        message: "Memories linked successfully",
        messageAr: "تم ربط الذكريات بنجاح",
      });
    } catch (error) {
      console.error("Link memories error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to link memories",
        errorAr: "فشل ربط الذكريات",
      });
    }
  });
  
  // Get memory statistics
  app.get("/api/memory/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const stats = await getMemoryStats({
        projectId: req.query.projectId as string,
        organizationId: req.query.organizationId as string,
      });
      
      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error("Get memory stats error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get memory stats",
        errorAr: "فشل جلب إحصائيات الذاكرة",
      });
    }
  });
  
  // AI-powered analysis endpoint
  app.post("/api/memory/analyze", requireAuth, async (req: Request, res: Response) => {
    try {
      const { title, content, nodeType } = req.body;
      
      if (!title || !content || !nodeType) {
        return res.status(400).json({
          success: false,
          error: "title, content, and nodeType are required",
        });
      }
      
      const analysis = await analyzeMemoryWithAI(title, content, nodeType);
      
      res.json({
        success: true,
        analysis,
      });
    } catch (error) {
      console.error("Analyze memory error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to analyze memory",
        errorAr: "فشل تحليل الذاكرة",
      });
    }
  });
  
  console.log("Memory service routes registered");
}

// Export for testing
export {
  createMemory,
  getMemoryById,
  listMemories,
  searchMemories,
  updateMemory,
  archiveMemory,
  supersedeMemory,
  linkMemories,
  getRelatedMemories,
  getMemoryStats,
  extractKeywords,
  generateSimpleEmbedding,
  cosineSimilarity,
};

import type { Express, Request, Response } from "express";
import { db, pool } from "./db";
import { databasePlaygroundInstances, users } from "@shared/schema";
import { eq, and, lte, or } from "drizzle-orm";
import { randomBytes } from "crypto";

// ==================== Quota Configuration by Role ====================
const QUOTA_CONFIG: Record<string, { maxInstances: number; maxDurationHours: number; maxSizeMB: number }> = {
  free: { maxInstances: 1, maxDurationHours: 1, maxSizeMB: 50 },
  starter: { maxInstances: 3, maxDurationHours: 4, maxSizeMB: 200 },
  pro: { maxInstances: 5, maxDurationHours: 24, maxSizeMB: 1024 },
  sovereign: { maxInstances: 10, maxDurationHours: 168, maxSizeMB: 5120 },
  owner: { maxInstances: 999, maxDurationHours: 8760, maxSizeMB: 51200 },
};

// ==================== Helper Functions ====================
async function getUserQuota(userId: string): Promise<{ maxInstances: number; maxDurationHours: number; maxSizeMB: number }> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const role = user?.role || "free";
  return QUOTA_CONFIG[role] || QUOTA_CONFIG.free;
}

async function getUserActiveInstanceCount(userId: string): Promise<number> {
  const instances = await db.select()
    .from(databasePlaygroundInstances)
    .where(and(
      eq(databasePlaygroundInstances.userId, userId),
      or(
        eq(databasePlaygroundInstances.status, "creating"),
        eq(databasePlaygroundInstances.status, "running")
      )
    ));
  return instances.length;
}

async function createPlaygroundSchema(name: string): Promise<string> {
  const schemaName = `playground_${name}_${randomBytes(4).toString("hex")}`;
  
  try {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    return schemaName;
  } catch (error) {
    console.error("[Database Playground] Schema creation error:", error);
    throw error;
  }
}

async function dropPlaygroundSchema(schemaName: string): Promise<void> {
  try {
    await pool.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  } catch (error) {
    console.error("[Database Playground] Schema drop error:", error);
  }
}

// ==================== Background Cleanup ====================
async function cleanupExpiredInstances() {
  try {
    const now = new Date();
    
    // Find expired instances
    const expiredInstances = await db.select()
      .from(databasePlaygroundInstances)
      .where(and(
        lte(databasePlaygroundInstances.expiresAt, now),
        or(
          eq(databasePlaygroundInstances.status, "creating"),
          eq(databasePlaygroundInstances.status, "running")
        )
      ));
    
    for (const instance of expiredInstances) {
      // Drop the schema if it exists
      if (instance.schema) {
        await dropPlaygroundSchema(instance.schema);
      }
      
      // Mark as expired
      await db.update(databasePlaygroundInstances)
        .set({
          status: "expired",
          terminatedAt: new Date(),
          terminationReason: "Exceeded duration limit",
          updatedAt: new Date(),
        })
        .where(eq(databasePlaygroundInstances.id, instance.id));
    }
    
    if (expiredInstances.length > 0) {
      console.log(`[Database Playground] Cleaned up ${expiredInstances.length} expired instances`);
    }
  } catch (error) {
    console.error("[Database Playground] Cleanup error:", error);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredInstances, 5 * 60 * 1000);

// ==================== API Routes ====================
export function registerDatabasePlaygroundRoutes(app: Express) {
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

  // ==================== List Available Database Types ====================
  app.get("/api/database-playground/types", async (_req: Request, res: Response) => {
    res.json({
      success: true,
      types: [
        { id: "postgresql", name: "PostgreSQL", nameAr: "بوستجريس", available: true, description: "Relational database" },
        { id: "redis", name: "Redis", nameAr: "ريديس", available: false, description: "In-memory key-value store" },
        { id: "mongodb", name: "MongoDB", nameAr: "مونجو دي بي", available: false, description: "Document database" },
      ],
    });
  });

  // ==================== Get User Quota ====================
  app.get("/api/database-playground/quota", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const quota = await getUserQuota(userId);
      const activeCount = await getUserActiveInstanceCount(userId);
      
      res.json({
        success: true,
        quota: {
          ...quota,
          used: activeCount,
          remaining: Math.max(0, quota.maxInstances - activeCount),
        },
      });
    } catch (error: any) {
      console.error("[Database Playground] Quota error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        errorAr: "فشل جلب الحصة",
      });
    }
  });

  // ==================== List User's Database Instances ====================
  app.get("/api/database-playground/instances", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      
      const instances = await db.select()
        .from(databasePlaygroundInstances)
        .where(eq(databasePlaygroundInstances.userId, userId));
      
      // Hide sensitive connection info for non-running instances
      const safeInstances = instances.map(inst => ({
        ...inst,
        connectionInfo: inst.status === "running" ? inst.connectionInfo : null,
      }));
      
      res.json({
        success: true,
        instances: safeInstances,
      });
    } catch (error: any) {
      console.error("[Database Playground] List error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        errorAr: "فشل جلب قائمة قواعد البيانات",
      });
    }
  });

  // ==================== Create New Database Instance ====================
  app.post("/api/database-playground/instances", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { dbType, name, projectId } = req.body;
      
      // Validate database type
      if (!["postgresql"].includes(dbType)) {
        return res.status(400).json({
          success: false,
          error: "Only PostgreSQL is currently supported",
          errorAr: "فقط PostgreSQL مدعوم حالياً",
        });
      }
      
      // Check quota
      const quota = await getUserQuota(userId);
      const activeCount = await getUserActiveInstanceCount(userId);
      
      if (activeCount >= quota.maxInstances) {
        return res.status(429).json({
          success: false,
          error: `You have reached your limit of ${quota.maxInstances} instances`,
          errorAr: `لقد وصلت إلى الحد الأقصى من ${quota.maxInstances} قاعدة بيانات`,
        });
      }
      
      const instanceName = name || `db_${Date.now()}`;
      const expiresAt = new Date(Date.now() + quota.maxDurationHours * 60 * 60 * 1000);
      
      // Create schema for PostgreSQL
      let schemaName: string | undefined;
      if (dbType === "postgresql") {
        schemaName = await createPlaygroundSchema(instanceName);
      }
      
      // Create instance record
      const [instance] = await db.insert(databasePlaygroundInstances).values({
        userId,
        projectId,
        dbType,
        name: instanceName,
        schema: schemaName,
        status: "running",
        expiresAt,
        connectionInfo: {
          host: process.env.PGHOST || "localhost",
          port: parseInt(process.env.PGPORT || "5432"),
          database: process.env.PGDATABASE || "postgres",
          username: process.env.PGUSER || "postgres",
          connectionString: process.env.DATABASE_URL,
        },
      }).returning();
      
      res.json({
        success: true,
        instance: {
          ...instance,
          message: `Database created. Use schema: ${schemaName}`,
          messageAr: `تم إنشاء قاعدة البيانات. استخدم المخطط: ${schemaName}`,
        },
      });
    } catch (error: any) {
      console.error("[Database Playground] Create error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        errorAr: "فشل إنشاء قاعدة البيانات",
      });
    }
  });

  // ==================== Execute Query on Instance ====================
  app.post("/api/database-playground/instances/:instanceId/query", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { instanceId } = req.params;
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          error: "Query is required",
          errorAr: "الاستعلام مطلوب",
        });
      }
      
      // Get instance
      const [instance] = await db.select()
        .from(databasePlaygroundInstances)
        .where(and(
          eq(databasePlaygroundInstances.id, instanceId),
          eq(databasePlaygroundInstances.userId, userId)
        ));
      
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: "Database instance not found",
          errorAr: "قاعدة البيانات غير موجودة",
        });
      }
      
      if (instance.status !== "running") {
        return res.status(400).json({
          success: false,
          error: "Database instance is not running",
          errorAr: "قاعدة البيانات ليست قيد التشغيل",
        });
      }
      
      // Set search path to the playground schema
      const schemaQuery = instance.schema ? `SET search_path TO "${instance.schema}"; ${query}` : query;
      
      const startTime = Date.now();
      const result = await pool.query(schemaQuery);
      const duration = Date.now() - startTime;
      
      res.json({
        success: true,
        result: {
          rows: result.rows,
          rowCount: result.rowCount,
          fields: result.fields?.map(f => ({ name: f.name, dataType: f.dataTypeID })),
          duration,
        },
      });
    } catch (error: any) {
      console.error("[Database Playground] Query error:", error);
      res.status(400).json({
        success: false,
        error: error.message,
        errorAr: "فشل تنفيذ الاستعلام",
      });
    }
  });

  // ==================== Delete Database Instance ====================
  app.delete("/api/database-playground/instances/:instanceId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { instanceId } = req.params;
      
      // Get instance
      const [instance] = await db.select()
        .from(databasePlaygroundInstances)
        .where(and(
          eq(databasePlaygroundInstances.id, instanceId),
          eq(databasePlaygroundInstances.userId, userId)
        ));
      
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: "Database instance not found",
          errorAr: "قاعدة البيانات غير موجودة",
        });
      }
      
      // Drop the schema
      if (instance.schema) {
        await dropPlaygroundSchema(instance.schema);
      }
      
      // Update status
      await db.update(databasePlaygroundInstances)
        .set({
          status: "terminated",
          terminatedAt: new Date(),
          terminationReason: "User requested deletion",
          updatedAt: new Date(),
        })
        .where(eq(databasePlaygroundInstances.id, instanceId));
      
      res.json({
        success: true,
        message: "Database instance deleted",
        messageAr: "تم حذف قاعدة البيانات",
      });
    } catch (error: any) {
      console.error("[Database Playground] Delete error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        errorAr: "فشل حذف قاعدة البيانات",
      });
    }
  });

  console.log("[Database Playground] Routes registered at /api/database-playground/*");
}

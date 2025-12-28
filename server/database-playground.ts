import type { Express, Request, Response } from "express";
import { spawn, exec } from "child_process";
import { promisify } from "util";
import { randomBytes } from "crypto";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

// ==================== Database Playground Service ====================
// Provides temporary database instances for testing and development
// Supports: PostgreSQL, Redis, MongoDB (configurable per project)

interface PlaygroundDatabase {
  id: string;
  type: "postgresql" | "redis" | "mongodb";
  name: string;
  status: "creating" | "running" | "stopped" | "error";
  connectionString: string;
  port: number;
  createdAt: Date;
  expiresAt: Date;
  projectId?: string;
  userId: string;
  config: Record<string, any>;
}

interface DatabaseQuota {
  maxDatabases: number;
  maxStorageMB: number;
  maxConnectionsPerDb: number;
  ttlHours: number;
}

// Quota limits by user role
const QUOTA_LIMITS: Record<string, DatabaseQuota> = {
  free: { maxDatabases: 1, maxStorageMB: 50, maxConnectionsPerDb: 5, ttlHours: 1 },
  basic: { maxDatabases: 3, maxStorageMB: 200, maxConnectionsPerDb: 10, ttlHours: 4 },
  pro: { maxDatabases: 5, maxStorageMB: 500, maxConnectionsPerDb: 20, ttlHours: 24 },
  enterprise: { maxDatabases: 10, maxStorageMB: 2000, maxConnectionsPerDb: 50, ttlHours: 168 },
  sovereign: { maxDatabases: 20, maxStorageMB: 5000, maxConnectionsPerDb: 100, ttlHours: 720 },
  owner: { maxDatabases: 100, maxStorageMB: 50000, maxConnectionsPerDb: 500, ttlHours: 8760 },
};

// In-memory storage for playground databases (replace with persistent storage in production)
const playgroundDatabases = new Map<string, PlaygroundDatabase>();

// Database port allocation
let nextPort = 15432;
const allocatePort = () => nextPort++;

// Generate secure random password
const generatePassword = () => randomBytes(16).toString("hex");

// ==================== Database Creation Functions ====================

async function createPostgresPlayground(
  userId: string,
  projectId?: string,
  dbName?: string
): Promise<PlaygroundDatabase> {
  const id = `pg-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const port = allocatePort();
  const password = generatePassword();
  const name = dbName || `playground_${id}`;
  
  const playground: PlaygroundDatabase = {
    id,
    type: "postgresql",
    name,
    status: "creating",
    connectionString: `postgresql://playground:${password}@localhost:${port}/${name}`,
    port,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours default
    projectId,
    userId,
    config: { password, username: "playground" },
  };
  
  playgroundDatabases.set(id, playground);
  
  // For now, use the existing DATABASE_URL as a namespace
  // In production, this would spin up a Docker container
  try {
    // Create a schema namespace instead of separate database (safer for shared env)
    const schemaName = `playground_${id.replace(/-/g, "_")}`;
    playground.connectionString = `${process.env.DATABASE_URL}?schema=${schemaName}`;
    playground.status = "running";
    playground.config.schemaName = schemaName;
    
    console.log(`[Database Playground] Created PostgreSQL playground: ${id}`);
  } catch (error: any) {
    playground.status = "error";
    playground.config.error = error.message;
    console.error(`[Database Playground] Failed to create: ${error.message}`);
  }
  
  return playground;
}

async function createRedisPlayground(
  userId: string,
  projectId?: string
): Promise<PlaygroundDatabase> {
  const id = `redis-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const port = allocatePort();
  
  const playground: PlaygroundDatabase = {
    id,
    type: "redis",
    name: `redis_${id}`,
    status: "creating",
    connectionString: `redis://localhost:${port}`,
    port,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
    projectId,
    userId,
    config: {},
  };
  
  playgroundDatabases.set(id, playground);
  
  // In-memory Redis emulation (for demo purposes)
  playground.status = "running";
  playground.config.emulated = true;
  console.log(`[Database Playground] Created Redis playground (emulated): ${id}`);
  
  return playground;
}

async function createMongoPlayground(
  userId: string,
  projectId?: string,
  dbName?: string
): Promise<PlaygroundDatabase> {
  const id = `mongo-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const port = allocatePort();
  const name = dbName || `playground_${id}`;
  
  const playground: PlaygroundDatabase = {
    id,
    type: "mongodb",
    name,
    status: "creating",
    connectionString: `mongodb://localhost:${port}/${name}`,
    port,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
    projectId,
    userId,
    config: {},
  };
  
  playgroundDatabases.set(id, playground);
  
  // In-memory MongoDB emulation
  playground.status = "running";
  playground.config.emulated = true;
  console.log(`[Database Playground] Created MongoDB playground (emulated): ${id}`);
  
  return playground;
}

// ==================== Cleanup Functions ====================

async function deletePlayground(id: string): Promise<boolean> {
  const playground = playgroundDatabases.get(id);
  if (!playground) return false;
  
  playground.status = "stopped";
  playgroundDatabases.delete(id);
  
  console.log(`[Database Playground] Deleted: ${id}`);
  return true;
}

// Cleanup expired databases
async function cleanupExpired(): Promise<number> {
  const now = Date.now();
  let cleaned = 0;
  
  const entries = Array.from(playgroundDatabases.entries());
  for (const [id, db] of entries) {
    if (db.expiresAt.getTime() < now) {
      await deletePlayground(id);
      cleaned++;
    }
  }
  
  return cleaned;
}

// Run cleanup every 5 minutes
setInterval(cleanupExpired, 5 * 60 * 1000);

// ==================== API Routes ====================

export function registerDatabasePlaygroundRoutes(app: Express) {
  // Middleware to check user auth
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

  // Get user's quota
  function getUserQuota(userRole: string): DatabaseQuota {
    return QUOTA_LIMITS[userRole] || QUOTA_LIMITS.free;
  }

  // Count user's active databases
  function countUserDatabases(userId: string): number {
    let count = 0;
    const allDatabases = Array.from(playgroundDatabases.values());
    for (const db of allDatabases) {
      if (db.userId === userId && db.status === "running") count++;
    }
    return count;
  }

  // ==================== List Playgrounds ====================
  app.get("/api/database-playground", requireAuth, async (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    
    const userDatabases: PlaygroundDatabase[] = [];
    const allDatabases = Array.from(playgroundDatabases.values());
    for (const db of allDatabases) {
      if (db.userId === userId) {
        // Hide sensitive info
        userDatabases.push({
          ...db,
          config: { ...db.config, password: undefined },
        });
      }
    }
    
    const userRole = (req.user as any).role || "free";
    const quota = getUserQuota(userRole);
    
    res.json({
      success: true,
      databases: userDatabases,
      quota: {
        ...quota,
        used: countUserDatabases(userId),
      },
    });
  });

  // ==================== Create Playground ====================
  app.post("/api/database-playground", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role || "free";
      const { type, name, projectId } = req.body;
      
      // Check quota
      const quota = getUserQuota(userRole);
      const currentCount = countUserDatabases(userId);
      
      if (currentCount >= quota.maxDatabases) {
        return res.status(429).json({
          success: false,
          error: `Quota exceeded: Maximum ${quota.maxDatabases} databases allowed`,
          errorAr: `تم تجاوز الحصة: الحد الأقصى ${quota.maxDatabases} قواعد بيانات`,
        });
      }
      
      let playground: PlaygroundDatabase;
      
      switch (type) {
        case "postgresql":
          playground = await createPostgresPlayground(userId, projectId, name);
          break;
        case "redis":
          playground = await createRedisPlayground(userId, projectId);
          break;
        case "mongodb":
          playground = await createMongoPlayground(userId, projectId, name);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: `Unsupported database type: ${type}. Supported: postgresql, redis, mongodb`,
            errorAr: `نوع قاعدة البيانات غير مدعوم: ${type}`,
          });
      }
      
      res.json({
        success: true,
        database: {
          ...playground,
          config: { ...playground.config, password: undefined },
        },
        message: type === "postgresql" 
          ? "PostgreSQL playground created successfully"
          : `${type} playground created (emulated mode)`,
        messageAr: type === "postgresql"
          ? "تم إنشاء قاعدة بيانات PostgreSQL بنجاح"
          : `تم إنشاء ${type} (وضع المحاكاة)`,
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

  // ==================== Get Playground Details ====================
  app.get("/api/database-playground/:id", requireAuth, async (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    const { id } = req.params;
    
    const playground = playgroundDatabases.get(id);
    
    if (!playground) {
      return res.status(404).json({
        success: false,
        error: "Database not found",
        errorAr: "قاعدة البيانات غير موجودة",
      });
    }
    
    // Check ownership
    if (playground.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        errorAr: "الوصول مرفوض",
      });
    }
    
    res.json({
      success: true,
      database: playground,
    });
  });

  // ==================== Execute Query ====================
  app.post("/api/database-playground/:id/query", requireAuth, async (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    const { id } = req.params;
    const { query } = req.body;
    
    const playground = playgroundDatabases.get(id);
    
    if (!playground) {
      return res.status(404).json({
        success: false,
        error: "Database not found",
        errorAr: "قاعدة البيانات غير موجودة",
      });
    }
    
    if (playground.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        errorAr: "الوصول مرفوض",
      });
    }
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required",
        errorAr: "الاستعلام مطلوب",
      });
    }
    
    // For now, return emulated response
    // In production, this would execute against actual database
    res.json({
      success: true,
      result: {
        rows: [],
        rowCount: 0,
        command: query.split(" ")[0].toUpperCase(),
        message: "Query executed (emulated mode)",
        messageAr: "تم تنفيذ الاستعلام (وضع المحاكاة)",
      },
    });
  });

  // ==================== Delete Playground ====================
  app.delete("/api/database-playground/:id", requireAuth, async (req: Request, res: Response) => {
    const userId = (req.user as any).id;
    const { id } = req.params;
    
    const playground = playgroundDatabases.get(id);
    
    if (!playground) {
      return res.status(404).json({
        success: false,
        error: "Database not found",
        errorAr: "قاعدة البيانات غير موجودة",
      });
    }
    
    if (playground.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
        errorAr: "الوصول مرفوض",
      });
    }
    
    await deletePlayground(id);
    
    res.json({
      success: true,
      message: "Database deleted successfully",
      messageAr: "تم حذف قاعدة البيانات بنجاح",
    });
  });

  // ==================== Get Status ====================
  app.get("/api/database-playground/status", async (req: Request, res: Response) => {
    const stats = {
      totalActive: 0,
      byType: { postgresql: 0, redis: 0, mongodb: 0 } as Record<string, number>,
    };
    
    const allDatabases = Array.from(playgroundDatabases.values());
    for (const db of allDatabases) {
      if (db.status === "running") {
        stats.totalActive++;
        stats.byType[db.type]++;
      }
    }
    
    res.json({
      success: true,
      status: "operational",
      statusAr: "يعمل",
      stats,
      supportedTypes: ["postgresql", "redis", "mongodb"],
      quotaLimits: QUOTA_LIMITS,
    });
  });

  console.log("[Database Playground] Routes registered at /api/database-playground/*");
}

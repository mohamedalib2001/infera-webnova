import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

/**
 * PostgreSQL Connection Pool Configuration
 * Optimized for 5 million users capacity
 * تكوين مجموعة اتصالات PostgreSQL - محسن لـ 5 مليون مستخدم
 */
const poolConfig: pg.PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  
  // Connection pool sizing for high concurrency
  min: parseInt(process.env.DB_POOL_MIN || '5'),       // Minimum connections
  max: parseInt(process.env.DB_POOL_MAX || '50'),      // Maximum connections
  
  // Connection timeouts
  connectionTimeoutMillis: 10000,    // 10 seconds to acquire connection
  idleTimeoutMillis: 30000,          // 30 seconds idle before release
  
  // Statement preparation for better performance
  statement_timeout: 30000,          // 30 seconds max query time
  query_timeout: 30000,
  
  // Connection health check
  allowExitOnIdle: false,            // Keep pool alive
};

export const pool = new Pool(poolConfig);

// Log pool events for monitoring
pool.on('connect', () => {
  console.log('[DB Pool] New connection established');
});

pool.on('error', (err) => {
  console.error('[DB Pool] Unexpected error on idle client:', err);
});

pool.on('remove', () => {
  console.log('[DB Pool] Connection removed from pool');
});

// Pool health check function
export async function checkPoolHealth(): Promise<{
  total: number;
  idle: number;
  waiting: number;
  active: number;
}> {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    active: pool.totalCount - pool.idleCount,
  };
}

// Graceful shutdown
export async function closePool(): Promise<void> {
  console.log('[DB Pool] Shutting down connection pool...');
  await pool.end();
  console.log('[DB Pool] Connection pool closed');
}

export const db = drizzle(pool, { schema });

console.log(`[DB Pool] Initialized with min=${poolConfig.min}, max=${poolConfig.max} connections`);

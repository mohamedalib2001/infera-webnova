import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../db/schema/users";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("[Database] Unexpected error on idle client:", err);
});

pool.on("connect", () => {
  console.log("[Database] New client connected");
});

export const db = drizzle(pool, { schema });

export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("[Database] Connection test successful");
    return true;
  } catch (error) {
    console.error("[Database] Connection test failed:", error);
    return false;
  }
}

export async function closeConnection(): Promise<void> {
  await pool.end();
  console.log("[Database] Connection pool closed");
}

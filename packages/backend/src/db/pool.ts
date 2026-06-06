import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function initPool(connectionString: string): pg.Pool {
  if (pool) return pool;
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? undefined
      : { rejectUnauthorized: false },
  });
  return pool;
}

export function getPool(): pg.Pool {
  if (!pool) {
    throw new Error("Database pool not initialized");
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

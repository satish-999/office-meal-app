import fs from "fs";
import path from "path";
import { getPool } from "./pool";

function loadSchemaSql(): string {
  const candidates = [
    path.join(__dirname, "schema.sql"),
    path.join(__dirname, "../../src/db/schema.sql"),
    path.resolve(process.cwd(), "packages/backend/src/db/schema.sql"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
  }
  throw new Error("schema.sql not found");
}

export async function runMigrations(): Promise<void> {
  const sql = loadSchemaSql();
  const pool = getPool();
  await pool.query(sql);
  console.log("PostgreSQL schema ready");
}

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import os from "os";

const dataDir = path.join(os.tmpdir(), "platno-cache");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, "cache.sqlite"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS cache (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    fetched_at INTEGER NOT NULL
  )
`);

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function cacheGet<T>(key: string): T | null {
  const row = db
    .prepare("SELECT value, fetched_at FROM cache WHERE key = ?")
    .get(key) as { value: string; fetched_at: number } | undefined;

  if (!row) return null;
  if (Date.now() - row.fetched_at > SEVEN_DAYS_MS) {
    db.prepare("DELETE FROM cache WHERE key = ?").run(key);
    return null;
  }
  return JSON.parse(row.value) as T;
}

export function cacheSet(key: string, value: unknown): void {
  db.prepare(
    `INSERT INTO cache (key, value, fetched_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, fetched_at = excluded.fetched_at`
  ).run(key, JSON.stringify(value), Date.now());
}

export default db;

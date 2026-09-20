import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let sqlClient: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!sqlClient) {
    const url =
      process.env.DATABASE_URL ??
      process.env.POSTGRES_URL ??
      process.env.DATABASE_URL_UNPOOLED ??
      process.env.POSTGRES_URL_NON_POOLING;
    if (!url) {
      throw new Error(
        "No database connection string found. Connect a Postgres store to this project in Vercel."
      );
    }
    sqlClient = neon(url);
  }
  return sqlClient;
}

let tableReady: Promise<void> | null = null;

function ensureTable(): Promise<void> {
  if (!tableReady) {
    const sql = getSql();
    tableReady = sql`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        fetched_at BIGINT NOT NULL
      )
    `.then(() => undefined);
  }
  return tableReady;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function cacheGet<T>(key: string): Promise<T | null> {
  await ensureTable();
  const sql = getSql();
  const rows = await sql`SELECT value, fetched_at FROM cache WHERE key = ${key}`;
  const row = rows[0] as { value: string; fetched_at: string } | undefined;

  if (!row) return null;
  if (Date.now() - Number(row.fetched_at) > SEVEN_DAYS_MS) {
    await sql`DELETE FROM cache WHERE key = ${key}`;
    return null;
  }
  return JSON.parse(row.value) as T;
}

export async function cacheSet(key: string, value: unknown): Promise<void> {
  await ensureTable();
  const sql = getSql();
  await sql`
    INSERT INTO cache (key, value, fetched_at)
    VALUES (${key}, ${JSON.stringify(value)}, ${Date.now()})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, fetched_at = EXCLUDED.fetched_at
  `;
}

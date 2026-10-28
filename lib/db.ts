/**
 * WorldX Database Client (PostgreSQL)
 * Supports standard connection strings for Neon, Supabase, AWS RDS, Docker, and local PostgreSQL.
 */

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

// Database configuration from environment variables
export const dbConfig = {
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/worldx_quotation_db",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
};

/**
 * Universal Query Execution Helper
 * Use this helper to execute raw parameterized SQL queries securely.
 */
export async function query<T = any>(
  sql: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  try {
    // Dynamic import to avoid build errors if pg is not yet installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pg = await (Function('return import("pg")')() as Promise<any>);
    const pool = new pg.Pool(dbConfig);
    const client = await pool.connect();
    try {
      const res = await client.query(sql, params);
      return { rows: res.rows, rowCount: res.rowCount || 0 };
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn(
      "[PostgreSQL] Running without active database driver. Install 'pg' & '@types/pg' or set DATABASE_URL.",
      err?.message
    );
    return { rows: [], rowCount: 0 };
  }
}

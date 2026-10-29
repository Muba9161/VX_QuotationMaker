/**
 * @deprecated Legacy raw PostgreSQL query helper.
 *
 * MIGRATION NOTICE:
 * This helper was an initial stub that silently returned empty rows ({ rows: [], rowCount: 0 })
 * when the database driver was unavailable.
 *
 * For all new and refactored backend services, use the centralized Prisma ORM client:
 * `import { prisma } from "@/lib/prisma";`
 *
 * If raw SQL execution is required, use Prisma's type-safe raw query API:
 * `await prisma.$queryRaw` or `await prisma.$queryRawUnsafe`
 */

import { prisma } from "./prisma";

export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
}

export const dbConfig = {
  get connectionString() {
    return (
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/worldx_quotation_db"
    );
  },
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
};

/**
 * Universal Query Execution Helper
 * Routes raw parameterized SQL queries through the centralized Prisma client.
 *
 * Unlike the legacy stub, this function does NOT silently swallow database failures.
 *
 * @deprecated Use `prisma.$queryRaw` from `@/lib/prisma` instead.
 */
export async function query<T = unknown>(
  sql: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  try {
    const rows = await prisma.$queryRawUnsafe<T[]>(sql, ...params);
    return {
      rows: Array.isArray(rows) ? rows : [],
      rowCount: Array.isArray(rows) ? rows.length : 0,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `[Database Query Error] Failed to execute raw SQL query: ${message}`
    );
  }
}

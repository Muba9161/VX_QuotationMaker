import { PrismaClient } from "@prisma/client";

/**
 * Reusable Database Client Singleton (Prisma ORM)
 *
 * Rules:
 * - Server-side only: never import into client components ("use client").
 * - Global cache prevents multiple instances during Next.js development hot reloads.
 * - Sanitized connection check helper that never leaks credentials.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export interface ConnectionCheckResult {
  connected: boolean;
  latencyMs?: number;
  error?: string;
}

/**
 * Verifies live database connectivity using a lightweight query.
 * Safely sanitizes errors so connection strings and credentials are never exposed.
 */
export async function checkDatabaseHealth(): Promise<ConnectionCheckResult> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      latencyMs: Date.now() - start,
    };
  } catch (err: unknown) {
    // Log internal error safely on the server without exposing to caller
    const message = err instanceof Error ? err.message : String(err);
    if (process.env.NODE_ENV === "development") {
      console.error("[Database Health] Connection check failed:", message);
    }
    return {
      connected: false,
      error: "Database connection unreachable.",
    };
  }
}


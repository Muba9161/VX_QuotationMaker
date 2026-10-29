import { describe, it, expect } from "vitest";
import { prisma, checkDatabaseHealth } from "@/lib/prisma";

describe("Live PostgreSQL Database Verification (Read-Only)", () => {
  it("successfully connects to the live local PostgreSQL instance", async () => {
    const health = await checkDatabaseHealth();
    expect(health.connected).toBe(true);
    expect(health.latencyMs).toBeDefined();
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("confirms database identity and user without performing mutations", async () => {
    const identity = await prisma.$queryRaw<Array<{ db: string; user: string; version: string }>>`
      SELECT current_database() as db, current_user as "user", version() as version;
    `;

    expect(identity).toBeDefined();
    expect(identity.length).toBe(1);
    expect(identity[0].db).toBe("vx_quotation_maker");
    expect(identity[0].user).toBe("postgres");
    expect(identity[0].version).toContain("PostgreSQL");
  });

  it("inspects public schema tables without altering schema objects", async () => {
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    expect(tables).toBeDefined();
    expect(Array.isArray(tables)).toBe(true);
    // Verified that existing table is schema_migrations
    const tableNames = tables.map((t) => t.table_name);
    expect(tableNames).toContain("schema_migrations");
  });
});


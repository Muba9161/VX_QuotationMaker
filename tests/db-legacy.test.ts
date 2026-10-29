import { describe, it, expect, vi, beforeEach } from "vitest";
import { query } from "@/lib/db";
import { prisma } from "@/lib/prisma";

describe("Legacy db.ts migration safety", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws a descriptive error when raw SQL query fails instead of swallowing it", async () => {
    vi.spyOn(prisma, "$queryRawUnsafe").mockRejectedValue(
      new Error("connection refused to postgres")
    );

    await expect(query("SELECT * FROM invalid_table")).rejects.toThrow(
      "[Database Query Error] Failed to execute raw SQL query"
    );
  });

  it("returns rows and rowCount when raw SQL query succeeds", async () => {
    const mockRows = [{ id: "org-1", name: "Acme" }];
    vi.spyOn(prisma, "$queryRawUnsafe").mockResolvedValue(mockRows as unknown as never);

    const result = await query("SELECT * FROM organizations");

    expect(result.rows).toEqual(mockRows);
    expect(result.rowCount).toBe(1);
  });
});

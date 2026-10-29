import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/v1/health/route";
import * as prismaModule from "@/lib/prisma";

describe("GET /api/v1/health", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return HTTP 200 and connected status when database is healthy", async () => {
    vi.spyOn(prismaModule, "checkDatabaseHealth").mockResolvedValue({
      connected: true,
      latencyMs: 12,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.services.database).toBe("connected");
    expect(data.latencyMs).toBe(12);
    expect(typeof data.timestamp).toBe("string");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });

  it("should return HTTP 503 and degraded status when database is disconnected", async () => {
    vi.spyOn(prismaModule, "checkDatabaseHealth").mockResolvedValue({
      connected: false,
      error: "Database connection unreachable.",
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("degraded");
    expect(data.services.database).toBe("disconnected");
    expect(data).not.toHaveProperty("error"); // Never leaks internal error to client
    expect(typeof data.timestamp).toBe("string");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });

  it("should return HTTP 503 if checkDatabaseHealth throws an unexpected error", async () => {
    vi.spyOn(prismaModule, "checkDatabaseHealth").mockRejectedValue(
      new Error("Unexpected crash or connection pool timeout")
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("degraded");
    expect(data.services.database).toBe("disconnected");
    // Ensure no stack traces or sensitive strings leaked
    expect(JSON.stringify(data)).not.toContain("Unexpected crash");
  });
});


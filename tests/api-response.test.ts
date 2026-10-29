import { describe, it, expect, vi, afterEach } from "vitest";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api-response";

describe("API Response Utilities", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("formats success responses with data and default headers", async () => {
    const payload = { id: "test-123", name: "Acme Corp" };
    const res = successResponse(payload, 200, { page: 1 });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toEqual(payload);
    expect(json.meta).toEqual({ page: 1 });
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });

  it("formats error responses with error code and timestamp", async () => {
    const res = errorResponse("Invalid input parameters", "VALIDATION_ERROR", 400, {
      field: "email",
    });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.message).toBe("Invalid input parameters");
    expect(json.error.details).toEqual({ field: "email" });
    expect(typeof json.timestamp).toBe("string");
  });

  it("handleApiError returns safe HTTP 500 error response without exposing internal details in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const internalError = new Error("FATAL: connection to server at 'db.internal.net' failed");
    const res = handleApiError(internalError);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
    // Must not leak the internal host or database error string in production
    expect(json.error.message).not.toContain("db.internal.net");
    expect(json.error.message).toBe(
      "An unexpected error occurred while processing the request."
    );
  });
});

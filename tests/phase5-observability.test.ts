import { describe, it, expect, vi } from "vitest";
import { validateEnvironment } from "@/lib/env-validator";
import { sanitizeLogMetadata, Logger } from "@/lib/logger";
import { GET as readyProbeHandler } from "@/app/api/v1/health/ready/route";

describe("Phase 5: Observability & Production Readiness", () => {
  describe("Environment Configuration Validator", () => {
    it("flags missing or invalid DATABASE_URL", () => {
      vi.stubEnv("DATABASE_URL", "");
      const res = validateEnvironment();
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes("DATABASE_URL"))).toBe(true);

      vi.stubEnv("DATABASE_URL", "mysql://root:secret@localhost:3306/db");
      const resInvalidProto = validateEnvironment();
      expect(resInvalidProto.valid).toBe(false);
      expect(resInvalidProto.errors.some((e) => e.includes("PostgreSQL"))).toBe(true);
    });

    it("accepts valid PostgreSQL URL with valid secrets", () => {
      vi.stubEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/quotation_maker?schema=public");
      vi.stubEnv("JWT_SECRET", "12345678901234567890123456789012");
      vi.stubEnv("OTP_SECRET", "abcdefabcdefabcdefabcdefabcdefab");
      vi.stubEnv("APP_URL", "http://localhost:3000");

      const res = validateEnvironment();
      expect(res.valid).toBe(true);
      expect(res.errors.length).toBe(0);
    });
  });

  describe("Structured JSON Logger", () => {
    it("redacts sensitive fields in logging metadata", () => {
      const rawMeta = {
        userId: "usr-123",
        email: "alice@example.com",
        password: "SuperSecretPassword123!",
        otp: "123456",
        authToken: "eyJh...raw_jwt_token",
        nested: {
          secretKey: "super_secret_key",
          apiKey: "sk_live_12345",
          normalField: "visible",
        },
      };

      const sanitized = sanitizeLogMetadata(rawMeta) as Record<string, unknown>;

      expect(sanitized.userId).toBe("usr-123");
      expect(sanitized.password).toBe("[REDACTED]");
      expect(sanitized.otp).toBe("[REDACTED]");
      expect(sanitized.authToken).toBe("[REDACTED]");

      const nested = sanitized.nested as Record<string, unknown>;
      expect(nested.secretKey).toBe("[REDACTED]");
      expect(nested.apiKey).toBe("[REDACTED]");
      expect(nested.normalField).toBe("visible");
    });

    it("emits structured log without throwing", () => {
      const testLogger = new Logger("info", "test-corr-123");
      expect(() => {
        testLogger.info("Test informational event", { action: "TEST_ACTION" });
        testLogger.warn("Test warning event", { reason: "SAMPLE_WARN" });
        testLogger.error("Test error event", new Error("Sample test failure"));
      }).not.toThrow();
    });
  });

  describe("Deep Readiness Probe (/api/v1/health/ready)", () => {
    it("returns valid health structure with database, redis, and storage checks", async () => {
      const res = await readyProbeHandler();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.status).toBe("ready");
      expect(data.checks).toBeDefined();
      expect(data.checks.database.status).toBe("connected");
      expect(data.checks.redis.status).toMatch(/connected|fallback_memory/);
      expect(data.checks.storage.status).toBe("writable");
      expect(data.uptimeSeconds).toBeGreaterThanOrEqual(0);
    });
  });
});


import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkRateLimit,
  getClientIp,
  checkAuthRateLimit,
  _resetRateLimiter,
} from "@/lib/auth/rate-limiter";

describe("In-Memory Authentication Rate Limiter", () => {
  beforeEach(() => {
    _resetRateLimiter();
    vi.restoreAllMocks();
  });

  describe("checkRateLimit", () => {
    it("permits requests within configured threshold", () => {
      const key = "test:ip:1.2.3.4";
      const limit = 3;
      const windowSec = 60;

      const r1 = checkRateLimit(key, limit, windowSec);
      expect(r1.allowed).toBe(true);
      expect(r1.remaining).toBe(2);

      const r2 = checkRateLimit(key, limit, windowSec);
      expect(r2.allowed).toBe(true);
      expect(r2.remaining).toBe(1);

      const r3 = checkRateLimit(key, limit, windowSec);
      expect(r3.allowed).toBe(true);
      expect(r3.remaining).toBe(0);
    });

    it("rejects requests exceeding limit with allowed=false", () => {
      const key = "test:ip:1.2.3.4";
      const limit = 2;
      const windowSec = 60;

      checkRateLimit(key, limit, windowSec);
      checkRateLimit(key, limit, windowSec);

      const blocked = checkRateLimit(key, limit, windowSec);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetInSeconds).toBeGreaterThan(0);
    });

    it("resets counter after window expiration", () => {
      let currentTime = 1000000;
      vi.spyOn(Date, "now").mockImplementation(() => currentTime);

      const key = "test:ip:5.6.7.8";
      const limit = 1;
      const windowSec = 10;

      const r1 = checkRateLimit(key, limit, windowSec);
      expect(r1.allowed).toBe(true);

      const blocked = checkRateLimit(key, limit, windowSec);
      expect(blocked.allowed).toBe(false);

      // Fast-forward time past window
      currentTime += 11 * 1000;

      const afterReset = checkRateLimit(key, limit, windowSec);
      expect(afterReset.allowed).toBe(true);
      expect(afterReset.remaining).toBe(0);
    });
  });

  describe("getClientIp", () => {
    it("extracts client IP from X-Forwarded-For header", () => {
      const req = new Request("https://example.com", {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
      });
      expect(getClientIp(req)).toBe("203.0.113.195");
    });

    it("extracts client IP from X-Real-IP when X-Forwarded-For is absent", () => {
      const req = new Request("https://example.com", {
        headers: { "x-real-ip": "198.51.100.4" },
      });
      expect(getClientIp(req)).toBe("198.51.100.4");
    });

    it("falls back to 127.0.0.1 when no IP headers exist", () => {
      const req = new Request("https://example.com");
      expect(getClientIp(req)).toBe("127.0.0.1");
    });

    it("ignores client-controlled forwarded headers in production when TRUST_PROXY is not enabled", () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("TRUST_PROXY", "false");

      const req = new Request("https://example.com", {
        headers: { "x-forwarded-for": "198.51.100.99" },
      });
      expect(getClientIp(req)).toBe("127.0.0.1");
    });
  });

  describe("checkAuthRateLimit", () => {
    it("enforces action-specific limits for login", () => {
      const req = new Request("https://example.com", {
        headers: { "x-real-ip": "10.0.0.1" },
      });

      // Login limit is 5 attempts
      for (let i = 0; i < 5; i++) {
        const res = checkAuthRateLimit(req, "login");
        expect(res.allowed).toBe(true);
      }

      const blocked = checkAuthRateLimit(req, "login");
      expect(blocked.allowed).toBe(false);
    });
  });
});


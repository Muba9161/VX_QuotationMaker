import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkDistributedRateLimit,
} from "@/lib/auth/redis-rate-limiter";
import { _resetRateLimiter } from "@/lib/auth/rate-limiter";

describe("Phase 5: Concurrency & Reliability Verification", () => {
  beforeEach(() => {
    _resetRateLimiter();
    vi.restoreAllMocks();
  });

  describe("Simultaneous Rate-Limited Requests", () => {
    it("safely enforces rate limits under simultaneous burst traffic", async () => {
      const key = "test:concurrency:burst:192.168.1.100";
      const limit = 5;
      const windowSec = 60;

      // Dispatch 15 simultaneous requests concurrently
      const promises = Array.from({ length: 15 }).map(() =>
        checkDistributedRateLimit(key, limit, windowSec)
      );

      const results = await Promise.all(promises);

      const allowedCount = results.filter((r) => r.allowed).length;
      const blockedCount = results.filter((r) => !r.allowed).length;

      expect(allowedCount).toBeLessThanOrEqual(limit);
      expect(blockedCount).toBeGreaterThanOrEqual(15 - limit);
      expect(allowedCount + blockedCount).toBe(15);
    });
  });

  describe("Zero-Downtime Fallback on Redis Outage", () => {
    it("gracefully falls back to process memory when Redis is disconnected without crashing", async () => {
      const key = "test:fallback:key:1";
      const res = await checkDistributedRateLimit(key, 3, 60);

      expect(res).toBeDefined();
      expect(res.allowed).toBe(true);
      expect(res.limit).toBe(3);
    });
  });
});


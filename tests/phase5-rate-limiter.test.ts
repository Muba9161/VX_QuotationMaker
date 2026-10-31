import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkDistributedRateLimit,
  checkDistributedAuthRateLimit,
  EXTENDED_AUTH_RATE_LIMITS,
} from "@/lib/auth/redis-rate-limiter";
import { _resetRateLimiter } from "@/lib/auth/rate-limiter";

describe("Phase 5: Distributed Sliding-Window Rate Limiter", () => {
  beforeEach(() => {
    _resetRateLimiter();
    vi.restoreAllMocks();
  });

  it("permits initial requests below threshold", async () => {
    const key = "test:distributed:ip:10.0.0.1";
    const limit = 3;
    const windowSec = 30;

    const res1 = await checkDistributedRateLimit(key, limit, windowSec);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);
    expect(res1.limit).toBe(3);

    const res2 = await checkDistributedRateLimit(key, limit, windowSec);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = await checkDistributedRateLimit(key, limit, windowSec);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("rejects requests exceeding threshold with allowed=false", async () => {
    const key = "test:distributed:ip:10.0.0.2";
    const limit = 2;
    const windowSec = 60;

    await checkDistributedRateLimit(key, limit, windowSec);
    await checkDistributedRateLimit(key, limit, windowSec);

    const blocked = await checkDistributedRateLimit(key, limit, windowSec);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetInSeconds).toBeGreaterThan(0);
  });

  it("enforces action-specific policies for OTP and digital signing", async () => {
    expect(EXTENDED_AUTH_RATE_LIMITS.otp.limit).toBe(5);
    expect(EXTENDED_AUTH_RATE_LIMITS.otp.windowSeconds).toBe(600);
    expect(EXTENDED_AUTH_RATE_LIMITS.sign.limit).toBe(10);
    expect(EXTENDED_AUTH_RATE_LIMITS.sign.windowSeconds).toBe(900);

    const req = new Request("https://example.com/api/v1/shares/verify-otp", {
      headers: { "x-forwarded-for": "172.16.0.5" },
    });

    const res = await checkDistributedAuthRateLimit(req, "otp");
    expect(res.allowed).toBe(true);
    expect(res.limit).toBe(5);
  });
});


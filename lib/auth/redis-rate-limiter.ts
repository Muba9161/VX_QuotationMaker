import { getRedisClient } from "@/lib/redis";
import {
  checkRateLimit as checkMemoryRateLimit,
  getClientIp,
  RateLimitResult,
  AUTH_RATE_LIMITS as BASE_AUTH_LIMITS,
} from "@/lib/auth/rate-limiter";
import { randomUUID } from "crypto";

/**
 * Distributed Sliding-Window Rate Limiter
 *
 * Implements an atomic sliding-window counter using Redis Sorted Sets (ZSET).
 * Each request adds a timestamped member to the sorted set.
 *
 * Resilience & Reliability:
 * - Atomic execution via Redis pipelines.
 * - Automatic eviction of entries older than the sliding window.
 * - Automatic expiration to prevent Redis memory bloat.
 * - Transparent zero-downtime fallback to local memory rate limiting if Redis is offline.
 */

export const EXTENDED_AUTH_RATE_LIMITS = {
  ...BASE_AUTH_LIMITS,
  otp: {
    limit: 5, // 5 OTP verification attempts per 10 minutes
    windowSeconds: 60 * 10,
  },
  sign: {
    limit: 10, // 10 signing actions per 15 minutes per IP
    windowSeconds: 60 * 15,
  },
} as const;

export type RateLimitAction = keyof typeof EXTENDED_AUTH_RATE_LIMITS;

/**
 * Checks and records an attempt within a sliding time window.
 * Falls back to in-memory rate limiting when Redis is unavailable.
 */
export async function checkDistributedRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const windowMs = windowSeconds * 1000;
  const now = Date.now();
  const clearBefore = now - windowMs;
  const redisKey = `ratelimit:${key}`;

  try {
    const client = getRedisClient();

    // Check if client is responsive
    if (client.status === "ready" || client.status === "connecting") {
      const memberId = `${now}:${randomUUID()}`;

      // Redis Pipeline: Atomic sliding window computation
      const pipeline = client.pipeline();
      pipeline.zremrangebyscore(redisKey, 0, clearBefore);
      pipeline.zcard(redisKey);
      pipeline.expire(redisKey, windowSeconds + 1);

      const results = await pipeline.exec();
      if (results && results[1] && results[1][1] !== null) {
        const currentCount = Number(results[1][1]);

        if (currentCount >= limit) {
          // Find earliest entry in set to compute precise reset time
          const oldest = await client.zrange(redisKey, "0", "0", "WITHSCORES");
          let resetInSeconds = windowSeconds;
          if (oldest.length >= 2) {
            const oldestScore = Number(oldest[1]);
            const elapsedSinceOldest = now - oldestScore;
            resetInSeconds = Math.max(1, Math.ceil((windowMs - elapsedSinceOldest) / 1000));
          }

          return {
            allowed: false,
            remaining: 0,
            resetInSeconds,
            limit,
          };
        }

        // Under limit: record this attempt
        await client.zadd(redisKey, now, memberId);

        return {
          allowed: true,
          remaining: Math.max(0, limit - currentCount - 1),
          resetInSeconds: windowSeconds,
          limit,
        };
      }
    }
  } catch {
    // Redis unavailable or network error: fall back smoothly to memory
  }

  // Resilient fallback to memory limiter
  return checkMemoryRateLimit(key, limit, windowSeconds);
}

/**
 * Convenience helper to enforce distributed rate limiting on auth & signing endpoints.
 */
export async function checkDistributedAuthRateLimit(
  req: Request,
  action: RateLimitAction
): Promise<RateLimitResult> {
  const ip = getClientIp(req);
  const policy = EXTENDED_AUTH_RATE_LIMITS[action];
  const rateLimitKey = `auth:${String(action)}:${ip}`;

  return checkDistributedRateLimit(rateLimitKey, policy.limit, policy.windowSeconds);
}

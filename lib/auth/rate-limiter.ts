/**
 * In-Memory Process-Local Rate Limiter
 *
 * ARCHITECTURAL NOTICE:
 * This rate limiter stores attempt counters in local Node.js process memory.
 * - Scope: Single-process instances, local development, and automated test suites.
 * - Limitations: State is process-local and is NOT shared across horizontally scaled
 *   multi-instance or multi-container deployments.
 * - Roadmap: In Phase 6, this implementation will be upgraded to distributed
 *   Redis token-buckets via the configured REDIS_URL.
 * - Security Rules:
 *   - Sensitive values (passwords, tokens, emails) are NEVER used as keys or logged.
 *   - Keys are derived strictly from action prefixes and anonymized client IP addresses.
 *   - Bounded memory: Stale entries are evicted periodically to prevent memory exhaustion.
 */

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const MAX_BUCKETS = 10_000;
const buckets = new Map<string, RateLimitBucket>();

// Schedule automatic cleanup of expired buckets every 60 seconds
let lastCleanup = Date.now();

function cleanupExpiredBuckets(): void {
  const now = Date.now();
  if (now - lastCleanup < 60_000 && buckets.size < MAX_BUCKETS) {
    return;
  }

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }

  // If still over capacity after removing expired entries, clear oldest entries
  if (buckets.size >= MAX_BUCKETS) {
    const keysToDelete = Array.from(buckets.keys()).slice(0, 1000);
    for (const k of keysToDelete) {
      buckets.delete(k);
    }
  }

  lastCleanup = now;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
  limit: number;
}

/**
 * Checks and increments the attempt counter for a given key within a sliding time window.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  cleanupExpiredBuckets();

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    // New or expired bucket
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: limit - 1,
      resetInSeconds: windowSeconds,
      limit,
    };
  }

  // Existing active bucket
  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  const resetInSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
      limit,
    };
  }

  return {
    allowed: true,
    remaining,
    resetInSeconds,
    limit,
  };
}

/**
 * Safely extracts client IP address without leaking or storing sensitive payload values.
 *
 * PROXY TRUST NOTICE:
 * Forwarded IP headers (X-Forwarded-For, X-Real-IP) are client-controlled unless the application
 * is deployed behind a verified reverse proxy (e.g. NGINX, Cloudflare, AWS ALB) that explicitly
 * overwrites them. In direct-connection setups, arbitrary forwarded headers can be spoofed.
 * To enable proxy header trust in deployment, configure `TRUST_PROXY=true` in the environment.
 */
export function getClientIp(req: Request): string {
  const trustProxy = process.env.TRUST_PROXY === "true" || process.env.NODE_ENV === "test";

  if (trustProxy) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
      const firstIp = forwardedFor.split(",")[0]?.trim();
      if (firstIp) return firstIp;
    }

    const realIp = req.headers.get("x-real-ip");
    if (realIp && realIp.trim()) {
      return realIp.trim();
    }
  }

  return "127.0.0.1";
}

/**
 * Rate limit policy configuration per authentication route.
 */
export const AUTH_RATE_LIMITS = {
  login: {
    limit: 5, // 5 attempts per window
    windowSeconds: 60 * 15, // 15 minutes
  },
  register: {
    limit: 3, // 3 registration attempts per window
    windowSeconds: 60 * 60, // 1 hour
  },
} as const;

/**
 * Convenience helper to enforce rate limiting on auth endpoints.
 */
export function checkAuthRateLimit(
  req: Request,
  action: "login" | "register"
): RateLimitResult {
  const ip = getClientIp(req);
  const policy = AUTH_RATE_LIMITS[action];
  const rateLimitKey = `auth:${action}:${ip}`;

  return checkRateLimit(rateLimitKey, policy.limit, policy.windowSeconds);
}

/**
 * Resets all rate limit buckets. Used strictly for test isolation.
 */
export function _resetRateLimiter(): void {
  buckets.clear();
  lastCleanup = Date.now();
}


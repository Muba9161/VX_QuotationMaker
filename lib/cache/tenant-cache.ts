import { getRedisClient } from "@/lib/redis";

/**
 * Tenant-Scoped Cache Layer
 *
 * Implements strict organizational boundaries for cached data.
 * Key Namespace: org:{orgId}:{resource}:{key}
 *
 * Guarantees:
 * 1. Strict multi-tenant data isolation: Keys from Organization A can never be retrieved
 *    or affected by queries from Organization B.
 * 2. Automatic TTL enforcement with configurable expiration.
 * 3. Graceful in-memory fallback if Redis is unavailable or offline.
 */

// Local memory fallback store with TTL tracking
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memoryStore = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_SECONDS = 300; // 5 minutes

function buildKey(orgId: string, resource: string, key: string): string {
  if (!orgId || typeof orgId !== "string" || !orgId.trim()) {
    throw new Error("TenantCache: orgId is strictly required for tenant-scoped caching.");
  }
  if (!resource || typeof resource !== "string" || !resource.trim()) {
    throw new Error("TenantCache: resource namespace is required.");
  }
  if (!key || typeof key !== "string" || !key.trim()) {
    throw new Error("TenantCache: key identifier is required.");
  }
  return `org:${orgId.trim()}:${resource.trim()}:${key.trim()}`;
}

/**
 * Retrieves a cached value for the specified tenant, resource, and key.
 */
export async function getTenantCache<T>(
  orgId: string,
  resource: string,
  key: string
): Promise<T | null> {
  const fullKey = buildKey(orgId, resource, key);

  try {
    const client = getRedisClient();
    if (client.status === "ready" || client.status === "connecting") {
      const raw = await client.get(fullKey);
      if (raw !== null) {
        return JSON.parse(raw) as T;
      }
      return null;
    }
  } catch {
    // Fall back to memory store on Redis error
  }

  // Memory fallback check
  const entry = memoryStore.get(fullKey);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    memoryStore.delete(fullKey);
    return null;
  }

  return entry.value as T;
}

/**
 * Stores a value in cache scoped to the specified tenant.
 */
export async function setTenantCache<T>(
  orgId: string,
  resource: string,
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<boolean> {
  const fullKey = buildKey(orgId, resource, key);
  const ttl = Math.max(1, ttlSeconds);
  const serialized = JSON.stringify(value);

  // Store in memory fallback regardless for resilience
  memoryStore.set(fullKey, {
    value,
    expiresAt: Date.now() + ttl * 1000,
  });

  try {
    const client = getRedisClient();
    if (client.status === "ready" || client.status === "connecting") {
      await client.set(fullKey, serialized, "EX", ttl);
      return true;
    }
  } catch {
    // Redis unavailable, memory cache stored successfully
  }

  return true;
}

/**
 * Evicts a specific cached key for a tenant.
 */
export async function deleteTenantCache(
  orgId: string,
  resource: string,
  key: string
): Promise<boolean> {
  const fullKey = buildKey(orgId, resource, key);
  memoryStore.delete(fullKey);

  try {
    const client = getRedisClient();
    if (client.status === "ready" || client.status === "connecting") {
      const res = await client.del(fullKey);
      return res > 0;
    }
  } catch {
    // Fallback handled
  }

  return true;
}

/**
 * Evicts all cached entries for a given resource under a specific tenant.
 * Uses SCAN for non-blocking Redis key traversal.
 */
export async function invalidateTenantResource(
  orgId: string,
  resource: string
): Promise<number> {
  if (!orgId || !resource) return 0;
  const pattern = `org:${orgId.trim()}:${resource.trim()}:*`;
  let evictedCount = 0;

  // Clear memory cache entries matching prefix
  for (const k of Array.from(memoryStore.keys())) {
    if (k.startsWith(`org:${orgId.trim()}:${resource.trim()}:`)) {
      memoryStore.delete(k);
      evictedCount++;
    }
  }

  try {
    const client = getRedisClient();
    if (client.status === "ready" || client.status === "connecting") {
      let cursor = "0";
      do {
        const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          const deleted = await client.del(...keys);
          evictedCount += deleted;
        }
      } while (cursor !== "0");
    }
  } catch {
    // Fallback handled
  }

  return evictedCount;
}

/**
 * Clears the memory store. Used strictly in tests.
 */
export function _clearTenantMemoryCache(): void {
  memoryStore.clear();
}

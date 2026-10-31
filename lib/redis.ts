import Redis, { type RedisOptions } from "ioredis";

/**
 * Redis Client Singleton & Connection Lifecycle Manager
 *
 * Provides a resilient Redis connection for distributed caching,
 * sliding-window rate limiting, and BullMQ background queue brokers.
 *
 * Resilience features:
 * - Fast non-blocking timeout for offline detection.
 * - Non-crashing error handlers (avoids uncaughtException).
 * - Automatic offline fallback mode detection.
 */

let redisClient: Redis | null = null;
let lastPingTime = 0;
let lastPingResult = false;

export function getRedisConfig(): RedisOptions {
  return {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    enableReadyCheck: true,
    connectTimeout: 500,
    retryStrategy() {
      return null; // Don't block event loop with infinite retries when offline
    },
  };
}

/**
 * BullMQ requires maxRetriesPerRequest to be null for queue brokers & workers.
 */
export function getBullMQConnection() {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    return {
      url: redisUrl,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      connectTimeout: 500,
    };
  }
  return {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    connectTimeout: 500,
  };
}

/**
 * Returns the active Redis singleton instance.
 * Initializes the client lazily on first access.
 */
export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const config = getRedisConfig();

  try {
    redisClient = new Redis(redisUrl, config);

    redisClient.on("connect", () => {
      lastPingResult = true;
    });

    redisClient.on("ready", () => {
      lastPingResult = true;
    });

    redisClient.on("error", () => {
      lastPingResult = false;
    });

    redisClient.on("close", () => {
      lastPingResult = false;
    });

    redisClient.on("end", () => {
      lastPingResult = false;
    });
  } catch {
    lastPingResult = false;
    redisClient = new Redis({ ...config, lazyConnect: true });
  }

  return redisClient;
}

/**
 * Checks whether Redis is currently reachable and ready.
 * Non-blocking with 150ms timeout and status caching.
 */
export async function isRedisConnected(): Promise<boolean> {
  const now = Date.now();
  if (now - lastPingTime < 500) {
    return lastPingResult;
  }
  lastPingTime = now;

  const client = getRedisClient();
  if (client.status === "ready") {
    lastPingResult = true;
    return true;
  }

  try {
    const pingPromise = client.ping();
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 150)
    );
    const pong = await Promise.race([pingPromise, timeoutPromise]);
    lastPingResult = pong === "PONG";
    return lastPingResult;
  } catch {
    lastPingResult = false;
    return false;
  }
}

/**
 * Gracefully terminates the Redis connection.
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    try {
      if (redisClient.status !== "end") {
        await redisClient.quit();
      }
    } catch {
      redisClient.disconnect();
    } finally {
      redisClient = null;
      lastPingResult = false;
    }
  }
}

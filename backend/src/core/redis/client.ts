import Redis from 'ioredis';
import { getConfig } from '../../config';
import { logger } from '../logger/logger';

export interface RedisHealthResult {
  enabled: boolean;
  isHealthy: boolean;
  latencyMs?: number;
  error?: string;
}

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  const config = getConfig();
  if (!config.redis.enabled) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(config.redis.options);

    redisClient.on('connect', () => {
      logger.info('Connected to Redis');
    });

    redisClient.on('error', (err) => {
      logger.warn({ err: err.message }, 'Redis connection issue (non-blocking for core app)');
    });
  }

  return redisClient;
}

export async function checkRedisHealth(): Promise<RedisHealthResult> {
  const config = getConfig();

  if (!config.redis.enabled) {
    return {
      enabled: false,
      isHealthy: true,
    };
  }

  const client = getRedisClient();
  if (!client) {
    return {
      enabled: true,
      isHealthy: false,
      error: 'Redis client not initialized',
    };
  }

  const start = Date.now();
  try {
    const pong = await client.ping();
    return {
      enabled: true,
      isHealthy: pong === 'PONG',
      latencyMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Redis ping failed';
    return {
      enabled: true,
      isHealthy: false,
      latencyMs: Date.now() - start,
      error: errorMessage,
    };
  }
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    logger.info('Disconnecting Redis client...');
    try {
      await redisClient.quit();
    } catch {
      redisClient.disconnect();
    }
    redisClient = null;
    logger.info('Redis client disconnected');
  }
}

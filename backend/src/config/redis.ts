import { RedisOptions } from 'ioredis';
import { EnvConfig } from './env';

export interface RedisConfig {
  enabled: boolean;
  options: RedisOptions;
}

export function getRedisConfig(env: EnvConfig): RedisConfig {
  return {
    enabled: env.REDIS_ENABLED,
    options: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      db: env.REDIS_DB,
      connectTimeout: env.REDIS_CONNECT_TIMEOUT_MS,
      retryStrategy(times) {
        // Linear backoff capped at 3000ms
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    },
  };
}

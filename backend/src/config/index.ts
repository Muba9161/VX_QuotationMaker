import { loadAndValidateEnv, EnvConfig } from './env';
import { getDatabaseConfig, DatabaseConfig } from './database';
import { getRedisConfig, RedisConfig } from './redis';

export interface AppConfig {
  env: EnvConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
}

let cachedConfig: AppConfig | null = null;

export function getConfig(customEnv?: Record<string, unknown>): AppConfig {
  if (cachedConfig && !customEnv) {
    return cachedConfig;
  }

  const env = loadAndValidateEnv(customEnv);
  const database = getDatabaseConfig(env);
  const redis = getRedisConfig(env);

  const config: AppConfig = {
    env,
    database,
    redis,
  };

  if (!customEnv) {
    cachedConfig = config;
  }

  return config;
}

export { EnvConfig, DatabaseConfig, RedisConfig };

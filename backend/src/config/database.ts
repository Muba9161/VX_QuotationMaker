import { PoolConfig } from 'pg';
import { EnvConfig } from './env';

export interface DatabaseConfig {
  pool: PoolConfig;
}

export function getDatabaseConfig(env: EnvConfig): DatabaseConfig {
  const isTest = env.NODE_ENV === 'test';
  const targetDatabase = isTest
    ? env.TEST_DATABASE_NAME || 'vx_quotation_maker_test'
    : env.DATABASE_NAME;

  // Strict Safety Isolation Check: Tests must never target the development database
  const devDb = process.env.DEV_DATABASE_NAME || 'vx_quotation_maker';
  if (isTest && (targetDatabase === devDb || !targetDatabase.endsWith('_test'))) {
    throw new Error(
      `SAFETY VIOLATION: Cannot run tests against the development database "${targetDatabase}". ` +
        `Set TEST_DATABASE_NAME to a separate database (e.g. "vx_quotation_maker_test").`,
    );
  }

  return {
    pool: {
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      database: targetDatabase,
      user: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
      min: env.DATABASE_POOL_MIN,
      max: env.DATABASE_POOL_MAX,
      connectionTimeoutMillis: env.DATABASE_CONNECTION_TIMEOUT_MS,
      idleTimeoutMillis: 30000,
    },
  };
}

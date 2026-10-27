import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// Load .env file resolving from process.cwd(), backend subfolder, or relative to module
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
];
const resolvedEnvPath =
  envCandidates.find((candidate) => fs.existsSync(candidate)) || envCandidates[0];
dotenv.config({ path: resolvedEnvPath });

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // PostgreSQL Database
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_NAME: z.string().default('vx_quotation_maker'),
  TEST_DATABASE_NAME: z.string().default('vx_quotation_maker_test'),
  DATABASE_USER: z.string().default('postgres'),
  DATABASE_PASSWORD: z.string().default('postgres'),
  DATABASE_SSL: z
    .enum(['true', 'false'])
    .default('false')
    .transform((val) => val === 'true'),
  DATABASE_POOL_MIN: z.coerce.number().int().nonnegative().default(2),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
  DATABASE_CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),

  // Redis
  REDIS_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((val) => val === 'true'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),
  REDIS_DB: z.coerce.number().int().nonnegative().default(0),
  REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(3000),

  // Local Filesystem Storage (S3 is strictly prohibited by client specification)
  LOCAL_STORAGE_PATH: z.string().default('./storage'),
  MAX_UPLOAD_SIZE_BYTES: z.coerce.number().int().positive().default(10485760), // 10MB default
});

export type EnvConfig = z.infer<typeof envSchema>;

export function loadAndValidateEnv(customEnv?: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(customEnv ?? process.env);

  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    // Safe error message - never prints actual secret values
    throw new Error(
      `CRITICAL: Environment validation failed with ${result.error.issues.length} error(s):\n${errorDetails}`,
    );
  }

  return result.data;
}

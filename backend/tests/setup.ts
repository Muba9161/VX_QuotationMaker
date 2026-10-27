import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load base .env resolving from process.cwd(), backend subfolder, or relative to module
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
];
const resolvedEnvPath =
  envCandidates.find((candidate) => fs.existsSync(candidate)) || envCandidates[0];
dotenv.config({ path: resolvedEnvPath });

// Preserve the development database name for safety comparison
const devDbName = process.env.DATABASE_NAME || 'vx_quotation_maker';
process.env.DEV_DATABASE_NAME = devDbName;

// Test environment configuration
process.env.NODE_ENV = 'test';
process.env.PORT = '4001';
process.env.API_PREFIX = '/api/v1';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.DATABASE_NAME = process.env.TEST_DATABASE_NAME || 'vx_quotation_maker_test';
process.env.REDIS_ENABLED = 'false';

// Strict Safety Enforcement: Tests must NEVER touch development or production databases
if (process.env.DATABASE_NAME === devDbName || !process.env.DATABASE_NAME.endsWith('_test')) {
  throw new Error(
    `FATAL TEST SAFETY VIOLATION: Test suite attempted to run against database "${process.env.DATABASE_NAME}". ` +
      `Integration tests must always use a dedicated database ending in "_test" (e.g., "vx_quotation_maker_test").`,
  );
}

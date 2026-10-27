import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env resolving from process.cwd(), backend subfolder, or relative to module
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
];
const resolvedEnvPath =
  envCandidates.find((candidate) => fs.existsSync(candidate)) || envCandidates[0];
dotenv.config({ path: resolvedEnvPath });

const testDbName = process.env.TEST_DATABASE_NAME || 'vx_quotation_maker_test';

async function createTestDatabase(): Promise<void> {
  console.log(`=== Safe Test Database Setup ===`);
  console.log(`Target test database: "${testDbName}"`);

  // Connect to default maintenance database 'postgres'
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log(
      `Connected to PostgreSQL server at ${process.env.DATABASE_HOST || 'localhost'}:${process.env.DATABASE_PORT || 5432}`,
    );

    // Check if test database already exists
    const checkRes = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      testDbName,
    ]);

    if (checkRes.rows.length > 0) {
      console.log(`Test database "${testDbName}" already exists. No action needed.`);
    } else {
      console.log(`Creating test database "${testDbName}" safely...`);
      // Database names cannot be parameterized in DDL, so sanitize and validate
      if (!/^[a-zA-Z0-9_]+$/.test(testDbName)) {
        throw new Error(`Invalid test database name: "${testDbName}"`);
      }
      await client.query(`CREATE DATABASE "${testDbName}"`);
      console.log(`Successfully created test database "${testDbName}".`);
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`Failed to create test database: ${errorMsg}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTestDatabase();

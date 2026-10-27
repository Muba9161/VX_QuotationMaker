import { describe, it, expect, afterAll } from 'vitest';
import {
  checkDatabaseHealth,
  closeDatabasePool,
  query,
  withTransaction,
} from '../../src/core/database/connection';
import { DatabaseMigrator } from '../../src/core/database/migrator';

describe('Database Integration Tests (PostgreSQL)', () => {
  afterAll(async () => {
    await closeDatabasePool();
  });

  it('should enforce dedicated test database isolation', () => {
    const activeDb = process.env.DATABASE_NAME || '';
    expect(activeDb).not.toBe('vx_quotation_maker');
    expect(activeDb.endsWith('_test')).toBe(true);
  });

  it('should connect to PostgreSQL test database with healthy response', async () => {
    const result = await checkDatabaseHealth();

    if (!result.isHealthy) {
      throw new Error(
        `\n======================================================================\n` +
          `DATABASE INTEGRATION TEST FAILED:\n` +
          `Unable to connect to test database "${process.env.DATABASE_NAME}".\n` +
          `Underlying error: ${result.error}\n\n` +
          `Action required:\n` +
          `1. Ensure PostgreSQL is running on ${process.env.DATABASE_HOST || 'localhost'}:${process.env.DATABASE_PORT || 5432}\n` +
          `2. Create the test database safely by running:\n` +
          `   npm run db:create:test\n` +
          `   or execute in psql: CREATE DATABASE "${process.env.DATABASE_NAME}";\n` +
          `======================================================================\n`,
      );
    }

    expect(result.isHealthy).toBe(true);
    expect(typeof result.latencyMs).toBe('number');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should execute basic SQL query through connection pool', async () => {
    const result = await query<{ answer: number }>('SELECT 42 AS answer');
    expect(result.rows).toBeDefined();
    expect(result.rows.length).toBe(1);
    expect(Number(result.rows[0].answer)).toBe(42);
  });

  it('should apply schema migrations cleanly to test database', async () => {
    const migrator = new DatabaseMigrator();

    // Verify migration files discovery
    const available = migrator.getAvailableMigrationFiles();
    expect(available).toContain('001_create_schema_migrations.sql');

    // Run migrations on test database
    await migrator.runPendingMigrations();

    // Verify migration status
    const status = await migrator.getStatus();
    expect(status.applied).toContain('001_create_schema_migrations.sql');
    expect(status.pending.length).toBe(0);

    // Verify schema_migrations table directly
    const tableCheck = await query<{ table_name: string }>(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'schema_migrations'",
    );
    expect(tableCheck.rows.length).toBe(1);
  });

  it('should support atomic transactions and rollback on failure', async () => {
    // Create temporary table for transaction testing
    await query(`
      CREATE TEMP TABLE _transaction_test (
        id SERIAL PRIMARY KEY,
        val VARCHAR(50) NOT NULL
      )
    `);

    // Verify commit
    await withTransaction(async (client) => {
      await client.query("INSERT INTO _transaction_test (val) VALUES ('committed')");
    });

    const commitCheck = await query<{ val: string }>(
      "SELECT val FROM _transaction_test WHERE val = 'committed'",
    );
    expect(commitCheck.rows.length).toBe(1);

    // Verify rollback on error
    await expect(
      withTransaction(async (client) => {
        await client.query("INSERT INTO _transaction_test (val) VALUES ('rolled_back')");
        throw new Error('Intentional transaction test abort');
      }),
    ).rejects.toThrow();

    const rollbackCheck = await query<{ val: string }>(
      "SELECT val FROM _transaction_test WHERE val = 'rolled_back'",
    );
    expect(rollbackCheck.rows.length).toBe(0);
  });
});

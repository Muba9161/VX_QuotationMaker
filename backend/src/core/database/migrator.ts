import fs from 'fs';
import path from 'path';
import { getDatabasePool, withTransaction } from './connection';
import { logger } from '../logger/logger';
import { MigrationRecord } from './types';

export interface MigrationStatus {
  total: number;
  applied: string[];
  pending: string[];
}

export class DatabaseMigrator {
  private readonly migrationsDir: string;

  constructor(migrationsDir?: string) {
    if (migrationsDir) {
      this.migrationsDir = migrationsDir;
    } else {
      const candidates = [
        path.resolve(process.cwd(), 'migrations'),
        path.resolve(process.cwd(), 'backend', 'migrations'),
        path.resolve(__dirname, '../../../migrations'),
        path.resolve(__dirname, '../../../../migrations'),
      ];
      this.migrationsDir = candidates.find((dir) => fs.existsSync(dir)) || candidates[0];
    }
  }

  public async initMigrationTable(): Promise<void> {
    const pool = getDatabasePool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
  }

  public async getAppliedMigrations(): Promise<string[]> {
    await this.initMigrationTable();
    const pool = getDatabasePool();
    const result = await pool.query<MigrationRecord>(
      'SELECT name FROM schema_migrations ORDER BY id ASC',
    );
    return result.rows.map((row) => row.name);
  }

  public getAvailableMigrationFiles(): string[] {
    if (!fs.existsSync(this.migrationsDir)) {
      return [];
    }

    return fs
      .readdirSync(this.migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();
  }

  public async getStatus(): Promise<MigrationStatus> {
    const applied = await this.getAppliedMigrations();
    const available = this.getAvailableMigrationFiles();
    const pending = available.filter((file) => !applied.includes(file));

    return {
      total: available.length,
      applied,
      pending,
    };
  }

  public async runPendingMigrations(): Promise<string[]> {
    await this.initMigrationTable();
    const status = await this.getStatus();

    if (status.pending.length === 0) {
      logger.info('Database schema is up to date. No pending migrations.');
      return [];
    }

    const appliedThisRun: string[] = [];

    for (const file of status.pending) {
      const filePath = path.join(this.migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');

      logger.info({ migration: file }, 'Applying database migration...');

      await withTransaction(async (client) => {
        await client.query(sqlContent);
        await client.query(
          'INSERT INTO schema_migrations (name, applied_at) VALUES ($1, CURRENT_TIMESTAMP)',
          [file],
        );
      });

      appliedThisRun.push(file);
      logger.info({ migration: file }, 'Successfully applied database migration');
    }

    return appliedThisRun;
  }
}

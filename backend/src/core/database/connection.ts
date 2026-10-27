import { Pool, PoolClient, QueryResultRow } from 'pg';
import { getConfig } from '../../config';
import { logger } from '../logger/logger';
import { DatabaseError } from '../errors/app-error';
import { DatabaseHealthResult, DbQueryResult } from './types';

let pool: Pool | null = null;

export function getDatabasePool(): Pool {
  if (!pool) {
    const config = getConfig();
    pool = new Pool(config.database.pool);

    pool.on('error', (err) => {
      logger.error({ err: err.message }, 'Unexpected PostgreSQL pool error on idle client');
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<DbQueryResult<T>> {
  const currentPool = getDatabasePool();
  try {
    return await currentPool.query<T>(text, params);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
    logger.error({ err: errorMessage, query: text }, 'PostgreSQL query execution failed');
    throw new DatabaseError('Database operation failed');
  }
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const currentPool = getDatabasePool();
  const client = await currentPool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err: unknown) {
    await client.query('ROLLBACK');
    const errorMessage = err instanceof Error ? err.message : 'Transaction error';
    logger.error({ err: errorMessage }, 'PostgreSQL transaction failed and rolled back');
    throw new DatabaseError('Database transaction failed');
  } finally {
    client.release();
  }
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  const start = Date.now();
  try {
    const currentPool = getDatabasePool();
    await currentPool.query('SELECT 1 AS health_check');
    return {
      isHealthy: true,
      latencyMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Database ping failed';
    return {
      isHealthy: false,
      latencyMs: Date.now() - start,
      error: errorMessage,
    };
  }
}

export async function closeDatabasePool(): Promise<void> {
  if (pool) {
    logger.info('Closing PostgreSQL connection pool...');
    await pool.end();
    pool = null;
    logger.info('PostgreSQL connection pool closed');
  }
}

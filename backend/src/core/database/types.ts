import { QueryResult, QueryResultRow } from 'pg';

export interface DatabaseHealthResult {
  isHealthy: boolean;
  latencyMs: number;
  error?: string;
}

export interface QueryOptions {
  timeoutMs?: number;
}

export type DbQueryResult<T extends QueryResultRow = QueryResultRow> = QueryResult<T>;

export interface MigrationRecord {
  id: number;
  name: string;
  applied_at: Date;
}

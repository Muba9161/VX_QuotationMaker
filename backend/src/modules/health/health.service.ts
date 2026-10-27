import { checkDatabaseHealth } from '../../core/database/connection';
import { checkRedisHealth } from '../../core/redis/client';

export type SystemStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface ServiceHealth {
  status: 'up' | 'down' | 'disabled';
  latencyMs?: number;
}

export interface HealthCheckResponseData {
  status: SystemStatus;
  uptimeSeconds: number;
  environment: string;
  version: string;
  timestamp: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
  };
}

export class HealthService {
  public async getHealth(): Promise<HealthCheckResponseData> {
    const [dbHealth, redisHealth] = await Promise.all([checkDatabaseHealth(), checkRedisHealth()]);

    // PostgreSQL is the persistent source of truth - failure means system is unhealthy
    const isDbUp = dbHealth.isHealthy;
    const isRedisUp = !redisHealth.enabled || redisHealth.isHealthy;

    let overallStatus: SystemStatus = 'healthy';
    if (!isDbUp) {
      overallStatus = 'unhealthy';
    } else if (!isRedisUp) {
      // Redis is short-lived cache/queue - failure degrades performance without total failure
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: isDbUp ? 'up' : 'down',
          latencyMs: dbHealth.latencyMs,
        },
        redis: {
          status: !redisHealth.enabled ? 'disabled' : redisHealth.isHealthy ? 'up' : 'down',
          latencyMs: redisHealth.latencyMs,
        },
      },
    };
  }
}

export const healthService = new HealthService();

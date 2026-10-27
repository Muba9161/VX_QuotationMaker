import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../../src/app';
import * as dbModule from '../../src/core/database/connection';
import * as redisModule from '../../src/core/redis/client';

describe('GET /api/v1/health Endpoint', () => {
  let app: Application;

  beforeEach(() => {
    vi.restoreAllMocks();
    app = createApp();
  });

  it('should return 200 OK with healthy status when database is operational', async () => {
    vi.spyOn(dbModule, 'checkDatabaseHealth').mockResolvedValue({
      isHealthy: true,
      latencyMs: 3,
    });
    vi.spyOn(redisModule, 'checkRedisHealth').mockResolvedValue({
      enabled: false,
      isHealthy: true,
    });

    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('healthy');
    expect(response.body.data.services.database.status).toBe('up');
    expect(response.body.data.services.database.latencyMs).toBe(3);
    expect(response.body.data.services.redis.status).toBe('disabled');
    expect(response.body.data.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(response.body.requestId).toBeDefined();

    // Verify no secret leak in body
    const bodyString = JSON.stringify(response.body);
    expect(bodyString).not.toContain('password');
    expect(bodyString).not.toContain('postgres');
  });

  it('should return 503 Service Unavailable when database connection fails', async () => {
    vi.spyOn(dbModule, 'checkDatabaseHealth').mockResolvedValue({
      isHealthy: false,
      latencyMs: 50,
      error: 'Connection refused at localhost:5432',
    });

    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(503);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('unhealthy');
    expect(response.body.data.services.database.status).toBe('down');
  });

  it('should return 200 with degraded status when Redis fails but PostgreSQL is up', async () => {
    vi.spyOn(dbModule, 'checkDatabaseHealth').mockResolvedValue({
      isHealthy: true,
      latencyMs: 2,
    });
    vi.spyOn(redisModule, 'checkRedisHealth').mockResolvedValue({
      enabled: true,
      isHealthy: false,
      error: 'Redis connection timeout',
    });

    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('degraded');
    expect(response.body.data.services.database.status).toBe('up');
    expect(response.body.data.services.redis.status).toBe('down');
  });
});

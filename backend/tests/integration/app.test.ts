import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../../src/app';

describe('Application Bootstrap & API Foundation', () => {
  let app: Application;

  beforeAll(() => {
    app = createApp();
  });

  it('should serve root endpoint with service metadata', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('VorldX Quotation & MOU Platform API');
    expect(response.body.status).toBe('operational');
    expect(response.body.version).toBe('1.0.0');
  });

  it('should attach X-Request-ID to response headers', async () => {
    const response = await request(app).get('/');

    expect(response.headers['x-request-id']).toBeDefined();
    expect(typeof response.headers['x-request-id']).toBe('string');
  });

  it('should preserve incoming X-Request-ID header', async () => {
    const customId = 'test-request-id-12345';
    const response = await request(app).get('/').set('X-Request-ID', customId);

    expect(response.headers['x-request-id']).toBe(customId);
  });

  it('should return standardized 404 for non-existent routes', async () => {
    const response = await request(app).get('/api/v1/non-existent-route');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
    expect(response.body.requestId).toBeDefined();
    expect(response.body.timestamp).toBeDefined();
  });

  it('should return 400 with safe error on malformed JSON payload', async () => {
    const response = await request(app)
      .post('/api/v1/health')
      .set('Content-Type', 'application/json')
      .send('{ "malformedJson": ');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_JSON');
  });
});

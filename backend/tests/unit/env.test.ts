import { describe, it, expect } from 'vitest';
import { loadAndValidateEnv } from '../../src/config/env';

describe('Environment Configuration Validation', () => {
  it('should successfully load valid default configuration', () => {
    const env = loadAndValidateEnv({
      NODE_ENV: 'test',
      PORT: '5000',
      DATABASE_HOST: '127.0.0.1',
      DATABASE_PORT: '5432',
      DATABASE_NAME: 'test_db',
      DATABASE_USER: 'test_user',
      DATABASE_PASSWORD: 'test_password',
      REDIS_ENABLED: 'false',
    });

    expect(env.NODE_ENV).toBe('test');
    expect(env.PORT).toBe(5000);
    expect(env.DATABASE_PORT).toBe(5432);
    expect(env.REDIS_ENABLED).toBe(false);
    expect(env.API_PREFIX).toBe('/api/v1');
    expect(env.LOCAL_STORAGE_PATH).toBe('./storage');
    expect(env.TEST_DATABASE_NAME).toBe('vx_quotation_maker_test');
  });

  it('should throw safe validation error when PORT is invalid', () => {
    expect(() =>
      loadAndValidateEnv({
        PORT: 'not-a-number',
      }),
    ).toThrowError(/CRITICAL: Environment validation failed/);
  });

  it('should throw safe validation error when NODE_ENV is unsupported', () => {
    expect(() =>
      loadAndValidateEnv({
        NODE_ENV: 'staging',
      }),
    ).toThrowError(/CRITICAL: Environment validation failed/);
  });

  it('should coerce boolean strings for REDIS_ENABLED and DATABASE_SSL', () => {
    const env = loadAndValidateEnv({
      REDIS_ENABLED: 'true',
      DATABASE_SSL: 'true',
    });

    expect(env.REDIS_ENABLED).toBe(true);
    expect(env.DATABASE_SSL).toBe(true);
  });
});

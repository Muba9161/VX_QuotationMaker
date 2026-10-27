import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { validateRequest } from '../../src/core/middleware/validate';
import { ValidationError } from '../../src/core/errors/app-error';

describe('validateRequest Middleware', () => {
  const schema = {
    body: z.object({
      name: z.string().min(2),
      email: z.string().email(),
    }),
  };

  it('should call next() without error when request body is valid', async () => {
    const middleware = validateRequest(schema);
    const req = {
      body: { name: 'VorldX', email: 'hello@vorldx.com' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    await middleware(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledWith();
  });

  it('should forward ValidationError to next() when request body is invalid', async () => {
    const middleware = validateRequest(schema);
    const req = {
      body: { name: 'V', email: 'invalid-email' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    await middleware(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalled();
    const calledError = next.mock.calls[0][0];
    expect(calledError).toBeInstanceOf(ValidationError);
    expect(calledError.statusCode).toBe(400);
    expect(Array.isArray(calledError.details)).toBe(true);
    expect(calledError.details.length).toBe(2);
  });
});

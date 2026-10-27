import { describe, it, expect } from 'vitest';
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError,
} from '../../src/core/errors/app-error';
import { HttpStatus } from '../../src/core/errors/http-status';
import { createSuccessResponse, createErrorResponse } from '../../src/core/types/api-response';

describe('Error Classes & Response Envelopes', () => {
  it('should instantiate AppError with default internal server error status', () => {
    const error = new AppError('Something failed');
    expect(error.message).toBe('Something failed');
    expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(error.errorCode).toBe('INTERNAL_ERROR');
    expect(error.isOperational).toBe(true);
  });

  it('should instantiate NotFoundError with 404 status code', () => {
    const error = new NotFoundError('Organization not found');
    expect(error.message).toBe('Organization not found');
    expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(error.errorCode).toBe('NOT_FOUND');
  });

  it('should instantiate ValidationError with 400 status and details', () => {
    const details = [{ field: 'email', message: 'Invalid email format' }];
    const error = new ValidationError('Validation failed', details);
    expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(error.errorCode).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual(details);
  });

  it('should instantiate UnauthorizedError and ForbiddenError with correct status codes', () => {
    const unauth = new UnauthorizedError();
    const forbidden = new ForbiddenError();
    expect(unauth.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(forbidden.statusCode).toBe(HttpStatus.FORBIDDEN);
  });

  it('should instantiate ConflictError and DatabaseError with expected status codes', () => {
    const conflict = new ConflictError('Quotation number already exists');
    const dbErr = new DatabaseError('Connection timeout');
    expect(conflict.statusCode).toBe(HttpStatus.CONFLICT);
    expect(dbErr.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(dbErr.isOperational).toBe(false);
  });

  it('should format success response correctly', () => {
    const res = createSuccessResponse({ id: '123' }, 'req-abc');
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ id: '123' });
    expect(res.requestId).toBe('req-abc');
    expect(res.timestamp).toBeDefined();
  });

  it('should format error response correctly', () => {
    const res = createErrorResponse('INVALID_INPUT', 'Field missing', 'req-xyz', {
      field: 'name',
    });
    expect(res.success).toBe(false);
    expect(res.error?.code).toBe('INVALID_INPUT');
    expect(res.error?.message).toBe('Field missing');
    expect(res.error?.details).toEqual({ field: 'name' });
    expect(res.requestId).toBe('req-xyz');
  });
});

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { HttpStatus } from '../errors/http-status';
import { createErrorResponse } from '../types/api-response';
import { logger } from '../logger/logger';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.id || 'unknown';

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error(
        { err: err.message, stack: err.stack, requestId, code: err.errorCode },
        'Non-operational application error encountered',
      );
    } else {
      logger.warn(
        { err: err.message, requestId, code: err.errorCode, details: err.details },
        'Operational error handled',
      );
    }

    res
      .status(err.statusCode)
      .json(createErrorResponse(err.errorCode, err.message, requestId, err.details));
    return;
  }

  // Handle syntax errors (e.g. malformed JSON in request body)
  if ('type' in err && (err as { type: string }).type === 'entity.parse.failed') {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json(
        createErrorResponse(
          'INVALID_JSON',
          'Malformed JSON payload received in request body',
          requestId,
        ),
      );
    return;
  }

  // Unexpected/unhandled errors - log thoroughly internally, sanitize for client
  logger.error(
    { err: err.message, stack: err.stack, requestId },
    'Unhandled server error occurred',
  );

  const safeMessage =
    process.env.NODE_ENV === 'test'
      ? err.message
      : 'An unexpected internal server error occurred. Please contact support.';

  res
    .status(HttpStatus.INTERNAL_SERVER_ERROR)
    .json(createErrorResponse('INTERNAL_SERVER_ERROR', safeMessage, requestId));
}

export function notFoundHandler(req: Request, res: Response): void {
  const requestId = req.id || 'unknown';
  res
    .status(HttpStatus.NOT_FOUND)
    .json(
      createErrorResponse(
        'ROUTE_NOT_FOUND',
        `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`,
        requestId,
      ),
    );
}

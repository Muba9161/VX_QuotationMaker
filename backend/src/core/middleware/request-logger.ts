import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger/logger';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;

    const logData = {
      requestId: req.id,
      method,
      url: originalUrl,
      statusCode,
      durationMs,
      ip,
    };

    if (statusCode >= 500) {
      logger.error(logData, 'HTTP Request completed with server error');
    } else if (statusCode >= 400) {
      logger.warn(logData, 'HTTP Request completed with client error');
    } else {
      logger.info(logData, 'HTTP Request completed');
    }
  });

  next();
}

import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { getConfig } from './config';
import {
  requestIdMiddleware,
  requestLoggerMiddleware,
  errorHandler,
  notFoundHandler,
} from './core/middleware';
import { healthRoutes } from './modules/health';

export function createApp(): Application {
  const app = express();
  const config = getConfig();

  // Security Headers
  app.use(helmet());

  // CORS Configuration - deliberately constrained to allowed origin(s)
  app.use(
    cors({
      origin: config.env.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      credentials: true,
    }),
  );

  // Body Parsing with safe size limits to prevent Denial of Service
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Request tracing & structured logging
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);

  // API Version 1 Routes
  const apiRouter = express.Router();
  apiRouter.use('/health', healthRoutes);

  // Mount API router under configured prefix (default /api/v1)
  app.use(config.env.API_PREFIX, apiRouter);

  // Root fallback route
  app.get('/', (_req, res) => {
    res.json({
      name: 'VorldX Quotation & MOU Platform API',
      version: '1.0.0',
      status: 'operational',
      docs: `${config.env.API_PREFIX}/health`,
    });
  });

  // 404 Not Found handler
  app.use(notFoundHandler);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}

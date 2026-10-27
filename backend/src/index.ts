import { createApp } from './app';
import { getConfig } from './config';
import { logger } from './core/logger/logger';
import { setupGracefulShutdown } from './core/utils/shutdown';

async function bootstrap(): Promise<void> {
  try {
    const config = getConfig();
    const app = createApp();

    const server = app.listen(config.env.PORT, () => {
      logger.info(
        {
          port: config.env.PORT,
          environment: config.env.NODE_ENV,
          apiPrefix: config.env.API_PREFIX,
        },
        'VorldX Backend Application started successfully',
      );
      logger.info(
        `Health check available at http://localhost:${config.env.PORT}${config.env.API_PREFIX}/health`,
      );
    });

    setupGracefulShutdown(server);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.fatal({ err: errorMsg }, 'Application failed to bootstrap');
    process.exit(1);
  }
}

// Start server
bootstrap();

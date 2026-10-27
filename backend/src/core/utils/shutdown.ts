import http from 'http';
import { closeDatabasePool } from '../database/connection';
import { closeRedisClient } from '../redis/client';
import { logger } from '../logger/logger';

let isShuttingDown = false;

export function setupGracefulShutdown(server: http.Server): void {
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info({ signal }, 'Graceful shutdown initiated...');

    // Stop accepting new connections
    server.close(async (err) => {
      if (err) {
        logger.error({ err: err.message }, 'Error closing HTTP server');
      } else {
        logger.info('HTTP server closed');
      }

      try {
        await closeDatabasePool();
        await closeRedisClient();
        logger.info('All resources released successfully. Exiting.');
        process.exit(0);
      } catch (cleanupErr: unknown) {
        const msg = cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr);
        logger.error({ err: msg }, 'Error during resource cleanup');
        process.exit(1);
      }
    });

    // Force exit if cleanup takes longer than 10 seconds
    setTimeout(() => {
      logger.error('Graceful shutdown timed out after 10s. Forcing exit.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

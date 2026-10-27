import { DatabaseMigrator } from '../src/core/database/migrator';
import { closeDatabasePool } from '../src/core/database/connection';
import { logger } from '../src/core/logger/logger';

async function main(): Promise<void> {
  const command = process.argv[2] || 'status';
  const migrator = new DatabaseMigrator();

  try {
    if (command === 'up') {
      logger.info('Starting database migration...');
      const applied = await migrator.runPendingMigrations();
      if (applied.length > 0) {
        logger.info(`Applied ${applied.length} migration(s): ${applied.join(', ')}`);
      } else {
        logger.info('No migrations needed.');
      }
    } else if (command === 'status') {
      const status = await migrator.getStatus();
      console.log('\n=== Database Migration Status ===');
      console.log(`Total migrations available: ${status.total}`);
      console.log(`Applied migrations (${status.applied.length}):`);
      for (const m of status.applied) {
        console.log(`  ✓ ${m}`);
      }
      console.log(`Pending migrations (${status.pending.length}):`);
      for (const m of status.pending) {
        console.log(`  ⏳ ${m}`);
      }
      console.log('=================================\n');
    } else {
      console.error(`Unknown migration command: "${command}". Use "up" or "status".`);
      process.exit(1);
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error({ err: errorMsg }, 'Migration failed');
    process.exit(1);
  } finally {
    await closeDatabasePool();
  }
}

main();

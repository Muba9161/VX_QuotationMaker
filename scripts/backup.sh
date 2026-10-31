#!/bin/sh
set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_ROOT="./backups"
DB_BACKUP_DIR="${BACKUP_ROOT}/db"
STORAGE_BACKUP_DIR="${BACKUP_ROOT}/storage"

mkdir -p "$DB_BACKUP_DIR" "$STORAGE_BACKUP_DIR"

echo "[1/2] Creating PostgreSQL database backup..."
if command -v pg_dump >/dev/null 2>&1; then
  pg_dump -U "${POSTGRES_USER:-postgres}" -h "${POSTGRES_HOST:-localhost}" -p "${POSTGRES_PORT:-5432}" -F c -b -f "${DB_BACKUP_DIR}/vx_backup_${TIMESTAMP}.dump" "${POSTGRES_DB:-quotation_maker}"
  echo "Database backup completed: ${DB_BACKUP_DIR}/vx_backup_${TIMESTAMP}.dump"
else
  echo "pg_dump not available in PATH, skipping."
fi

echo "[2/2] Creating Storage archive..."
if [ -d "./storage" ]; then
  tar -czf "${STORAGE_BACKUP_DIR}/storage_backup_${TIMESTAMP}.tar.gz" -C "./storage" .
  echo "Storage archive completed: ${STORAGE_BACKUP_DIR}/storage_backup_${TIMESTAMP}.tar.gz"
fi

echo "Backup finished successfully at $(date)."


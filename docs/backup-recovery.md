# Database & Storage Backup & Disaster Recovery Guide

This runbook establishes standard operational procedures for scheduled backups, disaster recovery, and cross-volume consistency verification for the VorldX White-Label Platform.

---

## 1. Authoritative Data Stores

| Store | Location | Content | Recovery Objective |
|---|---|---|---|
| **PostgreSQL** | Local port `5432` / Docker volume `vx_postgres_data` | Organizations, Users, RBAC, Documents, Quotations, MOUs, Signatures, Audit Logs | RPO < 1 hour, RTO < 15 min |
| **Local Storage** | `./storage` / Docker volume `vx_document_storage` | Original templates, uploaded assets, executed & signed PDF certificates | RPO < 1 hour, RTO < 15 min |
| **Redis** | In-memory / Docker volume `vx_redis_data` | Ephemeral sliding window rate limit sets, queue job states, tenant caches | Reconstructible / Disposable |

---

## 2. PostgreSQL Native Backup (pg_dump)

### Host-Based Backup Command (PowerShell)

```powershell
# Create timestamped backup directory
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = ".\backups\db"
New-Item -ItemType Directory -Force -Path $BackupDir

# Execute pg_dump in custom archive format (-Fc)
& "pg_dump.exe" -U postgres -h localhost -p 5432 -F c -b -v -f "$BackupDir\vx_backup_$Timestamp.dump" quotation_maker
```

### Container-Based Backup Command

```bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p ./backups/db

docker compose exec -T postgres pg_dump -U postgres -F c quotation_maker > ./backups/db/vx_backup_${TIMESTAMP}.dump
```

---

## 3. Database Restoration Procedure (pg_restore)

> **Warning:** Restoration overwrites database objects. Always perform a pre-restore backup of the target database before initiating recovery.

### Host-Based Restoration

```powershell
# Step 1: Terminate active client connections
& "psql.exe" -U postgres -h localhost -d quotation_maker -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'quotation_maker' AND pid <> pg_backend_pid();"

# Step 2: Restore from custom format archive
& "pg_restore.exe" -U postgres -h localhost -p 5432 -d quotation_maker --clean --if-exists --no-owner -v ".\backups\db\vx_backup_20261031_120000.dump"
```

### Container-Based Restoration

```bash
docker compose exec -T postgres psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'quotation_maker' AND pid <> pg_backend_pid();"

docker compose exec -T postgres pg_restore -U postgres -d quotation_maker --clean --if-exists --no-owner < ./backups/db/vx_backup_20261031_120000.dump
```

---

## 4. Document Storage Backup & Sync

PostgreSQL holds metadata and SHA-256 byte hashes of signed documents. The underlying binary PDF files reside in `./storage`. For absolute disaster recovery, database backups and storage snapshots must be coordinated:

```powershell
# Archive document storage directory
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Compress-Archive -Path ".\storage\*" -DestinationPath ".\backups\storage\storage_$Timestamp.zip" -Force
```

### Consistency Verification

After restoration, verify document integrity using the built-in storage service:
- Query `Document` and `Signature` tables for `signedPdfHash`.
- Compare with calculated hash from `lib/storage/document-storage.ts` using `verifyDocumentFileIntegrity`.


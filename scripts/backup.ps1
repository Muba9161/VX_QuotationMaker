# Automated Backup Script for PostgreSQL Database & Storage Directory
param(
    [string]$Database = "quotation_maker",
    [string]$DbHost = "localhost",
    [string]$Port = "5432",
    [string]$User = "postgres",
    [string]$BackupRoot = ".\backups"
)

$ErrorActionPreference = "Stop"

# Auto-detect connection settings from .env.local if present
if (Test-Path ".\.env.local") {
    $envContent = Get-Content ".\.env.local" -Raw
    if ($envContent -match 'DATABASE_URL="?postgresql:\/\/([^:]+):([^@]+)@([^:\/]+):(\d+)\/([^"?\s]+)') {
        $User = $matches[1]
        $env:PGPASSWORD = $matches[2]
        $DbHost = $matches[3]
        $Port = $matches[4]
        $Database = $matches[5]
    }
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$DbBackupDir = Join-Path $BackupRoot "db"
$StorageBackupDir = Join-Path $BackupRoot "storage"

New-Item -ItemType Directory -Force -Path $DbBackupDir | Out-Null
New-Item -ItemType Directory -Force -Path $StorageBackupDir | Out-Null

$DbBackupFile = Join-Path $DbBackupDir "vx_backup_$Timestamp.dump"
$StorageBackupFile = Join-Path $StorageBackupDir "storage_backup_$Timestamp.zip"

Write-Host "[1/2] Backing up PostgreSQL database '$Database' from $DbHost on port $Port to $DbBackupFile..."
$pgDump = "pg_dump.exe"
if (-not (Get-Command $pgDump -ErrorAction SilentlyContinue)) {
    $standardPath = "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"
    if (Test-Path $standardPath) {
        $pgDump = $standardPath
    }
}

if ((Get-Command $pgDump -ErrorAction SilentlyContinue) -or (Test-Path $pgDump)) {
    & $pgDump -U $User -h $DbHost -p $Port -F c -b -f $DbBackupFile $Database
    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump execution failed with exit code $LASTEXITCODE"
    }
    Write-Host "Database backup completed successfully."
} else {
    Write-Warning "pg_dump.exe not found. Skipping direct database dump."
}

Write-Host "[2/2] Archiving document storage to $StorageBackupFile..."
if (Test-Path ".\storage") {
    Compress-Archive -Path ".\storage\*" -DestinationPath $StorageBackupFile -Force
    Write-Host "Storage backup completed successfully."
} else {
    Write-Warning "Storage directory does not exist. Skipping."
}

Write-Host "Backup process completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')."

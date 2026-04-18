#!/bin/bash
# Olcan Compass - Automated Database Backup Script
# Usage: Add to crontab for daily backups
#   0 2 * * * /path/to/backup_database.sh >> /path/to/backup.log 2>&1

set -e  # Exit on error

# Configuration
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-olcan_production}"
DB_USER="${DB_USER:-olcan_app}"
DB_PASSWORD="${DB_PASSWORD}"

BACKUP_DIR="${BACKUP_DIR:-/backups/olcan-compass}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"  # Keep backups for 30 days

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/olcan_compass_${DATE}.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting database backup..."

# Perform backup
PGPASSWORD="${DB_PASSWORD}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "[$(date)] ✅ Backup successful: ${BACKUP_FILE} (${BACKUP_SIZE})"
    
    # Verify backup integrity
    if gzip -t "${BACKUP_FILE}" 2>/dev/null; then
        echo "[$(date)] ✅ Backup integrity verified"
    else
        echo "[$(date)] ❌ Backup integrity check failed!"
        exit 1
    fi
    
    # Remove old backups
    echo "[$(date)] Cleaning up backups older than ${RETENTION_DAYS} days..."
    find "${BACKUP_DIR}" -name "olcan_compass_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
    echo "[$(date)] ✅ Cleanup complete"
    
    # List current backups
    echo "[$(date)] Current backups:"
    ls -lh "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | tail -5
else
    echo "[$(date)] ❌ Backup failed!"
    exit 1
fi

echo "[$(date)] Backup process complete"

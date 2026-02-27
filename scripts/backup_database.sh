#!/bin/bash
set -e

# Default settings
BACKUP_DIR="${BACKUP_DIR:-/tmp/backups}"
DB_CONTAINER="${DB_CONTAINER:-api-db-1}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-compass}"
DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/compass_$DATE.sql"

echo "================================================="
echo "Starting Compass Database Backup"
echo "Date: $DATE"
echo "Destination: $BACKUP_DIR"
echo "Database: $DB_NAME"
echo "Container: $DB_CONTAINER"
echo "================================================="

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Ensure docker compose is running and db container is accessible
if ! docker ps | grep -q "$DB_CONTAINER"; then
  # Fallback to older docker compose naming convention if needed
  if docker ps | grep -q "olcan-compass-db-1"; then
    echo "Using legacy container name: olcan-compass-db-1"
    DB_CONTAINER="olcan-compass-db-1"
  else
    echo "ERROR: Postgres container not found or not running. Please start the app first."
    exit 1
  fi
fi

# Run pg_dump securely via Docker execution
echo "-> Creating pg_dump..."
docker exec -e PGPASSWORD="$DB_PASSWORD" "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
echo "-> Compressing backup..."
gzip -f "$BACKUP_FILE"

echo "-> Backup completed successfully: $BACKUP_FILE.gz"

# Clean up old backups
echo "-> Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "compass_*.sql.gz" -mtime +$RETENTION_DAYS -exec rm -f {} \;
echo "-> Cleanup complete."
echo "================================================="

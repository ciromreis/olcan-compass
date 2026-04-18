# Database Backup & Recovery Guide

## Overview

This guide covers automated backup procedures and disaster recovery for the Olcan Compass database.

---

## Automated Backups

### Setup (Production)

1. **Make script executable:**
   ```bash
   chmod +x scripts/backup_database.sh
   ```

2. **Set environment variables:**
   ```bash
   export DB_HOST=your-db-host.com
   export DB_PORT=5432
   export DB_NAME=olcan_production
   export DB_USER=olcan_app
   export DB_PASSWORD=your_secure_password
   export BACKUP_DIR=/backups/olcan-compass
   export RETENTION_DAYS=30
   ```

3. **Add to crontab (daily at 2 AM):**
   ```bash
   crontab -e
   
   # Add this line:
   0 2 * * * /path/to/olcan-compass/scripts/backup_database.sh >> /var/log/olcan-backup.log 2>&1
   ```

4. **Verify backup runs:**
   ```bash
   # Check log
   tail -f /var/log/olcan-backup.log
   
   # List backups
   ls -lh /backups/olcan-compass/
   ```

### Manual Backup

```bash
# Using the script
./scripts/backup_database.sh

# Or manually
pg_dump -h 127.0.0.1 -p 5432 -U olcan_app -d olcan_production | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Docker Environment (Development)

```bash
# Backup from Docker container
docker exec olcan-postgres pg_dump -U postgres -d olcan_production | gzip > backup.sql.gz

# Or using docker-compose
docker compose exec db pg_dump -U postgres -d olcan_production | gzip > backup.sql.gz
```

---

## Backup Storage

### Recommended Structure

```
/backups/olcan-compass/
├── olcan_compass_20260413_020000.sql.gz
├── olcan_compass_20260414_020000.sql.gz
├── olcan_compass_20260415_020000.sql.gz
└── ...
```

### Storage Best Practices

1. **Local storage:** Keep last 7 days
2. **Remote storage:** Sync to S3/GCS daily
3. **Off-site backup:** Keep monthly backups for 1 year
4. **Encryption:** Encrypt backups containing PII

### Cloud Storage Sync (Optional)

```bash
# AWS S3
aws s3 sync /backups/olcan-compass/ s3://olcan-backups/database/ --delete

# Google Cloud Storage
gsutil rsync /backups/olcan-compass/ gs://olcan-backups/database/

# Add to crontab (run after backup)
0 3 * * * aws s3 sync /backups/olcan-compass/ s3://olcan-backups/database/ --delete
```

---

## Restore from Backup

### Test Restore (Recommended Monthly)

1. **Create test database:**
   ```bash
   psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE olcan_test_restore;"
   ```

2. **Restore backup:**
   ```bash
   gunzip -c olcan_compass_20260413_020000.sql.gz | psql -h 127.0.0.1 -U olcan_app -d olcan_test_restore
   ```

3. **Verify data:**
   ```bash
   psql -h 127.0.0.1 -U olcan_app -d olcan_test_restore -c "SELECT COUNT(*) FROM users;"
   ```

4. **Drop test database:**
   ```bash
   psql -h 127.0.0.1 -U postgres -c "DROP DATABASE olcan_test_restore;"
   ```

### Production Restore

**⚠️ WARNING: This will replace all current data!**

1. **Notify users** (maintenance mode)

2. **Backup current database** (safety net):
   ```bash
   ./scripts/backup_database.sh
   ```

3. **Stop application:**
   ```bash
   docker compose down
   # Or stop your deployment
   ```

4. **Drop and recreate database:**
   ```bash
   psql -h 127.0.0.1 -U postgres
   DROP DATABASE olcan_production;
   CREATE DATABASE olcan_production;
   GRANT ALL PRIVILEGES ON DATABASE olcan_production TO olcan_app;
   \q
   ```

5. **Restore from backup:**
   ```bash
   gunzip -c /backups/olcan-compass/olcan_compass_20260413_020000.sql.gz | \
     psql -h 127.0.0.1 -U olcan_app -d olcan_production
   ```

6. **Run migrations (if needed):**
   ```bash
   cd apps/api-core-v2.5
   alembic upgrade head
   ```

7. **Restart application:**
   ```bash
   docker compose up -d
   ```

8. **Verify:**
   ```bash
   # Check health endpoint
   curl http://localhost:8000/api/health
   
   # Verify user count
   psql -h 127.0.0.1 -U olcan_app -d olcan_production -c "SELECT COUNT(*) FROM users;"
   ```

9. **Notify users** (maintenance complete)

---

## Point-in-Time Recovery (Advanced)

For production, consider enabling PostgreSQL WAL archiving:

### Enable WAL Archiving

1. **Update postgresql.conf:**
   ```conf
   wal_level = replica
   archive_mode = on
   archive_command = 'cp %p /backups/wal/%f'
   ```

2. **Restart PostgreSQL:**
   ```bash
   systemctl restart postgresql
   ```

3. **Restore to specific time:**
   ```bash
   # Stop PostgreSQL
   systemctl stop postgresql
   
   # Restore base backup
   gunzip -c base_backup.sql.gz | psql -U postgres -d olcan_production
   
   # Create recovery signal
   touch /var/lib/postgresql/data/recovery.signal
   
   # Set recovery target
   echo "restore_command = 'cp /backups/wal/%f %p'" >> /var/lib/postgresql/data/postgresql.conf
   echo "recovery_target_time = '2026-04-13 14:30:00'" >> /var/lib/postgresql/data/postgresql.conf
   
   # Start PostgreSQL (will replay WAL to target time)
   systemctl start postgresql
   ```

---

## Monitoring Backups

### Health Check Script

```bash
#!/bin/bash
# Check if backup ran today

BACKUP_DIR="/backups/olcan-compass"
TODAY=$(date +%Y%m%d)

if ls ${BACKUP_DIR}/olcan_compass_${TODAY}*.sql.gz 1> /dev/null 2>&1; then
    echo "✅ Backup completed today"
    exit 0
else
    echo "❌ No backup found for today!"
    # Send alert (email, Slack, PagerDuty)
    exit 1
fi
```

### Add to Monitoring

```bash
# Check backup status daily at 8 AM
0 8 * * * /path/to/check_backup.sh && echo "Backup OK" || echo "BACKUP FAILED - ALERT!"
```

---

## Backup Verification Checklist

Monthly verification:

- [ ] Automated backups running (check cron logs)
- [ ] Backup files exist and are > 0 bytes
- [ ] Backup integrity verified (gzip -t)
- [ ] Test restore completed successfully
- [ ] Remote backup sync working
- [ ] Retention policy enforced (old files deleted)
- [ ] Backup size trending (alert if unusual changes)

---

## Disaster Recovery Plan

### Scenario 1: Database Corruption

1. Stop application
2. Restore from latest backup
3. Run migrations
4. Restart application
5. Verify data integrity

### Scenario 2: Accidental Data Deletion

1. Stop application
2. Restore from backup before deletion
3. OR use point-in-time recovery
4. Verify restored data
5. Restart application

### Scenario 3: Complete Server Failure

1. Provision new server
2. Install PostgreSQL
3. Restore from remote backup (S3/GCS)
4. Configure application
5. Update DNS/load balancer
6. Verify everything working

---

## Contact & Escalation

- **Database Admin:** [contact]
- **DevOps:** [contact]
- **Emergency:** [phone]

---

**Last Updated:** April 13, 2026  
**Next Review:** May 13, 2026

#!/usr/bin/env bash
# ============================================================
# La Plume Artisanale ERP — PostgreSQL backup script
# Dumps the OVH CloudDB to /backups and keeps the last 30.
# Usage: /path/to/backup-db.sh
# Recommended cron (daily 02:00):
#   0 2 * * * /opt/laplume/deploy/scripts/backup-db.sh >> /var/log/laplume-backup.log 2>&1
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="${ENV_FILE:-$PROJECT_ROOT/.env}"

if [[ -f "$ENV_FILE" ]]; then
    # shellcheck disable=SC1090
    set -a; source "$ENV_FILE"; set +a
else
    echo "[$(date -Iseconds)] ERROR: .env not found at $ENV_FILE" >&2
    exit 1
fi

: "${DB_HOST:?DB_HOST missing}"
: "${DB_PORT:=5432}"
: "${DB_NAME:?DB_NAME missing}"
: "${DB_USER:?DB_USER missing}"
: "${DB_PASSWORD:?DB_PASSWORD missing}"

BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
RETENTION="${BACKUP_RETENTION:-30}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$BACKUP_DIR/laplume-${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date -Iseconds)] Backing up ${DB_NAME}@${DB_HOST} → ${FILE}"

export PGPASSWORD="$DB_PASSWORD"

# Use dockerized pg_dump so no host-side postgres client is required.
docker run --rm \
    -e PGPASSWORD="$DB_PASSWORD" \
    -v "$BACKUP_DIR":/backups \
    postgres:16-alpine \
    pg_dump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --format=plain \
        --no-owner --no-privileges \
    | gzip -9 > "$FILE"

unset PGPASSWORD

SIZE=$(du -h "$FILE" | cut -f1)
echo "[$(date -Iseconds)] Backup OK (${SIZE})"

# Retention: keep newest N, delete the rest.
cd "$BACKUP_DIR"
ls -1t laplume-*.sql.gz 2>/dev/null | tail -n +$((RETENTION + 1)) | xargs -r rm -f --

REMAINING=$(ls -1 laplume-*.sql.gz 2>/dev/null | wc -l)
echo "[$(date -Iseconds)] Retention applied — ${REMAINING} backup(s) kept (max ${RETENTION})"

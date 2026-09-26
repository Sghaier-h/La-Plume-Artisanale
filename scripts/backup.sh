#!/bin/bash
# =====================================================================
# scripts/backup.sh
#
# Backup zero-perte pour ERP La Plume Artisanale.
#
# - pg_dump du DB (retry 3x en cas d'echec transitoire)
# - Compression zstd si dispo, sinon gzip
# - Checksum SHA-256 du dump (detection corruption)
# - Backup fichiers /var/www/fouta-erp
# - Genere /var/backups/fouta-erp/last-backup-restore.sh qui restaure
#   le dernier dump sans autre interaction (utilise par deploy-safe.sh)
# - Logs dans /var/log/fouta-backup.log avec rotation basique (garde 7)
# - Nettoyage : garde 7 jours de backups
#
# Variables surchargables :
#   BACKUP_DIR   (defaut /var/backups/fouta-erp)
#   DB_NAME      (defaut fouta_erp)
#   DB_USER      (defaut fouta_user)
#   DB_HOST      (optionnel, propage a pg_dump/psql via -h)
#   LOG_FILE     (defaut /var/log/fouta-backup.log)
#   WWW_ROOT     (defaut /var/www/fouta-erp)
# =====================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/fouta-erp}"
DB_NAME="${DB_NAME:-fouta_erp}"
DB_USER="${DB_USER:-fouta_user}"
DB_HOST="${DB_HOST:-}"
LOG_FILE="${LOG_FILE:-/var/log/fouta-backup.log}"
WWW_ROOT="${WWW_ROOT:-/var/www/fouta-erp}"
KEEP_DAYS="${KEEP_DAYS:-7}"

DATE="$(date +%Y%m%d_%H%M%S)"

# ---------------------------------------------------------------------
# Logger : ecrit sur stdout + LOG_FILE (si accessible)
# ---------------------------------------------------------------------
mkdir -p "$BACKUP_DIR"
touch "$LOG_FILE" 2>/dev/null || LOG_FILE="$BACKUP_DIR/backup.log"

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
  echo "$msg" | tee -a "$LOG_FILE"
}

# Rotation basique : conserve les 7 derniers logs de plus de 5 Mo
rotate_log() {
  local size_mb
  if [ -f "$LOG_FILE" ]; then
    size_mb=$(du -m "$LOG_FILE" 2>/dev/null | awk '{print $1}')
    if [ "${size_mb:-0}" -gt 5 ]; then
      mv "$LOG_FILE" "${LOG_FILE}.$(date +%Y%m%d_%H%M%S)"
      find "$(dirname "$LOG_FILE")" -maxdepth 1 -name "$(basename "$LOG_FILE").*" \
        -type f -mtime +7 -delete 2>/dev/null || true
    fi
  fi
}
rotate_log

log "== BACKUP ERP La Plume Artisanale =="
log "Dir=$BACKUP_DIR db=$DB_NAME user=$DB_USER host=${DB_HOST:-local}"

# ---------------------------------------------------------------------
# Detection compresseur
# ---------------------------------------------------------------------
if command -v zstd >/dev/null 2>&1; then
  COMPRESS_BIN="zstd"
  COMPRESS_EXT="zst"
  COMPRESS_CMD=(zstd -T0 -19 --rm)         # -T0 = auto threads
  DECOMPRESS_CMD=(zstd -d)
else
  COMPRESS_BIN="gzip"
  COMPRESS_EXT="gz"
  COMPRESS_CMD=(gzip -9)
  DECOMPRESS_CMD=(gunzip)
fi
log "Compresseur : $COMPRESS_BIN"

DUMP_RAW="$BACKUP_DIR/db_${DATE}.sql"
DUMP_COMP="${DUMP_RAW}.${COMPRESS_EXT}"
FILES_ARCH="$BACKUP_DIR/files_${DATE}.tar.gz"

# ---------------------------------------------------------------------
# pg_dump avec retry
# ---------------------------------------------------------------------
run_pg_dump() {
  local attempt=$1
  log "pg_dump tentative $attempt..."
  local hostopt=()
  [ -n "$DB_HOST" ] && hostopt=(-h "$DB_HOST")
  # --format=plain reste lisible + compressible ; on veut pouvoir psql -f
  pg_dump "${hostopt[@]}" -U "$DB_USER" \
    --no-owner --no-privileges \
    --format=plain \
    "$DB_NAME" > "$DUMP_RAW"
}

BACKUP_OK=0
for i in 1 2 3; do
  if run_pg_dump "$i"; then
    BACKUP_OK=1
    break
  else
    log "pg_dump attempt $i FAILED (exit=$?), retry in $((i*5))s..."
    sleep $((i * 5))
  fi
done

if [ "$BACKUP_OK" -ne 1 ]; then
  log "ERREUR: pg_dump a echoue apres 3 tentatives"
  exit 1
fi

DUMP_SIZE=$(stat -c%s "$DUMP_RAW" 2>/dev/null || stat -f%z "$DUMP_RAW")
log "Dump brut : $DUMP_RAW ($DUMP_SIZE bytes)"

# ---------------------------------------------------------------------
# Checksum SHA-256 AVANT compression
# ---------------------------------------------------------------------
CHECKSUM="$(sha256sum "$DUMP_RAW" | awk '{print $1}')"
echo "$CHECKSUM  $(basename "$DUMP_RAW")" > "${DUMP_RAW}.sha256"
log "SHA256 dump : $CHECKSUM"

# ---------------------------------------------------------------------
# Compression (zstd --rm supprime le raw, gzip aussi par defaut)
# ---------------------------------------------------------------------
if [ "$COMPRESS_BIN" = "zstd" ]; then
  "${COMPRESS_CMD[@]}" "$DUMP_RAW" -o "$DUMP_COMP"
else
  "${COMPRESS_CMD[@]}" "$DUMP_RAW"   # produit ${DUMP_RAW}.gz
fi
log "Dump compresse : $DUMP_COMP"

# Checksum du compresse aussi (pour transfert reseau)
sha256sum "$DUMP_COMP" | awk '{print $1"  "$2}' > "${DUMP_COMP}.sha256"

# ---------------------------------------------------------------------
# Backup fichiers (uploads, config /var/www)
# ---------------------------------------------------------------------
if [ -d "$WWW_ROOT" ]; then
  log "Archive fichiers : $WWW_ROOT -> $FILES_ARCH"
  tar -czf "$FILES_ARCH" "$WWW_ROOT" 2>/dev/null || \
    log "AVERTISSEMENT: tar $WWW_ROOT a rencontre des erreurs (permissions ?)"
else
  log "WWW_ROOT absent, skip archive fichiers."
fi

# ---------------------------------------------------------------------
# Genere le helper restore-last-backup.sh
# Ce script est appele par scripts/deploy-safe.sh en cas d'echec.
# Idempotent : ecrase la version precedente a chaque backup.
# ---------------------------------------------------------------------
RESTORE_HELPER="$BACKUP_DIR/last-backup-restore.sh"
cat > "$RESTORE_HELPER" <<EOF
#!/bin/bash
# ====================================================================
# Genere automatiquement par scripts/backup.sh le $(date -Iseconds)
# Restaure le dump : $DUMP_COMP
# ====================================================================
set -euo pipefail

BACKUP_DIR="$BACKUP_DIR"
DUMP_COMP="$DUMP_COMP"
DB_NAME="$DB_NAME"
DB_USER="$DB_USER"
DB_HOST="$DB_HOST"
EXPECTED_SHA="$CHECKSUM"
COMPRESS_BIN="$COMPRESS_BIN"

hostopt=()
[ -n "\$DB_HOST" ] && hostopt=(-h "\$DB_HOST")

echo "== RESTORE DERNIER BACKUP =="
echo "Fichier : \$DUMP_COMP"

if [ ! -f "\$DUMP_COMP" ]; then
  echo "ERREUR: dump introuvable" >&2
  exit 1
fi

TMP="\$(mktemp --suffix=.sql)"
trap 'rm -f "\$TMP"' EXIT

if [ "\$COMPRESS_BIN" = "zstd" ]; then
  zstd -d --stdout "\$DUMP_COMP" > "\$TMP"
else
  gunzip -c "\$DUMP_COMP" > "\$TMP"
fi

# Verifie checksum avant restore
ACTUAL_SHA="\$(sha256sum "\$TMP" | awk '{print \$1}')"
if [ "\$ACTUAL_SHA" != "\$EXPECTED_SHA" ]; then
  echo "ERREUR: SHA256 mismatch !"
  echo "  attendu = \$EXPECTED_SHA"
  echo "  obtenu  = \$ACTUAL_SHA"
  echo "  DUMP CORROMPU -- ne pas restaurer" >&2
  exit 2
fi

echo "SHA256 OK, restauration psql..."
psql "\${hostopt[@]}" -U "\$DB_USER" -d "\$DB_NAME" -v ON_ERROR_STOP=1 -f "\$TMP"
echo "== RESTORE TERMINE =="
EOF
chmod +x "$RESTORE_HELPER"
log "Helper restore : $RESTORE_HELPER"

# ---------------------------------------------------------------------
# Nettoyage retention
# ---------------------------------------------------------------------
log "Nettoyage backups > $KEEP_DAYS jours..."
find "$BACKUP_DIR" -maxdepth 1 -name "db_*.sql.*"    -mtime +"$KEEP_DAYS" -delete 2>/dev/null || true
find "$BACKUP_DIR" -maxdepth 1 -name "db_*.sha256"   -mtime +"$KEEP_DAYS" -delete 2>/dev/null || true
find "$BACKUP_DIR" -maxdepth 1 -name "files_*.tar.gz" -mtime +"$KEEP_DAYS" -delete 2>/dev/null || true

log "== BACKUP TERMINE =="
log "  DB    : $DUMP_COMP"
log "  SHA   : ${DUMP_COMP}.sha256"
log "  Files : $FILES_ARCH"
log "  Restore rapide : bash $RESTORE_HELPER"

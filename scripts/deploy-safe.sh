#!/bin/bash
# =====================================================================
# scripts/deploy-safe.sh
#
# Deploiement zero-perte pour ERP La Plume Artisanale.
# Se lance sur le VPS OVH (137.74.40.191, fabrication.laplume-artisanale.tn).
#
# Etapes :
#   1. Backup DB avant tout (fail-fast si le backup echoue)
#   2. Git pull main
#   3. Install deps + build frontend
#   4. Migrations DB (avec --backup-first, deja fait donc redondant mais sur)
#   5. Restart PM2 backend
#   6. Deploy frontend build -> Nginx docroot
#   7. Reload Nginx
#   8. Healthcheck HTTPS ; rollback DB si KO
# =====================================================================

set -euo pipefail

# ---------------------------------------------------------------------
# Config (surchargables via env)
# ---------------------------------------------------------------------
REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
BACKUP_SCRIPT="${BACKUP_SCRIPT:-$REPO_ROOT/scripts/backup.sh}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/fouta-erp}"
FRONTEND_DOCROOT="${FRONTEND_DOCROOT:-/var/www/fouta-erp}"
PM2_APP="${PM2_APP:-fouta-backend}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-https://fabrication.laplume-artisanale.tn/api/health}"

cd "$REPO_ROOT"

echo ""
echo "===================================================================="
echo "  Deploiement ERP La Plume Artisanale (safe mode)"
echo "  Debut : $(date -Iseconds)"
echo "===================================================================="
echo ""

# ---------------------------------------------------------------------
# 1. Backup DB
# ---------------------------------------------------------------------
echo "[1/8] Backup DB ..."
if ! bash "$BACKUP_SCRIPT"; then
  echo "[FATAL] Backup DB echoue -- deploiement abandonne" >&2
  exit 1
fi

# ---------------------------------------------------------------------
# 2. Pull code
# ---------------------------------------------------------------------
echo ""
echo "[2/8] Pull latest main ..."
git fetch origin
git checkout main
git pull --ff-only origin main
CURRENT_SHA="$(git rev-parse --short HEAD)"
echo "     HEAD = $CURRENT_SHA"

# ---------------------------------------------------------------------
# 3. Install deps + build
# ---------------------------------------------------------------------
echo ""
echo "[3/8] Install dependances backend (production) ..."
(cd backend && npm ci --production)

echo ""
echo "[3/8] Install dependances frontend + build ..."
(cd frontend && npm ci && npm run build)

# ---------------------------------------------------------------------
# 4. Migrations DB (--backup-first -> re-backup safety net)
# ---------------------------------------------------------------------
echo ""
echo "[4/8] Migrations DB ..."
if ! (cd backend && node src/database/migrate.js --backup-first); then
  echo "[FAIL] Migration echouee -- restauration automatique du backup"
  if [ -x "$BACKUP_DIR/last-backup-restore.sh" ]; then
    bash "$BACKUP_DIR/last-backup-restore.sh" || \
      echo "[FATAL] Restore automatique en erreur -- intervention manuelle requise" >&2
  else
    echo "[FATAL] Helper de restore introuvable : $BACKUP_DIR/last-backup-restore.sh" >&2
  fi
  exit 2
fi

# ---------------------------------------------------------------------
# 5. Restart PM2
# ---------------------------------------------------------------------
echo ""
echo "[5/8] Restart backend PM2 ($PM2_APP) ..."
pm2 restart "$PM2_APP" --update-env

# ---------------------------------------------------------------------
# 6. Copie frontend
# ---------------------------------------------------------------------
echo ""
echo "[6/8] Deploiement frontend -> $FRONTEND_DOCROOT ..."
sudo rsync -av --delete frontend/build/ "$FRONTEND_DOCROOT/"

# ---------------------------------------------------------------------
# 7. Reload Nginx
# ---------------------------------------------------------------------
echo ""
echo "[7/8] Reload Nginx ..."
sudo nginx -t
sudo systemctl reload nginx

# ---------------------------------------------------------------------
# 8. Healthcheck
# ---------------------------------------------------------------------
echo ""
echo "[8/8] Healthcheck $HEALTHCHECK_URL ..."
sleep 3
HTTP_CODE="$(curl -s -o /tmp/healthbody -w '%{http_code}' "$HEALTHCHECK_URL" || echo '000')"
if [ "$HTTP_CODE" = "200" ]; then
  echo "     HTTP 200 -- healthcheck OK"
else
  echo "[WARN] Healthcheck KO (HTTP=$HTTP_CODE), redemarrage PM2 puis tag deploiement partiel."
  pm2 restart "$PM2_APP" --update-env
  cat /tmp/healthbody | head -20 || true
  echo "[FATAL] Healthcheck a echoue -- investiguez pm2 logs $PM2_APP" >&2
  exit 3
fi

echo ""
echo "===================================================================="
echo "  Deploiement OK  --  HEAD=$CURRENT_SHA  --  $(date -Iseconds)"
echo "===================================================================="

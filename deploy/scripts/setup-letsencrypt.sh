#!/usr/bin/env bash
# ============================================================
# La Plume Artisanale ERP — Let's Encrypt bootstrap
# Installs certbot, obtains a cert for the production domain,
# and installs an auto-renew cron job that reloads nginx.
# Run as root on the VPS: sudo bash setup-letsencrypt.sh
# ============================================================
set -euo pipefail

DOMAIN="${DOMAIN:-fabrication.laplume-artisanale.tn}"
EMAIL="${LETSENCRYPT_EMAIL:-admin@laplume-artisanale.tn}"
WEBROOT="${WEBROOT:-/var/www/certbot}"
COMPOSE_DIR="${COMPOSE_DIR:-/opt/laplume}"

if [[ $EUID -ne 0 ]]; then
    echo "ERROR: run as root (sudo)." >&2
    exit 1
fi

echo "[1/5] Installing certbot..."
apt-get update -y
apt-get install -y certbot

echo "[2/5] Preparing webroot ${WEBROOT}..."
mkdir -p "${WEBROOT}"
chown -R www-data:www-data "${WEBROOT}" || true

echo "[3/5] Requesting certificate for ${DOMAIN}..."
# HTTP-01 challenge served by the nginx container from ${WEBROOT}.
# Make sure port 80 is open and DNS points to this VPS before running.
certbot certonly \
    --webroot -w "${WEBROOT}" \
    --non-interactive --agree-tos \
    --email "${EMAIL}" \
    -d "${DOMAIN}" \
    --keep-until-expiring \
    --preferred-challenges http

echo "[4/5] Reloading nginx container..."
if command -v docker >/dev/null 2>&1 && [[ -f "${COMPOSE_DIR}/docker-compose.yml" ]]; then
    (cd "${COMPOSE_DIR}" && docker compose exec -T nginx nginx -s reload) || true
fi

echo "[5/5] Installing auto-renew cron (twice daily, standard certbot practice)..."
CRON_FILE="/etc/cron.d/laplume-certbot-renew"
cat > "${CRON_FILE}" <<EOF
# La Plume Artisanale — Let's Encrypt auto-renew
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
0 3,15 * * * root certbot renew --quiet --webroot -w ${WEBROOT} --deploy-hook 'cd ${COMPOSE_DIR} && docker compose exec -T nginx nginx -s reload'
EOF
chmod 0644 "${CRON_FILE}"

echo "Done. Certificate stored under /etc/letsencrypt/live/${DOMAIN}/"
echo "Auto-renew cron installed at ${CRON_FILE}."

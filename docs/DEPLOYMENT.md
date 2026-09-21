# Production Deployment — La Plume Artisanale ERP

End-to-end guide for deploying the ERP on an Ubuntu 22.04 VPS with Docker
Compose, Nginx reverse proxy, Let's Encrypt TLS, and OVH CloudDB PostgreSQL.

Domain used throughout: `fabrication.laplume-artisanale.tn`.

---

## 1. Prerequisites

- Ubuntu 22.04 LTS VPS (2 vCPU / 4 GB RAM minimum), root or sudo access
- Public IPv4 (and preferably IPv6) with ports **80** and **443** open
- DNS record `fabrication.laplume-artisanale.tn` → VPS IP (A / AAAA)
- OVH CloudDB PostgreSQL 16 instance reachable from the VPS
- GitHub account with access to this repo (for `git pull` / GHCR)

Install Docker Engine + Compose plugin:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"     # then log out / back in
docker compose version              # verify (v2+)
```

---

## 2. Clone the repo & configure `.env`

```bash
sudo mkdir -p /opt/laplume && sudo chown "$USER":"$USER" /opt/laplume
git clone https://github.com/<owner>/La-Plume-Artisanale.git /opt/laplume
cd /opt/laplume
cp .env.example .env
$EDITOR .env
```

Fill every value in `.env`. Generate strong secrets:

```bash
openssl rand -hex 48   # JWT_SECRET
openssl rand -hex 32   # SESSION_SECRET
```

Frontend build vars (`REACT_APP_API_URL`, `REACT_APP_SOCKET_URL`) must point to
the public HTTPS URL; they are baked into the image at build time.

---

## 3. First boot (HTTP only, to solve ACME challenge)

Temporarily comment out the HTTPS `server { listen 443; ... }` block in
`deploy/nginx/nginx.conf` (or simply run the HTTP profile) so nginx starts
without a certificate. Then:

```bash
docker compose build
docker compose up -d
docker compose ps
```

Visit `http://fabrication.laplume-artisanale.tn/healthz` — should return `ok`.

---

## 4. Obtain the TLS certificate

```bash
sudo DOMAIN=fabrication.laplume-artisanale.tn \
     LETSENCRYPT_EMAIL=admin@laplume-artisanale.tn \
     COMPOSE_DIR=/opt/laplume \
     bash /opt/laplume/deploy/scripts/setup-letsencrypt.sh
```

The script installs certbot, requests a certificate via the nginx webroot
(`/var/www/certbot`), and drops a twice-daily renew cron
(`/etc/cron.d/laplume-certbot-renew`) that reloads the nginx container after
each renewal.

Re-enable the `443` server block if you commented it in step 3, then:

```bash
docker compose restart nginx
```

Visit `https://fabrication.laplume-artisanale.tn/` — the SPA should load.

---

## 5. Database initialisation (first time only)

Run migrations / seed against the OVH CloudDB:

```bash
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:seed        # optional
```

Verify:

```bash
curl -k https://fabrication.laplume-artisanale.tn/api/dashboard/kpis
```

---

## 6. Daily backups (cron)

```bash
chmod +x /opt/laplume/deploy/scripts/backup-db.sh
sudo tee /etc/cron.d/laplume-backup >/dev/null <<'EOF'
# La Plume Artisanale — DB backup every day at 02:00
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
0 2 * * * root /opt/laplume/deploy/scripts/backup-db.sh >> /var/log/laplume-backup.log 2>&1
EOF
```

Backups land in `/opt/laplume/backups/laplume-YYYYMMDD-HHMMSS.sql.gz`.
Retention (30 by default) is set via `BACKUP_RETENTION` in `.env`.

Restore example:

```bash
gunzip -c /opt/laplume/backups/laplume-YYYYMMDD-HHMMSS.sql.gz \
  | docker run --rm -i -e PGPASSWORD="$DB_PASSWORD" postgres:16-alpine \
    psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"
```

---

## 7. CI/CD (GitHub Actions)

`.github/workflows/deploy.yml` builds all three images on `push` to `main`,
pushes them to **ghcr.io**, then SSHes into the VPS to `docker compose pull &&
up -d`.

Required GitHub repo secrets:

| Secret                  | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `VPS_HOST`              | VPS hostname/IP                                |
| `VPS_USER`              | SSH username (usually `deploy`)                |
| `VPS_PORT`              | SSH port (usually `22`)                        |
| `VPS_SSH_KEY`           | Private SSH key (added to VPS `authorized_keys`) |
| `GHCR_PULL_USER`        | GHCR username with `read:packages`             |
| `GHCR_PULL_TOKEN`       | GHCR PAT with `read:packages`                  |
| `REACT_APP_API_URL`     | e.g. `https://fabrication.laplume-artisanale.tn/api` |
| `REACT_APP_SOCKET_URL`  | e.g. `https://fabrication.laplume-artisanale.tn` |

To use registry images instead of local builds, swap each service's `build:`
block for `image: ghcr.io/<owner>/laplume-<service>:latest` in
`docker-compose.yml`.

---

## 8. Operations cheat sheet

```bash
# Status / logs
docker compose ps
docker compose logs -f backend
docker compose logs -f --tail=200 nginx

# Restart one service
docker compose restart backend

# Rebuild after code change (local, no CI)
docker compose build backend && docker compose up -d backend

# Zero-downtime frontend swap
docker compose build frontend && docker compose up -d --no-deps frontend

# Update TLS cert manually
sudo certbot renew --force-renewal
docker compose exec nginx nginx -s reload

# Prune old images
docker image prune -f
```

**Log locations**

- Backend app: `/opt/laplume/logs/*.log` (bind-mounted from container)
- Nginx access/error: `/opt/laplume/logs/nginx/`
- Backup runs: `/var/log/laplume-backup.log`
- Certbot: `/var/log/letsencrypt/`

---

## 9. Troubleshooting

| Symptom                                                | Check                                                                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Nginx fails to start with "cannot load certificate"    | Cert not yet issued — comment 443 block, run step 4, then restart.                                           |
| Backend healthcheck `unhealthy`                        | `docker compose logs backend`; verify `DB_HOST` reachable and `DB_SSL=true`; hit `/api/dashboard/kpis` from inside container. |
| Socket.IO disconnects immediately                      | Confirm nginx `/socket.io/` block has `Upgrade`/`Connection: upgrade` headers (it does by default).          |
| 502 on `/api/*`                                        | Backend container down or unhealthy; check `docker compose ps` and backend logs.                             |
| Let's Encrypt renew fails                              | Port 80 must remain open and reach the nginx container; test with `curl -I http://<domain>/.well-known/acme-challenge/test`. |
| Frontend still shows old build                         | Frontend env vars are baked at build time — rebuild the image after changing `REACT_APP_*`.                  |
| CORS blocked in browser                                | `CORS_ORIGIN` in `.env` must match the exact scheme+host the browser uses.                                   |

---

## 10. Rollback

```bash
cd /opt/laplume
docker compose pull                          # (no-op if pinned)
# Roll back to a previous image tag
docker tag ghcr.io/<owner>/laplume-backend:<sha> ghcr.io/<owner>/laplume-backend:latest
docker compose up -d backend
```

Or `git checkout <previous-tag>` and `docker compose up -d --build`.

#!/bin/bash

# Script de déploiement complètement automatisé
# Toutes les valeurs sont pré-configurées

set -e

echo "🚀 Déploiement Automatique - La Plume Artisanale"
echo "================================================="

# Configuration
DOMAIN="fabrication.laplume-artisanale.tn"
IP="145.239.37.162"
GIT_REPO="https://github.com/Sghaier-h/La-Plume-Artisanale.git"
PROJECT_DIR="/var/www/fouta-erp"
DB_NAME="fouta_erp"
DB_USER="fouta_user"
DB_PASSWORD="FoutaERP2024!Secure"  # Mot de passe fort pour PostgreSQL
JWT_SECRET=$(openssl rand -hex 32)

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# 1. Mise à jour
info "Mise à jour du système..."
sudo apt update -qq
sudo apt upgrade -y -qq

# 2. Node.js
info "Installation Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - > /dev/null
    sudo apt install -y nodejs > /dev/null
fi
info "Node.js $(node --version)"

# 3. PostgreSQL
info "Installation PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib > /dev/null
    sudo systemctl start postgresql
    sudo systemctl enable postgresql > /dev/null
fi

# 4. Base de données
info "Création base de données..."
sudo -u postgres psql << EOF > /dev/null 2>&1
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF
info "Base de données créée"

# 5. Redis
info "Installation Redis..."
sudo apt install -y redis-server > /dev/null
sudo systemctl start redis-server
sudo systemctl enable redis-server > /dev/null

# 6. Nginx
info "Installation Nginx..."
sudo apt install -y nginx > /dev/null
sudo systemctl start nginx
sudo systemctl enable nginx > /dev/null

# 7. PM2
info "Installation PM2..."
sudo npm install -g pm2 > /dev/null

# 8. Git
info "Installation Git..."
sudo apt install -y git > /dev/null

# 9. Cloner projet
info "Clonage du projet..."
if [ -d "$PROJECT_DIR" ]; then
    sudo rm -rf $PROJECT_DIR
fi
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR
git clone -q $GIT_REPO $PROJECT_DIR
cd $PROJECT_DIR

# 10. Configuration .env
info "Configuration .env..."
cat > backend/.env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://$DOMAIN
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE=7d
API_URL=https://$DOMAIN
API_VERSION=v1
REDIS_HOST=localhost
REDIS_PORT=6379
EOF

# 11. Dépendances
info "Installation dépendances..."
cd backend
npm install --production --silent

# 12. Base de données
info "Initialisation base de données..."
cd ../database
export PGPASSWORD=$DB_PASSWORD
psql -U $DB_USER -d $DB_NAME -f 01_base_et_securite.sql > /dev/null 2>&1
psql -U $DB_USER -d $DB_NAME -f 02_production_et_qualite.sql > /dev/null 2>&1
psql -U $DB_USER -d $DB_NAME -f 03_flux_et_tracabilite.sql > /dev/null 2>&1
[ -f "04_mobile_devices.sql" ] && psql -U $DB_USER -d $DB_NAME -f 04_mobile_devices.sql > /dev/null 2>&1
unset PGPASSWORD
info "Base de données initialisée"

# 13. Nginx
info "Configuration Nginx..."
sudo tee /etc/nginx/sites-available/fouta-erp > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN $IP;
    return 301 https://$DOMAIN\$request_uri;
}
server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/fouta-erp /etc/nginx/sites-enabled/
sudo nginx -t > /dev/null 2>&1

# 14. SSL
info "Installation SSL..."
sudo apt install -y certbot python3-certbot-nginx > /dev/null
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect > /dev/null 2>&1 || warn "SSL non installé (domaine peut-être non configuré)"

# 15. PM2
info "Démarrage application..."
cd $PROJECT_DIR/backend
pm2 start src/server.js --name fouta-api --silent
pm2 save --silent
pm2 startup systemd -u $USER --hp /home/$USER > /tmp/pm2-startup.sh 2>/dev/null || true

# 16. Firewall
info "Configuration firewall..."
sudo ufw allow 22/tcp > /dev/null 2>&1
sudo ufw allow 80/tcp > /dev/null 2>&1
sudo ufw allow 443/tcp > /dev/null 2>&1
sudo ufw --force enable > /dev/null 2>&1 || true

# 17. Backup
info "Configuration backups..."
sudo mkdir -p /var/backups/fouta-erp
sudo tee /usr/local/bin/backup-fouta-erp.sh > /dev/null << 'BACKUP_EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/fouta-erp"
DATE=$(date +%Y%m%d_%H%M%S)
export PGPASSWORD="FoutaERP2024!Secure"
pg_dump -U fouta_user fouta_erp > $BACKUP_DIR/db_$DATE.sql
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/fouta-erp
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
BACKUP_EOF
sudo chmod +x /usr/local/bin/backup-fouta-erp.sh
(crontab -l 2>/dev/null | grep -v backup-fouta-erp; echo "0 2 * * * /usr/local/bin/backup-fouta-erp.sh") | crontab -

echo ""
echo "================================================="
info "✅ Installation terminée !"
echo ""
echo "📋 URLs :"
echo "   - API: https://$DOMAIN"
echo "   - IP: http://$IP:5000"
echo ""
echo "🔍 Vérification :"
echo "   curl https://$DOMAIN/health"
echo "   pm2 status"
echo ""
echo "🔐 Mot de passe PostgreSQL: $DB_PASSWORD"
echo "   (Sauvegardez ce mot de passe !)"
echo ""


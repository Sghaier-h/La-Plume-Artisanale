#!/bin/bash

# Script de déploiement automatisé pour La Plume Artisanale
# Usage: bash SCRIPT_DEPLOIEMENT.sh

set -e

echo "🚀 Déploiement ERP ALL BY FOUTA - La Plume Artisanale"
echo "======================================================"

# Variables
DOMAIN="fabrication.laplume-artisanale.tn"
IP="145.239.37.162"
GIT_REPO="https://github.com/Sghaier-h/La-Plume-Artisanale.git"
PROJECT_DIR="/var/www/fouta-erp"
DB_NAME="fouta_erp"
DB_USER="fouta_user"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Mise à jour du système
info "Mise à jour du système..."
sudo apt update
sudo apt upgrade -y

# 2. Installation Node.js 18
info "Installation de Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
else
    warn "Node.js est déjà installé"
fi

info "Node.js version: $(node --version)"
info "npm version: $(npm --version)"

# 3. Installation PostgreSQL
info "Installation de PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
else
    warn "PostgreSQL est déjà installé"
fi

# 4. Création de la base de données
info "Création de la base de données..."
read -sp "Mot de passe PostgreSQL pour fouta_user (choisissez un mot de passe fort): " DB_PASSWORD
echo

sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF

info "Base de données créée"

# 5. Installation Redis
info "Installation de Redis..."
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 6. Installation Nginx
info "Installation de Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 7. Installation PM2
info "Installation de PM2..."
sudo npm install -g pm2

# 8. Installation Git
info "Installation de Git..."
sudo apt install -y git

# 9. Cloner le projet
info "Clonage du projet depuis GitHub..."
if [ -d "$PROJECT_DIR" ]; then
    warn "Le dossier existe déjà, suppression..."
    sudo rm -rf $PROJECT_DIR
fi

sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR
git clone $GIT_REPO $PROJECT_DIR
cd $PROJECT_DIR

# 10. Configuration .env
info "Configuration de l'environnement..."
read -p "JWT Secret (appuyez sur Entrée pour générer automatiquement): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
    info "JWT Secret généré automatiquement"
fi

cat > backend/.env << EOF
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Serveur
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://$DOMAIN

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE=7d

# API
API_URL=https://$DOMAIN
API_VERSION=v1

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
EOF

info "Fichier .env créé"

# 11. Installation dépendances backend
info "Installation des dépendances backend..."
cd $PROJECT_DIR/backend
npm install --production

# 12. Initialisation base de données
info "Initialisation de la base de données..."
cd $PROJECT_DIR/database

if [ -f "01_base_et_securite.sql" ]; then
    PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -f 01_base_et_securite.sql
    PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -f 02_production_et_qualite.sql
    PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -f 03_flux_et_tracabilite.sql
    
    if [ -f "04_mobile_devices.sql" ]; then
        PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -f 04_mobile_devices.sql
    fi
    
    info "Base de données initialisée"
else
    warn "Scripts SQL non trouvés, à exécuter manuellement"
fi

# 13. Configuration Nginx
info "Configuration de Nginx..."
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
sudo nginx -t

# 14. Installation SSL
info "Installation du certificat SSL..."
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || warn "Certificat SSL non installé (domaine peut-être non configuré)"

# 15. Démarrage avec PM2
info "Démarrage de l'application..."
cd $PROJECT_DIR/backend
pm2 start src/server.js --name fouta-api
pm2 save
pm2 startup

# 16. Configuration Firewall
info "Configuration du firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable || warn "Firewall non configuré"

# 17. Création script backup
info "Création du script de backup..."
sudo mkdir -p /var/backups/fouta-erp
sudo tee /usr/local/bin/backup-fouta-erp.sh > /dev/null << 'BACKUP_EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/fouta-erp"
DATE=$(date +%Y%m%d_%H%M%S)

pg_dump -U fouta_user fouta_erp > $BACKUP_DIR/db_$DATE.sql
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/fouta-erp

find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
BACKUP_EOF

sudo chmod +x /usr/local/bin/backup-fouta-erp.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-fouta-erp.sh") | crontab -

echo ""
echo "======================================================"
info "✅ Installation terminée !"
echo ""
echo "📋 Informations importantes :"
echo "   - Application: $PROJECT_DIR"
echo "   - API: https://$DOMAIN"
echo "   - IP: http://$IP:5000"
echo "   - PM2: pm2 status"
echo "   - Logs: pm2 logs fouta-api"
echo ""
echo "🔐 Sécurité :"
echo "   - Changez le mot de passe SSH (passwd)"
echo "   - Configurez SSH avec clés"
echo "   - Vérifiez le firewall"
echo ""
echo "📊 Monitoring :"
echo "   - pm2 monit"
echo "   - pm2 logs"
echo ""
echo "🔄 Mise à jour :"
echo "   cd $PROJECT_DIR && git pull && pm2 restart fouta-api"
echo ""


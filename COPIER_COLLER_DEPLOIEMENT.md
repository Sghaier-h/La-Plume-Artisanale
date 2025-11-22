# 📋 Déploiement - Copier-Coller Direct

## ⚠️ Si le téléchargement ne fonctionne pas

Copiez-collez ce script directement sur le serveur :

---

## 🚀 Méthode 1 : Créer le fichier sur le serveur

### Étape 1 : Créer le fichier

```bash
nano deploy.sh
```

### Étape 2 : Copier-collez tout le contenu ci-dessous

```bash
#!/bin/bash
set -e

DOMAIN="fabrication.laplume-artisanale.tn"
IP="145.239.37.162"
GIT_REPO="https://github.com/Sghaier-h/La-Plume-Artisanale.git"
PROJECT_DIR="/var/www/fouta-erp"
DB_NAME="fouta_erp"
DB_USER="fouta_user"
DB_PASSWORD="FoutaERP2024!Secure"
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "changez-moi-$(date +%s)")

echo "🚀 Déploiement ERP ALL BY FOUTA"
echo "================================"

# Mise à jour
echo "📦 Mise à jour..."
sudo apt update -qq && sudo apt upgrade -y -qq

# Node.js
echo "📦 Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - > /dev/null
    sudo apt install -y nodejs > /dev/null
fi

# PostgreSQL
echo "📦 PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib > /dev/null
    sudo systemctl start postgresql
    sudo systemctl enable postgresql > /dev/null
fi

# Base de données
echo "📦 Base de données..."
sudo -u postgres psql << EOF > /dev/null 2>&1
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF

# Redis
sudo apt install -y redis-server > /dev/null
sudo systemctl start redis-server
sudo systemctl enable redis-server > /dev/null

# Nginx
sudo apt install -y nginx > /dev/null
sudo systemctl start nginx
sudo systemctl enable nginx > /dev/null

# PM2
sudo npm install -g pm2 > /dev/null

# Git
sudo apt install -y git > /dev/null

# Cloner projet
echo "📦 Clonage..."
if [ -d "$PROJECT_DIR" ]; then
    sudo rm -rf $PROJECT_DIR
fi
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR
git clone -q $GIT_REPO $PROJECT_DIR
cd $PROJECT_DIR

# Configuration .env
echo "📦 Configuration..."
cat > backend/.env << ENVEOF
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
ENVEOF

# Dépendances
cd backend
npm install --production --silent

# Base de données
cd ../database
export PGPASSWORD=$DB_PASSWORD
psql -U $DB_USER -d $DB_NAME -f 01_base_et_securite.sql > /dev/null 2>&1
psql -U $DB_USER -d $DB_NAME -f 02_production_et_qualite.sql > /dev/null 2>&1
psql -U $DB_USER -d $DB_NAME -f 03_flux_et_tracabilite.sql > /dev/null 2>&1
[ -f "04_mobile_devices.sql" ] && psql -U $DB_USER -d $DB_NAME -f 04_mobile_devices.sql > /dev/null 2>&1
unset PGPASSWORD

# Nginx
sudo tee /etc/nginx/sites-available/fouta-erp > /dev/null << NGINXEOF
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
NGINXEOF
sudo ln -sf /etc/nginx/sites-available/fouta-erp /etc/nginx/sites-enabled/
sudo nginx -t > /dev/null 2>&1

# SSL
sudo apt install -y certbot python3-certbot-nginx > /dev/null
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect > /dev/null 2>&1 || true

# PM2
cd $PROJECT_DIR/backend
pm2 start src/server.js --name fouta-api --silent
pm2 save --silent

# Firewall
sudo ufw allow 22/tcp > /dev/null 2>&1
sudo ufw allow 80/tcp > /dev/null 2>&1
sudo ufw allow 443/tcp > /dev/null 2>&1
sudo ufw --force enable > /dev/null 2>&1 || true

echo ""
echo "✅ Installation terminée !"
echo "📋 API: https://$DOMAIN"
echo "🔐 PostgreSQL: $DB_PASSWORD"
```

### Étape 3 : Sauvegarder et quitter

Dans nano :
- Appuyez sur `Ctrl + O` pour sauvegarder
- Appuyez sur `Enter` pour confirmer
- Appuyez sur `Ctrl + X` pour quitter

### Étape 4 : Rendre exécutable et exécuter

```bash
chmod +x deploy.sh
bash deploy.sh
```

---

## 🚀 Méthode 2 : Télécharger depuis GitHub

Essayez de télécharger le fichier directement :

```bash
wget https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-simple.sh
chmod +x deploy-simple.sh
bash deploy-simple.sh
```

---

## 🚀 Méthode 3 : Cloner et exécuter

```bash
# Cloner le projet
git clone https://github.com/Sghaier-h/La-Plume-Artisanale.git
cd La-Plume-Artisanale

# Exécuter le script
bash deploy-simple.sh
```

---

## ✅ Vérification

Après l'exécution :

```bash
# Tester l'API
curl https://fabrication.laplume-artisanale.tn/health

# Vérifier PM2
pm2 status

# Voir les logs
pm2 logs fouta-api
```

---

## 🆘 Si ça ne fonctionne toujours pas

Exécutez les commandes une par une manuellement. Consultez `DEPLOIEMENT_COMPLET.md` pour le guide étape par étape.


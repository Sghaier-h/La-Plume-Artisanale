#!/bin/bash
# Script de déploiement pour hébergement partagé OVH (sans sudo)

set -e

DOMAIN="fabrication.laplume-artisanale.tn"
IP="145.239.37.162"
GIT_REPO="https://github.com/Sghaier-h/La-Plume-Artisanale.git"
PROJECT_DIR="$HOME/fouta-erp"
DB_NAME="fouta_erp"
DB_USER="fouta_user"
DB_PASSWORD="FoutaERP2024!Secure"
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "changez-moi-$(date +%s)")

echo "🚀 Déploiement ERP ALL BY FOUTA - Hébergement Partagé"
echo "======================================================"
echo ""
echo "⚠️  Sur hébergement partagé, certaines installations nécessitent l'accès root."
echo "    Ce script va installer ce qui est possible sans sudo."
echo ""

# Vérifier les outils disponibles
echo "📦 Vérification des outils..."
NODE_AVAILABLE=$(command -v node 2>/dev/null || echo "")
GIT_AVAILABLE=$(command -v git 2>/dev/null || echo "")

# Node.js
if [ -z "$NODE_AVAILABLE" ]; then
    echo "❌ Node.js n'est pas installé."
    echo "   Sur hébergement partagé, Node.js doit être installé via le panneau OVH."
    echo "   Allez dans : Panneau OVH > Hébergement > Node.js"
    echo "   Installez Node.js 18 ou supérieur."
    exit 1
else
    echo "✅ Node.js : $(node --version)"
fi

# Git
if [ -z "$GIT_AVAILABLE" ]; then
    echo "❌ Git n'est pas installé."
    echo "   Git doit être activé dans le panneau OVH."
    exit 1
else
    echo "✅ Git : $(git --version)"
fi

# Cloner le projet
echo ""
echo "📦 Clonage du projet..."
if [ -d "$PROJECT_DIR" ]; then
    rm -rf $PROJECT_DIR
fi
mkdir -p $PROJECT_DIR
git clone -q $GIT_REPO $PROJECT_DIR || {
    echo "❌ Erreur lors du clonage."
    echo "   Le repository est peut-être privé."
    echo "   Utilisez : git clone https://VOTRE_TOKEN@github.com/Sghaier-h/La-Plume-Artisanale.git"
    exit 1
}
cd $PROJECT_DIR
echo "✅ Projet cloné"

# Configuration .env
echo ""
echo "📦 Configuration .env..."
mkdir -p backend
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
echo "✅ Fichier .env créé"

# Dépendances
echo ""
echo "📦 Installation dépendances..."
cd backend
npm install --production --silent
echo "✅ Dépendances installées"

# PM2 (installation locale)
echo ""
echo "📦 Installation PM2 (local)..."
npm install -g pm2 --prefix $HOME/.local 2>/dev/null || npm install pm2 --save-dev
echo "✅ PM2 installé"

# Instructions pour la suite
echo ""
echo "======================================================"
echo "✅ Installation partielle terminée !"
echo ""
echo "📋 Prochaines étapes nécessaires (avec accès root) :"
echo ""
echo "1. PostgreSQL doit être installé et configuré"
echo "   - Contactez le support OVH pour installer PostgreSQL"
echo "   - OU utilisez une base de données externe"
echo ""
echo "2. Base de données à créer :"
echo "   CREATE DATABASE $DB_NAME;"
echo "   CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
echo "   GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo ""
echo "3. Initialiser la base de données :"
echo "   cd $PROJECT_DIR/database"
echo "   psql -U $DB_USER -d $DB_NAME -f 01_base_et_securite.sql"
echo "   psql -U $DB_USER -d $DB_NAME -f 02_production_et_qualite.sql"
echo "   psql -U $DB_USER -d $DB_NAME -f 03_flux_et_tracabilite.sql"
echo "   psql -U $DB_USER -d $DB_NAME -f 04_mobile_devices.sql"
echo ""
echo "4. Démarrer l'application :"
echo "   cd $PROJECT_DIR/backend"
echo "   pm2 start src/server.js --name fouta-api"
echo "   pm2 save"
echo ""
echo "🔐 Mot de passe PostgreSQL: $DB_PASSWORD"
echo ""
echo "📋 Fichiers dans : $PROJECT_DIR"
echo ""


#!/bin/bash
# Script de déploiement final - Configuration complète avec identifiants OVH
# Usage: bash deploy-final.sh VOTRE_MOT_DE_PASSE

set -e

# Configuration PostgreSQL OVH
DB_HOST="sh131616-002.eu.clouddb.ovh.net"
DB_PORT="35392"
DB_NAME="ERP_La_Plume"
DB_USER="Aviateur"
DB_PASSWORD="$1"  # Mot de passe en argument

# Configuration serveur
DOMAIN="fabrication.laplume-artisanale.tn"
IP="145.239.37.162"
GIT_REPO="https://github.com/Sghaier-h/La-Plume-Artisanale.git"
PROJECT_DIR="$HOME/fouta-erp"

# Vérifier le mot de passe
if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Erreur : Mot de passe requis"
    echo "Usage: bash deploy-final.sh VOTRE_MOT_DE_PASSE"
    exit 1
fi

echo "🚀 Déploiement ERP ALL BY FOUTA - Configuration Finale"
echo "======================================================"
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "   Installez Node.js via le panneau OVH"
    exit 1
fi
echo "✅ Node.js : $(node --version)"

# Vérifier Git
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé"
    echo "   Activez Git via le panneau OVH"
    exit 1
fi
echo "✅ Git : $(git --version)"

# Cloner le projet
echo ""
echo "📦 Clonage du projet..."
if [ -d "$PROJECT_DIR" ]; then
    echo "⚠️  Le dossier existe déjà, suppression..."
    rm -rf $PROJECT_DIR
fi
mkdir -p $PROJECT_DIR
git clone -q $GIT_REPO $PROJECT_DIR || {
    echo "❌ Erreur lors du clonage"
    echo "   Le repository est peut-être privé"
    echo "   Utilisez : git clone https://VOTRE_TOKEN@github.com/Sghaier-h/La-Plume-Artisanale.git"
    exit 1
}
cd $PROJECT_DIR
echo "✅ Projet cloné"

# Générer JWT Secret
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "changez-moi-$(date +%s)")

# Configuration .env
echo ""
echo "📦 Configuration .env..."
mkdir -p backend
cat > backend/.env << EOF
# Base de données PostgreSQL OVH
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
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

# Redis (optionnel)
REDIS_HOST=localhost
REDIS_PORT=6379
EOF
echo "✅ Fichier .env créé"

# Installer dépendances
echo ""
echo "📦 Installation dépendances..."
cd backend
npm install --production --silent
echo "✅ Dépendances installées"

# Initialiser base de données
echo ""
echo "📦 Initialisation base de données..."
cd ../database

# Vérifier que psql est disponible
if ! command -v psql &> /dev/null; then
    echo "⚠️  psql n'est pas disponible"
    echo "   Les scripts SQL seront à exécuter manuellement"
else
    export PGPASSWORD="$DB_PASSWORD"
    
    echo "   Exécution 01_base_et_securite.sql..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 01_base_et_securite.sql > /dev/null 2>&1 || echo "   ⚠️  Erreur sur 01_base_et_securite.sql"
    
    echo "   Exécution 02_production_et_qualite.sql..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 02_production_et_qualite.sql > /dev/null 2>&1 || echo "   ⚠️  Erreur sur 02_production_et_qualite.sql"
    
    echo "   Exécution 03_flux_et_tracabilite.sql..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 03_flux_et_tracabilite.sql > /dev/null 2>&1 || echo "   ⚠️  Erreur sur 03_flux_et_tracabilite.sql"
    
    if [ -f "04_mobile_devices.sql" ]; then
        echo "   Exécution 04_mobile_devices.sql..."
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 04_mobile_devices.sql > /dev/null 2>&1 || echo "   ⚠️  Erreur sur 04_mobile_devices.sql"
    fi
    
    unset PGPASSWORD
    echo "✅ Base de données initialisée"
fi

# Installer PM2
echo ""
echo "📦 Installation PM2..."
npm install -g pm2 --prefix $HOME/.local 2>/dev/null || npm install pm2 --save-dev
echo "✅ PM2 installé"

# Démarrer l'application
echo ""
echo "📦 Démarrage application..."
cd $PROJECT_DIR/backend

# Arrêter si déjà démarré
pm2 stop fouta-api 2>/dev/null || true
pm2 delete fouta-api 2>/dev/null || true

# Démarrer
pm2 start src/server.js --name fouta-api --silent
pm2 save --silent
echo "✅ Application démarrée"

# Afficher le statut
echo ""
echo "======================================================"
echo "✅ Déploiement terminé !"
echo ""
echo "📋 Informations :"
echo "   - Projet : $PROJECT_DIR"
echo "   - API : https://$DOMAIN"
echo "   - IP : http://$IP:5000"
echo ""
echo "🔍 Vérification :"
echo "   pm2 status"
echo "   pm2 logs fouta-api"
echo "   curl http://localhost:5000/health"
echo ""
echo "🔐 Base de données :"
echo "   - Serveur : $DB_HOST"
echo "   - Base : $DB_NAME"
echo "   - Utilisateur : $DB_USER"
echo ""


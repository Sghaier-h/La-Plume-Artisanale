#!/bin/bash
# Script de déploiement pour hébergement partagé OVH - Version finale
# Gère les problèmes de npm et psql

set -e

# Configuration PostgreSQL OVH
DB_HOST="sh131616-002.eu.clouddb.ovh.net"
DB_PORT="35392"
DB_NAME="ERP_La_Plume"
DB_USER="Aviateur"
DB_PASSWORD="Allbyfouta007"

# Configuration serveur
DOMAIN="fabrication.laplume-artisanale.tn"
IP="145.239.37.162"
GIT_REPO="https://github.com/Sghaier-h/La-Plume-Artisanale.git"
PROJECT_DIR="$HOME/fouta-erp"

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

# Trouver npm
NPM_CMD=""
if command -v npm &> /dev/null; then
    NPM_CMD="npm"
elif command -v ~/.local/bin/npm &> /dev/null; then
    NPM_CMD="$HOME/.local/bin/npm"
elif [ -f "/usr/bin/npm" ]; then
    NPM_CMD="/usr/bin/npm"
elif [ -f "/usr/local/bin/npm" ]; then
    NPM_CMD="/usr/local/bin/npm"
else
    echo "⚠️  npm n'est pas trouvé, tentative d'installation..."
    # Essayer d'installer npm localement
    mkdir -p $HOME/.local/bin
    curl -L https://www.npmjs.com/install.sh | sh 2>/dev/null || {
        echo "❌ Impossible d'installer npm automatiquement"
        echo "   Installez npm via le panneau OVH ou contactez le support"
        exit 1
    }
    NPM_CMD="$HOME/.local/bin/npm"
    export PATH="$HOME/.local/bin:$PATH"
fi

echo "✅ npm trouvé : $NPM_CMD"
echo "   Version : $($NPM_CMD --version)"

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
    echo "   Essayez avec un token : git clone https://VOTRE_TOKEN@github.com/Sghaier-h/La-Plume-Artisanale.git"
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
echo "   JWT Secret : $JWT_SECRET"

# Installer dépendances
echo ""
echo "📦 Installation dépendances..."
cd backend
export PATH="$HOME/.local/bin:$PATH"
$NPM_CMD install --production --silent 2>&1 | head -20 || {
    echo "⚠️  Erreur lors de l'installation, tentative avec --legacy-peer-deps..."
    $NPM_CMD install --production --legacy-peer-deps --silent 2>&1 | head -20 || {
        echo "❌ Erreur lors de l'installation des dépendances"
        echo "   Vérifiez les logs ci-dessus"
        exit 1
    }
}
echo "✅ Dépendances installées"

# Initialiser base de données
echo ""
echo "📦 Initialisation base de données..."
cd ../database

# Vérifier que psql est disponible
if ! command -v psql &> /dev/null; then
    echo "⚠️  psql n'est pas disponible"
    echo "   Les scripts SQL devront être exécutés manuellement"
    echo ""
    echo "   Commandes à exécuter :"
    echo "   export PGPASSWORD=$DB_PASSWORD"
    echo "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 01_base_et_securite.sql"
    echo "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 02_production_et_qualite.sql"
    echo "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 03_flux_et_tracabilite.sql"
    echo "   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 04_mobile_devices.sql"
    echo "   unset PGPASSWORD"
else
    export PGPASSWORD="$DB_PASSWORD"
    
    echo "   Exécution 01_base_et_securite.sql..."
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 01_base_et_securite.sql > /tmp/psql-01.log 2>&1; then
        echo "   ✅ 01_base_et_securite.sql exécuté"
    else
        echo "   ⚠️  Erreur (voir /tmp/psql-01.log)"
        cat /tmp/psql-01.log | tail -5
    fi
    
    echo "   Exécution 02_production_et_qualite.sql..."
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 02_production_et_qualite.sql > /tmp/psql-02.log 2>&1; then
        echo "   ✅ 02_production_et_qualite.sql exécuté"
    else
        echo "   ⚠️  Erreur (voir /tmp/psql-02.log)"
        cat /tmp/psql-02.log | tail -5
    fi
    
    echo "   Exécution 03_flux_et_tracabilite.sql..."
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 03_flux_et_tracabilite.sql > /tmp/psql-03.log 2>&1; then
        echo "   ✅ 03_flux_et_tracabilite.sql exécuté"
    else
        echo "   ⚠️  Erreur (voir /tmp/psql-03.log)"
        cat /tmp/psql-03.log | tail -5
    fi
    
    if [ -f "04_mobile_devices.sql" ]; then
        echo "   Exécution 04_mobile_devices.sql..."
        if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 04_mobile_devices.sql > /tmp/psql-04.log 2>&1; then
            echo "   ✅ 04_mobile_devices.sql exécuté"
        else
            echo "   ⚠️  Erreur (voir /tmp/psql-04.log)"
            cat /tmp/psql-04.log | tail -5
        fi
    fi
    
    unset PGPASSWORD
    echo "✅ Base de données initialisée"
fi

# Installer PM2
echo ""
echo "📦 Installation PM2..."
export PATH="$HOME/.local/bin:$PATH"
$NPM_CMD install -g pm2 --prefix $HOME/.local 2>/dev/null || $NPM_CMD install pm2 --save-dev 2>/dev/null || {
    echo "⚠️  PM2 ne peut pas être installé globalement"
    echo "   Installation locale..."
    $NPM_CMD install pm2 --save-dev
}
echo "✅ PM2 installé"

# Démarrer l'application
echo ""
echo "📦 Démarrage application..."
cd $PROJECT_DIR/backend

# Trouver PM2
PM2_CMD=""
if command -v pm2 &> /dev/null; then
    PM2_CMD="pm2"
elif [ -f "$HOME/.local/bin/pm2" ]; then
    PM2_CMD="$HOME/.local/bin/pm2"
elif [ -f "node_modules/.bin/pm2" ]; then
    PM2_CMD="node_modules/.bin/pm2"
elif [ -f "node_modules/pm2/bin/pm2" ]; then
    PM2_CMD="node node_modules/pm2/bin/pm2"
else
    PM2_CMD="node node_modules/pm2/bin/pm2"
fi

# Arrêter si déjà démarré
$PM2_CMD stop fouta-api 2>/dev/null || true
$PM2_CMD delete fouta-api 2>/dev/null || true

# Démarrer
$PM2_CMD start src/server.js --name fouta-api --silent
$PM2_CMD save --silent
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
echo "   $PM2_CMD status"
echo "   $PM2_CMD logs fouta-api"
echo "   curl http://localhost:5000/health"
echo ""
echo "🔐 Base de données :"
echo "   - Serveur : $DB_HOST"
echo "   - Base : $DB_NAME"
echo "   - Utilisateur : $DB_USER"
echo ""


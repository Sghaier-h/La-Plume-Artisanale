#!/bin/bash

# Script de déploiement rapide depuis GitHub
# Usage: bash deploy.sh [branch]

set -e

PROJECT_DIR="/var/www/fouta-erp"
BRANCH=${1:-main}

echo "🚀 Déploiement ERP ALL BY FOUTA"
echo "📦 Branche: $BRANCH"

cd $PROJECT_DIR

# Vérifier les modifications locales
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Modifications locales détectées, stash..."
    git stash
fi

# Pull les dernières modifications
echo "📥 Récupération des modifications depuis GitHub..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# Installer les dépendances
echo "📦 Installation des dépendances..."
cd backend
npm install --production

# Redémarrer l'application
echo "🔄 Redémarrage de l'application..."
pm2 restart fouta-api

# Vérifier le statut
echo "✅ Statut de l'application :"
pm2 status

echo "✅ Déploiement terminé !"


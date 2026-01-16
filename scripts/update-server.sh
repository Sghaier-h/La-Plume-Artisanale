#!/bin/bash

# Script simple pour mettre à jour le serveur depuis GitHub
# Usage: bash scripts/update-server.sh

set -e

PROJECT_DIR="/opt/fouta-erp"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "🚀 Mise à jour du serveur depuis GitHub..."

cd "$PROJECT_DIR"

# Sauvegarder le .env
if [ -f "$BACKEND_DIR/.env" ]; then
    cp "$BACKEND_DIR/.env" ~/.env.backup
    echo "💾 .env sauvegardé"
fi

# Mettre à jour depuis GitHub
echo "📥 Récupération depuis GitHub..."
git fetch origin
git reset --hard origin/main

# Restaurer le .env
if [ -f ~/.env.backup ]; then
    cp ~/.env.backup "$BACKEND_DIR/.env"
    echo "✅ .env restauré"
fi

# Mettre à jour le backend
echo "🔧 Mise à jour du backend..."
cd "$BACKEND_DIR"
npm install --production

# Redémarrer l'application
echo "🔄 Redémarrage de l'application..."
pm2 restart fouta-api
pm2 save

echo "✅ Mise à jour terminée !"
echo "📊 Statut PM2 :"
pm2 status

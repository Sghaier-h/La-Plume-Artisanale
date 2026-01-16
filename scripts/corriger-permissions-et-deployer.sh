#!/bin/bash
# Script pour corriger les permissions Git et deployer le frontend

set -e

PROJECT_DIR="/opt/fouta-erp"
cd "$PROJECT_DIR"

echo "🔧 Correction des permissions Git..."
echo ""

# 1. Corriger les permissions du depot Git
echo "📁 Correction des permissions du depot Git..."
sudo chown -R ubuntu:ubuntu "$PROJECT_DIR/.git"
sudo chown -R ubuntu:ubuntu "$PROJECT_DIR/frontend"
sudo chmod -R u+w "$PROJECT_DIR/.git"
echo "✅ Permissions corrigees"
echo ""

# 2. Mettre a jour le depot
echo "📥 Mise a jour depuis GitHub..."
if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
    echo "💾 Sauvegarde des modifications locales..."
    git stash push -m "Sauvegarde avant deploy frontend"
fi

git fetch origin
git reset --hard origin/main
echo "✅ Depot mis a jour"
echo ""

# 3. Executer le script de deploiement
if [ -f "scripts/deployer-frontend-serveur.sh" ]; then
    echo "▶️  Execution du script de deploiement..."
    chmod +x scripts/deployer-frontend-serveur.sh
    sudo bash scripts/deployer-frontend-serveur.sh
else
    echo "❌ Script de deploiement non trouve"
    exit 1
fi

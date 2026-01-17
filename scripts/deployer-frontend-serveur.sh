#!/bin/bash
# Script pour deployer le frontend directement sur le serveur

set -e

PROJECT_DIR="/opt/fouta-erp"
FRONTEND_DIR="$PROJECT_DIR/frontend"
REMOTE_FRONTEND_DIR="/opt/fouta-erp/frontend"

echo "🚀 Deploiement du frontend sur le serveur..."
echo ""

cd "$PROJECT_DIR"

# 1. Corriger les permissions
echo "🔧 Correction des permissions..."
sudo chown -R ubuntu:ubuntu frontend/
echo "✅ Permissions corrigees"
echo ""

# 2. Mettre a jour le depot
echo "📥 Mise a jour depuis GitHub..."
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "💾 Sauvegarde des modifications locales..."
    git stash push -m "Sauvegarde avant deploy frontend"
fi

git fetch origin
git reset --hard origin/main
echo "✅ Depot mis a jour"
echo ""

# 3. Aller dans le dossier frontend
cd "$FRONTEND_DIR"

# 4. Creer le fichier .env.production
echo "📝 Creation du fichier .env.production..."
echo "REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api" > .env.production
cat .env.production
echo "✅ Fichier .env.production cree"
echo ""

# 5. Installer les dependances (si necessaire)
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dependances (cela peut prendre plusieurs minutes)..."
    npm install
else
    echo "✅ Dependances deja installees"
fi
echo ""

# 6. Builder le frontend
echo "🔨 Build du frontend (cela peut prendre 5-10 minutes)..."
echo "IMPORTANT: Le build utilise le fichier .env.production pour l'URL de l'API"
npm run build

if [ ! -d "build" ]; then
    echo "❌ Erreur: Le dossier build n'existe pas !"
    exit 1
fi

echo "✅ Build termine avec succes"
echo ""

# 7. Deplacer le build vers le dossier de deploiement
echo "📦 Deploiement des fichiers..."
# On est déjà dans $FRONTEND_DIR

# Sauvegarder les anciens fichiers (sauf build et node_modules)
if [ -f "index.html" ] && [ ! -f "index.html.backup" ]; then
    sudo mv index.html index.html.backup 2>/dev/null || true
fi

# Copier le contenu du build vers le répertoire frontend/
if [ -d "build" ]; then
    sudo cp -r build/* .
    echo "✅ Fichiers copiés depuis build/"
else
    echo "❌ Erreur: Le dossier build n'existe pas dans $FRONTEND_DIR"
    echo "   Contenu actuel:"
    ls -la
    exit 1
fi

# Nettoyer le dossier build (optionnel, pour économiser de l'espace)
sudo rm -rf build 2>/dev/null || true

# Corriger les permissions
sudo chown -R www-data:www-data frontend/
sudo chmod -R 755 frontend/

# Nettoyer le dossier build (optionnel)
sudo rm -rf frontend/build 2>/dev/null || true

echo "✅ Fichiers deployes"
echo ""

# 8. Recharger Nginx
echo "🔄 Rechargement de Nginx..."
sudo systemctl reload nginx
echo "✅ Nginx recharge"
echo ""

# 9. Verification
echo "🔍 Verification..."
if [ -f "$REMOTE_FRONTEND_DIR/index.html" ]; then
    echo "✅ index.html present"
else
    echo "❌ index.html manquant"
fi

JS_FILE=$(find "$REMOTE_FRONTEND_DIR/static/js" -name "main.*.js" 2>/dev/null | head -1)
if [ -n "$JS_FILE" ]; then
    if grep -q "fabrication.laplume-artisanale.tn" "$JS_FILE"; then
        echo "✅ URL de production trouvee dans le build"
    elif grep -q "localhost:5000" "$JS_FILE"; then
        echo "❌ URL localhost trouvee - Le build n'a pas utilise .env.production"
    else
        echo "ℹ️  Impossible de determiner l'URL"
    fi
else
    echo "⚠️  Aucun fichier JS trouve"
fi

echo ""
echo "✅ Deploiement termine !"
echo ""
echo "🌐 Testez maintenant: https://fabrication.laplume-artisanale.tn"

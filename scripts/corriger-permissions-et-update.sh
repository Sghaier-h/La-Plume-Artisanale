#!/bin/bash
# Script pour corriger les permissions et mettre à jour depuis GitHub
# Usage: bash scripts/corriger-permissions-et-update.sh

set -e

PROJECT_DIR="/opt/fouta-erp"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "=========================================="
echo "🔧 CORRECTION PERMISSIONS ET MISE À JOUR"
echo "=========================================="
echo ""

cd "$PROJECT_DIR"

# 1. Sauvegarder le .env
echo "1️⃣ Sauvegarde du .env..."
if [ -f "$BACKEND_DIR/.env" ]; then
    cp "$BACKEND_DIR/.env" ~/.env.backup
    echo "✅ .env sauvegardé"
else
    echo "⚠️  .env non trouvé"
fi

echo ""

# 2. Corriger les permissions du frontend
echo "2️⃣ Correction des permissions frontend..."
if [ -d "$FRONTEND_DIR" ]; then
    # Changer le propriétaire temporairement pour permettre à Git de modifier
    sudo chown -R ubuntu:ubuntu "$FRONTEND_DIR"
    echo "✅ Permissions frontend corrigées (ubuntu:ubuntu)"
else
    echo "⚠️  Dossier frontend non trouvé"
fi

echo ""

# 3. Corriger les permissions du backend
echo "3️⃣ Correction des permissions backend..."
if [ -d "$BACKEND_DIR" ]; then
    sudo chown -R ubuntu:ubuntu "$BACKEND_DIR"
    echo "✅ Permissions backend corrigées (ubuntu:ubuntu)"
fi

echo ""

# 4. Nettoyer les modifications Git
echo "4️⃣ Nettoyage des modifications Git..."
git reset --hard HEAD
git clean -fd
echo "✅ Modifications locales supprimées"

echo ""

# 5. Mettre à jour depuis GitHub
echo "5️⃣ Mise à jour depuis GitHub..."
git fetch origin
git reset --hard origin/main
echo "✅ Code mis à jour depuis GitHub"

echo ""

# 6. Restaurer le .env
echo "6️⃣ Restauration du .env..."
if [ -f ~/.env.backup ]; then
    cp ~/.env.backup "$BACKEND_DIR/.env"
    echo "✅ .env restauré"
fi

echo ""

# 7. Corriger les permissions pour Nginx (frontend seulement)
echo "7️⃣ Correction des permissions pour Nginx..."
if [ -d "$FRONTEND_DIR" ]; then
    # Les fichiers sources peuvent rester à ubuntu:ubuntu
    # Mais les fichiers déployés (index.html, static/) doivent être accessibles par Nginx
    if [ -f "$FRONTEND_DIR/index.html" ]; then
        sudo chown -R www-data:www-data "$FRONTEND_DIR/index.html" "$FRONTEND_DIR/static" "$FRONTEND_DIR/asset-manifest.json" "$FRONTEND_DIR/manifest.json" 2>/dev/null || true
        sudo chmod -R 755 "$FRONTEND_DIR/index.html" "$FRONTEND_DIR/static" 2>/dev/null || true
        echo "✅ Permissions fichiers déployés corrigées (www-data:www-data)"
    fi
fi

echo ""

# 8. Vérification
echo "8️⃣ Vérification..."
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    echo "✅ Serveur synchronisé avec GitHub (commit: ${LOCAL_COMMIT:0:7})"
else
    echo "⚠️  Serveur et GitHub ne sont pas synchronisés"
fi

echo ""
echo "=========================================="
echo "✅ Mise à jour terminée"
echo "=========================================="
echo ""

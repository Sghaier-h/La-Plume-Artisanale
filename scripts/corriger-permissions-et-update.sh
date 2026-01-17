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

# 4. Sauvegarder les fichiers déployés du frontend (s'ils existent)
echo "4️⃣ Sauvegarde des fichiers déployés frontend..."
if [ -f "$FRONTEND_DIR/index.html" ] || [ -d "$FRONTEND_DIR/static" ]; then
    TEMP_FRONTEND_BACKUP="/tmp/frontend-deployed-backup-$(date +%s)"
    sudo mkdir -p "$TEMP_FRONTEND_BACKUP"
    
    # Sauvegarder uniquement les fichiers déployés (pas node_modules, src, etc.)
    if [ -f "$FRONTEND_DIR/index.html" ]; then
        sudo cp "$FRONTEND_DIR/index.html" "$TEMP_FRONTEND_BACKUP/" 2>/dev/null || true
    fi
    if [ -f "$FRONTEND_DIR/asset-manifest.json" ]; then
        sudo cp "$FRONTEND_DIR/asset-manifest.json" "$TEMP_FRONTEND_BACKUP/" 2>/dev/null || true
    fi
    if [ -f "$FRONTEND_DIR/manifest.json" ]; then
        sudo cp "$FRONTEND_DIR/manifest.json" "$TEMP_FRONTEND_BACKUP/" 2>/dev/null || true
    fi
    if [ -d "$FRONTEND_DIR/static" ]; then
        sudo cp -r "$FRONTEND_DIR/static" "$TEMP_FRONTEND_BACKUP/" 2>/dev/null || true
    fi
    
    echo "✅ Fichiers déployés sauvegardés dans $TEMP_FRONTEND_BACKUP"
else
    TEMP_FRONTEND_BACKUP=""
    echo "ℹ️  Aucun fichier déployé à sauvegarder"
fi

echo ""

# 5. Nettoyer les modifications Git (mais préserver les fichiers déployés)
echo "5️⃣ Nettoyage des modifications Git..."
git reset --hard HEAD

# Nettoyer uniquement les fichiers non trackés qui ne sont pas des fichiers déployés
# Exclure index.html, static/, asset-manifest.json, manifest.json du nettoyage
git clean -fd --exclude="$FRONTEND_DIR/index.html" --exclude="$FRONTEND_DIR/static" --exclude="$FRONTEND_DIR/asset-manifest.json" --exclude="$FRONTEND_DIR/manifest.json" 2>/dev/null || git clean -fd

echo "✅ Modifications locales supprimées"

echo ""

# 6. Mettre à jour depuis GitHub
echo "6️⃣ Mise à jour depuis GitHub..."
git fetch origin
git reset --hard origin/main
echo "✅ Code mis à jour depuis GitHub"

echo ""

# 7. Restaurer les fichiers déployés si ils ont été supprimés
if [ -n "$TEMP_FRONTEND_BACKUP" ] && [ -d "$TEMP_FRONTEND_BACKUP" ]; then
    echo "7️⃣ Restauration des fichiers déployés frontend..."
    
    # Vérifier si les fichiers ont été supprimés
    if [ ! -f "$FRONTEND_DIR/index.html" ] && [ -f "$TEMP_FRONTEND_BACKUP/index.html" ]; then
        sudo cp "$TEMP_FRONTEND_BACKUP/index.html" "$FRONTEND_DIR/" 2>/dev/null || true
        echo "✅ index.html restauré"
    fi
    
    if [ ! -f "$FRONTEND_DIR/asset-manifest.json" ] && [ -f "$TEMP_FRONTEND_BACKUP/asset-manifest.json" ]; then
        sudo cp "$TEMP_FRONTEND_BACKUP/asset-manifest.json" "$FRONTEND_DIR/" 2>/dev/null || true
        echo "✅ asset-manifest.json restauré"
    fi
    
    if [ ! -f "$FRONTEND_DIR/manifest.json" ] && [ -f "$TEMP_FRONTEND_BACKUP/manifest.json" ]; then
        sudo cp "$TEMP_FRONTEND_BACKUP/manifest.json" "$FRONTEND_DIR/" 2>/dev/null || true
        echo "✅ manifest.json restauré"
    fi
    
    if [ ! -d "$FRONTEND_DIR/static" ] && [ -d "$TEMP_FRONTEND_BACKUP/static" ]; then
        sudo cp -r "$TEMP_FRONTEND_BACKUP/static" "$FRONTEND_DIR/" 2>/dev/null || true
        echo "✅ static/ restauré"
    fi
    
    # Corriger les permissions des fichiers restaurés
    if [ -f "$FRONTEND_DIR/index.html" ]; then
        sudo chown -R www-data:www-data "$FRONTEND_DIR/index.html" "$FRONTEND_DIR/static" "$FRONTEND_DIR/asset-manifest.json" "$FRONTEND_DIR/manifest.json" 2>/dev/null || true
        sudo chmod -R 755 "$FRONTEND_DIR/index.html" "$FRONTEND_DIR/static" 2>/dev/null || true
    fi
    
    # Nettoyer le backup temporaire
    sudo rm -rf "$TEMP_FRONTEND_BACKUP" 2>/dev/null || true
    
    echo "✅ Fichiers déployés restaurés"
else
    echo "7️⃣ Aucun fichier déployé à restaurer"
fi

echo ""

echo ""

# 8. Restaurer le .env
echo "8️⃣ Restauration du .env..."
if [ -f ~/.env.backup ]; then
    cp ~/.env.backup "$BACKEND_DIR/.env"
    echo "✅ .env restauré"
fi

echo ""

# 9. Corriger les permissions pour Nginx (frontend seulement)
echo "9️⃣ Correction des permissions pour Nginx..."
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

# 10. Vérification
echo "🔟 Vérification..."
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

#!/bin/bash
# Script pour corriger les permissions avant une mise a jour Git

set -e

PROJECT_DIR="/opt/fouta-erp"
cd "$PROJECT_DIR"

echo "🔧 Correction des permissions Git..."
echo ""

# 1. Corriger les permissions du dossier frontend
echo "📁 Correction des permissions de frontend/..."
if [ -d "frontend" ]; then
    sudo chown -R ubuntu:ubuntu frontend/
    sudo chmod -R u+w frontend/
    echo "✅ Permissions de frontend/ corrigees"
else
    echo "⚠️  Le dossier frontend/ n'existe pas"
fi

echo ""

# 2. Verifier que Git peut ecrire
echo "🔍 Verification des permissions Git..."
if git diff --quiet 2>/dev/null; then
    echo "✅ Git peut ecrire dans le depot"
else
    echo "⚠️  Il y a des modifications locales"
    git status --short
fi

echo ""
echo "✅ Corrections terminees !"
echo ""
echo "Vous pouvez maintenant executer:"
echo "  git stash"
echo "  git pull origin main"

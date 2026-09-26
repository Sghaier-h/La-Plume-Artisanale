#!/bin/bash
# Script pour résoudre les conflits Git lors d'un pull
# Usage: bash scripts/resoudre-conflit-git.sh

set -e

echo "=========================================="
echo "🔧 RÉSOLUTION DES CONFLITS GIT"
echo "=========================================="
echo ""

# Sauvegarder les modifications locales si elles existent
if [ -n "$(git status --porcelain)" ]; then
    echo "📦 Sauvegarde des modifications locales..."
    git stash push -m "Sauvegarde avant pull $(date +%Y-%m-%d_%H-%M-%S)"
    echo "✅ Modifications sauvegardées"
    echo ""
fi

# Récupérer les dernières modifications
echo "📥 Récupération des dernières modifications..."
git fetch origin main
git pull origin main || {
    echo "⚠️  Problème lors du pull, tentative de réinitialisation..."
    git reset --hard origin/main
}
echo "✅ Code mis à jour"
echo ""

# Afficher le statut
echo "📊 Statut Git:"
git status
echo ""

echo "=========================================="
echo "✅ Conflits résolus"
echo "=========================================="
echo ""
echo "💡 Si vous aviez des modifications importantes, vous pouvez les récupérer avec:"
echo "   git stash list"
echo "   git stash pop"
echo ""

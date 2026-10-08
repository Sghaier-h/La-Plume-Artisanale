#!/bin/bash
# Script pour vérifier la synchronisation sur le serveur
# Usage: bash scripts/verifier-synchronisation-serveur.sh

PROJECT_DIR="/opt/fouta-erp"
GITHUB_REPO="https://github.com/Sghaier-h/La-Plume-Artisanale.git"

echo "=========================================="
echo "🔍 VÉRIFICATION DE SYNCHRONISATION SERVEUR"
echo "=========================================="
echo ""

cd "$PROJECT_DIR" || exit 1

# 1. Vérifier l'état Git local
echo "1️⃣ ÉTAT GIT LOCAL"
echo "--------------------------------"
git fetch origin 2>/dev/null

LOCAL_COMMIT=$(git rev-parse HEAD 2>/dev/null)
REMOTE_COMMIT=$(git rev-parse origin/main 2>/dev/null)

if [ -n "$LOCAL_COMMIT" ]; then
    echo "✅ Commit local: ${LOCAL_COMMIT:0:7}"
else
    echo "❌ Impossible de récupérer le commit local"
    exit 1
fi

# 2. Vérifier les modifications non commitées
echo ""
echo "2️⃣ MODIFICATIONS NON COMMITÉES"
echo "--------------------------------"
UNCOMMITTED=$(git status --porcelain)

if [ -z "$UNCOMMITTED" ]; then
    echo "✅ Aucune modification non commitée"
else
    echo "⚠️  Modifications non commitées:"
    echo "$UNCOMMITTED" | sed 's/^/   /'
fi

# 3. Comparer avec GitHub
echo ""
echo "3️⃣ COMPARAISON AVEC GITHUB"
echo "--------------------------------"

if [ -n "$REMOTE_COMMIT" ]; then
    echo "✅ Commit GitHub: ${REMOTE_COMMIT:0:7}"
    
    if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
        echo "✅ Serveur synchronisé avec GitHub"
    else
        AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")
        BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")
        
        if [ "$AHEAD" -gt 0 ]; then
            echo "⚠️  $AHEAD commit(s) en avance sur GitHub"
        fi
        if [ "$BEHIND" -gt 0 ]; then
            echo "⚠️  $BEHIND commit(s) en retard sur GitHub"
            echo ""
            echo "📥 Pour mettre à jour:"
            echo "   git pull origin main"
        fi
    fi
else
    echo "❌ Impossible de récupérer origin/main"
    echo "   Vérifiez la connexion: git fetch origin"
fi

# 4. Vérifier les fichiers importants
echo ""
echo "4️⃣ VÉRIFICATION FICHIERS IMPORTANTS"
echo "--------------------------------"

FILES_TO_CHECK=(
    "backend/src/server.js"
    "frontend/src/App.tsx"
    "frontend/src/pages/Login.tsx"
    "scripts/diagnostic-serveur.sh"
    "scripts/corriger-serveur.sh"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file manquant"
    fi
done

# 5. Résumé
echo ""
echo "=========================================="
echo "📋 RÉSUMÉ"
echo "=========================================="
echo ""

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ] && [ -z "$UNCOMMITTED" ]; then
    echo "✅ Serveur complètement synchronisé avec GitHub"
    echo "   Commit: ${LOCAL_COMMIT:0:7}"
else
    echo "⚠️  Serveur nécessite une mise à jour"
    if [ -n "$UNCOMMITTED" ]; then
        echo "   - Modifications non commitées présentes"
    fi
    if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
        echo "   - Commit différent de GitHub"
    fi
fi

echo ""
echo "💡 Commandes utiles:"
echo "   - Mettre à jour: git pull origin main"
echo "   - Voir les différences: git log HEAD..origin/main --oneline"
echo ""

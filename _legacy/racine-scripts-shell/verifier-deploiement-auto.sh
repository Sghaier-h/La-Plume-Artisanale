#!/bin/bash
# Script pour verifier le deploiement frontend (avec gestion des conflits Git)

set -e

PROJECT_DIR="/opt/fouta-erp"
cd "$PROJECT_DIR"

echo "🔍 Verification du deploiement frontend..."
echo ""

# Mettre a jour depuis GitHub (en gerant les conflits)
echo "📥 Mise a jour depuis GitHub..."
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "💾 Sauvegarde des modifications locales..."
    git stash push -m "Sauvegarde automatique avant verification"
fi

git fetch origin
git reset --hard origin/main

# Maintenant executer la verification
FRONTEND_DIR="/opt/fouta-erp/frontend"

echo ""
echo "🔍 Verification du deploiement..."
echo ""

# 1. Verifier que le dossier existe
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Le dossier frontend n'existe pas: $FRONTEND_DIR"
    exit 1
fi

# 2. Verifier que index.html existe
if [ ! -f "$FRONTEND_DIR/index.html" ]; then
    echo "❌ Le fichier index.html n'existe pas"
    exit 1
fi

echo "✅ Fichier index.html present"
echo ""

# 3. Verifier les permissions
echo "📊 Permissions:"
ls -ld "$FRONTEND_DIR"
echo ""

# 4. Verifier que Nginx peut lire les fichiers
echo "🔍 Test lecture par Nginx:"
if sudo -u www-data test -r "$FRONTEND_DIR/index.html"; then
    echo "✅ Nginx peut lire les fichiers"
else
    echo "❌ Nginx ne peut pas lire les fichiers"
fi
echo ""

# 5. Verifier les fichiers JS pour l'URL API
JS_FILE=$(find "$FRONTEND_DIR/static/js" -name "main.*.js" 2>/dev/null | head -1)
if [ -n "$JS_FILE" ]; then
    echo "🔍 Verification de l'URL API dans le fichier JS:"
    if grep -q "fabrication.laplume-artisanale.tn" "$JS_FILE"; then
        echo "✅ URL de production trouvee dans le fichier JS"
    elif grep -q "localhost:5000" "$JS_FILE"; then
        echo "❌ URL localhost trouvee dans le fichier JS"
        echo "   Le build n'a pas utilise .env.production"
        echo "   Solution: Refaire le build avec le fichier .env.production"
    else
        echo "ℹ️  Impossible de determiner l'URL depuis le fichier JS"
    fi
else
    echo "⚠️  Aucun fichier JS trouve"
fi
echo ""

# 6. Verifier le statut Nginx
echo "📊 Statut Nginx:"
sudo systemctl status nginx --no-pager -l | head -5 || echo "⚠️  Impossible de verifier Nginx"
echo ""

# 7. Verifier que le backend est accessible
echo "🔍 Test connexion backend:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null | grep -q "200\|404\|401"; then
    echo "✅ Backend accessible sur localhost:5000"
else
    echo "⚠️  Backend non accessible sur localhost:5000"
fi
echo ""

echo "✅ Verification terminee !"
echo ""
echo "🌐 Testez maintenant: https://fabrication.laplume-artisanale.tn"
echo ""
echo "💡 Si l'erreur persiste:"
echo "   - Vider le cache du navigateur (Ctrl+Shift+R)"
echo "   - Verifier la console du navigateur (F12)"
echo "   - Verifier que les requetes API pointent vers https://fabrication.laplume-artisanale.tn/api"

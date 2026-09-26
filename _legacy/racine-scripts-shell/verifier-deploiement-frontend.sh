#!/bin/bash
# Script pour verifier le deploiement du frontend

FRONTEND_DIR="/opt/fouta-erp/frontend"

echo "🔍 Verification du deploiement frontend..."
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

# 5. Verifier le contenu de index.html (chercher l'URL de l'API)
echo "🔍 Verification de l'URL API dans le build:"
if grep -q "fabrication.laplume-artisanale.tn" "$FRONTEND_DIR/index.html"; then
    echo "✅ URL de production trouvee dans index.html"
elif grep -q "localhost:5000" "$FRONTEND_DIR/index.html"; then
    echo "⚠️  URL localhost trouvee dans index.html (le build n'a peut-etre pas utilise .env.production)"
else
    echo "ℹ️  Impossible de determiner l'URL depuis index.html (normal, l'URL est dans les fichiers JS)"
fi
echo ""

# 6. Verifier les fichiers JS
JS_FILE=$(find "$FRONTEND_DIR/static/js" -name "main.*.js" | head -1)
if [ -n "$JS_FILE" ]; then
    echo "🔍 Verification de l'URL API dans le fichier JS:"
    if grep -q "fabrication.laplume-artisanale.tn" "$JS_FILE"; then
        echo "✅ URL de production trouvee dans le fichier JS"
    elif grep -q "localhost:5000" "$JS_FILE"; then
        echo "❌ URL localhost trouvee dans le fichier JS (le build n'a pas utilise .env.production)"
        echo "   Solution: Refaire le build avec le fichier .env.production present"
    else
        echo "ℹ️  Impossible de determiner l'URL depuis le fichier JS"
    fi
else
    echo "⚠️  Aucun fichier JS trouve"
fi
echo ""

# 7. Verifier le statut Nginx
echo "📊 Statut Nginx:"
sudo systemctl status nginx --no-pager -l | head -5
echo ""

# 8. Verifier que le backend est accessible
echo "🔍 Test connexion backend:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health | grep -q "200\|404\|401"; then
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

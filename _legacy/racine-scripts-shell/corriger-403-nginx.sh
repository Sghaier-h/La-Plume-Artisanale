#!/bin/bash
# Script pour corriger l'erreur 403 Forbidden avec Nginx

set -e

PROJECT_DIR="/opt/fouta-erp"
FRONTEND_DIR="$PROJECT_DIR/frontend"
NGINX_CONFIG="/etc/nginx/sites-available/fabrication"

echo "🔧 Correction de l'erreur 403 Forbidden..."
echo ""

# 1. Verifier que le dossier frontend existe
echo "📁 Verification du dossier frontend..."
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Le dossier frontend n'existe pas. Creation..."
    sudo mkdir -p "$FRONTEND_DIR"
fi

# 2. Verifier que le dossier n'est pas vide
if [ ! -f "$FRONTEND_DIR/index.html" ]; then
    echo "⚠️  Le dossier frontend est vide ou index.html manquant !"
    echo ""
    echo "📋 Le frontend doit etre deploye dans: $FRONTEND_DIR"
    echo ""
    echo "Pour deployer le frontend:"
    echo "  1. Sur votre machine Windows, aller dans le dossier frontend"
    echo "  2. Executer: npm run build"
    echo "  3. Copier le contenu du dossier build/ vers $FRONTEND_DIR"
    echo ""
    echo "Ou utiliser SCP:"
    echo "  scp -r frontend/build/* ubuntu@137.74.40.191:$FRONTEND_DIR/"
    echo ""
    exit 1
fi

# 3. Configurer les permissions
echo "🔐 Configuration des permissions..."
sudo chown -R www-data:www-data "$FRONTEND_DIR"
sudo chmod -R 755 "$FRONTEND_DIR"

# 4. Verifier la configuration Nginx
echo "📋 Verification de la configuration Nginx..."
if ! grep -q "root $FRONTEND_DIR" "$NGINX_CONFIG"; then
    echo "⚠️  La configuration Nginx ne pointe pas vers $FRONTEND_DIR"
    echo ""
    echo "La configuration doit contenir:"
    echo "  root $FRONTEND_DIR;"
    echo "  index index.html;"
    echo ""
    echo "Modifiez avec: sudo nano $NGINX_CONFIG"
    echo ""
fi

# 5. Verifier que Nginx peut lire les fichiers
echo "🔍 Verification des permissions Nginx..."
if ! sudo -u www-data test -r "$FRONTEND_DIR/index.html"; then
    echo "❌ Nginx ne peut pas lire les fichiers !"
    echo "Correction des permissions..."
    sudo chmod -R o+r "$FRONTEND_DIR"
fi

# 6. Tester la configuration Nginx
echo "🧪 Test de la configuration Nginx..."
if sudo nginx -t; then
    echo "✅ Configuration Nginx valide"
else
    echo "❌ Erreur dans la configuration Nginx !"
    exit 1
fi

# 7. Recharger Nginx
echo "🔄 Rechargement de Nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Corrections appliquees !"
echo ""
echo "📊 Verification finale:"
echo "  - Dossier frontend: $FRONTEND_DIR"
echo "  - Fichiers: $(ls -1 "$FRONTEND_DIR" | wc -l) fichiers"
echo "  - Permissions: $(ls -ld "$FRONTEND_DIR" | awk '{print $1, $3, $4}')"
echo ""
echo "🌐 Testez maintenant: https://fabrication.laplume-artisanale.tn"

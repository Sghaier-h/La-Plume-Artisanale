#!/bin/bash
# Script pour corriger l'erreur 403 Forbidden (gestion automatique des conflits Git)

set -e

PROJECT_DIR="/opt/fouta-erp"
FRONTEND_DIR="$PROJECT_DIR/frontend"
NGINX_CONFIG="/etc/nginx/sites-available/fabrication"

echo "🔧 Correction de l'erreur 403 Forbidden..."
echo ""

# 1. Mettre a jour depuis GitHub (en gérant les conflits)
echo "📥 Mise a jour depuis GitHub..."
cd "$PROJECT_DIR"

# Stasher les modifications locales si necessaire
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "💾 Sauvegarde des modifications locales..."
    git stash push -m "Sauvegarde automatique avant correction 403"
fi

# Mettre a jour
git fetch origin
git reset --hard origin/main

# 2. Verifier que le dossier frontend existe
echo "📁 Verification du dossier frontend..."
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Le dossier frontend n'existe pas. Creation..."
    sudo mkdir -p "$FRONTEND_DIR"
fi

# 3. Verifier que le dossier n'est pas vide
if [ ! -f "$FRONTEND_DIR/index.html" ]; then
    echo "⚠️  Le dossier frontend est vide ou index.html manquant !"
    echo ""
    echo "📋 Le frontend doit etre deploye dans: $FRONTEND_DIR"
    echo ""
    echo "Pour deployer le frontend depuis Windows:"
    echo "  cd D:\\OneDrive - FLYING TEX\\PROJET\\La-Plume-Artisanale\\frontend"
    echo "  npm run build"
    echo "  scp -r build/* ubuntu@137.74.40.191:$FRONTEND_DIR/"
    echo ""
    exit 1
fi

# 4. Configurer les permissions
echo "🔐 Configuration des permissions..."
sudo chown -R www-data:www-data "$FRONTEND_DIR"
sudo chmod -R 755 "$FRONTEND_DIR"

# 5. Verifier la configuration Nginx
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

# 6. Verifier que Nginx peut lire les fichiers
echo "🔍 Verification des permissions Nginx..."
if ! sudo -u www-data test -r "$FRONTEND_DIR/index.html"; then
    echo "❌ Nginx ne peut pas lire les fichiers !"
    echo "Correction des permissions..."
    sudo chmod -R o+r "$FRONTEND_DIR"
fi

# 7. Tester la configuration Nginx
echo "🧪 Test de la configuration Nginx..."
if sudo nginx -t; then
    echo "✅ Configuration Nginx valide"
else
    echo "❌ Erreur dans la configuration Nginx !"
    exit 1
fi

# 8. Recharger Nginx
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

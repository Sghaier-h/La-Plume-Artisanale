#!/bin/bash
# Script pour terminer le déploiement après installation de npm
# À exécuter après avoir installé nvm et Node.js 18

set -e

# Charger nvm si disponible (optionnel)
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    \. "$NVM_DIR/nvm.sh"
    # Essayer d'utiliser Node.js 18, sinon continuer avec la version actuelle
    nvm use 18 2>/dev/null || nvm use default 2>/dev/null || true
fi

echo "🚀 Finalisation du Déploiement"
echo "================================"
echo ""
echo "✅ Node.js : $(node --version)"
echo "✅ npm : $(npm --version)"
echo ""

# Aller dans le dossier du projet
PROJECT_DIR="$HOME/fouta-erp"
cd $PROJECT_DIR/backend

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install --production
echo "✅ Dépendances installées"
echo ""

# Installer PM2
echo "📦 Installation de PM2..."
npm install -g pm2 --prefix $HOME/.local
export PATH="$HOME/.local/bin:$PATH"
echo "✅ PM2 installé"
echo ""

# Arrêter l'application si elle tourne déjà
pm2 stop fouta-api 2>/dev/null || true
pm2 delete fouta-api 2>/dev/null || true

# Démarrer l'application
echo "🚀 Démarrage de l'application..."
pm2 start src/server.js --name fouta-api
pm2 save
echo "✅ Application démarrée"
echo ""

# Afficher le statut
echo "================================"
echo "✅ Déploiement terminé !"
echo ""
echo "📋 Statut :"
pm2 status
echo ""
echo "🔍 Commandes utiles :"
echo "   pm2 status          - Voir le statut"
echo "   pm2 logs fouta-api   - Voir les logs"
echo "   pm2 restart fouta-api - Redémarrer"
echo "   curl http://localhost:5000/health - Tester l'API"
echo ""


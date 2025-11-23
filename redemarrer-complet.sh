#!/bin/bash
# Script complet pour redémarrer l'application avec le bon port et Node.js 18

set -e

echo "🚀 Redémarrage Complet de l'Application"
echo "========================================"

# 1. Charger nvm et Node.js 18
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18 2>/dev/null || true

echo "✅ Node.js : $(node --version)"

# 2. Ajouter PM2 au PATH
export PATH="$HOME/.local/bin:$PATH"

echo "✅ PM2 : $(pm2 --version)"

# 3. Aller dans le dossier backend
cd ~/fouta-erp/backend

# 4. Vérifier que le port est 50000
if ! grep -q "^PORT=50000" .env; then
    echo "📝 Configuration du port 50000..."
    grep -v "^PORT=" .env > .env.tmp
    echo "PORT=50000" >> .env.tmp
    mv .env.tmp .env
    echo "✅ Port configuré à 50000"
else
    echo "✅ Port déjà configuré à 50000"
fi

# 5. Arrêter et supprimer l'ancienne instance
echo "🛑 Arrêt de l'ancienne instance..."
pm2 stop fouta-api 2>/dev/null || true
pm2 delete fouta-api 2>/dev/null || true

# 6. Démarrer avec Node.js 18
echo "🚀 Démarrage de l'application..."
pm2 start src/server.js --name fouta-api --interpreter $(which node) --update-env

# 7. Sauvegarder
pm2 save

# 8. Attendre un peu
sleep 3

# 9. Afficher le statut
echo ""
echo "========================================"
echo "📋 Statut de l'application :"
pm2 status

echo ""
echo "📋 Logs (dernières 20 lignes) :"
pm2 logs fouta-api --lines 20 --nostream

echo ""
echo "🔍 Test de l'API :"
curl -s http://localhost:50000/health || echo "❌ L'API ne répond pas encore"

echo ""
echo "========================================"
echo "✅ Redémarrage terminé !"
echo ""
echo "Commandes utiles :"
echo "  pm2 status          - Voir le statut"
echo "  pm2 logs fouta-api  - Voir les logs en temps réel"
echo "  curl http://localhost:50000/health - Tester l'API"
echo ""


#!/bin/bash

# Script de correction automatique du serveur
# Usage: bash scripts/corriger-serveur.sh

set -e

PROJECT_DIR="/opt/fouta-erp"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "=========================================="
echo "🔧 CORRECTION AUTOMATIQUE DU SERVEUR"
echo "=========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd "$PROJECT_DIR"

# 1. Sauvegarder le .env
echo "1️⃣ Sauvegarde du .env..."
if [ -f "$BACKEND_DIR/.env" ]; then
    cp "$BACKEND_DIR/.env" ~/.env.backup
    echo -e "${GREEN}✅ .env sauvegardé${NC}"
else
    echo -e "${YELLOW}⚠️ .env non trouvé${NC}"
fi

echo ""

# 2. Installer les dépendances backend
echo "2️⃣ Installation des dépendances backend..."
cd "$BACKEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "   Installation en cours (cela peut prendre 2-3 minutes)..."
    npm install --production
    echo -e "${GREEN}✅ Dépendances installées${NC}"
else
    echo "   node_modules existe déjà"
    echo "   Mise à jour des dépendances..."
    npm install --production
    echo -e "${GREEN}✅ Dépendances mises à jour${NC}"
fi

echo ""

# 3. Arrêter et supprimer l'ancienne instance PM2
echo "3️⃣ Correction de la configuration PM2..."
pm2 stop fouta-api 2>/dev/null || echo "   Application déjà arrêtée"
pm2 delete fouta-api 2>/dev/null || echo "   Application déjà supprimée"
echo -e "${GREEN}✅ Ancienne instance PM2 supprimée${NC}"

echo ""

# 4. Démarrer avec le bon fichier
echo "4️⃣ Démarrage de l'application avec src/server.js..."
cd "$BACKEND_DIR"
pm2 start src/server.js --name fouta-api
pm2 save

echo -e "${GREEN}✅ Application démarrée${NC}"

echo ""

# 5. Attendre que l'application démarre
echo "5️⃣ Attente du démarrage (5 secondes)..."
sleep 5

echo ""

# 6. Vérifier le statut
echo "6️⃣ Vérification du statut..."
echo ""
pm2 status
echo ""

# 7. Vérifier les logs
echo "7️⃣ Dernières lignes des logs..."
echo ""
pm2 logs fouta-api --lines 10 --nostream

echo ""

# 8. Tester la connexion
echo "8️⃣ Test de la connexion backend..."
sleep 2

if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend répond sur http://localhost:5000/health${NC}"
    curl -s http://localhost:5000/health | head -3
else
    echo -e "${YELLOW}⚠️ Backend ne répond pas encore (peut nécessiter plus de temps)${NC}"
    echo "   Vérifiez les logs avec: pm2 logs fouta-api --lines 30"
fi

echo ""

# 9. Vérifier le port
echo "9️⃣ Vérification du port 5000..."
if netstat -tuln 2>/dev/null | grep -q ":5000"; then
    echo -e "${GREEN}✅ Port 5000 est en écoute${NC}"
else
    echo -e "${YELLOW}⚠️ Port 5000 n'est pas encore en écoute${NC}"
    echo "   L'application peut être en cours de démarrage..."
fi

echo ""
echo "=========================================="
echo "✅ Correction terminée"
echo "=========================================="
echo ""
echo "📊 Vérifications:"
echo "   - Statut PM2: pm2 status"
echo "   - Logs: pm2 logs fouta-api --lines 30"
echo "   - Test: curl http://localhost:5000/health"
echo "   - Test HTTPS: curl https://fabrication.laplume-artisanale.tn/health"
echo ""

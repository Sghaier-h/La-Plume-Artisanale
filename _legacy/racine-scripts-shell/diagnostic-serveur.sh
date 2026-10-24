#!/bin/bash

# Script de diagnostic complet pour le serveur
# Usage: bash scripts/diagnostic-serveur.sh

echo "=========================================="
echo "🔍 DIAGNOSTIC COMPLET DU SERVEUR"
echo "=========================================="
echo ""

PROJECT_DIR="/opt/fouta-erp"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier les répertoires
echo "1️⃣ VÉRIFICATION DES RÉPERTOIRES"
echo "--------------------------------"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${GREEN}✅ Répertoire projet existe: $PROJECT_DIR${NC}"
else
    echo -e "${RED}❌ Répertoire projet introuvable: $PROJECT_DIR${NC}"
    exit 1
fi

if [ -d "$BACKEND_DIR" ]; then
    echo -e "${GREEN}✅ Répertoire backend existe: $BACKEND_DIR${NC}"
else
    echo -e "${RED}❌ Répertoire backend introuvable: $BACKEND_DIR${NC}"
fi

if [ -d "$FRONTEND_DIR" ]; then
    echo -e "${GREEN}✅ Répertoire frontend existe: $FRONTEND_DIR${NC}"
else
    echo -e "${YELLOW}⚠️ Répertoire frontend introuvable: $FRONTEND_DIR${NC}"
fi

echo ""

# 2. Vérifier les fichiers essentiels du backend
echo "2️⃣ VÉRIFICATION FICHIERS BACKEND"
echo "--------------------------------"
cd "$BACKEND_DIR" 2>/dev/null || echo "⚠️ Impossible d'accéder au backend"

if [ -f "src/server.js" ]; then
    echo -e "${GREEN}✅ src/server.js existe${NC}"
else
    echo -e "${RED}❌ src/server.js introuvable${NC}"
fi

if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json existe${NC}"
    if grep -q '"main": "src/server.js"' package.json 2>/dev/null; then
        echo -e "${GREEN}✅ package.json pointe vers src/server.js${NC}"
    else
        echo -e "${YELLOW}⚠️ package.json ne pointe pas vers src/server.js${NC}"
    fi
else
    echo -e "${RED}❌ package.json introuvable${NC}"
fi

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env existe${NC}"
    if grep -q "DB_HOST" .env 2>/dev/null; then
        echo -e "${GREEN}✅ .env contient DB_HOST${NC}"
    else
        echo -e "${YELLOW}⚠️ .env ne contient pas DB_HOST${NC}"
    fi
else
    echo -e "${RED}❌ .env introuvable${NC}"
fi

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules existe${NC}"
    MODULE_COUNT=$(ls node_modules 2>/dev/null | wc -l)
    echo "   Nombre de modules: $MODULE_COUNT"
else
    echo -e "${RED}❌ node_modules introuvable${NC}"
fi

echo ""

# 3. Vérifier PM2
echo "3️⃣ VÉRIFICATION PM2"
echo "--------------------------------"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✅ PM2 est installé${NC}"
    echo ""
    echo "📊 Statut PM2:"
    pm2 status || echo "⚠️ Aucune application PM2"
    echo ""
    
    # Vérifier la configuration PM2
    if pm2 list | grep -q "fouta-api"; then
        echo -e "${GREEN}✅ Application 'fouta-api' trouvée${NC}"
        
        # Récupérer le script utilisé par PM2
        PM2_SCRIPT=$(pm2 jlist | grep -o '"script":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "   Script PM2: $PM2_SCRIPT"
        
        if [ "$PM2_SCRIPT" == "src/server.js" ] || [ "$PM2_SCRIPT" == "$BACKEND_DIR/src/server.js" ]; then
            echo -e "${GREEN}✅ PM2 utilise le bon script (src/server.js)${NC}"
        else
            echo -e "${RED}❌ PM2 n'utilise pas src/server.js (utilise: $PM2_SCRIPT)${NC}"
            echo "   Correction nécessaire: pm2 start src/server.js --name fouta-api"
        fi
        
        # Vérifier le statut
        PM2_STATUS=$(pm2 jlist | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
        if [ "$PM2_STATUS" == "online" ]; then
            echo -e "${GREEN}✅ Application PM2 est en ligne${NC}"
        else
            echo -e "${RED}❌ Application PM2 n'est pas en ligne (statut: $PM2_STATUS)${NC}"
        fi
    else
        echo -e "${RED}❌ Application 'fouta-api' introuvable dans PM2${NC}"
    fi
else
    echo -e "${RED}❌ PM2 n'est pas installé${NC}"
fi

echo ""

# 4. Vérifier Nginx
echo "4️⃣ VÉRIFICATION NGINX"
echo "--------------------------------"
if command -v nginx &> /dev/null; then
    echo -e "${GREEN}✅ Nginx est installé${NC}"
    
    # Vérifier la configuration Nginx
    NGINX_CONFIG="/etc/nginx/sites-available/fabrication"
    if [ -f "$NGINX_CONFIG" ]; then
        echo -e "${GREEN}✅ Configuration Nginx trouvée: $NGINX_CONFIG${NC}"
        
        # Vérifier si le frontend est configuré
        if grep -q "root /opt/fouta-erp/frontend" "$NGINX_CONFIG" 2>/dev/null; then
            echo -e "${GREEN}✅ Nginx configure pour servir le frontend${NC}"
        else
            echo -e "${YELLOW}⚠️ Nginx ne semble pas configuré pour servir le frontend${NC}"
        fi
        
        # Vérifier si /api est proxifié
        if grep -q "location /api" "$NGINX_CONFIG" 2>/dev/null; then
            echo -e "${GREEN}✅ Nginx configure pour proxifier /api vers backend${NC}"
        else
            echo -e "${YELLOW}⚠️ Nginx ne semble pas configuré pour proxifier /api${NC}"
        fi
    else
        echo -e "${RED}❌ Configuration Nginx introuvable: $NGINX_CONFIG${NC}"
    fi
    
    # Vérifier le statut Nginx
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Nginx est actif${NC}"
    else
        echo -e "${RED}❌ Nginx n'est pas actif${NC}"
    fi
    
    # Tester la syntaxe de la configuration
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        echo -e "${GREEN}✅ Configuration Nginx valide${NC}"
    else
        echo -e "${RED}❌ Erreur dans la configuration Nginx${NC}"
        sudo nginx -t
    fi
else
    echo -e "${RED}❌ Nginx n'est pas installé${NC}"
fi

echo ""

# 5. Vérifier le frontend
echo "5️⃣ VÉRIFICATION FRONTEND"
echo "--------------------------------"
if [ -d "$FRONTEND_DIR" ]; then
    if [ -f "$FRONTEND_DIR/index.html" ]; then
        echo -e "${GREEN}✅ index.html existe${NC}"
    else
        echo -e "${RED}❌ index.html introuvable${NC}"
    fi
    
    if [ -d "$FRONTEND_DIR/static" ]; then
        STATIC_FILES=$(find "$FRONTEND_DIR/static" -type f 2>/dev/null | wc -l)
        echo "   Fichiers statiques: $STATIC_FILES"
        if [ "$STATIC_FILES" -gt 0 ]; then
            echo -e "${GREEN}✅ Frontend build trouvé${NC}"
        else
            echo -e "${YELLOW}⚠️ Frontend build vide ou introuvable${NC}"
        fi
    else
        echo -e "${RED}❌ Dossier static introuvable${NC}"
    fi
    
    # Vérifier les permissions
    if [ -r "$FRONTEND_DIR/index.html" ]; then
        echo -e "${GREEN}✅ Permissions lecture OK pour index.html${NC}"
    else
        echo -e "${RED}❌ Permissions lecture KO pour index.html${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Frontend non déployé${NC}"
fi

echo ""

# 6. Vérifier la connexion backend
echo "6️⃣ VÉRIFICATION CONNEXION BACKEND"
echo "--------------------------------"
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend répond sur http://localhost:5000/health${NC}"
    curl -s http://localhost:5000/health | head -3
else
    echo -e "${RED}❌ Backend ne répond pas sur http://localhost:5000/health${NC}"
    echo "   Vérifier les logs: pm2 logs fouta-api --lines 20"
fi

echo ""

# 7. Vérifier la connexion HTTPS
echo "7️⃣ VÉRIFICATION HTTPS"
echo "--------------------------------"
if curl -s -k https://fabrication.laplume-artisanale.tn/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ HTTPS fonctionne (https://fabrication.laplume-artisanale.tn/health)${NC}"
    curl -s -k https://fabrication.laplume-artisanale.tn/health | head -3
else
    echo -e "${RED}❌ HTTPS ne répond pas${NC}"
fi

if curl -s -k https://fabrication.laplume-artisanale.tn/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend HTTPS accessible${NC}"
else
    echo -e "${RED}❌ Frontend HTTPS inaccessible${NC}"
fi

echo ""

# 8. Vérifier les ports
echo "8️⃣ VÉRIFICATION PORTS"
echo "--------------------------------"
if netstat -tuln 2>/dev/null | grep -q ":5000"; then
    echo -e "${GREEN}✅ Port 5000 est en écoute${NC}"
else
    echo -e "${RED}❌ Port 5000 n'est pas en écoute${NC}"
fi

if netstat -tuln 2>/dev/null | grep -q ":80\|:443"; then
    echo -e "${GREEN}✅ Ports HTTP/HTTPS sont en écoute${NC}"
else
    echo -e "${YELLOW}⚠️ Ports HTTP/HTTPS ne sont pas en écoute${NC}"
fi

echo ""

# 9. Résumé des problèmes
echo "=========================================="
echo "📋 RÉSUMÉ"
echo "=========================================="
echo ""

PROBLEMS=0

# Vérifier chaque point critique
if [ ! -f "$BACKEND_DIR/src/server.js" ]; then
    echo -e "${RED}❌ PROBLÈME: src/server.js manquant${NC}"
    PROBLEMS=$((PROBLEMS + 1))
fi

if ! pm2 list | grep -q "fouta-api.*online"; then
    echo -e "${RED}❌ PROBLÈME: Application PM2 n'est pas en ligne${NC}"
    PROBLEMS=$((PROBLEMS + 1))
fi

PM2_SCRIPT=$(pm2 jlist 2>/dev/null | grep -o '"script":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$PM2_SCRIPT" ] && [ "$PM2_SCRIPT" != "src/server.js" ] && [ "$PM2_SCRIPT" != "$BACKEND_DIR/src/server.js" ]; then
    echo -e "${RED}❌ PROBLÈME: PM2 n'utilise pas src/server.js (utilise: $PM2_SCRIPT)${NC}"
    PROBLEMS=$((PROBLEMS + 1))
fi

if ! curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${RED}❌ PROBLÈME: Backend ne répond pas sur localhost:5000${NC}"
    PROBLEMS=$((PROBLEMS + 1))
fi

if [ ! -f "$FRONTEND_DIR/index.html" ]; then
    echo -e "${YELLOW}⚠️ ATTENTION: Frontend non déployé${NC}"
fi

if [ "$PROBLEMS" -eq 0 ]; then
    echo -e "${GREEN}✅ Aucun problème critique détecté${NC}"
else
    echo -e "${RED}❌ $PROBLEMS problème(s) détecté(s)${NC}"
    echo ""
    echo "🔧 Commandes de correction suggérées:"
    echo "   cd $BACKEND_DIR"
    echo "   pm2 stop fouta-api"
    echo "   pm2 delete fouta-api"
    echo "   pm2 start src/server.js --name fouta-api"
    echo "   pm2 save"
fi

echo ""
echo "=========================================="
echo "✅ Diagnostic terminé"
echo "=========================================="

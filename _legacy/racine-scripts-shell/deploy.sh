#!/bin/bash

# Script de déploiement automatique pour ERP La Plume Artisanale
# Usage: ./deploy.sh [--skip-git] [--skip-backend] [--skip-frontend]

set -e  # Arrêter en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
PROJECT_DIR="/opt/fouta-erp"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
SKIP_GIT=false
SKIP_BACKEND=false
SKIP_FRONTEND=false

# Parser les arguments
for arg in "$@"; do
    case $arg in
        --skip-git)
            SKIP_GIT=true
            shift
            ;;
        --skip-backend)
            SKIP_BACKEND=true
            shift
            ;;
        --skip-frontend)
            SKIP_FRONTEND=true
            shift
            ;;
        *)
            ;;
    esac
done

echo -e "${BLUE}🚀 Début du déploiement ERP La Plume Artisanale...${NC}"

# Vérifier que nous sommes dans le bon dossier
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Erreur: Le dossier $PROJECT_DIR n'existe pas${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# Étape 1: Mise à jour depuis Git
if [ "$SKIP_GIT" = false ]; then
    echo -e "${YELLOW}📥 Mise à jour du code depuis Git...${NC}"
    if [ -d ".git" ]; then
        git fetch origin
        git pull origin main || git pull origin master
        echo -e "${GREEN}✅ Code mis à jour${NC}"
    else
        echo -e "${YELLOW}⚠️  Pas de dépôt Git détecté, étape ignorée${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Étape Git ignorée${NC}"
fi

# Étape 2: Backend
if [ "$SKIP_BACKEND" = false ]; then
    echo -e "${YELLOW}🔧 Mise à jour du backend...${NC}"
    
    if [ ! -d "$BACKEND_DIR" ]; then
        echo -e "${RED}❌ Erreur: Le dossier backend n'existe pas${NC}"
        exit 1
    fi
    
    cd "$BACKEND_DIR"
    
    # Vérifier que .env existe
    if [ ! -f ".env" ]; then
        echo -e "${RED}❌ Erreur: Le fichier .env n'existe pas dans backend/${NC}"
        echo -e "${YELLOW}💡 Créez le fichier .env avant de continuer${NC}"
        exit 1
    fi
    
    # Installer les dépendances
    echo -e "${BLUE}📦 Installation des dépendances backend...${NC}"
    npm install --production
    
    # Redémarrer PM2
    echo -e "${BLUE}🔄 Redémarrage de l'application PM2...${NC}"
    pm2 restart fouta-api || pm2 start index.js --name fouta-api
    
    # Sauvegarder la configuration PM2
    pm2 save
    
    echo -e "${GREEN}✅ Backend mis à jour${NC}"
    cd "$PROJECT_DIR"
else
    echo -e "${YELLOW}⏭️  Étape Backend ignorée${NC}"
fi

# Étape 3: Frontend
if [ "$SKIP_FRONTEND" = false ]; then
    echo -e "${YELLOW}🎨 Build du frontend...${NC}"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED}❌ Erreur: Le dossier frontend n'existe pas${NC}"
        exit 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # Vérifier que .env.production existe
    if [ ! -f ".env.production" ]; then
        echo -e "${YELLOW}⚠️  .env.production n'existe pas, création...${NC}"
        echo "REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api" > .env.production
    fi
    
    # Installer les dépendances
    echo -e "${BLUE}📦 Installation des dépendances frontend...${NC}"
    npm install --legacy-peer-deps || npm install
    
    # Build
    echo -e "${BLUE}🏗️  Build de production...${NC}"
    npm run build
    
    if [ ! -d "build" ]; then
        echo -e "${RED}❌ Erreur: Le build a échoué (dossier build non créé)${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Frontend buildé avec succès${NC}"
    cd "$PROJECT_DIR"
else
    echo -e "${YELLOW}⏭️  Étape Frontend ignorée${NC}"
fi

# Étape 4: Recharger Nginx
echo -e "${YELLOW}⚙️  Rechargement de Nginx...${NC}"
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx rechargé${NC}"
else
    echo -e "${RED}❌ Erreur: La configuration Nginx est invalide${NC}"
    exit 1
fi

# Étape 5: Vérification finale
echo -e "${BLUE}🔍 Vérification finale...${NC}"

# Vérifier PM2
if pm2 list | grep -q "fouta-api.*online"; then
    echo -e "${GREEN}✅ Application PM2 en ligne${NC}"
else
    echo -e "${RED}❌ Erreur: L'application PM2 n'est pas en ligne${NC}"
    pm2 status
fi

# Vérifier Nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx actif${NC}"
else
    echo -e "${RED}❌ Erreur: Nginx n'est pas actif${NC}"
fi

echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
echo -e "${BLUE}🌐 Application accessible sur: https://fabrication.laplume-artisanale.tn${NC}"

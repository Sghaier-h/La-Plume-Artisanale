#!/bin/bash

# ============================================
# RÉCUPÉRER LE MOT DE PASSE DE LA BASE DE DONNÉES
# ===========================================

echo "=========================================="
echo "🔑 RÉCUPÉRATION DU MOT DE PASSE DB"
echo "=========================================="
echo ""

cd /opt/fouta-erp/backend

if [ ! -f ".env" ]; then
    echo "❌ Fichier .env non trouvé dans /opt/fouta-erp/backend"
    exit 1
fi

echo "📋 Informations de connexion à la base de données :"
echo "-------------------------------------------"

# Afficher les informations (masquer partiellement le mot de passe)
DB_HOST=$(grep "^DB_HOST=" .env | cut -d'=' -f2)
DB_PORT=$(grep "^DB_PORT=" .env | cut -d'=' -f2)
DB_NAME=$(grep "^DB_NAME=" .env | cut -d'=' -f2)
DB_USER=$(grep "^DB_USER=" .env | cut -d'=' -f2)
DB_PASSWORD=$(grep "^DB_PASSWORD=" .env | cut -d'=' -f2)

echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

if [ -n "$DB_PASSWORD" ]; then
    # Afficher le mot de passe (attention : visible en clair)
    echo "🔑 Mot de passe DB (en clair) :"
    echo "-------------------------------------------"
    echo "$DB_PASSWORD"
    echo ""
    echo "⚠️  ATTENTION : Ce mot de passe est visible en clair"
    echo "   Utilisez-le pour vous connecter à la base de données"
else
    echo "❌ DB_PASSWORD non trouvé dans .env"
    echo ""
    echo "Vérifiez le fichier .env manuellement :"
    echo "   cat /opt/fouta-erp/backend/.env | grep DB_"
fi

echo ""
echo "=========================================="
echo "✅ Informations affichées"
echo "=========================================="

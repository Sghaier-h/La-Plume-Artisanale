#!/bin/bash

# ============================================================================
# Script pour exécuter l'ajout des champs created_by/updated_by à TOUTES les tables
# ============================================================================

set -e

echo "============================================================================"
echo "Ajout des champs created_by et updated_by à TOUTES les tables"
echo "============================================================================"

# Charger les variables d'environnement depuis backend/.env
if [ -f "backend/.env" ]; then
    export $(grep -v '^#' backend/.env | grep -E '^(DB_HOST|DB_PORT|DB_NAME|DB_USER|DB_PASSWORD)=' | xargs)
    echo "✅ Variables d'environnement chargées depuis backend/.env"
else
    echo "❌ Erreur: backend/.env introuvable"
    exit 1
fi

# Vérifier que toutes les variables nécessaires sont définies
if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Erreur: Variables d'environnement manquantes"
    exit 1
fi

echo "📊 Connexion à la base de données:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Vérifier que le fichier SQL existe
SQL_FILE="backend/database/add_created_updated_by_all_tables.sql"
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Erreur: Fichier SQL introuvable: $SQL_FILE"
    exit 1
fi

echo "📄 Fichier SQL: $SQL_FILE"
echo ""
echo "⚠️  ATTENTION: Ce script va modifier TOUTES les tables de la base de données"
echo "   Base de données: $DB_NAME"
echo ""
read -p "   Continuer? (oui/non): " confirm

if [ "$confirm" != "oui" ] && [ "$confirm" != "o" ] && [ "$confirm" != "y" ] && [ "$confirm" != "yes" ]; then
    echo "❌ Opération annulée"
    exit 0
fi

echo ""
echo "🔄 Exécution du script SQL..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE" -v ON_ERROR_STOP=1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Script exécuté avec succès!"
    echo ""
    echo "📋 Les champs created_by et updated_by ont été ajoutés à toutes les tables."
    echo ""
else
    echo ""
    echo "❌ Erreur lors de l'exécution du script SQL"
    exit 1
fi

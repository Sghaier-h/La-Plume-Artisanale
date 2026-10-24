#!/bin/bash
# Script Bash pour exécuter le script SQL d'index manquants
# Usage: ./executer-add-indexes.sh

# Charger les variables d'environnement depuis .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-fouta_erp}
DB_USER=${DB_USER:-postgres}
SQL_FILE="backend/database/add_missing_indexes.sql"

if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ]; then
    echo "❌ Erreur : Variables d'environnement manquantes"
    echo "   Assurez-vous que .env contient DB_NAME, DB_USER"
    exit 1
fi

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Erreur : Fichier SQL non trouvé : $SQL_FILE"
    exit 1
fi

echo "📋 Exécution du script SQL : $SQL_FILE"
echo "   Base de données : $DB_NAME sur $DB_HOST:$DB_PORT"

# Vérifier si psql est disponible
if ! command -v psql &> /dev/null; then
    echo ""
    echo "⚠️  psql n'est pas disponible sur ce système"
    echo ""
    echo "Options alternatives :"
    echo "1. Installer PostgreSQL client tools"
    echo "2. Exécuter le script via pgAdmin"
    echo "3. Exécuter via SSH sur le serveur"
    exit 0
fi

# Exécuter le script SQL
echo ""
echo "Exécution de la commande..."

export PGPASSWORD="$DB_PASSWORD"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Script SQL exécuté avec succès !"
    echo "   Les index ont été créés pour optimiser les performances"
else
    echo ""
    echo "❌ Erreur lors de l'exécution du script SQL"
    exit 1
fi

unset PGPASSWORD

#!/bin/bash

# Script pour exécuter add_missing_indexes.sql sur le serveur
# Usage : ./executer-add-indexes-serveur.sh

# Charger les variables d'environnement depuis .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Fichier .env non trouvé. Veuillez vous assurer d'être dans le répertoire backend/"
    exit 1
fi

# Vérifier que les variables sont définies
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
    echo "❌ Variables DB_HOST, DB_USER ou DB_NAME non définies dans .env"
    echo "Valeurs actuelles :"
    echo "  DB_HOST=$DB_HOST"
    echo "  DB_USER=$DB_USER"
    echo "  DB_NAME=$DB_NAME"
    exit 1
fi

# Afficher les informations de connexion (sans le mot de passe)
echo "📊 Exécution du script SQL d'index..."
echo "   Host: $DB_HOST"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"
echo "   Script: database/add_missing_indexes.sql"
echo ""

# Demander le mot de passe si PGPASSWORD n'est pas défini
if [ -z "$DB_PASSWORD" ]; then
    echo "⚠️  DB_PASSWORD non trouvé dans .env"
    echo "   Vous serez invité à saisir le mot de passe PostgreSQL"
    echo ""
    PGPASSWORD_OPTION=""
else
    export PGPASSWORD="$DB_PASSWORD"
    PGPASSWORD_OPTION=""
fi

# Exécuter le script SQL
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/add_missing_indexes.sql

# Vérifier le code de retour
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Script SQL exécuté avec succès !"
else
    echo ""
    echo "❌ Erreur lors de l'exécution du script SQL"
    exit 1
fi

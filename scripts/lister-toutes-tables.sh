#!/bin/bash
# Script pour lister toutes les tables définies dans les scripts SQL
# Usage: bash scripts/lister-toutes-tables.sh

echo "=========================================="
echo "📋 LISTE DE TOUTES LES TABLES DÉFINIES DANS LES SCRIPTS SQL"
echo "=========================================="
echo ""

DATABASE_DIR="database"

if [ ! -d "$DATABASE_DIR" ]; then
    echo "❌ Le dossier $DATABASE_DIR n'existe pas"
    exit 1
fi

echo "🔍 Recherche des CREATE TABLE dans les scripts SQL..."
echo ""

TOTAL_TABLES=0

# Parcourir tous les fichiers SQL
for sql_file in "$DATABASE_DIR"/*.sql; do
    if [ -f "$sql_file" ]; then
        filename=$(basename "$sql_file")
        
        # Extraire les noms de tables
        tables=$(grep -i "CREATE TABLE" "$sql_file" | sed 's/CREATE TABLE[^"]*"\([^"]*\)".*/\1/' | sed 's/CREATE TABLE[^`]*`\([^`]*\)`.*/\1/' | sed 's/CREATE TABLE[[:space:]]*\([a-zA-Z_][a-zA-Z0-9_]*\).*/\1/' | grep -v "^$" | sort -u)
        
        if [ -n "$tables" ]; then
            count=$(echo "$tables" | wc -l)
            TOTAL_TABLES=$((TOTAL_TABLES + count))
            
            echo "📄 $filename ($count table(s)):"
            echo "$tables" | sed 's/^/   - /'
            echo ""
        fi
    fi
done

# Vérifier aussi le schema_pointage.sql dans backend/database
if [ -f "backend/database/schema_pointage.sql" ]; then
    tables=$(grep -i "CREATE TABLE" "backend/database/schema_pointage.sql" | sed 's/CREATE TABLE[^"]*"\([^"]*\)".*/\1/' | sed 's/CREATE TABLE[^`]*`\([^`]*\)`.*/\1/' | sed 's/CREATE TABLE[[:space:]]*\([a-zA-Z_][a-zA-Z0-9_]*\).*/\1/' | grep -v "^$" | sort -u)
    
    if [ -n "$tables" ]; then
        count=$(echo "$tables" | wc -l)
        TOTAL_TABLES=$((TOTAL_TABLES + count))
        
        echo "📄 backend/database/schema_pointage.sql ($count table(s)):"
        echo "$tables" | sed 's/^/   - /'
        echo ""
    fi
fi

echo "=========================================="
echo "📊 RÉSUMÉ"
echo "=========================================="
echo ""
echo "Total de tables définies: $TOTAL_TABLES"
echo ""
echo "💡 Pour vérifier quelles tables existent dans la base de données:"
echo "   bash scripts/verifier-tables-database.sh"
echo ""

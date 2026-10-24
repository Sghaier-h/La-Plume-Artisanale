#!/bin/bash
# Script pour vérifier quelles tables existent dans la base de données
# Usage: bash scripts/verifier-tables-database.sh

set -e

# Charger les variables d'environnement depuis .env
if [ -f "backend/.env" ]; then
    export $(grep -v '^#' backend/.env | xargs)
fi

DB_HOST="${DB_HOST:-sh131616-002.eu.clouddb.ovh.net}"
DB_PORT="${DB_PORT:-35392}"
DB_NAME="${DB_NAME:-ERP_La_Plume}"
DB_USER="${DB_USER:-Aviateur}"
DB_PASSWORD="${DB_PASSWORD}"

echo "=========================================="
echo "🔍 VÉRIFICATION DES TABLES DE LA BASE DE DONNÉES"
echo "=========================================="
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ DB_PASSWORD non défini dans backend/.env"
    echo "   Vérifiez le fichier backend/.env"
    exit 1
fi

echo "📊 Connexion à la base de données..."
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Liste des tables importantes à vérifier
TABLES_TO_CHECK=(
    # Tables de base
    "equipe"
    "utilisateurs"
    "roles"
    "utilisateurs_roles"
    
    # Tables de production
    "of"
    "postes_travail"
    "machines"
    "taches"
    
    # Tables de stock
    "stock"
    "mouvements_stock"
    "entrepots"
    
    # Tables de pointage (TimeMoto)
    "pointage"
    "pointage_resume"
    
    # Tables de qualité
    "controles_qualite"
    "non_conformites"
    
    # Tables de planning
    "planning"
    "planning_taches"
    
    # Tables de commandes
    "commandes"
    "lignes_commande"
    
    # Tables de clients
    "clients"
    
    # Tables de fournisseurs
    "fournisseurs"
    
    # Tables d'articles
    "articles"
    "modeles"
    "matieres_premieres"
)

echo "🔍 Vérification des tables..."
echo ""

# Utiliser psql pour lister toutes les tables
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('pointage', 'pointage_resume') THEN '⚠️  TimeMoto'
        WHEN table_name IN ('equipe', 'utilisateurs', 'roles') THEN '✅ Base'
        WHEN table_name IN ('of', 'taches', 'machines') THEN '✅ Production'
        WHEN table_name IN ('stock', 'mouvements_stock') THEN '✅ Stock'
        WHEN table_name IN ('commandes', 'clients') THEN '✅ Commercial'
        ELSE '✅ Autre'
    END as categorie
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY 
    CASE 
        WHEN table_name IN ('pointage', 'pointage_resume') THEN 1
        WHEN table_name IN ('equipe', 'utilisateurs', 'roles') THEN 2
        WHEN table_name IN ('of', 'taches', 'machines') THEN 3
        WHEN table_name IN ('stock', 'mouvements_stock') THEN 4
        WHEN table_name IN ('commandes', 'clients') THEN 5
        ELSE 6
    END,
    table_name;
" 2>&1 | grep -v "password" || {
    echo "❌ Erreur de connexion à la base de données"
    echo ""
    echo "💡 Vérifications:"
    echo "   1. Vérifiez que DB_PASSWORD est défini dans backend/.env"
    echo "   2. Vérifiez que l'IP du serveur est autorisée dans OVH Cloud DB"
    echo "   3. Vérifiez la connexion réseau"
    exit 1
}

echo ""
echo "=========================================="
echo "📋 VÉRIFICATION DES TABLES IMPORTANTES"
echo "=========================================="
echo ""

MISSING_TABLES=0

for table in "${TABLES_TO_CHECK[@]}"; do
    EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = '$table';
    " 2>/dev/null | tr -d ' ')
    
    if [ "$EXISTS" = "1" ]; then
        echo "✅ $table"
    else
        echo "❌ $table (manquante)"
        MISSING_TABLES=$((MISSING_TABLES + 1))
    fi
done

echo ""
echo "=========================================="
echo "📊 RÉSUMÉ"
echo "=========================================="
echo ""

if [ $MISSING_TABLES -eq 0 ]; then
    echo "✅ Toutes les tables importantes sont présentes"
else
    echo "⚠️  $MISSING_TABLES table(s) manquante(s)"
    echo ""
    echo "💡 Pour créer les tables manquantes:"
    echo "   - Pointage (TimeMoto): database/schema_pointage.sql"
    echo "   - Autres tables: Exécuter les scripts dans database/"
fi

echo ""

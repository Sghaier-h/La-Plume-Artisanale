#!/bin/bash

# ============================================================================
# Script pour exécuter le schéma SQL du module Ventes
# ============================================================================
# Ce script exécute le fichier schema_ventes.sql dans la base de données
#
# Usage:
#   bash scripts/executer-schema-ventes.sh
#   ou
#   ./scripts/executer-schema-ventes.sh
#
# Prérequis:
#   - Le fichier backend/.env doit contenir les variables de connexion DB
#   - psql doit être installé (pour exécution en ligne de commande)
#   - OU utiliser pgAdmin pour exécution manuelle
# ============================================================================

set -e

echo "=========================================="
echo "📦 EXÉCUTION DU SCHÉMA SQL - MODULE VENTES"
echo "=========================================="
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "backend/database/schema_ventes.sql" ]; then
    echo "❌ Erreur: Le fichier backend/database/schema_ventes.sql n'existe pas"
    echo "   Assurez-vous d'être dans le répertoire racine du projet"
    exit 1
fi

# Vérifier que .env existe
if [ ! -f "backend/.env" ]; then
    echo "❌ Erreur: Le fichier backend/.env n'existe pas"
    exit 1
fi

# Charger les variables d'environnement
echo "📁 Chargement des variables d'environnement..."
export $(grep -v '^#' backend/.env | xargs)
echo "✅ Variables chargées"
echo ""

# Vérifier que les variables nécessaires sont définies
if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Erreur: Variables de connexion DB manquantes dans backend/.env"
    echo "   Variables requises: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD"
    exit 1
fi

echo "📊 Configuration de la connexion:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Vérifier si psql est installé
if ! command -v psql &> /dev/null; then
    echo "⚠️  psql n'est pas installé sur ce système"
    echo ""
    echo "📝 EXÉCUTION MANUELLE RECOMMANDÉE:"
    echo "   1. Ouvrez pgAdmin ou votre client PostgreSQL"
    echo "   2. Connectez-vous à la base de données: $DB_NAME"
    echo "   3. Ouvrez le fichier: backend/database/schema_ventes.sql"
    echo "   4. Exécutez le script SQL"
    echo ""
    echo "   OU installez psql pour exécution automatique:"
    echo "   - Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "   - macOS: brew install postgresql"
    exit 1
fi

# Afficher un avertissement
echo "⚠️  ATTENTION: Ce script va créer/modifier des tables dans la base de données"
echo "   Base de données: $DB_NAME"
echo ""
read -p "   Continuer? (oui/non): " confirm

if [ "$confirm" != "oui" ] && [ "$confirm" != "o" ] && [ "$confirm" != "y" ] && [ "$confirm" != "yes" ]; then
    echo "❌ Opération annulée"
    exit 0
fi

echo ""
echo "🚀 Exécution du schéma SQL..."

# Exécuter le schéma SQL
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f backend/database/schema_ventes.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Schéma SQL exécuté avec succès!"
    echo ""
    echo "📊 Tables créées/mises à jour:"
    echo "   - devis, lignes_devis"
    echo "   - bons_livraison, lignes_bl"
    echo "   - factures, lignes_facture"
    echo "   - avoirs, lignes_avoir"
    echo "   - bons_retour, lignes_retour"
    echo ""
    echo "🔧 Fonctions créées:"
    echo "   - generer_numero_devis()"
    echo "   - generer_numero_bl()"
    echo "   - generer_numero_facture()"
    echo "   - generer_numero_avoir()"
    echo "   - generer_numero_retour()"
    echo ""
    echo "✅ Module Vente prêt à être utilisé!"
else
    echo ""
    echo "❌ Erreur lors de l'exécution du schéma SQL"
    echo "   Vérifiez les logs ci-dessus pour plus de détails"
    exit 1
fi

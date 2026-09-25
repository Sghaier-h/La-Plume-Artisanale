#!/bin/bash
# Script pour lister toutes les tables de la base de données avec détails
# Usage: bash scripts/lister-toutes-tables-detaille.sh

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
echo "📋 LISTE COMPLÈTE DES TABLES DE LA BASE DE DONNÉES"
echo "=========================================="
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ DB_PASSWORD non défini dans backend/.env"
    exit 1
fi

echo "📊 Connexion à la base de données..."
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Test de connexion
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Erreur de connexion à la base de données"
    echo "   Vérifiez que l'IP du serveur est autorisée dans OVH Cloud DB"
    exit 1
fi

echo "1️⃣ Liste de toutes les tables avec nombre d'enregistrements..."
echo ""

PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    table_name as \"Nom de la table\",
    CASE 
        WHEN table_name IN ('equipe', 'utilisateurs', 'roles', 'utilisateurs_roles') THEN '👥 Base/Gestion'
        WHEN table_name IN ('pointage', 'pointage_resume') THEN '⏰ Pointage (TimeMoto)'
        WHEN table_name IN ('of', 'ordres_fabrication', 'sous_of', 'machines', 'selecteurs', 'planning_machines', 'suivi_fabrication', 'suivi_finition', 'operations_finition', 'equipe_fabrication', 'ensouples', 'ensouples_attributions', 'lots_coupe', 'incidents_production', 'arrets_production') THEN '🏭 Production'
        WHEN table_name IN ('stock', 'mouvements_stock', 'entrepots', 'stock_mp', 'stock_produits_finis', 'mouvements_mp', 'inventaires_mp', 'inventaires_mp_detail', 'inventaires_pf', 'inventaires_pf_detail', 'preparation_mp', 'historique_livraisons_mp') THEN '📦 Stock'
        WHEN table_name IN ('commandes', 'lignes_commande', 'articles_commande', 'articles_catalogue', 'demandes_completion_commande', 'expeditions', 'expedition_colis', 'expedition_colis_detail', 'expedition_palettes') THEN '🛒 Commandes/Expédition'
        WHEN table_name IN ('clients', 'fournisseurs', 'soustraitants') THEN '👤 Relations'
        WHEN table_name IN ('articles', 'modeles', 'matieres_premieres', 'types_articles') THEN '📄 Articles'
        WHEN table_name IN ('controles_qualite', 'non_conformites', 'procedures_nc', 'controle_premiere_piece', 'demandes_controle_qualite', 'conditions_acceptation_2eme_choix', 'declarations_2eme_choix', 'grille_prix_2eme_choix', 'historique_mouvements_2eme_choix', 'motifs_2eme_choix') THEN '✅ Qualité'
        WHEN table_name IN ('planning', 'planning_taches', 'planning_machines') THEN '📅 Planning'
        WHEN table_name IN ('alertes_actives', 'historique_alertes', 'types_alertes', 'notifications_demandes') THEN '🚨 Alertes/Notifications'
        WHEN table_name IN ('demandes_achat_pieces', 'demandes_expedition', 'demandes_finition', 'demandes_intervention', 'demandes_mp_tisseur', 'demandes_ourdissage', 'demandes_retour_mp', 'sla_interventions') THEN '📋 Demandes'
        WHEN table_name IN ('mouvements_sous_traitance', 'mouvements_st_detail', 'sous_traitants') THEN '🔧 Sous-traitance'
        WHEN table_name IN ('devices_mobile') THEN '📱 Mobile'
        WHEN table_name IN ('logs_systeme', 'sync_queue', 'parametres_systeme') THEN '📝 Système'
        WHEN table_name IN ('spatial_ref_sys') THEN '🗺️ Géographie'
        ELSE '📋 Autre'
    END as \"Catégorie\"
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY 
    CASE 
        WHEN table_name IN ('equipe', 'utilisateurs', 'roles') THEN 1
        WHEN table_name IN ('pointage', 'pointage_resume') THEN 2
        WHEN table_name IN ('of', 'ordres_fabrication') THEN 3
        WHEN table_name IN ('stock', 'mouvements_stock') THEN 4
        WHEN table_name IN ('commandes', 'clients') THEN 5
        WHEN table_name IN ('articles', 'modeles') THEN 6
        ELSE 7
    END,
    table_name;
"

echo ""
echo "2️⃣ Statistiques détaillées par catégorie..."
echo ""

# Statistiques par catégorie
echo "📊 Tables de Base/Gestion:"
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT 
    '  ' || table_name || ': ' || 
    COALESCE((SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name)::text, '0') || ' colonnes, ' ||
    COALESCE((SELECT COUNT(*)::text FROM information_schema.tables WHERE table_name = t.table_name AND EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = t.table_name
    ))::text, '0') || ' enregistrements'
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('equipe', 'utilisateurs', 'roles', 'utilisateurs_roles')
ORDER BY table_name;
" 2>/dev/null | while read line; do
    if [ -n "$line" ]; then
        echo "$line"
    fi
done

echo ""
echo "📊 Tables de Pointage (TimeMoto):"
for table in "pointage" "pointage_resume"; do
    COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ' || echo "N/A")
    echo "  $table: $COUNT enregistrement(s)"
done

echo ""
echo "📊 Tables de Production:"
PROD_TABLES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('of', 'ordres_fabrication', 'postes_travail', 'machines', 'taches', 'sous_of', 'suivi_fabrication', 'suivi_finition')
ORDER BY table_name;
" 2>/dev/null | tr -d ' ')

if [ -z "$PROD_TABLES" ]; then
    echo "  Aucune table de production trouvée"
else
    echo "$PROD_TABLES" | while read table; do
        if [ -n "$table" ]; then
            COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ' || echo "0")
            echo "  ✅ $table: $COUNT enregistrement(s)"
        fi
    done
fi

echo ""
echo "📊 Tables de Stock:"
STOCK_TABLES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('stock', 'mouvements_stock', 'entrepots', 'stock_mp', 'stock_produits_finis', 'mouvements_mp', 'inventaires_mp', 'inventaires_pf')
ORDER BY table_name;
" 2>/dev/null | tr -d ' ')

if [ -z "$STOCK_TABLES" ]; then
    echo "  Aucune table de stock trouvée"
else
    echo "$STOCK_TABLES" | while read table; do
        if [ -n "$table" ]; then
            COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ' || echo "0")
            echo "  ✅ $table: $COUNT enregistrement(s)"
        fi
    done
fi

echo ""
echo "📊 Tables Commerciales:"
COMM_TABLES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('commandes', 'clients', 'fournisseurs', 'articles_commande', 'lignes_commande')
ORDER BY table_name;
" 2>/dev/null | tr -d ' ')

if [ -z "$COMM_TABLES" ]; then
    echo "  Aucune table commerciale trouvée"
else
    echo "$COMM_TABLES" | while read table; do
        if [ -n "$table" ]; then
            COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ' || echo "0")
            echo "  ✅ $table: $COUNT enregistrement(s)"
        fi
    done
fi

echo ""
echo "3️⃣ Résumé global..."
echo ""

TOTAL_TABLES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
" 2>/dev/null | tr -d ' ')

echo "   Total de tables: $TOTAL_TABLES"
echo ""

echo "=========================================="
echo "✅ Liste terminée"
echo "=========================================="

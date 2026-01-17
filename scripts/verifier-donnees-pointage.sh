#!/bin/bash

# ============================================
# VÉRIFICATION DES DONNÉES DE POINTAGE
# ============================================

echo "=========================================="
echo "🔍 VÉRIFICATION DES DONNÉES DE POINTAGE"
echo "=========================================="
echo ""

# Charger les variables d'environnement depuis backend/.env
if [ -f "/opt/fouta-erp/backend/.env" ]; then
    export $(grep -v '^#' /opt/fouta-erp/backend/.env | xargs)
else
    echo "❌ Fichier .env non trouvé"
    exit 1
fi

# Variables de connexion
DB_HOST="${DB_HOST:-sh131616-002.eu.clouddb.ovh.net}"
DB_PORT="${DB_PORT:-35392}"
DB_NAME="${DB_NAME:-ERP_La_Plume}"
DB_USER="${DB_USER:-Aviateur}"
DB_PASSWORD="${DB_PASSWORD}"

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ DB_PASSWORD non défini dans .env"
    exit 1
fi

echo "1️⃣ Vérification de l'existence des tables..."
echo "-------------------------------------------"

# Vérifier si les tables existent
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pointage') 
        THEN '✅ Table pointage existe'
        ELSE '❌ Table pointage N''EXISTE PAS'
    END as status_pointage,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pointage_resume') 
        THEN '✅ Table pointage_resume existe'
        ELSE '❌ Table pointage_resume N''EXISTE PAS'
    END as status_resume,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'equipe' AND column_name = 'timemoto_user_id'
        ) 
        THEN '✅ Colonne timemoto_user_id existe dans equipe'
        ELSE '❌ Colonne timemoto_user_id N''EXISTE PAS dans equipe'
    END as status_timemoto_id,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'equipe' AND column_name = 'temps_travaille_mois'
        ) 
        THEN '✅ Colonne temps_travaille_mois existe dans equipe'
        ELSE '❌ Colonne temps_travaille_mois N''EXISTE PAS dans equipe'
    END as status_temps_mois;
" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "❌ Erreur de connexion à la base de données"
    echo "   Vérifiez les variables DB_* dans backend/.env"
    exit 1
fi

echo ""
echo "2️⃣ Statistiques des données de pointage..."
echo "-------------------------------------------"

# Compter les enregistrements
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    '📊 Pointages totaux' as type,
    COUNT(*)::text as nombre
FROM pointage
UNION ALL
SELECT 
    '📊 Pointages ce mois',
    COUNT(*)::text
FROM pointage
WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
UNION ALL
SELECT 
    '📊 Pointages aujourd''hui',
    COUNT(*)::text
FROM pointage
WHERE date = CURRENT_DATE
UNION ALL
SELECT 
    '📊 Résumés mensuels',
    COUNT(*)::text
FROM pointage_resume
UNION ALL
SELECT 
    '👥 Utilisateurs avec timemoto_user_id',
    COUNT(*)::text
FROM equipe
WHERE timemoto_user_id IS NOT NULL;
" 2>/dev/null

echo ""
echo "3️⃣ Derniers pointages enregistrés (10 derniers)..."
echo "-------------------------------------------"

PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    p.id,
    p.timemoto_id,
    e.nom || ' ' || e.prenom as utilisateur,
    p.date,
    p.check_in::time as arrivee,
    p.check_out::time as depart,
    p.heures_travaillees as heures,
    CASE WHEN p.present THEN '✅ Présent' ELSE '❌ Absent' END as statut,
    p.retard_minutes || ' min' as retard,
    p.created_at::timestamp(0) as cree_le
FROM pointage p
LEFT JOIN equipe e ON p.user_id = e.id
ORDER BY p.created_at DESC
LIMIT 10;
" 2>/dev/null

echo ""
echo "4️⃣ Vérification des logs backend (derniers webhooks)..."
echo "-------------------------------------------"
echo "Exécutez sur le serveur : pm2 logs fouta-api --lines 50 | grep -i 'webhook\|pointage'"
echo ""

echo "=========================================="
echo "✅ Vérification terminée"
echo "=========================================="

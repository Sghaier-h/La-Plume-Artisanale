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

# Vérifier si psql est installé
if ! command -v psql &> /dev/null; then
    echo "❌ psql n'est pas installé"
    echo "   Installez-le avec: sudo apt-get install postgresql-client"
    exit 1
fi

echo "1️⃣ Test de connexion à la base de données..."
echo "-------------------------------------------"
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT '✅ Connexion réussie' as status;" 2>&1

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Erreur de connexion à la base de données"
    echo "   Vérifiez les variables DB_* dans backend/.env"
    echo "   Host: $DB_HOST"
    echo "   Port: $DB_PORT"
    echo "   Database: $DB_NAME"
    echo "   User: $DB_USER"
    exit 1
fi

echo ""
echo "2️⃣ Vérification de l'existence des tables..."
echo "-------------------------------------------"

# Vérifier si les tables existent
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pointage') 
        THEN '✅ Table pointage existe'
        ELSE '❌ Table pointage N''EXISTE PAS'
    END as status_pointage;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pointage_resume') 
        THEN '✅ Table pointage_resume existe'
        ELSE '❌ Table pointage_resume N''EXISTE PAS'
    END as status_resume;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'equipe' AND column_name = 'timemoto_user_id'
        ) 
        THEN '✅ Colonne timemoto_user_id existe dans equipe'
        ELSE '❌ Colonne timemoto_user_id N''EXISTE PAS dans equipe'
    END as status_timemoto_id;
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'equipe' AND column_name = 'temps_travaille_mois'
        ) 
        THEN '✅ Colonne temps_travaille_mois existe dans equipe'
        ELSE '❌ Colonne temps_travaille_mois N''EXISTE PAS dans equipe'
    END as status_temps_mois;
" 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la vérification des tables"
    exit 1
fi

echo ""
echo "3️⃣ Statistiques des données de pointage..."
echo "-------------------------------------------"

# Vérifier d'abord si la table pointage existe avant de compter
TABLE_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pointage');" 2>&1 | tr -d ' ')

if [ "$TABLE_EXISTS" = "t" ]; then
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
        '👥 Utilisateurs avec timemoto_user_id',
        COUNT(*)::text
    FROM equipe
    WHERE timemoto_user_id IS NOT NULL;
    " 2>&1
    
    RESUME_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pointage_resume');" 2>&1 | tr -d ' ')
    if [ "$RESUME_EXISTS" = "t" ]; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT 
            '📊 Résumés mensuels' as type,
            COUNT(*)::text as nombre
        FROM pointage_resume;
        " 2>&1
    fi
else
    echo "⚠️  La table pointage n'existe pas encore"
    echo "   Exécutez le script SQL: backend/database/schema_pointage.sql"
fi

echo ""
echo "4️⃣ Derniers pointages enregistrés (10 derniers)..."
echo "-------------------------------------------"

TABLE_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pointage');" 2>&1 | tr -d ' ')

if [ "$TABLE_EXISTS" = "t" ]; then
    COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM pointage;" 2>&1 | tr -d ' ')
    if [ "$COUNT" -gt 0 ]; then
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT 
            p.id,
            p.timemoto_id,
            COALESCE(e.nom || ' ' || e.prenom, 'Utilisateur ' || p.user_id) as utilisateur,
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
        " 2>&1
    else
        echo "⚠️  Aucun pointage enregistré pour le moment"
        echo "   Les webhooks TimeMoto fonctionnent, mais aucune donnée n'a été enregistrée"
        echo "   Vérifiez que les utilisateurs ont un timemoto_user_id dans la table equipe"
    fi
else
    echo "⚠️  La table pointage n'existe pas encore"
fi

echo ""
echo "5️⃣ Vérification des logs backend (derniers webhooks)..."
echo "-------------------------------------------"
echo "Exécutez sur le serveur : pm2 logs fouta-api --lines 50 | grep -i 'webhook\|pointage'"
echo ""

echo "=========================================="
echo "✅ Vérification terminée"
echo "=========================================="

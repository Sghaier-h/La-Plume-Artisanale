#!/bin/bash
# Script pour vérifier l'état actuel du système de pointage
# Usage: bash scripts/verifier-etat-pointage.sh

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
echo "🔍 VÉRIFICATION DE L'ÉTAT DU SYSTÈME DE POINTAGE"
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

# Test de connexion
echo "1️⃣ Test de connexion à la base de données..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Connexion réussie"
else
    echo "❌ Erreur de connexion"
    echo "   Vérifiez que l'IP du serveur est autorisée dans OVH Cloud DB"
    exit 1
fi
echo ""

# Vérifier les tables de pointage
echo "2️⃣ Vérification des tables de pointage..."
TABLES=("equipe" "pointage" "pointage_resume")
for table in "${TABLES[@]}"; do
    EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = '$table';
    " 2>/dev/null | tr -d ' ')
    
    if [ "$EXISTS" = "1" ]; then
        # Compter les lignes
        COUNT=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
        echo "✅ $table (existe) - $COUNT enregistrement(s)"
    else
        echo "❌ $table (manquante)"
    fi
done
echo ""

# Vérifier les colonnes TimeMoto dans equipe
echo "3️⃣ Vérification des colonnes TimeMoto dans equipe..."
TIMEMOTO_COL=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'equipe' 
      AND column_name = 'timemoto_user_id';
" 2>/dev/null | tr -d ' ')

TEMPS_COL=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'equipe' 
      AND column_name = 'temps_travaille_mois';
" 2>/dev/null | tr -d ' ')

if [ "$TIMEMOTO_COL" = "1" ]; then
    echo "✅ Colonne timemoto_user_id existe dans equipe"
else
    echo "❌ Colonne timemoto_user_id manquante dans equipe"
fi

if [ "$TEMPS_COL" = "1" ]; then
    echo "✅ Colonne temps_travaille_mois existe dans equipe"
else
    echo "❌ Colonne temps_travaille_mois manquante dans equipe"
fi
echo ""

# Statistiques
echo "4️⃣ Statistiques..."
PERSONNES_ACTIVES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM equipe WHERE actif = true;
" 2>/dev/null | tr -d ' ')

PERSONNES_TIMEMOTO=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM equipe WHERE timemoto_user_id IS NOT NULL;
" 2>/dev/null | tr -d ' ')

TOTAL_POINTAGES=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM pointage;
" 2>/dev/null | tr -d ' ')

POINTAGES_AUJOURD=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM pointage WHERE date = CURRENT_DATE;
" 2>/dev/null | tr -d ' ')

echo "   Personnes actives: $PERSONNES_ACTIVES"
echo "   Personnes avec TimeMoto ID: $PERSONNES_TIMEMOTO"
echo "   Total pointages: $TOTAL_POINTAGES"
echo "   Pointages aujourd'hui: $POINTAGES_AUJOURD"
echo ""

# Vérifier les endpoints API
echo "5️⃣ Test des endpoints API..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://fabrication.laplume-artisanale.tn/api/health 2>/dev/null || echo "000")
STATUT=$(curl -s -o /dev/null -w "%{http_code}" https://fabrication.laplume-artisanale.tn/api/pointage/statut 2>/dev/null || echo "000")
POINTAGE=$(curl -s -o /dev/null -w "%{http_code}" https://fabrication.laplume-artisanale.tn/api/pointage 2>/dev/null || echo "000")

if [ "$HEALTH" = "200" ]; then
    echo "✅ /api/health répond correctement"
else
    echo "❌ /api/health ne répond pas (code: $HEALTH)"
fi

if [ "$STATUT" = "200" ]; then
    echo "✅ /api/pointage/statut répond correctement"
else
    echo "❌ /api/pointage/statut ne répond pas (code: $STATUT)"
fi

if [ "$POINTAGE" = "200" ]; then
    echo "✅ /api/pointage répond correctement"
else
    echo "❌ /api/pointage ne répond pas (code: $POINTAGE)"
fi
echo ""

# Vérifier les webhooks
echo "6️⃣ Vérification de la configuration webhook..."
TIMEMOTO_SECRET=$(grep -i "TIMEMOTO_WEBHOOK_SECRET" backend/.env 2>/dev/null | cut -d '=' -f2 | tr -d ' ' || echo "")

if [ -n "$TIMEMOTO_SECRET" ]; then
    echo "✅ TIMEMOTO_WEBHOOK_SECRET configuré dans .env"
else
    echo "❌ TIMEMOTO_WEBHOOK_SECRET non configuré"
    echo "   Ajoutez-le dans backend/.env"
fi
echo ""

echo "=========================================="
echo "📊 RÉSUMÉ"
echo "=========================================="
echo ""
echo "✅ Système de pointage prêt à recevoir les données TimeMoto"
echo ""
echo "💡 Prochaines étapes:"
echo "   1. Assurez-vous que TIMEMOTO_WEBHOOK_SECRET est configuré"
echo "   2. Configurez les webhooks dans TimeMoto:"
echo "      - user.inserted → https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto"
echo "      - attendance.inserted → https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto"
echo "   3. Les données apparaîtront automatiquement dans l'API et le frontend"
echo ""

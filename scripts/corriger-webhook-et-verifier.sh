#!/bin/bash

# ============================================
# CORRIGER CONFIGURATION WEBHOOK ET VÉRIFIER
# ===========================================

echo "=========================================="
echo "🔧 CORRECTION CONFIGURATION WEBHOOK"
echo "=========================================="
echo ""

cd /opt/fouta-erp

# 1. Vérifier que TIMEMOTO_WEBHOOK_SECRET est dans .env
echo "1️⃣ Vérification de la clé secrète TimeMoto..."
echo "-------------------------------------------"

if [ -f "backend/.env" ]; then
    if grep -q "TIMEMOTO_WEBHOOK_SECRET" backend/.env; then
        echo "✅ TIMEMOTO_WEBHOOK_SECRET trouvé dans .env"
        # Afficher (masquer la valeur)
        grep "TIMEMOTO_WEBHOOK_SECRET" backend/.env | sed 's/=.*/=***/'
    else
        echo "❌ TIMEMOTO_WEBHOOK_SECRET non trouvé dans .env"
        echo ""
        echo "Ajoutez cette ligne dans backend/.env :"
        echo "TIMEMOTO_WEBHOOK_SECRET=tmkey_ITbQcHWyShL8vSFW09IN81cPUpHBbGgS"
        exit 1
    fi
else
    echo "❌ Fichier backend/.env non trouvé"
    exit 1
fi

echo ""
echo "2️⃣ Redémarrage du backend avec mise à jour des variables d'environnement..."
echo "-------------------------------------------"
cd backend
pm2 restart fouta-api --update-env

echo ""
echo "3️⃣ Attente du démarrage (3 secondes)..."
sleep 3

echo ""
echo "4️⃣ Vérification du statut..."
pm2 status

echo ""
echo "5️⃣ Test de l'endpoint webhook..."
echo "-------------------------------------------"
curl -s https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto/test | python3 -m json.tool 2>/dev/null || curl -s https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto/test

echo ""
echo "=========================================="
echo "✅ Correction terminée"
echo "=========================================="
echo ""
echo "⚠️  IMPORTANT :"
echo "   - Les webhooks TimeMoto sont reçus mais échouent à cause de la connexion DB"
echo "   - Vous devez exécuter le schéma SQL via pgAdmin ou DBeaver"
echo "   - Voir: docs/database/EXECUTER_SCHEMA_POINTAGE.md"
echo ""
echo "📋 Pour vérifier les logs après correction :"
echo "   pm2 logs fouta-api --lines 20 | grep -i webhook"

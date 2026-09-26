#!/bin/bash

# ============================================
# VÉRIFIER LES WEBHOOKS APRÈS CRÉATION DES TABLES
# ===========================================

echo "=========================================="
echo "🔍 VÉRIFICATION DES WEBHOOKS APRÈS TABLES"
echo "=========================================="
echo ""

echo "1️⃣ Vérification via l'API..."
echo "-------------------------------------------"
curl -s https://fabrication.laplume-artisanale.tn/api/database/verifier-tables-pointage | python3 -m json.tool

echo ""
echo "2️⃣ Derniers logs webhooks (30 lignes)..."
echo "-------------------------------------------"
pm2 logs fouta-api --lines 30 --nostream | grep -i "webhook\|pointage\|timemoto" || echo "Aucun log webhook récent"

echo ""
echo "3️⃣ Vérification des erreurs récentes..."
echo "-------------------------------------------"
ERRORS=$(pm2 logs fouta-api --lines 20 --nostream --err | grep -i "connection timeout\|relation.*does not exist" | head -5)

if [ -z "$ERRORS" ]; then
    echo "✅ Aucune erreur de connexion ou de table manquante"
else
    echo "⚠️  Erreurs détectées :"
    echo "$ERRORS"
fi

echo ""
echo "=========================================="
echo "✅ Vérification terminée"
echo "=========================================="
echo ""
echo "📋 Notes importantes :"
echo "   - Les tables sont créées ✅"
echo "   - Les webhooks TimeMoto peuvent maintenant enregistrer des données"
echo "   - Pour que les webhooks fonctionnent, les utilisateurs doivent avoir un"
echo "     'timemoto_user_id' dans la table equipe"
echo ""
echo "🔍 Pour surveiller les webhooks en temps réel :"
echo "   pm2 logs fouta-api --lines 50 | grep -i webhook"

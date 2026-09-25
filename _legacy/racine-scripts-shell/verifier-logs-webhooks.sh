#!/bin/bash

# ============================================
# VÉRIFIER LES LOGS DES WEBHOOKS TIMEMOTO
# ===========================================

echo "=========================================="
echo "🔍 VÉRIFICATION DES LOGS WEBHOOKS TIMEMOTO"
echo "=========================================="
echo ""

echo "📋 Derniers logs du backend (50 lignes)..."
echo "-------------------------------------------"
pm2 logs fouta-api --lines 50 --nostream | grep -i "webhook\|pointage\|timemoto" || echo "Aucun log webhook trouvé"

echo ""
echo "📋 Toutes les erreurs récentes..."
echo "-------------------------------------------"
pm2 logs fouta-api --lines 30 --nostream --err || echo "Aucune erreur récente"

echo ""
echo "=========================================="
echo "✅ Vérification terminée"
echo "=========================================="
echo ""
echo "💡 Si vous voyez des erreurs 'relation pointage does not exist',"
echo "   cela signifie que les tables n'ont pas encore été créées."
echo "   Exécutez le schéma SQL via pgAdmin ou DBeaver."
echo "   Voir: docs/database/EXECUTER_SCHEMA_POINTAGE.md"

#!/bin/bash

# ============================================
# VÉRIFICATION DES DONNÉES DE POINTAGE VIA API
# ============================================

echo "=========================================="
echo "🔍 VÉRIFICATION DES DONNÉES DE POINTAGE"
echo "=========================================="
echo ""

# URL de l'API
API_URL="${API_URL:-https://fabrication.laplume-artisanale.tn}"
ENDPOINT="$API_URL/api/database/verifier-tables-pointage"

echo "📡 Appel de l'endpoint API..."
echo "   URL: $ENDPOINT"
echo ""

# Appeler l'endpoint
RESPONSE=$(curl -s "$ENDPOINT" 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'appel à l'API"
    echo "$RESPONSE"
    exit 1
fi

# Afficher la réponse formatée
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

echo ""
echo "=========================================="
echo "✅ Vérification terminée"
echo "=========================================="

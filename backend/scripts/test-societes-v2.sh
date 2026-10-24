#!/usr/bin/env bash
# scripts/test-societes-v2.sh
#
# Test manuel : GET /api/v2/societes et vue consolidée.
#
# Pré-requis : variables d'env TOKEN (JWT admin) et optionnellement
# API_URL (défaut http://localhost:5000).
#
# Usage :
#   TOKEN=eyJhbGciOi... ./scripts/test-societes-v2.sh
#   API_URL=http://localhost:5000 TOKEN=... ./scripts/test-societes-v2.sh
set -euo pipefail

API_URL="${API_URL:-http://localhost:5000}"
TOKEN="${TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "[test-societes-v2] ERREUR : définissez TOKEN=<jwt>" >&2
  exit 2
fi

echo "[test-societes-v2] 1) Liste des sociétés visibles"
curl -sS -H "Authorization: Bearer $TOKEN" "$API_URL/api/v2/societes" | head -c 4000
echo

echo "[test-societes-v2] 2) Détail de la société id=1 (LP)"
curl -sS -H "Authorization: Bearer $TOKEN" "$API_URL/api/v2/societes/1" | head -c 2000
echo

echo "[test-societes-v2] 3) Bascule vers société id=2"
curl -sS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-societe-id: 2" \
  "$API_URL/api/v2/societes/2/basculer" | head -c 2000
echo

echo "[test-societes-v2] 4) Vue consolidée (admin)"
curl -sS -H "Authorization: Bearer $TOKEN" \
  -H "x-societe-id: ALL" \
  "$API_URL/api/v2/societes/consolide/ventes" | head -c 4000
echo

#!/bin/bash

# ============================================
# RÉSOUDRE CONFLIT GIT ET VÉRIFIER POINTAGE
# ===========================================

cd /opt/fouta-erp

echo "1️⃣ Résolution du conflit Git..."
echo "-------------------------------------------"

# Sauvegarder les modifications locales si nécessaire
if [ -f "scripts/verifier-donnees-pointage.sh" ]; then
    echo "💾 Sauvegarde des modifications locales..."
    cp scripts/verifier-donnees-pointage.sh scripts/verifier-donnees-pointage.sh.backup 2>/dev/null || true
fi

# Forcer la mise à jour depuis GitHub
echo "📥 Mise à jour depuis GitHub..."
git fetch origin
git reset --hard origin/main

echo "✅ Code mis à jour"
echo ""

# Maintenant exécuter le script de vérification
echo "2️⃣ Exécution de la vérification des données..."
echo "-------------------------------------------"
bash scripts/verifier-donnees-pointage.sh

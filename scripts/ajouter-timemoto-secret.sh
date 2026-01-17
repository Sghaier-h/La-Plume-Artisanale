#!/bin/bash

# ============================================
# AJOUTER LA CLÉ SECRÈTE TIMEMOTO DANS .ENV
# ===========================================

cd /opt/fouta-erp/backend

ENV_FILE=".env"
SECRET_KEY="tmkey_ITbQcHWyShL8vSFW09IN81cPUpHBbGgS"

echo "=========================================="
echo "🔑 AJOUT DE LA CLÉ SECRÈTE TIMEMOTO"
echo "=========================================="
echo ""

# Vérifier si le fichier .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Fichier .env non trouvé"
    exit 1
fi

# Vérifier si la clé existe déjà
if grep -q "TIMEMOTO_WEBHOOK_SECRET" "$ENV_FILE"; then
    echo "⚠️  TIMEMOTO_WEBHOOK_SECRET existe déjà dans .env"
    echo ""
    echo "Valeur actuelle:"
    grep "TIMEMOTO_WEBHOOK_SECRET" "$ENV_FILE"
    echo ""
    read -p "Voulez-vous la remplacer? (o/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        echo "❌ Opération annulée"
        exit 0
    fi
    # Supprimer l'ancienne ligne
    sed -i '/TIMEMOTO_WEBHOOK_SECRET/d' "$ENV_FILE"
fi

# Ajouter la clé secrète
echo "" >> "$ENV_FILE"
echo "# Clé secrète TimeMoto pour vérification des webhooks" >> "$ENV_FILE"
echo "TIMEMOTO_WEBHOOK_SECRET=$SECRET_KEY" >> "$ENV_FILE"

echo "✅ Clé secrète ajoutée dans .env"
echo ""
echo "Vérification:"
grep "TIMEMOTO_WEBHOOK_SECRET" "$ENV_FILE" | sed 's/=.*/=***/'
echo ""
echo "🔄 Redémarrage du backend avec --update-env..."
cd /opt/fouta-erp/backend
pm2 restart fouta-api --update-env

echo ""
echo "✅ Terminé !"
echo ""
echo "📋 Pour vérifier que la clé est chargée:"
echo "   pm2 logs fouta-api --lines 10 | grep -i timemoto"

#!/bin/bash

# Script pour déployer depuis votre machine locale
# Usage: bash deploy-from-local.sh

set -e

SSH_HOST="allbyfb@46.105.204.30"
SSH_PASS="Allbyfouta007"
SCRIPT_URL="https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-auto.sh"

echo "🚀 Déploiement depuis machine locale"
echo "====================================="

# Vérifier sshpass
if ! command -v sshpass &> /dev/null; then
    echo "📦 Installation de sshpass..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install -y sshpass
    else
        echo "❌ Veuillez installer sshpass manuellement"
        exit 1
    fi
fi

echo "🔌 Connexion au serveur..."
echo "📤 Téléchargement et exécution du script..."

sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no $SSH_HOST << 'ENDSSH'
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-auto.sh)
ENDSSH

echo ""
echo "✅ Déploiement terminé !"
echo "🌐 Testez : curl https://fabrication.laplume-artisanale.tn/health"


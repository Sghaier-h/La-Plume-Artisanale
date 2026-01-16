#!/bin/bash

# Script pour trouver automatiquement le backend et executer le schema de pointage

echo "🔍 Recherche du repertoire backend..."

# Chemins possibles
POSSIBLE_PATHS=(
    "/opt/fouta-erp/backend"
    "/var/www/fouta-erp/backend"
    "/home/ubuntu/fouta-erp/backend"
    "/home/ubuntu/La-Plume-Artisanale/backend"
    "$HOME/fouta-erp/backend"
    "$HOME/La-Plume-Artisanale/backend"
    "$(pwd)/backend"
    "$(dirname "$0")"
)

BACKEND_PATH=""

# Chercher le backend
for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -d "$path" ] && [ -f "$path/package.json" ]; then
        BACKEND_PATH="$path"
        echo "✅ Backend trouve : $BACKEND_PATH"
        break
    fi
done

# Si pas trouve, chercher recursivement
if [ -z "$BACKEND_PATH" ]; then
    echo "🔍 Recherche recursive dans le home directory..."
    BACKEND_PATH=$(find ~ -type d -name "backend" -path "*/La-Plume-Artisanale/backend" -o -path "*/fouta-erp/backend" 2>/dev/null | head -1)
    
    if [ -n "$BACKEND_PATH" ] && [ -f "$BACKEND_PATH/package.json" ]; then
        echo "✅ Backend trouve : $BACKEND_PATH"
    else
        echo "❌ Backend non trouve automatiquement"
        echo ""
        echo "💡 Veuillez executer manuellement :"
        echo "   1. Trouvez le chemin du backend :"
        echo "      find ~ -type d -name 'backend' -path '*La-Plume-Artisanale*'"
        echo ""
        echo "   2. Allez dans ce repertoire :"
        echo "      cd /chemin/vers/backend"
        echo ""
        echo "   3. Executez le script :"
        echo "      node executer-schema-production.js"
        exit 1
    fi
fi

# Aller dans le repertoire backend
cd "$BACKEND_PATH" || exit 1

echo ""
echo "📂 Repertoire actuel : $(pwd)"
echo ""

# Verifier que le fichier SQL existe
if [ ! -f "database/schema_pointage.sql" ]; then
    echo "❌ Fichier database/schema_pointage.sql non trouve"
    echo "💡 Verifiez que vous etes dans le bon repertoire"
    exit 1
fi

# Verifier que Node.js est installe
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installe"
    exit 1
fi

echo "🚀 Execution du schema de pointage..."
echo ""

# Executer le script
node executer-schema-production.js

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Schema execute avec succes !"
    echo ""
    echo "📋 Prochaines etapes :"
    echo "   1. Verifier que TIMEMOTO_WEBHOOK_SECRET est dans le .env"
    echo "   2. Redemarrer le serveur backend"
    echo "   3. Tester l'endpoint webhook"
else
    echo ""
    echo "❌ Erreur lors de l'execution"
    exit $EXIT_CODE
fi

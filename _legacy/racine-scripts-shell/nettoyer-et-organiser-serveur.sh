#!/bin/bash
# Script pour nettoyer et organiser le serveur automatiquement

set -e

PROJECT_DIR="/opt/fouta-erp"
cd "$PROJECT_DIR"

echo "🧹 Nettoyage et organisation automatique du serveur..."
echo ""

# 1. Mettre a jour depuis GitHub
echo "📥 Mise a jour depuis GitHub..."
bash scripts/update-server.sh || echo "⚠️  Avertissement: erreur lors de la mise a jour"

echo ""
echo "✅ Mise a jour terminee"
echo ""

# 2. Rendre les scripts executables
echo "🔧 Configuration des permissions..."
chmod +x scripts/nettoyer-serveur.sh scripts/organiser-serveur.sh 2>/dev/null || true

# 3. Executer le nettoyage
echo "🧹 Execution du nettoyage..."
bash scripts/nettoyer-serveur.sh || echo "⚠️  Avertissement lors du nettoyage (peut etre normal)"

echo ""

# 4. Executer l'organisation
echo "📁 Organisation de la structure..."
bash scripts/organiser-serveur.sh || echo "⚠️  Avertissement lors de l'organisation (peut etre normal)"

echo ""

# 5. Verifier la structure
echo "🔍 Verification de la structure..."
if [ -d "docs/" ]; then
    echo "📂 Contenu de docs/:"
    ls -la docs/ | head -10
    echo ""
fi

if [ -d "database/" ]; then
    SQL_COUNT=$(ls -1 database/*.sql 2>/dev/null | wc -l)
    echo "📊 Nombre de fichiers SQL: $SQL_COUNT"
fi

# 6. Redemarrer l'application
echo ""
echo "🔄 Redemarrage de l'application..."
cd backend
pm2 restart fouta-api || echo "⚠️  Erreur lors du redemarrage"

echo ""
echo "✅ Nettoyage et organisation termines !"
echo ""
echo "📊 Structure finale:"
echo "  - docs/: $(find docs/ -type f 2>/dev/null | wc -l) fichiers (dans $(find docs/ -type d 2>/dev/null | wc -l) dossiers)"
echo "  - database/: $(ls -1 database/*.sql 2>/dev/null | wc -l) fichiers SQL"
echo "  - scripts/: $(ls -1 scripts/*.sh 2>/dev/null | wc -l) scripts"
echo ""
echo "📂 Dossiers dans docs/:"
ls -1d docs/*/ 2>/dev/null | sed 's|docs/||' | sed 's|/||' | while read dir; do
    file_count=$(find "docs/$dir" -type f 2>/dev/null | wc -l)
    echo "    - $dir/: $file_count fichiers"
done

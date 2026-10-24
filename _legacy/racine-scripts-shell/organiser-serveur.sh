#!/bin/bash

# Script pour organiser le serveur comme le dépôt local

echo "📁 Organisation du serveur..."
echo ""

PROJECT_DIR="/opt/fouta-erp"
cd "$PROJECT_DIR"

# 1. Créer la structure docs/ complète
echo "📁 Création de la structure docs/..."
mkdir -p docs/{deployment,configuration,troubleshooting,development,guides,database,references}
echo "✅ Structure créée"
echo ""

# 2. Déplacer les fichiers .md de la racine vers docs/guides/
echo "📝 Déplacement des fichiers .md..."
find . -maxdepth 1 -type f -name "*.md" ! -name "README.md" ! -name "ORGANISER_GIT.md" ! -name "VERIFICATION_ORGANISATION.md" -exec mv {} docs/guides/ \; 2>/dev/null
echo "✅ Fichiers .md déplacés"
echo ""

# 3. Déplacer les fichiers de référence
echo "📎 Déplacement des fichiers de référence..."
find . -maxdepth 1 -type f \( -name "*.txt" -o -name "*.docx" -o -name "*.csv" -o -name "*.html" -o -name "*.pdf" \) -exec mv {} docs/references/ \; 2>/dev/null
echo "✅ Fichiers de référence déplacés"
echo ""

# 4. Déplacer les scripts vers scripts/
echo "🔧 Déplacement des scripts..."
find . -maxdepth 1 -type f \( -name "*.ps1" -o -name "*.sh" \) ! -name "update-server.sh" -exec mv {} scripts/ \; 2>/dev/null
echo "✅ Scripts déplacés"
echo ""

# 5. Supprimer les fichiers en doublon SQL
echo "🗄️  Suppression des doublons SQL..."
if [ -f "database/21_modules_communication_externe.sql" ]; then
    rm -f "database/21_modules_communication_externe.sql"
    echo "  ✅ Supprimé: 21_modules_communication_externe.sql"
fi
if [ -f "database/19_modules_multisociete.sql" ]; then
    rm -f "database/19_modules_multisociete.sql"
    echo "  ✅ Supprimé: 19_modules_multisociete.sql"
fi
echo "✅ Doublons SQL supprimés"
echo ""

# 6. Nettoyer les fichiers temporaires
echo "🧹 Nettoyage des fichiers temporaires..."
find . -type f -name "*.log" -delete 2>/dev/null
find . -type f -name "*.tmp" -delete 2>/dev/null
find . -type f -name "*.bak" -delete 2>/dev/null
echo "✅ Fichiers temporaires supprimés"
echo ""

# 7. Vérifier les permissions
echo "🔒 Vérification des permissions..."
chown -R ubuntu:ubuntu "$PROJECT_DIR" 2>/dev/null
chmod -R 755 "$PROJECT_DIR" 2>/dev/null
chmod +x scripts/*.sh 2>/dev/null
echo "✅ Permissions vérifiées"
echo ""

echo "✅ Organisation terminée !"
echo ""
echo "📊 Structure finale:"
echo "  - docs/ avec sous-dossiers organisés"
echo "  - scripts/ avec tous les scripts"
echo "  - database/ avec fichiers SQL nettoyés"
echo "  - Fichiers temporaires supprimés"

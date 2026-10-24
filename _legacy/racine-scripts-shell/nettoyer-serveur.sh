#!/bin/bash

# Script pour nettoyer et organiser le serveur

echo "🧹 Nettoyage et organisation du serveur..."
echo ""

PROJECT_DIR="/opt/fouta-erp"
BACKUP_DIR="/opt/fouta-erp-backup-$(date +%Y%m%d-%H%M%S)"

# Créer une sauvegarde
echo "📦 Création d'une sauvegarde..."
mkdir -p "$BACKUP_DIR"
cp -r "$PROJECT_DIR"/* "$BACKUP_DIR/" 2>/dev/null
echo "✅ Sauvegarde créée dans: $BACKUP_DIR"
echo ""

cd "$PROJECT_DIR"

# 1. Supprimer les fichiers de build et temporaires
echo "🗑️  Suppression des fichiers temporaires..."
find . -type f -name "*.log" -delete
find . -type f -name "*.tmp" -delete
find . -type f -name "*.bak" -delete
find . -type f -name "*.swp" -delete
find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null
find . -type d -name ".git" -not -path "./.git" -exec rm -rf {} + 2>/dev/null
find . -type d -name "build" -not -path "./frontend/build" -exec rm -rf {} + 2>/dev/null
echo "✅ Fichiers temporaires supprimés"
echo ""

# 2. Supprimer les fichiers .md en doublon à la racine (sauf README.md)
echo "📝 Nettoyage des fichiers de documentation à la racine..."
if [ -f "README.md" ]; then
    # Garder seulement README.md et ORGANISER_GIT.md
    find . -maxdepth 1 -type f -name "*.md" ! -name "README.md" ! -name "ORGANISER_GIT.md" ! -name "VERIFICATION_ORGANISATION.md" -delete
fi
echo "✅ Fichiers .md nettoyés"
echo ""

# 3. Supprimer les fichiers .txt, .docx, .csv, .html à la racine
echo "📄 Nettoyage des fichiers de référence à la racine..."
find . -maxdepth 1 -type f \( -name "*.txt" -o -name "*.docx" -o -name "*.csv" -o -name "*.html" -o -name "*.pdf" \) -delete
echo "✅ Fichiers de référence nettoyés"
echo ""

# 4. Supprimer les scripts .ps1 et .sh en doublon à la racine
echo "🔧 Nettoyage des scripts à la racine..."
find . -maxdepth 1 -type f \( -name "*.ps1" -o -name "*.sh" \) ! -name "update-server.sh" -exec mv {} scripts/ \; 2>/dev/null
echo "✅ Scripts déplacés vers scripts/"
echo ""

# 5. Créer la structure docs/ si elle n'existe pas
echo "📁 Création de la structure docs/..."
mkdir -p docs/{deployment,configuration,troubleshooting,development,guides,database,references}
echo "✅ Structure docs/ créée"
echo ""

# 6. Déplacer les fichiers .md restants vers docs/guides/
echo "📚 Déplacement des fichiers .md vers docs/guides/..."
find . -maxdepth 1 -type f -name "*.md" ! -name "README.md" ! -name "ORGANISER_GIT.md" ! -name "VERIFICATION_ORGANISATION.md" -exec mv {} docs/guides/ \; 2>/dev/null
echo "✅ Fichiers .md déplacés"
echo ""

# 7. Nettoyer les fichiers .env en doublon
echo "🔐 Nettoyage des fichiers .env..."
if [ -f "backend/.env" ]; then
    find . -name ".env" ! -path "./backend/.env" -delete 2>/dev/null
    find . -name ".env.*" ! -path "./backend/.env*" -delete 2>/dev/null
fi
echo "✅ Fichiers .env nettoyés"
echo ""

# 8. Vérifier et nettoyer les fichiers SQL en doublon
echo "🗄️  Vérification des fichiers SQL en doublon..."
if [ -f "database/21_modules_communication_externe.sql" ]; then
    rm -f "database/21_modules_communication_externe.sql"
    echo "  ✅ Supprimé: 21_modules_communication_externe.sql"
fi
if [ -f "database/19_modules_multisociete.sql" ]; then
    rm -f "database/19_modules_multisociete.sql"
    echo "  ✅ Supprimé: 19_modules_multisociete.sql"
fi
echo "✅ Fichiers SQL nettoyés"
echo ""

# 9. Vérifier les permissions
echo "🔒 Vérification des permissions..."
chown -R ubuntu:ubuntu "$PROJECT_DIR" 2>/dev/null
chmod -R 755 "$PROJECT_DIR" 2>/dev/null
chmod +x scripts/*.sh 2>/dev/null
echo "✅ Permissions vérifiées"
echo ""

# 10. Afficher un résumé
echo "📊 Résumé du nettoyage:"
echo "  - Sauvegarde: $BACKUP_DIR"
echo "  - Structure organisée"
echo "  - Fichiers temporaires supprimés"
echo "  - Doublons supprimés"
echo ""
echo "✅ Nettoyage terminé !"
echo ""
echo "💡 Pour restaurer la sauvegarde si nécessaire:"
echo "   cp -r $BACKUP_DIR/* $PROJECT_DIR/"

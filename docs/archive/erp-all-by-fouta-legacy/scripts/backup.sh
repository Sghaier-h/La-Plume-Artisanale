#!/bin/bash

# Script de backup
# Usage: bash backup.sh

set -e

BACKUP_DIR="/var/backups/fouta-erp"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="fouta_erp"
DB_USER="fouta_user"

echo "💾 Backup ERP ALL BY FOUTA"

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# Backup base de données
echo "📊 Backup base de données..."
pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/db_$DATE.sql
gzip $BACKUP_DIR/db_$DATE.sql

# Backup fichiers
echo "📁 Backup fichiers..."
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/fouta-erp

# Nettoyer les anciens backups (garder 7 jours)
echo "🧹 Nettoyage des anciens backups..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup terminé :"
echo "   - Base de données: $BACKUP_DIR/db_$DATE.sql.gz"
echo "   - Fichiers: $BACKUP_DIR/files_$DATE.tar.gz"


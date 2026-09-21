#!/bin/bash

# Script de vérification du statut
# Usage: bash check-status.sh

echo "🔍 Vérification du statut du serveur"
echo "======================================"

# PM2
echo ""
echo "📊 PM2 Status:"
pm2 status

# Nginx
echo ""
echo "🌐 Nginx Status:"
systemctl status nginx --no-pager | head -5

# PostgreSQL
echo ""
echo "🗄️ PostgreSQL Status:"
systemctl status postgresql --no-pager | head -5

# Redis
echo ""
echo "⚡ Redis Status:"
systemctl status redis-server --no-pager | head -5

# Disque
echo ""
echo "💾 Espace disque:"
df -h / | tail -1

# Mémoire
echo ""
echo "🧠 Mémoire:"
free -h

# Test API
echo ""
echo "🌐 Test API:"
curl -s https://api.fouta-erp.com/health || echo "❌ API non accessible"

echo ""
echo "✅ Vérification terminée"


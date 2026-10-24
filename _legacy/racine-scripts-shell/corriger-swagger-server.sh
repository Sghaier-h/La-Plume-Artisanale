#!/bin/bash

# Script pour corriger l'erreur de syntaxe Swagger dans server.js
# Usage : bash corriger-swagger-server.sh

SERVER_JS="/opt/fouta-erp/backend/src/server.js"
BACKUP_FILE="${SERVER_JS}.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Correction de l'erreur Swagger dans server.js..."

# Vérifier que le fichier existe
if [ ! -f "$SERVER_JS" ]; then
    echo "❌ Fichier $SERVER_JS non trouvé"
    exit 1
fi

# Créer une sauvegarde
cp "$SERVER_JS" "$BACKUP_FILE"
echo "✅ Sauvegarde créée : $BACKUP_FILE"

# Lire le fichier actuel
TEMP_FILE=$(mktemp)

# Extraire les lignes avant Swagger (1-113)
head -n 113 "$SERVER_JS" > "$TEMP_FILE"

# Ajouter la nouvelle configuration Swagger corrigée
cat >> "$TEMP_FILE" << 'EOF'
// Configuration Swagger/OpenAPI - Documentation disponible sur /api-docs
// Installer : npm install swagger-ui-express yamljs
// Note : Swagger est optionnel, le serveur fonctionne même si non installé
(async function initSwagger() {
  try {
    const swaggerUiModule = await import('swagger-ui-express');
    const yamljsModule = await import('yamljs');
    const swaggerUi = swaggerUiModule.default;
    const YAML = yamljsModule.default;
    
    const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'API ERP La Plume Artisanale'
    }));
    console.log('✅ Documentation Swagger disponible sur /api-docs');
  } catch (error) {
    // Swagger optionnel - continue même si non installé
    if (error.code !== 'ERR_MODULE_NOT_FOUND') {
      console.warn('⚠️ Swagger non configuré :', error.message);
    }
  }
})();
EOF

# Trouver où commence la section Routes (après Swagger)
# On cherche la ligne qui contient "// Routes"
START_LINE=$(grep -n "^// Routes" "$SERVER_JS" | head -1 | cut -d: -f1)

if [ -n "$START_LINE" ]; then
    # Ajouter les lignes restantes après "// Routes"
    tail -n +$START_LINE "$SERVER_JS" >> "$TEMP_FILE"
else
    # Si on ne trouve pas "// Routes", prendre les lignes après 133
    tail -n +135 "$SERVER_JS" >> "$TEMP_FILE"
fi

# Remplacer le fichier original
mv "$TEMP_FILE" "$SERVER_JS"

echo "✅ Fichier server.js corrigé"
echo ""
echo "📋 Prochaines étapes :"
echo "   1. Redémarrer PM2 : pm2 restart fouta-api"
echo "   2. Vérifier les logs : pm2 logs fouta-api --lines 30"

# 🔧 Débogage Swagger sur le Serveur

## Problème
Erreur de syntaxe dans les logs : `SyntaxError: Missing initializer in const declaration`

## Solution Temporaire : Désactiver Swagger (si nécessaire)

Si l'erreur bloque le démarrage, vous pouvez temporairement désactiver Swagger en commentant les lignes dans `server.js` :

```javascript
// Configuration Swagger/OpenAPI - DÉSACTIVÉ TEMPORAIREMENT
/*
(async () => {
  try {
    const swaggerUi = (await import('swagger-ui-express')).default;
    const YAML = (await import('yamljs')).default;
    
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
*/
```

## Solution Recommandée : Vérifier et Corriger

1. Vérifier que le fichier `server.js` est correct
2. Redémarrer PM2
3. Si l'erreur persiste, désactiver temporairement Swagger

# 🔧 Désactiver Swagger Temporairement

## Solution : Commenter la Section Swagger

Pour éliminer l'erreur immédiatement et permettre au serveur de fonctionner normalement :

```bash
cd /opt/fouta-erp/backend/src
nano server.js
```

**Chercher la section Swagger (lignes ~114-133) et commenter avec `/* ... */` :**

### AVANT
```javascript
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
```

### APRÈS (commenté)
```javascript
// Configuration Swagger/OpenAPI - DÉSACTIVÉ TEMPORAIREMENT
// Installer : npm install swagger-ui-express yamljs
// Note : Swagger est optionnel, le serveur fonctionne même si non installé
/*
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
*/
```

**Sauvegarder** : `Ctrl+O` puis `Enter`, puis `Ctrl+X`

**Redémarrer** :
```bash
pm2 restart fouta-api
pm2 logs fouta-api --lines 20 | grep -E "SyntaxError|ERROR"
```

L'erreur `SyntaxError` devrait disparaître.

---

## Note

Swagger est **optionnel** - le serveur fonctionnera parfaitement sans lui. Vous pourrez le réactiver plus tard une fois que nous aurons identifié la source exacte du problème.

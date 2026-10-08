# 📝 Ajouter la Configuration Swagger dans server.js

## Emplacement

La configuration Swagger doit être ajoutée **AVANT** la ligne `// Routes`, juste après le rate limiting.

---

## Code à Ajouter

**À insérer juste avant** `// Routes` (après `app.use('/api/', limiter);`) :

```javascript
// Middleware d'audit - doit être après l'authentification
// Il sera appliqué automatiquement aux routes qui modifient des données

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

// Routes
```

---

## Instructions pour nano

1. **Ouvrir le fichier** :
   ```bash
   nano /opt/fouta-erp/backend/src/server.js
   ```

2. **Aller après `app.use('/api/', limiter);`** (ligne ~109)

3. **Ajouter le code ci-dessus** juste avant `// Routes`

4. **Sauvegarder** : `Ctrl+O` puis `Enter`

5. **Quitter** : `Ctrl+X`

---

## Vérification

Après l'ajout, redémarrer PM2 :

```bash
pm2 restart fouta-api
pm2 logs fouta-api --lines 20 | grep -E "Swagger|ERROR"
```

Vous devriez voir : `✅ Documentation Swagger disponible sur /api-docs`

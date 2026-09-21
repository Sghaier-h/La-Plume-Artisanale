# 🔧 Corriger l'Erreur Swagger dans server.js

## Commande Simple : Correction avec sed

Exécutez ces commandes sur le serveur :

```bash
cd /opt/fouta-erp/backend/src

# Créer une sauvegarde
cp server.js server.js.backup

# Corriger les lignes problématiques
sed -i "s/const swaggerUi = (await import('swagger-ui-express')).default;/const swaggerUiModule = await import('swagger-ui-express');\n    const swaggerUi = swaggerUiModule.default;/" server.js
sed -i "s/const YAML = (await import('yamljs')).default;/const yamljsModule = await import('yamljs');\n    const YAML = yamljsModule.default;/" server.js
sed -i "s/(async () => {/(async function initSwagger() {/" server.js
```

**Note :** Cette méthode peut ne pas fonctionner parfaitement. La méthode recommandée est la correction manuelle avec nano.

---

## Méthode Recommandée : Correction Manuelle

```bash
cd /opt/fouta-erp/backend/src

# Créer une sauvegarde
cp server.js server.js.backup

# Éditer le fichier
nano server.js
```

### Instructions pour nano :

1. **Aller à la ligne 116** : `Ctrl+_` puis taper `116` puis `Enter`

2. **Remplacer ces lignes (116-119)** :

**AVANT (lignes 116-119) :**
```javascript
(async () => {
  try {
    const swaggerUi = (await import('swagger-ui-express')).default;
    const YAML = (await import('yamljs')).default;
```

**APRÈS (remplacer par) :**
```javascript
(async function initSwagger() {
  try {
    const swaggerUiModule = await import('swagger-ui-express');
    const yamljsModule = await import('yamljs');
    const swaggerUi = swaggerUiModule.default;
    const YAML = yamljsModule.default;
```

3. **Sauvegarder** : `Ctrl+O` puis `Enter`
4. **Quitter** : `Ctrl+X`

---

## Après la Correction

```bash
# Redémarrer PM2
pm2 restart fouta-api

# Vérifier les logs
pm2 logs fouta-api --lines 30 | grep -E "Swagger|ERROR|SyntaxError"
```

Vous devriez voir `✅ Documentation Swagger disponible sur /api-docs` au lieu de l'erreur.

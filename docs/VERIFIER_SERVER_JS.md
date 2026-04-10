# 🔍 Vérifier server.js sur le Serveur

## Commande à exécuter

```bash
# Vérifier les lignes autour de la configuration Swagger (lignes 114-133)
sed -n '114,133p' /opt/fouta-erp/backend/src/server.js
```

Ou pour voir plus de contexte :

```bash
# Voir les lignes 110-140
sed -n '110,140p' /opt/fouta-erp/backend/src/server.js
```

---

## Ce qu'il faut chercher

### ❌ Version avec erreur (à corriger)
```javascript
(async () => {
  try {
    const swaggerUi = (await import('swagger-ui-express')).default;
    const YAML = (await import('yamljs')).default;
```

### ✅ Version corrigée (correcte)
```javascript
(async function initSwagger() {
  try {
    const swaggerUiModule = await import('swagger-ui-express');
    const yamljsModule = await import('yamljs');
    const swaggerUi = swaggerUiModule.default;
    const YAML = yamljsModule.default;
```

---

## Si le fichier a l'erreur

### Option 1 : Corriger manuellement sur le serveur

```bash
nano /opt/fouta-erp/backend/src/server.js
```

Aller à la ligne 116 et remplacer :
- `(async () => {` par `(async function initSwagger() {`
- Les lignes 118-119 par la version corrigée ci-dessus

### Option 2 : Attendre que les modifications soient commitées et poussées

Si vous préférez, vous pouvez commit et push les modifications locales, puis refaire `git pull` sur le serveur.

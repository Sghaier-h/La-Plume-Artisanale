# 🔍 Vérifier si Swagger est Commenté

## Commande à Exécuter

```bash
# Vérifier si la section Swagger est commentée (lignes 114-133)
sed -n '114,133p' /opt/fouta-erp/backend/src/server.js | head -5
```

Ou pour voir plus de contexte :

```bash
# Voir les lignes 110-140
sed -n '110,140p' /opt/fouta-erp/backend/src/server.js
```

---

## Ce qu'il faut vérifier

### ❌ Si vous voyez ceci (NON commenté) :
```javascript
// Configuration Swagger/OpenAPI - Documentation disponible sur /api-docs
(async function initSwagger() {
  try {
    const swaggerUiModule = await import('swagger-ui-express');
```

→ **Le fichier n'a pas été sauvegardé ou modifié correctement**

### ✅ Si vous voyez ceci (Commenté) :
```javascript
// Configuration Swagger/OpenAPI - DÉSACTIVÉ (Swagger non installé)
/*
(async function initSwagger() {
  try {
    const swaggerUiModule = await import('swagger-ui-express');
```

→ **Le fichier est correctement commenté, mais l'erreur vient d'ailleurs**

---

## Si le fichier n'est pas commenté

Réessayez de commenter la section :

```bash
nano /opt/fouta-erp/backend/src/server.js
```

1. Aller à la ligne ~114
2. Ajouter `/*` juste avant `(async function initSwagger() {`
3. Trouver la fin du bloc (`})();`) et ajouter `*/` après
4. Sauvegarder : `Ctrl+O`, `Enter`, `Ctrl+X`

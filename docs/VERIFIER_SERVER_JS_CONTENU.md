# 🔍 Vérifier le Contenu de server.js

## Commande à Exécuter

```bash
# Voir les lignes autour de Swagger (114-140)
sed -n '110,140p' /opt/fouta-erp/backend/src/server.js
```

Cela affichera les lignes 110 à 140, où devrait se trouver la configuration Swagger.

---

## Ce qu'il faut vérifier

1. **La configuration Swagger existe-t-elle ?**
   - Chercher `// Configuration Swagger/OpenAPI`
   - Chercher `initSwagger`

2. **La syntaxe est-elle correcte ?**
   - Ne devrait PAS contenir : `(async () => {` avec `const swaggerUi = (await import(...)).default;`
   - Devrait contenir : `(async function initSwagger() {` avec les imports séparés

---

## Si la Configuration Swagger n'existe pas

Cela signifie qu'elle n'a pas été ajoutée. Suivre les instructions dans `docs/AJOUTER_SWAGGER_SERVER.md`.

---

## Si la Configuration existe mais avec erreur

Corriger selon `docs/CORRIGER_SWAGGER_SERVER.md`.

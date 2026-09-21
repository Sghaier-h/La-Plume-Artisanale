# 🔧 Vérifier et Corriger sur le Serveur

## Vérifier que le Fichier est Corrigé

```bash
cd /opt/fouta-erp/backend/src/controllers

# Vérifier la ligne 222
sed -n '220,225p' parametrage.controller.js
```

**Vous devriez voir :**
```javascript
if (useMockAuth) {
  // Retourner des valeurs par défaut selon le module
  const defaults = {  // ← Pas de ": { [key: string]: any }"
```

---

## Si le Fichier n'est PAS Corrigé

### Correction Manuelle

```bash
cd /opt/fouta-erp/backend/src/controllers
nano parametrage.controller.js
```

1. Aller à la ligne 222 (`Ctrl+_` puis `222`)
2. Remplacer :
   ```javascript
   const defaults: { [key: string]: any } = {
   ```
   Par :
   ```javascript
   const defaults = {
   ```
3. Sauvegarder : `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Tester le Démarrage depuis le Bon Répertoire

```bash
cd /opt/fouta-erp/backend  # ← Important : dans backend/
node src/server.js
```

Si ça démarre sans erreur, vous verrez des messages comme "Server running on port...".

---

## Redémarrer PM2 Correctement

```bash
cd /opt/fouta-erp/backend
pm2 delete fouta-api
pm2 start src/server.js --name fouta-api
pm2 logs fouta-api --lines 30
```

---

## Vérifier que le Backend Répond

```bash
# Attendre quelques secondes, puis tester
sleep 3
curl http://localhost:5000/api/health
```

Vous devriez voir une réponse JSON.

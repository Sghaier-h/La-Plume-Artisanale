# 🔧 Corriger l'Erreur de Syntaxe qui Empêche le Démarrage

## Le Problème

**Erreur :** `SyntaxError: Missing initializer in const declaration`

Le serveur PM2 est marqué "online" mais ne répond pas car il ne démarre pas correctement à cause d'une erreur de syntaxe.

---

## Solution : Trouver et Corriger l'Erreur

### 1. Vérifier les Logs Complets

```bash
# Voir tous les logs d'erreur
pm2 logs fouta-api --err --lines 50

# Voir les logs depuis le début pour identifier le fichier
pm2 logs fouta-api --err --lines 100 | head -50
```

### 2. Redémarrer avec Mode Verbose

```bash
# Arrêter et redémarrer pour voir les erreurs au démarrage
pm2 delete fouta-api
cd /opt/fouta-erp/backend
pm2 start src/server.js --name fouta-api --log-date-format="YYYY-MM-DD HH:mm:ss"
pm2 logs fouta-api --lines 50
```

### 3. Tester le Démarrage Manuel

```bash
cd /opt/fouta-erp/backend
node src/server.js
```

Cela affichera l'erreur exacte avec le fichier et la ligne.

---

## Erreur Probable : Swagger ou Autre Import

L'erreur `Missing initializer in const declaration` peut venir de :

1. **Swagger** : Déjà commenté, mais peut-être un autre fichier
2. **Import dynamique mal formé** : `const x = await import(...)` sans `async`
3. **Déclaration const sans valeur** : `const x;` au lieu de `const x = ...;`

---

## Solution Rapide : Vérifier server.js

```bash
# Vérifier s'il y a des erreurs de syntaxe dans server.js
cd /opt/fouta-erp/backend
node -c src/server.js
```

Si ça affiche une erreur, c'est que `server.js` a un problème.

---

## Diagnostic Complet

Exécutez ces commandes pour identifier le problème :

```bash
cd /opt/fouta-erp/backend

# 1. Vérifier la syntaxe de server.js
node -c src/server.js

# 2. Tester le démarrage manuel (affichera l'erreur exacte)
node src/server.js

# 3. Si ça marche manuellement, redémarrer PM2
pm2 delete fouta-api
pm2 start src/server.js --name fouta-api
pm2 logs fouta-api --lines 30
```

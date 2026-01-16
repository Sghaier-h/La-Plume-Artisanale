# 🔍 Vérifier et Corriger le Port OVH

## ❓ Problème Possible

Le port dans `.env` peut être incorrect pour hébergement partagé OVH.

---

## 🔍 Vérifications

### 1. Vérifier le Port Actuel dans .env

```bash
cd ~/fouta-erp/backend

# Voir le port actuel
grep "PORT" .env
```

### 2. Vérifier Comment le Port est Utilisé

```bash
# Voir comment PORT est utilisé dans server.js
grep -i "PORT" src/server.js
```

---

## 💡 Ports sur Hébergement Partagé OVH

Sur hébergement partagé OVH :
- OVH fournit automatiquement un port via `process.env.PORT`
- Le port peut être différent selon la configuration
- Il ne faut **PAS** forcer un port spécifique

---

## 🔧 Solutions

### Option 1 : Retirer PORT du .env (Recommandé)

Laissez OVH fournir le port automatiquement :

```bash
cd ~/fouta-erp/backend

# Commenter ou retirer PORT du .env
# Changez : PORT=5000
# En : #PORT=5000
```

**OU** retirez complètement la ligne `PORT=5000` du `.env`.

### Option 2 : Utiliser le Port Fourni par OVH

Si vous voulez garder PORT dans `.env`, utilisez un port que OVH peut fournir :

```bash
# Dans .env, commentez PORT ou laissez OVH le gérer
# #PORT=5000
```

Le code dans `server.js` utilise déjà :
```javascript
const PORT = process.env.PORT || 5000;
```

Cela signifie que si `process.env.PORT` est fourni par OVH, il sera utilisé. Sinon, il utilisera 5000 par défaut.

---

## ✅ Code Correct dans server.js

Le code doit être :

```javascript
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
```

**SANS** `HOST` dans `listen()`.

---

## 🧪 Test

### 1. Modifier .env

```bash
cd ~/fouta-erp/backend

# Éditer .env et commenter PORT
nano .env
# OU
vi .env

# Changez : PORT=5000
# En : #PORT=5000
```

### 2. Vérifier que HOST n'est pas dans server.js

```bash
# Vérifier
grep -A 3 "httpServer.listen" src/server.js

# Doit être : httpServer.listen(PORT, () => {
# PAS : httpServer.listen(PORT, HOST, () => {
```

### 3. Forcer un Redémarrage

```bash
# Toucher les fichiers
touch index.js
touch .ovhconfig

# Attendre 10-15 minutes
```

---

## 📋 Checklist

- [ ] PORT commenté ou retiré du `.env` (ou laissé pour OVH)
- [ ] HOST retiré de `listen()` dans `src/server.js`
- [ ] Code vérifié : `grep -A 3 "httpServer.listen" src/server.js`
- [ ] `touch index.js` exécuté
- [ ] Attendu 10-15 minutes
- [ ] Vérifié que l'application tourne
- [ ] Testé l'application

---

## 💡 Note

**Sur hébergement partagé OVH** :
- OVH fournit automatiquement `process.env.PORT`
- Ne forcez pas un port spécifique dans `.env`
- L'application doit écouter sur le port fourni par OVH
- OVH gère le reverse proxy automatiquement

---

## ✅ Résumé

1. **Commentez ou retirez `PORT=5000` du `.env`** (laissez OVH le gérer)
2. **Vérifiez que HOST n'est pas dans `listen()`** dans `src/server.js`
3. **Forcez un redémarrage** : `touch index.js`
4. **Attendez 10-15 minutes**

**Le port peut effectivement être le problème !**


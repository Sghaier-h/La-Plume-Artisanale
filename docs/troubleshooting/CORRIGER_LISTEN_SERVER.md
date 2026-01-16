# 🔧 Corriger httpServer.listen() dans src/server.js

## ❌ Problème

Le code utilise probablement `HOST` dans `listen()`, ce qui cause l'erreur EACCES.

---

## 🔍 Vérifier le Code Actuel

```bash
cd ~/fouta-erp/backend

# Voir la partie listen()
tail -10 src/server.js
# OU
grep -A 5 "httpServer.listen" src/server.js
```

---

## ✅ Code Correct

Le code doit être :

```javascript
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Socket.IO actif`);
});
```

**SANS** `HOST` dans `listen()`.

---

## 🔧 Correction

### Éditer le Fichier

```bash
cd ~/fouta-erp/backend

# Éditer avec nano
nano src/server.js
```

### Chercher et Remplacer

Dans l'éditeur, allez à la fin du fichier et cherchez :

**Code incorrect** :
```javascript
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur démarré sur ${HOST}:${PORT}`);
  console.log(`📡 Socket.IO actif`);
});
```

**Code correct** :
```javascript
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Socket.IO actif`);
});
```

**Modifications** :
1. Retirez la ligne `const HOST = ...`
2. Retirez `HOST` de `httpServer.listen(PORT, HOST, ...)`
3. Changez `listen(PORT, HOST, ...)` en `listen(PORT, ...)`
4. Changez le console.log pour retirer `${HOST}:`

### Sauvegarder

Dans nano :
- **Ctrl+O** : Sauvegarder
- **Entrée** : Confirmer
- **Ctrl+X** : Quitter

---

## 🧪 Vérification

### Vérifier la Modification

```bash
# Vérifier que HOST n'est plus dans listen()
grep -A 3 "httpServer.listen" src/server.js

# Doit afficher :
# httpServer.listen(PORT, () => {
# PAS : httpServer.listen(PORT, HOST, () => {
```

### Vérifier qu'il n'y a pas de Variable HOST

```bash
# Vérifier s'il y a une déclaration HOST
grep "const HOST\|let HOST\|var HOST" src/server.js

# Si vous voyez quelque chose, retirez cette ligne
```

---

## 🔄 Forcer un Redémarrage

```bash
cd ~/fouta-erp/backend

# Toucher les fichiers pour forcer OVH à redémarrer
touch index.js
touch .ovhconfig

# Attendre 10-15 minutes
```

---

## 📋 Checklist

- [ ] Fichier `src/server.js` édité
- [ ] Ligne `const HOST = ...` retirée (si présente)
- [ ] `HOST` retiré de `httpServer.listen()`
- [ ] Code vérifié : `grep -A 3 "httpServer.listen" src/server.js`
- [ ] `touch index.js` exécuté
- [ ] Attendu 10-15 minutes
- [ ] Vérifié que l'application tourne

---

## 💡 Note

**Sur hébergement partagé OVH** :
- ❌ Ne pas utiliser `HOST` dans `listen()`
- ❌ Ne pas écouter sur `127.0.0.1` ou `localhost`
- ✅ Écouter seulement sur le `PORT` (sans adresse IP)
- ✅ OVH gère le reverse proxy automatiquement

---

## ✅ Résumé

1. **Éditez `src/server.js`** : Retirez `HOST` de `listen()`
2. **Vérifiez** : `grep -A 3 "httpServer.listen" src/server.js`
3. **Forcez un redémarrage** : `touch index.js`
4. **Attendez 10-15 minutes**

**C'est la correction principale à faire !**


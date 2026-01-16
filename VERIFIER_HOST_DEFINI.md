# 🔍 Vérifier que HOST est Défini

## ❌ Problème

Le code utilise `HOST` dans `listen()`, mais il faut vérifier qu'il est défini.

---

## 🔍 Vérification

### Vérifier si HOST est Défini

```bash
cd ~/fouta-erp/backend

# Vérifier si HOST est défini avant listen()
grep -B 5 "httpServer.listen" src/server.js

# Doit afficher quelque chose comme :
# const PORT = process.env.PORT || 5000;
# const HOST = '127.0.0.1';
# 
# httpServer.listen(PORT, HOST, () => {
```

---

## 🔧 Correction Si HOST N'est Pas Défini

### Si HOST n'est pas défini, ajoutez-le :

```bash
cd ~/fouta-erp/backend

# Éditer le fichier
nano src/server.js
```

**Cherchez** (vers la fin) :
```javascript
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, HOST, () => {
```

**Remplacez par** :
```javascript
const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1';

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur démarré sur ${HOST}:${PORT}`);
  console.log(`📡 Socket.IO actif`);
});
```

**Sauvegarder** : Ctrl+O, Entrée, Ctrl+X

---

## 🧪 Vérification Après Correction

```bash
# Vérifier que HOST est défini
grep -B 5 "httpServer.listen" src/server.js

# Doit afficher :
# const PORT = process.env.PORT || 5000;
# const HOST = '127.0.0.1';
# 
# httpServer.listen(PORT, HOST, () => {
```

---

## 🔄 Forcer un Redémarrage

```bash
cd ~/fouta-erp/backend

# Toucher les fichiers
touch index.js
touch .ovhconfig
touch src/server.js

# Attendre 15-20 minutes
```

---

## 📋 Checklist

- [ ] HOST vérifié : `grep -B 5 "httpServer.listen" src/server.js`
- [ ] HOST défini si nécessaire : `const HOST = '127.0.0.1';`
- [ ] Code vérifié
- [ ] `touch index.js` exécuté
- [ ] Attendu 15-20 minutes

---

## ✅ Résumé

1. **Vérifier si HOST est défini** : `grep -B 5 "httpServer.listen" src/server.js`
2. **Ajouter HOST si nécessaire** : `const HOST = '127.0.0.1';`
3. **Forcer un redémarrage** : `touch index.js`
4. **Attendre 15-20 minutes**

**Vérifiez d'abord si HOST est défini !**


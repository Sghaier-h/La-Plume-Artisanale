# 🔧 Corriger le console.log - Retirer HOST

## ❌ Code Actuel (Incorrect)

```javascript
const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1';

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur ${HOST}:${PORT}`);
  console.log(`📡 Socket.IO actif`);
});
```

**Problèmes** :
- `HOST` est défini mais ne devrait pas l'être sur OVH mutualisé
- Le `console.log` utilise `HOST` qui n'est pas nécessaire

---

## ✅ Code Correct

```javascript
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Socket.IO actif`);
});
```

**Modifications** :
1. Retirer la ligne `const HOST = '127.0.0.1';`
2. Modifier le console.log pour ne pas utiliser `HOST`

---

## 🔧 Correction sur le Serveur

### Commande à Exécuter

```bash
cd ~/fouta-erp/backend

# Éditer le fichier
nano src/server.js
```

### Dans l'Éditeur

**Cherchez** (vers la fin du fichier) :
```javascript
const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1';

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur ${HOST}:${PORT}`);
  console.log(`📡 Socket.IO actif`);
});
```

**Remplacez par** :
```javascript
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Socket.IO actif`);
});
```

### Sauvegarder

Dans nano :
- **Ctrl+O** : Sauvegarder
- **Entrée** : Confirmer
- **Ctrl+X** : Quitter

---

## 🧪 Vérification

### Vérifier la Modification

```bash
# Vérifier que HOST n'est plus défini
grep "const HOST\|let HOST\|var HOST" src/server.js

# Ne doit rien afficher

# Vérifier listen() et console.log
grep -A 3 "httpServer.listen" src/server.js

# Doit afficher :
# const PORT = process.env.PORT || 5000;
# 
# httpServer.listen(PORT, () => {
#   console.log(`🚀 Serveur démarré sur le port ${PORT}`);
```

---

## 🔄 Forcer un Redémarrage

```bash
cd ~/fouta-erp/backend

# Toucher les fichiers pour forcer OVH à redémarrer
touch index.js
touch .ovhconfig
touch src/server.js

# Attendre 15-20 minutes
```

---

## 📋 Checklist

- [ ] Fichier `src/server.js` édité
- [ ] Ligne `const HOST = '127.0.0.1';` retirée
- [ ] `console.log` modifié : `🚀 Serveur démarré sur le port ${PORT}`
- [ ] Code vérifié : `grep -A 3 "httpServer.listen" src/server.js`
- [ ] `touch index.js` exécuté
- [ ] Attendu 15-20 minutes
- [ ] Vérifié que l'application tourne

---

## 💡 Pourquoi ?

**Sur OVH mutualisé** :
- ❌ Ne pas définir `HOST`
- ❌ Ne pas utiliser `HOST` dans le console.log
- ✅ Écouter seulement sur le `PORT` (sans adresse IP)
- ✅ Passenger (OVH) gère le reverse proxy automatiquement

---

## ✅ Résumé

1. **Éditez `src/server.js`** : Retirez `const HOST = '127.0.0.1';`
2. **Modifiez le console.log** : `🚀 Serveur démarré sur le port ${PORT}`
3. **Vérifiez** : `grep -A 3 "httpServer.listen" src/server.js`
4. **Forcez un redémarrage** : `touch index.js`
5. **Attendez 15-20 minutes**

**C'est la correction finale !**


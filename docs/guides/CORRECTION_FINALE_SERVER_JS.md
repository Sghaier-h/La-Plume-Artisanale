# ✅ Correction Finale de src/server.js

## ❌ Code Actuel (Problématique)

```javascript
const PORT = process.env.PORT || 5000;
// Sur hébergement partagé, écouter sur localhost uniquement
const HOST = process.env.HOST || '127.0.0.1';

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur ${HOST}:${PORT}`);
  console.log(`📡 Socket.IO actif`);
});
```

**Problèmes** :
- `HOST` est défini mais pas utilisé dans `listen()` (bien)
- Mais le commentaire est incorrect
- Le console.log utilise `HOST` qui n'est pas nécessaire

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
1. Retirer la ligne `const HOST = ...`
2. Retirer le commentaire incorrect
3. Modifier le console.log pour ne pas utiliser `HOST`

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
// Sur hébergement partagé, écouter sur localhost uniquement
const HOST = process.env.HOST || '127.0.0.1';

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

# Vérifier listen()
grep -A 3 "httpServer.listen" src/server.js

# Doit afficher :
# httpServer.listen(PORT, () => {
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
- [ ] Ligne `const HOST = ...` retirée
- [ ] Commentaire incorrect retiré
- [ ] `console.log` modifié pour ne pas utiliser `HOST`
- [ ] Code vérifié : `grep -A 3 "httpServer.listen" src/server.js`
- [ ] `touch index.js` exécuté
- [ ] Attendu 10-15 minutes
- [ ] Vérifié que l'application tourne

---

## 💡 Note

**Sur hébergement partagé OVH** :
- ❌ Ne pas définir `HOST`
- ❌ Ne pas écouter sur `127.0.0.1` ou `localhost`
- ✅ Écouter seulement sur le `PORT` (sans adresse IP)
- ✅ OVH gère le reverse proxy automatiquement

---

## ✅ Résumé

1. **Éditez `src/server.js`** : Retirez `const HOST = ...` et le commentaire
2. **Modifiez le console.log** : Retirez `${HOST}:`
3. **Vérifiez** : `grep -A 3 "httpServer.listen" src/server.js`
4. **Forcez un redémarrage** : `touch index.js`
5. **Attendez 10-15 minutes**

**C'est la correction finale !**


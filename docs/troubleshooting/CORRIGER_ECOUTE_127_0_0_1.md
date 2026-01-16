# 🔧 Corriger l'Écoute sur 127.0.0.1

## ❌ Problème

L'application essaie d'écouter sur `0.0.0.0:5000` ce qui cause `EACCES: permission denied`.

Sur hébergement partagé OVH, il faut écouter sur `127.0.0.1` explicitement.

---

## ✅ Solution : Modifier src/server.js

### Code Actuel (Incorrect)

```javascript
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
```

### Code Correct

```javascript
const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1';

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur démarré sur ${HOST}:${PORT}`);
  console.log(`📡 Socket.IO actif`);
});
```

**Note** : Sur hébergement partagé OVH, il faut écouter sur `127.0.0.1` explicitement.

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

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Socket.IO actif`);
});
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

### Sauvegarder

Dans nano :
- **Ctrl+O** : Sauvegarder
- **Entrée** : Confirmer
- **Ctrl+X** : Quitter

---

## 🧪 Test Manuel

```bash
cd ~/fouta-erp/backend

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Charger .env
set -a
source .env
set +a

# Tester
node index.js
```

**Note** : Cela peut toujours échouer avec EACCES si le port est déjà utilisé ou si OVH ne permet pas l'écoute manuelle. Mais cela confirmera que le code est correct.

---

## 🔄 Forcer un Redémarrage

```bash
cd ~/fouta-erp/backend

# Toucher les fichiers
touch index.js
touch .ovhconfig
touch src/server.js

# Attendre 10-15 minutes
```

---

## ⚠️ Important : Configuration Multisite OVH

**Le problème principal est que OVH ne démarre pas l'application automatiquement.**

Vérifiez dans le panneau OVH :

1. **Multisite** → `fabrication.laplume-artisanale.tn`
2. **Dossier racine** : `fouta-erp/backend` (exactement, sans `/` au début)
3. **Node.js** : Activé (vert)
4. **PHP** : Désactivé (si possible)

Si la configuration est incorrecte, corrigez-la et attendez 10-15 minutes.

---

## 📋 Checklist

- [ ] Code modifié pour écouter sur `127.0.0.1`
- [ ] Test manuel exécuté (pour vérifier le code)
- [ ] Configuration Multisite OVH vérifiée
- [ ] `touch index.js` exécuté
- [ ] Attendu 10-15 minutes
- [ ] Vérifié que l'application tourne

---

## 💡 Note

**Sur hébergement partagé OVH** :
- ✅ Écouter sur `127.0.0.1` explicitement
- ✅ OVH fournit `process.env.PORT` automatiquement
- ✅ OVH gère le reverse proxy automatiquement
- ⚠️ OVH doit démarrer l'application automatiquement (vérifier Multisite)

---

## ✅ Résumé

1. **Modifiez `src/server.js`** : Ajoutez `HOST = '127.0.0.1'` et écoutez sur `HOST:PORT`
2. **Vérifiez la configuration Multisite OVH** (dossier racine, Node.js activé)
3. **Forcez un redémarrage** : `touch index.js`
4. **Attendez 10-15 minutes**

**C'est la correction nécessaire pour OVH hébergement partagé !**


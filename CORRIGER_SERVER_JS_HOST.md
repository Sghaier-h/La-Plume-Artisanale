# 🔧 Corriger src/server.js - Supprimer HOST

## ❌ Problème

Le fichier `src/server.js` sur le serveur utilise `HOST` dans `listen()` :

```javascript
httpServer.listen(PORT, HOST, () => {
```

Cela cause l'erreur `EACCES: permission denied 127.0.0.1:5000`.

---

## ✅ Solution : Modifier src/server.js

Sur hébergement partagé OVH, il faut écouter **SANS** adresse IP spécifique.

### Commande à Exécuter

```bash
cd ~/fouta-erp/backend

# Voir le code actuel
grep -A 3 "httpServer.listen" src/server.js

# Modifier le fichier
# Remplacez :
# httpServer.listen(PORT, HOST, () => {
# Par :
# httpServer.listen(PORT, () => {
```

### Modification Manuelle

Éditez le fichier `src/server.js` :

```bash
cd ~/fouta-erp/backend

# Utiliser nano ou vi pour éditer
nano src/server.js
# OU
vi src/server.js
```

**Cherchez la ligne** :
```javascript
httpServer.listen(PORT, HOST, () => {
```

**Remplacez par** :
```javascript
httpServer.listen(PORT, () => {
```

**Et modifiez aussi le console.log** :
```javascript
console.log(`🚀 Serveur démarré sur le port ${PORT}`);
```

**Sauvegardez** le fichier.

---

## 🔧 Modification Automatique avec sed

Si vous préférez utiliser une commande :

```bash
cd ~/fouta-erp/backend

# Créer une sauvegarde
cp src/server.js src/server.js.backup

# Modifier avec sed (si disponible)
sed -i 's/httpServer\.listen(PORT, HOST/httpServer.listen(PORT/g' src/server.js
sed -i 's/\${HOST}:\${PORT}/\${PORT}/g' src/server.js

# Vérifier la modification
grep -A 3 "httpServer.listen" src/server.js
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

## 🧪 Test Après Modification

### 1. Vérifier la Modification

```bash
# Vérifier que HOST n'est plus dans listen()
grep -A 3 "httpServer.listen" src/server.js
```

### 2. Tester le Démarrage (Optionnel)

```bash
# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Tester (peut toujours échouer sur le port, mais on verra d'autres erreurs)
node index.js
```

### 3. Attendre que OVH Redémarre

```bash
# Toucher index.js pour forcer un rechargement
touch index.js

# Attendre 10-15 minutes
# Vérifier que l'application tourne
ps aux | grep node | grep -v grep
```

---

## 📋 Checklist

- [ ] Fichier `src/server.js` modifié (HOST retiré de listen())
- [ ] Code vérifié : `grep -A 3 "httpServer.listen" src/server.js`
- [ ] `touch index.js` exécuté
- [ ] Attendu 10-15 minutes
- [ ] Vérifié que l'application tourne
- [ ] Testé l'application

---

## 💡 Note

**Sur hébergement partagé OVH** :
- ❌ Ne pas utiliser `HOST` dans `listen()`
- ❌ Ne pas écouter sur `127.0.0.1` ou `localhost`
- ✅ Écouter seulement sur le `PORT` (sans adresse IP)
- ✅ OVH gère le reverse proxy automatiquement

---

## ✅ Résumé

1. **Modifiez `src/server.js`** : Retirez `HOST` de `listen()`
2. **Vérifiez** : `grep -A 3 "httpServer.listen" src/server.js`
3. **Forcez un redémarrage** : `touch index.js`
4. **Attendez 10-15 minutes**
5. **Vérifiez** : `ps aux | grep node`

**C'est probablement la cause principale du problème !**


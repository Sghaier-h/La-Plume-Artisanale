# 🔧 Résoudre "Connexion Refusée" - Application Ne Démarre Pas

## ❌ Problème

```
curl: (7) Failed to connect to fabrication.laplume-artisanale.tn port 80: Connexion refusée
```

L'application Node.js ne démarre pas automatiquement sur OVH.

---

## 🔍 Vérifications Immédiates

### 1. Vérifier que l'Application Tourne

```bash
ps aux | grep node | grep -v grep

# Si rien n'est affiché, l'application ne tourne pas
```

### 2. Vérifier le Code (Écoute sur 127.0.0.1)

```bash
cd ~/fouta-erp/backend

# Vérifier listen()
grep -A 3 "httpServer.listen" src/server.js

# Doit afficher :
# const HOST = '127.0.0.1';
# httpServer.listen(PORT, HOST, () => {
```

**Si vous voyez `httpServer.listen(PORT, () => {` sans HOST, il faut ajouter HOST.**

### 3. Vérifier les Fichiers Essentiels

```bash
cd ~/fouta-erp/backend

# Vérifier .ovhconfig
cat .ovhconfig

# Vérifier index.js
cat index.js

# Vérifier que server.js existe
ls -la src/server.js
```

---

## 🔧 Solutions

### Solution 1 : Corriger l'Écoute sur 127.0.0.1

Si le code n'écoute pas sur `127.0.0.1`, modifiez-le :

```bash
cd ~/fouta-erp/backend

# Éditer le fichier
nano src/server.js
```

**Cherchez** (vers la fin) :
```javascript
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
```

**Remplacez par** :
```javascript
const PORT = process.env.PORT || 5000;
const HOST = '127.0.0.1';

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur démarré sur ${HOST}:${PORT}`);
```

**Sauvegarder** : Ctrl+O, Entrée, Ctrl+X

### Solution 2 : Vérifier la Configuration Multisite OVH

**Dans le panneau OVH** :

1. **Multisite** → `fabrication.laplume-artisanale.tn`
2. **Vérifiez** :
   - **Dossier racine** : `fouta-erp/backend` (exactement, sans `/` au début, sans `/` à la fin)
   - **Node.js** : Activé (vert)
   - **PHP** : Désactivé (si possible)
3. **Si nécessaire, modifiez et sauvegardez**
4. **Attendez 10-15 minutes**

### Solution 3 : Forcer un Redémarrage Complet

```bash
cd ~/fouta-erp/backend

# Toucher tous les fichiers importants
touch .ovhconfig
touch index.js
touch src/server.js
touch package.json

# Attendre 15-20 minutes
```

### Solution 4 : Vérifier les Logs OVH

Dans le panneau OVH :
1. **Statistiques et logs**
2. **Consultez les logs d'erreur**
3. **Cherchez des erreurs liées à Node.js**

---

## 🧪 Test Manuel (Pour Voir les Erreurs)

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

**Note** : Cela peut échouer avec EACCES, mais vous verrez d'autres erreurs éventuelles (connexion DB, modules manquants, etc.).

---

## 📋 Checklist

- [ ] Application vérifiée : `ps aux | grep node`
- [ ] Code vérifié : `grep -A 3 "httpServer.listen" src/server.js`
- [ ] Code corrigé si nécessaire (écoute sur 127.0.0.1)
- [ ] Configuration Multisite vérifiée (dossier racine, Node.js activé)
- [ ] Fichiers touchés : `touch index.js`
- [ ] Attendu 15-20 minutes
- [ ] Logs OVH consultés

---

## 💡 Si Rien Ne Fonctionne

### Contacter le Support OVH

Si après toutes ces vérifications l'application ne démarre toujours pas :

1. **Contactez le support OVH**
2. **Mentionnez** :
   - Vous avez `.ovhconfig` avec Node.js 18
   - Vous avez `index.js` qui importe `src/server.js`
   - Vous avez `src/server.js` qui écoute sur `127.0.0.1:PORT`
   - Le dossier racine dans Multisite est `fouta-erp/backend`
   - Node.js est activé dans Multisite
   - L'application ne démarre pas automatiquement

3. **Demandez** :
   - Pourquoi l'application Node.js ne démarre pas automatiquement
   - S'il y a des logs d'erreur côté serveur
   - Si la configuration est correcte

---

## ✅ Résumé

1. **Vérifier que l'application tourne** : `ps aux | grep node`
2. **Vérifier le code** : Écoute sur `127.0.0.1`
3. **Vérifier la configuration Multisite OVH** (dossier racine, Node.js activé)
4. **Forcer un redémarrage** : `touch index.js`
5. **Attendre 15-20 minutes**
6. **Contacter le support OVH** si nécessaire

**Le problème est probablement dans la configuration Multisite OVH ou le code qui n'écoute pas sur 127.0.0.1.**


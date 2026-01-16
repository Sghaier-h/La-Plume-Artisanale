# 🔍 Diagnostic - Application Ne Démarre Pas

## ❌ Problème

L'application Node.js ne démarre pas automatiquement sur OVH après 15+ minutes.

---

## 🔍 Vérifications Immédiates

### 1. Vérifier les Fichiers Essentiels

```bash
cd ~/fouta-erp/backend

# Vérifier .ovhconfig
cat .ovhconfig

# Doit afficher :
# <?xml version="1.0" encoding="UTF-8"?>
# <engine>
#     <name>nodejs</name>
#     <version>18</version>
# </engine>

# Vérifier index.js
cat index.js

# Doit afficher :
# // Point d'entrée pour OVH
# import './src/server.js';

# Vérifier que server.js existe
ls -la src/server.js
```

### 2. Vérifier le Code

```bash
# Vérifier listen()
grep -A 3 "httpServer.listen" src/server.js

# Doit afficher :
# httpServer.listen(PORT, () => {
# PAS : httpServer.listen(PORT, HOST, () => {
```

### 3. Tester un Démarrage Manuel (pour voir les erreurs)

```bash
cd ~/fouta-erp/backend

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Charger les variables d'environnement
export $(cat .env | grep -v '^#' | xargs)

# Tester le démarrage
node index.js
```

**Note** : Cela peut échouer avec EACCES sur le port, mais vous verrez d'autres erreurs éventuelles.

---

## 🔧 Solutions

### Solution 1 : Vérifier la Configuration Multisite OVH

**Dans le panneau OVH** :

1. Allez dans **Multisite**
2. Cliquez sur `fabrication.laplume-artisanale.tn`
3. Vérifiez :
   - **Dossier racine** : `fouta-erp/backend` (exactement, sans `/` au début)
   - **Node.js** : Activé (vert)
   - **PHP** : Désactivé (si possible)
4. Si nécessaire, modifiez et sauvegardez
5. Attendez 10-15 minutes

### Solution 2 : Vérifier le Chemin Absolu

```bash
cd ~/fouta-erp/backend

# Vérifier le chemin absolu
pwd

# Doit être quelque chose comme :
# /home/allbyfb/fouta-erp/backend
# OU
# /homez.1005/allbyfb/fouta-erp/backend
```

Dans OVH Multisite, le dossier racine doit être relatif à `~` (home), donc `fouta-erp/backend`.

### Solution 3 : Vérifier les Permissions

```bash
cd ~/fouta-erp/backend

# Vérifier les permissions
ls -la .ovhconfig index.js src/server.js

# Les fichiers doivent être lisibles
```

### Solution 4 : Forcer un Redémarrage Complet

```bash
cd ~/fouta-erp/backend

# Toucher tous les fichiers importants
touch .ovhconfig
touch index.js
touch src/server.js
touch package.json

# Attendre 15-20 minutes
```

### Solution 5 : Vérifier les Logs OVH

Dans le panneau OVH :
1. Allez dans **Statistiques et logs**
2. Consultez les logs d'erreur
3. Cherchez des erreurs liées à Node.js

---

## 🧪 Test Manuel avec Variables d'Environnement

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

Cela vous montrera les erreurs éventuelles (connexion DB, modules manquants, etc.).

---

## 📋 Checklist de Diagnostic

- [ ] Fichiers essentiels présents (`.ovhconfig`, `index.js`, `src/server.js`)
- [ ] Code correct (`listen(PORT, () => {` sans HOST)
- [ ] Configuration Multisite vérifiée (dossier racine, Node.js activé)
- [ ] Test manuel exécuté (pour voir les erreurs)
- [ ] Logs OVH consultés
- [ ] Permissions vérifiées

---

## 💡 Si Rien Ne Fonctionne

### Contacter le Support OVH

Si après toutes ces vérifications l'application ne démarre toujours pas :

1. **Contactez le support OVH**
2. **Mentionnez** :
   - Vous avez `.ovhconfig` avec Node.js 18
   - Vous avez `index.js` qui importe `src/server.js`
   - Vous avez `src/server.js` qui écoute sur `PORT` sans `HOST`
   - Le dossier racine dans Multisite est `fouta-erp/backend`
   - Node.js est activé dans Multisite
   - L'application ne démarre pas automatiquement

3. **Demandez** :
   - Pourquoi l'application Node.js ne démarre pas automatiquement
   - S'il y a des logs d'erreur côté serveur
   - Si la configuration est correcte

---

## ✅ Résumé

1. **Vérifiez les fichiers essentiels**
2. **Vérifiez la configuration Multisite OVH** (dossier racine, Node.js activé)
3. **Testez manuellement** pour voir les erreurs
4. **Consultez les logs OVH**
5. **Contactez le support OVH** si nécessaire

**Le problème est probablement dans la configuration Multisite OVH.**


# 🔧 Charger nvm Correctement

## ❌ Problème : Node.js Non Trouvé

nvm n'est pas chargé correctement, donc Node.js n'est pas dans le PATH.

---

## ✅ Solution : Charger nvm et Utiliser Node.js 18

```bash
# 1. Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. Utiliser Node.js 18
nvm use 18

# 3. Vérifier que Node.js est disponible
node --version
npm --version

# 4. Ajouter PM2 au PATH
export PATH="$HOME/.local/bin:$PATH"

# 5. Maintenant PM2 devrait fonctionner
pm2 status
```

---

## 🔄 Si nvm use 18 Ne Fonctionne Pas

```bash
# Lister les versions installées
nvm list

# Si 18 n'est pas listé, réinstaller
nvm install 18
nvm use 18
nvm alias default 18
```

---

## 📋 Commandes Complètes

```bash
# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Utiliser Node.js 18
nvm use 18

# Vérifier
node --version
# Doit afficher : v18.x.x

# Ajouter PM2 au PATH
export PATH="$HOME/.local/bin:$PATH"

# Vérifier PM2
pm2 --version

# Vérifier le statut de l'application
pm2 status

# Voir les logs
pm2 logs fouta-api --lines 20
```

---

## 🔧 Solution Permanente : Ajouter au .bashrc

Pour éviter de recharger nvm à chaque connexion :

```bash
# Ajouter au .bashrc
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
echo 'nvm use 18' >> ~/.bashrc
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc

# Recharger
source ~/.bashrc
```

---

## ✅ Vérification

Après avoir chargé nvm :

```bash
# Doit afficher v18.x.x
node --version

# Doit afficher la version de npm
npm --version

# Doit afficher la version de PM2
pm2 --version

# Doit afficher le statut de l'application
pm2 status
```

---

## 🎯 Action Immédiate

Exécutez ces commandes dans l'ordre :

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18
export PATH="$HOME/.local/bin:$PATH"
pm2 status
```


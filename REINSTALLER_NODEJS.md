# 🔧 Réinstaller Node.js 18 via nvm

## ❌ Problème : Binaire Node.js Manquant

nvm dit qu'il utilise Node.js 18, mais le binaire n'existe pas. Il faut réinstaller Node.js 18.

---

## ✅ Solution : Réinstaller Node.js 18

```bash
# 1. Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. Désinstaller la version corrompue (si nécessaire)
nvm uninstall 18 2>/dev/null || true

# 3. Réinstaller Node.js 18
nvm install 18

# 4. Utiliser Node.js 18
nvm use 18

# 5. Vérifier
node --version
npm --version

# 6. Ajouter PM2 au PATH
export PATH="$HOME/.local/bin:$PATH"

# 7. Vérifier PM2
pm2 --version
pm2 status
```

---

## 🔄 Si l'Installation Échoue

### Option 1 : Nettoyer et Réinstaller

```bash
# Nettoyer nvm
rm -rf ~/.nvm/versions/node/v18.20.8

# Réinstaller
nvm install 18
nvm use 18
nvm alias default 18
```

### Option 2 : Utiliser une Version Spécifique

```bash
# Installer une version spécifique
nvm install 18.20.8
nvm use 18.20.8
nvm alias default 18.20.8
```

---

## 📋 Commandes Complètes

```bash
# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Réinstaller Node.js 18
nvm install 18

# Utiliser Node.js 18
nvm use 18

# Vérifier
node --version
npm --version

# Ajouter PM2 au PATH
export PATH="$HOME/.local/bin:$PATH"

# Vérifier PM2
pm2 --version
pm2 status
pm2 logs fouta-api --lines 20
```

---

## ✅ Vérification

Après réinstallation :

```bash
# Doit afficher v18.x.x
node --version

# Doit afficher la version de npm
npm --version

# Doit fonctionner
pm2 status
```

---

## 🎯 Action Immédiate

Exécutez ces commandes :

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18
nvm use 18
node --version
export PATH="$HOME/.local/bin:$PATH"
pm2 status
```

---

## 💡 Note

L'installation peut prendre quelques minutes. Attendez que la commande `nvm install 18` se termine complètement avant de continuer.


# 🔧 Corriger Node.js Manquant - Nettoyer et Réinstaller

## ❌ Problème : Binaire Node.js Manquant

nvm dit que Node.js 18 est installé, mais le binaire n'existe pas. Il faut nettoyer et réinstaller.

---

## ✅ Solution : Nettoyer et Réinstaller

```bash
# 1. Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. Vérifier ce qui existe
ls -la ~/.nvm/versions/node/

# 3. Désinstaller la version corrompue
nvm uninstall 18

# 4. Nettoyer manuellement si nécessaire
rm -rf ~/.nvm/versions/node/v18.20.8

# 5. Réinstaller Node.js 18
nvm install 18

# 6. Utiliser Node.js 18
nvm use 18

# 7. Vérifier
node --version
npm --version

# 8. Ajouter PM2 au PATH
export PATH="$HOME/.local/bin:$PATH"

# 9. Vérifier PM2
pm2 --version
pm2 status
```

---

## 🔍 Diagnostic

Vérifiez d'abord ce qui existe :

```bash
# Voir les versions installées
ls -la ~/.nvm/versions/node/

# Voir le contenu de v18.20.8
ls -la ~/.nvm/versions/node/v18.20.8/bin/ 2>/dev/null || echo "Le dossier n'existe pas"
```

---

## 🔄 Réinstallation Complète

Si le dossier est vide ou corrompu :

```bash
# 1. Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. Désinstaller
nvm uninstall 18

# 3. Nettoyer complètement
rm -rf ~/.nvm/versions/node/v18.20.8

# 4. Réinstaller
nvm install 18.20.8

# 5. Utiliser
nvm use 18.20.8
nvm alias default 18.20.8

# 6. Vérifier
node --version
npm --version
```

---

## 📋 Commandes Complètes

```bash
# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Désinstaller et nettoyer
nvm uninstall 18
rm -rf ~/.nvm/versions/node/v18.20.8

# Réinstaller
nvm install 18

# Utiliser
nvm use 18

# Vérifier
node --version
npm --version

# PM2
export PATH="$HOME/.local/bin:$PATH"
pm2 status
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

Exécutez ces commandes dans l'ordre :

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm uninstall 18
rm -rf ~/.nvm/versions/node/v18.20.8
nvm install 18
nvm use 18
node --version
```

---

## 💡 Note

L'installation peut prendre quelques minutes. Attendez que `nvm install 18` se termine complètement.


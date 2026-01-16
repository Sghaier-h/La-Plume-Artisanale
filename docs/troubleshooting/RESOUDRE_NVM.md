# 🔧 Résoudre le Problème nvm

## ❌ Erreur : "version 18 -> N/A is not yet installed"

Mais `node --version` montre `v18.20.8` ! Node.js est installé, mais nvm ne le reconnaît pas.

---

## ✅ Solution : Utiliser Node.js Directement

Puisque Node.js 18 et npm sont déjà installés et fonctionnent, on peut les utiliser directement sans nvm.

---

## 🚀 Commandes Directes (Sans nvm)

```bash
# Vérifier que node et npm fonctionnent
node --version
npm --version

# Aller dans le dossier backend
cd ~/fouta-erp/backend

# Installer les dépendances
npm install --production

# Installer PM2
npm install -g pm2 --prefix $HOME/.local
export PATH="$HOME/.local/bin:$PATH"

# Démarrer l'application
pm2 start src/server.js --name fouta-api
pm2 save

# Vérifier
pm2 status
```

---

## 🔧 Alternative : Réinstaller avec nvm

Si vous voulez utiliser nvm correctement :

```bash
# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Lister les versions installées
nvm list

# Si 18 n'est pas listé, réinstaller
nvm install 18.20.8
nvm use 18.20.8
nvm alias default 18.20.8
```

---

## 💡 Recommandation

**Utilisez directement node et npm** - ils fonctionnent déjà ! Pas besoin de nvm pour continuer.

---

## ✅ Action Immédiate

Exécutez simplement :

```bash
cd ~/fouta-erp/backend
npm install --production
npm install -g pm2 --prefix $HOME/.local
export PATH="$HOME/.local/bin:$PATH"
pm2 start src/server.js --name fouta-api
pm2 save
pm2 status
```


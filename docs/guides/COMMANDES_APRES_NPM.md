# 🚀 Commandes Après Installation de npm

## ✅ Base de Données Initialisée !

La bonne nouvelle : votre base de données PostgreSQL est déjà initialisée ! ✅

Il ne reste plus qu'à installer npm et les dépendances.

---

## 📦 Installer npm avec nvm (Recommandé)

```bash
# Installer nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Installer Node.js 18 (qui inclut npm)
nvm install 18
nvm use 18

# Vérifier
node --version
npm --version
```

---

## 🚀 Après Installation de npm

### 1. Installer les dépendances

```bash
cd ~/fouta-erp/backend
npm install --production
```

### 2. Installer PM2

```bash
npm install -g pm2 --prefix $HOME/.local
# OU
npm install pm2 --save-dev
```

### 3. Démarrer l'application

```bash
# Si PM2 est global
pm2 start src/server.js --name fouta-api
pm2 save

# OU si PM2 est local
node node_modules/pm2/bin/pm2 start src/server.js --name fouta-api
node node_modules/pm2/bin/pm2 save
```

---

## ✅ Vérification

```bash
# Vérifier PM2
pm2 status
# OU
node node_modules/pm2/bin/pm2 status

# Voir les logs
pm2 logs fouta-api
# OU
node node_modules/pm2/bin/pm2 logs fouta-api

# Tester l'API
curl http://localhost:5000/health
```

---

## 🎯 Résumé

1. ✅ Base de données initialisée
2. ⏳ Installer npm (via nvm recommandé)
3. ⏳ Installer dépendances
4. ⏳ Démarrer l'application

---

## 💡 Alternative : Via Panneau OVH

Si nvm ne fonctionne pas, installez npm via le panneau OVH :
1. Allez dans votre hébergement
2. Cherchez "Node.js" ou "Modules"
3. Activez/installez npm

---

## 🎉 Presque Terminé !

Votre base de données est prête. Il ne reste plus qu'à installer npm et démarrer l'application !


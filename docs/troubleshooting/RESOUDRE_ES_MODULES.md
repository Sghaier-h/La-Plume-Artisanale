# 🔧 Résoudre l'Erreur ES Modules

## ❌ Problème : `SyntaxError: Unexpected identifier` sur `import`

PM2 utilise probablement une ancienne version de Node.js qui ne supporte pas les ES modules.

---

## ✅ Solution : Spécifier Node.js 18 dans PM2

```bash
# 1. Vérifier quelle version de Node.js est utilisée
which node
node --version

# 2. Arrêter l'application
export PATH="$HOME/.local/bin:$PATH"
pm2 stop fouta-api
pm2 delete fouta-api

# 3. Redémarrer avec Node.js 18 explicitement
cd ~/fouta-erp/backend
pm2 start src/server.js --name fouta-api --interpreter node

# OU si Node.js 18 est dans un chemin spécifique
# pm2 start src/server.js --name fouta-api --interpreter $(which node)

# 4. Vérifier
pm2 status
pm2 logs fouta-api --lines 20
```

---

## 🔧 Solution Alternative : Utiliser nvm dans PM2

Si nvm est installé :

```bash
# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18

# Arrêter l'ancienne instance
export PATH="$HOME/.local/bin:$PATH"
pm2 stop fouta-api
pm2 delete fouta-api

# Démarrer avec le Node.js de nvm
cd ~/fouta-erp/backend
pm2 start src/server.js --name fouta-api --interpreter $(which node)

# Sauvegarder
pm2 save
```

---

## 🚀 Solution Complète

```bash
# 1. S'assurer que Node.js 18 est utilisé
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18 2>/dev/null || true

# 2. Vérifier la version
node --version
# Doit afficher v18.x.x

# 3. Arrêter l'application
export PATH="$HOME/.local/bin:$PATH"
pm2 stop fouta-api
pm2 delete fouta-api

# 4. Redémarrer depuis le bon répertoire
cd ~/fouta-erp/backend
pm2 start src/server.js --name fouta-api --interpreter $(which node)

# 5. Sauvegarder
pm2 save

# 6. Vérifier
pm2 status
pm2 logs fouta-api --lines 30

# 7. Tester
curl http://localhost:30000/health
```

---

## ✅ Résultat Attendu

- `pm2 status` : `status: online`
- Logs : `🚀 Serveur démarré sur 127.0.0.1:30000` (sans erreur)
- `curl` : `{"status":"OK","timestamp":"..."}`

---

## 💡 Note

Le problème vient du fait que PM2 utilise peut-être l'ancien Node.js v10.24.0 au lieu de Node.js 18. En spécifiant explicitement `--interpreter $(which node)`, on s'assure d'utiliser la bonne version.


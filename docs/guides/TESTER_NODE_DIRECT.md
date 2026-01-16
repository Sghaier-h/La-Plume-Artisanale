# ✅ Tester Node.js Directement

## ✅ Le Dossier bin Existe

Le dossier `bin` existe. Vérifions maintenant son contenu et testons Node.js directement.

---

## 🔍 Commandes de Vérification

```bash
# 1. Voir le contenu du dossier bin
ls -la ~/.nvm/versions/node/v18.20.8/bin/

# 2. Tester directement le chemin complet
~/.nvm/versions/node/v18.20.8/bin/node --version

# 3. Si ça fonctionne, ajouter au PATH
export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"

# 4. Vérifier
node --version
npm --version
```

---

## 🔧 Configuration Complète

Si le binaire fonctionne avec le chemin complet :

```bash
# 1. Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 2. Ajouter Node.js au PATH
export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"

# 3. Utiliser nvm (pour la cohérence)
nvm use 18

# 4. Vérifier
node --version
npm --version

# 5. PM2
export PATH="$HOME/.local/bin:$PATH"
pm2 status
pm2 logs fouta-api --lines 20
```

---

## 📋 Commandes Complètes

```bash
# Voir le contenu de bin
ls -la ~/.nvm/versions/node/v18.20.8/bin/

# Tester directement
~/.nvm/versions/node/v18.20.8/bin/node --version

# Si ça fonctionne, configurer le PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"
nvm use 18

# Vérifier
node --version
npm --version

# PM2
export PATH="$HOME/.local/bin:$PATH"
pm2 status
```

---

## 🎯 Action Immédiate

Exécutez ces commandes :

```bash
ls -la ~/.nvm/versions/node/v18.20.8/bin/
~/.nvm/versions/node/v18.20.8/bin/node --version
```

Si ça fonctionne, ajoutez au PATH et testez PM2.


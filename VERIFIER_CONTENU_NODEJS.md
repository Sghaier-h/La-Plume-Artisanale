# 🔍 Vérifier le Contenu de Node.js

## ✅ Le Dossier Existe

Le dossier `v18.20.8` existe. Vérifions maintenant son contenu.

---

## 🔍 Commandes de Vérification

```bash
# 1. Voir le contenu du dossier v18.20.8
ls -la ~/.nvm/versions/node/v18.20.8/

# 2. Vérifier le dossier bin
ls -la ~/.nvm/versions/node/v18.20.8/bin/

# 3. Vérifier si node existe
ls -la ~/.nvm/versions/node/v18.20.8/bin/node

# 4. Tester directement le chemin complet
~/.nvm/versions/node/v18.20.8/bin/node --version

# 5. Vérifier les permissions
ls -ld ~/.nvm/versions/node/v18.20.8/bin/node
```

---

## 🔧 Si le Fichier Existe mais Ne Fonctionne Pas

### Problème de Permissions

```bash
# Vérifier les permissions
ls -l ~/.nvm/versions/node/v18.20.8/bin/node

# Si nécessaire, rendre exécutable
chmod +x ~/.nvm/versions/node/v18.20.8/bin/node
```

### Problème de PATH

```bash
# Ajouter au PATH manuellement
export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"

# Vérifier
node --version
npm --version
```

---

## 📋 Commandes Complètes

```bash
# Voir le contenu
ls -la ~/.nvm/versions/node/v18.20.8/

# Voir le bin
ls -la ~/.nvm/versions/node/v18.20.8/bin/

# Tester directement
~/.nvm/versions/node/v18.20.8/bin/node --version

# Si ça fonctionne, ajouter au PATH
export PATH="$HOME/.nvm/versions/node/v18.20.8/bin:$PATH"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
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

Exécutez ces commandes pour voir le contenu :

```bash
ls -la ~/.nvm/versions/node/v18.20.8/
ls -la ~/.nvm/versions/node/v18.20.8/bin/
~/.nvm/versions/node/v18.20.8/bin/node --version
```

Dites-moi ce que vous voyez.


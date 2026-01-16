# 📦 Installer npm sur Hébergement Partagé OVH

## ❌ Problème : npm n'est pas installé

Node.js v10.24.0 est installé mais npm n'est pas disponible.

---

## 🚀 Solution 1 : Installer npm via le Panneau OVH

1. Allez dans le panneau OVH
2. Allez dans votre hébergement
3. Cherchez **"Node.js"** ou **"Modules"**
4. Activez/installez **npm**

---

## 🚀 Solution 2 : Installer npm Manuellement

### Étape 1 : Télécharger et installer npm

```bash
# Créer le dossier
mkdir -p ~/.local/bin
cd ~/.local

# Télécharger npm
curl -L https://registry.npmjs.org/npm/-/npm-6.14.18.tgz -o npm.tgz

# Extraire
tar -xzf npm.tgz

# Ou utiliser la méthode officielle
curl -L https://www.npmjs.com/install.sh | sh
```

### Étape 2 : Ajouter au PATH

```bash
# Ajouter au PATH pour cette session
export PATH="$HOME/.local/bin:$PATH"

# Ajouter au .bashrc pour les prochaines sessions
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

---

## 🚀 Solution 3 : Utiliser nvm (Node Version Manager)

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

## 🚀 Solution 4 : Continuer Sans npm (Temporaire)

Si npm ne peut pas être installé, vous pouvez :

### Option A : Utiliser les fichiers pré-compilés

Si vous avez déjà installé les dépendances ailleurs, copiez `node_modules/` via FTP.

### Option B : Contacter le Support OVH

Demandez-leur d'installer npm ou de mettre à jour Node.js vers une version récente (18+) qui inclut npm.

---

## ✅ Après Installation de npm

Une fois npm installé, continuez :

```bash
cd ~/fouta-erp/backend
export PATH="$HOME/.local/bin:$PATH"
npm install --production
```

---

## 🎯 Solution Rapide : Utiliser nvm

**Je recommande cette méthode** :

```bash
# Installer nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Charger nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Installer Node.js 18
nvm install 18
nvm use 18

# Vérifier
node --version
npm --version

# Continuer le déploiement
cd ~/fouta-erp/backend
npm install --production
```

---

## 📋 Checklist

- [ ] npm installé (via panneau OVH, nvm, ou manuellement)
- [ ] PATH configuré
- [ ] npm --version fonctionne
- [ ] Dépendances installées
- [ ] Application démarrée

---

## 🆘 Si Rien Ne Fonctionne

Contactez le support OVH et demandez :
- Installation de npm
- Mise à jour de Node.js vers v18+ (qui inclut npm)

---

## 💡 Note

La base de données est déjà initialisée ✅ ! Il ne reste plus qu'à installer npm et les dépendances.


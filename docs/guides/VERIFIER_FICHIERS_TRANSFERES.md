# ✅ Vérifier les Fichiers Transférés et Continuer le Déploiement

## 📋 Vérification des Fichiers Essentiels

### Sur le VPS

```bash
# Aller dans le dossier backend
cd /opt/fouta-erp/backend

# Vérifier les fichiers essentiels
ls -la

# Doit afficher :
# .gitignore
# package.json
# src/

# Vérifier la structure src/
ls -la src/

# Doit afficher :
# config/
# controllers/
# middleware/
# models/ (peut être vide)
# routes/
# services/ (peut être vide)
# utils/
# server.js

# Vérifier les fichiers importants
ls -la src/controllers/
ls -la src/routes/
ls -la src/middleware/
ls -la src/utils/
```

---

## ⚠️ Fichiers Manquants à Vérifier

### Fichiers Critiques

```bash
# Vérifier que ces fichiers existent
test -f src/server.js && echo "✅ server.js présent" || echo "❌ server.js manquant"
test -f package.json && echo "✅ package.json présent" || echo "❌ package.json manquant"
test -f src/config/cloud.js && echo "✅ cloud.js présent" || echo "❌ cloud.js manquant"
test -f src/utils/db.js && echo "✅ db.js présent" || echo "❌ db.js manquant"
```

### Si des Fichiers Manquent

**Dans FileZilla**, vérifiez et recopiez les fichiers manquants depuis :
- `D:\OneDrive - FLYING TEX\PROJET\backend\`

---

## 📦 Prochaine Étape : Installer les Dépendances

### 1. Vérifier Node.js

```bash
# Vérifier si Node.js est installé
node -v
npm -v

# Si pas installé, installer Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier
node -v  # Doit afficher v18.x.x
npm -v   # Doit afficher 9.x.x ou 10.x.x
```

### 2. Installer les Dépendances

```bash
cd /opt/fouta-erp/backend

# Installer les dépendances
npm install --production

# Attendre la fin de l'installation
# Doit créer le dossier node_modules/
```

### 3. Vérifier l'Installation

```bash
# Vérifier que node_modules existe
ls -la node_modules/ | head -5

# Vérifier la taille (doit être plusieurs centaines de MB)
du -sh node_modules/
```

---

## ⚙️ Créer le Fichier .env

### Créer le Fichier

```bash
cd /opt/fouta-erp/backend

# Créer le fichier .env
nano .env
```

### Contenu du Fichier .env

```env
# Base de données PostgreSQL OVH
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007

# Serveur
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://fabrication.laplume-artisanale.tn

# JWT
JWT_SECRET=3f0816cf15bf9e57d17259e1c240761e9576ad1c33af5a163400f338bad5e03c
JWT_EXPIRE=7d

# API
API_URL=https://fabrication.laplume-artisanale.tn
API_VERSION=v1

# Redis (optionnel)
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Sauvegarder** : Ctrl+O, Entrée, Ctrl+X

### Vérifier le Fichier

```bash
# Vérifier que .env existe
ls -la .env

# Voir le contenu (sans afficher le mot de passe)
cat .env | grep -v PASSWORD
```

---

## 🚀 Créer le Fichier index.js

### Vérifier si index.js Existe

```bash
cd /opt/fouta-erp/backend

# Vérifier
ls -la index.js

# Si n'existe pas, créer
cat > index.js << 'EOF'
// Point d'entrée pour le VPS
import './src/server.js';
EOF

# Vérifier
cat index.js
```

---

## ✅ Checklist Avant de Démarrer l'Application

- [ ] Tous les fichiers transférés
- [ ] Node.js 18 installé : `node -v`
- [ ] Dépendances installées : `npm install --production`
- [ ] Fichier `.env` créé avec les bonnes valeurs
- [ ] Fichier `index.js` créé (si nécessaire)
- [ ] Structure vérifiée : `ls -la src/`

---

## 🔄 Prochaines Étapes

Une fois tout vérifié :

1. **Installer PM2** : `sudo npm install -g pm2`
2. **Démarrer l'application** : `pm2 start index.js --name fouta-api`
3. **Configurer Nginx** : Reverse proxy vers port 5000
4. **Configurer SSL** : `sudo certbot --nginx`
5. **Configurer DNS** : A record vers `137.74.40.191`

**Vérifiez d'abord que tous les fichiers sont présents, puis continuez !**


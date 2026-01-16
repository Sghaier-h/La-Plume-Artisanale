# 🚀 Déployer avec Git

## 🎯 Avantages du Déploiement avec Git

- ✅ **Versioning** : Historique des modifications
- ✅ **Mises à jour faciles** : `git pull` sur le VPS
- ✅ **Build sur le serveur** : Plus de transfert de fichiers
- ✅ **Déploiement automatique** : Scripts de déploiement
- ✅ **Rollback facile** : Retour à une version précédente

---

## 📋 Prérequis

- ✅ Git installé sur votre machine Windows
- ✅ Git installé sur le VPS
- ✅ Dépôt Git (GitHub, GitLab, ou autre) - optionnel mais recommandé

---

## 🔧 Étape 1 : Préparer le Dépôt Git

### Option A : Utiliser un Dépôt Existant

Si vous avez déjà un dépôt Git :

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET"
git status
```

### Option B : Initialiser un Nouveau Dépôt

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET"

# Initialiser Git (si pas déjà fait)
git init

# Créer un fichier .gitignore si nécessaire
```

### Créer/Mettre à Jour .gitignore

```powershell
# Vérifier si .gitignore existe
Test-Path .gitignore

# Si non, créer un .gitignore
@"
# Dependencies
node_modules/
package-lock.json

# Build
frontend/build/
backend/dist/

# Environment
.env
.env.local
.env.production
.env.development

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# PM2
.pm2/
"@ | Out-File -FilePath .gitignore -Encoding utf8
```

---

## 📤 Étape 2 : Pousser le Code sur Git (Optionnel mais Recommandé)

### Si vous utilisez GitHub/GitLab

```powershell
# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Initial commit - ERP La Plume Artisanale"

# Ajouter le remote (remplacer par votre URL)
git remote add origin https://github.com/votre-username/votre-repo.git

# Pousser
git push -u origin main
```

**💡 Note** : Si vous préférez ne pas utiliser de dépôt distant, vous pouvez cloner directement depuis votre machine vers le VPS avec `scp` ou utiliser un dépôt local.

---

## 🖥️ Étape 3 : Installer Git sur le VPS

### Se connecter au VPS

```bash
ssh ubuntu@137.74.40.191
```

### Installer Git (si pas déjà installé)

```bash
sudo apt update
sudo apt install -y git
```

### Vérifier l'installation

```bash
git --version
```

---

## 📥 Étape 4 : Cloner le Projet sur le VPS

### Option A : Cloner depuis GitHub/GitLab

```bash
# Créer le dossier pour l'application
sudo mkdir -p /opt/fouta-erp
sudo chown -R ubuntu:ubuntu /opt/fouta-erp

# Cloner le dépôt
cd /opt/fouta-erp
git clone https://github.com/votre-username/votre-repo.git .

# Ou si vous préférez un dossier séparé
git clone https://github.com/votre-username/votre-repo.git /opt/fouta-erp/app
```

### Option B : Cloner depuis votre Machine (SSH)

Si vous avez configuré SSH entre votre machine et le VPS :

```bash
# Sur le VPS
cd /opt/fouta-erp
git clone ubuntu@votre-machine-ip:/chemin/vers/projet .
```

### Option C : Créer un Dépôt Local sur le VPS

```bash
# Créer le dossier
sudo mkdir -p /opt/fouta-erp
sudo chown -R ubuntu:ubuntu /opt/fouta-erp

# Initialiser Git
cd /opt/fouta-erp
git init

# Transférer les fichiers depuis votre machine (première fois)
# Puis :
git add .
git commit -m "Initial commit"
```

---

## 🔧 Étape 5 : Configurer le Backend sur le VPS

### Installer les Dépendances Backend

```bash
cd /opt/fouta-erp/backend

# Installer les dépendances
npm install --production

# Vérifier que le fichier .env existe
ls -la .env

# Si non, le créer
nano .env
```

**Contenu de `.env`** (déjà configuré normalement) :
```env
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007

PORT=5000
NODE_ENV=production
FRONTEND_URL=https://fabrication.laplume-artisanale.tn

JWT_SECRET=3f0816cf15bf9e57d17259e1c240761e9576ad1c33af5a163400f338bad5e03c
JWT_EXPIRE=7d

API_URL=https://fabrication.laplume-artisanale.tn
API_VERSION=v1
```

### Vérifier que PM2 est Configuré

```bash
# Vérifier le statut
pm2 status

# Si l'application n'est pas démarrée
cd /opt/fouta-erp/backend
pm2 start index.js --name fouta-api
pm2 save
```

---

## 🎨 Étape 6 : Build et Déployer le Frontend

### Installer les Dépendances Frontend

```bash
cd /opt/fouta-erp/frontend

# Installer les dépendances
npm install
```

**⚠️ Si erreur TypeScript** : Utiliser `npm install --legacy-peer-deps`

### Créer le Fichier .env.production

```bash
nano .env.production
```

**Contenu** :
```env
REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api
```

### Build le Frontend

```bash
npm run build
```

**⏱️ Cela peut prendre 2-5 minutes**

**Résultat** : Un dossier `build/` est créé avec les fichiers optimisés.

---

## ⚙️ Étape 7 : Configurer Nginx

### Modifier la Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/fabrication
```

### Configuration Complète

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name fabrication.laplume-artisanale.tn;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/fabrication.laplume-artisanale.tn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fabrication.laplume-artisanale.tn/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Redirection HTTP → HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }

    # Servir le frontend React
    root /opt/fouta-erp/frontend/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Routes API - Proxy vers le backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Frontend React - Toutes les autres routes
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache pour les assets statiques
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Tester et Recharger

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔄 Étape 8 : Script de Déploiement Automatique

### Créer un Script de Déploiement

```bash
nano /opt/fouta-erp/deploy.sh
```

**Contenu** :
```bash
#!/bin/bash

# Script de déploiement automatique
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Début du déploiement..."

# Aller dans le dossier du projet
cd /opt/fouta-erp

# Mettre à jour le code depuis Git
echo "📥 Mise à jour du code..."
git pull origin main  # ou master, selon votre branche

# Backend
echo "🔧 Mise à jour du backend..."
cd backend
npm install --production
pm2 restart fouta-api
cd ..

# Frontend
echo "🎨 Build du frontend..."
cd frontend
npm install
npm run build
cd ..

# Recharger Nginx
echo "⚙️ Rechargement de Nginx..."
sudo systemctl reload nginx

echo "✅ Déploiement terminé avec succès !"
```

### Rendre le Script Exécutable

```bash
chmod +x /opt/fouta-erp/deploy.sh
```

### Tester le Script

```bash
/opt/fouta-erp/deploy.sh
```

---

## 🔄 Mises à Jour Futures

### Méthode 1 : Déploiement Manuel

```bash
# Sur le VPS
cd /opt/fouta-erp
git pull
./deploy.sh
```

### Méthode 2 : Webhook GitHub (Avancé)

Vous pouvez configurer un webhook GitHub pour déployer automatiquement à chaque push.

### Méthode 3 : Depuis votre Machine

```powershell
# Sur votre machine Windows
cd "D:\OneDrive - FLYING TEX\PROJET"
git add .
git commit -m "Mise à jour de l'application"
git push

# Puis sur le VPS
ssh ubuntu@137.74.40.191
cd /opt/fouta-erp
git pull
./deploy.sh
```

---

## 📋 Checklist de Déploiement

- [ ] Git installé sur le VPS
- [ ] Projet cloné sur le VPS dans `/opt/fouta-erp`
- [ ] Backend configuré (`.env` créé)
- [ ] Dépendances backend installées (`npm install --production`)
- [ ] PM2 configuré et application démarrée
- [ ] Dépendances frontend installées (`npm install`)
- [ ] Fichier `.env.production` créé
- [ ] Frontend buildé (`npm run build`)
- [ ] Nginx configuré pour servir le frontend
- [ ] Nginx testé et rechargé
- [ ] Script de déploiement créé (`deploy.sh`)
- [ ] Application accessible via `https://fabrication.laplume-artisanale.tn`

---

## 🎯 Résultat Final

Après ces étapes :

- ✅ **Code versionné** : Historique Git complet
- ✅ **Déploiement facile** : `git pull` + `./deploy.sh`
- ✅ **Application accessible** : `https://fabrication.laplume-artisanale.tn`
- ✅ **Mises à jour simples** : Pull + rebuild automatique

---

## 🚀 Avantages du Déploiement avec Git

1. **Versioning** : Historique complet des modifications
2. **Rollback facile** : `git checkout <commit>` pour revenir en arrière
3. **Collaboration** : Plusieurs développeurs peuvent travailler
4. **Backup automatique** : Le code est sauvegardé sur Git
5. **Déploiement rapide** : `git pull` + script de déploiement

---

## ✅ C'est Prêt !

Votre application est maintenant déployée avec Git et peut être mise à jour facilement !


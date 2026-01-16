# 🌐 Déployer le Frontend sur le VPS

## 🎯 Objectif

Déployer le frontend React sur le VPS OVH pour que l'application soit accessible partout via `https://fabrication.laplume-artisanale.tn`, avec gestion des utilisateurs et administrateurs.

---

## 📋 Architecture Finale

```
https://fabrication.laplume-artisanale.tn/
├── / (Frontend React - Interface utilisateur)
├── /api/* (Backend API - Déjà déployé)
└── /health (Health check API)
```

---

## 🚀 Étape 1 : Build du Frontend en Production

### Sur votre machine Windows

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\frontend"

# Créer le fichier .env pour la production
New-Item -ItemType File -Name ".env.production" -Force
notepad .env.production
```

### Ajouter dans `.env.production`

```env
REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api
```

### Build de production

```powershell
npm run build
```

**⏱️ Cela peut prendre 2-5 minutes**

**Résultat** : Un dossier `build/` est créé avec les fichiers optimisés pour la production.

---

## 📤 Étape 2 : Transférer le Frontend sur le VPS

### Option A : Via FileZilla

1. **Ouvrir FileZilla**
2. **Se connecter au VPS** :
   - Hôte : `137.74.40.191`
   - Utilisateur : `ubuntu`
   - Port : `22`
   - Protocole : `SFTP`
3. **Naviguer vers** : `/opt/fouta-erp/`
4. **Créer le dossier** `frontend` si nécessaire
5. **Transférer tout le contenu** du dossier `build/` vers `/opt/fouta-erp/frontend/`

### Option B : Via SCP (PowerShell)

```powershell
# Depuis votre machine
scp -r "D:\OneDrive - FLYING TEX\PROJET\frontend\build\*" ubuntu@137.74.40.191:/opt/fouta-erp/frontend/
```

---

## 🔧 Étape 3 : Configurer Nginx pour Servir le Frontend

### Se connecter au VPS

```bash
ssh ubuntu@137.74.40.191
```

### Modifier la configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/fabrication
```

### Remplacer par cette configuration complète

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name fabrication.laplume-artisanale.tn;

    # SSL Configuration (déjà configuré par Certbot)
    ssl_certificate /etc/letsencrypt/live/fabrication.laplume-artisanale.tn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fabrication.laplume-artisanale.tn/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Redirection HTTP vers HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }

    # Servir le frontend React (fichiers statiques)
    root /opt/fouta-erp/frontend;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Routes API - Proxy vers le backend Node.js
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
        
        # Timeout pour Socket.IO
        proxy_read_timeout 86400;
    }

    # Health check API
    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO (pour le temps réel)
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

    # Sécurité - Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Tester la configuration

```bash
sudo nginx -t
```

**Doit afficher** : `syntax is ok` et `test is successful`

### Recharger Nginx

```bash
sudo systemctl reload nginx
```

---

## ✅ Étape 4 : Vérifier les Permissions

### Vérifier que les fichiers sont accessibles

```bash
ls -la /opt/fouta-erp/frontend/
```

### Si nécessaire, corriger les permissions

```bash
sudo chown -R www-data:www-data /opt/fouta-erp/frontend
sudo chmod -R 755 /opt/fouta-erp/frontend
```

---

## 🧪 Étape 5 : Tester l'Application

### Depuis votre navigateur

1. **Ouvrir** : `https://fabrication.laplume-artisanale.tn`
2. **Doit afficher** : L'interface de connexion de votre application React
3. **Se connecter** avec vos identifiants

### Vérifier que l'API fonctionne

```powershell
# Depuis PowerShell
curl.exe https://fabrication.laplume-artisanale.tn/api/health
# Doit retourner : {"status":"OK",...}
```

---

## 🔄 Étape 6 : Mettre à Jour le Frontend (Futur)

Quand vous modifiez le frontend :

### 1. Sur votre machine

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\frontend"
npm run build
```

### 2. Transférer sur le VPS

```powershell
scp -r "D:\OneDrive - FLYING TEX\PROJET\frontend\build\*" ubuntu@137.74.40.191:/opt/fouta-erp/frontend/
```

### 3. Redémarrer Nginx (optionnel, généralement pas nécessaire)

```bash
sudo systemctl reload nginx
```

---

## 👥 Gestion des Utilisateurs

### Créer des utilisateurs dans la base de données

Les utilisateurs sont gérés via l'API backend. Vous pouvez :

1. **Utiliser l'interface admin** (une fois connecté en tant qu'admin)
2. **Créer directement dans la base de données PostgreSQL**

### Exemple : Créer un utilisateur admin

```sql
-- Se connecter à la base de données
psql -U Aviateur -d ERP_La_Plume -h sh131616-002.eu.clouddb.ovh.net -p 35392

-- Insérer un utilisateur (exemple)
INSERT INTO utilisateurs (nom_utilisateur, email, mot_de_passe_hash, role, actif)
VALUES ('admin', 'admin@laplume-artisanale.tn', '$2b$10$...', 'admin', true);
```

**⚠️ Note** : Le mot de passe doit être hashé avec bcrypt.

---

## 📋 Checklist de Déploiement

- [ ] Frontend buildé en production (`npm run build`)
- [ ] Fichier `.env.production` créé avec l'URL de l'API
- [ ] Dossier `build/` transféré sur le VPS dans `/opt/fouta-erp/frontend/`
- [ ] Configuration Nginx modifiée pour servir le frontend
- [ ] Nginx testé (`sudo nginx -t`)
- [ ] Nginx rechargé (`sudo systemctl reload nginx`)
- [ ] Permissions vérifiées (`ls -la /opt/fouta-erp/frontend/`)
- [ ] Application accessible via `https://fabrication.laplume-artisanale.tn`
- [ ] Connexion fonctionne
- [ ] API accessible via `/api/*`

---

## 🎯 Résultat Final

Après ces étapes :

- ✅ **Frontend accessible** : `https://fabrication.laplume-artisanale.tn`
- ✅ **API accessible** : `https://fabrication.laplume-artisanale.tn/api/*`
- ✅ **Application complète** : Interface + Backend
- ✅ **Accessible partout** : Depuis n'importe quel navigateur
- ✅ **HTTPS activé** : Connexion sécurisée
- ✅ **Gestion utilisateurs** : Via l'interface admin

---

## 🚀 C'est Prêt !

Votre application ERP est maintenant complètement déployée et accessible partout sur Internet !


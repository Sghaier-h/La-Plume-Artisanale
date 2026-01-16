# 🔧 Corriger la Configuration Nginx pour Servir le Frontend

## 🎯 Problème

Nginx proxy `/` vers le backend au lieu de servir les fichiers statiques du frontend React.

## ✅ Solution

### 1. Se connecter au serveur

```bash
ssh ubuntu@137.74.40.191
```

### 2. Vérifier la configuration Nginx actuelle

```bash
sudo cat /etc/nginx/sites-available/fabrication
```

### 3. Vérifier que le frontend existe

```bash
ls -la /opt/fouta-erp/frontend/
```

**Si le dossier n'existe pas ou est vide**, il faut déployer le frontend.

### 4. Configuration Nginx correcte

Modifier la configuration :

```bash
sudo nano /etc/nginx/sites-available/fabrication
```

**Configuration complète à utiliser** :

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

    # Redirection HTTP vers HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }

    # ⚠️ IMPORTANT : Servir le frontend React (fichiers statiques)
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

    # ⚠️ IMPORTANT : Frontend React - Toutes les autres routes
    # Cette section DOIT être en dernier pour capturer toutes les routes non-API
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

### 5. Tester la configuration

```bash
sudo nginx -t
```

**Doit afficher** : `syntax is ok` et `test is successful`

### 6. Recharger Nginx

```bash
sudo systemctl reload nginx
```

### 7. Vérifier les permissions du frontend

```bash
sudo chown -R www-data:www-data /opt/fouta-erp/frontend
sudo chmod -R 755 /opt/fouta-erp/frontend
```

## 🚨 Si le frontend n'existe pas

### Option 1 : Build et déployer depuis votre machine

```powershell
# Sur votre machine Windows
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"

# Créer .env.production
echo "REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api" > .env.production

# Build
npm run build

# Transférer sur le serveur
scp -r build/* ubuntu@137.74.40.191:/opt/fouta-erp/frontend/
```

### Option 2 : Build directement sur le serveur

```bash
# Sur le serveur
cd /opt/fouta-erp/frontend

# Installer les dépendances
npm install --production

# Créer .env.production
echo "REACT_APP_API_URL=https://fabrication.laplume-artisanale.tn/api" > .env.production

# Build
npm run build

# Copier le build
cp -r build/* /opt/fouta-erp/frontend/
```

## ✅ Vérification finale

1. **Ouvrir** : `https://fabrication.laplume-artisanale.tn`
2. **Doit afficher** : La page de connexion React (pas du JSON)
3. **Tester l'API** : `https://fabrication.laplume-artisanale.tn/api/health`

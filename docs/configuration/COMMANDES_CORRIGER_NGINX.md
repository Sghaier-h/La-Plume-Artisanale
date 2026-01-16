# 🔧 Commandes pour Corriger Nginx

## 📋 Étapes à exécuter sur le serveur

### 1. Se connecter au serveur

```bash
ssh ubuntu@137.74.40.191
```

### 2. Sauvegarder l'ancienne configuration (au cas où)

```bash
sudo cp /etc/nginx/sites-available/fabrication /etc/nginx/sites-available/fabrication.backup
```

### 3. Modifier la configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/fabrication
```

### 4. Remplacer TOUT le contenu par :

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name fabrication.laplume-artisanale.tn;

    # SSL Configuration (géré par Certbot)
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

**Doit afficher** : 
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 6. Recharger Nginx

```bash
sudo systemctl reload nginx
```

### 7. Vérifier que le frontend existe

```bash
ls -la /opt/fouta-erp/frontend/
```

**Si le dossier est vide ou n'existe pas**, il faut déployer le frontend :

```bash
# Vérifier si le dossier existe
ls -la /opt/fouta-erp/frontend/

# Si vide, créer le dossier
sudo mkdir -p /opt/fouta-erp/frontend

# Vérifier les permissions
sudo chown -R www-data:www-data /opt/fouta-erp/frontend
sudo chmod -R 755 /opt/fouta-erp/frontend
```

### 8. Si le frontend n'est pas déployé

Le frontend doit être buildé et déployé. Voir `DEPLOYER_FRONTEND_VPS.md` pour les instructions complètes.

## ✅ Vérification finale

1. **Ouvrir** : `https://fabrication.laplume-artisanale.tn`
2. **Doit afficher** : La page de connexion React (pas du JSON)
3. **Tester l'API** : `https://fabrication.laplume-artisanale.tn/api/health`

## 🔍 Dépannage

Si ça ne fonctionne pas :

```bash
# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log

# Vérifier que le frontend est accessible
ls -la /opt/fouta-erp/frontend/index.html

# Vérifier les permissions
sudo chown -R www-data:www-data /opt/fouta-erp/frontend
sudo chmod -R 755 /opt/fouta-erp/frontend

# Redémarrer Nginx
sudo systemctl restart nginx
```

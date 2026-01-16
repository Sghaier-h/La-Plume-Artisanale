# 🚀 Déploiement OVH - Configuration Personnalisée

## ✅ Informations du serveur

- **Domaine** : `fabrication.laplume-artisanale.tn`
- **SSH** : `ssh://allbyfb@ssh.cluster130.hosting.ovh.net:22/`
- **FTP** : `ftp://allbyfb@ftp.cluster130.hosting.ovh.net/`
- **Utilisateur** : `allbyfb`

---

## 🎯 Étape 1 : Se connecter au serveur

```bash
ssh allbyfb@ssh.cluster130.hosting.ovh.net
```

**Note** : Vous devrez entrer votre mot de passe SSH.

---

## 🎯 Étape 2 : Vérifier l'environnement

```bash
# Vérifier la version de Linux
cat /etc/os-release

# Vérifier si Node.js est installé
node --version

# Vérifier si Git est installé
git --version

# Vérifier si PostgreSQL est installé
psql --version
```

---

## 🎯 Étape 3 : Installation des dépendances

### 3.1 Mise à jour du système

```bash
sudo apt update
sudo apt upgrade -y
```

### 3.2 Installation Node.js 18

```bash
# Installer Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier
node --version
npm --version
```

### 3.3 Installation PostgreSQL

```bash
# Installer PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Démarrer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Créer la base de données
sudo -u postgres psql << EOF
CREATE DATABASE fouta_erp;
CREATE USER fouta_user WITH PASSWORD 'VOTRE_MOT_DE_PASSE_SECURISE';
GRANT ALL PRIVILEGES ON DATABASE fouta_erp TO fouta_user;
\q
EOF
```

**Remplacez** `VOTRE_MOT_DE_PASSE_SECURISE` par un mot de passe fort.

### 3.4 Installation Redis (optionnel)

```bash
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 3.5 Installation Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.6 Installation PM2

```bash
sudo npm install -g pm2
```

---

## 🎯 Étape 4 : Cloner le projet depuis GitHub

```bash
# Créer le dossier du projet
sudo mkdir -p /var/www/fouta-erp
sudo chown -R allbyfb:allbyfb /var/www/fouta-erp

# Cloner le projet
cd /var/www/fouta-erp
git clone https://github.com/Sghaier-h/La-Plume-Artisanale.git .
```

---

## 🎯 Étape 5 : Configuration Backend

### 5.1 Installer les dépendances

```bash
cd /var/www/fouta-erp/backend
npm install --production
```

### 5.2 Créer le fichier .env

```bash
nano backend/.env
```

**Contenu du fichier `.env`** :

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fouta_erp
DB_USER=fouta_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE_SECURISE

# Serveur
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://fabrication.laplume-artisanale.tn

# JWT
JWT_SECRET=VOTRE_SECRET_JWT_TRES_LONG_ET_SECURISE_ALEATOIRE
JWT_EXPIRE=7d

# API
API_URL=https://fabrication.laplume-artisanale.tn
API_VERSION=v1

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Générer un JWT Secret** :
```bash
openssl rand -hex 32
```

---

## 🎯 Étape 6 : Initialiser la base de données

```bash
cd /var/www/fouta-erp/database

# Exécuter les scripts SQL
psql -U fouta_user -d fouta_erp -f 01_base_et_securite.sql
psql -U fouta_user -d fouta_erp -f 02_production_et_qualite.sql
psql -U fouta_user -d fouta_erp -f 03_flux_et_tracabilite.sql
psql -U fouta_user -d fouta_erp -f 04_mobile_devices.sql
```

---

## 🎯 Étape 7 : Configuration Nginx

### 7.1 Créer la configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/fouta-erp
```

**Contenu** :

```nginx
server {
    listen 80;
    server_name fabrication.laplume-artisanale.tn;

    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fabrication.laplume-artisanale.tn;

    ssl_certificate /etc/letsencrypt/live/fabrication.laplume-artisanale.tn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fabrication.laplume-artisanale.tn/privkey.pem;

    # Headers sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy vers Node.js
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket pour Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 7.2 Activer le site

```bash
sudo ln -s /etc/nginx/sites-available/fouta-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🎯 Étape 8 : Installation SSL (Let's Encrypt)

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d fabrication.laplume-artisanale.tn

# Renouvellement automatique
sudo certbot renew --dry-run
```

---

## 🎯 Étape 9 : Démarrer l'application avec PM2

```bash
cd /var/www/fouta-erp/backend
pm2 start src/server.js --name fouta-api
pm2 save
pm2 startup
```

**Exécutez la commande affichée** par `pm2 startup` pour le démarrage automatique.

---

## 🎯 Étape 10 : Configuration Firewall

```bash
# Autoriser les ports nécessaires
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 🎯 Étape 11 : Vérification

### Tester l'API

```bash
# Depuis le serveur
curl http://localhost:5000/health

# Depuis votre machine
curl https://fabrication.laplume-artisanale.tn/health
```

Devrait retourner :
```json
{"status":"OK","timestamp":"..."}
```

### Vérifier PM2

```bash
pm2 status
pm2 logs fouta-api
```

### Vérifier Nginx

```bash
sudo systemctl status nginx
```

---

## 🔄 Mise à jour future

```bash
cd /var/www/fouta-erp
git pull origin main
cd backend
npm install --production
pm2 restart fouta-api
```

Ou utilisez le script :

```bash
cd /var/www/fouta-erp
bash scripts/deploy.sh
```

---

## 📊 Monitoring

### Voir les logs

```bash
pm2 logs fouta-api
pm2 monit
```

### Vérifier le statut

```bash
cd /var/www/fouta-erp
bash scripts/check-status.sh
```

---

## 🔐 Sécurité

### Checklist sécurité

- [ ] Mot de passe PostgreSQL fort
- [ ] JWT Secret long et aléatoire
- [ ] Firewall configuré
- [ ] Certificat SSL installé
- [ ] Backups automatiques configurés

---

## 🆘 Dépannage

### L'application ne démarre pas

```bash
pm2 logs fouta-api
psql -U fouta_user -d fouta_erp -c "SELECT 1;"
```

### Erreur 502 Bad Gateway

```bash
pm2 status
sudo nginx -t
sudo systemctl restart nginx
```

### Problème SSL

```bash
sudo certbot certificates
sudo certbot renew
```

---

## ✅ URLs finales

- **API** : `https://fabrication.laplume-artisanale.tn`
- **Health Check** : `https://fabrication.laplume-artisanale.tn/health`
- **API Mobile** : `https://fabrication.laplume-artisanale.tn/api/v1/mobile/`

---

## 📱 Configuration Applications Android

Mettez à jour l'URL dans `mobile/android/shared/api/ApiClient.kt` :

```kotlin
const val BASE_URL = "https://fabrication.laplume-artisanale.tn/api/v1/"
```

---

## 🎉 Félicitations !

Votre application est maintenant déployée sur `fabrication.laplume-artisanale.tn` !


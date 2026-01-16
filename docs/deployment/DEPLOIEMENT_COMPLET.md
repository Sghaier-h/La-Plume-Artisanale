# 🚀 Déploiement Complet - La Plume Artisanale

## ✅ Informations du serveur

- **IP** : `145.239.37.162`
- **Domaine** : `fabrication.laplume-artisanale.tn`
- **SSH** : `ssh allbyfb@ssh.cluster130.hosting.ovh.net`
- **Utilisateur** : `allbyfb`
- **Mot de passe** : `Allbyfouta007` ⚠️ (À changer après installation)

---

## 🎯 Déploiement en 3 étapes

### Étape 1 : Se connecter au serveur

```bash
ssh allbyfb@145.239.37.162
# ou
ssh allbyfb@ssh.cluster130.hosting.ovh.net
```

**Mot de passe** : `Allbyfouta007`

---

### Étape 2 : Exécuter le script d'installation

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Git
sudo apt install -y git

# Télécharger et exécuter le script
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/scripts/install-ovh.sh)
```

**Réponses aux questions** :
- URL GitHub : `https://github.com/Sghaier-h/La-Plume-Artisanale.git`
- Mot de passe PostgreSQL : (choisissez un mot de passe fort, différent de Allbyfouta007)
- JWT Secret : (générez avec `openssl rand -hex 32`)
- Domaine API : `fabrication.laplume-artisanale.tn`
- Domaine Frontend : `fabrication.laplume-artisanale.tn`

---

### Étape 3 : Vérifier l'installation

```bash
# Vérifier PM2
pm2 status

# Tester l'API
curl http://localhost:5000/health
curl https://fabrication.laplume-artisanale.tn/health
```

---

## 🔧 Configuration manuelle (si le script ne fonctionne pas)

### 1. Installation des dépendances

```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Redis
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Nginx
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# PM2
sudo npm install -g pm2
```

### 2. Créer la base de données

```bash
sudo -u postgres psql << EOF
CREATE DATABASE fouta_erp;
CREATE USER fouta_user WITH PASSWORD 'VOTRE_MOT_DE_PASSE_FORT';
GRANT ALL PRIVILEGES ON DATABASE fouta_erp TO fouta_user;
\q
EOF
```

**⚠️ Important** : Utilisez un mot de passe différent de `Allbyfouta007` !

### 3. Cloner le projet

```bash
sudo mkdir -p /var/www/fouta-erp
sudo chown -R allbyfb:allbyfb /var/www/fouta-erp
cd /var/www/fouta-erp
git clone https://github.com/Sghaier-h/La-Plume-Artisanale.git .
```

### 4. Configurer le backend

```bash
cd /var/www/fouta-erp/backend
npm install --production

# Créer .env
nano .env
```

**Contenu `.env`** :
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fouta_erp
DB_USER=fouta_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE_FORT

PORT=5000
NODE_ENV=production
FRONTEND_URL=https://fabrication.laplume-artisanale.tn

JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRE=7d

API_URL=https://fabrication.laplume-artisanale.tn
API_VERSION=v1

REDIS_HOST=localhost
REDIS_PORT=6379
```

### 5. Initialiser la base de données

```bash
cd /var/www/fouta-erp/database
psql -U fouta_user -d fouta_erp -f 01_base_et_securite.sql
psql -U fouta_user -d fouta_erp -f 02_production_et_qualite.sql
psql -U fouta_user -d fouta_erp -f 03_flux_et_tracabilite.sql
psql -U fouta_user -d fouta_erp -f 04_mobile_devices.sql
```

### 6. Configurer Nginx

```bash
sudo nano /etc/nginx/sites-available/fouta-erp
```

**Contenu** :
```nginx
server {
    listen 80;
    server_name fabrication.laplume-artisanale.tn 145.239.37.162;
    return 301 https://fabrication.laplume-artisanale.tn$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fabrication.laplume-artisanale.tn;

    ssl_certificate /etc/letsencrypt/live/fabrication.laplume-artisanale.tn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fabrication.laplume-artisanale.tn/privkey.pem;

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

    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/fouta-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Installer SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d fabrication.laplume-artisanale.tn
```

### 8. Démarrer l'application

```bash
cd /var/www/fouta-erp/backend
pm2 start src/server.js --name fouta-api
pm2 save
pm2 startup
```

---

## 🔐 Sécurité - Actions importantes

### ⚠️ Changer le mot de passe SSH

```bash
passwd
```

### ⚠️ Configurer SSH avec clés (recommandé)

```bash
# Sur votre machine locale
ssh-keygen -t ed25519 -C "votre-email@example.com"
ssh-copy-id allbyfb@145.239.37.162
```

### ⚠️ Configurer le firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## ✅ Vérification finale

### Tester l'API

```bash
# Depuis le serveur
curl http://localhost:5000/health

# Depuis votre machine
curl https://fabrication.laplume-artisanale.tn/health
curl http://145.239.37.162:5000/health
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

## 📱 Configuration Android

Mettez à jour l'URL dans `mobile/android/shared/api/ApiClient.kt` :

```kotlin
const val BASE_URL = "https://fabrication.laplume-artisanale.tn/api/v1/"
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

---

## 🆘 Dépannage

### Connexion SSH

```bash
ssh -v allbyfb@145.239.37.162
```

### Vérifier les services

```bash
sudo systemctl status postgresql
sudo systemctl status nginx
sudo systemctl status redis-server
pm2 status
```

### Voir les logs

```bash
pm2 logs fouta-api
sudo tail -f /var/log/nginx/error.log
```

---

## 📊 URLs finales

- **API** : `https://fabrication.laplume-artisanale.tn`
- **API IP** : `http://145.239.37.162:5000`
- **Health Check** : `https://fabrication.laplume-artisanale.tn/health`
- **API Mobile** : `https://fabrication.laplume-artisanale.tn/api/v1/mobile/`

---

## 🎉 Félicitations !

Votre application est maintenant déployée !

**⚠️ N'oubliez pas de changer le mot de passe SSH après l'installation !**


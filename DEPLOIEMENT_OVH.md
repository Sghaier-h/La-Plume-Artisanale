# ☁️ Guide de Déploiement sur Serveur OVH Cloud

## 🎯 Prérequis

### Serveur OVH
- **VPS** : Ubuntu 22.04 LTS ou Debian 11
- **RAM** : Minimum 2 GB (recommandé 4 GB)
- **Stockage** : Minimum 20 GB
- **Accès** : SSH avec clé ou mot de passe

### Domaines
- **API** : `api.fouta-erp.com` (ou votre domaine)
- **App** : `app.fouta-erp.com` (optionnel)

## 📦 Installation Automatique

### Étape 1 : Connexion au serveur

```bash
ssh root@votre-serveur-ovh.com
# ou
ssh utilisateur@votre-serveur-ovh.com
```

### Étape 2 : Télécharger le script d'installation

```bash
# Sur votre machine locale
# Créer le script d'installation
```

### Étape 3 : Exécuter l'installation

```bash
# Sur le serveur OVH
bash install-ovh.sh
```

## 🔧 Installation Manuelle

### 1. Mise à jour du système

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Installation Node.js

```bash
# Installer Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier
node --version  # Doit afficher v18.x.x
npm --version
```

### 3. Installation PostgreSQL

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

### 4. Installation Redis (optionnel)

```bash
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 5. Installation Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Installation PM2

```bash
sudo npm install -g pm2
```

### 7. Cloner le projet depuis GitHub

```bash
# Installer Git
sudo apt install -y git

# Créer le dossier
sudo mkdir -p /var/www/fouta-erp
sudo chown $USER:$USER /var/www/fouta-erp

# Cloner depuis GitHub
cd /var/www/fouta-erp
git clone https://github.com/votre-username/fouta-erp.git .

# Ou si vous utilisez SSH
# git clone git@github.com:votre-username/fouta-erp.git .
```

**Note** : Consultez `GUIDE_GITHUB.md` pour configurer votre repository GitHub.

### 8. Configuration Backend

```bash
cd /var/www/fouta-erp/backend

# Installer les dépendances
npm install --production

# Créer le fichier .env
nano .env
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
FRONTEND_URL=https://app.fouta-erp.com

# JWT
JWT_SECRET=VOTRE_SECRET_JWT_TRES_LONG_ET_SECURISE_ALEATOIRE
JWT_EXPIRE=7d

# API
API_URL=https://api.fouta-erp.com
API_VERSION=v1

# Redis (optionnel)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 9. Initialiser la base de données

```bash
cd /var/www/fouta-erp/database

# Exécuter les scripts SQL
psql -U fouta_user -d fouta_erp -f 01_base_et_securite.sql
psql -U fouta_user -d fouta_erp -f 02_production_et_qualite.sql
psql -U fouta_erp -d fouta_erp -f 03_flux_et_tracabilite.sql
psql -U fouta_user -d fouta_erp -f 04_mobile_devices.sql
```

### 10. Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/fouta-erp-api
```

**Contenu** :
```nginx
server {
    listen 80;
    server_name api.fouta-erp.com;

    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.fouta-erp.com;

    ssl_certificate /etc/letsencrypt/live/api.fouta-erp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.fouta-erp.com/privkey.pem;

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

**Activer le site** :
```bash
sudo ln -s /etc/nginx/sites-available/fouta-erp-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 11. Configuration SSL (Let's Encrypt)

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d api.fouta-erp.com

# Renouvellement automatique
sudo certbot renew --dry-run
```

### 12. Démarrer l'application avec PM2

```bash
cd /var/www/fouta-erp/backend

# Démarrer l'application
pm2 start src/server.js --name fouta-api

# Sauvegarder la configuration
pm2 save

# Configurer le démarrage automatique
pm2 startup
# Exécuter la commande affichée
```

### 13. Configuration Firewall

```bash
# Autoriser les ports nécessaires
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 🔄 Mise à jour

```bash
cd /var/www/fouta-erp

# Pull les dernières modifications
git pull

# Mettre à jour les dépendances
cd backend
npm install --production

# Redémarrer l'application
pm2 restart fouta-api
```

## 📊 Monitoring

### PM2 Monitoring

```bash
# Voir le statut
pm2 status

# Voir les logs
pm2 logs fouta-api

# Monitoring en temps réel
pm2 monit
```

### Logs Nginx

```bash
# Logs d'accès
sudo tail -f /var/log/nginx/access.log

# Logs d'erreur
sudo tail -f /var/log/nginx/error.log
```

## 🔐 Sécurité

### 1. Changer le mot de passe root

```bash
sudo passwd root
```

### 2. Désactiver la connexion root SSH

```bash
sudo nano /etc/ssh/sshd_config
# Modifier : PermitRootLogin no
sudo systemctl restart sshd
```

### 3. Backup automatique

```bash
# Créer un script de backup
sudo nano /usr/local/bin/backup-fouta-erp.sh
```

**Contenu du script** :
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/fouta-erp"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup base de données
pg_dump -U fouta_user fouta_erp > $BACKUP_DIR/db_$DATE.sql

# Backup fichiers
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/fouta-erp

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

**Cron quotidien** :
```bash
sudo crontab -e
# Ajouter :
0 2 * * * /usr/local/bin/backup-fouta-erp.sh
```

## ✅ Vérification

### Tester l'API

```bash
# Health check
curl https://api.fouta-erp.com/health

# Devrait retourner :
# {"status":"OK","timestamp":"..."}
```

### Tester depuis mobile

```bash
# Test login
curl -X POST https://api.fouta-erp.com/api/v1/mobile/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@system.local","password":"Admin123!"}'
```

## 🚨 Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs
pm2 logs fouta-api

# Vérifier la connexion DB
psql -U fouta_user -d fouta_erp -c "SELECT 1;"
```

### Erreur 502 Bad Gateway

```bash
# Vérifier que Node.js tourne
pm2 status

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log
```

### Problème SSL

```bash
# Vérifier le certificat
sudo certbot certificates

# Renouveler si nécessaire
sudo certbot renew
```

## 📝 Checklist Déploiement

- [ ] Serveur OVH configuré
- [ ] Node.js installé
- [ ] PostgreSQL installé et configuré
- [ ] Base de données créée et initialisée
- [ ] Nginx configuré
- [ ] SSL activé
- [ ] PM2 configuré
- [ ] Application démarrée
- [ ] Firewall configuré
- [ ] Backup automatique configuré
- [ ] Monitoring activé
- [ ] Tests de connexion réussis

## 🔗 URLs

- **API** : `https://api.fouta-erp.com`
- **Health Check** : `https://api.fouta-erp.com/health`
- **API Docs** : `https://api.fouta-erp.com/api-docs` (à créer)

## 💡 Astuces

- Utiliser un reverse proxy (Nginx) pour la sécurité
- Activer les backups automatiques
- Monitorer les logs régulièrement
- Mettre à jour le système régulièrement
- Utiliser PM2 pour la gestion des processus


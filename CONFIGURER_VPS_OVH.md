# 🚀 Configurer et Déployer sur VPS OVH

## ✅ Informations VPS

- **Nom** : vps-dc0341ab.vps.ovh.net
- **IPv4** : 137.74.40.191
- **IPv6** : 2001:41d0:305:2100::ea97
- **Utilisateur** : ubuntu
- **Mot de passe** : 3sJVsaK7yWkh

---

## 🔐 Étape 1 : Se Connecter au VPS

### Depuis Windows (PowerShell)

```powershell
ssh ubuntu@137.74.40.191
```

**Mot de passe** : `3sJVsaK7yWkh`

### Depuis Linux/Mac

```bash
ssh ubuntu@137.74.40.191
```

**Mot de passe** : `3sJVsaK7yWkh`

**Note** : Au premier connexion, tapez `yes` pour accepter la clé SSH.

---

## 🔧 Étape 2 : Mise à Jour du Système

```bash
# Mettre à jour le système
sudo apt update
sudo apt upgrade -y

# Installer les outils de base
sudo apt install -y curl wget git build-essential
```

---

## 📦 Étape 3 : Installer Node.js 18

```bash
# Installer Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier l'installation
node -v
npm -v

# Doit afficher :
# v18.x.x
# 9.x.x ou 10.x.x
```

---

## 🔄 Étape 4 : Installer PM2

```bash
# Installer PM2 globalement
sudo npm install -g pm2

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivre les instructions affichées (copier-coller la commande)

# Vérifier
pm2 --version
```

---

## 🌐 Étape 5 : Installer Nginx

```bash
# Installer Nginx
sudo apt install -y nginx

# Démarrer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Vérifier le statut
sudo systemctl status nginx
```

---

## 📁 Étape 6 : Déployer l'Application

### Option A : Cloner depuis Git (si disponible)

```bash
# Créer le dossier
sudo mkdir -p /opt/fouta-erp
sudo chown ubuntu:ubuntu /opt/fouta-erp

# Cloner le projet
cd /opt/fouta-erp
git clone <votre-repo> .

# OU si vous avez déjà le code localement, utilisez SCP
```

### Option B : Copier depuis votre Machine Locale

**Depuis Windows (PowerShell)** :

```powershell
# Installer WinSCP ou utiliser SCP
# OU utiliser SFTP dans FileZilla

# Avec SCP (depuis PowerShell) :
scp -r "D:\OneDrive - FLYING TEX\PROJET\backend" ubuntu@137.74.40.191:/opt/fouta-erp/
```

**Depuis Linux/Mac** :

```bash
scp -r /chemin/vers/backend ubuntu@137.74.40.191:/opt/fouta-erp/
```

### Sur le VPS

```bash
# Aller dans le dossier backend
cd /opt/fouta-erp/backend

# Installer les dépendances
npm install --production

# Vérifier que les fichiers essentiels sont présents
ls -la .env index.js src/server.js
```

---

## ⚙️ Étape 7 : Configurer .env

```bash
cd /opt/fouta-erp/backend

# Créer ou éditer .env
nano .env
```

**Configuration** :
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

---

## 🚀 Étape 8 : Démarrer l'Application avec PM2

```bash
cd /opt/fouta-erp/backend

# Démarrer l'application
pm2 start index.js --name fouta-api

# Sauvegarder la configuration PM2
pm2 save

# Vérifier le statut
pm2 status
pm2 logs fouta-api

# Doit afficher :
# 🚀 Serveur démarré sur le port 5000
# 📡 Socket.IO actif
```

---

## 🔧 Étape 9 : Configurer Nginx (Reverse Proxy)

```bash
# Créer la configuration Nginx
sudo nano /etc/nginx/sites-available/fabrication
```

**Contenu** :
```nginx
server {
    listen 80;
    server_name fabrication.laplume-artisanale.tn;

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
}
```

**Sauvegarder** : Ctrl+O, Entrée, Ctrl+X

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/fabrication /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

---

## 🔒 Étape 10 : Configurer SSL (Let's Encrypt)

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d fabrication.laplume-artisanale.tn

# Suivre les instructions :
# - Email : votre email
# - Accepter les conditions
# - Redirection HTTP → HTTPS : Oui
```

**Nginx sera automatiquement configuré pour HTTPS !**

---

## 🌍 Étape 11 : Configurer le DNS

### Dans le Panneau OVH

1. **Domaines** → `laplume-artisanale.tn` → **Zone DNS**
2. **Ajouter une entrée** :
   - **Type** : A
   - **Sous-domaine** : `fabrication`
   - **Cible** : `137.74.40.191`
   - **TTL** : 3600
3. **Ajouter une entrée IPv6** (optionnel) :
   - **Type** : AAAA
   - **Sous-domaine** : `fabrication`
   - **Cible** : `2001:41d0:305:2100::ea97`
   - **TTL** : 3600

**Attendre 5-15 minutes** pour la propagation DNS.

---

## 🧪 Étape 12 : Tester l'Application

```bash
# Sur le VPS, tester localement
curl http://localhost:5000/health

# Doit retourner :
# {"status":"OK","timestamp":"..."}

# Tester via le domaine (après DNS)
curl http://fabrication.laplume-artisanale.tn/health
curl https://fabrication.laplume-artisanale.tn/health
```

---

## 📋 Checklist Complète

- [ ] Connecté au VPS : `ssh ubuntu@137.74.40.191`
- [ ] Système mis à jour : `sudo apt update && sudo apt upgrade -y`
- [ ] Node.js 18 installé : `node -v`
- [ ] PM2 installé : `pm2 --version`
- [ ] Nginx installé : `sudo systemctl status nginx`
- [ ] Application déployée : `/opt/fouta-erp/backend`
- [ ] `.env` configuré avec les bonnes valeurs
- [ ] Application démarrée : `pm2 start index.js --name fouta-api`
- [ ] PM2 sauvegardé : `pm2 save`
- [ ] Nginx configuré : `/etc/nginx/sites-available/fabrication`
- [ ] SSL configuré : `sudo certbot --nginx`
- [ ] DNS configuré : A record vers `137.74.40.191`
- [ ] Application testée : `curl https://fabrication.laplume-artisanale.tn/health`

---

## 🔍 Commandes Utiles

### Vérifier l'Application

```bash
# Voir les logs
pm2 logs fouta-api

# Voir le statut
pm2 status

# Redémarrer
pm2 restart fouta-api

# Arrêter
pm2 stop fouta-api
```

### Vérifier Nginx

```bash
# Voir les logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Tester la configuration
sudo nginx -t

# Recharger
sudo systemctl reload nginx
```

### Vérifier les Ports

```bash
# Voir les ports ouverts
sudo netstat -tlnp | grep :5000
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

---

## ✅ Résumé

1. **Se connecter** : `ssh ubuntu@137.74.40.191`
2. **Installer Node.js 18** : `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
3. **Installer PM2** : `sudo npm install -g pm2`
4. **Installer Nginx** : `sudo apt install -y nginx`
5. **Déployer l'application** : Copier dans `/opt/fouta-erp/backend`
6. **Configurer .env** : Avec vos paramètres DB
7. **Démarrer avec PM2** : `pm2 start index.js --name fouta-api`
8. **Configurer Nginx** : Reverse proxy vers port 5000
9. **Configurer SSL** : `sudo certbot --nginx`
10. **Configurer DNS** : A record vers `137.74.40.191`

**Votre application sera accessible sur https://fabrication.laplume-artisanale.tn !**


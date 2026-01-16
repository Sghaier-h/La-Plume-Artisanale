# 🌐 Configurer Nginx et SSL pour le VPS

## ✅ État Actuel

- ✅ Application démarrée avec PM2 : `fouta-api` (status: online)
- ✅ Application écoute sur le port 5000

---

## 🔍 Étape 1 : Vérifier les Logs de l'Application

### Voir les Logs PM2

```bash
# Voir les logs en temps réel
pm2 logs fouta-api

# Voir les dernières lignes
pm2 logs fouta-api --lines 50

# Doit afficher :
# 🚀 Serveur démarré sur le port 5000
# 📡 Socket.IO actif
```

### Tester l'Application Localement

```bash
# Tester que l'application répond
curl http://localhost:5000/health

# Doit retourner :
# {"status":"OK","timestamp":"..."}
```

### Si l'Application ne Démarre Pas

```bash
# Voir les erreurs
pm2 logs fouta-api --err

# Redémarrer
pm2 restart fouta-api

# Voir le statut
pm2 status
```

---

## 🔄 Étape 2 : Configurer PM2 pour Démarrer au Boot

```bash
# Générer la commande de démarrage automatique
pm2 startup

# Doit afficher une commande comme :
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Copier-coller et exécuter la commande affichée
# (Elle sera différente pour chaque système)

# Sauvegarder la configuration PM2 actuelle
pm2 save
```

**Exemple de commande à exécuter** :
```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

---

## 🌐 Étape 3 : Installer Nginx

```bash
# Installer Nginx
sudo apt update
sudo apt install -y nginx

# Démarrer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Vérifier le statut
sudo systemctl status nginx

# Doit afficher : active (running)
```

### Tester Nginx

```bash
# Tester que Nginx répond
curl http://localhost

# Doit retourner du HTML (page par défaut de Nginx)
```

---

## ⚙️ Étape 4 : Configurer Nginx (Reverse Proxy)

### Créer la Configuration

```bash
# Créer le fichier de configuration
sudo nano /etc/nginx/sites-available/fabrication
```

### Contenu du Fichier

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
        
        # Timeout pour Socket.IO
        proxy_read_timeout 86400;
    }
}
```

**Sauvegarder** : Ctrl+O, Entrée, Ctrl+X

### Activer la Configuration

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/fabrication /etc/nginx/sites-enabled/

# Supprimer la configuration par défaut (optionnel)
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Doit afficher :
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Recharger Nginx
sudo systemctl reload nginx
```

### Vérifier Nginx

```bash
# Vérifier que Nginx écoute sur le port 80
sudo netstat -tlnp | grep :80

# Voir les logs Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 🔒 Étape 5 : Configurer SSL avec Certbot

### Installer Certbot

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### Obtenir le Certificat SSL

```bash
# Obtenir le certificat SSL
sudo certbot --nginx -d fabrication.laplume-artisanale.tn

# Suivre les instructions :
# 1. Email : Entrer votre email
# 2. Accepter les conditions : Y
# 3. Partager l'email avec EFF : N (optionnel)
# 4. Redirection HTTP → HTTPS : 2 (Rediriger)
```

**Certbot configurera automatiquement Nginx pour HTTPS !**

### Vérifier le Certificat

```bash
# Vérifier que le certificat est installé
sudo certbot certificates

# Tester HTTPS localement
curl https://localhost/health
```

### Renouvellement Automatique

```bash
# Certbot configure automatiquement le renouvellement
# Vérifier le timer
sudo systemctl status certbot.timer

# Tester le renouvellement (dry-run)
sudo certbot renew --dry-run
```

---

## 🌍 Étape 6 : Configurer le DNS

### Dans le Panneau OVH

1. **Se connecter** à https://www.ovh.com/manager/
2. **Domaines** → `laplume-artisanale.tn` → **Zone DNS**
3. **Ajouter une entrée** :
   - **Type** : A
   - **Sous-domaine** : `fabrication`
   - **Cible** : `137.74.40.191`
   - **TTL** : 3600
4. **Ajouter une entrée IPv6** (optionnel) :
   - **Type** : AAAA
   - **Sous-domaine** : `fabrication`
   - **Cible** : `2001:41d0:305:2100::ea97`
   - **TTL** : 3600

**Attendre 5-15 minutes** pour la propagation DNS.

---

## 🧪 Étape 7 : Tester l'Application

### Sur le VPS

```bash
# Tester localement
curl http://localhost:5000/health

# Tester via Nginx (HTTP)
curl http://localhost/health

# Tester via Nginx (HTTPS)
curl https://localhost/health
```

### Depuis votre Machine

```bash
# Tester HTTP (avant DNS)
curl http://137.74.40.191/health

# Tester HTTPS (après DNS)
curl https://fabrication.laplume-artisanale.tn/health

# Doit retourner :
# {"status":"OK","timestamp":"..."}
```

---

## 📋 Checklist Complète

- [ ] Application démarrée : `pm2 status`
- [ ] Logs vérifiés : `pm2 logs fouta-api`
- [ ] Application répond : `curl http://localhost:5000/health`
- [ ] PM2 configuré au boot : `pm2 startup` + `pm2 save`
- [ ] Nginx installé : `sudo systemctl status nginx`
- [ ] Configuration Nginx créée : `/etc/nginx/sites-available/fabrication`
- [ ] Configuration activée : `sudo ln -s ...`
- [ ] Nginx testé : `sudo nginx -t`
- [ ] Nginx rechargé : `sudo systemctl reload nginx`
- [ ] Certbot installé : `sudo apt install certbot`
- [ ] SSL configuré : `sudo certbot --nginx`
- [ ] DNS configuré : A record vers `137.74.40.191`
- [ ] Application testée : `curl https://fabrication.laplume-artisanale.tn/health`

---

## 🔍 Commandes Utiles

### PM2

```bash
# Voir les logs
pm2 logs fouta-api

# Redémarrer
pm2 restart fouta-api

# Arrêter
pm2 stop fouta-api

# Voir le statut
pm2 status

# Voir les informations détaillées
pm2 info fouta-api
```

### Nginx

```bash
# Tester la configuration
sudo nginx -t

# Recharger
sudo systemctl reload nginx

# Redémarrer
sudo systemctl restart nginx

# Voir les logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Certbot

```bash
# Voir les certificats
sudo certbot certificates

# Renouveler manuellement
sudo certbot renew

# Tester le renouvellement
sudo certbot renew --dry-run
```

---

## ✅ Résumé

1. **Vérifier les logs** : `pm2 logs fouta-api`
2. **Configurer PM2 au boot** : `pm2 startup` + `pm2 save`
3. **Installer Nginx** : `sudo apt install -y nginx`
4. **Configurer Nginx** : `/etc/nginx/sites-available/fabrication`
5. **Configurer SSL** : `sudo certbot --nginx -d fabrication.laplume-artisanale.tn`
6. **Configurer DNS** : A record vers `137.74.40.191`
7. **Tester** : `curl https://fabrication.laplume-artisanale.tn/health`

**Votre application sera accessible sur https://fabrication.laplume-artisanale.tn !**


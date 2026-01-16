# 🔧 Résoudre l'Erreur Certbot

## ❌ Erreur Rencontrée

```
Certbot failed to authenticate some domains (authenticator: nginx)
Domain: fabrication.laplume-artisanale.tn
Type: unauthorized
Detail: The key authorization file from the server did not match this challenge
```

**Problème** : Certbot n'arrive pas à vérifier que vous contrôlez le domaine.

---

## 🔍 Causes Possibles

1. **DNS non configuré** ou pas encore propagé
2. **Firewall bloque le port 80**
3. **Nginx non accessible depuis l'extérieur**
4. **Domaine ne pointe pas vers le VPS**

---

## ✅ Solution : Vérifier et Corriger

### Étape 1 : Vérifier le DNS

#### Depuis votre Machine Locale

```bash
# Vérifier que le domaine pointe vers le VPS
nslookup fabrication.laplume-artisanale.tn

# OU
dig fabrication.laplume-artisanale.tn

# Doit retourner : 137.74.40.191
```

#### Si le DNS n'est pas Configuré

**Dans le Panneau OVH** :

1. **Se connecter** à https://www.ovh.com/manager/
2. **Domaines** → `laplume-artisanale.tn` → **Zone DNS**
3. **Ajouter une entrée** :
   - **Type** : A
   - **Sous-domaine** : `fabrication`
   - **Cible** : `137.74.40.191`
   - **TTL** : 3600
4. **Sauvegarder**

**Attendre 5-15 minutes** pour la propagation DNS.

---

### Étape 2 : Vérifier le Firewall

#### Sur le VPS

```bash
# Vérifier si ufw est actif
sudo ufw status

# Si actif, autoriser les ports HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Vérifier
sudo ufw status
```

#### Si le Firewall OVH est Actif

**Dans le Panneau OVH** :

1. **VPS** → `vps-dc0341ab` → **Réseau** → **Firewall**
2. **Autoriser les ports** :
   - **Port 80** (HTTP)
   - **Port 443** (HTTPS)
3. **Sauvegarder**

---

### Étape 3 : Vérifier que Nginx est Accessible

#### Sur le VPS

```bash
# Vérifier que Nginx écoute sur le port 80
sudo netstat -tlnp | grep :80

# Doit afficher :
# tcp  0  0  0.0.0.0:80  ... nginx

# Vérifier que Nginx est actif
sudo systemctl status nginx

# Doit afficher : active (running)
```

#### Depuis votre Machine Locale

```bash
# Tester que le serveur répond sur le port 80
curl -I http://137.74.40.191

# Doit retourner : HTTP/1.1 200 OK ou 502 Bad Gateway

# Tester avec le domaine (si DNS configuré)
curl -I http://fabrication.laplume-artisanale.tn

# Doit retourner : HTTP/1.1 200 OK ou 502 Bad Gateway
```

**Si vous obtenez "Connection refused"** : Le firewall bloque le port 80.

**Si vous obtenez "502 Bad Gateway"** : Nginx fonctionne mais ne peut pas joindre l'application (normal si l'application n'est pas démarrée).

---

### Étape 4 : Vérifier la Configuration Nginx

#### Sur le VPS

```bash
# Vérifier que la configuration existe
ls -la /etc/nginx/sites-available/fabrication
ls -la /etc/nginx/sites-enabled/fabrication

# Voir le contenu
cat /etc/nginx/sites-available/fabrication

# Tester la configuration
sudo nginx -t

# Doit afficher : syntax is ok
```

#### Si la Configuration n'Existe Pas

```bash
# Créer la configuration
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
        
        # Timeout pour Socket.IO
        proxy_read_timeout 86400;
    }
}
```

**Sauvegarder** : Ctrl+O, Entrée, Ctrl+X

```bash
# Activer la configuration
sudo ln -s /etc/nginx/sites-available/fabrication /etc/nginx/sites-enabled/

# Tester
sudo nginx -t

# Recharger
sudo systemctl reload nginx
```

---

### Étape 5 : Vérifier que l'Application est Démarrée

```bash
# Vérifier PM2
pm2 status

# Doit afficher : fouta-api (online)

# Tester l'application
curl http://localhost:5000/health

# Doit retourner : {"status":"OK","timestamp":"..."}
```

---

### Étape 6 : Réessayer Certbot

#### Attendre la Propagation DNS

**Important** : Attendez **15-30 minutes** après avoir configuré le DNS avant de réessayer Certbot.

#### Vérifier que le DNS est Propagé

```bash
# Depuis votre machine locale
nslookup fabrication.laplume-artisanale.tn

# Doit retourner : 137.74.40.191
```

#### Réessayer Certbot

```bash
# Réessayer Certbot
sudo certbot --nginx -d fabrication.laplume-artisanale.tn

# Si ça ne fonctionne toujours pas, utiliser le mode standalone
sudo certbot certonly --standalone -d fabrication.laplume-artisanale.tn
```

**Note** : Le mode `--standalone` arrêtera temporairement Nginx pour vérifier le domaine.

---

## 🔄 Alternative : Certbot en Mode Standalone

Si Nginx pose problème, utilisez le mode standalone :

```bash
# Arrêter Nginx temporairement
sudo systemctl stop nginx

# Obtenir le certificat en mode standalone
sudo certbot certonly --standalone -d fabrication.laplume-artisanale.tn

# Redémarrer Nginx
sudo systemctl start nginx

# Configurer Nginx manuellement pour HTTPS
sudo nano /etc/nginx/sites-available/fabrication
```

**Configuration Nginx avec SSL** :
```nginx
server {
    listen 80;
    server_name fabrication.laplume-artisanale.tn;
    return 301 https://$server_name$request_uri;
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
        
        proxy_read_timeout 86400;
    }
}
```

**Sauvegarder** : Ctrl+O, Entrée, Ctrl+X

```bash
# Tester
sudo nginx -t

# Recharger
sudo systemctl reload nginx
```

---

## 📋 Checklist de Vérification

- [ ] DNS configuré : `nslookup fabrication.laplume-artisanale.tn` → `137.74.40.191`
- [ ] DNS propagé : Attendu 15-30 minutes
- [ ] Firewall autorise port 80 : `sudo ufw allow 80/tcp`
- [ ] Firewall autorise port 443 : `sudo ufw allow 443/tcp`
- [ ] Nginx écoute sur port 80 : `sudo netstat -tlnp | grep :80`
- [ ] Nginx actif : `sudo systemctl status nginx`
- [ ] Configuration Nginx existe : `/etc/nginx/sites-available/fabrication`
- [ ] Configuration Nginx activée : `/etc/nginx/sites-enabled/fabrication`
- [ ] Application démarrée : `pm2 status`
- [ ] Application répond : `curl http://localhost:5000/health`
- [ ] Serveur accessible : `curl -I http://137.74.40.191`

---

## ✅ Résumé

1. **Configurer le DNS** : A record `fabrication` → `137.74.40.191`
2. **Attendre 15-30 minutes** pour la propagation
3. **Vérifier le firewall** : Autoriser ports 80 et 443
4. **Vérifier Nginx** : Doit être actif et écouter sur port 80
5. **Vérifier l'application** : PM2 doit être en ligne
6. **Réessayer Certbot** : `sudo certbot --nginx -d fabrication.laplume-artisanale.tn`

**Le problème est généralement lié au DNS ou au firewall. Vérifiez d'abord ces deux points !**


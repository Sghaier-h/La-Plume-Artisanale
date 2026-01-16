# 🔧 Corriger le Routing Nginx

## ✅ État Actuel

- ✅ **Application fonctionne** : `curl http://localhost:5000/health` → OK
- ✅ **HTTPS avec domaine fonctionne** : `curl https://fabrication.laplume-artisanale.tn/health` → OK
- ⚠️ **HTTP localhost ne fonctionne pas** : `curl http://localhost/health` → 404

**Problème** : Nginx ne route pas correctement les requêtes vers l'application.

---

## 🔍 Vérifier la Configuration Nginx

### Voir la Configuration Actuelle

```bash
# Voir la configuration Nginx
cat /etc/nginx/sites-available/fabrication

# Voir aussi la configuration par défaut (si elle existe)
ls -la /etc/nginx/sites-enabled/
```

### Problème Probable

La configuration Nginx peut avoir été modifiée par Certbot et ne route peut-être pas correctement vers l'application.

---

## ✅ Solution : Vérifier et Corriger la Configuration

### Voir la Configuration Actuelle

```bash
# Voir la configuration complète
cat /etc/nginx/sites-available/fabrication
```

### Configuration Attendue

La configuration devrait ressembler à ceci :

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
        
        # Timeout pour Socket.IO
        proxy_read_timeout 86400;
    }
}
```

---

## 🔧 Corriger la Configuration

### Si la Configuration est Incorrecte

```bash
# Éditer la configuration
sudo nano /etc/nginx/sites-available/fabrication
```

### Configuration Complète

```nginx
# Redirection HTTP → HTTPS
server {
    listen 80;
    server_name fabrication.laplume-artisanale.tn;
    return 301 https://$server_name$request_uri;
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    server_name fabrication.laplume-artisanale.tn;

    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/fabrication.laplume-artisanale.tn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fabrication.laplume-artisanale.tn/privkey.pem;

    # Configuration SSL recommandée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy vers l'application Node.js
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        
        # Headers pour WebSocket (Socket.IO)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Headers standards
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 86400;  # Pour Socket.IO
    }
}
```

**Sauvegarder** : Ctrl+O, Entrée, Ctrl+X

### Tester et Recharger

```bash
# Tester la configuration
sudo nginx -t

# Doit afficher : syntax is ok

# Recharger Nginx
sudo systemctl reload nginx
```

---

## 🧪 Tester Après Correction

### Depuis le VPS

```bash
# Tester HTTP (redirection)
curl -I http://localhost/health

# Doit retourner : HTTP/1.1 301 Moved Permanently
# OU : HTTP/1.1 200 OK (si configuré pour localhost)

# Tester HTTPS avec le domaine
curl https://fabrication.laplume-artisanale.tn/health

# Doit retourner : {"status":"OK","timestamp":"..."}
```

### Depuis PowerShell

```powershell
# Tester HTTPS
curl.exe https://fabrication.laplume-artisanale.tn/health

# Doit retourner : {"status":"OK","timestamp":"..."}

# Tester la redirection HTTP → HTTPS
curl.exe -I http://fabrication.laplume-artisanale.tn/health

# Doit retourner : HTTP/1.1 301 Moved Permanently
# Location: https://fabrication.laplume-artisanale.tn/health
```

---

## ⚠️ Note sur localhost

**Important** : Le certificat SSL est émis pour `fabrication.laplume-artisanale.tn`, pas pour `localhost`. C'est normal que `curl https://localhost/health` échoue avec une erreur SSL.

**Pour tester localement**, utilisez :
- `curl http://localhost:5000/health` (directement l'application)
- `curl https://fabrication.laplume-artisanale.tn/health` (via Nginx avec le domaine)

---

## ✅ Vérifications Finales

### Vérifier que Tout Fonctionne

```bash
# 1. Application répond directement
curl http://localhost:5000/health
# Doit retourner : {"status":"OK","timestamp":"..."}

# 2. HTTPS avec le domaine fonctionne
curl https://fabrication.laplume-artisanale.tn/health
# Doit retourner : {"status":"OK","timestamp":"..."}

# 3. Nginx est actif
sudo systemctl status nginx
# Doit afficher : active (running)

# 4. PM2 est actif
pm2 status
# Doit afficher : fouta-api (online)
```

---

## 📋 Checklist

- [ ] Configuration Nginx vérifiée : `cat /etc/nginx/sites-available/fabrication`
- [ ] Configuration corrigée si nécessaire
- [ ] Nginx testé : `sudo nginx -t`
- [ ] Nginx rechargé : `sudo systemctl reload nginx`
- [ ] HTTPS fonctionne : `curl https://fabrication.laplume-artisanale.tn/health`
- [ ] Application répond : `curl http://localhost:5000/health`
- [ ] PM2 actif : `pm2 status`

---

## 🎯 Résumé

1. **Vérifier la configuration** : `cat /etc/nginx/sites-available/fabrication`
2. **Corriger si nécessaire** : `sudo nano /etc/nginx/sites-available/fabrication`
3. **Tester** : `sudo nginx -t`
4. **Recharger** : `sudo systemctl reload nginx`
5. **Tester HTTPS** : `curl https://fabrication.laplume-artisanale.tn/health`

**Le fait que `https://fabrication.laplume-artisanale.tn/health` fonctionne est excellent ! C'est le plus important.**

**L'erreur sur `localhost` est normale car le certificat SSL est pour le domaine, pas pour localhost.**


# ✅ Vérification Finale - Déploiement VPS Réussi

## 🎉 Félicitations !

**Certbot a réussi à installer le certificat SSL !**

- ✅ Certificat SSL installé : `/etc/letsencrypt/live/fabrication.laplume-artisanale.tn/`
- ✅ Nginx configuré pour HTTPS
- ✅ Application accessible en HTTPS

---

## 🧪 Étape 1 : Tester HTTPS

### Depuis PowerShell

```powershell
# Tester HTTPS
curl.exe https://fabrication.laplume-artisanale.tn/health

# Doit retourner : {"status":"OK","timestamp":"..."}

# Tester avec les détails
curl.exe -I https://fabrication.laplume-artisanale.tn/health

# Doit retourner : HTTP/2 200
```

### Depuis le VPS

```bash
# Tester HTTPS localement
curl https://localhost/health

# Tester avec le domaine
curl https://fabrication.laplume-artisanale.tn/health

# Doit retourner : {"status":"OK","timestamp":"..."}
```

---

## 🔍 Étape 2 : Vérifier la Configuration Nginx

### Voir la Configuration Générée par Certbot

```bash
# Voir la configuration Nginx
cat /etc/nginx/sites-available/fabrication

# Doit contenir :
# - listen 80; (redirection vers HTTPS)
# - listen 443 ssl http2;
# - ssl_certificate /etc/letsencrypt/live/.../fullchain.pem;
# - ssl_certificate_key /etc/letsencrypt/live/.../privkey.pem;
```

### Vérifier que Nginx est Correctement Configuré

```bash
# Tester la configuration
sudo nginx -t

# Doit afficher : syntax is ok

# Vérifier le statut
sudo systemctl status nginx

# Doit afficher : active (running)
```

---

## 🔄 Étape 3 : Configurer PM2 pour Démarrer au Boot

### Générer la Commande de Démarrage

```bash
# Générer la commande de démarrage automatique
pm2 startup

# Doit afficher une commande comme :
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Copier-coller et exécuter la commande affichée
```

**Exemple** :
```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### Sauvegarder la Configuration PM2

```bash
# Sauvegarder la configuration actuelle
pm2 save

# Vérifier
pm2 status

# Doit afficher : fouta-api (online)
```

---

## 📋 Étape 4 : Vérifier les Logs

### Vérifier les Logs de l'Application

```bash
# Voir les logs PM2
pm2 logs fouta-api --lines 20

# Doit afficher :
# 🚀 Serveur démarré sur le port 5000
# 📡 Socket.IO actif
```

### Vérifier les Logs Nginx

```bash
# Voir les logs d'accès
sudo tail -f /var/log/nginx/access.log

# Voir les logs d'erreur
sudo tail -f /var/log/nginx/error.log
```

---

## 🔒 Étape 5 : Vérifier le Renouvellement Automatique SSL

### Vérifier le Timer Certbot

```bash
# Vérifier le timer de renouvellement
sudo systemctl status certbot.timer

# Doit afficher : active (waiting)
```

### Tester le Renouvellement (Dry-Run)

```bash
# Tester le renouvellement (sans vraiment renouveler)
sudo certbot renew --dry-run

# Doit afficher : The dry run was successful
```

**Le certificat sera automatiquement renouvelé avant expiration !**

---

## 🌐 Étape 6 : Tester l'Application Complète

### Tester les Endpoints

#### Depuis PowerShell

```powershell
# Tester HTTPS
curl.exe https://fabrication.laplume-artisanale.tn/health

# Tester l'API (si disponible)
curl.exe https://fabrication.laplume-artisanale.tn/api/...

# Tester la redirection HTTP → HTTPS
curl.exe -I http://fabrication.laplume-artisanale.tn

# Doit retourner : HTTP/1.1 301 Moved Permanently
# Location: https://fabrication.laplume-artisanale.tn/
```

#### Depuis le VPS

```bash
# Tester HTTPS
curl https://fabrication.laplume-artisanale.tn/health

# Tester la redirection
curl -I http://fabrication.laplume-artisanale.tn

# Doit retourner : HTTP/1.1 301 Moved Permanently
```

---

## 📊 Étape 7 : Vérifier les Performances

### Vérifier l'Utilisation des Ressources

```bash
# Voir l'utilisation CPU et mémoire de PM2
pm2 monit

# Voir les statistiques
pm2 status

# Voir les informations détaillées
pm2 info fouta-api
```

### Vérifier les Ports Ouverts

```bash
# Vérifier que les ports sont ouverts
sudo ss -tlnp | grep :80
sudo ss -tlnp | grep :443
sudo ss -tlnp | grep :5000

# Doit afficher :
# :80 (Nginx)
# :443 (Nginx HTTPS)
# :5000 (Application Node.js)
```

---

## ✅ Checklist Complète

- [ ] Certificat SSL installé : `/etc/letsencrypt/live/fabrication.laplume-artisanale.tn/`
- [ ] HTTPS fonctionne : `curl.exe https://fabrication.laplume-artisanale.tn/health`
- [ ] Redirection HTTP → HTTPS : `curl.exe -I http://fabrication.laplume-artisanale.tn`
- [ ] Nginx configuré : `sudo nginx -t`
- [ ] PM2 configuré au boot : `pm2 startup` + `pm2 save`
- [ ] Application en ligne : `pm2 status`
- [ ] Logs vérifiés : `pm2 logs fouta-api`
- [ ] Renouvellement SSL configuré : `sudo systemctl status certbot.timer`

---

## 🎯 Résumé du Déploiement

### ✅ Ce qui est Fait

1. ✅ **VPS configuré** : Ubuntu 25.04
2. ✅ **Node.js 18 installé** : v18.20.8
3. ✅ **PM2 installé** : Gestion des processus
4. ✅ **Nginx installé** : Reverse proxy
5. ✅ **Application déployée** : `/opt/fouta-erp/backend`
6. ✅ **Dépendances installées** : `npm install --production`
7. ✅ **Fichier .env configuré** : Variables d'environnement
8. ✅ **Application démarrée** : PM2 `fouta-api` (online)
9. ✅ **Nginx configuré** : Reverse proxy vers port 5000
10. ✅ **SSL configuré** : Certificat Let's Encrypt
11. ✅ **HTTPS activé** : `https://fabrication.laplume-artisanale.tn`

### 🔄 À Faire (Optionnel)

- [ ] Configurer PM2 au boot : `pm2 startup` + `pm2 save`
- [ ] Configurer un monitoring (optionnel)
- [ ] Configurer des sauvegardes automatiques (optionnel)
- [ ] Optimiser les performances (optionnel)

---

## 🚀 Commandes Utiles

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

# Voir les informations
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
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
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

## 🎉 Félicitations !

**Votre application est maintenant déployée et accessible en HTTPS !**

🌐 **URL** : https://fabrication.laplume-artisanale.tn

✅ **SSL** : Certificat Let's Encrypt (renouvellement automatique)
✅ **Performance** : Nginx reverse proxy
✅ **Stabilité** : PM2 pour la gestion des processus
✅ **Sécurité** : HTTPS activé, redirection HTTP → HTTPS

**Votre application ERP est prête à être utilisée !**


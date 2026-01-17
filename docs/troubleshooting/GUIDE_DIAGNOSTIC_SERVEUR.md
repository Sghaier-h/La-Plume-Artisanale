# 🔍 Guide de Diagnostic Serveur

Ce guide vous explique comment diagnostiquer les problèmes sur le serveur de production.

## 🚀 Utilisation Rapide

**Sur le serveur SSH**, exécutez :

```bash
cd /opt/fouta-erp
bash scripts/diagnostic-serveur.sh
```

Le script va automatiquement vérifier :
- ✅ Les répertoires et fichiers essentiels
- ✅ La configuration PM2 (bon script utilisé ?)
- ✅ La configuration Nginx (frontend + API)
- ✅ Le déploiement du frontend
- ✅ La connexion backend (port 5000)
- ✅ La connexion HTTPS
- ✅ Les ports en écoute

---

## 📋 Vérifications Effectuées

### 1️⃣ Répertoires
- Vérifie que `/opt/fouta-erp`, `backend`, et `frontend` existent

### 2️⃣ Fichiers Backend
- `src/server.js` existe ?
- `package.json` pointe vers `src/server.js` ?
- `.env` contient `DB_HOST` ?
- `node_modules` installés ?

### 3️⃣ PM2
- PM2 est installé ?
- Application `fouta-api` existe ?
- **⚠️ CRITIQUE**: Utilise-t-il `src/server.js` (et non `index.js`) ?
- Application en ligne ?

### 4️⃣ Nginx
- Nginx installé et actif ?
- Configuration sert le frontend (`root /opt/fouta-erp/frontend`) ?
- Configuration proxifie `/api` vers backend ?
- Syntaxe configuration valide ?

### 5️⃣ Frontend
- `index.html` existe ?
- Dossier `static` avec fichiers ?
- Permissions lecture OK ?

### 6️⃣ Connexion Backend
- `http://localhost:5000/health` répond ?

### 7️⃣ HTTPS
- `https://fabrication.laplume-artisanale.tn/health` répond ?
- Frontend HTTPS accessible ?

### 8️⃣ Ports
- Port 5000 en écoute ?
- Ports 80/443 en écoute ?

---

## 🔧 Corrections Automatiques

### Problème 1 : PM2 utilise `index.js` au lieu de `src/server.js`

**Symptôme** :
```
❌ PM2 n'utilise pas src/server.js (utilise: index.js)
```

**Solution** :
```bash
cd /opt/fouta-erp/backend
pm2 stop fouta-api
pm2 delete fouta-api
pm2 start src/server.js --name fouta-api
pm2 save
pm2 status
```

### Problème 2 : Application PM2 pas en ligne

**Symptôme** :
```
❌ Application PM2 n'est pas en ligne (statut: errored)
```

**Solution** :
```bash
cd /opt/fouta-erp/backend

# Voir les erreurs
pm2 logs fouta-api --lines 50

# Redémarrer
pm2 restart fouta-api

# Si ça ne fonctionne pas, recréer
pm2 delete fouta-api
pm2 start src/server.js --name fouta-api
pm2 save
```

### Problème 3 : Backend ne répond pas

**Symptôme** :
```
❌ Backend ne répond pas sur http://localhost:5000/health
```

**Solution** :
```bash
cd /opt/fouta-erp/backend

# Vérifier les logs
pm2 logs fouta-api --lines 50

# Vérifier que le port est libre
netstat -tuln | grep 5000

# Vérifier que .env existe et est correct
cat .env | grep -E "DB_HOST|PORT|NODE_ENV"

# Redémarrer
pm2 restart fouta-api
```

### Problème 4 : Frontend non déployé

**Symptôme** :
```
⚠️ Frontend non déployé
❌ index.html introuvable
```

**Solution** :
```bash
# Déployer le frontend depuis la machine locale
# OU sur le serveur directement :

cd /opt/fouta-erp
bash scripts/deployer-frontend-serveur.sh

# OU depuis votre machine locale :
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
.\scripts\deployer-frontend-auto.ps1
```

### Problème 5 : Nginx mal configuré

**Symptôme** :
```
⚠️ Nginx ne semble pas configuré pour servir le frontend
⚠️ Nginx ne semble pas configuré pour proxifier /api
```

**Solution** :
```bash
# Copier la configuration correcte
sudo cp /opt/fouta-erp/docs/configuration/NGINX_CONFIG_CORRECTE.conf /etc/nginx/sites-available/fabrication

# Ou éditer manuellement
sudo nano /etc/nginx/sites-available/fabrication

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### Problème 6 : Permissions frontend

**Symptôme** :
```
❌ Permissions lecture KO pour index.html
```

**Solution** :
```bash
# Corriger les permissions
sudo chown -R www-data:www-data /opt/fouta-erp/frontend
sudo chmod -R 755 /opt/fouta-erp/frontend

# Vérifier
ls -la /opt/fouta-erp/frontend/index.html
```

---

## 📊 Interprétation des Résultats

### ✅ Tout fonctionne
```
✅ Aucun problème critique détecté
```

Votre serveur fonctionne correctement !

### ❌ Problèmes détectés
```
❌ 3 problème(s) détecté(s)

🔧 Commandes de correction suggérées:
   cd /opt/fouta-erp/backend
   pm2 stop fouta-api
   pm2 delete fouta-api
   pm2 start src/server.js --name fouta-api
   pm2 save
```

Suivez les commandes suggérées pour corriger les problèmes.

---

## 🔄 Workflow de Diagnostic

1. **Exécuter le diagnostic** :
   ```bash
   cd /opt/fouta-erp
   bash scripts/diagnostic-serveur.sh
   ```

2. **Identifier les problèmes** (marqués en ❌)

3. **Consulter les logs** :
   ```bash
   pm2 logs fouta-api --lines 50
   sudo tail -50 /var/log/nginx/error.log
   ```

4. **Appliquer les corrections** selon les sections ci-dessus

5. **Réexécuter le diagnostic** pour vérifier :
   ```bash
   bash scripts/diagnostic-serveur.sh
   ```

---

## 📝 Checklist de Vérification

Après avoir exécuté le diagnostic, vérifiez :

- [ ] `src/server.js` existe dans `/opt/fouta-erp/backend/`
- [ ] PM2 utilise `src/server.js` (pas `index.js`)
- [ ] Application PM2 est `online`
- [ ] `.env` existe avec `DB_HOST`, `PORT`, etc.
- [ ] `node_modules` installés (nombre > 100)
- [ ] Nginx est `active (running)`
- [ ] Configuration Nginx sert frontend (`root /opt/fouta-erp/frontend`)
- [ ] Configuration Nginx proxifie `/api` vers `localhost:5000`
- [ ] `index.html` existe dans `/opt/fouta-erp/frontend/`
- [ ] Dossier `static` contient des fichiers
- [ ] `http://localhost:5000/health` répond
- [ ] `https://fabrication.laplume-artisanale.tn/health` répond
- [ ] `https://fabrication.laplume-artisanale.tn/` affiche le frontend

---

## 🆘 Besoin d'Aide ?

Si le diagnostic ne résout pas le problème :

1. **Consulter les logs** :
   ```bash
   pm2 logs fouta-api --lines 100
   sudo tail -100 /var/log/nginx/error.log
   ```

2. **Vérifier manuellement** :
   ```bash
   # Test backend
   curl http://localhost:5000/health
   
   # Test frontend
   curl https://fabrication.laplume-artisanale.tn/
   
   # Test API
   curl https://fabrication.laplume-artisanale.tn/api/health
   ```

3. **Vérifier les processus** :
   ```bash
   ps aux | grep node
   ps aux | grep nginx
   ```

4. **Vérifier les ports** :
   ```bash
   netstat -tuln | grep -E "5000|80|443"
   ```

---

## 📚 Documentation Associée

- [Corriger PM2 Serveur](CORRIGER_PM2_SERVEUR.md)
- [Configuration Nginx Correcte](../configuration/NGINX_CONFIG_CORRECTE.conf)
- [Mise à Jour Serveur](../deployment/MISE_A_JOUR_SERVEUR.md)
- [Déployer Frontend Serveur](../deployment/DEPLOYER_FRONTEND_SERVEUR.md)

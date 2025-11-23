# 🚀 Commandes Finales - Configuration Complète

## ✅ Tout est Prêt !

- ✅ Instance PostgreSQL créée
- ✅ Base `ERP_La_Plume` créée
- ✅ Utilisateur `Aviateur` créé
- ✅ IP `145.239.37.162` autorisée

---

## 🔧 Commandes à Exécuter sur le Serveur SSH

Connectez-vous et exécutez ces commandes **une par une** :

### 1. Aller dans le projet

```bash
cd ~/la-plume-artisanale
```

### 2. Cloner le projet (si pas déjà fait)

```bash
git clone https://github.com/Sghaier-h/La-Plume-Artisanale.git fouta-erp
cd fouta-erp
```

### 3. Créer le fichier .env

```bash
cd backend
nano .env
```

**Collez ce contenu** (remplacez `VOTRE_MOT_DE_PASSE` par le mot de passe de l'utilisateur Aviateur) :

```env
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=VOTRE_MOT_DE_PASSE
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

**Pour sauvegarder dans nano** :
- Appuyez sur `Ctrl + O` puis `Enter`
- Appuyez sur `Ctrl + X` pour quitter

**Générer le JWT Secret** :
```bash
openssl rand -hex 32
```
Copiez le résultat et remplacez `$(openssl rand -hex 32)` dans le `.env`.

### 4. Installer les dépendances

```bash
npm install --production
```

### 5. Initialiser la base de données

```bash
cd ../database

# Remplacez VOTRE_MOT_DE_PASSE par le mot de passe de Aviateur
export PGPASSWORD=VOTRE_MOT_DE_PASSE

# Exécuter les scripts SQL
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 01_base_et_securite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 02_production_et_qualite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 03_flux_et_tracabilite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 04_mobile_devices.sql

unset PGPASSWORD
```

### 6. Démarrer l'application

```bash
cd ../backend

# Installer PM2
npm install -g pm2 --prefix $HOME/.local 2>/dev/null || npm install pm2 --save-dev

# Démarrer
pm2 start src/server.js --name fouta-api
pm2 save

# Vérifier
pm2 status
```

### 7. Voir les logs

```bash
pm2 logs fouta-api
```

---

## ✅ Test

```bash
# Tester l'API
curl http://localhost:5000/health
```

Devrait retourner :
```json
{"status":"OK","timestamp":"..."}
```

---

## 📋 Résumé des Identifiants

```
Serveur : sh131616-002.eu.clouddb.ovh.net
Port : 35392
Base : ERP_La_Plume
Utilisateur : Aviateur
IP autorisée : 145.239.37.162 ✅
```

---

## 🎉 Félicitations !

Votre application est maintenant configurée et démarrée !

L'API sera accessible sur :
- **https://fabrication.laplume-artisanale.tn**
- **http://145.239.37.162:5000**

---

## 🆘 Si Problème

### Erreur de connexion à la base

Vérifiez :
1. ✅ Le mot de passe dans `.env` est correct
2. ✅ L'utilisateur `Aviateur` a tous les droits sur `ERP_La_Plume`
3. ✅ L'IP est bien autorisée

### Erreur "module not found"

```bash
cd ~/fouta-erp/backend
npm install --production
```

### Erreur PM2

```bash
npm install pm2 --save-dev
node node_modules/pm2/bin/pm2 start src/server.js --name fouta-api
```

---

## 📝 Prochaines Étapes

1. ✅ Configuration terminée
2. ⏳ Tester l'API
3. ⏳ Configurer Nginx (si nécessaire)
4. ⏳ Configurer les applications Android

---

## 🚀 Tout est Prêt !

Exécutez les commandes ci-dessus et votre ERP sera en ligne !


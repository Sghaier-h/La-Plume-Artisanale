# 🔧 Configurer PostgreSQL OVH - Guide Complet

## 📋 Après Création de l'Instance PostgreSQL

Une fois votre instance PostgreSQL créée sur OVH Web Cloud Databases, suivez ces étapes :

---

## 🚀 Étape 1 : Créer la Base de Données

### Dans l'Interface OVH

1. Allez dans votre instance PostgreSQL
2. Cliquez sur **"Bases de données"** ou **"Databases"**
3. Cliquez sur **"Ajouter une base de données"**
4. Nom : `fouta_erp`
5. Cliquez sur **"Créer"**

---

## 🚀 Étape 2 : Créer l'Utilisateur

1. Dans la même interface, allez dans **"Utilisateurs"** ou **"Users"**
2. Cliquez sur **"Ajouter un utilisateur"**
3. Nom d'utilisateur : `fouta_user`
4. Mot de passe : Choisissez un mot de passe fort
5. Cochez **"Tous les droits"** sur la base `fouta_erp`
6. Cliquez sur **"Créer"`

---

## 🚀 Étape 3 : Noter les Identifiants

Notez précieusement :

```
Serveur : postgresql-xxxxx.ovh.net
Port : 5432
Base de données : fouta_erp
Utilisateur : fouta_user
Mot de passe : [celui que vous avez choisi]
```

---

## 🚀 Étape 4 : Configurer le Projet

### Sur le Serveur SSH

```bash
cd ~/la-plume-artisanale

# Cloner le projet si pas déjà fait
git clone https://github.com/Sghaier-h/La-Plume-Artisanale.git fouta-erp
cd fouta-erp
```

### Créer le fichier .env

```bash
cd backend
nano .env
```

**Contenu du fichier `.env`** (remplacez par vos identifiants OVH) :

```env
# Base de données PostgreSQL OVH
DB_HOST=postgresql-xxxxx.ovh.net
DB_PORT=5432
DB_NAME=fouta_erp
DB_USER=fouta_user
DB_PASSWORD=votre_mot_de_passe_ovh

# Serveur
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://fabrication.laplume-artisanale.tn

# JWT
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRE=7d

# API
API_URL=https://fabrication.laplume-artisanale.tn
API_VERSION=v1

# Redis (optionnel, peut être désactivé)
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Générer le JWT Secret** :
```bash
openssl rand -hex 32
```

---

## 🚀 Étape 5 : Installer les Dépendances

```bash
cd ~/fouta-erp/backend
npm install --production
```

---

## 🚀 Étape 6 : Initialiser la Base de Données

```bash
cd ~/fouta-erp/database

# Exécuter les scripts SQL
export PGPASSWORD=votre_mot_de_passe_ovh
psql -h postgresql-xxxxx.ovh.net -p 5432 -U fouta_user -d fouta_erp -f 01_base_et_securite.sql
psql -h postgresql-xxxxx.ovh.net -p 5432 -U fouta_user -d fouta_erp -f 02_production_et_qualite.sql
psql -h postgresql-xxxxx.ovh.net -p 5432 -U fouta_user -d fouta_erp -f 03_flux_et_tracabilite.sql
psql -h postgresql-xxxxx.ovh.net -p 5432 -U fouta_user -d fouta_erp -f 04_mobile_devices.sql
unset PGPASSWORD
```

**Remplacez** :
- `postgresql-xxxxx.ovh.net` par votre adresse serveur
- `votre_mot_de_passe_ovh` par votre mot de passe

---

## 🚀 Étape 7 : Démarrer l'Application

```bash
cd ~/fouta-erp/backend

# Installer PM2 localement
npm install -g pm2 --prefix $HOME/.local 2>/dev/null || npm install pm2 --save-dev

# Démarrer
pm2 start src/server.js --name fouta-api
pm2 save
```

---

## ✅ Vérification

```bash
# Vérifier PM2
pm2 status

# Voir les logs
pm2 logs fouta-api

# Tester l'API
curl http://localhost:5000/health
```

---

## 🔐 Sécurité

- ✅ Mot de passe fort pour la base de données
- ✅ JWT Secret long et aléatoire
- ✅ Base de données privée (pas publique)
- ✅ Firewall OVH configuré

---

## 📋 Résumé des Commandes

```bash
# 1. Aller dans le projet
cd ~/fouta-erp

# 2. Configurer .env
cd backend
nano .env  # (remplir avec les identifiants OVH)

# 3. Installer dépendances
npm install --production

# 4. Initialiser base de données
cd ../database
export PGPASSWORD=votre_mot_de_passe
psql -h postgresql-xxxxx.ovh.net -U fouta_user -d fouta_erp -f 01_base_et_securite.sql
# ... (autres scripts)

# 5. Démarrer
cd ../backend
pm2 start src/server.js --name fouta-api
```

---

## 🎉 Félicitations !

Une fois tout configuré, votre application sera en ligne !


# ✅ Configuration PostgreSQL OVH - Informations Finales

## 🎉 Instance PostgreSQL Créée !

Voici vos informations de connexion :

---

## 📋 Informations de Connexion

```
Nom d'hôte : sh131616-002.eu.clouddb.ovh.net
Port SQL : 35392
Port SFTP : 45392
Version : PostgreSQL 17
```

---

## 🚀 Prochaines Étapes

### Étape 1 : Créer la Base de Données

Dans l'interface OVH PostgreSQL :

1. Allez dans l'onglet **"Bases de données"** ou **"Databases"**
2. Cliquez sur **"Ajouter une base de données"** ou **"Create database"**
3. Nom : `fouta_erp`
4. Cliquez sur **"Créer"**

### Étape 2 : Créer l'Utilisateur

1. Allez dans l'onglet **"Utilisateurs et droits"** ou **"Users and rights"**
2. Cliquez sur **"Ajouter un utilisateur"** ou **"Create user"**
3. Nom d'utilisateur : `fouta_user`
4. Mot de passe : Choisissez un mot de passe fort
5. **Cochez tous les droits** sur la base `fouta_erp`
6. Cliquez sur **"Créer"**

### Étape 3 : Autoriser l'IP

1. Allez dans l'onglet **"IPs autorisées"**
2. Ajoutez : `145.239.37.162`
3. Description : `Serveur fabrication.laplume-artisanale.tn`

---

## 🔧 Configuration du Projet

Une fois la base et l'utilisateur créés, sur le serveur SSH :

```bash
cd ~/la-plume-artisanale

# Cloner le projet si pas déjà fait
git clone https://github.com/Sghaier-h/La-Plume-Artisanale.git fouta-erp
cd fouta-erp/backend
```

### Créer le fichier .env

```bash
nano .env
```

**Contenu** (remplacez `VOTRE_MOT_DE_PASSE` par le mot de passe que vous avez choisi) :

```env
# Base de données PostgreSQL OVH
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=fouta_erp
DB_USER=fouta_user
DB_PASSWORD=VOTRE_MOT_DE_PASSE

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

**Pour générer le JWT Secret** :
```bash
openssl rand -hex 32
```

---

## 🚀 Installation et Initialisation

### Installer les dépendances

```bash
cd ~/fouta-erp/backend
npm install --production
```

### Initialiser la base de données

```bash
cd ~/fouta-erp/database

# Exécuter les scripts SQL
export PGPASSWORD=VOTRE_MOT_DE_PASSE
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U fouta_user -d fouta_erp -f 01_base_et_securite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U fouta_user -d fouta_erp -f 02_production_et_qualite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U fouta_user -d fouta_erp -f 03_flux_et_tracabilite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U fouta_user -d fouta_erp -f 04_mobile_devices.sql
unset PGPASSWORD
```

---

## ✅ Test de Connexion

```bash
# Tester la connexion
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U fouta_user -d fouta_erp -c "SELECT version();"
```

---

## 🚀 Démarrer l'Application

```bash
cd ~/fouta-erp/backend

# Installer PM2 localement
npm install -g pm2 --prefix $HOME/.local 2>/dev/null || npm install pm2 --save-dev

# Démarrer
pm2 start src/server.js --name fouta-api
pm2 save
```

---

## 📋 Checklist Complète

- [x] Instance PostgreSQL créée ✅
- [ ] Base `fouta_erp` créée
- [ ] Utilisateur `fouta_user` créé avec tous les droits
- [ ] IP `145.239.37.162` autorisée
- [ ] Fichier `.env` configuré
- [ ] Dépendances installées
- [ ] Base de données initialisée
- [ ] Application démarrée

---

## 🎉 Félicitations !

Une fois tout configuré, votre application sera en ligne sur :
- **https://fabrication.laplume-artisanale.tn**

---

## 🆘 Si Problème de Connexion

Vérifiez :
1. ✅ L'IP est autorisée
2. ✅ Le mot de passe est correct
3. ✅ La base `fouta_erp` existe
4. ✅ L'utilisateur `fouta_user` a les droits
5. ✅ Le port `35392` est accessible depuis votre serveur


# ✅ Configuration avec Utilisateur "Aviateur"

## 📋 Informations de Connexion PostgreSQL OVH

```
Nom d'hôte : sh131616-002.eu.clouddb.ovh.net
Port SQL : 35392
Base de données : fouta_erp
Utilisateur : Aviateur
Mot de passe : [celui que vous avez défini]
```

---

## 🔧 Configuration du Fichier .env

Sur le serveur SSH, créez le fichier `.env` :

```bash
cd ~/la-plume-artisanale

# Cloner le projet si pas déjà fait
git clone https://github.com/Sghaier-h/La-Plume-Artisanale.git fouta-erp
cd fouta-erp/backend

# Créer le fichier .env
nano .env
```

**Contenu du fichier `.env`** (remplacez `VOTRE_MOT_DE_PASSE` par le mot de passe de l'utilisateur Aviateur) :

```env
# Base de données PostgreSQL OVH
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=fouta_erp
DB_USER=Aviateur
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

# Redis (optionnel)
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Générer le JWT Secret** :
```bash
openssl rand -hex 32
```

---

## 🚀 Installation et Initialisation

### 1. Installer les dépendances

```bash
cd ~/fouta-erp/backend
npm install --production
```

### 2. Initialiser la base de données

```bash
cd ~/fouta-erp/database

# Exécuter les scripts SQL
export PGPASSWORD=VOTRE_MOT_DE_PASSE
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d fouta_erp -f 01_base_et_securite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d fouta_erp -f 02_production_et_qualite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d fouta_erp -f 03_flux_et_tracabilite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d fouta_erp -f 04_mobile_devices.sql
unset PGPASSWORD
```

**Remplacez** `VOTRE_MOT_DE_PASSE` par le mot de passe de l'utilisateur Aviateur.

---

## ✅ Test de Connexion

```bash
# Tester la connexion
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d fouta_erp -c "SELECT version();"
```

Si ça fonctionne, vous verrez la version de PostgreSQL.

---

## 🚀 Démarrer l'Application

```bash
cd ~/fouta-erp/backend

# Installer PM2 localement
npm install -g pm2 --prefix $HOME/.local 2>/dev/null || npm install pm2 --save-dev

# Démarrer
pm2 start src/server.js --name fouta-api
pm2 save

# Vérifier
pm2 status
pm2 logs fouta-api
```

---

## 📋 Checklist

- [x] Instance PostgreSQL créée ✅
- [ ] Base `fouta_erp` créée
- [x] Utilisateur `Aviateur` créé ✅
- [ ] IP `145.239.37.162` autorisée
- [ ] Fichier `.env` configuré avec utilisateur `Aviateur`
- [ ] Dépendances installées
- [ ] Base de données initialisée
- [ ] Application démarrée

---

## 🎉 Après Configuration

Votre API sera accessible sur :
- **https://fabrication.laplume-artisanale.tn**
- **http://145.239.37.162:5000**

Test :
```bash
curl https://fabrication.laplume-artisanale.tn/health
```

---

## 🆘 Si Problème

### Erreur de connexion

Vérifiez :
1. ✅ L'IP `145.239.37.162` est autorisée
2. ✅ Le mot de passe de l'utilisateur `Aviateur` est correct
3. ✅ La base `fouta_erp` existe
4. ✅ L'utilisateur `Aviateur` a tous les droits sur `fouta_erp`

### Erreur "permission denied"

L'utilisateur `Aviateur` doit avoir tous les droits sur la base `fouta_erp` :
- SELECT
- INSERT
- UPDATE
- DELETE
- CREATE
- DROP
- etc.

---

## 📝 Résumé

- **Utilisateur** : `Aviateur`
- **Base** : `fouta_erp`
- **Serveur** : `sh131616-002.eu.clouddb.ovh.net`
- **Port** : `35392`

Utilisez ces informations dans votre fichier `.env` !


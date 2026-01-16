# 📋 Configuration Complète - Récapitulatif

## ✅ Informations de Configuration Complètes

### 🗄️ Base de Données PostgreSQL OVH

- **Type** : Web Cloud Databases PostgreSQL 17
- **Nom d'hôte** : `sh131616-002.eu.clouddb.ovh.net`
- **Port SQL** : `35392`
- **Port SFTP** : `45392`
- **Base de données** : `ERP_La_Plume`
- **Utilisateur** : `Aviateur`
- **Mot de passe** : `Allbyfouta007`
- **IP autorisée** : `145.239.37.162/32`

---

### 🌐 Hébergement Web OVH

- **Domaine principal** : `allbyfb.cluster030.hosting.ovh.net`
- **Domaine application** : `fabrication.laplume-artisanale.tn`
- **Dossier racine** : `fouta-erp/backend`
- **IP serveur** : `145.239.37.162`

#### Serveurs d'Accès

- **FTP** : `ftp.cluster130.hosting.ovh.net` (Port 21)
- **SFTP** : `ftp.cluster130.hosting.ovh.net` (Port 22)
- **SSH** : `ssh.cluster130.hosting.ovh.net` (Port 22)

#### Identifiants

- **Login principal** : `allbyfb`
- **Chemin home** : `/home/allbyfb`
- **Chemin réel** : `/homez.1005/allbyfb` (sur le serveur)

---

## 📁 Structure des Fichiers

```
/home/allbyfb/
└── fouta-erp/
    └── backend/
        ├── .ovhconfig          (Configuration Node.js)
        ├── .env                (Variables d'environnement)
        ├── index.js            (Point d'entrée - à créer)
        ├── package.json
        ├── src/
        │   └── server.js       (Serveur Express)
        └── node_modules/
```

---

## ✅ Fichiers de Configuration

### 1. `.ovhconfig` (dans `fouta-erp/backend/`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<engine>
    <name>nodejs</name>
    <version>18</version>
</engine>
```

### 2. `.env` (dans `fouta-erp/backend/`)

```
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007
PORT=50000
NODE_ENV=production
FRONTEND_URL=https://fabrication.laplume-artisanale.tn
JWT_SECRET=7548d6237c7df1abf961bce5a3990b01939d3a902f27a3ae3c0b233deefc2537
JWT_EXPIRE=7d
API_URL=https://fabrication.laplume-artisanale.tn
API_VERSION=v1
REDIS_HOST=localhost
REDIS_PORT=6379
HOST=127.0.0.1
```

### 3. `index.js` (à créer dans `fouta-erp/backend/`)

```javascript
// Point d'entrée pour OVH
import './src/server.js';
```

---

## 🔧 Commandes Utiles

### Se Connecter au Serveur

```bash
ssh allbyfb@ssh.cluster130.hosting.ovh.net
```

### Aller dans le Dossier Backend

```bash
cd ~/fouta-erp/backend
```

### Vérifier les Fichiers

```bash
# Vérifier .ovhconfig
cat .ovhconfig

# Vérifier .env
cat .env

# Vérifier index.js
cat index.js
```

### Tester la Connexion à la Base de Données

```bash
export PGPASSWORD="Allbyfouta007"
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -c "SELECT version();"
unset PGPASSWORD
```

---

## 🚀 Prochaines Étapes

### 1. Créer index.js

```bash
cd ~/fouta-erp/backend
cat > index.js << 'EOF'
import './src/server.js';
EOF
```

### 2. Vérifier la Configuration OVH

Dans le panneau OVH → Multisite → `fabrication.laplume-artisanale.tn` :
- Dossier racine : `fouta-erp/backend`
- Node.js : Activé (via `.ovhconfig`)

### 3. Attendre la Propagation

- Attendre 10-15 minutes après création de `index.js`

### 4. Tester l'Application

```bash
# Tester en HTTP
curl http://fabrication.laplume-artisanale.tn/health

# OU depuis le navigateur
# http://fabrication.laplume-artisanale.tn/health
```

---

## 📋 Checklist de Déploiement

- [x] Base de données PostgreSQL créée et configurée
- [x] Base de données initialisée (tables créées)
- [x] Domaine configuré dans multisite
- [x] Dossier racine : `fouta-erp/backend`
- [x] Fichier `.ovhconfig` créé
- [ ] Fichier `index.js` créé
- [ ] Node.js activé (via `.ovhconfig`)
- [ ] Application accessible via le domaine
- [ ] API répond aux requêtes

---

## 🆘 En Cas de Problème

### Problème : Listing de Répertoire

- Vérifier que `index.js` existe
- Vérifier que `.ovhconfig` est correct
- Contacter le support OVH si Node.js n'est pas activé

### Problème : Erreur 502/503

- Vérifier les logs dans le panneau OVH
- Vérifier la connexion à la base de données
- Vérifier que le port dans `.env` est correct

### Problème : Connexion Base de Données

- Vérifier que l'IP `145.239.37.162` est autorisée
- Vérifier les identifiants dans `.env`
- Tester la connexion manuellement avec `psql`

---

## 📞 Support

Si problème persiste :
1. Vérifier les logs dans le panneau OVH
2. Contacter le support OVH avec :
   - Le fichier `.ovhconfig`
   - La configuration du multisite
   - Les erreurs rencontrées

---

## ✅ Résumé

Toutes les configurations sont en place. Il ne reste plus qu'à :
1. Créer le fichier `index.js`
2. Attendre la propagation
3. Tester l'accès au domaine


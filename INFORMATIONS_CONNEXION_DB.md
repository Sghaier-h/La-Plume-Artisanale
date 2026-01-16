# 📋 Informations de Connexion - Base de Données PostgreSQL

## ✅ Configuration PostgreSQL OVH

### Informations de Connexion SQL

- **Nom d'hôte** : `sh131616-002.eu.clouddb.ovh.net`
- **Port SQL** : `35392`
- **Base de données** : `ERP_La_Plume`
- **Utilisateur** : `Aviateur`
- **Mot de passe** : `Allbyfouta007`

### Informations de Connexion SFTP

- **Nom d'hôte** : `sh131616-002.eu.clouddb.ovh.net`
- **Port SFTP** : `45392`
- **Nom d'utilisateur** : `admin`
- **Mot de passe du serveur** : (masqué dans le panneau)

---

## 🔗 Connexion depuis l'Application

### Dans le Fichier .env

```bash
# Base de données PostgreSQL OVH
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007
```

---

## 🧪 Test de Connexion depuis SSH

```bash
# Tester la connexion PostgreSQL
export PGPASSWORD="Allbyfouta007"
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -c "SELECT version();"
unset PGPASSWORD
```

---

## ✅ Configuration Actuelle

- ✅ **Base de données** : `ERP_La_Plume` créée
- ✅ **Utilisateur** : `Aviateur` créé
- ✅ **IP autorisée** : `145.239.37.162/32`
- ✅ **Accès hébergements web OVH** : Activé

---

## 📝 Note

**Ces informations sont correctes et la base de données fonctionne.**

Le problème actuel n'est **PAS** la base de données, mais le **reverse proxy OVH** qui ne route pas les requêtes HTTP vers votre application Node.js.

Une fois le reverse proxy configuré par le support OVH, l'application pourra se connecter à la base de données sans problème.

---

## 🆘 Si Problème de Connexion à la Base de Données

### Vérifier l'IP Autorisée

1. Panneau OVH → **Cloud Databases** → **IPs autorisées**
2. Vérifiez que `145.239.37.162/32` est présent
3. Si absent, ajoutez-le

### Vérifier les Identifiants

1. Panneau OVH → **Cloud Databases** → **Utilisateurs et droits**
2. Vérifiez que l'utilisateur `Aviateur` existe
3. Vérifiez les droits sur la base `ERP_La_Plume`

---

## ✅ Résumé

**Configuration base de données** : ✅ Correcte et fonctionnelle

**Problème actuel** : Reverse proxy OVH (pas la base de données)

**Action** : Contacter le support OVH pour le reverse proxy


# ☁️ Guide Complet de Déploiement OVH Cloud

## 🎯 Vue d'ensemble

Ce guide vous permet d'installer automatiquement le projet ERP ALL BY FOUTA sur un serveur OVH Cloud.

## 📋 Prérequis

- ✅ Serveur OVH VPS (Ubuntu 22.04 ou Debian 11)
- ✅ Accès SSH au serveur
- ✅ Domaine configuré (ex: api.fouta-erp.com)
- ✅ 2 GB RAM minimum (4 GB recommandé)

## 🚀 Installation Automatique avec GitHub (Recommandé)

### Étape 1 : Créer le repository GitHub

Consultez `GUIDE_GITHUB.md` pour créer et configurer votre repository.

### Étape 2 : Se connecter au serveur

```bash
ssh root@votre-serveur-ovh.com
```

### Étape 3 : Exécuter le script d'installation

```bash
# Installer Git
apt update && apt install -y git

# Télécharger et exécuter le script
curl -o /tmp/install-ovh.sh https://raw.githubusercontent.com/votre-username/fouta-erp/main/scripts/install-ovh.sh
chmod +x /tmp/install-ovh.sh
sudo bash /tmp/install-ovh.sh
```

Le script va :
- ✅ Installer toutes les dépendances
- ✅ Vous demander l'URL du repository GitHub
- ✅ Cloner automatiquement le projet
- ✅ Configurer tout le système

Le script va :
- ✅ Installer Node.js, PostgreSQL, Nginx, Redis
- ✅ Créer la base de données
- ✅ Configurer Nginx avec SSL
- ✅ Démarrer l'application avec PM2
- ✅ Configurer les backups automatiques

## 📝 Installation Manuelle

Si vous préférez installer manuellement, suivez le guide dans `DEPLOIEMENT_OVH.md`.

## ✅ Vérification

Après l'installation, vérifiez :

```bash
# Statut PM2
pm2 status

# Test API
curl https://api.fouta-erp.com/health

# Logs
pm2 logs fouta-api
```

## 🔄 Mise à jour

```bash
# Utiliser le script de déploiement
bash /var/www/fouta-erp/scripts/deploy.sh
```

## 💾 Backup

```bash
# Backup manuel
bash /var/www/fouta-erp/scripts/backup.sh

# Les backups automatiques tournent tous les jours à 2h du matin
```

## 🔍 Vérification du statut

```bash
# Voir l'état complet
bash /var/www/fouta-erp/scripts/check-status.sh
```

## 📱 Configuration Applications Android

Une fois le serveur déployé, configurez les apps Android avec :

```kotlin
const val BASE_URL = "https://api.fouta-erp.com/api/v1/"
```

## 🆘 Support

En cas de problème :
1. Vérifier les logs : `pm2 logs fouta-api`
2. Vérifier Nginx : `sudo nginx -t`
3. Vérifier PostgreSQL : `sudo systemctl status postgresql`
4. Consulter `DEPLOIEMENT_OVH.md` pour le dépannage

## 📚 Documentation

- `DEPLOIEMENT_OVH.md` - Guide déploiement détaillé
- `scripts/install-ovh.sh` - Script d'installation automatique
- `scripts/deploy.sh` - Script de déploiement
- `scripts/backup.sh` - Script de backup
- `scripts/check-status.sh` - Vérification du statut


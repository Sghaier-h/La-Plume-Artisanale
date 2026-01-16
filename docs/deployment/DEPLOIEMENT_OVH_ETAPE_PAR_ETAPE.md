# 🚀 Déploiement OVH - Guide Étape par Étape

## ✅ Prérequis

- ✅ Code sur GitHub : https://github.com/Sghaier-h/La-Plume-Artisanale
- ⏳ Serveur OVH configuré
- ⏳ Accès SSH au serveur

## 📋 Checklist avant de commencer

- [ ] Serveur OVH VPS créé (Ubuntu 22.04 ou Debian 11)
- [ ] Accès SSH au serveur (IP, utilisateur, mot de passe/clé SSH)
- [ ] Domaine configuré (ex: api.fouta-erp.com) - optionnel pour commencer
- [ ] Au moins 2 GB RAM (4 GB recommandé)
- [ ] Au moins 20 GB d'espace disque

---

## 🎯 Étape 1 : Se connecter au serveur OVH

### Option A : Avec mot de passe

```bash
ssh root@VOTRE_IP_OVH
# ou
ssh utilisateur@VOTRE_IP_OVH
```

### Option B : Avec clé SSH

```bash
ssh -i chemin/vers/votre/cle.pem root@VOTRE_IP_OVH
```

**Remplacez** `VOTRE_IP_OVH` par l'IP de votre serveur OVH.

---

## 🎯 Étape 2 : Exécuter le script d'installation automatique

### Méthode 1 : Installation automatique (Recommandé)

```bash
# Mettre à jour le système
apt update && apt upgrade -y

# Installer Git
apt install -y git

# Télécharger et exécuter le script d'installation
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/scripts/install-ovh.sh)
```

Le script va vous demander :
1. **URL du repository GitHub** : `https://github.com/Sghaier-h/La-Plume-Artisanale.git`
2. **Mot de passe PostgreSQL** : Choisissez un mot de passe sécurisé
3. **JWT Secret** : Générez un secret long et aléatoire (ex: utilisez `openssl rand -hex 32`)
4. **Domaine API** : Ex: `api.fouta-erp.com` (ou l'IP pour commencer)
5. **Domaine Frontend** : Ex: `app.fouta-erp.com` (optionnel)

### Méthode 2 : Installation manuelle

Si le script automatique ne fonctionne pas, suivez le guide dans `DEPLOIEMENT_OVH.md`.

---

## 🎯 Étape 3 : Le script fait automatiquement

Le script d'installation va :

1. ✅ Installer Node.js 18
2. ✅ Installer PostgreSQL
3. ✅ Installer Redis
4. ✅ Installer Nginx
5. ✅ Installer PM2
6. ✅ Cloner le projet depuis GitHub
7. ✅ Créer la base de données
8. ✅ Initialiser la base de données (scripts SQL)
9. ✅ Configurer Nginx
10. ✅ Installer le certificat SSL (Let's Encrypt)
11. ✅ Démarrer l'application avec PM2
12. ✅ Configurer le firewall
13. ✅ Configurer les backups automatiques

**Temps estimé** : 10-15 minutes

---

## 🎯 Étape 4 : Vérifier l'installation

### Vérifier PM2

```bash
pm2 status
```

Vous devriez voir `fouta-api` en cours d'exécution.

### Vérifier Nginx

```bash
systemctl status nginx
```

### Vérifier PostgreSQL

```bash
systemctl status postgresql
```

### Tester l'API

```bash
curl http://localhost:5000/health
```

Ou depuis votre machine :

```bash
curl http://VOTRE_IP_OVH:5000/health
```

Devrait retourner :
```json
{"status":"OK","timestamp":"..."}
```

---

## 🎯 Étape 5 : Configurer le domaine (si vous en avez un)

### 5.1 Pointer le domaine vers l'IP

Dans votre gestionnaire de domaine, créez un enregistrement A :
- **Type** : A
- **Nom** : `api` (ou `@` pour le domaine racine)
- **Valeur** : IP de votre serveur OVH
- **TTL** : 3600

### 5.2 Vérifier le certificat SSL

Le script a normalement installé le certificat SSL automatiquement. Vérifiez :

```bash
sudo certbot certificates
```

### 5.3 Tester l'API avec le domaine

```bash
curl https://api.fouta-erp.com/health
```

---

## 🎯 Étape 6 : Configurer les applications Android

Une fois l'API déployée, mettez à jour les applications Android avec l'URL de l'API.

### Dans les fichiers Android

Modifiez `mobile/android/shared/api/ApiClient.kt` :

```kotlin
const val BASE_URL = "https://api.fouta-erp.com/api/v1/"
// ou
const val BASE_URL = "http://VOTRE_IP_OVH:5000/api/v1/"
```

---

## 🔧 Commandes utiles après installation

### Voir les logs de l'application

```bash
pm2 logs fouta-api
```

### Redémarrer l'application

```bash
pm2 restart fouta-api
```

### Voir le statut complet

```bash
cd /var/www/fouta-erp
bash scripts/check-status.sh
```

### Mettre à jour le code

```bash
cd /var/www/fouta-erp
bash scripts/deploy.sh
```

### Faire un backup manuel

```bash
cd /var/www/fouta-erp
bash scripts/backup.sh
```

---

## 🆘 Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs
pm2 logs fouta-api

# Vérifier la connexion à la base de données
psql -U fouta_user -d fouta_erp -c "SELECT 1;"
```

### Erreur 502 Bad Gateway

```bash
# Vérifier que Node.js tourne
pm2 status

# Vérifier Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### Problème de certificat SSL

```bash
# Vérifier le certificat
sudo certbot certificates

# Renouveler si nécessaire
sudo certbot renew
```

### Base de données non initialisée

```bash
cd /var/www/fouta-erp/database
psql -U fouta_user -d fouta_erp -f 01_base_et_securite.sql
psql -U fouta_user -d fouta_erp -f 02_production_et_qualite.sql
psql -U fouta_user -d fouta_erp -f 03_flux_et_tracabilite.sql
psql -U fouta_user -d fouta_erp -f 04_mobile_devices.sql
```

---

## ✅ Checklist de déploiement

- [ ] Serveur OVH accessible en SSH
- [ ] Script d'installation exécuté
- [ ] Base de données créée et initialisée
- [ ] Application démarrée avec PM2
- [ ] Nginx configuré et actif
- [ ] SSL installé (si domaine configuré)
- [ ] API accessible (health check OK)
- [ ] Firewall configuré
- [ ] Backups automatiques configurés
- [ ] Applications Android configurées avec la nouvelle URL

---

## 🎉 Félicitations !

Votre application est maintenant déployée sur OVH !

### URLs

- **API** : `https://api.fouta-erp.com` (ou `http://VOTRE_IP_OVH:5000`)
- **Health Check** : `https://api.fouta-erp.com/health`

### Prochaines étapes

1. ✅ Tester l'API avec Postman ou curl
2. ✅ Configurer les applications Android
3. ✅ Tester la connexion depuis les apps
4. ✅ Monitorer les logs régulièrement
5. ✅ Configurer les backups automatiques

---

## 📚 Documentation

- **`DEPLOIEMENT_OVH.md`** - Guide déploiement détaillé
- **`GUIDE_DEPLOIEMENT_OVH.md`** - Guide rapide
- **`scripts/install-ovh.sh`** - Script d'installation
- **`scripts/deploy.sh`** - Script de mise à jour
- **`scripts/backup.sh`** - Script de backup

---

## 💡 Astuces

- Utilisez `pm2 monit` pour monitorer en temps réel
- Configurez des alertes pour les erreurs
- Faites des backups réguliers
- Mettez à jour le système régulièrement : `apt update && apt upgrade`
- Monitorer l'espace disque : `df -h`


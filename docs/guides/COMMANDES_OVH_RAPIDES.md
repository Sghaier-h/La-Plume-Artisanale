# ⚡ Commandes Rapides OVH - La Plume Artisanale

## 🔗 Informations de connexion

- **Domaine** : `fabrication.laplume-artisanale.tn`
- **SSH** : `ssh allbyfb@ssh.cluster130.hosting.ovh.net`
- **FTP** : `ftp://allbyfb@ftp.cluster130.hosting.ovh.net/`
- **Utilisateur** : `allbyfb`

---

## 🚀 Installation rapide (une seule commande)

```bash
ssh allbyfb@ssh.cluster130.hosting.ovh.net
```

Puis :

```bash
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/scripts/install-ovh.sh)
```

**Réponses aux questions** :
- URL GitHub : `https://github.com/Sghaier-h/La-Plume-Artisanale.git`
- Mot de passe PostgreSQL : (choisissez un mot de passe fort)
- JWT Secret : (générez avec `openssl rand -hex 32`)
- Domaine API : `fabrication.laplume-artisanale.tn`
- Domaine Frontend : `fabrication.laplume-artisanale.tn`

---

## 📋 Commandes essentielles

### Se connecter

```bash
ssh allbyfb@ssh.cluster130.hosting.ovh.net
```

### Aller dans le projet

```bash
cd /var/www/fouta-erp
```

### Voir les logs

```bash
pm2 logs fouta-api
```

### Redémarrer l'application

```bash
pm2 restart fouta-api
```

### Mettre à jour le code

```bash
cd /var/www/fouta-erp
git pull origin main
cd backend
npm install --production
pm2 restart fouta-api
```

Ou avec le script :

```bash
cd /var/www/fouta-erp
bash scripts/deploy.sh
```

### Vérifier le statut

```bash
pm2 status
cd /var/www/fouta-erp
bash scripts/check-status.sh
```

### Tester l'API

```bash
curl https://fabrication.laplume-artisanale.tn/health
```

---

## 🔧 Configuration initiale

### 1. Créer la base de données

```bash
sudo -u postgres psql
CREATE DATABASE fouta_erp;
CREATE USER fouta_user WITH PASSWORD 'VOTRE_MOT_DE_PASSE';
GRANT ALL PRIVILEGES ON DATABASE fouta_erp TO fouta_user;
\q
```

### 2. Configurer .env

```bash
cd /var/www/fouta-erp/backend
nano .env
```

### 3. Initialiser la base de données

```bash
cd /var/www/fouta-erp/database
psql -U fouta_user -d fouta_erp -f 01_base_et_securite.sql
psql -U fouta_user -d fouta_erp -f 02_production_et_qualite.sql
psql -U fouta_user -d fouta_erp -f 03_flux_et_tracabilite.sql
psql -U fouta_user -d fouta_erp -f 04_mobile_devices.sql
```

---

## 🆘 Dépannage rapide

### Application ne démarre pas

```bash
pm2 logs fouta-api --lines 50
```

### Erreur base de données

```bash
psql -U fouta_user -d fouta_erp -c "SELECT 1;"
```

### Erreur Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Voir l'espace disque

```bash
df -h
```

### Voir la mémoire

```bash
free -h
```

---

## 📱 URL API pour Android

```
https://fabrication.laplume-artisanale.tn/api/v1/
```

---

## ✅ Checklist rapide

- [ ] Connecté au serveur SSH
- [ ] Node.js installé (`node --version`)
- [ ] PostgreSQL installé (`psql --version`)
- [ ] Projet cloné (`cd /var/www/fouta-erp`)
- [ ] Base de données créée
- [ ] Fichier `.env` configuré
- [ ] Base de données initialisée
- [ ] Application démarrée (`pm2 status`)
- [ ] Nginx configuré
- [ ] SSL installé
- [ ] API accessible (`curl https://fabrication.laplume-artisanale.tn/health`)

---

## 📚 Documentation complète

Consultez **`DEPLOIEMENT_OVH_PERSONNALISE.md`** pour le guide détaillé.


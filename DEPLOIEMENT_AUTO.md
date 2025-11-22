# 🤖 Déploiement Automatique Complet

## ✅ Tout est pré-configuré !

J'ai créé un script complètement automatisé qui fait TOUT sans aucune question.

---

## 🚀 Option 1 : Depuis le serveur (Recommandé)

### Se connecter

```bash
ssh allbyfb@46.105.204.30
```

**Mot de passe** : `Allbyfouta007`

### Exécuter le script

```bash
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-auto.sh)
```

**C'est tout !** Le script fait tout automatiquement.

---

## 🚀 Option 2 : Depuis votre machine locale

### Windows (PowerShell)

```powershell
# Télécharger le script
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-from-local.sh" -OutFile "deploy.ps1"

# Installer sshpass (si nécessaire)
# Puis exécuter via WSL ou Git Bash
```

### Linux/Mac

```bash
# Télécharger et exécuter
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-from-local.sh)
```

---

## 📋 Ce que fait le script automatiquement

1. ✅ Mise à jour du système
2. ✅ Installation Node.js 18
3. ✅ Installation PostgreSQL
4. ✅ Création base de données (mot de passe : `FoutaERP2024!Secure`)
5. ✅ Installation Redis
6. ✅ Installation Nginx
7. ✅ Installation PM2
8. ✅ Clonage du projet depuis GitHub
9. ✅ Configuration .env automatique
10. ✅ Installation dépendances
11. ✅ Initialisation base de données
12. ✅ Configuration Nginx
13. ✅ Installation SSL (Let's Encrypt)
14. ✅ Démarrage application avec PM2
15. ✅ Configuration firewall
16. ✅ Configuration backups automatiques

**Temps** : 10-15 minutes

---

## ✅ Vérification après installation

```bash
# Tester l'API
curl https://fabrication.laplume-artisanale.tn/health
curl http://46.105.204.30:5000/health

# Vérifier PM2
pm2 status
pm2 logs fouta-api

# Vérifier les services
sudo systemctl status postgresql
sudo systemctl status nginx
```

---

## 🔐 Informations importantes

### Mot de passe PostgreSQL

Le script utilise automatiquement : `FoutaERP2024!Secure`

**⚠️ Sauvegardez ce mot de passe !**

### JWT Secret

Généré automatiquement et sauvegardé dans `.env`

---

## 🔄 Mise à jour future

```bash
cd /var/www/fouta-erp
git pull origin main
cd backend
npm install --production
pm2 restart fouta-api
```

---

## 🆘 Si quelque chose ne va pas

### Voir les logs

```bash
pm2 logs fouta-api
sudo tail -f /var/log/nginx/error.log
```

### Redémarrer l'application

```bash
pm2 restart fouta-api
```

### Vérifier la base de données

```bash
psql -U fouta_user -d fouta_erp -c "SELECT 1;"
```

---

## 📱 URL API pour Android

```
https://fabrication.laplume-artisanale.tn/api/v1/
```

---

## 🎉 C'est tout !

Votre application est maintenant déployée et accessible sur :
- **https://fabrication.laplume-artisanale.tn**
- **http://46.105.204.30:5000**

**Aucune interaction nécessaire - tout est automatique !** 🚀


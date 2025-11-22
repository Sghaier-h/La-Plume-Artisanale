# 🤖 Exécuter le Déploiement Automatiquement

## ⚠️ Limitation

Je ne peux pas me connecter directement au serveur SSH depuis cet environnement. Cependant, voici plusieurs façons d'exécuter le script automatiquement :

---

## 🚀 Option 1 : Depuis Windows (PowerShell)

### Avec PuTTY (si installé)

```powershell
# Installer PuTTY si nécessaire
winget install PuTTY.PuTTY

# Exécuter le script
.\deploy-windows.ps1
```

### Avec WSL (Windows Subsystem for Linux)

```powershell
wsl bash -c 'ssh allbyfb@46.105.204.30 "bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-auto.sh)"'
```

**Mot de passe** : `Allbyfouta007`

### Avec Git Bash

1. Ouvrez Git Bash
2. Exécutez :

```bash
ssh allbyfb@46.105.204.30
# Mot de passe : Allbyfouta007
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-auto.sh)
```

---

## 🚀 Option 2 : Depuis Linux/Mac

```bash
ssh allbyfb@46.105.204.30
# Mot de passe : Allbyfouta007
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-auto.sh)
```

---

## 🚀 Option 3 : Avec un script batch Windows

Créez un fichier `deploy.bat` :

```batch
@echo off
echo Connexion au serveur...
plink -ssh allbyfb@46.105.204.30 -pw Allbyfouta007 "bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-auto.sh)"
pause
```

---

## 🚀 Option 4 : Via l'interface OVH

Si vous avez accès au panneau OVH, vous pouvez :

1. Ouvrir un terminal web dans le panneau OVH
2. Exécuter directement :

```bash
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-auto.sh)
```

---

## 📋 Commandes manuelles (si les scripts ne fonctionnent pas)

### 1. Se connecter

```bash
ssh allbyfb@46.105.204.30
```

**Mot de passe** : `Allbyfouta007`

### 2. Télécharger le script

```bash
curl -o deploy.sh https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-auto.sh
chmod +x deploy.sh
```

### 3. Exécuter

```bash
bash deploy.sh
```

---

## ✅ Vérification après exécution

```bash
# Tester l'API
curl https://fabrication.laplume-artisanale.tn/health

# Vérifier PM2
pm2 status

# Voir les logs
pm2 logs fouta-api
```

---

## 🆘 Problèmes de connexion SSH

### Erreur "Connection refused"

- Vérifiez que le serveur est accessible
- Vérifiez le firewall

### Erreur "Permission denied"

- Vérifiez le mot de passe : `Allbyfouta007`
- Vérifiez l'utilisateur : `allbyfb`

### Timeout

- Vérifiez votre connexion internet
- Vérifiez que l'IP `46.105.204.30` est correcte

---

## 💡 Solution la plus simple

**Ouvrez un terminal (Git Bash, PowerShell, ou terminal Linux/Mac) et exécutez :**

```bash
ssh allbyfb@46.105.204.30
```

Puis collez cette commande :

```bash
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-auto.sh)
```

**C'est tout !** Le script fait le reste automatiquement.

---

## 🎯 Résumé

Malheureusement, je ne peux pas me connecter directement au serveur depuis cet environnement. Mais j'ai créé un script complètement automatisé que vous pouvez exécuter en **une seule commande** une fois connecté au serveur.

**Le script fait TOUT automatiquement - aucune interaction nécessaire !** 🚀


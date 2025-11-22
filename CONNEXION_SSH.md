# 🔌 Connexion SSH - IP Corrigée

## ✅ Nouvelle IP du serveur

- **IP** : `145.239.37.162` ✅
- **Domaine** : `fabrication.laplume-artisanale.tn`
- **SSH** : `ssh allbyfb@145.239.37.162`
- **Utilisateur** : `allbyfb`
- **Mot de passe** : `Allbyfouta007`

---

## 🚀 Connexion SSH

### Commande de base

```bash
ssh allbyfb@145.239.37.162
```

**Mot de passe** : `Allbyfouta007`

### Avec timeout augmenté

```bash
ssh -o ConnectTimeout=30 allbyfb@145.239.37.162
```

### Avec le domaine complet

```bash
ssh allbyfb@ssh.cluster130.hosting.ovh.net
```

---

## 🚀 Déploiement automatique

Une fois connecté :

```bash
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-auto.sh)
```

---

## ✅ Test de connexion

### Depuis PowerShell

```powershell
Test-NetConnection -ComputerName 145.239.37.162 -Port 22
```

### Ping

```powershell
ping 145.239.37.162
```

---

## 📋 Informations complètes

- **IPv4** : `145.239.37.162` ✅
- **Domaine SSH** : `ssh.cluster130.hosting.ovh.net`
- **Domaine FTP** : `ftp.cluster130.hosting.ovh.net`
- **Domaine Web** : `fabrication.laplume-artisanale.tn`
- **Utilisateur** : `allbyfb`
- **Mot de passe** : `Allbyfouta007`

---

## 🎯 Commandes rapides

### Se connecter

```bash
ssh allbyfb@145.239.37.162
```

### Déployer automatiquement

```bash
ssh allbyfb@145.239.37.162 "bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-auto.sh)"
```

---

## ✅ Tous les fichiers ont été mis à jour avec la bonne IP !


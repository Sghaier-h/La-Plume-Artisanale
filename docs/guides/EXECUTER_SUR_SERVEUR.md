# 🖥️ Exécuter sur le Serveur SSH - Instructions

## ⚠️ Important : Ces commandes sont pour le SERVEUR SSH, pas Windows !

Vous devez d'abord vous connecter au serveur SSH.

---

## 🚀 Étape 1 : Se Connecter au Serveur

### Depuis PowerShell Windows

```powershell
ssh allbyfb@ssh.cluster130.hosting.ovh.net
```

**OU**

```powershell
ssh allbyfb@145.239.37.162
```

**Mot de passe** : `Allbyfouta007`

---

## 🚀 Étape 2 : Une Fois Connecté au Serveur

**Maintenant** vous êtes sur le serveur Linux. Exécutez :

```bash
cd ~/la-plume-artisanale
curl -o deploy.sh https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-avec-password.sh
chmod +x deploy.sh
bash deploy.sh
```

---

## 📋 Commandes Complètes (Copier-Coller)

### 1. Se connecter

```powershell
ssh allbyfb@ssh.cluster130.hosting.ovh.net
```

**Mot de passe** : `Allbyfouta007`

### 2. Sur le serveur (après connexion)

```bash
cd ~/la-plume-artisanale
curl -o deploy.sh https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-avec-password.sh
chmod +x deploy.sh
bash deploy.sh
```

---

## 🔍 Comment Savoir si Vous Êtes sur le Serveur

Vous devriez voir un prompt comme :
```
allbyfb@ssh01.cluster130.gra.hosting.ovh.net (php/7.4/production/stable64) ~ $
```

**Pas** :
```
PS C:\Users\HAMDISGHAIER>
```

---

## ✅ Résumé

1. **Sur Windows** : Connectez-vous avec `ssh allbyfb@ssh.cluster130.hosting.ovh.net`
2. **Sur le serveur** : Exécutez les commandes `cd`, `curl`, `bash`, etc.

---

## 🆘 Si Vous Ne Pouvez Pas Vous Connecter

Vérifiez :
- ✅ Le mot de passe : `Allbyfouta007`
- ✅ L'IP : `145.239.37.162` ou `ssh.cluster130.hosting.ovh.net`
- ✅ SSH est activé sur votre machine Windows

---

## 💡 Alternative : Utiliser le Terminal Web OVH

Si SSH ne fonctionne pas :
1. Allez dans le panneau OVH
2. Utilisez le **"Terminal Web"**
3. Exécutez les commandes directement là-bas

---

## 🎯 Action Immédiate

**Connectez-vous d'abord au serveur SSH**, puis exécutez les commandes !


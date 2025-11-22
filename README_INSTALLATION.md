# 🚀 Installation et Configuration - Guide Complet

## 📋 Checklist

- [ ] **Git installé** (voir `INSTALLER_GIT.md`)
- [ ] **Repository GitHub créé** : https://github.com/Sghaier-h/La-Plume-Artisanale
- [ ] **Personal Access Token créé** (voir ci-dessous)
- [ ] **Git initialisé** dans le dossier
- [ ] **Code poussé** sur GitHub

---

## 🔧 Étape 1 : Installer Git

**Git n'est pas installé sur votre machine.**

Suivez le guide : **`INSTALLER_GIT.md`**

Résumé :
1. Téléchargez : https://git-scm.com/download/win
2. Installez (gardez les options par défaut)
3. Redémarrez PowerShell

Vérifiez :
```powershell
git --version
```

---

## 🔑 Étape 2 : Créer un Personal Access Token

GitHub ne permet plus d'utiliser votre mot de passe. Vous devez créer un token.

1. Allez sur : https://github.com/settings/tokens
2. Cliquez sur **"Generate new token"** > **"Generate new token (classic)"**
3. Nom : `La-Plume-Artisanale`
4. Cochez : `repo` (toutes les permissions)
5. Cliquez sur **"Generate token"**
6. **Copiez le token** (vous ne le reverrez plus !)
7. Gardez-le précieusement, vous en aurez besoin pour le push

---

## 📤 Étape 3 : Initialiser Git et pousser

### Option A : Script PowerShell

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
.\init-git.ps1
```

Puis :
```powershell
git push -u origin main
```

### Option B : Commandes manuelles

Voir **`COMMANDES_GIT.md`** pour toutes les commandes.

Résumé rapide :
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
git init
git add .
git commit -m "Initial commit - ERP ALL BY FOUTA"
git remote add origin https://github.com/Sghaier-h/La-Plume-Artisanale.git
git branch -M main
git push -u origin main
```

Lors du `git push`, utilisez :
- **Username** : Votre nom d'utilisateur GitHub
- **Password** : Le Personal Access Token que vous avez créé

---

## ✅ Étape 4 : Vérification

Allez sur : https://github.com/Sghaier-h/La-Plume-Artisanale

Vous devriez voir tous vos fichiers ! 🎉

---

## 📚 Documentation

- **`INSTALLER_GIT.md`** - Installer Git
- **`COMMANDES_GIT.md`** - Toutes les commandes Git
- **`SOLUTION_CLONAGE.md`** - Résoudre les problèmes de clonage
- **`SETUP_GITHUB.md`** - Configuration GitHub complète
- **`PUSH_TO_GITHUB.md`** - Guide pour pousser le code

---

## 🆘 Problèmes ?

### Git non reconnu
- Redémarrez PowerShell après l'installation
- Vérifiez : `git --version`

### Authentication failed
- Utilisez un Personal Access Token (pas votre mot de passe)
- Vérifiez que le token a les permissions `repo`

### Repository not found
- Vérifiez l'URL : `https://github.com/Sghaier-h/La-Plume-Artisanale.git`
- Vérifiez que vous avez les droits d'accès

---

## 🎯 Prochaines étapes

Une fois le code sur GitHub :
1. ✅ Déployer sur OVH (voir `DEPLOIEMENT_OVH.md`)
2. ✅ Configurer GitHub Actions (optionnel)
3. ✅ Inviter des collaborateurs (optionnel)


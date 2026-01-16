# 📥 Installer Git - Guide rapide

## ⚠️ Git n'est pas installé sur votre machine

Pour pouvoir utiliser Git et pousser votre code sur GitHub, vous devez d'abord installer Git.

## 🚀 Installation de Git

### Option 1 : Téléchargement direct (Recommandé)

1. **Téléchargez Git** : https://git-scm.com/download/win
2. **Installez** :
   - Double-cliquez sur le fichier téléchargé
   - Cliquez sur "Next" pour toutes les étapes
   - **Gardez les options par défaut** (c'est important)
   - Cliquez sur "Install"
3. **Redémarrez PowerShell** après l'installation

### Option 2 : Avec winget (Windows 10/11)

```powershell
winget install --id Git.Git -e --source winget
```

### Option 3 : Avec Chocolatey (si installé)

```powershell
choco install git
```

## ✅ Vérifier l'installation

Après l'installation, **fermez et rouvrez PowerShell**, puis :

```powershell
git --version
```

Vous devriez voir quelque chose comme : `git version 2.xx.x`

## 🎯 Après l'installation

Une fois Git installé, suivez les instructions dans `SOLUTION_CLONAGE.md` ou `SETUP_GITHUB.md` pour initialiser votre repository.

## 📝 Commandes rapides (après installation)

```powershell
# Aller dans le dossier
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Créer le commit
git commit -m "Initial commit - ERP ALL BY FOUTA"

# Configurer le remote
git remote add origin https://github.com/Sghaier-h/La-Plume-Artisanale.git

# Renommer la branche
git branch -M main

# Pousser sur GitHub
git push -u origin main
```

## 🔑 Authentification GitHub

Lors du `git push`, GitHub vous demandera :
- **Username** : Votre nom d'utilisateur GitHub
- **Password** : Utilisez un **Personal Access Token** (pas votre mot de passe)

### Créer un Personal Access Token

1. Allez sur : https://github.com/settings/tokens
2. Cliquez sur **"Generate new token"** > **"Generate new token (classic)"**
3. Nom : `La-Plume-Artisanale`
4. Cochez : `repo` (toutes les permissions)
5. Cliquez sur **"Generate token"**
6. **Copiez le token** (vous ne le reverrez plus !)
7. Utilisez-le comme mot de passe lors du `git push`

## 🆘 Problèmes courants

### "git n'est pas reconnu"
- Redémarrez PowerShell après l'installation
- Vérifiez que Git est dans le PATH : `$env:PATH`

### "Permission denied"
- Vérifiez que vous avez les droits sur le dossier
- Essayez en tant qu'administrateur

### "Authentication failed"
- Utilisez un Personal Access Token au lieu du mot de passe
- Vérifiez que le token a les permissions `repo`


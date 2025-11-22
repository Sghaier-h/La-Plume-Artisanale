# 🔧 Solution : Problème de clonage GitHub Desktop

## ❌ Problème

GitHub Desktop détecte seulement un fichier `.git` et ne clone pas correctement.

## ✅ Solution : Initialiser Git dans le dossier existant

Puisque votre dossier `La-Plume-Artisanale` contient déjà tous les fichiers, **ne clonez PAS**. Initialisez Git directement dans le dossier existant.

---

## 🚀 Méthode 1 : Script PowerShell (Le plus simple)

### Étape 1 : Exécuter le script

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
.\init-git.ps1
```

Le script va :
- ✅ Vérifier que Git est installé
- ✅ Supprimer un `.git` existant
- ✅ Initialiser Git
- ✅ Ajouter tous les fichiers
- ✅ Créer le commit initial
- ✅ Configurer le remote GitHub

### Étape 2 : Pousser sur GitHub

```powershell
git push -u origin main
```

**Note** : Utilisez un Personal Access Token comme mot de passe.

---

## 🚀 Méthode 2 : Commandes manuelles

### Étape 1 : Aller dans le dossier

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
```

### Étape 2 : Supprimer .git s'il existe

```powershell
if (Test-Path ".git") {
    Remove-Item -Path ".git" -Recurse -Force
}
```

### Étape 3 : Initialiser Git

```powershell
git init
```

### Étape 4 : Configurer Git (si pas déjà fait)

```powershell
git config --global user.name "Votre Nom"
git config --global user.email "votre-email@example.com"
```

### Étape 5 : Ajouter tous les fichiers

```powershell
git add .
```

### Étape 6 : Premier commit

```powershell
git commit -m "Initial commit - ERP ALL BY FOUTA / La Plume Artisanale"
```

### Étape 7 : Configurer le remote

```powershell
git remote add origin https://github.com/Sghaier-h/La-Plume-Artisanale.git
```

### Étape 8 : Renommer la branche

```powershell
git branch -M main
```

### Étape 9 : Pousser sur GitHub

```powershell
git push -u origin main
```

---

## 🔑 Créer un Personal Access Token

Si Git vous demande un mot de passe :

1. Allez sur : https://github.com/settings/tokens
2. Cliquez sur **"Generate new token"** > **"Generate new token (classic)"**
3. Nom : `La-Plume-Artisanale`
4. Cochez : `repo` (toutes les permissions)
5. Cliquez sur **"Generate token"**
6. **Copiez le token** (vous ne le reverrez plus !)
7. Utilisez-le comme mot de passe lors du `git push`

---

## 📱 Utiliser GitHub Desktop après

Une fois que vous avez poussé le code avec Git en ligne de commande :

1. Ouvrez GitHub Desktop
2. Cliquez sur **"File"** > **"Add Local Repository"**
3. Choisissez : `D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale`
4. GitHub Desktop va détecter le repository Git existant
5. Vous pourrez maintenant utiliser GitHub Desktop normalement

---

## ✅ Vérification

Allez sur : https://github.com/Sghaier-h/La-Plume-Artisanale

Vous devriez voir tous vos fichiers ! 🎉

---

## 🆘 Si ça ne fonctionne toujours pas

### Vérifier que Git est installé

```powershell
git --version
```

Si erreur, installez Git : https://git-scm.com/download/win

### Vérifier les fichiers

```powershell
Get-ChildItem -Path "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale" | Select-Object Name
```

Vous devriez voir `backend/`, `frontend/`, `database/`, etc.

### Vérifier le remote

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
git remote -v
```

Devrait afficher :
```
origin  https://github.com/Sghaier-h/La-Plume-Artisanale.git (fetch)
origin  https://github.com/Sghaier-h/La-Plume-Artisanale.git (push)
```


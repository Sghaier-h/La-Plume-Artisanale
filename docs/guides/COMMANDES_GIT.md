# 📋 Commandes Git - Guide complet

## 🎯 Commandes essentielles

### 1. Initialiser Git dans votre dossier

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
git init
```

### 2. Configurer Git (première fois seulement)

```powershell
git config --global user.name "Votre Nom"
git config --global user.email "votre-email@example.com"
```

### 3. Vérifier qu'il n'y a pas de .git existant

```powershell
if (Test-Path ".git") {
    Remove-Item -Path ".git" -Recurse -Force
}
```

### 4. Ajouter tous les fichiers

```powershell
git add .
```

### 5. Vérifier les fichiers ajoutés

```powershell
git status
```

### 6. Créer le commit

```powershell
git commit -m "Initial commit - ERP ALL BY FOUTA / La Plume Artisanale"
```

### 7. Configurer le remote GitHub

```powershell
git remote add origin https://github.com/Sghaier-h/La-Plume-Artisanale.git
```

### 8. Vérifier le remote

```powershell
git remote -v
```

### 9. Renommer la branche en main

```powershell
git branch -M main
```

### 10. Pousser sur GitHub

```powershell
git push -u origin main
```

**Note** : Utilisez un Personal Access Token comme mot de passe.

---

## 🔄 Commandes de mise à jour (après le premier push)

### Ajouter des modifications

```powershell
git add .
git commit -m "Description des modifications"
git push
```

### Voir l'historique

```powershell
git log --oneline
```

### Voir les différences

```powershell
git status
git diff
```

---

## 🆘 Commandes de dépannage

### Supprimer le remote et recommencer

```powershell
git remote remove origin
git remote add origin https://github.com/Sghaier-h/La-Plume-Artisanale.git
```

### Annuler le dernier commit (garder les fichiers)

```powershell
git reset --soft HEAD~1
```

### Voir la configuration Git

```powershell
git config --list
```

### Changer l'URL du remote

```powershell
git remote set-url origin https://github.com/Sghaier-h/La-Plume-Artisanale.git
```

---

## 📚 Ressources

- Documentation Git : https://git-scm.com/doc
- GitHub Guides : https://guides.github.com
- Personal Access Tokens : https://github.com/settings/tokens


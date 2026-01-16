# 🚀 Pousser le code sur GitHub

## ✅ Git initialisé avec succès !

Tout est prêt. Il ne reste plus qu'à pousser le code sur GitHub.

## 📤 Étape finale : Push vers GitHub

### Option 1 : Avec PowerShell

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
git push -u origin main
```

### Option 2 : Avec GitHub Desktop

1. Ouvrez GitHub Desktop
2. Cliquez sur **"File"** > **"Add Local Repository"**
3. Choisissez : `D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale`
4. GitHub Desktop va détecter le repository
5. Cliquez sur **"Publish repository"** ou **"Push origin"**

## 🔑 Authentification

GitHub vous demandera vos identifiants :

- **Username** : Votre nom d'utilisateur GitHub
- **Password** : Utilisez un **Personal Access Token** (pas votre mot de passe GitHub)

### Créer un Personal Access Token

1. Allez sur : https://github.com/settings/tokens
2. Cliquez sur **"Generate new token"** > **"Generate new token (classic)"**
3. Nom : `La-Plume-Artisanale`
4. Cochez : `repo` (toutes les permissions)
5. Cliquez sur **"Generate token"**
6. **Copiez le token** (vous ne le reverrez plus !)
7. Utilisez-le comme mot de passe lors du `git push`

## ✅ Vérification

Après le push, allez sur : https://github.com/Sghaier-h/La-Plume-Artisanale

Vous devriez voir tous vos fichiers ! 🎉

## 📊 Statut actuel

- ✅ Git initialisé
- ✅ Tous les fichiers ajoutés
- ✅ Commit créé
- ✅ Remote GitHub configuré
- ✅ Branche main configurée
- ⏳ **En attente** : Push vers GitHub (nécessite authentification)


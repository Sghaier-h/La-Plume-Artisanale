# 🚀 Configuration GitHub - La Plume Artisanale

## ✅ Repository créé

**URL** : `https://github.com/Sghaier-h/La-Plume-Artisanale.git`

---

## ⚠️ IMPORTANT : Avant de cloner

**Le dossier `La-Plume-Artisanale` doit être VIDE ou ne contenir QUE vos fichiers de projet.**

Si GitHub Desktop détecte un dossier `.git`, supprimez-le d'abord :

```powershell
# Supprimer le dossier .git s'il existe
Remove-Item -Path "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\.git" -Recurse -Force -ErrorAction SilentlyContinue
```

---

## 📦 Option 1 : Avec GitHub Desktop (Recommandé - Plus simple)

### Étape 1 : Installer GitHub Desktop

1. Téléchargez : https://desktop.github.com/
2. Installez et connectez-vous avec votre compte GitHub

### Étape 2 : Cloner le repository dans le bon dossier

1. Ouvrez GitHub Desktop
2. Cliquez sur **"File"** > **"Clone Repository"**
3. Onglet **"URL"**
4. Collez : `https://github.com/Sghaier-h/La-Plume-Artisanale.git`
5. **IMPORTANT** : Choisissez le dossier : `D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale`
   - Cliquez sur "Choose..." et naviguez jusqu'à ce dossier
   - **ATTENTION** : Si le dossier contient déjà des fichiers, GitHub Desktop va les fusionner
6. Cliquez sur **"Clone"**

### Étape 3 : Si le dossier contient déjà des fichiers

Si votre dossier `La-Plume-Artisanale` contient déjà vos fichiers :

1. **Option A** : Cloner dans un dossier temporaire, puis copier
   - Clonez dans `D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale-temp`
   - Copiez tous les fichiers de `La-Plume-Artisanale` vers `La-Plume-Artisanale-temp`
   - Supprimez `La-Plume-Artisanale`
   - Renommez `La-Plume-Artisanale-temp` en `La-Plume-Artisanale`

2. **Option B** : Initialiser Git dans le dossier existant (voir Option 2 ci-dessous)

### Étape 4 : Vérifier les fichiers

1. GitHub Desktop devrait détecter tous les fichiers du projet
2. Dans la zone de gauche, vous devriez voir :
   - ✅ `backend/`
   - ✅ `frontend/`
   - ✅ `database/`
   - ✅ `mobile/`
   - ✅ `scripts/`
   - ✅ `README.md`
   - ✅ Et tous les autres fichiers

### Étape 5 : Ajouter et commiter

1. Si les fichiers ne sont pas automatiquement détectés, cliquez sur **"Repository"** > **"Show in Explorer"**
2. Vérifiez que vous êtes bien dans `D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale`
3. Dans GitHub Desktop, tous les fichiers devraient apparaître
4. En bas, écrivez un message : `Initial commit - ERP ALL BY FOUTA / La Plume Artisanale`
5. Cliquez sur **"Commit to main"**

### Étape 6 : Pousser sur GitHub

1. Cliquez sur **"Push origin"** en haut
2. ✅ C'est fait ! Votre code est sur GitHub

---

## 💻 Option 2 : Avec Git en ligne de commande (Si le dossier contient déjà des fichiers)

### Étape 1 : Installer Git

1. Téléchargez : https://git-scm.com/download/win
2. Installez (gardez les options par défaut)
3. Redémarrez PowerShell/Terminal

### Étape 2 : Aller dans le bon dossier

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
```

### Étape 3 : Vérifier qu'il n'y a pas de .git existant

```powershell
# Vérifier
Test-Path .git

# Si True, supprimer
Remove-Item -Path .git -Recurse -Force
```

### Étape 4 : Initialiser Git

```powershell
git init
```

### Étape 5 : Configurer Git (première fois)

```powershell
git config --global user.name "Votre Nom"
git config --global user.email "votre-email@example.com"
```

### Étape 6 : Ajouter tous les fichiers

```powershell
git add .
```

### Étape 7 : Premier commit

```powershell
git commit -m "Initial commit - ERP ALL BY FOUTA / La Plume Artisanale"
```

### Étape 8 : Configurer le remote GitHub

```powershell
git remote add origin https://github.com/Sghaier-h/La-Plume-Artisanale.git
```

### Étape 9 : Pousser sur GitHub

```powershell
git branch -M main
git push -u origin main
```

**Note** : GitHub vous demandera vos identifiants (username + Personal Access Token)

---

## 🔑 Créer un Personal Access Token (si nécessaire)

Si Git vous demande un mot de passe :

1. Allez sur : https://github.com/settings/tokens
2. Cliquez sur **"Generate new token"** > **"Generate new token (classic)"**
3. Nom : `La-Plume-Artisanale`
4. Cochez : `repo` (toutes les permissions)
5. Cliquez sur **"Generate token"**
6. **Copiez le token** (vous ne le reverrez plus !)
7. Utilisez-le comme mot de passe lors du `git push`

---

## ✅ Vérification

Allez sur : https://github.com/Sghaier-h/La-Plume-Artisanale

Vous devriez voir tous vos fichiers ! 🎉

---

## 🔄 Mise à jour future

### Avec GitHub Desktop :
1. Faites vos modifications dans `D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale`
2. GitHub Desktop détecte les changements
3. Écrivez un message de commit
4. Cliquez sur **"Commit to main"**
5. Cliquez sur **"Push origin"**

### Avec Git en ligne de commande :
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
git add .
git commit -m "Description des modifications"
git push
```

---

## 🚀 Déploiement sur OVH

Une fois le code sur GitHub, sur votre serveur OVH :

```bash
ssh root@votre-serveur-ovh.com
apt update && apt install -y git
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/scripts/install-ovh.sh)
```

Le script vous demandera l'URL du repository, entrez :
```
https://github.com/Sghaier-h/La-Plume-Artisanale.git
```

---

## 📝 Fichiers ignorés

Les fichiers suivants ne seront **PAS** poussés sur GitHub (c'est normal) :
- `node_modules/` (dépendances)
- `.env` (configurations sensibles)
- `*.log` (fichiers de logs)
- `build/`, `dist/` (fichiers compilés)

C'est configuré dans `.gitignore` pour la sécurité.

---

## 🆘 Problèmes courants

### "Repository not found"
- Vérifiez que l'URL est correcte
- Vérifiez que vous avez les droits d'accès

### "Authentication failed"
- Utilisez un Personal Access Token au lieu du mot de passe
- Vérifiez que le token a les permissions `repo`

### GitHub Desktop ne détecte que .git
- **Solution** : Supprimez le dossier `.git` dans `La-Plume-Artisanale`
- Puis clonez à nouveau, ou initialisez Git dans le dossier existant

### GitHub Desktop ne détecte rien
- Vérifiez que vous avez cloné dans le bon dossier : `D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale`
- Vérifiez que les fichiers sont bien dans ce dossier
- Essayez de fermer et rouvrir GitHub Desktop

### Le dossier contient déjà des fichiers
- Utilisez l'**Option 2** (Git en ligne de commande) pour initialiser Git dans le dossier existant
- Ou clonez dans un dossier vide, puis copiez vos fichiers

---

## 🎯 Prochaines étapes

1. ✅ Supprimer le dossier `.git` s'il existe
2. ✅ Pousser le code sur GitHub
3. ✅ Tester le déploiement sur OVH
4. ✅ Configurer GitHub Actions (optionnel)
5. ✅ Inviter des collaborateurs (optionnel)

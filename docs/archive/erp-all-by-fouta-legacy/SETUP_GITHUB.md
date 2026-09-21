# 🚀 Configuration GitHub - La Plume Artisanale

## ✅ Repository créé

**URL** : `https://github.com/Sghaier-h/La-Plume-Artisanle.git`

---

## 📦 Option 1 : Avec GitHub Desktop (Recommandé - Plus simple)

### Étape 1 : Installer GitHub Desktop

1. Téléchargez : https://desktop.github.com/
2. Installez et connectez-vous avec votre compte GitHub

### Étape 2 : Cloner le repository

1. Ouvrez GitHub Desktop
2. Cliquez sur **"File"** > **"Clone Repository"**
3. Onglet **"URL"**
4. Collez : `https://github.com/Sghaier-h/La-Plume-Artisanle.git`
5. Choisissez le dossier : `D:\OneDrive - FLYING TEX\PROJET`
6. Cliquez sur **"Clone"**

### Étape 3 : Ajouter les fichiers

1. GitHub Desktop va détecter tous les fichiers
2. Dans la zone de gauche, cochez tous les fichiers
3. En bas, écrivez un message : `Initial commit - ERP ALL BY FOUTA`
4. Cliquez sur **"Commit to main"**

### Étape 4 : Pousser sur GitHub

1. Cliquez sur **"Push origin"** en haut
2. ✅ C'est fait ! Votre code est sur GitHub

---

## 💻 Option 2 : Avec Git en ligne de commande

### Étape 1 : Installer Git

1. Téléchargez : https://git-scm.com/download/win
2. Installez (gardez les options par défaut)
3. Redémarrez PowerShell/Terminal

### Étape 2 : Initialiser Git

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET"
git init
```

### Étape 3 : Configurer Git (première fois)

```powershell
git config --global user.name "Votre Nom"
git config --global user.email "votre-email@example.com"
```

### Étape 4 : Ajouter tous les fichiers

```powershell
git add .
```

### Étape 5 : Premier commit

```powershell
git commit -m "Initial commit - ERP ALL BY FOUTA / La Plume Artisanale"
```

### Étape 6 : Configurer le remote GitHub

```powershell
git remote add origin https://github.com/Sghaier-h/La-Plume-Artisanle.git
```

### Étape 7 : Pousser sur GitHub

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

Allez sur : https://github.com/Sghaier-h/La-Plume-Artisanle

Vous devriez voir tous vos fichiers ! 🎉

---

## 🔄 Mise à jour future

### Avec GitHub Desktop :
1. Faites vos modifications
2. GitHub Desktop détecte les changements
3. Écrivez un message de commit
4. Cliquez sur **"Commit to main"**
5. Cliquez sur **"Push origin"**

### Avec Git en ligne de commande :
```powershell
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
bash <(curl -s https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanle/main/scripts/install-ovh.sh)
```

Le script vous demandera l'URL du repository, entrez :
```
https://github.com/Sghaier-h/La-Plume-Artisanle.git
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

### "Large files"
- Si vous avez des fichiers > 100 MB, utilisez Git LFS
- Ou ajoutez-les dans `.gitignore`

---

## 🎯 Prochaines étapes

1. ✅ Pousser le code sur GitHub
2. ✅ Tester le déploiement sur OVH
3. ✅ Configurer GitHub Actions (optionnel)
4. ✅ Inviter des collaborateurs (optionnel)

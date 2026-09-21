# 📦 Guide GitHub - Déploiement OVH

## 🎯 Pourquoi GitHub ?

✅ **Plus simple** : Un seul `git clone` au lieu de transférer les fichiers  
✅ **Versioning** : Historique complet des modifications  
✅ **CI/CD** : Déploiement automatique possible  
✅ **Collaboration** : Plusieurs développeurs peuvent travailler  
✅ **Backup** : Code sauvegardé automatiquement  

## 📋 Étape 1 : Créer le repository GitHub

### 1.1 Créer un nouveau repository

1. Allez sur [GitHub.com](https://github.com)
2. Cliquez sur **"New repository"**
3. Nom : `fouta-erp` (ou votre choix)
4. Description : `ERP ALL BY FOUTA - Système de gestion de production`
5. Visibilité : **Private** (recommandé) ou **Public**
6. **Ne cochez pas** "Initialize with README" (le projet existe déjà)
7. Cliquez sur **"Create repository"**

### 1.2 Copier l'URL du repository

Vous obtiendrez une URL comme :
```
https://github.com/votre-username/fouta-erp.git
```

**Exemple réel** : `https://github.com/Sghaier-h/La-Plume-Artisanle.git`

## 📤 Étape 2 : Pousser le code sur GitHub

### Depuis votre machine locale

```bash
# Aller dans le dossier du projet
cd "D:\OneDrive - FLYING TEX\PROJET"

# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - ERP ALL BY FOUTA"

# Ajouter le remote GitHub
git remote add origin https://github.com/votre-username/fouta-erp.git

# Pousser sur GitHub
git branch -M main
git push -u origin main
```

### Si vous avez déjà un repository Git

```bash
# Vérifier le remote
git remote -v

# Si besoin, changer l'URL
git remote set-url origin https://github.com/votre-username/fouta-erp.git

# Pousser
git push -u origin main
```

## 🚀 Étape 3 : Installation sur OVH avec GitHub

### 3.1 Se connecter au serveur OVH

```bash
ssh root@votre-serveur-ovh.com
```

### 3.2 Exécuter le script d'installation

```bash
# Installer Git (si pas déjà fait)
apt update
apt install -y git

# Télécharger le script d'installation
curl -o /tmp/install-ovh.sh https://raw.githubusercontent.com/votre-username/fouta-erp/main/scripts/install-ovh.sh

# Ou cloner le repo et exécuter
git clone https://github.com/votre-username/fouta-erp.git /tmp/fouta-erp
chmod +x /tmp/fouta-erp/scripts/install-ovh.sh
sudo bash /tmp/fouta-erp/scripts/install-ovh.sh
```

Le script va vous demander :
- L'URL du repository GitHub
- Le mot de passe PostgreSQL
- Le JWT Secret
- Les domaines

## 🔄 Étape 4 : Mise à jour automatique

### Option 1 : Mise à jour manuelle

```bash
# Sur le serveur OVH
cd /var/www/fouta-erp
bash scripts/deploy.sh
```

### Option 2 : Mise à jour automatique avec GitHub Actions

1. Allez dans **Settings** > **Secrets and variables** > **Actions**
2. Ajoutez les secrets :
   - `SSH_HOST` : IP de votre serveur OVH
   - `SSH_USER` : `root` ou votre utilisateur
   - `SSH_KEY` : Votre clé SSH privée

3. Décommentez la section SSH dans `.github/workflows/deploy.yml`

4. À chaque push sur `main`, le déploiement se fera automatiquement !

## 📝 Workflow de développement

### 1. Faire des modifications

```bash
# Créer une branche
git checkout -b feature/ma-nouvelle-fonctionnalite

# Faire vos modifications
# ...

# Commiter
git add .
git commit -m "Ajout de la fonctionnalité X"

# Pousser
git push origin feature/ma-nouvelle-fonctionnalite
```

### 2. Créer une Pull Request

1. Allez sur GitHub
2. Cliquez sur **"Compare & pull request"**
3. Décrivez vos modifications
4. Demandez une review
5. Une fois approuvée, mergez dans `main`

### 3. Déploiement automatique

Une fois mergé dans `main`, le déploiement se fait automatiquement (si configuré).

## 🔐 Sécurité GitHub

### Utiliser SSH au lieu de HTTPS

```bash
# Générer une clé SSH
ssh-keygen -t ed25519 -C "votre-email@example.com"

# Copier la clé publique
cat ~/.ssh/id_ed25519.pub

# Ajouter sur GitHub : Settings > SSH and GPG keys > New SSH key
```

### Utiliser un Personal Access Token

Pour HTTPS, créez un token :
1. GitHub > Settings > Developer settings > Personal access tokens
2. Générer un token avec les permissions `repo`
3. Utiliser le token comme mot de passe

## 📊 Branches recommandées

```
main          → Production (déploiement automatique)
develop       → Développement
feature/*     → Nouvelles fonctionnalités
bugfix/*      → Corrections de bugs
hotfix/*      → Corrections urgentes en production
```

## ✅ Checklist

- [ ] Repository GitHub créé
- [ ] Code poussé sur GitHub
- [ ] Serveur OVH configuré avec Git
- [ ] Script d'installation testé
- [ ] Déploiement manuel testé
- [ ] GitHub Actions configuré (optionnel)
- [ ] Secrets configurés (optionnel)
- [ ] Documentation à jour

## 🆘 Dépannage

### Erreur : "Permission denied"

```bash
# Vérifier les permissions
ls -la /var/www/fouta-erp

# Corriger
sudo chown -R $USER:$USER /var/www/fouta-erp
```

### Erreur : "Repository not found"

Vérifiez que :
- L'URL du repository est correcte
- Vous avez les droits d'accès
- Le repository n'est pas privé (ou utilisez un token)

### Erreur : "Could not resolve hostname"

```bash
# Vérifier la connexion
ping github.com

# Vérifier DNS
nslookup github.com
```

## 🔗 Ressources

- [Documentation GitHub](https://docs.github.com)
- [Git Basics](https://git-scm.com/book)
- [GitHub Actions](https://docs.github.com/en/actions)


# 🔧 Solution : Cloner le Repository GitHub

## ❌ Problème : Authentication failed

Le repository nécessite une authentification. Voici plusieurs solutions :

---

## 🚀 Solution 1 : Utiliser un Personal Access Token

### Étape 1 : Créer un token GitHub

1. Allez sur : https://github.com/settings/tokens
2. Cliquez sur **"Generate new token"** > **"Generate new token (classic)"**
3. Nom : `La-Plume-Artisanale-Deploy`
4. Cochez : `repo` (toutes les permissions)
5. Cliquez sur **"Generate token"**
6. **Copiez le token** (vous ne le reverrez plus !)

### Étape 2 : Cloner avec le token

```bash
# Remplacez VOTRE_TOKEN par le token que vous avez créé
git clone https://VOTRE_TOKEN@github.com/Sghaier-h/La-Plume-Artisanale.git
```

**Exemple** :
```bash
git clone https://ghp_xxxxxxxxxxxxxxxxxxxx@github.com/Sghaier-h/La-Plume-Artisanale.git
```

---

## 🚀 Solution 2 : Rendre le Repository Public (Temporairement)

1. Allez sur : https://github.com/Sghaier-h/La-Plume-Artisanale
2. Cliquez sur **"Settings"**
3. Allez dans **"General"** > **"Danger Zone"**
4. Cliquez sur **"Change visibility"** > **"Make public"**
5. Confirmez

Ensuite, clonez normalement :

```bash
git clone https://github.com/Sghaier-h/La-Plume-Artisanale.git
```

**⚠️ Important** : Vous pourrez le remettre en privé après le déploiement.

---

## 🚀 Solution 3 : Utiliser SSH (si vous avez une clé SSH)

### Étape 1 : Générer une clé SSH sur le serveur

```bash
ssh-keygen -t ed25519 -C "deploy@fabrication.laplume-artisanale.tn"
# Appuyez sur Entrée pour accepter les valeurs par défaut
```

### Étape 2 : Afficher la clé publique

```bash
cat ~/.ssh/id_ed25519.pub
```

### Étape 3 : Ajouter la clé sur GitHub

1. Copiez la clé affichée
2. Allez sur : https://github.com/settings/keys
3. Cliquez sur **"New SSH key"**
4. Collez la clé
5. Cliquez sur **"Add SSH key"**

### Étape 4 : Cloner avec SSH

```bash
git clone git@github.com:Sghaier-h/La-Plume-Artisanale.git
```

---

## 🚀 Solution 4 : Télécharger le ZIP (Plus simple)

### Étape 1 : Télécharger depuis GitHub

1. Allez sur : https://github.com/Sghaier-h/La-Plume-Artisanale
2. Cliquez sur **"Code"** > **"Download ZIP"**
3. Téléchargez le fichier

### Étape 2 : Transférer via FTP

1. Utilisez FileZilla pour transférer le ZIP sur le serveur
2. Dans FileZilla :
   - **Hôte** : `ftp.cluster130.hosting.ovh.net`
   - **Utilisateur** : `allbyfb`
   - **Mot de passe** : `Allbyfouta007`

### Étape 3 : Décompresser sur le serveur

```bash
# Via le terminal web OVH ou SSH
unzip La-Plume-Artisanale-main.zip
cd La-Plume-Artisanale-main
bash deploy-simple.sh
```

---

## 🚀 Solution 5 : Créer le script directement (Recommandé)

Puisque le clonage ne fonctionne pas, créons le script directement sur le serveur :

```bash
# Créer le dossier
mkdir -p La-Plume-Artisanale
cd La-Plume-Artisanale

# Créer le script de déploiement
nano deploy.sh
```

Puis copiez-collez le contenu du script depuis `COPIER_COLLER_DEPLOIEMENT.md`.

---

## ✅ Solution la plus rapide

**Utilisez le Personal Access Token** (Solution 1) - c'est la plus rapide :

```bash
git clone https://VOTRE_TOKEN@github.com/Sghaier-h/La-Plume-Artisanale.git
cd La-Plume-Artisanale
bash deploy-simple.sh
```

---

## 📋 Checklist

- [ ] Créer un Personal Access Token GitHub
- [ ] Cloner avec le token
- [ ] Exécuter le script de déploiement

---

## 🆘 Si rien ne fonctionne

Contactez-moi et je vous donnerai le script complet à copier-coller directement sur le serveur.


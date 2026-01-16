# 🔧 Activer Git sur OVH

## ✅ Oui, activez Git !

Si Git est inactif sur votre hébergement OVH, activez-le pour pouvoir cloner le repository.

---

## 🚀 Comment activer Git sur OVH

### Méthode 1 : Via le panneau OVH

1. **Connectez-vous** à votre espace client OVH : https://www.ovh.com/manager/
2. Allez dans **"Web Cloud"** > **"Hébergements"**
3. Cliquez sur votre hébergement : `fabrication.laplume-artisanale.tn`
4. Allez dans l'onglet **"FTP - SSH"** ou **"Git"**
5. Cliquez sur **"Activer Git"** ou **"Créer un dépôt Git"**
6. Suivez les instructions

### Méthode 2 : Via le terminal SSH

Une fois Git activé, vous pouvez vérifier :

```bash
git --version
```

---

## 📋 Après activation de Git

### 1. Cloner le repository

```bash
# Avec token GitHub
git clone https://VOTRE_TOKEN@github.com/Sghaier-h/La-Plume-Artisanale.git

# Ou avec SSH (si vous avez configuré une clé)
git clone git@github.com:Sghaier-h/La-Plume-Artisanale.git
```

### 2. Aller dans le dossier

```bash
cd La-Plume-Artisanale
```

### 3. Exécuter le script

```bash
bash deploy-simple.sh
```

---

## 🔑 Créer un Personal Access Token GitHub

Si vous n'avez pas encore de token :

1. Allez sur : https://github.com/settings/tokens
2. Cliquez sur **"Generate new token"** > **"Generate new token (classic)"**
3. Nom : `La-Plume-Artisanale-Deploy`
4. Cochez : `repo` (toutes les permissions)
5. Cliquez sur **"Generate token"**
6. **Copiez le token** (vous ne le reverrez plus !)

### Utiliser le token

```bash
git clone https://ghp_VOTRE_TOKEN@github.com/Sghaier-h/La-Plume-Artisanale.git
```

**Remplacez** `ghp_VOTRE_TOKEN` par votre token.

---

## ⚠️ Si Git n'est pas disponible sur l'hébergement partagé

Si OVH ne permet pas d'activer Git sur votre type d'hébergement (hébergement partagé), utilisez une alternative :

### Alternative 1 : Télécharger le ZIP

1. Allez sur : https://github.com/Sghaier-h/La-Plume-Artisanale
2. Cliquez sur **"Code"** > **"Download ZIP"**
3. Transférez le ZIP via FTP
4. Décompressez sur le serveur

### Alternative 2 : Télécharger uniquement le script

```bash
curl -o deploy.sh https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-simple.sh
chmod +x deploy.sh
bash deploy.sh
```

---

## ✅ Checklist

- [ ] Activer Git dans le panneau OVH
- [ ] Vérifier que Git fonctionne : `git --version`
- [ ] Créer un Personal Access Token GitHub
- [ ] Cloner le repository avec le token
- [ ] Exécuter le script de déploiement

---

## 🎯 Résumé

**Oui, activez Git** si c'est disponible dans votre panneau OVH. Cela facilitera grandement le déploiement et les mises à jour futures.

Une fois activé, vous pourrez cloner le repository et exécuter le script de déploiement automatique.

---

## 🆘 Si Git ne peut pas être activé

Utilisez la méthode de téléchargement direct du script (Alternative 2 ci-dessus) - c'est la solution la plus simple et elle fonctionne sans Git.


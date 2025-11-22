# 🔧 Configuration Git OVH - Guide Complet

## 📋 Informations à Renseigner

### Dépôt Git

**URL HTTPS** (pour dépôt public) :
```
https://github.com/Sghaier-h/La-Plume-Artisanale.git
```

**OU URL SSH** (pour dépôt privé) :
```
git@github.com:Sghaier-h/La-Plume-Artisanale.git
```

### Branche

```
main
```

---

## 🚀 Configuration Étape par Étape

### 1. Dans le panneau OVH

1. **Dépôt** : Entrez `https://github.com/Sghaier-h/La-Plume-Artisanale.git`
2. **Branche** : Entrez `main`
3. Cliquez sur **"Valider"** ou **"Configurer"**

### 2. Vérifier que le répertoire est vide

OVH vous indiquera si le répertoire doit être vide. Si ce n'est pas le cas, videz-le d'abord.

---

## 🔗 Configuration du Webhook GitHub

### Étape 1 : Copier l'URL du webhook

Copiez cette URL depuis OVH :
```
https://webhooks-webhosting.eu.ovhapis.com/1.0/vcs/github/push/eyJhbGciOiJFZERTQSIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJnaXRodWIvc2gxMzE2MTYtb3ZoIiwiZXhwIjoyNTI0NjA3OTk5LCJqdGkiOiI2YTQ3YTYxMjMwOTZmNjk3NjdjYWNmNWY2MTFhNTlmNTIxMWE5OWUxIiwidmVyc2lvbiI6MSwibmFtZSI6ImFsbGJ5ZmIuY2x1c3RlcjAzMC5ob3N0aW5nLm92aC5uZXQiLCJwYXRoIjoiZmFicmljYXRpb24iLCJjb3VudGVyIjowfQ.6d6cRjlQ91OvOpV_tuX-pJLTyu1wLuGdbjIs-FaMvMoDhnNCpidmRvDR6KAnEXBzBFmEQoDmD0Bk0_pQGTypAA
```

### Étape 2 : Ajouter le webhook sur GitHub

1. Allez sur : https://github.com/Sghaier-h/La-Plume-Artisanale/settings/hooks
2. Cliquez sur **"Add webhook"**
3. **Payload URL** : Collez l'URL du webhook OVH
4. **Content type** : `application/json`
5. **Which events** : Sélectionnez **"Just the push event"**
6. Cliquez sur **"Add webhook"**

---

## ✅ Après la Configuration

### 1. Vérifier le déploiement

OVH va automatiquement cloner votre repository dans le répertoire d'installation.

### 2. Accéder aux fichiers

Les fichiers seront disponibles dans le répertoire configuré (probablement `/home/allbyfb/fabrication` ou similaire).

### 3. Exécuter le script de déploiement

Une fois les fichiers déployés :

```bash
# Aller dans le répertoire
cd ~/fabrication
# ou
cd /home/allbyfb/fabrication

# Vérifier que les fichiers sont là
ls -la

# Exécuter le script
bash deploy-simple.sh
```

---

## 🔄 Déploiement Automatique

Une fois le webhook configuré, **chaque fois que vous pousserez du code sur GitHub**, OVH le déploiera automatiquement sur votre serveur !

### Tester le déploiement automatique

1. Faites une modification dans votre code local
2. Poussez sur GitHub :
   ```bash
   git add .
   git commit -m "Test déploiement"
   git push
   ```
3. OVH déploiera automatiquement les changements

---

## 📋 Résumé des Informations

| Champ | Valeur |
|-------|--------|
| **Dépôt** | `https://github.com/Sghaier-h/La-Plume-Artisanale.git` |
| **Branche** | `main` |
| **Webhook URL** | (Copiez depuis OVH) |

---

## 🆘 Problèmes Courants

### "Le répertoire n'est pas vide"

```bash
# Vider le répertoire
rm -rf ~/fabrication/*
# ou
rm -rf /home/allbyfb/fabrication/*
```

### "Authentication failed"

Si le repository est privé, vous devrez :
1. Utiliser l'URL SSH : `git@github.com:Sghaier-h/La-Plume-Artisanale.git`
2. Ajouter la clé SSH OVH sur GitHub

### Le webhook ne fonctionne pas

1. Vérifiez que l'URL est correcte
2. Vérifiez que le webhook est actif sur GitHub
3. Testez en poussant un commit

---

## ✅ Checklist

- [ ] Dépôt configuré : `https://github.com/Sghaier-h/La-Plume-Artisanale.git`
- [ ] Branche configurée : `main`
- [ ] Répertoire vide
- [ ] Webhook ajouté sur GitHub
- [ ] Fichiers déployés automatiquement
- [ ] Script de déploiement exécuté

---

## 🎯 Prochaines Étapes

1. ✅ Configurer le dépôt dans OVH
2. ✅ Ajouter le webhook sur GitHub
3. ✅ Vérifier que les fichiers sont déployés
4. ✅ Exécuter le script `deploy-simple.sh`
5. ✅ Votre application sera en ligne !

---

## 💡 Astuce

Une fois configuré, vous n'aurez plus besoin de vous connecter en SSH pour mettre à jour le code. Il suffira de pousser sur GitHub et OVH déploiera automatiquement !


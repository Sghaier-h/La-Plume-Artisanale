# 🔗 Configurer le Webhook GitHub - Guide Étape par Étape

## ✅ Vous avez l'URL du webhook OVH !

Voici comment l'ajouter sur GitHub :

---

## 🚀 Étape 1 : Aller sur les paramètres du repository

1. Allez sur : https://github.com/Sghaier-h/La-Plume-Artisanale
2. Cliquez sur **"Settings"** (en haut à droite)
3. Dans le menu de gauche, cliquez sur **"Webhooks"**

---

## 🚀 Étape 2 : Ajouter le webhook

1. Cliquez sur **"Add webhook"** (bouton vert en haut à droite)

2. **Payload URL** : Collez cette URL exactement :
   ```
   https://webhooks-webhosting.eu.ovhapis.com/1.0/vcs/github/push/eyJhbGciOiJFZERTQSIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJnaXRodWIvc2gxMzE2MTYtb3ZoIiwiZXhwIjoyNTI0NjA3OTk5LCJqdGkiOiI2YTQ3YTYxMjMwOTZmNjk3NjdjYWNmNWY2MTFhNTlmNTIxMWE5OWUxIiwidmVyc2lvbiI6MSwibmFtZSI6ImFsbGJ5ZmIuY2x1c3RlcjAzMC5ob3N0aW5nLm92aC5uZXQiLCJwYXRoIjoiZmFicmljYXRpb24iLCJjb3VudGVyIjowfQ.6d6cRjlQ91OvOpV_tuX-pJLTyu1wLuGdbjIs-FaMvMoDhnNCpidmRvDR6KAnEXBzBFmEQoDmD0Bk0_pQGTypAA
   ```

3. **Content type** : Sélectionnez `application/json`

4. **Which events would you like to trigger this webhook?** :
   - Sélectionnez **"Just the push event"** (recommandé)
   - OU **"Send me everything"** (si vous voulez tous les événements)

5. **Active** : Cochez la case (elle devrait être cochée par défaut)

6. Cliquez sur **"Add webhook"** (bouton vert en bas)

---

## ✅ Étape 3 : Vérifier que le webhook fonctionne

Après avoir ajouté le webhook, GitHub va :
1. Envoyer un test (ping) au webhook
2. Vous verrez une coche verte ✅ si ça fonctionne
3. Vous verrez une croix rouge ❌ si ça ne fonctionne pas

---

## 🧪 Tester le déploiement automatique

### Option 1 : Faire un petit changement

1. Modifiez un fichier dans votre repository local
2. Commitez et poussez :
   ```bash
   git add .
   git commit -m "Test déploiement automatique"
   git push
   ```
3. OVH devrait automatiquement déployer les changements

### Option 2 : Redéclencher le webhook

1. Allez sur la page des webhooks : https://github.com/Sghaier-h/La-Plume-Artisanale/settings/hooks
2. Cliquez sur votre webhook
3. Cliquez sur **"Recent Deliveries"**
4. Cliquez sur le dernier événement
5. Cliquez sur **"Redeliver"** pour redéclencher

---

## 📋 Résumé de la Configuration

| Élément | Valeur |
|---------|--------|
| **Payload URL** | `https://webhooks-webhosting.eu.ovhapis.com/1.0/vcs/github/push/...` |
| **Content type** | `application/json` |
| **Events** | `Just the push event` |
| **Active** | ✅ Oui |

---

## ✅ Après la Configuration

Une fois le webhook configuré :

1. **OVH va cloner automatiquement** votre repository
2. **Chaque `git push`** déclenchera un déploiement automatique
3. **Plus besoin de vous connecter en SSH** pour mettre à jour le code !

---

## 🔍 Vérifier que les fichiers sont déployés

Connectez-vous en SSH et vérifiez :

```bash
ssh allbyfb@ssh.cluster130.hosting.ovh.net

# Aller dans le répertoire de déploiement
cd ~/fabrication
# ou le répertoire indiqué par OVH

# Vérifier les fichiers
ls -la

# Si les fichiers sont là, exécuter le script
bash deploy-simple.sh
```

---

## 🆘 Problèmes Courants

### Le webhook ne se déclenche pas

1. Vérifiez que l'URL est correcte (copiez-collez exactement)
2. Vérifiez que le webhook est actif (coche verte)
3. Vérifiez les "Recent Deliveries" pour voir les erreurs

### Les fichiers ne sont pas déployés

1. Vérifiez que Git est bien configuré dans OVH
2. Vérifiez que le repository est accessible
3. Vérifiez les logs dans OVH

---

## 🎉 Félicitations !

Une fois le webhook configuré, votre déploiement sera **100% automatique** !

Chaque fois que vous pousserez du code sur GitHub, OVH le déploiera automatiquement sur votre serveur.

---

## 📝 Prochaines Étapes

1. ✅ Ajouter le webhook sur GitHub (vous êtes en train de le faire)
2. ⏳ Vérifier que les fichiers sont déployés par OVH
3. ⏳ Se connecter en SSH et exécuter `deploy-simple.sh`
4. ⏳ Votre application sera en ligne !


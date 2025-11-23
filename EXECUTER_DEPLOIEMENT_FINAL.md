# 🚀 Exécuter le Déploiement Final - Une Seule Commande

## ✅ Script Automatique Créé !

J'ai créé un script qui fait **TOUT automatiquement** avec vos identifiants.

---

## 🚀 Exécution en 1 Commande

### Sur le Serveur SSH

```bash
cd ~/la-plume-artisanale
curl -o deploy-final.sh https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-final.sh
chmod +x deploy-final.sh
bash deploy-final.sh VOTRE_MOT_DE_PASSE_AVIATEUR
```

**Remplacez** `VOTRE_MOT_DE_PASSE_AVIATEUR` par le mot de passe de l'utilisateur Aviateur.

---

## 📋 Ce que le Script Fait Automatiquement

1. ✅ Vérifie Node.js et Git
2. ✅ Clone le projet depuis GitHub
3. ✅ Configure le fichier `.env` avec vos identifiants OVH
4. ✅ Installe les dépendances npm
5. ✅ Initialise la base de données PostgreSQL
6. ✅ Installe PM2
7. ✅ Démarre l'application

**Tout est automatique !**

---

## 🔐 Sécurité du Mot de Passe

Le mot de passe est passé en argument, donc il n'apparaîtra pas dans l'historique des commandes.

---

## ✅ Après l'Exécution

Le script vous donnera :
- ✅ Statut PM2
- ✅ Commandes de vérification
- ✅ Informations de connexion

---

## 🧪 Tester

```bash
# Vérifier PM2
pm2 status

# Voir les logs
pm2 logs fouta-api

# Tester l'API
curl http://localhost:5000/health
```

---

## 🆘 Si Problème

### Erreur "psql: command not found"

Le script continuera quand même, mais vous devrez exécuter les scripts SQL manuellement :

```bash
cd ~/fouta-erp/database
export PGPASSWORD=VOTRE_MOT_DE_PASSE
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 01_base_et_securite.sql
# ... etc
```

### Erreur de connexion à la base

Vérifiez :
1. ✅ Le mot de passe est correct
2. ✅ L'IP `145.239.37.162` est autorisée
3. ✅ L'utilisateur `Aviateur` a tous les droits

---

## 🎯 Résumé

**Une seule commande** :
```bash
bash deploy-final.sh VOTRE_MOT_DE_PASSE_AVIATEUR
```

Et tout est fait automatiquement !

---

## 📝 Identifiants Utilisés

Le script utilise automatiquement :
- **Serveur** : `sh131616-002.eu.clouddb.ovh.net`
- **Port** : `35392`
- **Base** : `ERP_La_Plume`
- **Utilisateur** : `Aviateur`
- **Mot de passe** : (celui que vous passez en argument)

---

## 🎉 C'est Tout !

Exécutez la commande et votre application sera déployée automatiquement !


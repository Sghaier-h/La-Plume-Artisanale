# 🚀 Exécuter le Déploiement MAINTENANT

## ✅ Script Prêt avec Tous les Identifiants !

J'ai créé un script qui contient **tous vos identifiants** et qui fait **TOUT automatiquement**.

---

## 🚀 Exécution en 1 Commande

### Sur le Serveur SSH

```bash
cd ~/la-plume-artisanale
curl -o deploy.sh https://raw.githubusercontent.com/Sghaier-h/La-Plume-Artisanale/main/deploy-avec-password.sh
chmod +x deploy.sh
bash deploy.sh
```

**C'est tout !** Aucun mot de passe à entrer, tout est déjà configuré.

---

## 📋 Ce que le Script Fait

1. ✅ Vérifie Node.js et Git
2. ✅ Clone le projet depuis GitHub
3. ✅ Configure `.env` avec :
   - Serveur : `sh131616-002.eu.clouddb.ovh.net`
   - Port : `35392`
   - Base : `ERP_La_Plume`
   - Utilisateur : `Aviateur`
   - Mot de passe : `Allbyfouta007`
4. ✅ Installe les dépendances
5. ✅ Initialise la base de données
6. ✅ Installe PM2
7. ✅ Démarre l'application

**Tout automatique !**

---

## ✅ Après l'Exécution

```bash
# Vérifier PM2
pm2 status

# Voir les logs
pm2 logs fouta-api

# Tester l'API
curl http://localhost:5000/health
```

---

## 🎉 Votre API Sera Accessible Sur

- **https://fabrication.laplume-artisanale.tn**
- **http://145.239.37.162:5000**

---

## ⚠️ Sécurité

**Important** : Le mot de passe est dans le script pour faciliter le déploiement initial.

**Pour la production**, changez le mot de passe de l'utilisateur Aviateur dans PostgreSQL et mettez à jour le `.env`.

---

## 🆘 Si Problème

### Erreur "psql: command not found"

Le script continuera, mais vous devrez exécuter les scripts SQL manuellement :

```bash
cd ~/fouta-erp/database
export PGPASSWORD=Allbyfouta007
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 01_base_et_securite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 02_production_et_qualite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 03_flux_et_tracabilite.sql
psql -h sh131616-002.eu.clouddb.ovh.net -p 35392 -U Aviateur -d ERP_La_Plume -f 04_mobile_devices.sql
unset PGPASSWORD
```

### Erreur de connexion

Vérifiez que l'IP `145.239.37.162` est bien autorisée dans OVH.

---

## 🎯 Résumé

**Une seule commande** :
```bash
bash deploy.sh
```

Et votre ERP sera en ligne !

---

## 📝 Identifiants Configurés

- ✅ Serveur : `sh131616-002.eu.clouddb.ovh.net`
- ✅ Port : `35392`
- ✅ Base : `ERP_La_Plume`
- ✅ Utilisateur : `Aviateur`
- ✅ Mot de passe : `Allbyfouta007`
- ✅ IP autorisée : `145.239.37.162`

**Tout est prêt ! Exécutez la commande et c'est fait !** 🚀


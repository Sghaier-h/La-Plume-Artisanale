# 📊 Statut de l'Intégration TimeMoto

## ✅ Ce qui fonctionne

1. **Webhooks TimeMoto reçus** : Les événements `attendance.inserted` arrivent correctement au backend
2. **Endpoint opérationnel** : `/api/webhooks/timemoto/pointage` fonctionne
3. **Clé secrète configurée** : `TIMEMOTO_WEBHOOK_SECRET` est dans `backend/.env` et chargée
4. **TimeMoto confirme** : Tous les webhooks sont marqués "Completed" dans l'interface TimeMoto

## ❌ Problème actuel

**Connexion à la base de données** : `Connection terminated due to connection timeout`

### Causes possibles :
1. L'IP du serveur VPS (`137.74.40.191`) n'est pas autorisée dans OVH Cloud DB
2. Restrictions réseau/firewall OVH
3. Les tables de pointage n'existent pas encore (mais même si elles existaient, la connexion échouerait)

## 🔧 Actions à effectuer

### 1. Exécuter le schéma SQL (OBLIGATOIRE)

Puisque la connexion depuis le serveur ne fonctionne pas, vous devez exécuter le schéma SQL depuis votre machine locale :

#### Via pgAdmin (Recommandé)

1. **Télécharger pgAdmin** : https://www.pgadmin.org/download/
2. **Créer une connexion** :
   - Host: `sh131616-002.eu.clouddb.ovh.net`
   - Port: `35392`
   - Database: `ERP_La_Plume`
   - Username: `Aviateur`
   - Password: (celui dans `backend/.env`)
   - SSL Mode: `Require`
3. **Ouvrir le fichier** : `backend/database/schema_pointage.sql`
4. **Exécuter le script** (F5)

Le schéma va créer :
- Table `pointage` : Stocke chaque présence/absence
- Table `pointage_resume` : Résumé mensuel automatique
- Colonnes dans `equipe` : `timemoto_user_id`, `temps_travaille_mois`
- Fonction et trigger pour calcul automatique
- Vue `v_pointage_detail`

### 2. Autoriser l'IP du serveur dans OVH Cloud DB (RECOMMANDÉ)

Pour que le backend puisse se connecter à la base de données :

1. **Se connecter au panneau OVH** : https://www.ovh.com/manager/
2. **Aller dans Cloud DB** > Votre base de données (`ERP_La_Plume`)
3. **Section "Autoriser les IP"** ou "Restricted IPs"
4. **Ajouter l'IP du serveur VPS** : `137.74.40.191`
5. **Sauvegarder**

⚠️ **Note** : Cela peut prendre quelques minutes pour être effectif.

### 3. Vérifier après exécution

```bash
# Vérifier les tables via l'API
curl https://fabrication.laplume-artisanale.tn/api/database/verifier-tables-pointage | python3 -m json.tool

# Vérifier les logs (ne devrait plus y avoir d'erreurs)
pm2 logs fouta-api --lines 20 | grep -i webhook
```

## 📋 Après correction

Une fois les tables créées et l'IP autorisée :

1. ✅ Les webhooks TimeMoto enregistreront automatiquement les données
2. ✅ Les pointages seront calculés dans `pointage_resume`
3. ✅ Le temps travaillé mensuel sera mis à jour dans `equipe.temps_travaille_mois`
4. ✅ Les logs ne montreront plus d'erreurs de connexion

## 🔍 Vérification continue

Pour vérifier que tout fonctionne :

```bash
# Vérifier les tables
curl https://fabrication.laplume-artisanale.tn/api/database/verifier-tables-pointage | python3 -m json.tool

# Vérifier les logs webhooks
pm2 logs fouta-api --lines 50 | grep -i "webhook\|pointage"

# Vérifier les données de pointage
# (une fois les tables créées et la connexion fonctionnelle)
```

## 📚 Documentation

- Guide d'exécution du schéma : `docs/database/EXECUTER_SCHEMA_POINTAGE.md`
- Fichier SQL : `backend/database/schema_pointage.sql`
- Contrôleur webhook : `backend/src/controllers/webhooks.controller.js`

# ✅ Prochaines Étapes - Webhook TimeMoto Configuré

## 🎉 État Actuel

Votre webhook est **déjà configuré dans TimeMoto** avec :
- ✅ Name: `GPAO Pointage Integration`
- ✅ URL: `https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto/pointage`
- ✅ Status: `Active`
- ✅ Version: `V1`
- ✅ 6 événements sélectionnés
- ✅ Secret: `tmkey_ITbQcHWyShL8vSFW09IN81cPUpHBbGgS`

## 📋 Actions Restantes

### 1. Ajouter la clé secrète dans le fichier `.env`

Ajoutez cette ligne dans `backend/.env` :

```env
TIMEMOTO_WEBHOOK_SECRET=tmkey_ITbQcHWyShL8vSFW09IN81cPUpHBbGgS
```

**⚠️ Important** : Cette clé permet de vérifier que les webhooks viennent bien de TimeMoto. Ne la partagez jamais publiquement.

### 2. Créer les tables de base de données

Exécutez le script SQL :

```bash
# Via psql
psql -U Aviateur -d ERP_La_Plume -f La-Plume-Artisanale/backend/database/schema_pointage.sql

# Ou via pgAdmin :
# 1. Connectez-vous à la base ERP_La_Plume
# 2. Ouvrez le fichier backend/database/schema_pointage.sql
# 3. Exécutez le script
```

**Tables créées :**
- `pointage` : Stocke chaque présence/absence
- `pointage_resume` : Résumé mensuel automatique
- Colonnes ajoutées à `equipe` : `timemoto_user_id`, `temps_travaille_mois`

### 3. Redémarrer le serveur backend

```bash
# Pour charger la nouvelle variable d'environnement et la route webhook
pm2 restart votre-app
# ou
npm run dev
```

### 4. Tester l'endpoint

```bash
curl https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto/test
```

Vous devriez recevoir une réponse JSON confirmant que l'endpoint est opérationnel.

### 5. Vérifier les webhooks dans TimeMoto

Dans l'interface TimeMoto :
- La section **"Attempts"** (en bas de la page) affichera l'historique des tentatives
- Les webhooks réussis apparaîtront avec le statut "Success"
- Les échecs apparaîtront avec le statut "Failed" et le code d'erreur

### 6. Vérifier les logs backend

Les webhooks reçus seront loggés avec :
```
[Webhook TimeMoto] Événement reçu: attendance.inserted
[Webhook TimeMoto] Signature vérifiée avec succès
[Webhook] Nouvelle présence enregistrée pour user X, date YYYY-MM-DD
```

### 7. Vérifier dans l'application

- Allez dans **Ressources Humaines > Suivi Pointage**
- Les données de pointage apparaîtront automatiquement après le premier webhook reçu

## 🔍 Vérification Rapide

### Checklist :

- [x] Webhook créé dans TimeMoto ✅
- [x] URL correcte ✅
- [x] Status: Active ✅
- [x] 6 événements sélectionnés ✅
- [x] Secret récupéré ✅
- [ ] Clé secrète ajoutée au `.env`
- [ ] Tables de base de données créées
- [ ] Serveur backend redémarré
- [ ] Endpoint testé
- [ ] Premier webhook reçu (vérifier dans "Attempts")
- [ ] Données visibles dans l'interface

## 🛠️ Si les webhooks n'arrivent pas

1. **Vérifiez que l'endpoint répond** :
   ```bash
   curl https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto/test
   ```

2. **Vérifiez les logs du serveur** pour voir les erreurs

3. **Dans TimeMoto, section "Attempts"** :
   - Vous verrez l'historique des tentatives
   - Les erreurs afficheront le code HTTP et le message

4. **Vérifiez que les tables existent** :
   ```sql
   SELECT * FROM pointage LIMIT 1;
   ```

## 🎯 Résultat Attendu

Une fois tout configuré :
- ✅ Les présences TimeMoto apparaîtront automatiquement
- ✅ Les retards seront calculés automatiquement  
- ✅ Le temps travaillé mensuel sera mis à jour
- ✅ Les données seront visibles dans **Ressources Humaines > Suivi Pointage**

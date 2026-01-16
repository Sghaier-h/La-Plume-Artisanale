# ✅ Configuration Webhook TimeMoto - État Actuel

## 🎉 Configuration dans TimeMoto - TERMINÉE

D'après l'interface TimeMoto, votre webhook est correctement configuré :

### ✅ Paramètres Configurés :
- **Name** : `GPAO Pointage Integration` ✅
- **URL** : `https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto/pointage` ✅
- **Status** : `Active` ✅
- **Version** : `V1` ✅
- **Events** : 6 événements sélectionnés ✅
  - `user.inserted`
  - `user.updated`
  - `user.deleted`
  - `attendance.inserted`
  - `attendance.updated`
  - `attendance.deleted`
- **Secret** : `tmkey_ITbQcHWyShL8vSFW09IN81cPUpHBbGgS` ✅

## 🔐 Sécurisation du Webhook

### Ajouter la clé secrète dans votre backend

Pour sécuriser les webhooks et vérifier qu'ils viennent bien de TimeMoto, ajoutez la clé secrète dans votre fichier `.env` :

```env
TIMEMOTO_WEBHOOK_SECRET=tmkey_ITbQcHWyShL8vSFW09IN81cPUpHBbGgS
```

**Important** : Ne partagez jamais cette clé secrète publiquement !

## 📋 Prochaines Étapes

### 1. Ajouter la clé secrète au .env

```bash
# Dans backend/.env
TIMEMOTO_WEBHOOK_SECRET=tmkey_ITbQcHWyShL8vSFW09IN81cPUpHBbGgS
```

### 2. Créer les tables de base de données

Exécutez le script SQL :

```bash
psql -U Aviateur -d ERP_La_Plume -f La-Plume-Artisanale/backend/database/schema_pointage.sql
```

Ou via pgAdmin :
1. Connectez-vous à la base de données
2. Ouvrez le fichier `backend/database/schema_pointage.sql`
3. Exécutez le script

### 3. Redémarrer le serveur backend

```bash
# Pour charger la nouvelle variable d'environnement et la route webhook
pm2 restart votre-app
# ou
npm run dev
```

### 4. Tester l'endpoint

```bash
# Test de l'endpoint
curl https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto/test
```

Vous devriez recevoir :
```json
{
  "success": true,
  "message": "Endpoint webhook opérationnel",
  "timestamp": "2025-10-19T...",
  "instructions": { ... }
}
```

### 5. Vérifier les webhooks dans TimeMoto

Dans l'interface TimeMoto :
- Allez dans la section "Attempts" (en bas de la page du webhook)
- Vous verrez l'historique des tentatives d'envoi
- Les webhooks réussis apparaîtront avec le statut "Success"
- Les échecs apparaîtront avec le statut "Failed" et le code d'erreur

### 6. Vérifier les logs backend

```bash
# Les webhooks reçus seront loggés avec :
[Webhook TimeMoto] Événement reçu: attendance.inserted
[Webhook TimeMoto] Signature vérifiée avec succès
[Webhook] Nouvelle présence enregistrée pour user X, date YYYY-MM-DD
```

### 7. Vérifier dans l'application

- Allez dans **Ressources Humaines > Suivi Pointage**
- Les données de pointage apparaîtront automatiquement après le premier webhook reçu

## 🔍 Vérification de la Configuration

### Checklist :

- [x] Webhook créé dans TimeMoto
- [x] URL correcte : `https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto/pointage`
- [x] Status : Active
- [x] 6 événements sélectionnés
- [x] Secret récupéré : `tmkey_ITbQcHWyShL8vSFW09IN81cPUpHBbGgS`
- [ ] Clé secrète ajoutée au `.env`
- [ ] Tables de base de données créées
- [ ] Serveur backend redémarré
- [ ] Endpoint testé
- [ ] Premier webhook reçu (vérifier dans "Attempts")
- [ ] Données visibles dans l'interface

## 🛠️ Dépannage

### Si aucun webhook n'arrive dans "Attempts"

1. **Vérifiez que l'endpoint répond** :
   ```bash
   curl https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto/test
   ```

2. **Vérifiez les logs du serveur** :
   - Les erreurs de connexion seront visibles dans les logs

3. **Vérifiez le firewall** :
   - TimeMoto doit pouvoir accéder à votre serveur sur le port 443 (HTTPS)

4. **Testez avec un webhook manuel** :
   - TimeMoto peut avoir une option "Test webhook" ou "Send test"

### Si les webhooks arrivent mais échouent (statut "Failed")

1. **Vérifiez les logs backend** pour voir l'erreur exacte
2. **Vérifiez que les tables existent** :
   ```sql
   SELECT * FROM pointage LIMIT 1;
   ```
3. **Vérifiez que les utilisateurs existent** avec les emails correspondants

## 📊 Structure des Données

Les webhooks TimeMoto mettront à jour automatiquement :

- **Table `pointage`** : Chaque présence/absence
- **Table `pointage_resume`** : Résumé mensuel (calculé automatiquement)
- **Table `equipe`** : Temps travaillé mensuel mis à jour

## 🎯 Résultat Attendu

Une fois tout configuré :
- ✅ Les présences TimeMoto apparaîtront automatiquement dans votre système
- ✅ Les retards seront calculés automatiquement
- ✅ Le temps travaillé mensuel sera mis à jour
- ✅ Les données seront visibles dans **Ressources Humaines > Suivi Pointage**

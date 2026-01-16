# ✅ Actions à Effectuer pour Configurer les Webhooks TimeMoto

## 🎯 Étapes à Suivre

### 1️⃣ Dans TimeMoto (Interface que vous avez ouverte)

#### Configuration du Webhook :

1. **Name** : 
   ```
   GPAO Pointage Integration
   ```

2. **URL** : 
   ```
   https://votre-domaine-staging.com/api/webhooks/timemoto/pointage
   ```
   ⚠️ **Remplacez** `votre-domaine-staging.com` par votre vraie URL de staging/production
   
   **Exemple** : `https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto/pointage`

3. **Status** : 
   - Sélectionnez le bouton radio **"Active"** (orange)

4. **Version** : 
   - Dans le dropdown "Version", sélectionnez la version API la plus récente disponible

5. **Events** : 
   - Dans la liste de gauche, **cochez** ces événements :
     - ✅ `attendance.inserted`
     - ✅ `attendance.updated`
     - ✅ `attendance.deleted`
     - ✅ `user.inserted`
     - ✅ `user.updated`
     - ✅ `user.deleted`
   - Les événements sélectionnés apparaîtront dans le panneau de droite

6. **Save** : 
   - Cliquez sur le bouton orange **"Save"** en bas à droite

### 2️⃣ Dans votre Backend

#### A. Créer les tables de base de données

Exécutez le script SQL :

```bash
# Option 1 : Via psql
psql -U votre_user -d votre_database -f La-Plume-Artisanale/backend/database/schema_pointage.sql

# Option 2 : Via pgAdmin
# Ouvrez pgAdmin > Connectez-vous > Ouvrez le fichier schema_pointage.sql > Exécutez
```

#### B. Redémarrer le serveur backend

```bash
# Le serveur doit être redémarré pour charger la nouvelle route
npm run dev
# ou
pm2 restart votre-app
```

#### C. Tester l'endpoint

```bash
# Testez que l'endpoint répond
curl https://votre-domaine.com/api/webhooks/timemoto/test
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

### 3️⃣ Vérification

1. **Dans TimeMoto** :
   - Allez dans la section "Webhooks"
   - Vérifiez que votre webhook apparaît avec le statut "Active"
   - TimeMoto devrait envoyer un webhook de test

2. **Dans vos logs backend** :
   ```bash
   # Vous devriez voir des logs comme :
   [Webhook TimeMoto] Événement reçu: attendance.inserted
   ```

3. **Dans l'application** :
   - Allez dans **Ressources Humaines > Suivi Pointage**
   - Les données de pointage devraient apparaître automatiquement

## 📋 Checklist

- [ ] Webhook créé dans TimeMoto avec l'URL correcte
- [ ] Statut "Active" sélectionné
- [ ] Tous les événements cochés
- [ ] Script SQL exécuté (tables créées)
- [ ] Serveur backend redémarré
- [ ] Endpoint testé et répond correctement
- [ ] Premier webhook reçu (vérifier les logs)
- [ ] Données visibles dans l'interface

## 🔍 URLs à Utiliser

### Pour le Staging :
```
https://votre-staging.com/api/webhooks/timemoto/pointage
```

### Pour la Production :
```
https://votre-production.com/api/webhooks/timemoto/pointage
```

⚠️ **Important** : L'URL doit être accessible publiquement. TimeMoto ne peut pas accéder à `localhost` ou à une IP privée.

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs du serveur backend
2. Vérifiez les logs TimeMoto (section Webhooks > Historique)
3. Testez l'endpoint avec curl ou Postman
4. Vérifiez que les tables existent dans la base de données

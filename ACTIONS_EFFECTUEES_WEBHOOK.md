# ✅ Actions Effectuées - Configuration Webhook TimeMoto

## 🎉 Actions Terminées

### 1. ✅ Clé secrète ajoutée au fichier `.env`

La clé secrète TimeMoto a été ajoutée dans `backend/.env` :

```env
# TimeMoto Webhook Secret
TIMEMOTO_WEBHOOK_SECRET=tmkey_ITbQcHWyShL8vSFW09IN81cPUpHBbGgS
```

**Vérification :**
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
Select-String -Path .env -Pattern "TIMEMOTO"
```

### 2. ✅ Code backend mis à jour

Le contrôleur webhook (`backend/src/controllers/webhooks.controller.js`) a été mis à jour pour :
- Vérifier la signature des webhooks avec la clé secrète
- Logger les webhooks reçus
- Traiter les événements TimeMoto (attendance et user)

### 3. ✅ Script SQL prêt

Le script `backend/database/schema_pointage.sql` est prêt à être exécuté. Il créera :
- Table `pointage` : Stocke chaque présence/absence
- Table `pointage_resume` : Résumé mensuel automatique
- Colonnes ajoutées à `equipe` : `timemoto_user_id`, `temps_travaille_mois`
- Triggers et fonctions pour calculs automatiques
- Vue `v_pointage_detail` pour faciliter les requêtes

## 📋 Actions Restantes (à faire manuellement)

### 1. Exécuter le script SQL

**Option A : Via pgAdmin (recommandé)**

1. Connectez-vous à pgAdmin
2. Connectez-vous à la base de données `ERP_La_Plume`
3. Ouvrez le fichier `backend/database/schema_pointage.sql`
4. Exécutez le script (F5 ou bouton "Execute")

**Option B : Via Node.js (si le tunnel SSH est actif)**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
node executer-schema-pointage.js
```

**Option C : Via psql (si PostgreSQL est dans le PATH)**

```powershell
$env:PGPASSWORD="Allbyfouta007"
psql -h localhost -p 5433 -U Aviateur -d ERP_La_Plume -f database/schema_pointage.sql
```

### 2. Redémarrer le serveur backend

Pour charger la nouvelle variable d'environnement `TIMEMOTO_WEBHOOK_SECRET` :

```powershell
# Si vous utilisez PM2
pm2 restart votre-app

# Ou si vous utilisez npm
npm run dev
```

### 3. Tester l'endpoint

```powershell
# Test de l'endpoint webhook
curl https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto/test
```

Vous devriez recevoir une réponse JSON confirmant que l'endpoint est opérationnel.

### 4. Vérifier dans TimeMoto

Dans l'interface TimeMoto :
- Allez dans la section **"Attempts"** (en bas de la page du webhook)
- Vous verrez l'historique des tentatives d'envoi
- Les webhooks réussis apparaîtront avec le statut "Success"
- Les échecs montreront le code d'erreur HTTP

### 5. Vérifier les logs backend

Les webhooks reçus seront loggés avec :
```
[Webhook TimeMoto] Événement reçu: attendance.inserted
[Webhook TimeMoto] Signature vérifiée avec succès
[Webhook] Nouvelle présence enregistrée pour user X, date YYYY-MM-DD
```

### 6. Vérifier dans l'application

- Allez dans **Ressources Humaines > Suivi Pointage**
- Les données de pointage apparaîtront automatiquement après le premier webhook reçu

## 🔍 Checklist Complète

- [x] Webhook créé dans TimeMoto ✅
- [x] URL correcte : `https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto/pointage` ✅
- [x] Status: Active ✅
- [x] 6 événements sélectionnés ✅
- [x] Secret récupéré ✅
- [x] Clé secrète ajoutée au `.env` ✅
- [x] Code backend mis à jour ✅
- [ ] Tables de base de données créées ⏳
- [ ] Serveur backend redémarré ⏳
- [ ] Endpoint testé ⏳
- [ ] Premier webhook reçu (vérifier dans "Attempts") ⏳
- [ ] Données visibles dans l'interface ⏳

## 🛠️ Dépannage

### Si la connexion à la base de données échoue

1. **Vérifiez que le tunnel SSH est actif** :
   ```powershell
   # Vérifier les tunnels actifs
   netstat -an | findstr 5433
   ```

2. **Si le tunnel n'est pas actif, créez-le** :
   ```powershell
   cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
   .\tunnel-ssh.ps1
   ```

3. **Ou utilisez pgAdmin** pour exécuter le script SQL directement

### Si les webhooks n'arrivent pas

1. **Vérifiez que l'endpoint répond** :
   ```powershell
   curl https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto/test
   ```

2. **Vérifiez les logs du serveur** pour voir les erreurs

3. **Dans TimeMoto, section "Attempts"** :
   - Vous verrez l'historique des tentatives
   - Les erreurs afficheront le code HTTP et le message

## 📊 Résultat Attendu

Une fois toutes les actions terminées :
- ✅ Les présences TimeMoto apparaîtront automatiquement
- ✅ Les retards seront calculés automatiquement
- ✅ Le temps travaillé mensuel sera mis à jour
- ✅ Les données seront visibles dans **Ressources Humaines > Suivi Pointage**

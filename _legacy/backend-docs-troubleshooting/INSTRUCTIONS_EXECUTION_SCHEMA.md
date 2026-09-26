# 📋 Instructions pour Exécuter le Schéma de Pointage

## ✅ Méthode 1 : Via le Serveur de Production (Recommandé)

Si vous avez accès SSH au serveur de production :

1. **Connectez-vous au serveur** :
   ```bash
   ssh ubuntu@137.74.40.191
   ```

2. **Téléchargez le script de recherche automatique** (ou créez-le) :
   ```bash
   # Option A : Si le projet est déjà sur le serveur
   cd ~
   find . -name "executer-schema-production.js" -type f 2>/dev/null
   
   # Option B : Trouver le backend automatiquement
   find ~ -type d -name "backend" -path "*La-Plume-Artisanale*" 2>/dev/null
   ```

3. **Exécutez le script de recherche automatique** :
   ```bash
   # Si vous avez le script trouver-et-executer-schema.sh
   bash trouver-et-executer-schema.sh
   
   # OU trouvez manuellement le backend et exécutez :
   cd /opt/fouta-erp/backend  # ou le chemin trouvé
   node executer-schema-production.js
   ```

**Chemins possibles sur le serveur :**
- `/opt/fouta-erp/backend`
- `/var/www/fouta-erp/backend`
- `~/fouta-erp/backend`
- `~/La-Plume-Artisanale/backend`

Le script se connectera directement à la base de données de production et exécutera le schéma SQL.

## ✅ Méthode 2 : Via l'API (Après redémarrage du serveur)

1. **Redémarrez d'abord le serveur backend** pour charger la nouvelle route `/api/migration`

2. **Exécutez le script PowerShell** :
   ```powershell
   cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
   powershell -ExecutionPolicy Bypass -File executer-schema-via-api.ps1
   ```

## ✅ Méthode 3 : Via pgAdmin (Si disponible)

1. Connectez-vous à pgAdmin
2. Connectez-vous à la base de données `ERP_La_Plume`
3. Ouvrez le fichier `backend/database/schema_pointage.sql`
4. Exécutez le script (F5 ou bouton "Execute")

## ✅ Méthode 4 : Via Tunnel SSH Local

1. **Créez le tunnel SSH** (dans un terminal séparé) :
   ```powershell
   ssh -L 5433:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191 -N
   ```

2. **Dans un autre terminal, exécutez** :
   ```powershell
   cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
   node executer-schema-pointage.js
   ```

## 📊 Vérification

Après l'exécution, vérifiez que les tables ont été créées :

```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pointage', 'pointage_resume');

-- Vérifier les colonnes ajoutées à equipe
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'equipe' 
AND column_name IN ('timemoto_user_id', 'temps_travaille_mois');
```

## 🔒 Sécurité

⚠️ **Important** : Si vous utilisez la méthode 2 (API), supprimez l'endpoint `/api/migration` après utilisation pour des raisons de sécurité.

Pour supprimer :
1. Retirez `app.use('/api/migration', migrationRoutes);` de `server.js`
2. Supprimez le fichier `src/routes/migration.routes.js`

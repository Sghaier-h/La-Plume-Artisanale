# Instructions pour Créer la Table Manquante

## 🔍 Problème Détecté

La table **`qualite_avancee`** n'existe pas dans votre base de données.

## ✅ Solution Rapide

### Option 1 : Via votre Client PostgreSQL (Recommandé)

1. **Ouvrez votre client PostgreSQL** (pgAdmin, DBeaver, VS Code avec extension PostgreSQL, etc.)

2. **Connectez-vous** à la base de données `ERP_La_Plume`

3. **Exécutez cette commande SQL** :

```sql
CREATE TABLE IF NOT EXISTS qualite_avancee (
  id_qualite SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);
```

4. **Vérifiez** que la table a été créée :
```sql
SELECT * FROM qualite_avancee LIMIT 1;
```

### Option 2 : Via le Script SQL Complet

Si vous préférez créer **toutes les tables manquantes** en une fois :

1. **Ouvrez le fichier** : `scripts/create-tables-generiques-executable.sql`
2. **Exécutez le script complet** dans votre client PostgreSQL
3. Toutes les 51 tables seront créées (les existantes seront ignorées grâce à `IF NOT EXISTS`)

### Option 3 : Via psql (Ligne de commande)

```bash
psql -h localhost -p 5432 -U Aviateur -d ERP_La_Plume -c "CREATE TABLE IF NOT EXISTS qualite_avancee (id_qualite SERIAL PRIMARY KEY, name VARCHAR(255), description TEXT, active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP, created_by INTEGER, updated_by INTEGER);"
```

## 📋 Structure de la Table

La table `qualite_avancee` sera créée avec :

- **id_qualite** : Clé primaire auto-incrémentée (SERIAL)
- **name** : Nom (VARCHAR 255)
- **description** : Description (TEXT)
- **active** : Statut actif/inactif (BOOLEAN, défaut: true)
- **created_at** : Date de création (TIMESTAMP, auto)
- **updated_at** : Date de mise à jour (TIMESTAMP)
- **created_by** : ID utilisateur créateur (INTEGER)
- **updated_by** : ID utilisateur modificateur (INTEGER)

## 🔍 Vérifier les Autres Tables Manquantes

Pour vérifier quelles autres tables pourraient manquer, vous pouvez exécuter le script de vérification :

```bash
cd backend
node scripts/verifier-tables-database.mjs
```

Ou exécuter cette requête SQL dans votre client :

```sql
-- Liste des tables attendues (exemple pour quelques tables)
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'qualite_avancee') 
    THEN '✅ Existe' 
    ELSE '❌ Manquante' 
  END AS qualite_avancee,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mobile') 
    THEN '✅ Existe' 
    ELSE '❌ Manquante' 
  END AS mobile,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email') 
    THEN '✅ Existe' 
    ELSE '❌ Manquante' 
  END AS email;
```

## 💡 Note Importante

Le script SQL complet (`create-tables-generiques-executable.sql`) contient **toutes les 51 tables**. Si vous l'exécutez, il créera toutes les tables manquantes en une seule fois, ce qui est plus efficace que de les créer une par une.

## ✅ Après Création

Une fois la table créée, le contrôleur `qualite-avancee` pourra fonctionner correctement et effectuer toutes les opérations CRUD (Create, Read, Update, Delete).

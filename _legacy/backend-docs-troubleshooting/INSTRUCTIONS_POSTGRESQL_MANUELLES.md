# Instructions Manuelles pour Configurer PostgreSQL

## 🎯 Situation Actuelle

Vous avez :
- ✅ Fichier `.env` configuré avec les bonnes valeurs
- ❌ L'utilisateur `Aviateur` n'existe pas ou le mot de passe est incorrect
- ❌ La base de données `ERP_La_Plume` n'existe peut-être pas

## 🔧 Solution : Configuration Manuelle

### Option 1 : Via pgAdmin (Recommandé - Interface Graphique)

1. **Ouvrez pgAdmin** (installé avec PostgreSQL)

2. **Connectez-vous au serveur PostgreSQL**
   - Clic droit sur "Servers" > "Create" > "Server"
   - Onglet "General" : Nom = "Local PostgreSQL"
   - Onglet "Connection" :
     - Host: localhost
     - Port: 5432
     - Username: postgres
     - Password: [votre mot de passe postgres]
   - Cliquez "Save"

3. **Créer l'utilisateur**
   - Clic droit sur "Login/Group Roles" > "Create" > "Login/Group Role"
   - Onglet "General" : Name = `Aviateur`
   - Onglet "Definition" : Password = `Allbyfouta007`
   - Onglet "Privileges" : Cochez toutes les cases
   - Cliquez "Save"

4. **Créer la base de données**
   - Clic droit sur "Databases" > "Create" > "Database"
   - Name = `ERP_La_Plume`
   - Owner = `Aviateur`
   - Cliquez "Save"

5. **Attribuer les permissions**
   - Clic droit sur la base `ERP_La_Plume` > "Properties"
   - Onglet "Security" : Ajoutez l'utilisateur `Aviateur` avec tous les privilèges
   - Cliquez "Save"

### Option 2 : Via psql (Ligne de commande)

1. **Ouvrez une invite de commande**

2. **Connectez-vous à PostgreSQL**
   ```bash
   psql -U postgres
   ```
   (Entrez le mot de passe de postgres)

3. **Exécutez les commandes SQL suivantes** :

```sql
-- Créer l'utilisateur
CREATE USER "Aviateur" WITH PASSWORD 'Allbyfouta007';

-- Créer la base de données
CREATE DATABASE "ERP_La_Plume";

-- Attribuer les permissions
ALTER DATABASE "ERP_La_Plume" OWNER TO "Aviateur";
GRANT ALL PRIVILEGES ON DATABASE "ERP_La_Plume" TO "Aviateur";

-- Se connecter à la nouvelle base
\c "ERP_La_Plume"

-- Permissions sur le schéma
GRANT ALL ON SCHEMA public TO "Aviateur";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "Aviateur";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "Aviateur";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "Aviateur";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "Aviateur";

-- Quitter
\q
```

### Option 3 : Via le Script SQL

1. **Ouvrez pgAdmin ou psql**

2. **Exécutez le script** :
   ```bash
   psql -U postgres -f scripts/creer-utilisateur-postgresql.sql
   ```

   Ou dans pgAdmin :
   - Clic droit sur la base "postgres" > "Query Tool"
   - Ouvrez le fichier `scripts/creer-utilisateur-postgresql.sql`
   - Exécutez (F5)

## 🔑 Si vous ne connaissez pas le mot de passe de "postgres"

### Windows

1. **Méthode 1 : Réinitialiser via les Services**
   - Ouvrez "Services" (services.msc)
   - Trouvez "postgresql-x64-XX"
   - Arrêtez le service
   - Modifiez `pg_hba.conf` (généralement dans `C:\Program Files\PostgreSQL\XX\data\`)
   - Changez `md5` en `trust` pour localhost
   - Redémarrez le service
   - Connectez-vous sans mot de passe
   - Changez le mot de passe : `ALTER USER postgres WITH PASSWORD 'nouveau_mot_de_passe';`
   - Remettez `md5` dans pg_hba.conf

2. **Méthode 2 : Utiliser un autre utilisateur admin**
   - Si vous avez créé un autre utilisateur avec des droits admin, utilisez-le

### Linux

```bash
# Se connecter en tant qu'utilisateur postgres du système
sudo -u postgres psql

# Changer le mot de passe
ALTER USER postgres WITH PASSWORD 'nouveau_mot_de_passe';
```

## ✅ Vérification

Après configuration, testez :

```bash
node scripts/fixer-postgresql-simple.mjs
```

Vous devriez voir :
- ✅ Connexion réussie
- ✅ Base de données existe
- ✅ Liste des tables

## 🧪 Test Final

```bash
# Tester les routes CRUD
node scripts/test-crud-avec-auth.mjs
```

## 📝 Note

Si vous continuez à avoir des problèmes :
1. Vérifiez que PostgreSQL est démarré
2. Vérifiez les valeurs dans votre `.env`
3. Essayez de vous connecter manuellement avec pgAdmin ou psql
4. Consultez les logs PostgreSQL pour plus de détails

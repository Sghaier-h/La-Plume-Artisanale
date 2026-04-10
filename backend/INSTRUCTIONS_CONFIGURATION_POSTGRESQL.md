# Instructions de Configuration PostgreSQL

## 🚀 Configuration Rapide

Votre fichier `.env` est déjà configuré avec :
- Host: localhost
- Port: 5432
- Database: ERP_La_Plume
- User: Aviateur
- Password: Allbyfouta007

## ⚡ Solution Rapide

Exécutez ce script pour configurer automatiquement PostgreSQL :

```bash
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
node scripts/fixer-postgresql.mjs
```

Le script va :
1. Vous demander le mot de passe de l'utilisateur `postgres` (super-utilisateur)
2. Créer l'utilisateur `Aviateur` s'il n'existe pas
3. Créer la base de données `ERP_La_Plume` si elle n'existe pas
4. Mettre à jour le mot de passe de l'utilisateur `Aviateur`
5. Attribuer toutes les permissions nécessaires
6. Tester la connexion

## 🔧 Configuration Manuelle (Alternative)

Si le script automatique ne fonctionne pas, suivez ces étapes :

### 1. Se connecter à PostgreSQL

Ouvrez une invite de commande et connectez-vous :

```bash
psql -U postgres
```

Vous serez invité à entrer le mot de passe de `postgres`.

### 2. Créer l'utilisateur

```sql
CREATE USER "Aviateur" WITH PASSWORD 'Allbyfouta007';
```

### 3. Créer la base de données

```sql
CREATE DATABASE "ERP_La_Plume";
```

### 4. Attribuer les permissions

```sql
ALTER DATABASE "ERP_La_Plume" OWNER TO "Aviateur";
GRANT ALL PRIVILEGES ON DATABASE "ERP_La_Plume" TO "Aviateur";
```

### 5. Se connecter à la nouvelle base

```sql
\c "ERP_La_Plume"
```

### 6. Donner les permissions sur le schéma

```sql
GRANT ALL ON SCHEMA public TO "Aviateur";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "Aviateur";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "Aviateur";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "Aviateur";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "Aviateur";
```

### 7. Quitter psql

```sql
\q
```

## ✅ Vérification

Après configuration, vérifiez :

```bash
node scripts/verifier-postgresql.mjs
```

Vous devriez voir :
- ✅ Connexion réussie
- ✅ Base de données existe
- ✅ Liste des tables

## 🧪 Test Final

Testez les routes CRUD :

```bash
node scripts/test-crud-avec-auth.mjs
```

## 🆘 Problèmes Courants

### "password authentication failed"

**Solution** : Le mot de passe dans `.env` ne correspond pas au mot de passe PostgreSQL.

1. Réinitialisez le mot de passe :
   ```sql
   ALTER USER "Aviateur" WITH PASSWORD 'Allbyfouta007';
   ```

2. Ou mettez à jour votre `.env` avec le bon mot de passe

### "role does not exist"

**Solution** : L'utilisateur n'existe pas. Créez-le :
```sql
CREATE USER "Aviateur" WITH PASSWORD 'Allbyfouta007';
```

### "database does not exist"

**Solution** : Créez la base de données :
```sql
CREATE DATABASE "ERP_La_Plume";
ALTER DATABASE "ERP_La_Plume" OWNER TO "Aviateur";
```

### "ECONNREFUSED"

**Solution** : PostgreSQL n'est pas démarré.
- Windows : Services > PostgreSQL > Démarrer
- Linux : `sudo systemctl start postgresql`

## 📝 Note

Si vous ne connaissez pas le mot de passe de `postgres`, vous pouvez :
1. Le réinitialiser via les services Windows
2. Ou modifier `pg_hba.conf` pour autoriser les connexions locales sans mot de passe (développement uniquement)

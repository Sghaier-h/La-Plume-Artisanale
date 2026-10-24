# Guide de Configuration PostgreSQL

## 🔧 Configuration PostgreSQL pour ERP La Plume Artisanale

### Étape 1 : Vérifier que PostgreSQL est installé et démarré

#### Windows
1. Ouvrez le **Gestionnaire de services** (Services.msc)
2. Cherchez **PostgreSQL**
3. Vérifiez que le service est **Démarré**
4. Si non, cliquez droit > **Démarrer**

#### Linux
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql  # Si non démarré
```

### Étape 2 : Créer le fichier .env

Créez ou modifiez le fichier `.env` à la racine du dossier `backend` :

```env
# Configuration PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007

# Configuration JWT
JWT_SECRET=votre_secret_jwt_ici
JWT_EXPIRE=24h

# Environnement
NODE_ENV=development
USE_MOCK_AUTH=false
```

### Étape 3 : Configurer PostgreSQL

#### Option A : Utiliser le script automatique (Recommandé)

```bash
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
node scripts/configurer-postgresql.mjs
```

Le script va :
- ✅ Créer l'utilisateur `Aviateur` s'il n'existe pas
- ✅ Créer la base de données `ERP_La_Plume` si elle n'existe pas
- ✅ Attribuer les permissions nécessaires
- ✅ Tester la connexion

**Note** : Vous aurez besoin du mot de passe de l'utilisateur `postgres` (super-utilisateur PostgreSQL).

#### Option B : Configuration manuelle

1. **Se connecter à PostgreSQL** (en tant que super-utilisateur `postgres`) :
   ```bash
   psql -U postgres
   ```

2. **Créer l'utilisateur** :
   ```sql
   CREATE USER "Aviateur" WITH PASSWORD 'votre_mot_de_passe';
   ```

3. **Créer la base de données** :
   ```sql
   CREATE DATABASE "ERP_La_Plume";
   ```

4. **Attribuer les permissions** :
   ```sql
   ALTER DATABASE "ERP_La_Plume" OWNER TO "Aviateur";
   GRANT ALL PRIVILEGES ON DATABASE "ERP_La_Plume" TO "Aviateur";
   ```

5. **Se connecter à la nouvelle base** :
   ```sql
   \c "ERP_La_Plume"
   ```

6. **Donner les permissions sur le schéma public** :
   ```sql
   GRANT ALL ON SCHEMA public TO "Aviateur";
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "Aviateur";
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "Aviateur";
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "Aviateur";
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "Aviateur";
   ```

### Étape 4 : Vérifier la configuration

```bash
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
node scripts/verifier-postgresql.mjs
```

Vous devriez voir :
- ✅ Connexion réussie
- ✅ Base de données existe
- ✅ Liste des tables (si elles existent déjà)

### Étape 5 : Résoudre les problèmes courants

#### Problème 1 : "password authentication failed"

**Solution** :
1. Vérifiez le mot de passe dans votre `.env`
2. Réinitialisez le mot de passe :
   ```sql
   ALTER USER "Aviateur" WITH PASSWORD 'nouveau_mot_de_passe';
   ```
3. Mettez à jour votre `.env` avec le nouveau mot de passe

#### Problème 2 : "database does not exist"

**Solution** :
```sql
CREATE DATABASE "ERP_La_Plume";
ALTER DATABASE "ERP_La_Plume" OWNER TO "Aviateur";
```

#### Problème 3 : "role does not exist"

**Solution** :
```sql
CREATE USER "Aviateur" WITH PASSWORD 'votre_mot_de_passe';
```

#### Problème 4 : "ECONNREFUSED" (connexion refusée)

**Solutions** :
1. Vérifiez que PostgreSQL est démarré
2. Vérifiez le port (par défaut 5432)
3. Vérifiez le host (localhost ou 127.0.0.1)
4. Vérifiez le firewall Windows

#### Problème 5 : "permission denied"

**Solution** :
```sql
GRANT ALL PRIVILEGES ON DATABASE "ERP_La_Plume" TO "Aviateur";
\c "ERP_La_Plume"
GRANT ALL ON SCHEMA public TO "Aviateur";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "Aviateur";
```

### Étape 6 : Tester la connexion

Après configuration, testez :

```bash
# Vérifier la configuration
node scripts/verifier-postgresql.mjs

# Tester les routes CRUD
node scripts/test-crud-avec-auth.mjs
```

### 🔐 Sécurité

**Important** :
- ⚠️ Ne commitez **JAMAIS** le fichier `.env` dans Git
- ✅ Ajoutez `.env` dans `.gitignore`
- ✅ Utilisez des mots de passe forts
- ✅ En production, utilisez des variables d'environnement sécurisées

### 📝 Exemple de fichier .env complet

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=MonMotDePasseSecurise123!

# JWT
JWT_SECRET=ma-cle-secrete-jwt-tres-longue-et-aleatoire
JWT_EXPIRE=24h

# Application
NODE_ENV=development
PORT=5000

# Optionnel : Mode mock (sans base de données)
USE_MOCK_AUTH=false
```

### ✅ Vérification finale

Une fois configuré, vous devriez pouvoir :

1. ✅ Démarrer le serveur sans erreurs
2. ✅ Voir "✅ Connecté à PostgreSQL" dans les logs
3. ✅ Exécuter les tests CRUD avec succès
4. ✅ Accéder à la base de données via un client PostgreSQL

### 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :

1. Vérifiez les logs du serveur
2. Exécutez `node scripts/verifier-postgresql.mjs`
3. Vérifiez que PostgreSQL est démarré
4. Vérifiez les permissions de l'utilisateur

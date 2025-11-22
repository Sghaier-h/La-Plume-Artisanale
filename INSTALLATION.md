# 📦 Guide d'Installation - ERP ALL BY FOUTA

## Prérequis

### Logiciels requis
- **Node.js** : Version 18 ou supérieure
- **PostgreSQL** : Version 14 ou supérieure
- **Redis** : Version 6 ou supérieure (optionnel, pour le cache)
- **Git** : Pour le contrôle de version

### Comptes et accès
- Accès à la base de données PostgreSQL
- Accès au serveur (si déploiement)

## Installation étape par étape

### 1. Cloner le projet

```bash
cd "D:\OneDrive - FLYING TEX\PROJET"
```

### 2. Installation Base de données

#### 2.1 Créer la base de données

```sql
CREATE DATABASE fouta_erp;
CREATE USER fouta_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE fouta_erp TO fouta_user;
```

#### 2.2 Exécuter les scripts SQL

Dans l'ordre suivant :

```bash
cd database

# Fichier 1 : Base et sécurité
psql -U fouta_user -d fouta_erp -f 01_base_et_securite.sql

# Fichier 2 : Production et qualité
psql -U fouta_user -d fouta_erp -f 02_production_et_qualite.sql

# Fichier 3 : Flux et traçabilité
psql -U fouta_user -d fouta_erp -f 03_flux_et_tracabilite.sql
```

**Note** : Les scripts créent automatiquement :
- 45+ tables
- Index de performance
- Triggers automatiques
- Vues dashboard
- Données initiales (utilisateurs, rôles)

### 3. Installation Backend

```bash
cd backend

# Installer les dépendances
npm install

# Copier le fichier d'environnement
copy .env.example .env

# Éditer .env avec vos paramètres
notepad .env
```

**Configuration `.env`** :
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fouta_erp
DB_USER=fouta_user
DB_PASSWORD=votre_mot_de_passe

PORT=5000
NODE_ENV=development

JWT_SECRET=votre_secret_jwt_tres_long_et_securise
JWT_EXPIRE=7d
```

**Démarrer le serveur** :
```bash
# Mode développement (avec rechargement auto)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:5000`

### 4. Installation Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer l'application
npm start
```

L'application démarre sur `http://localhost:3000`

### 5. Installation Applications Mobile (PWA)

```bash
cd mobile

# Installer les dépendances pour chaque app
cd apps/tisseur
npm install

cd ../coupeur
npm install

# ... etc pour chaque app
```

## Vérification de l'installation

### 1. Vérifier la base de données

```sql
-- Vérifier les tables créées
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Devrait retourner ~45 tables

-- Vérifier les utilisateurs
SELECT nom_utilisateur, email, actif FROM utilisateurs;

-- Devrait retourner les utilisateurs par défaut
```

### 2. Vérifier le backend

```bash
# Tester l'API
curl http://localhost:5000/health

# Devrait retourner : {"status":"OK","timestamp":"..."}
```

### 3. Vérifier le frontend

Ouvrir `http://localhost:3000` dans le navigateur.

## Comptes par défaut

Après l'installation, vous pouvez vous connecter avec :

| Rôle | Nom d'utilisateur | Mot de passe | Description |
|------|-------------------|--------------|-------------|
| Admin | admin | Admin123! | Accès complet |
| Chef Production | chef.prod | User123! | Gestion production |
| Tisseur | tisseur | User123! | Suivi fabrication |
| Mécanicien | mecanicien | User123! | Maintenance |
| Magasinier MP | mag.mp | User123! | Stock MP |
| Coupeur | coupeur | User123! | Coupe et lots |

**⚠️ IMPORTANT** : Changez ces mots de passe après la première connexion !

## Dépannage

### Erreur de connexion à la base de données

1. Vérifier que PostgreSQL est démarré
2. Vérifier les identifiants dans `.env`
3. Vérifier que la base de données existe

```bash
psql -U fouta_user -d fouta_erp -c "SELECT 1;"
```

### Erreur "Port already in use"

Changer le port dans `.env` :
```env
PORT=5001
```

### Erreur lors de l'exécution des scripts SQL

Vérifier que vous êtes connecté avec les bons droits :
```sql
GRANT ALL PRIVILEGES ON DATABASE fouta_erp TO fouta_user;
```

### Problèmes de dépendances Node.js

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## Prochaines étapes

1. **Importer vos données** : Utiliser les fonctionnalités d'import Excel
2. **Configurer les machines** : Ajouter vos machines dans le système
3. **Créer les utilisateurs** : Ajouter vos utilisateurs avec les bons rôles
4. **Configurer les imprimantes** : Connecter les imprimantes d'étiquettes

## Support

Pour toute question ou problème, consultez la documentation dans `docs/` ou contactez l'équipe de développement.


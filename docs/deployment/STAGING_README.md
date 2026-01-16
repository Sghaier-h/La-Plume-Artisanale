# 🚀 GUIDE STAGING - ENVIRONNEMENT DE TEST

## 📋 Vue d'ensemble

Ce guide vous permet de mettre en place un environnement de staging (test) complet pour le système GPAO.

## ⚙️ Prérequis

1. **PostgreSQL** installé et démarré
2. **Node.js** (v18 ou supérieur)
3. **npm** ou **yarn**

## 🚀 Installation Rapide

### Option 1: Installation Automatique Complète

```powershell
.\scripts\init-staging-complete.ps1
```

Ce script fait tout automatiquement :
- ✅ Configure l'environnement staging
- ✅ Crée la base de données
- ✅ Applique tous les scripts SQL
- ✅ Installe les dépendances

### Option 2: Installation Étape par Étape

#### Étape 1: Configuration
```powershell
.\scripts\staging-setup.ps1
```
- Crée la base de données `fouta_erp_staging`
- Configure les fichiers `.env`
- Installe les dépendances

#### Étape 2: Application Scripts SQL
```powershell
.\scripts\apply-sql-staging.ps1
```
- Applique les 23 modules SQL
- Crée toutes les tables
- Crée toutes les fonctions

#### Étape 3: Démarrage
```powershell
.\scripts\start-staging.ps1
```
- Démarre le backend (port 5000)
- Démarre le frontend (port 3000)

## 📁 Structure Staging

```
La-Plume-Artisanale/
├── backend/
│   ├── .env                    # Config staging (copié depuis .env.staging)
│   └── uploads/staging/        # Uploads staging
├── frontend/
│   └── .env                    # Config staging (copié depuis .env.staging)
├── database/
│   └── *.sql                   # Scripts SQL
└── scripts/
    ├── staging-setup.ps1       # Configuration
    ├── apply-sql-staging.ps1   # Application SQL
    ├── start-staging.ps1       # Démarrage
    ├── stop-staging.ps1        # Arrêt
    └── init-staging-complete.ps1 # Installation complète
```

## 🔧 Configuration

### Base de Données

Par défaut en staging :
- **Nom** : `fouta_erp_staging`
- **Utilisateur** : `postgres`
- **Mot de passe** : À définir lors de l'installation
- **Host** : `localhost`
- **Port** : `5432`

### Backend

- **Port** : `5000`
- **Mode Mock Auth** : Activé (pas besoin de vraie authentification)
- **Logs** : Mode debug

### Frontend

- **Port** : `3000`
- **API URL** : `http://localhost:5000`
- **WebSocket** : `http://localhost:5001`

## 🎯 Utilisation

### Démarrer l'application

```powershell
.\scripts\start-staging.ps1
```

Deux fenêtres PowerShell s'ouvrent :
- **Backend** : Port 5000
- **Frontend** : Port 3000

### Accéder à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000
- **API Docs** : http://localhost:5000/api/docs (si configuré)

### Arrêter l'application

```powershell
.\scripts\stop-staging.ps1
```

Ou fermez simplement les fenêtres PowerShell.

## 🧪 Tests

### Tester la connexion base de données

```powershell
psql -U postgres -d fouta_erp_staging -c "SELECT COUNT(*) FROM information_schema.tables;"
```

### Tester les endpoints API

```powershell
# Backend doit être démarré
curl http://localhost:5000/api/maintenance/interventions
```

### Exécuter les tests automatiques

```powershell
cd tests
npm test
```

## 🔍 Vérification

### Vérifier les tables créées

```sql
-- Se connecter à la base
psql -U postgres -d fouta_erp_staging

-- Lister les tables
\dt

-- Compter les tables
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
```

### Vérifier les fonctions SQL

```sql
SELECT proname FROM pg_proc WHERE proname LIKE 'generer_%' OR proname LIKE 'calculer_%';
```

## 🐛 Dépannage

### Erreur: Base de données n'existe pas

```sql
CREATE DATABASE fouta_erp_staging;
```

### Erreur: Connexion refusée

1. Vérifier que PostgreSQL est démarré
2. Vérifier le mot de passe dans `backend/.env`
3. Vérifier les permissions utilisateur

### Erreur: Port déjà utilisé

Changer le port dans :
- `backend/.env` : `PORT=5001`
- `frontend/.env` : `REACT_APP_API_URL=http://localhost:5001`

### Réinitialiser la base de données

```sql
DROP DATABASE fouta_erp_staging;
CREATE DATABASE fouta_erp_staging;
```

Puis réexécuter :
```powershell
.\scripts\apply-sql-staging.ps1
```

## 📊 Données de Test

En mode staging avec `USE_MOCK_AUTH=true`, les endpoints retournent des données mockées pour tester sans base de données complète.

## 🔐 Sécurité Staging

⚠️ **Important** : L'environnement staging utilise :
- Authentification mockée (pas de vraie sécurité)
- Secrets par défaut (à changer en production)
- Pas de HTTPS
- Logs détaillés

**Ne jamais utiliser en production !**

## 📝 Prochaines Étapes

1. ✅ Environnement staging configuré
2. ✅ Base de données initialisée
3. ✅ Application démarrée
4. 🧪 Tester les fonctionnalités
5. 🐛 Corriger les bugs
6. 🚀 Préparer pour production

## 🆘 Support

En cas de problème :
1. Vérifier les logs dans les fenêtres PowerShell
2. Vérifier la connexion PostgreSQL
3. Vérifier les fichiers `.env`
4. Consulter `RAPPORT_TESTS.html` pour les tests

---

**Bon développement ! 🚀**

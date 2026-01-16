# 🚀 Démarrer le SAAS en Local

Guide pour lancer l'application en développement local.

## 📋 Prérequis

- **Node.js** : Version 18 ou supérieure
- **npm** : Inclus avec Node.js
- **Base de données PostgreSQL** : Configurée et accessible

## 🚀 Démarrage Rapide

### Option 1 : Script Automatique (Windows)

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
.\scripts\demarrer-local.ps1
```

### Option 2 : Démarrage Manuel

#### 1. Démarrer le Backend

Ouvrez un terminal et exécutez :

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"

# Installer les dépendances (si nécessaire)
npm install

# Démarrer le serveur en mode développement
npm run dev
```

Le backend sera accessible sur : `http://localhost:5000`

#### 2. Démarrer le Frontend

Ouvrez un **nouveau terminal** et exécutez :

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"

# Créer le fichier .env.local (si nécessaire)
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local

# Installer les dépendances (si nécessaire)
npm install

# Démarrer le frontend
npm start
```

Le frontend sera accessible sur : `http://localhost:3000`

Le navigateur s'ouvrira automatiquement.

## ⚙️ Configuration

### Backend (.env)

Le fichier `backend/.env` doit contenir :

```env
# Base de données
DATABASE_URL=postgresql://user:password@host:port/database

# Port (optionnel, défaut: 5000)
PORT=5000

# Frontend URL (optionnel)
FRONTEND_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=votre-secret-jwt

# TimeMoto Webhook Secret (optionnel)
TIMEMOTO_WEBHOOK_SECRET=votre-secret-timemoto
```

### Frontend (.env.local)

Le fichier `frontend/.env.local` doit contenir :

```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Important** : Les variables d'environnement React doivent commencer par `REACT_APP_`.

## 🌐 URLs Locales

- **Frontend** : `http://localhost:3000`
- **Backend API** : `http://localhost:5000/api`
- **Health Check** : `http://localhost:5000/health`
- **API Info** : `http://localhost:5000/api/info`

## 🔧 Commandes Utiles

### Backend

```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Mode production
npm start

# Créer un utilisateur administrateur
npm run create:admin

# Tester la connexion à la base de données
npm run test:db
```

### Frontend

```bash
# Démarrer le serveur de développement
npm start

# Build de production
npm run build

# Tests
npm test
```

## 🔍 Vérification

1. **Vérifier le backend** :
   - Ouvrez : `http://localhost:5000/api/info`
   - Vous devriez voir les informations de l'API

2. **Vérifier le frontend** :
   - Ouvrez : `http://localhost:3000`
   - Vous devriez voir la page de connexion

3. **Tester la connexion** :
   - Email : `admin@system.local`
   - Mot de passe : `Admin123!`

## ⚠️ Dépannage

### Le backend ne démarre pas

- Vérifiez que le port 5000 n'est pas utilisé : `netstat -ano | findstr :5000`
- Vérifiez la configuration de la base de données dans `.env`
- Vérifiez que PostgreSQL est accessible

### Le frontend ne se connecte pas au backend

- Vérifiez que le backend est démarré
- Vérifiez que `.env.local` contient `REACT_APP_API_URL=http://localhost:5000/api`
- Vérifiez la console du navigateur (F12) pour les erreurs CORS

### Erreur CORS

Si vous voyez des erreurs CORS dans la console, vérifiez que `FRONTEND_URL=http://localhost:3000` est configuré dans `backend/.env`.

## 📝 Notes

- Le backend utilise **nodemon** en mode développement pour recharger automatiquement
- Le frontend utilise **react-scripts** avec rechargement automatique (Hot Reload)
- Les deux serveurs doivent être démarrés en parallèle

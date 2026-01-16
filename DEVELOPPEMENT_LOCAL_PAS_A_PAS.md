# 🖥️ Développement Local - Guide Pas à Pas

## 📋 Vue d'ensemble

Ce guide vous accompagne dans la création et le développement de l'application ERP **localement sur votre PC** avant de la déployer sur le serveur.

**Avantages du développement local :**
- ✅ Tests rapides sans affecter le serveur
- ✅ Débogage facilité
- ✅ Développement sans connexion internet
- ✅ Modifications instantanées avec rechargement automatique

---

## 🎯 Étape 1 : Vérifier les prérequis

### 1.1 Logiciels nécessaires

**Vérifier que vous avez installé :**

```powershell
# Vérifier Node.js (doit être 18+)
node --version

# Vérifier npm
npm --version

# Vérifier Git (optionnel mais recommandé)
git --version
```

**Si Node.js n'est pas installé :**
- Télécharger depuis : https://nodejs.org/
- Installer la version LTS (Long Term Support)

### 1.2 Structure du projet

Votre projet doit être dans :
```
D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\
```

**Vérifier la structure :**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
dir
```

Vous devriez voir :
- `backend/` - Code du serveur Node.js
- `frontend/` - Code de l'interface React
- `database/` - Scripts SQL

---

## 🗄️ Étape 2 : Configuration de la base de données

### Option A : Utiliser la base de données distante (OVH) - Recommandé pour commencer

**Avantages :**
- ✅ Pas besoin d'installer PostgreSQL localement
- ✅ Données partagées avec le serveur
- ✅ Test avec les vraies données

**Configuration :**

1. **Créer le fichier `.env` dans le dossier `backend` :**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
New-Item -ItemType File -Name ".env" -Force
notepad .env
```

2. **Ajouter ce contenu dans `.env` :**

```env
# Base de données PostgreSQL OVH
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007

# Serveur local
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=3f0816cf15bf9e57d17259e1c240761e9576ad1c33af5a163400f338bad5e03c
JWT_EXPIRE=7d

# API
API_URL=http://localhost:5000
API_VERSION=v1

# Redis (optionnel, laissez vide si non utilisé)
REDIS_HOST=
REDIS_PORT=
```

**⚠️ Important :** Assurez-vous que l'IP de votre PC est autorisée dans PostgreSQL OVH.

### Option B : Installer PostgreSQL localement

**Si vous préférez une base de données locale :**

1. **Installer PostgreSQL :**
   - Télécharger : https://www.postgresql.org/download/windows/
   - Installer avec les paramètres par défaut
   - Noter le mot de passe du superutilisateur `postgres`

2. **Créer la base de données :**

```sql
-- Ouvrir pgAdmin ou psql
CREATE DATABASE erp_la_plume;
CREATE USER fouta_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE erp_la_plume TO fouta_user;
```

3. **Exécuter les scripts SQL :**

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\database"

# Exécuter les scripts dans l'ordre
psql -U fouta_user -d erp_la_plume -f 01_base_et_securite.sql
psql -U fouta_user -d erp_la_plume -f 02_production_et_qualite.sql
psql -U fouta_user -d erp_la_plume -f 03_flux_et_tracabilite.sql
psql -U fouta_user -d erp_la_plume -f 04_mobile_devices.sql
```

4. **Modifier le fichier `.env` :**

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=erp_la_plume
DB_USER=fouta_user
DB_PASSWORD=votre_mot_de_passe
```

---

## ⚙️ Étape 3 : Configuration du Backend

### 3.1 Installer les dépendances

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"

# Installer toutes les dépendances
npm install
```

**⏱️ Cela peut prendre 2-5 minutes**

### 3.2 Vérifier la structure du backend

```powershell
# Vérifier que les fichiers existent
dir src
```

Vous devriez voir :
- `server.js` - Serveur principal
- `config/` - Configuration
- `controllers/` - Contrôleurs API
- `routes/` - Routes API
- `middleware/` - Middleware
- `models/` - Modèles (si nécessaire)
- `services/` - Services métier
- `utils/` - Utilitaires (db.js, etc.)

### 3.3 Tester la connexion à la base de données

**Créer un script de test :**

```powershell
# Créer un fichier test-db.js
@"
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connexion réussie !');
    console.log('Heure serveur:', result.rows[0].now);
    
    // Tester une requête simple
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      LIMIT 5
    `);
    console.log('✅ Tables trouvées:', tables.rows.length);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    process.exit(1);
  }
}

testConnection();
"@ | Out-File -FilePath "test-db.js" -Encoding UTF8
```

**Exécuter le test :**

```powershell
node test-db.js
```

**Résultat attendu :**
```
✅ Connexion réussie !
Heure serveur: 2026-01-07T...
✅ Tables trouvées: 5
```

### 3.4 Démarrer le backend

```powershell
# Mode développement (avec rechargement automatique)
npm run dev

# OU mode normal
npm start
```

**Si `npm run dev` ne fonctionne pas, installer nodemon :**

```powershell
npm install --save-dev nodemon
```

**Résultat attendu :**
```
🚀 Serveur démarré sur le port 5000
📡 Socket.IO actif
```

**Tester l'API :**

Ouvrir un nouveau terminal PowerShell :

```powershell
# Tester l'endpoint health
curl.exe http://localhost:5000/health

# Devrait retourner : {"status":"OK","timestamp":"..."}
```

---

## 🎨 Étape 4 : Configuration du Frontend

### 4.1 Installer les dépendances

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"

# Installer toutes les dépendances
npm install
```

**⏱️ Cela peut prendre 5-10 minutes**

**Si vous avez des erreurs de dépendances :**

```powershell
# Nettoyer et réinstaller
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install --legacy-peer-deps
```

### 4.2 Configurer le fichier `.env`

```powershell
# Créer le fichier .env
New-Item -ItemType File -Name ".env" -Force
notepad .env
```

**Ajouter ce contenu :**

```env
# URL de l'API backend (local)
REACT_APP_API_URL=http://localhost:5000/api

# URL du serveur Socket.IO (local)
REACT_APP_SOCKET_URL=http://localhost:5000
```

**💡 Important :** Le frontend se connectera au backend local sur le port 5000.

### 4.3 Vérifier la structure du frontend

```powershell
# Vérifier les fichiers essentiels
dir src
dir public
```

Vous devriez voir :
- `src/App.tsx` - Composant principal
- `src/index.tsx` - Point d'entrée
- `src/pages/` - Pages de l'application
- `src/components/` - Composants réutilisables
- `src/services/` - Services API
- `public/index.html` - HTML principal

### 4.4 Démarrer le frontend

```powershell
npm start
```

**Résultat attendu :**
- Le navigateur s'ouvre automatiquement sur `http://localhost:3000`
- L'application se compile et s'affiche
- Les modifications du code rechargent automatiquement la page

---

## ✅ Étape 5 : Vérification complète

### 5.1 Vérifier que tout fonctionne

**Vous devez avoir 2 terminaux ouverts :**

**Terminal 1 - Backend :**
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm run dev
# Devrait afficher : 🚀 Serveur démarré sur le port 5000
```

**Terminal 2 - Frontend :**
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
npm start
# Devrait ouvrir http://localhost:3000
```

### 5.2 Tester l'application

1. **Ouvrir le navigateur** : `http://localhost:3000`

2. **Tester la connexion à l'API :**
   - Ouvrir la console du navigateur (F12)
   - Vérifier qu'il n'y a pas d'erreurs de connexion

3. **Tester l'authentification :**
   - Utiliser les identifiants par défaut :
     - Nom d'utilisateur : `admin`
     - Mot de passe : `Admin123!`

### 5.3 Vérifier les endpoints API

**Dans un nouveau terminal PowerShell :**

```powershell
# Health check
curl.exe http://localhost:5000/health

# Test d'authentification
curl.exe -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"nom_utilisateur\":\"admin\",\"mot_de_passe\":\"Admin123!\"}'
```

---

## 🔧 Étape 6 : Développement progressif

### 6.1 Structure de développement recommandée

```
La-Plume-Artisanale/
├── backend/
│   ├── src/
│   │   ├── controllers/     ← Ajouter vos contrôleurs ici
│   │   ├── routes/          ← Ajouter vos routes ici
│   │   ├── services/        ← Logique métier ici
│   │   └── models/          ← Modèles de données (si nécessaire)
│   └── .env                 ← Configuration locale
│
└── frontend/
    ├── src/
    │   ├── pages/           ← Pages de l'application
    │   ├── components/      ← Composants réutilisables
    │   ├── services/         ← Appels API
    │   └── hooks/            ← Hooks React personnalisés
    └── .env                  ← Configuration locale
```

### 6.2 Workflow de développement

1. **Modifier le code** dans votre éditeur (VS Code recommandé)

2. **Backend :** 
   - Si vous utilisez `npm run dev`, les modifications rechargent automatiquement
   - Sinon, redémarrer avec `npm start`

3. **Frontend :**
   - Les modifications rechargent automatiquement dans le navigateur
   - Vérifier la console pour les erreurs

4. **Tester** :
   - Tester dans le navigateur
   - Vérifier les logs du backend
   - Vérifier la console du navigateur

### 6.3 Outils recommandés

**Éditeur de code :**
- **VS Code** : https://code.visualstudio.com/
- Extensions recommandées :
  - ESLint
  - Prettier
  - ES6 String HTML
  - GitLens

**Outils de test API :**
- **Postman** : https://www.postman.com/
- **Thunder Client** (extension VS Code)

**Base de données :**
- **pgAdmin** : https://www.pgadmin.org/ (si PostgreSQL local)
- **DBeaver** : https://dbeaver.io/ (universel)

---

## 🚀 Étape 7 : Préparation pour le déploiement

### 7.1 Vérifier que tout fonctionne localement

**Checklist avant déploiement :**

- [ ] Backend démarre sans erreur
- [ ] Frontend compile sans erreur
- [ ] Connexion à la base de données fonctionne
- [ ] Authentification fonctionne
- [ ] Les principales fonctionnalités sont testées
- [ ] Pas d'erreurs dans la console

### 7.2 Préparer les fichiers pour le serveur

**Backend :**

1. **Vérifier le fichier `.env` pour la production :**
   - Créer un fichier `.env.production` avec les valeurs du serveur
   - Ne pas commiter le fichier `.env` (déjà dans `.gitignore`)

2. **Build du frontend :**
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
npm run build
```

**Le dossier `build/` contient les fichiers à déployer.**

### 7.3 Scripts utiles

**Créer un script de démarrage rapide :**

```powershell
# Créer start-dev.ps1
@"
# Script de démarrage rapide pour le développement local

Write-Host "🚀 Démarrage de l'application en mode développement..." -ForegroundColor Green

# Démarrer le backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend'; npm run dev"

# Attendre 3 secondes
Start-Sleep -Seconds 3

# Démarrer le frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend'; npm start"

Write-Host "✅ Application démarrée !" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
"@ | Out-File -FilePath "start-dev.ps1" -Encoding UTF8
```

**Utilisation :**
```powershell
.\start-dev.ps1
```

---

## 🆘 Résolution de problèmes

### Problème : "Cannot find module"

**Solution :**
```powershell
# Réinstaller les dépendances
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Problème : "Port 5000 already in use"

**Solution :**
```powershell
# Trouver le processus qui utilise le port
netstat -ano | findstr :5000

# Tuer le processus (remplacer PID par le numéro trouvé)
taskkill /PID <PID> /F
```

### Problème : "Connection refused" à la base de données

**Vérifier :**
1. Le fichier `.env` est correct
2. L'IP de votre PC est autorisée dans PostgreSQL OVH
3. Le firewall n'bloque pas la connexion

### Problème : Frontend ne se connecte pas au backend

**Vérifier :**
1. Le backend est bien démarré sur le port 5000
2. Le fichier `.env` du frontend contient : `REACT_APP_API_URL=http://localhost:5000/api`
3. Redémarrer le frontend après modification du `.env`

---

## 📚 Prochaines étapes

Une fois que tout fonctionne localement :

1. ✅ **Développer les fonctionnalités** manquantes
2. ✅ **Tester** chaque fonctionnalité
3. ✅ **Corriger les bugs** trouvés
4. ✅ **Préparer le déploiement** (voir `DEPLOYER_AVEC_GIT.md`)

---

## ✅ Checklist de démarrage

- [ ] Node.js installé (version 18+)
- [ ] Projet cloné/téléchargé
- [ ] Base de données configurée (locale ou distante)
- [ ] Fichier `.env` du backend créé et configuré
- [ ] Dépendances backend installées (`npm install`)
- [ ] Backend démarre sans erreur
- [ ] Fichier `.env` du frontend créé et configuré
- [ ] Dépendances frontend installées (`npm install`)
- [ ] Frontend démarre sans erreur
- [ ] Application accessible sur `http://localhost:3000`
- [ ] Authentification fonctionne

---

**🎉 Félicitations !** Votre environnement de développement local est maintenant prêt. Vous pouvez commencer à développer l'application.



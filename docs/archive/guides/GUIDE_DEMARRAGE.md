# Guide de Démarrage - Système ERP La Plume Artisanale

## 🚀 Démarrage Rapide

### Option 1 : Script Automatique (Recommandé)

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale"
.\demarrer-systeme.ps1
```

Ce script :
- ✅ Arrête les processus Node.js existants
- ✅ Libère les ports 5000 et 3000
- ✅ Démarre le backend (port 5000)
- ✅ Démarre le frontend (port 3000)
- ✅ Vérifie que les serveurs répondent

### Option 2 : Démarrage Manuel

#### 1. Backend

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm start
```

Le backend démarre sur **http://localhost:5000**

#### 2. Frontend (dans un nouveau terminal)

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
npm start
```

Le frontend démarre sur **http://localhost:3000** et s'ouvre automatiquement dans le navigateur.

## 📋 Prérequis

### Backend
- ✅ Node.js (v18+)
- ✅ PostgreSQL en cours d'exécution
- ✅ Variables d'environnement configurées (`.env`)

### Frontend
- ✅ Node.js (v18+)
- ✅ npm ou yarn

## 🔍 Vérification

### Backend
- **URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **API Docs**: http://localhost:5000/api-docs

### Frontend
- **URL**: http://localhost:3000
- S'ouvre automatiquement dans le navigateur

## 🛠️ Dépannage

### Port 5000 déjà utilisé

```powershell
# Arrêter les processus sur le port 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Port 3000 déjà utilisé

```powershell
# Arrêter les processus sur le port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Backend ne démarre pas

1. Vérifier que PostgreSQL est démarré
2. Vérifier le fichier `.env` dans `backend/`
3. Vérifier les logs dans la console

### Frontend ne compile pas

1. Supprimer `node_modules` et `package-lock.json`
2. Réinstaller : `npm install`
3. Redémarrer : `npm start`

## 📝 Logs

Les logs s'affichent dans les terminaux où les serveurs sont démarrés :
- **Backend** : Logs des modules chargés, routes, erreurs
- **Frontend** : Logs de compilation, erreurs TypeScript

## 🎯 Accès

Une fois démarré :
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Documentation API**: http://localhost:5000/api-docs

## ⚠️ Notes

- Les serveurs doivent être démarrés dans l'ordre : Backend puis Frontend
- Le frontend attend que le backend soit accessible
- En cas d'erreur, vérifier les logs dans les terminaux

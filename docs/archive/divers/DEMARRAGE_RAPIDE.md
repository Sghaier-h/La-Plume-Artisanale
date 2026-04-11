# 🚀 Guide de démarrage rapide

## ⚠️ Problème de connexion (ERR_CONNECTION_REFUSED)

Si vous voyez l'erreur "ERR_CONNECTION_REFUSED" ou "Ce site est inaccessible", c'est que :
1. Le **backend** n'est pas démarré
2. Le **frontend** n'est pas démarré

## 🎯 Démarrage rapide (Recommandé)

### Démarrage complet (Backend + Frontend)

Depuis le répertoire racine du projet :

```powershell
powershell -ExecutionPolicy Bypass -File DEMARRER_COMPLET.ps1
```

Ce script démarre automatiquement :
- ✅ Le backend sur `http://localhost:5000`
- ✅ Le frontend sur `http://localhost:3000`

Deux fenêtres PowerShell s'ouvriront, une pour chaque serveur.

### Démarrage séparé

Si vous préférez démarrer séparément :

**Backend uniquement :**
```powershell
powershell -ExecutionPolicy Bypass -File DEMARRER_BACKEND.ps1
```

**Frontend uniquement :**
```powershell
powershell -ExecutionPolicy Bypass -File DEMARRER_FRONTEND.ps1
```

## Problème de connexion au backend

Si vous voyez le message "Impossible de se connecter au serveur", c'est que le backend n'est pas démarré.

## Solutions

### Option 1 : Script PowerShell (Recommandé)

Depuis le répertoire racine du projet :

```powershell
powershell -ExecutionPolicy Bypass -File DEMARRER_BACKEND.ps1
```

### Option 2 : Démarrage manuel

1. Ouvrir un terminal dans le dossier `backend` :
```powershell
cd backend
```

2. Installer les dépendances si nécessaire :
```powershell
npm install
```

3. Démarrer le serveur :
```powershell
npm start
```

Le backend devrait démarrer sur `http://localhost:5000`

### Option 3 : Script de démarrage existant

Le projet contient déjà des scripts de démarrage dans le dossier `scripts/` :

```powershell
powershell -ExecutionPolicy Bypass -File scripts/demarrer-local-simple.ps1
```

## Vérification

Une fois le backend démarré, vous devriez voir :
```
🚀 Serveur démarré sur le port 5000
```

Vous pouvez ensuite :
- Actualiser la page de login
- Réessayer de vous connecter

## Configuration

Le backend écoute sur le port **5000** par défaut.

Le frontend essaie de se connecter à :
- **Développement** : `http://localhost:5000/api`
- **Production** : `https://fabrication.laplume-artisanale.tn/api`

## Dépannage

### Le backend ne démarre pas

1. Vérifier que Node.js est installé :
```powershell
node --version
```

2. Vérifier que PostgreSQL est démarré (si nécessaire)

3. Vérifier les logs d'erreur dans le terminal

### Erreur de port déjà utilisé

Si le port 5000 est déjà utilisé, modifier le fichier `.env` dans le dossier `backend` :
```
PORT=5001
```

Puis modifier `frontend/src/services/api.ts` pour utiliser le nouveau port.

## Support

Pour plus d'aide, consultez les fichiers de documentation dans le projet.

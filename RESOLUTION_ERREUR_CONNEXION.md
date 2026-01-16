# 🔧 RÉSOLUTION ERREUR DE CONNEXION

## ❌ Problème Identifié

**Erreur :** Le backend n'est pas démarré sur le port 5000

## ✅ Solution

### Option 1 : Démarrage Automatique (Recommandé)

```powershell
.\scripts\start-staging-auto.ps1
```

### Option 2 : Démarrage Manuel

**Terminal 1 - Backend :**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend (si pas déjà démarré) :**
```powershell
cd frontend
npm start
```

## 🔍 Vérifications

### 1. Vérifier que le backend est démarré

```powershell
# Test simple
curl http://localhost:5000

# Test login
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@system.local","password":"Admin123!"}'
```

### 2. Vérifier les ports

```powershell
# Vérifier port 5000 (backend)
netstat -ano | findstr :5000

# Vérifier port 3000 (frontend)
netstat -ano | findstr :3000
```

### 3. Vérifier les fichiers .env

**Backend (.env) :**
```env
NODE_ENV=staging
USE_MOCK_AUTH=true
PORT=5000
```

**Frontend (.env) :**
```env
REACT_APP_API_URL=http://localhost:5000
```

## 🐛 Problèmes Courants

### Erreur : "Impossible de se connecter au serveur distant"

**Cause :** Backend non démarré

**Solution :**
1. Démarrer le backend : `cd backend && npm run dev`
2. Attendre que le message "Serveur démarré sur le port 5000" apparaisse
3. Réessayer la connexion

### Erreur : "CORS policy"

**Cause :** Problème de configuration CORS

**Solution :** Vérifier que `http://localhost:3000` est dans la liste CORS du backend

### Erreur : "Token invalide"

**Cause :** Token expiré ou invalide

**Solution :**
1. Vider le cache navigateur
2. Supprimer localStorage :
   ```javascript
   localStorage.clear()
   ```
3. Recharger la page

### Erreur : "Identifiants invalides"

**Cause :** Mauvais email/mot de passe

**Solution :** Utiliser les identifiants corrects :
- Email : `admin@system.local`
- Mot de passe : `Admin123!`

## ✅ Checklist de Dépannage

- [ ] Backend démarré sur port 5000
- [ ] Frontend démarré sur port 3000
- [ ] Fichiers `.env` configurés
- [ ] Pas d'erreur dans les logs backend
- [ ] Ports 3000 et 5000 libres
- [ ] Identifiants corrects

## 🚀 Démarrage Rapide

```powershell
# 1. Démarrer backend
cd backend
npm run dev

# 2. Dans un autre terminal, démarrer frontend
cd frontend
npm start

# 3. Ouvrir http://localhost:3000
# 4. Se connecter avec admin@system.local / Admin123!
```

## 📞 Support

Si le problème persiste :
1. Vérifier les logs backend (fenêtre PowerShell)
2. Vérifier les logs frontend (console navigateur F12)
3. Vérifier que les dépendances sont installées : `npm install`

---

**Le backend doit être démarré pour que la connexion fonctionne !**

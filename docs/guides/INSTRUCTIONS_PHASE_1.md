# ✅ Phase 1 : Instructions d'Installation

## 🎯 Fichiers Créés Automatiquement

Tous les fichiers nécessaires pour la Phase 1 ont été créés :

### Backend
- ✅ `backend/prisma/schema.prisma` - Schéma Prisma avec User et Session
- ✅ `backend/src/config/prisma.js` - Configuration Prisma
- ✅ `backend/src/controllers/auth.controller.js` - Mis à jour avec Prisma
- ✅ `backend/src/middleware/auth.middleware.js` - Amélioré avec Prisma
- ✅ `backend/src/routes/auth.routes.js` - Mis à jour
- ✅ `backend/prisma/seed.js` - Seed données initiales
- ✅ `backend/package.json` - Mis à jour avec Prisma

### Frontend
- ✅ `frontend/src/pages/Login.tsx` - Page de connexion
- ✅ `frontend/src/hooks/useAuth.ts` - Hook d'authentification
- ✅ `frontend/src/App.tsx` - Mis à jour avec protection des routes

---

## 🚀 Étapes d'Installation

### 1. Installer Prisma

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm install prisma @prisma/client
```

### 2. Créer le fichier `.env`

**Option A : Script automatique (Recommandé)**

```powershell
.\creer-env.ps1
```

**Option B : Création manuelle**

```powershell
# Créer le fichier .env
notepad .env
```

**Copier ce contenu :**

```env
# Base de données PostgreSQL OVH
# Format pour Prisma
DATABASE_URL="postgresql://Aviateur:Allbyfouta007@sh131616-002.eu.clouddb.ovh.net:35392/ERP_La_Plume?schema=public"

# Variables pour compatibilité avec l'ancien code (pg)
DB_HOST=sh131616-002.eu.clouddb.ovh.net
DB_PORT=35392
DB_NAME=ERP_La_Plume
DB_USER=Aviateur
DB_PASSWORD=Allbyfouta007

# Serveur
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=3f0816cf15bf9e57d17259e1c240761e9576ad1c33af5a163400f338bad5e03c
JWT_EXPIRE=24h

# API
API_URL=http://localhost:5000
API_VERSION=v1

# Redis (optionnel)
REDIS_HOST=
REDIS_PORT=
```

**Voir aussi :** `CREER_ENV.md` pour plus de détails

### 3. Générer le Client Prisma

```powershell
npx prisma generate
```

### 4. Créer les Tables dans la Base de Données

```powershell
npx prisma db push
```

**⚠️ Note :** Cela va créer les tables `User` et `Session` dans votre base de données PostgreSQL.

### 5. Exécuter le Seed (Créer les Utilisateurs)

```powershell
npm run seed
```

Cela va créer :
- ✅ Admin : `admin@laplume.tn` / `Admin123!`
- ✅ Chef Production : `chef.prod@laplume.tn` / `Admin123!`
- ✅ Tisseur : `tisseur@laplume.tn` / `Admin123!`

### 6. Démarrer le Backend

```powershell
npm run dev
```

### 7. Configurer le Frontend

**Créer ou mettre à jour le fichier `.env` dans `frontend/` :**

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 8. Démarrer le Frontend

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\frontend"
npm start
```

---

## ✅ Vérification

### Tester l'API

```powershell
# Test de connexion
curl.exe -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@laplume.tn\",\"password\":\"Admin123!\"}'
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "token": "...",
    "user": {
      "id": "...",
      "email": "admin@laplume.tn",
      "nom": "Admin",
      "prenom": "Système",
      "role": "ADMIN"
    }
  }
}
```

### Tester le Frontend

1. Ouvrir `http://localhost:3000`
2. Vous devriez être redirigé vers `/login`
3. Se connecter avec : `admin@laplume.tn` / `Admin123!`
4. Vous devriez être redirigé vers `/dashboard`

---

## 🆘 Problèmes Courants

### Erreur : "PrismaClient is not configured"

**Solution :**
```powershell
npx prisma generate
```

### Erreur : "Cannot find module '@prisma/client'"

**Solution :**
```powershell
npm install @prisma/client
npx prisma generate
```

### Erreur : "P1001: Can't reach database server"

**Solution :**
- Vérifier que l'IP de votre PC est autorisée dans PostgreSQL OVH
- Vérifier la connexion internet
- Vérifier les identifiants dans `.env`

### Erreur : "Table 'User' already exists"

**Solution :**
Si vous avez déjà des tables dans la base, vous pouvez :
1. Supprimer les tables existantes
2. Ou utiliser `prisma migrate` au lieu de `prisma db push`

---

## 📚 Prochaines Étapes

Une fois la Phase 1 terminée et testée :

1. ✅ Vérifier que l'authentification fonctionne
2. ✅ Tester avec différents rôles
3. ✅ Passer à la Phase 2 : Articles + Nomenclature

---

**🎉 Phase 1 prête ! Suivez les instructions ci-dessus pour installer et tester.**

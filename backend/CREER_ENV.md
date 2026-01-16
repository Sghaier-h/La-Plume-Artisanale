# 🔧 Créer le fichier .env

## ⚠️ Important

Le fichier `.env` n'existe pas encore. Vous devez le créer manuellement.

## 📝 Instructions

### Option 1 : Copier depuis l'exemple

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
copy .env.example .env
```

### Option 2 : Créer manuellement

```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
notepad .env
```

**Copier ce contenu dans le fichier :**

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

## ✅ Vérification

Après avoir créé le fichier `.env`, vérifiez qu'il existe :

```powershell
dir .env
```

Vous devriez voir le fichier `.env` listé.

## 🚀 Continuer

Une fois le fichier `.env` créé, vous pouvez continuer :

```powershell
npx prisma generate
npx prisma db push
npm run seed
```

# 🔧 Corriger l'erreur "Cannot GET /"

## 🎯 Problème

Lors de l'accès à `https://fabrication.laplume-artisanale.tn/` dans Chrome, vous voyez :
```
Cannot GET /
```

**Cause** : Aucune route n'est définie pour la racine `/` dans `server.js`.

---

## ✅ Solution

Une route racine a été ajoutée dans `backend/src/server.js` qui retourne des informations sur l'API.

---

## 📤 Étape 1 : Transférer le fichier corrigé sur le VPS

### Option A : Via FileZilla

1. **Ouvrir FileZilla**
2. **Se connecter au VPS** :
   - Hôte : `137.74.40.191`
   - Utilisateur : `ubuntu`
   - Port : `22`
   - Protocole : `SFTP`
3. **Naviguer vers** : `/opt/fouta-erp/backend/src/`
4. **Transférer** : `server.js` (remplacer l'ancien fichier)

### Option B : Via SCP (PowerShell)

```powershell
# Depuis PowerShell
scp "D:\OneDrive - FLYING TEX\PROJET\backend\src\server.js" ubuntu@137.74.40.191:/opt/fouta-erp/backend/src/server.js
```

---

## 🔄 Étape 2 : Redémarrer l'application sur le VPS

### Se connecter au VPS

```bash
ssh ubuntu@137.74.40.191
```

### Redémarrer PM2

```bash
cd /opt/fouta-erp/backend
pm2 restart fouta-api
```

### Vérifier le statut

```bash
pm2 status
```

**Doit afficher** : `fouta-api (online)`

### Vérifier les logs

```bash
pm2 logs fouta-api --lines 10
```

**Ne doit pas afficher d'erreurs**

---

## ✅ Étape 3 : Tester

### Depuis le VPS

```bash
curl https://fabrication.laplume-artisanale.tn/
```

**Doit retourner** :
```json
{
  "message": "API ERP La Plume Artisanale",
  "version": "1.0.0",
  "status": "OK",
  "endpoints": {
    "health": "/health",
    "auth": "/api/auth",
    "production": "/api/production",
    "stock": "/api/stock",
    "planning": "/api/planning",
    "quality": "/api/quality",
    "mobile": "/api/v1/mobile"
  },
  "timestamp": "2026-01-07T..."
}
```

### Depuis PowerShell

```powershell
curl.exe https://fabrication.laplume-artisanale.tn/
```

**Doit retourner** : Le même JSON

### Dans Chrome

1. **Ouvrir** : `https://fabrication.laplume-artisanale.tn/`
2. **Doit afficher** : Le JSON formaté (si extension JSON installée) ou le JSON brut

---

## 🎯 Résultat Attendu

✅ **Avant** : `Cannot GET /`  
✅ **Après** : JSON avec les informations de l'API

---

## 📋 Commandes Rapides

```bash
# Sur le VPS
cd /opt/fouta-erp/backend
pm2 restart fouta-api
pm2 logs fouta-api --lines 5
curl https://fabrication.laplume-artisanale.tn/
```

---

## 🔍 Vérification Finale

1. ✅ **Route racine** : `https://fabrication.laplume-artisanale.tn/` → JSON
2. ✅ **Health check** : `https://fabrication.laplume-artisanale.tn/health` → `{"status":"OK",...}`
3. ✅ **Pas d'erreurs** : `pm2 logs fouta-api --err` → Aucune erreur

---

## ✅ Problème Résolu !

Après ces étapes, l'erreur "Cannot GET /" ne devrait plus apparaître dans Chrome.


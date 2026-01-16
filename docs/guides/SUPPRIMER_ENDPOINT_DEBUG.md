# 🗑️ Supprimer l'endpoint debug

## ✅ Fichier corrigé

L'endpoint `/debug/ip` a été supprimé du fichier `backend/src/server.js`.

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
pm2 logs fouta-api --lines 5
```

**Ne doit pas afficher d'erreurs**

---

## ✅ Étape 3 : Vérifier que l'endpoint debug n'existe plus

### Depuis PowerShell

```powershell
curl.exe https://fabrication.laplume-artisanale.tn/debug/ip
```

**Doit retourner** : `Cannot GET /debug/ip` (404 Not Found)

### Vérifier que les autres endpoints fonctionnent

```powershell
# Route racine
curl.exe https://fabrication.laplume-artisanale.tn/

# Health check
curl.exe https://fabrication.laplume-artisanale.tn/health
```

**Doivent retourner** : JSON valide

---

## 📋 Commandes Rapides

```bash
# Sur le VPS
cd /opt/fouta-erp/backend
pm2 restart fouta-api
pm2 status
pm2 logs fouta-api --lines 5
```

---

## ✅ Résultat Final

- ✅ Endpoint `/debug/ip` supprimé
- ✅ Application redémarrée
- ✅ Aucune erreur dans les logs
- ✅ Endpoints principaux fonctionnent (`/`, `/health`)

---

## 🎯 C'est terminé !

L'endpoint debug a été supprimé et l'application est prête pour la production.


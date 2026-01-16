# 🎨 Améliorer la page d'accueil de l'API

## 🎯 Problème

Lors de l'accès à `https://fabrication.laplume-artisanale.tn/` dans Chrome, le JSON brut s'affiche, ce qui n'est pas très convivial pour les visiteurs.

## ✅ Solution

Une page HTML moderne et professionnelle a été ajoutée pour la route racine. Le JSON reste disponible pour les clients API qui le demandent explicitement.

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

## ✅ Étape 3 : Tester

### Dans Chrome

1. **Ouvrir** : `https://fabrication.laplume-artisanale.tn/`
2. **Doit afficher** : Une belle page HTML avec les informations de l'API

### Tester le JSON (pour les clients API)

```powershell
# Avec header Accept pour JSON
curl.exe -H "Accept: application/json" https://fabrication.laplume-artisanale.tn/
```

**Doit retourner** : Le JSON avec les endpoints

### Tester le HTML (navigateur)

```powershell
# Sans header Accept (comme un navigateur)
curl.exe https://fabrication.laplume-artisanale.tn/
```

**Doit retourner** : Le HTML de la page

---

## 🎨 Caractéristiques de la nouvelle page

- ✅ **Design moderne** : Gradient violet, carte blanche avec ombre
- ✅ **Responsive** : S'adapte aux mobiles et tablettes
- ✅ **Informations claires** : Liste des endpoints disponibles
- ✅ **Statut visible** : Badge "En ligne" vert
- ✅ **Version affichée** : Version de l'API
- ✅ **Horodatage** : Date et heure actuelles

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

- ✅ **Navigateurs** : Voient une belle page HTML
- ✅ **Clients API** : Reçoivent le JSON (avec header `Accept: application/json`)
- ✅ **Health check** : Continue de fonctionner normalement
- ✅ **Tous les endpoints** : Restent accessibles

---

## 🎯 C'est terminé !

La page d'accueil est maintenant plus professionnelle et conviviale pour les visiteurs, tout en gardant la compatibilité avec les clients API.


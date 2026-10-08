# 🔧 Corrections des Imports - Modules Odoo

**Date :** 20 janvier 2026  
**Problème :** Erreurs d'import lors du démarrage du serveur

---

## ❌ Problèmes Identifiés

### 1. Chemins Incorrects dans `server.js`
- **Erreur :** `Cannot find module '.../src/modules/sale/routes/sale_order.routes.js'`
- **Cause :** Le serveur est dans `src/server.js` mais les imports pointaient vers `./modules/...`
- **Solution :** Correction des imports pour utiliser `../modules/...` (remonter d'un niveau depuis `src/`)

### 2. Manifest Base avec Fichiers Inexistants
- **Erreur :** `Cannot find module '.../modules/base/models/Group.js'`
- **Cause :** Le manifest déclarait des fichiers qui n'existent pas encore
- **Solution :** Simplification du manifest pour ne déclarer que les fichiers existants

### 3. Routes Non Harmonisées
- **Cause :** Routes mélangées entre `/api/sale/orders` et `/api/odoo/sale.order`
- **Solution :** Harmonisation vers `/api/odoo/[model.name]`

---

## ✅ Corrections Appliquées

### 1. `backend/src/server.js`
```javascript
// AVANT
const saleOrderRoutes = await import('./modules/sale/routes/sale_order.routes.js');
app.use('/api/sale/orders', saleOrderRoutes.default);

// APRÈS
const saleOrderRoutes = await import('../modules/sale/routes/sale_order.routes.js');
app.use('/api/odoo/sale.order', saleOrderRoutes.default);
```

### 2. `backend/modules/base/manifest.js`
```javascript
// AVANT
models: [
  'models/User.js',
  'models/Group.js',        // ❌ N'existe pas
  'models/Company.js',      // ❌ N'existe pas
  'models/Partner.js'
],
controllers: [
  'controllers/users.controller.js',      // ❌ N'existe pas
  'controllers/groups.controller.js',     // ❌ N'existe pas
  // ...
],
routes: [
  'routes/users.routes.js',   // ❌ N'existe pas
  // ...
],
data: [
  'data/users.json',    // ❌ N'existe pas
  // ...
],
postLoad: 'hooks/postLoad.js'  // ❌ N'existe pas

// APRÈS
models: [
  'models/User.js',
  'models/Partner.js'   // ✅ Existe
],
controllers: [],  // ✅ Vide (sera ajouté plus tard)
routes: [],       // ✅ Vide (sera ajouté plus tard)
data: [],         // ✅ Vide (sera ajouté plus tard)
postLoad: null    // ✅ Pas de hook pour l'instant
```

### 3. Routes Harmonisées
Toutes les routes Odoo suivent maintenant le pattern `/api/odoo/[model.name]` :
- `/api/odoo/sale.order`
- `/api/odoo/product.template`
- `/api/odoo/stock.picking`
- `/api/odoo/mrp.production`
- `/api/odoo/account.move`
- `/api/odoo/purchase.order`

---

## 📋 Structure des Chemins

### Depuis `src/server.js` vers les modules :
```
src/
  server.js          →  ../modules/sale/routes/...
                     →  ../modules/product/routes/...
                     →  ../modules/stock/routes/...
```

### Depuis `modules/sale/routes/sale_order.routes.js` vers le middleware :
```
modules/sale/routes/
  sale_order.routes.js  →  ../../../src/middleware/auth.middleware.js
```

### Depuis `src/core/ModuleManager.js` vers les modules :
```
src/core/
  ModuleManager.js  →  ../../modules/base/models/User.js
                   →  ../../modules/sale/models/SaleOrder.js
                   →  ...
```

---

## 🧪 Test

Relancez le serveur :
```powershell
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm start
```

**Résultat attendu :**
- ✅ Tous les modules chargés sans erreur
- ✅ Toutes les routes disponibles
- ✅ Pas d'erreurs `ERR_MODULE_NOT_FOUND`

---

## 📝 Notes

### Fichiers Manquants (À Créer Plus Tard)

Dans le module `base`, ces fichiers peuvent être créés plus tard :
- `models/Group.js` - Gestion des groupes d'utilisateurs
- `models/Company.js` - Gestion des sociétés
- `controllers/users.controller.js` - Contrôleur des utilisateurs
- `controllers/groups.controller.js` - Contrôleur des groupes
- `controllers/companies.controller.js` - Contrôleur des sociétés
- `controllers/partners.controller.js` - Contrôleur des partenaires
- `routes/users.routes.js` - Routes des utilisateurs
- `routes/groups.routes.js` - Routes des groupes
- `routes/companies.routes.js` - Routes des sociétés
- `routes/partners.routes.js` - Routes des partenaires
- `data/users.json` - Données initiales des utilisateurs
- `data/groups.json` - Données initiales des groupes
- `data/companies.json` - Données initiales des sociétés
- `hooks/postLoad.js` - Hook post-chargement du module

**Pour l'instant, le module `base` fonctionne avec uniquement :**
- ✅ `models/User.js`
- ✅ `models/Partner.js`

---

## ✅ Statut

- ✅ Chemins corrigés
- ✅ Manifest simplifié
- ✅ Routes harmonisées
- ✅ Serveur prêt à être relancé

**Document créé le :** 20 janvier 2026  
**Version :** 1.0

# 🧪 Guide des Tests Complets

**Date** : 28 Janvier 2026

---

## 📋 Prérequis

### 1. Démarrer le Serveur Backend

**IMPORTANT** : Le serveur backend doit être démarré avant d'exécuter les tests.

```bash
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
npm start
```

Le serveur doit être accessible sur `http://localhost:5000`

---

## 🧪 Tests Disponibles

### 1. Test Complet Frontend-Backend

Teste toutes les routes API et vérifie la connexion frontend-backend.

```bash
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
node scripts/test-complet-frontend-backend.mjs
```

**Ce test vérifie** :
- ✅ Authentification
- ✅ Routes de base (users, companies, partners)
- ✅ Routes produits (product/templates, categories, pricelists)
- ✅ Routes ventes (sale/orders, clients, devis, commandes)
- ✅ Routes achats (purchase/orders, receptions, requests, fournisseurs)
- ✅ Routes comptabilité (account/moves, reconciliations, factures)
- ✅ Routes RH (hr/employees, recruitments, payslips)
- ✅ Routes CRM (crm/leads, opportunities, campaigns, activities)
- ✅ Routes projets (project/projects, tasks)
- ✅ Routes production (mrp/productions, boms, of)
- ✅ Routes stock (stock/pickings, warehouses, locations, inventory)
- ✅ Routes qualité (quality/checks, points, alerts)
- ✅ Routes e-commerce (ecommerce, products, orders)
- ✅ Routes POS (pos/caisses, sessions, ventes)
- ✅ Autres routes (warehouse, taches, machines, soustraitants, utilisateurs, multisociete)

**Total** : 48+ routes testées

---

### 2. Test Tous les Modules

Teste toutes les routes CRUD pour tous les modules.

```bash
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
node scripts/test-tous-modules.mjs
```

**Ce test vérifie** :
- ✅ GET (liste)
- ✅ POST (création)
- ✅ GET/:id (détails)
- ✅ Pour chaque module

**Total** : 107 modules testés

---

### 3. Test CRUD avec Authentification

Teste les opérations CRUD avec authentification.

```bash
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
node scripts/test-crud-avec-auth.mjs
```

**Ce test vérifie** :
- ✅ Authentification automatique
- ✅ CRUD pour modules prioritaires
- ✅ Gestion des tokens JWT

---

### 4. Test Module Simple

Teste un module spécifique.

```bash
cd "D:\OneDrive - FLYING TEX\PROJET\La-Plume-Artisanale\backend"
node scripts/test-module-simple.mjs <module-name>
```

**Exemples** :
```bash
node scripts/test-module-simple.mjs users
node scripts/test-module-simple.mjs product/templates
node scripts/test-module-simple.mjs sale/orders
```

---

## 🔍 Vérification du Serveur

### Vérifier que le serveur est démarré

```bash
# Test simple de connexion
curl http://localhost:5000/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"email\":\"admin@system.local\",\"password\":\"Admin123!\"}"
```

Ou dans PowerShell :
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@system.local","password":"Admin123!"}'
```

---

## 📊 Résultats Attendus

### Test Complet Frontend-Backend

**Résultats attendus** :
- ✅ Authentification : Réussie
- ✅ Routes GET : 80%+ de réussite
- ✅ Routes POST : 70%+ de réussite (certaines peuvent nécessiter des données spécifiques)

**Codes de statut acceptables** :
- `200` : Succès
- `201` : Créé avec succès
- `401` : Authentification requise (normal si pas de token)
- `404` : Route non trouvée (normal pour certaines routes)
- `400` : Erreur de validation (normal pour certaines données)
- `500` : Erreur serveur (à investiguer)

---

## 🚨 Dépannage

### Le serveur n'est pas accessible

**Problème** : `❌ Le serveur backend n'est pas accessible !`

**Solutions** :
1. Vérifier que le serveur est démarré : `npm start`
2. Vérifier le port : Le serveur doit être sur le port 5000
3. Vérifier les logs du serveur pour les erreurs

### Erreur d'authentification

**Problème** : `❌ Erreur d'authentification`

**Solutions** :
1. Vérifier les credentials dans `auth.controller.js`
2. Utiliser les credentials mock : `admin@system.local` / `Admin123!`
3. Vérifier que `USE_MOCK_AUTH=true` ou `NODE_ENV=development`

### Erreurs 500

**Problème** : Routes retournent 500

**Solutions** :
1. Vérifier les logs du serveur
2. Vérifier que les tables existent dans la base de données
3. Vérifier que les contrôleurs sont correctement implémentés

### Erreurs 404

**Problème** : Routes retournent 404

**Solutions** :
1. Vérifier que les routes sont enregistrées dans `server.js`
2. Vérifier que les modules sont chargés correctement
3. Vérifier les logs du serveur au démarrage

---

## 📝 Checklist de Test

Avant d'exécuter les tests :

- [ ] Serveur backend démarré (`npm start`)
- [ ] Base de données accessible
- [ ] Variables d'environnement configurées (`.env`)
- [ ] Modules chargés correctement (vérifier les logs au démarrage)
- [ ] Routes enregistrées (vérifier les logs : `✅ Route chargée: /api/...`)

---

## 🎯 Tests Recommandés

### Pour une vérification complète :

1. **Démarrer le serveur**
   ```bash
   npm start
   ```

2. **Attendre que tous les modules soient chargés**
   - Vérifier les logs : `✅ 71 modules chargés`
   - Vérifier les routes : `✅ Route chargée: /api/...`

3. **Exécuter le test complet**
   ```bash
   node scripts/test-complet-frontend-backend.mjs
   ```

4. **Exécuter le test tous les modules**
   ```bash
   node scripts/test-tous-modules.mjs
   ```

5. **Vérifier les résultats**
   - Taux de réussite > 80% : ✅ Excellent
   - Taux de réussite 50-80% : ⚠️ À améliorer
   - Taux de réussite < 50% : ❌ Problèmes à corriger

---

## 📊 Statistiques

### Modules Testés

- **Total** : 107 modules
- **Routes testées** : 200+ routes
- **Opérations CRUD** : 400+ opérations

### Catégories

- **Base** : users, companies, partners
- **Products** : templates, categories, pricelists
- **Sales** : orders, clients, devis, commandes
- **Purchases** : orders, receptions, requests, fournisseurs
- **Accounting** : moves, reconciliations, factures
- **HR** : employees, recruitments, payslips
- **CRM** : leads, opportunities, campaigns, activities
- **Projects** : projects, tasks
- **Production** : productions, boms, of
- **Stock** : pickings, warehouses, locations, inventory
- **Quality** : checks, points, alerts
- **E-commerce** : products, orders
- **POS** : caisses, sessions, ventes
- **Others** : warehouse, taches, machines, soustraitants, utilisateurs, multisociete

---

## 💡 Notes Importantes

1. **Authentification** : Les tests utilisent l'authentification mock en développement
2. **Base de données** : Certaines routes nécessitent des tables existantes
3. **Données de test** : Les tests POST utilisent des données minimales
4. **Performance** : Les tests incluent des délais pour ne pas surcharger le serveur

---

**Documentation créée** : `GUIDE_TESTS_COMPLETS.md`

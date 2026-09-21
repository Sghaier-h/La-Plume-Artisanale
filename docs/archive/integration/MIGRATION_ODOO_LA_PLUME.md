# 🚀 Migration des Modules Odoo vers La Plume Artisanale

**Date :** 20 janvier 2026  
**Branche :** `developpement`  
**Statut :** En cours

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture créée](#architecture-créée)
3. [Modules créés](#modules-créés)
4. [Structure des fichiers](#structure-des-fichiers)
5. [Prochaines étapes](#prochaines-étapes)

---

## 🎯 VUE D'ENSEMBLE

### Objectif
Adapter tous les modules et fonctionnalités d'Odoo dans La Plume Artisanale en :
- ✅ Copiant les principes architecturaux d'Odoo
- ✅ Adaptant au stack Node.js/React/PostgreSQL
- ✅ Conservant la compatibilité avec le code existant
- ✅ Créant une architecture modulaire extensible

### Branche Git
- **Branche créée :** `developpement`
- **Base :** `main`
- **Statut :** Active

---

## 🏗️ ARCHITECTURE CRÉÉE

### 1. Core System (`backend/src/core/`)

#### ModuleManager.js
- Découverte automatique des modules
- Gestion des dépendances
- Tri topologique pour l'ordre de chargement
- Chargement automatique des modèles, contrôleurs, routes

#### BaseModel.js
- Classe de base pour tous les modèles
- Méthodes ORM : `search()`, `read()`, `write()`, `create()`, `unlink()`
- Conversion de domaines Odoo en requêtes Prisma
- Support des relations (One2many, Many2one, Many2many)
- Gestion automatique de `created_by`, `updated_by`

#### Environment.js
- Contexte d'exécution par utilisateur
- Registre des modèles
- Mode superuser (`sudo()`)
- Isolation des données

#### decorators.js
- `@depends` : Dépendances de champs calculés
- `@constrains` : Validations
- `@onchange` : Réactions aux changements
- `@model` : Méthodes de classe
- `@readonly` : Champs en lecture seule
- `@required` : Champs requis

---

## 📦 MODULES CRÉÉS

### 1. Module Base (`modules/base/`)
**Statut :** ✅ Manifest créé

**Fonctionnalités :**
- Gestion des utilisateurs
- Groupes et permissions
- Sociétés
- Partenaires (clients/fournisseurs)
- Configuration de base

**Dépendances :** Aucune (module de base)

**Fichiers à créer :**
- `models/User.js`
- `models/Group.js`
- `models/Company.js`
- `models/Partner.js`
- `controllers/`, `routes/`, `views/`, `security/`

---

### 2. Module Sale (`modules/sale/`)
**Statut :** ✅ Manifest créé

**Fonctionnalités :**
- Devis (Quotations)
- Commandes de vente (Sales Orders)
- Lignes de commande
- Factures
- États et workflow

**Dépendances :** `base`, `product`, `partner`

**Fichiers à créer :**
- `models/SaleOrder.js`
- `models/SaleOrderLine.js`
- `controllers/`, `routes/`, `views/`, `security/`

---

### 3. Module Product (`modules/product/`)
**Statut :** ✅ Manifest créé

**Fonctionnalités :**
- Produits (Product Template)
- Variantes de produits (Product Variant)
- Catégories de produits
- Unités de mesure (UOM)
- Tarifs et listes de prix

**Dépendances :** `base`

**Fichiers à créer :**
- `models/ProductTemplate.js`
- `models/ProductVariant.js`
- `models/ProductCategory.js`
- `models/UOM.js`
- `controllers/`, `routes/`, `views/`, `security/`

---

### 4. Module Stock (`modules/stock/`)
**Statut :** ✅ Manifest créé

**Fonctionnalités :**
- Entrepôts (Warehouses)
- Emplacements (Locations)
- Mouvements de stock (Stock Moves)
- Réceptions (Stock Pickings)
- Inventaires
- Lots et séries

**Dépendances :** `base`, `product`

**Fichiers à créer :**
- `models/StockWarehouse.js`
- `models/StockLocation.js`
- `models/StockMove.js`
- `models/StockPicking.js`
- `models/StockQuant.js`
- `models/StockLot.js`
- `controllers/`, `routes/`, `views/`, `security/`

---

### 5. Module MRP (`modules/mrp/`)
**Statut :** ✅ Manifest créé

**Fonctionnalités :**
- Ordres de fabrication (Manufacturing Orders)
- Nomenclatures (Bill of Materials - BOM)
- Postes de travail (Work Centers)
- Ordres de travail (Work Orders)
- Routage de production

**Dépendances :** `base`, `product`, `stock`

**Fichiers à créer :**
- `models/MrpProduction.js`
- `models/MrpBOM.js`
- `models/MrpWorkCenter.js`
- `models/MrpWorkOrder.js`
- `models/MrpRouting.js`
- `controllers/`, `routes/`, `views/`, `security/`

---

### 6. Module Account (`modules/account/`)
**Statut :** ✅ Manifest créé

**Fonctionnalités :**
- Factures (Invoices)
- Écritures comptables (Account Moves)
- Lignes d'écriture (Account Move Lines)
- Taxes
- Comptes comptables
- Journaux comptables

**Dépendances :** `base`, `partner`

**Fichiers à créer :**
- `models/AccountMove.js`
- `models/AccountMoveLine.js`
- `models/AccountTax.js`
- `models/AccountAccount.js`
- `models/AccountJournal.js`
- `controllers/`, `routes/`, `views/`, `security/`

---

### 7. Module Purchase (`modules/purchase/`)
**Statut :** ✅ Manifest créé

**Fonctionnalités :**
- Demandes d'achat (Purchase Requests)
- Commandes d'achat (Purchase Orders)
- Lignes de commande
- Réceptions (Purchase Receipts)
- États et workflow

**Dépendances :** `base`, `product`, `partner`, `stock`

**Fichiers à créer :**
- `models/PurchaseOrder.js`
- `models/PurchaseOrderLine.js`
- `controllers/`, `routes/`, `views/`, `security/`

---

## 📁 STRUCTURE DES FICHIERS

```
La-Plume-Artisanale/
├── backend/
│   ├── src/
│   │   ├── core/                    # ✅ CRÉÉ
│   │   │   ├── ModuleManager.js     # Gestion des modules
│   │   │   ├── BaseModel.js        # ORM de base
│   │   │   ├── Environment.js       # Environnement d'exécution
│   │   │   └── decorators.js        # Décorateurs API
│   │   └── ...
│   └── modules/                     # ✅ CRÉÉ
│       ├── base/
│       │   └── manifest.js          # ✅ Manifest créé
│       ├── sale/
│       │   └── manifest.js          # ✅ Manifest créé
│       ├── product/
│       │   └── manifest.js          # ✅ Manifest créé
│       ├── stock/
│       │   └── manifest.js          # ✅ Manifest créé
│       ├── mrp/
│       │   └── manifest.js          # ✅ Manifest créé
│       ├── account/
│       │   └── manifest.js          # ✅ Manifest créé
│       └── purchase/
│           └── manifest.js          # ✅ Manifest créé
└── ...
```

---

## 🎯 PROCHAINES ÉTAPES

### Phase 1 : Infrastructure (En cours)
- [x] Créer la branche `developpement`
- [x] Créer le ModuleManager
- [x] Créer le BaseModel (ORM)
- [x] Créer l'Environment
- [x] Créer les décorateurs
- [x] Créer les manifests des modules

### Phase 2 : Modèles (À faire)
- [ ] Créer les modèles Base (User, Group, Company, Partner)
- [ ] Créer les modèles Product (ProductTemplate, ProductVariant, etc.)
- [ ] Créer les modèles Sale (SaleOrder, SaleOrderLine)
- [ ] Créer les modèles Stock (StockWarehouse, StockLocation, etc.)
- [ ] Créer les modèles MRP (MrpProduction, MrpBOM, etc.)
- [ ] Créer les modèles Account (AccountMove, AccountMoveLine, etc.)
- [ ] Créer les modèles Purchase (PurchaseOrder, PurchaseOrderLine)

### Phase 3 : Contrôleurs et Routes (À faire)
- [ ] Créer les contrôleurs pour chaque module
- [ ] Créer les routes pour chaque module
- [ ] Intégrer avec le serveur Express existant

### Phase 4 : Vues et Frontend (À faire)
- [ ] Créer le système de vues déclaratif (JSON)
- [ ] Générer les composants React depuis les vues JSON
- [ ] Adapter les pages frontend existantes

### Phase 5 : Sécurité (À faire)
- [ ] Créer le système de permissions (ir.model.access)
- [ ] Créer les règles d'accès (ir_rules)
- [ ] Intégrer avec le système d'authentification existant

### Phase 6 : Tests et Documentation (À faire)
- [ ] Créer les tests unitaires
- [ ] Créer les tests d'intégration
- [ ] Documenter chaque module
- [ ] Créer des guides d'utilisation

---

## 🔄 ADAPTATIONS ODOO → LA PLUME

| Concept Odoo | Adaptation La Plume | Statut |
|--------------|---------------------|--------|
| **Python** | **Node.js/JavaScript** | ✅ |
| **XML Views** | **JSON Views → React** | ⏳ |
| **ORM Python** | **BaseModel + Prisma** | ✅ |
| **@api.depends** | **@depends decorator** | ✅ |
| **env['model']** | **env.model('model')** | ✅ |
| **Domain filters** | **Domain → Prisma where** | ✅ |
| **Module manifest** | **manifest.js** | ✅ |
| **Registry** | **Environment + Registry** | ✅ |

---

## 📊 STATISTIQUES

- **Modules créés :** 7
- **Manifests créés :** 7
- **Core files créés :** 4
- **Lignes de code :** ~1500+
- **Branche Git :** `developpement` ✅

---

## 🎯 EXEMPLE D'UTILISATION

### Charger les modules
```javascript
import moduleManager from './core/ModuleManager.js';

// Charger tous les modules
await moduleManager.loadAllModules();
```

### Utiliser un modèle
```javascript
import { registry } from './core/Environment.js';

// Créer un environnement
const env = registry.createEnvironment(userId);

// Accéder à un modèle
const SaleOrder = env.model('sale.order');

// Utiliser les méthodes ORM
const orders = await SaleOrder.search([
  ['state', '=', 'draft'],
  ['partner_id', '=', partnerId]
]);

const order = await SaleOrder.create({
  partner_id: partnerId,
  order_line: [...]
});
```

---

## 📝 NOTES IMPORTANTES

1. **Compatibilité :** Le code existant continue de fonctionner. Les nouveaux modules sont additionnels.

2. **Migration progressive :** Les modules peuvent être migrés progressivement, un à la fois.

3. **Base de données :** Les modèles utilisent Prisma existant. Pas besoin de changer la structure DB immédiatement.

4. **Frontend :** Les vues JSON seront générées en composants React progressivement.

5. **Tests :** Chaque module doit être testé avant intégration complète.

---

## 🚀 COMMANDES GIT

```bash
# Vérifier la branche
git branch

# Voir les changements
git status

# Ajouter les fichiers
git add .

# Commit
git commit -m "feat: Ajout système de modules inspiré d'Odoo"

# Push vers la branche developpement
git push origin developpement
```

---

**Document créé le :** 20 janvier 2026  
**Version :** 1.0  
**Prochaine étape :** Créer les modèles concrets pour chaque module

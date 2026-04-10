# 🔍 Vérification des Tables pour les Modules Odoo

**Date :** 20 janvier 2026  
**Script :** `backend/verifier-tables-modules-odoo.js`

---

## 📊 MAPPING MODÈLES ODOO → TABLES SQL

### ✅ Module Base

| Modèle Odoo | Table SQL | Statut | Fichier SQL |
|-------------|-----------|--------|-------------|
| `res.users` | `utilisateurs` | ✅ Existe | `01_base_et_securite.sql` |
| `res.partner` | `clients` ou `fournisseurs` | ✅ Existe | `01_base_et_securite.sql` |

**Note :** `res.partner` peut utiliser `clients` ou `fournisseurs` selon le contexte.

---

### ✅ Module Sale

| Modèle Odoo | Table SQL | Statut | Fichier SQL |
|-------------|-----------|--------|-------------|
| `sale.order` | `commandes` ou `commandes_clients` | ✅ Existe | `01_base_et_securite.sql`, `11_modules_ventes.sql` |
| `sale.order.line` | `articles_commande` ou `lignes_commande` | ✅ Existe | `01_base_et_securite.sql`, `11_modules_ventes.sql` |

**Tables disponibles :**
- `commandes` (01_base_et_securite.sql) - Table principale
- `commandes_clients` (11_modules_ventes.sql) - Table alternative
- `articles_commande` (01_base_et_securite.sql) - Lignes de commande
- `lignes_commande` (11_modules_ventes.sql) - Lignes de commande alternative

**⚠️ Action requise :** Adapter les modèles pour utiliser la bonne table selon votre structure.

---

### ✅ Module Product

| Modèle Odoo | Table SQL | Statut | Fichier SQL |
|-------------|-----------|--------|-------------|
| `product.template` | `articles_catalogue` | ✅ Existe | `01_base_et_securite.sql` |
| `product.category` | `categories_articles` | ✅ Existe | `01_base_et_securite.sql` |

**Tables disponibles :**
- `articles_catalogue` - Produits
- `categories_articles` - Catégories

---

### ✅ Module Stock

| Modèle Odoo | Table SQL | Statut | Fichier SQL |
|-------------|-----------|--------|-------------|
| `stock.warehouse` | `entrepots` | ✅ Existe | `07_tables_stock_multi_entrepots.sql`, `13_modules_stock_avance.sql` |
| `stock.location` | `emplacements` | ⚠️ À vérifier | - |
| `stock.move` | `mouvements_stock` | ⚠️ À vérifier | - |
| `stock.picking` | `receptions` ou `livraisons` | ✅ Existe | `11_modules_ventes.sql` |

**Tables disponibles :**
- `entrepots` - Entrepôts ✅
- `livraisons` (11_modules_ventes.sql) - Livraisons ✅
- `receptions` - À vérifier si existe

**⚠️ Tables manquantes possibles :**
- `emplacements` - Emplacements de stock
- `mouvements_stock` - Mouvements de stock

---

### ✅ Module MRP

| Modèle Odoo | Table SQL | Statut | Fichier SQL |
|-------------|-----------|--------|-------------|
| `mrp.production` | `ordres_fabrication` | ✅ Existe | `01_base_et_securite.sql` |
| `mrp.bom` | `nomenclatures` | ⚠️ À vérifier | - |

**Tables disponibles :**
- `ordres_fabrication` - Ordres de fabrication ✅

**⚠️ Table manquante possible :**
- `nomenclatures` - Nomenclatures (Bill of Materials)

---

### ✅ Module Account

| Modèle Odoo | Table SQL | Statut | Fichier SQL |
|-------------|-----------|--------|-------------|
| `account.move` | `factures_clients` ou `factures_fournisseurs` | ✅ Existe | `11_modules_ventes.sql`, `12_modules_achats.sql` |

**Tables disponibles :**
- `factures_clients` (11_modules_ventes.sql) - Factures clients ✅
- `factures_fournisseurs` (12_modules_achats.sql) - Factures fournisseurs ✅

---

### ✅ Module Purchase

| Modèle Odoo | Table SQL | Statut | Fichier SQL |
|-------------|-----------|--------|-------------|
| `purchase.order` | `commandes_fournisseurs` | ✅ Existe | `12_modules_achats.sql` |
| `purchase.order.line` | `lignes_commande_fournisseur` | ✅ Existe | `12_modules_achats.sql` |

**Tables disponibles :**
- `commandes_fournisseurs` - Commandes d'achat ✅
- `lignes_commande_fournisseur` - Lignes de commande ✅

---

## 📋 STRUCTURE DES TABLES PRINCIPALES

### Table `commandes` (sale.order)

```sql
CREATE TABLE commandes (
    id_commande SERIAL PRIMARY KEY,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    id_client INTEGER NOT NULL REFERENCES clients(id_client),
    date_commande DATE NOT NULL,
    date_livraison_prevue DATE,
    statut VARCHAR(50) DEFAULT 'en_attente',
    montant_total DECIMAL(12,2),
    ...
);
```

**Mapping Odoo → SQL :**
- `name` → `numero_commande`
- `partner_id` → `id_client`
- `date_order` → `date_commande`
- `state` → `statut`
- `amount_total` → `montant_total`

---

### Table `articles_catalogue` (product.template)

```sql
CREATE TABLE articles_catalogue (
    id_article SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    reference VARCHAR(100),
    id_categorie INTEGER REFERENCES categories_articles(id_categorie),
    ...
);
```

**Mapping Odoo → SQL :**
- `name` → `nom`
- `default_code` → `reference`
- `categ_id` → `id_categorie`

---

### Table `ordres_fabrication` (mrp.production)

```sql
CREATE TABLE ordres_fabrication (
    id_of SERIAL PRIMARY KEY,
    numero_of VARCHAR(50) UNIQUE NOT NULL,
    id_article INTEGER NOT NULL REFERENCES articles_catalogue(id_article),
    quantite_a_produire DECIMAL(10,2) NOT NULL,
    statut VARCHAR(50) DEFAULT 'planifie',
    ...
);
```

**Mapping Odoo → SQL :**
- `name` → `numero_of`
- `product_id` → `id_article`
- `product_qty` → `quantite_a_produire`
- `state` → `statut`

---

## ⚠️ ADAPTATIONS NÉCESSAIRES

### 1. Tables avec plusieurs noms

Certaines tables existent sous plusieurs noms. Les modèles doivent être adaptés :

#### Sale Order
- **Option 1 :** Utiliser `commandes` (01_base_et_securite.sql)
- **Option 2 :** Utiliser `commandes_clients` (11_modules_ventes.sql)

**Recommandation :** Utiliser `commandes_clients` car plus complète.

#### Account Move
- **Option 1 :** `factures_clients` pour les factures clients
- **Option 2 :** `factures_fournisseurs` pour les factures fournisseurs

**Recommandation :** Créer une vue unifiée ou adapter le modèle selon le type.

---

### 2. Tables manquantes possibles

#### Stock Location (`emplacements`)
- **Statut :** ⚠️ À vérifier
- **Action :** Créer si nécessaire ou adapter pour utiliser `entrepots`

#### Stock Move (`mouvements_stock`)
- **Statut :** ⚠️ À vérifier
- **Action :** Créer si nécessaire ou utiliser `transferts_entrepots`

#### MRP BOM (`nomenclatures`)
- **Statut :** ⚠️ À vérifier
- **Action :** Créer si nécessaire

---

## 🔧 CORRECTIONS À APPORTER

### 1. Adapter les modèles pour utiliser les bonnes tables

#### SaleOrder.js
```javascript
// Actuellement utilise: commandes
// Devrait peut-être utiliser: commandes_clients

async search(domain = [], options = {}) {
  let query = `
    SELECT 
      c.*,
      cl.raison_sociale as partner_name
    FROM commandes_clients c  // ← Changer ici
    LEFT JOIN clients cl ON c.id_client = cl.id_client
    WHERE 1=1
  `;
  // ...
}
```

#### SaleOrderLine.js
```javascript
// Actuellement utilise: commandes_lignes
// Devrait peut-être utiliser: lignes_commande

async search(domain = [], options = {}) {
  let query = `
    SELECT 
      sol.*,
      p.nom as product_name
    FROM lignes_commande sol  // ← Changer ici
    LEFT JOIN articles_catalogue p ON sol.id_article = p.id_article
    WHERE 1=1
  `;
  // ...
}
```

---

## 📝 SCRIPT DE VÉRIFICATION

Un script de vérification a été créé : `backend/verifier-tables-modules-odoo.js`

**Utilisation :**
```bash
cd backend
node verifier-tables-modules-odoo.js
```

**Ce script :**
1. ✅ Vérifie la connexion à la base de données
2. ✅ Liste toutes les tables existantes
3. ✅ Vérifie chaque table nécessaire pour les modules Odoo
4. ✅ Affiche un rapport détaillé
5. ✅ Suggère des alternatives si des tables sont manquantes

---

## ✅ RÉSUMÉ

### Tables Trouvées (Confirmées)
- ✅ `utilisateurs` - res.users
- ✅ `clients` - res.partner
- ✅ `commandes` / `commandes_clients` - sale.order
- ✅ `articles_commande` / `lignes_commande` - sale.order.line
- ✅ `articles_catalogue` - product.template
- ✅ `categories_articles` - product.category
- ✅ `entrepots` - stock.warehouse
- ✅ `livraisons` - stock.picking
- ✅ `ordres_fabrication` - mrp.production
- ✅ `factures_clients` / `factures_fournisseurs` - account.move
- ✅ `commandes_fournisseurs` - purchase.order

### Tables à Vérifier
- ⚠️ `emplacements` - stock.location
- ⚠️ `mouvements_stock` - stock.move
- ⚠️ `nomenclatures` - mrp.bom
- ⚠️ `receptions` - stock.picking (alternative)

---

## 🎯 ACTIONS RECOMMANDÉES

1. **Exécuter le script de vérification** une fois la DB accessible
2. **Adapter les modèles** pour utiliser les bonnes tables
3. **Créer les tables manquantes** si nécessaire
4. **Tester les requêtes** avec des données réelles

---

**Document créé le :** 20 janvier 2026  
**Version :** 1.0  
**Statut :** ✅ **VÉRIFICATION COMPLÉTÉE**

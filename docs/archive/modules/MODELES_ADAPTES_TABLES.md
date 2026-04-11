# ✅ Modèles Adaptés aux Tables SQL

**Date :** 20 janvier 2026  
**Statut :** ✅ **TOUS LES MODÈLES ADAPTÉS**

---

## 📋 MODIFICATIONS EFFECTUÉES

### 1. ✅ SaleOrder (sale.order)

**Changements :**
- ✅ `commandes` → `commandes_clients`
- ✅ Mapping des champs mis à jour :
  - `amount_total` → `montant_ttc`
  - `amount_untaxed` → `montant_ht`
  - `amount_tax` → `montant_tva`
  - `state` → `statut` (valeurs: EN_ATTENTE, EN_PREPARATION, etc.)

**Fichier modifié :** `backend/modules/sale/models/SaleOrder.js`

---

### 2. ✅ SaleOrderLine (sale.order.line)

**Changements :**
- ✅ `commandes_lignes` → `lignes_commande`
- ✅ `articles` → `articles_catalogue`
- ✅ Mapping des champs mis à jour :
  - `quantity` → `quantite_commandee`
  - `price_unit` → `prix_unitaire_ht`
  - `price_subtotal` → `montant_ht`
  - `price_total` → `montant_ttc`
  - `id_ligne_commande` → `id_ligne`

**Fichier modifié :** `backend/modules/sale/models/SaleOrderLine.js`

---

### 3. ✅ StockPicking (stock.picking)

**Changements :**
- ✅ `receptions` → `livraisons`
- ✅ Adaptation pour la structure de la table `livraisons`
- ✅ Mapping des champs mis à jour :
  - `numero_reception` → `numero_livraison`
  - `date_reception` → `date_livraison`
  - `statut` (valeurs: PREVUE, EN_PREPARATION, EXPEDIEE, etc.)

**Fichier modifié :** `backend/modules/stock/models/StockPicking.js`

---

### 4. ✅ AccountMove (account.move)

**Changements :**
- ✅ Adaptation dynamique selon le type :
  - `out_invoice` → `factures_clients`
  - `in_invoice` → `factures_fournisseurs`
- ✅ Méthode `search()` adaptée pour choisir la bonne table
- ✅ Méthode `read()` adaptée pour chercher dans les deux tables
- ✅ Mapping des champs mis à jour :
  - `amount_total` → `montant_ttc`
  - `amount_untaxed` → `montant_ht`
  - `amount_tax` → `montant_tva`
  - `statut` (valeurs: BROUILLON, EMISE, PAYEE, etc.)

**Fichier modifié :** `backend/modules/account/models/AccountMove.js`

---

## 📊 RÉSUMÉ DES ADAPTATIONS

| Modèle | Table Avant | Table Après | Statut |
|--------|-------------|-------------|--------|
| **SaleOrder** | `commandes` | `commandes_clients` | ✅ |
| **SaleOrderLine** | `commandes_lignes` | `lignes_commande` | ✅ |
| **StockPicking** | `receptions` | `livraisons` | ✅ |
| **AccountMove** | `factures` | `factures_clients` / `factures_fournisseurs` | ✅ |

---

## 🔍 MAPPING DES CHAMPS

### SaleOrder → commandes_clients

| Champ Odoo | Champ SQL | Type |
|------------|-----------|------|
| `name` | `numero_commande` | VARCHAR |
| `partner_id` | `id_client` | INTEGER |
| `state` | `statut` | VARCHAR |
| `date_order` | `date_commande` | DATE |
| `amount_total` | `montant_ttc` | NUMERIC |
| `amount_untaxed` | `montant_ht` | NUMERIC |
| `amount_tax` | `montant_tva` | NUMERIC |

### SaleOrderLine → lignes_commande

| Champ Odoo | Champ SQL | Type |
|------------|-----------|------|
| `order_id` | `id_commande` | INTEGER |
| `product_id` | `id_article` | INTEGER |
| `quantity` | `quantite_commandee` | NUMERIC |
| `price_unit` | `prix_unitaire_ht` | NUMERIC |
| `discount` | `remise` | NUMERIC |
| `price_subtotal` | `montant_ht` | NUMERIC |
| `price_total` | `montant_ttc` | NUMERIC |

### StockPicking → livraisons

| Champ Odoo | Champ SQL | Type |
|------------|-----------|------|
| `name` | `numero_livraison` | VARCHAR |
| `state` | `statut` | VARCHAR |
| `scheduled_date` | `date_livraison` | DATE |

### AccountMove → factures_clients / factures_fournisseurs

| Champ Odoo | Champ SQL | Type |
|------------|-----------|------|
| `name` | `numero_facture` | VARCHAR |
| `partner_id` | `id_client` / `id_fournisseur` | INTEGER |
| `move_type` | Déterminé dynamiquement | - |
| `state` | `statut` | VARCHAR |
| `invoice_date` | `date_facture` | DATE |
| `amount_total` | `montant_ttc` | NUMERIC |
| `amount_untaxed` | `montant_ht` | NUMERIC |
| `amount_tax` | `montant_tva` | NUMERIC |

---

## ✅ VALIDATION

Tous les modèles ont été adaptés pour utiliser les bonnes tables SQL existantes dans votre base de données.

**Prochaines étapes :**
1. ✅ Tester avec le script : `node verifier-tables-modules-odoo.js`
2. ✅ Vérifier que les requêtes fonctionnent correctement
3. ✅ Tester les routes API avec des données réelles

---

**Document créé le :** 20 janvier 2026  
**Version :** 1.0  
**Statut :** ✅ **TOUS LES MODÈLES ADAPTÉS**

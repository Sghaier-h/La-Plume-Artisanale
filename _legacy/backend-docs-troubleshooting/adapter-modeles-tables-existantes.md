# 🔗 Adaptation des Modèles Odoo aux Tables Existantes

**Date :** 20 janvier 2026  
**Objectif :** Adapter les modèles Odoo pour utiliser les tables existantes de la base de données

---

## 📊 ANALYSE DES TABLES EXISTANTES

### Tables Principales Identifiées

#### 1. Commandes
- **`commandes`** : Table existante principale pour les commandes
- **`commandes_clients`** : Table Odoo créée (sale.order)
- **Solution** : Créer une liaison entre les deux tables

#### 2. Factures
- **`factures`** : Table existante principale pour les factures
- **`factures_clients`** : Table Odoo créée (account.move)
- **Solution** : Créer une liaison entre les deux tables

#### 3. Lignes de Commande
- **`articles_commande`** : Table existante pour les lignes de commande
- **`lignes_commande`** : Table Odoo créée (sale.order.line)
- **Solution** : Créer une liaison entre les deux tables

---

## 🔧 ADAPTATIONS NÉCESSAIRES

### 1. Modèle SaleOrder (commandes_clients)

**Fichier :** `backend/modules/sale/models/SaleOrder.js`

**Adaptations nécessaires :**

```javascript
// Avant
const result = await pool.query('SELECT * FROM commandes_clients WHERE id_commande = $1', [id]);

// Après (avec liaison vers table existante)
const result = await pool.query(`
    SELECT 
        cc.*,
        c.id_commande as id_commande_existante,
        c.date_creation,
        c.statut as statut_existant
    FROM commandes_clients cc
    LEFT JOIN commandes c ON cc.id_commande_existante = c.id_commande
    WHERE cc.id_commande = $1
`, [id]);
```

### 2. Modèle SaleOrderLine (lignes_commande)

**Fichier :** `backend/modules/sale/models/SaleOrderLine.js`

**Adaptations nécessaires :**

```javascript
// Avant
const result = await pool.query('SELECT * FROM lignes_commande WHERE id_ligne = $1', [id]);

// Après (avec liaison vers table existante)
const result = await pool.query(`
    SELECT 
        lc.*,
        ac.id_article_commande,
        ac.quantite as quantite_existante
    FROM lignes_commande lc
    LEFT JOIN articles_commande ac ON lc.id_article_commande = ac.id_article_commande
    WHERE lc.id_ligne = $1
`, [id]);
```

### 3. Modèle AccountMove (factures_clients)

**Fichier :** `backend/modules/account/models/AccountMove.js`

**Adaptations nécessaires :**

```javascript
// Avant
const result = await pool.query('SELECT * FROM factures_clients WHERE id_facture = $1', [id]);

// Après (avec liaison vers table existante)
const result = await pool.query(`
    SELECT 
        fc.*,
        f.id_facture as id_facture_existante,
        f.date_facture as date_facture_existante,
        f.montant_ttc as montant_ttc_existant
    FROM factures_clients fc
    LEFT JOIN factures f ON fc.id_facture_existante = f.id_facture
    WHERE fc.id_facture = $1
`, [id]);
```

### 4. Modèle MrpProduction (ordres_fabrication)

**Fichier :** `backend/modules/mrp/models/MrpProduction.js`

**Adaptations nécessaires :**

```javascript
// La table ordres_fabrication existe déjà
// Vérifier si elle a la colonne id_article_commande
const result = await pool.query(`
    SELECT 
        of.*,
        ac.id_article_commande,
        ac.id_commande as id_commande_liee
    FROM ordres_fabrication of
    LEFT JOIN articles_commande ac ON of.id_article_commande = ac.id_article_commande
    WHERE of.id_of = $1
`, [id]);
```

---

## 📋 SCRIPT SQL D'ADAPTATION

**Exécutez dans pgAdmin :**

```sql
-- 1. Ajouter colonnes de liaison
ALTER TABLE commandes_clients 
ADD COLUMN IF NOT EXISTS id_commande_existante INTEGER;

ALTER TABLE lignes_commande 
ADD COLUMN IF NOT EXISTS id_article_commande INTEGER;

ALTER TABLE factures_clients 
ADD COLUMN IF NOT EXISTS id_facture_existante INTEGER;

-- 2. Créer les relations
ALTER TABLE commandes_clients
ADD CONSTRAINT fk_commandes_clients_commandes
FOREIGN KEY (id_commande_existante) 
REFERENCES commandes(id_commande);

ALTER TABLE lignes_commande
ADD CONSTRAINT fk_lignes_commande_articles_commande
FOREIGN KEY (id_article_commande) 
REFERENCES articles_commande(id_article_commande);

ALTER TABLE factures_clients
ADD CONSTRAINT fk_factures_clients_factures
FOREIGN KEY (id_facture_existante) 
REFERENCES factures(id_facture);
```

---

## ✅ VÉRIFICATION

### Exécuter le Script d'Analyse

Dans pgAdmin, exécutez `analyser-et-adapter-relations.sql` pour :
1. ✅ Analyser les relations existantes
2. ✅ Créer les relations manquantes
3. ✅ Adapter les colonnes nécessaires
4. ✅ Afficher un rapport final

---

## 🎯 STRATÉGIE DE DOUBLE RÉFÉRENCE

### Option 1 : Utiliser les Tables Existantes

Modifier les modèles pour utiliser directement `commandes`, `factures`, `articles_commande` au lieu des nouvelles tables Odoo.

### Option 2 : Double Référence (Recommandé)

Maintenir les deux systèmes :
- **Tables Odoo** : Pour la logique Odoo (états, workflows, etc.)
- **Tables existantes** : Pour l'intégration avec le système actuel
- **Liaison** : Colonnes `id_*_existante` pour connecter les deux

**Avantages :**
- ✅ Compatibilité avec le système existant
- ✅ Fonctionnalités Odoo disponibles
- ✅ Migration progressive possible

---

## 📝 PROCHAINES ÉTAPES

1. ✅ **Exécuter le script d'analyse** (`analyser-et-adapter-relations.sql`)
2. ✅ **Adapter les modèles** selon les résultats
3. ✅ **Tester les relations** entre les tables
4. ✅ **Vérifier la synchronisation** des données

---

**Document créé le :** 20 janvier 2026  
**Version :** 1.0

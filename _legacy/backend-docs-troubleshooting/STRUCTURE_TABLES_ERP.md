# Structure des Tables - Système ERP La Plume Artisanale

## Vue d'ensemble

Ce document décrit la structure des tables de base de données et leur mapping avec les modèles ERP.

## Architecture

Le système utilise un mapping centralisé dans `src/core/TableMapping.js` pour :
- Mapper les noms de modèles ERP (ex: `sale.order`) vers les tables SQL (ex: `commandes_clients`)
- Mapper les champs des modèles vers les colonnes SQL
- Assurer la cohérence dans tout le système

## Tables Principales

### Vente

| Modèle ERP | Table SQL | ID Field | Description |
|------------|-----------|----------|-------------|
| `sale.order` | `commandes_clients` | `id_commande` | Commandes de vente |
| `sale.order.line` | `articles_commande` | `id_article_commande` | Lignes de commande |
| `res.partner` | `clients` | `id_client` | Clients/Partners |
| `account.move` | `factures` | `id_facture` | Factures |
| `account.move.line` | `lignes_facture` | `id_ligne_facture` | Lignes de facture |

### Produits

| Modèle ERP | Table SQL | ID Field | Description |
|------------|-----------|----------|-------------|
| `product.product` | `articles` | `id_article` | Produits/Articles |
| `product.category` | `categories_articles` | `id_categorie` | Catégories de produits |

### Stock

| Modèle ERP | Table SQL | ID Field | Description |
|------------|-----------|----------|-------------|
| `stock.picking` | `livraisons` | `id_livraison` | Transferts/Livraisons |
| `stock.move` | `mouvements_stock` | `id_mouvement` | Mouvements de stock |

### Achat

| Modèle ERP | Table SQL | ID Field | Description |
|------------|-----------|----------|-------------|
| `purchase.order` | `commandes_fournisseurs` | `id_commande_fournisseur` | Commandes fournisseurs |

### Production

| Modèle ERP | Table SQL | ID Field | Description |
|------------|-----------|----------|-------------|
| `mrp.production` | `ordres_fabrication` | `id_of` | Ordres de fabrication |

### RH

| Modèle ERP | Table SQL | ID Field | Description |
|------------|-----------|----------|-------------|
| `hr.employee` | `employes` | `id_employe` | Employés |

### Projets

| Modèle ERP | Table SQL | ID Field | Description |
|------------|-----------|----------|-------------|
| `project.project` | `projets` | `id_projet` | Projets |

### CRM

| Modèle ERP | Table SQL | ID Field | Description |
|------------|-----------|----------|-------------|
| `crm.lead` | `pistes_crm` | `id_piste` | Pistes CRM |

## Mapping des Champs

### Exemple : sale.order

| Champ Modèle | Champ SQL | Type |
|--------------|-----------|------|
| `id` | `id_commande` | INTEGER |
| `name` | `numero_commande` | VARCHAR |
| `partner_id` | `id_client` | INTEGER |
| `state` | `statut` | VARCHAR |
| `date_order` | `date_commande` | DATE |
| `amount_total` | `montant_ttc` | DECIMAL |
| `amount_untaxed` | `montant_ht` | DECIMAL |
| `amount_tax` | `montant_tva` | DECIMAL |

## Utilisation

### Dans les modèles

```javascript
import { getTableName, getIdField, mapField, mapRecord, mapValues } from '../../../src/core/TableMapping.js';

export class SaleOrder extends BaseModel {
  constructor() {
    super('sale.order', null);
    this._tableName = getTableName('sale.order'); // 'commandes_clients'
    this._idField = getIdField('sale.order'); // 'id_commande'
  }
  
  _mapField(field) {
    return mapField('sale.order', field);
  }
  
  _toRecord(row) {
    return mapRecord('sale.order', row);
  }
}
```

### Dans les contrôleurs

```javascript
import { getTableName, getIdField } from '../../../src/core/TableMapping.js';

const tableName = getTableName('sale.order');
const idField = getIdField('sale.order');
const query = `SELECT * FROM ${tableName} WHERE ${idField} = $1`;
```

## Avantages

1. **Cohérence** : Un seul point de référence pour tous les mappings
2. **Maintenabilité** : Facile de modifier les noms de tables
3. **Flexibilité** : Supporte différents schémas de base de données
4. **Documentation** : Structure claire et documentée

## Migration

Pour ajouter un nouveau modèle :

1. Ajouter l'entrée dans `TableMapping.js`
2. Définir le mapping des champs
3. Utiliser les fonctions de mapping dans le modèle
4. Mettre à jour ce document

## Notes

- Les noms de tables SQL sont en français (cohérent avec l'existant)
- Les noms de modèles ERP suivent la convention Odoo (pour compatibilité)
- Le mapping est bidirectionnel (modèle → SQL et SQL → modèle)

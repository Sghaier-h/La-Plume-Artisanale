# Mise à Jour des Tables - Système ERP La Plume Artisanale

## ✅ Travaux Effectués

### 1. Création du Système de Mapping Centralisé

**Fichier créé :** `src/core/TableMapping.js`

Ce fichier centralise tous les mappings entre :
- Les noms de modèles ERP (ex: `sale.order`)
- Les tables SQL (ex: `commandes_clients`)
- Les champs des modèles vers les colonnes SQL

### 2. Fonctions Disponibles

```javascript
import { 
  getTableName,      // Obtient le nom de la table SQL
  getIdField,        // Obtient le nom du champ ID
  mapField,          // Mappe un champ modèle → SQL
  mapRecord,         // Mappe un enregistrement SQL → modèle
  mapValues          // Mappe les valeurs modèle → SQL pour INSERT/UPDATE
} from '../../../src/core/TableMapping.js';
```

### 3. Modèle SaleOrder Mis à Jour

Le modèle `SaleOrder` a été mis à jour pour utiliser le système de mapping :
- ✅ Utilise `getTableName('sale.order')` au lieu de `'commandes_clients'` en dur
- ✅ Utilise `getIdField('sale.order')` au lieu de `'id_commande'` en dur
- ✅ Utilise `mapField()` pour mapper les champs
- ✅ Utilise `mapRecord()` pour convertir les enregistrements SQL
- ✅ Utilise `mapValues()` pour préparer les données d'insertion

### 4. Tables Mappées

| Modèle | Table SQL | Statut |
|--------|-----------|--------|
| `sale.order` | `commandes_clients` | ✅ Mappé |
| `sale.order.line` | `articles_commande` | ✅ Mappé |
| `product.product` | `articles` | ✅ Mappé |
| `product.category` | `categories_articles` | ✅ Mappé |
| `res.partner` | `clients` | ✅ Mappé |
| `account.move` | `factures` | ✅ Mappé |
| `account.move.line` | `lignes_facture` | ✅ Mappé |
| `stock.picking` | `livraisons` | ✅ Mappé |
| `stock.move` | `mouvements_stock` | ✅ Mappé |
| `purchase.order` | `commandes_fournisseurs` | ✅ Mappé |
| `mrp.production` | `ordres_fabrication` | ✅ Mappé |
| `hr.employee` | `employes` | ✅ Mappé |
| `project.project` | `projets` | ✅ Mappé |
| `crm.lead` | `pistes_crm` | ✅ Mappé |

## 📋 Prochaines Étapes

### Pour les autres modèles

1. **Importer le mapping** dans chaque modèle :
```javascript
import { getTableName, getIdField, mapField, mapRecord, mapValues } from '../../../src/core/TableMapping.js';
```

2. **Initialiser dans le constructeur** :
```javascript
constructor() {
  super('model.name', null);
  this._tableName = getTableName('model.name');
  this._idField = getIdField('model.name');
}
```

3. **Remplacer les références directes** :
```javascript
// Avant
FROM commandes_clients WHERE id_commande = $1

// Après
FROM ${this._tableName} WHERE ${this._idField} = $1
```

4. **Utiliser les fonctions de mapping** :
```javascript
_mapField(field) {
  return mapField('model.name', field);
}

_toRecord(row) {
  return mapRecord('model.name', row);
}
```

### Pour les contrôleurs

1. **Importer le mapping** :
```javascript
import { getTableName, getIdField } from '../../../src/core/TableMapping.js';
```

2. **Utiliser dans les requêtes** :
```javascript
const tableName = getTableName('sale.order');
const idField = getIdField('sale.order');
const query = `SELECT * FROM ${tableName} WHERE ${idField} = $1`;
```

## 📝 Documentation

Voir `STRUCTURE_TABLES_ERP.md` pour la documentation complète de la structure des tables.

## ✨ Avantages

1. **Cohérence** : Un seul point de référence pour tous les mappings
2. **Maintenabilité** : Facile de modifier les noms de tables
3. **Flexibilité** : Supporte différents schémas de base de données
4. **Documentation** : Structure claire et documentée
5. **Type Safety** : Réduit les erreurs de noms de tables/champs

## 🔄 Migration Progressive

Les autres modèles peuvent être migrés progressivement :
- Commencer par les modèles les plus utilisés
- Tester après chaque migration
- Documenter les changements

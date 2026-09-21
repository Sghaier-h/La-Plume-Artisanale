# Mise à Jour des Modules - Système ERP La Plume Artisanale

## ✅ Modules Complétés

### 1. Module Sale Orders ✅
**Backend :**
- ✅ Modèle mis à jour avec TableMapping
- ✅ Contrôleur avec chargement des relations
- ✅ Routes pour les lignes de commande (CRUD)
- ✅ Support Many2One et One2Many

**Frontend :**
- ✅ Utilisation des utilitaires de relations
- ✅ Affichage amélioré des relations
- ✅ Gestion complète des lignes
- ✅ Documents liés (livraisons, factures)

### 2. Module Products ✅
**Backend :**
- ✅ Modèle mis à jour avec TableMapping
- ✅ Contrôleur avec chargement des relations
- ✅ Routes pour stock et mouvements
- ✅ Support Many2One (catégories)

**Frontend :**
- ✅ Utilisation des utilitaires de relations
- ✅ Affichage amélioré des catégories
- ✅ Onglets Stock et Mouvements
- ✅ Formatage des prix et montants

## 📋 Modules à Mettre à Jour

### 3. Module Partners (Clients)
**À faire :**
- [ ] Mettre à jour le modèle pour utiliser TableMapping
- [ ] Ajouter le chargement des relations
- [ ] Créer les routes pour les relations (commandes, factures)
- [ ] Mettre à jour le frontend avec les utilitaires

### 4. Module Purchase Orders
**À faire :**
- [ ] Mettre à jour le modèle pour utiliser TableMapping
- [ ] Ajouter le chargement des relations
- [ ] Créer les routes pour les lignes
- [ ] Mettre à jour le frontend

### 5. Module Stock Pickings
**À faire :**
- [ ] Mettre à jour le modèle pour utiliser TableMapping
- [ ] Ajouter le chargement des relations
- [ ] Créer les routes pour les mouvements
- [ ] Mettre à jour le frontend

### 6. Module Account Moves (Factures)
**À faire :**
- [ ] Mettre à jour le modèle pour utiliser TableMapping
- [ ] Ajouter le chargement des relations
- [ ] Créer les routes pour les lignes
- [ ] Mettre à jour le frontend

### 7. Module Productions
**À faire :**
- [ ] Mettre à jour le modèle pour utiliser TableMapping
- [ ] Ajouter le chargement des relations
- [ ] Créer les routes pour les mouvements
- [ ] Mettre à jour le frontend

### 8. Module CRM Leads
**À faire :**
- [ ] Mettre à jour le modèle pour utiliser TableMapping
- [ ] Ajouter le chargement des relations
- [ ] Créer les routes pour les activités
- [ ] Mettre à jour le frontend

## 🔧 Pattern à Suivre

### Backend - Modèle
```javascript
import { getTableName, getIdField, mapField, mapRecord, mapValues } from '../../../src/core/TableMapping.js';
import { loadRelations } from '../../../src/core/Relations.js';

export class MyModel extends BaseModel {
  constructor() {
    super('model.name', null);
    this._tableName = getTableName('model.name');
    this._idField = getIdField('model.name');
  }
  
  async search(domain = [], options = {}) {
    // ... requête SQL avec ${this._tableName}
    const records = result.rows.map(row => this._toRecord(row));
    
    if (options.loadRelations) {
      return await Promise.all(records.map(record => 
        loadRelations('model.name', record, options.loadRelations)
      ));
    }
    
    return records;
  }
  
  _mapField(field) {
    return mapField('model.name', field);
  }
  
  _toRecord(row) {
    return mapRecord('model.name', row);
  }
}
```

### Backend - Contrôleur
```javascript
import { loadOne2Many } from '../../../src/core/Relations.js';
import { getTableName, getIdField } from '../../../src/core/TableMapping.js';

export const getMyModels = async (req, res) => {
  const loadRelations = req.query.loadRelations === 'true';
  
  const models = await MyModel.search(domain, {
    loadRelations: loadRelations ? {
      many2one: true,
      one2many: ['relation_name'],
      many2oneFields: ['field1', 'field2']
    } : undefined
  });
  
  return sendSuccess(res, { data: models });
};
```

### Frontend - Service
```typescript
export const myService = {
  getItems: (params?: any) => api.get('/my/items', { params }),
  getItem: (id: number, options?: { loadRelations?: boolean }) => {
    const url = `/my/items/${id}`;
    return options?.loadRelations 
      ? api.get(url, { params: { loadRelations: true } })
      : api.get(url);
  },
  // Relations
  getItemRelations: (id: number) => api.get(`/my/items/${id}/relations`),
};
```

### Frontend - Composant
```typescript
import { displayMany2One, formatDate, formatCurrency, formatState } from '../../utils/relations';

// Dans le rendu
{displayMany2One(item.partner_id)}
{formatDate(item.date)}
{formatCurrency(item.amount)}
<span className={`erp-status-badge ${formatState(item.state).color}`}>
  {formatState(item.state).label}
</span>
```

## 📝 Notes

- Tous les modules doivent utiliser le système de mapping centralisé
- Les relations doivent être chargées à la demande (loadRelations)
- Le frontend doit utiliser les utilitaires de relations
- Les classes CSS doivent être `erp-*` et non `odoo-*`

## 🎯 Priorités

1. **Haute priorité** : Partners, Purchase Orders, Stock Pickings
2. **Moyenne priorité** : Account Moves, Productions
3. **Basse priorité** : CRM Leads, autres modules

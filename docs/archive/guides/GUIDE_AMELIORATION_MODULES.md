# Guide d'Amélioration des Modules ERP

Ce guide décrit comment améliorer tous les modules ERP pour qu'ils aient les mêmes fonctionnalités que les modules complets (SaleOrders, Products).

## Fonctionnalités Standard Requises

### 1. Table de Liste
- ✅ Colonnes standardisées avec en-têtes clairs
- ✅ Boutons d'action : **Voir/Modifier** (Eye) et **Supprimer** (Trash2)
- ✅ États de chargement et messages vides
- ✅ Formatage des données (dates, devises, statuts)
- ✅ Affichage des relations Many2One avec `displayMany2One()`

### 2. Formulaire Complet
- ✅ **ERPHeader** avec breadcrumb et actions
- ✅ **ERPStatusbar** pour afficher le statut (si applicable)
- ✅ **ERPNotebook** avec plusieurs onglets :
  - **Informations générales** : Tous les champs principaux
  - **Notes** : ERPChatter pour les messages/notes
  - **Onglets spécifiques** selon le module (ex: Stock, Mouvements pour Products)
- ✅ Validation des champs requis
- ✅ Gestion des erreurs avec messages clairs

### 3. Fonctionnalités CRUD
- ✅ **Create** : Bouton "Nouveau" + formulaire
- ✅ **Read** : Affichage dans la liste + formulaire de détail
- ✅ **Update** : Modification via le formulaire
- ✅ **Delete** : Bouton supprimer avec confirmation

### 4. Recherche et Filtres
- ✅ Barre de recherche fonctionnelle
- ✅ Filtres par statut/catégorie (si applicable)

### 5. Vues Multiples (si applicable)
- ✅ Vue Liste (table)
- ✅ Vue Kanban (pour les modules avec statuts)
- ✅ Switch entre les vues avec boutons List/Grid

### 6. Relations
- ✅ Chargement des relations Many2One avec `loadRelations: true`
- ✅ Affichage des relations avec `displayMany2One()`
- ✅ Chargement des relations One2Many dans les formulaires
- ✅ Utilisation de `Many2OneField` pour les champs de sélection

## Structure Standard d'un Module

```typescript
// 1. Interface du modèle
interface MonModule {
  id: number;
  name: string;
  // ... autres champs
  partner_id?: any; // Relation Many2One
  order_lines?: any[]; // Relation One2Many
}

// 2. État du composant
const [items, setItems] = useState<MonModule[]>([]);
const [loading, setLoading] = useState(true);
const [viewType, setViewType] = useState<'list' | 'kanban' | 'form'>('list');
const [search, setSearch] = useState('');
const [selectedItem, setSelectedItem] = useState<MonModule | null>(null);
const [showForm, setShowForm] = useState(false);

// 3. Fonctions CRUD
const loadItems = async () => {
  // Charger avec loadRelations: true
};

const handleCreate = () => { /* ... */ };
const handleEdit = (item: MonModule) => { /* ... */ };
const handleDelete = async (id: number) => { /* ... */ };
const handleSave = async (formData: any) => { /* ... */ };

// 4. Rendu de la liste
return (
  <div className="erp-layout">
    <ERPHeader ... />
    <div className="erp-content">
      {/* Barre de recherche */}
      {/* Table ou Kanban */}
    </div>
  </div>
);

// 5. Composant Formulaire
const MonModuleForm = ({ item, onClose, onSave }) => {
  return (
    <div className="erp-layout">
      <ERPHeader ... />
      <div className="erp-content">
        <div className="erp-form-view">
          {item && <ERPStatusbar ... />}
          <ERPNotebook tabs={[...]} />
        </div>
      </div>
    </div>
  );
};
```

## Checklist d'Amélioration par Module

Pour chaque module, vérifier et ajouter :

### Table
- [ ] Colonnes avec en-têtes clairs
- [ ] Bouton "Voir" (Eye) pour éditer
- [ ] Bouton "Supprimer" (Trash2) avec confirmation
- [ ] Formatage des dates avec `formatDate()`
- [ ] Formatage des devises avec `formatCurrency()`
- [ ] Formatage des statuts avec `formatState()`
- [ ] Affichage des relations avec `displayMany2One()`
- [ ] Message "Aucun élément" quand vide
- [ ] État de chargement

### Formulaire
- [ ] ERPHeader avec breadcrumb complet
- [ ] ERPStatusbar (si le module a des statuts)
- [ ] ERPNotebook avec onglets :
  - [ ] Onglet "Informations" avec tous les champs
  - [ ] Onglet "Notes" avec ERPChatter
  - [ ] Onglets spécifiques si nécessaire
- [ ] Champs requis marqués avec `erp-field-required`
- [ ] Many2OneField pour les relations
- [ ] Validation des données
- [ ] Gestion des erreurs

### Fonctionnalités
- [ ] Recherche fonctionnelle
- [ ] CRUD complet (Create, Read, Update, Delete)
- [ ] Chargement des relations (`loadRelations: true`)
- [ ] Vues multiples (List/Kanban) si applicable
- [ ] Messages de confirmation pour les actions critiques

## Modules à Améliorer

### Priorité Haute (Modules Principaux)
1. ✅ **SaleOrders** - Déjà complet
2. ✅ **Products** - Déjà complet
3. ⚠️ **Partners** - À améliorer (ajouter Delete, Statusbar)
4. ⚠️ **Soustraitants** - À améliorer (ajouter Delete, Statusbar, plus d'onglets)
5. ⚠️ **Suppliers** - À améliorer (ajouter Delete, Statusbar, plus d'onglets)
6. ⚠️ **PurchaseOrders** - À vérifier et compléter
7. ⚠️ **StockPickings** - À vérifier et compléter
8. ⚠️ **AccountMoves** - À vérifier et compléter

### Priorité Moyenne
- HREmployees
- Projects
- CRMLeads
- Productions
- Inventory
- WarehouseManagement

### Priorité Basse
- Tous les autres modules

## Exemple d'Amélioration Complète

Voir `Soustraitants.tsx` après amélioration pour un exemple complet.

## Notes Importantes

1. **Toujours utiliser** `loadRelations: true` dans les appels API
2. **Toujours utiliser** `displayMany2One()` pour afficher les relations
3. **Toujours inclure** le bouton Delete avec confirmation
4. **Toujours inclure** ERPStatusbar dans les formulaires (si applicable)
5. **Toujours inclure** ERPChatter dans l'onglet Notes
6. **Toujours formater** les dates, devises et statuts avec les utilitaires

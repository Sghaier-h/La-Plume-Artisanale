# Structure d'Organisation du Projet

## Frontend (`frontend/src/`)

### Pages (`pages/`)
```
pages/
├── odoo/                    # Pages utilisant les composants Odoo
│   ├── SaleOrdersOdoo.tsx
│   ├── ProductsOdoo.tsx
│   ├── StockPickingsOdoo.tsx
│   ├── ProductionsOdoo.tsx
│   ├── AccountMovesOdoo.tsx
│   ├── PurchaseOrdersOdoo.tsx
│   └── CRMLeadsOdoo.tsx
│
├── [pages classiques]       # Pages ERP classiques
│   ├── Articles.tsx
│   ├── Clients.tsx
│   ├── Commandes.tsx
│   └── ...
│
└── [dashboards]             # Tableaux de bord
    ├── Dashboard.tsx
    ├── DashboardAdministrateur.tsx
    └── ...
```

### Composants (`components/`)
```
components/
├── odoo/                    # Composants Odoo-style
│   ├── views/               # Composants de vues
│   │   ├── ViewHeader.tsx   # En-tête avec breadcrumbs, actions
│   │   ├── ListView.tsx     # Vue liste/table
│   │   ├── KanbanView.tsx   # Vue Kanban
│   │   └── FormView.tsx     # Vue formulaire
│   │
│   ├── fields/              # Champs de formulaire
│   │   ├── Many2OneField.tsx
│   │   ├── One2ManyField.tsx
│   │   └── MonetaryField.tsx
│   │
│   └── forms/               # Formulaires spécifiques
│       └── SaleOrderForm.tsx
│
├── common/                  # Composants communs
├── stock/                   # Composants stock
├── production/              # Composants production
└── ...
```

### Services (`services/`)
```
services/
├── api.ts                   # Configuration API principale
└── socket.ts                # WebSocket
```

## Backend (`backend/`)

### Modules (`modules/`)
```
modules/
├── base/                    # Module de base
│   ├── manifest.js
│   └── models/
│       ├── User.js
│       └── Partner.js
│
├── sale/                    # Module Ventes
│   ├── manifest.js
│   ├── models/
│   │   ├── SaleOrder.js
│   │   └── SaleOrderLine.js
│   ├── controllers/
│   │   └── sale_order.controller.js
│   ├── routes/
│   │   └── sale_order.routes.js
│   ├── security/
│   │   ├── ir.model.access.json
│   │   └── ir_rules.json
│   └── views/
│       └── sale_order_views.json
│
├── product/                 # Module Produits
├── stock/                   # Module Stock
├── mrp/                     # Module Production
├── account/                 # Module Comptabilité
├── purchase/                # Module Achats
├── crm/                     # Module CRM
├── hr/                      # Module RH
├── project/                 # Module Projets
├── inventory/               # Module Inventaire
└── quality/                 # Module Qualité
```

### Core (`src/core/`)
```
core/
├── BaseModel.js            # Modèle de base ORM
├── Environment.js          # Environnement d'exécution
├── ModelRegistry.js        # Registre des modèles
├── ModuleManager.js        # Gestionnaire de modules
├── SecurityManager.js      # Gestionnaire de sécurité
├── ViewGenerator.js        # Générateur de vues
└── decorators.js           # Décorateurs (@depends, @constrains)
```

### Contrôleurs (`src/controllers/`)
```
controllers/
└── [contrôleurs classiques]
```

### Routes (`src/routes/`)
```
routes/
└── [routes classiques]
```

### Middleware (`src/middleware/`)
```
middleware/
├── auth.middleware.js      # Authentification
├── audit.middleware.js     # Audit
└── mobile.middleware.js    # Mobile
```

### Utils (`src/utils/`)
```
utils/
├── db.js                   # Connexion base de données
├── error.helper.js         # Gestion d'erreurs
├── pagination.helper.js    # Pagination
└── ...
```

## Organisation des Imports

### Pages Odoo
```typescript
import ViewHeader from '../../components/odoo/views/ViewHeader';
import ListView from '../../components/odoo/views/ListView';
import KanbanView from '../../components/odoo/views/KanbanView';
import FormView from '../../components/odoo/views/FormView';
import { saleOrdersService } from '../../services/api';
```

### Composants Odoo
```typescript
// Dans views/FormView.tsx
import Many2OneField from '../fields/Many2OneField';
import One2ManyField from '../fields/One2ManyField';
import MonetaryField from '../fields/MonetaryField';
```

## Avantages de cette Structure

1. **Séparation claire** : Pages Odoo séparées des pages classiques
2. **Composants organisés** : Vues, champs, formulaires bien séparés
3. **Modules backend** : Structure standardisée (models, controllers, routes, security)
4. **Maintenabilité** : Facile de trouver et modifier les fichiers
5. **Scalabilité** : Facile d'ajouter de nouveaux modules ou composants
6. **Cohérence** : Même structure pour tous les modules

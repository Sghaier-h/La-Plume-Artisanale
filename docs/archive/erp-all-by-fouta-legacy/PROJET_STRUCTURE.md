# 📁 Structure du Projet ERP ALL BY FOUTA

## Vue d'ensemble

```
PROJET/
├── backend/                    # API Backend Node.js/Express
├── frontend/                   # Application Desktop React
├── mobile/                     # Applications PWA Mobile
├── database/                   # Scripts SQL PostgreSQL
├── docs/                       # Documentation
└── developpement/              # Code source original (référence)
```

## Backend (`backend/`)

```
backend/
├── src/
│   ├── controllers/           # Contrôleurs API
│   │   ├── auth.controller.js
│   │   ├── production.controller.js
│   │   ├── stock.controller.js
│   │   └── planning.controller.js
│   ├── models/                # Modèles de données
│   │   ├── User.js
│   │   ├── Order.js
│   │   └── Machine.js
│   ├── routes/                # Routes API
│   │   ├── auth.routes.js
│   │   ├── production.routes.js
│   │   └── stock.routes.js
│   ├── services/              # Services métier
│   │   ├── auth.service.js
│   │   ├── production.service.js
│   │   └── notification.service.js
│   ├── middleware/            # Middleware Express
│   │   ├── auth.middleware.js
│   │   └── validation.middleware.js
│   ├── utils/                 # Utilitaires
│   │   ├── db.js
│   │   ├── qrcode.js
│   │   └── logger.js
│   └── server.js              # Point d'entrée
├── package.json
└── .env.example
```

## Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── components/           # Composants React réutilisables
│   │   ├── common/
│   │   ├── planning/
│   │   ├── production/
│   │   └── stock/
│   ├── pages/                 # Pages principales
│   │   ├── Dashboard.tsx
│   │   ├── Planning.tsx
│   │   ├── Production.tsx
│   │   └── Stock.tsx
│   ├── services/              # Services API
│   │   ├── api.ts
│   │   └── socket.ts
│   ├── hooks/                 # Hooks React personnalisés
│   ├── utils/                 # Utilitaires
│   ├── types/                 # Types TypeScript
│   └── App.tsx
├── package.json
└── tsconfig.json
```

## Mobile (`mobile/`)

```
mobile/
├── apps/
│   ├── tisseur/              # App Tisseur
│   ├── coupeur/              # App Coupeur
│   ├── mecanicien/           # App Mécanicien
│   ├── magasinier-mp/        # App Magasinier MP
│   ├── magasinier-pf/        # App Magasinier PF
│   ├── magasinier-st/        # App Magasinier Sous-Traitant
│   └── controle-qualite/     # App Contrôle Qualité
└── shared/                   # Code partagé
    ├── components/
    ├── services/
    └── utils/
```

## Database (`database/`)

```
database/
├── 01_base_et_securite.sql      # Tables de base et sécurité
├── 02_production_et_qualite.sql # Tables production et qualité
└── 03_flux_et_tracabilite.sql   # Tables flux et traçabilité
```

## Modules principaux

### 1. Authentification
- Login/Logout
- Gestion des rôles
- Permissions

### 2. Planification
- Planning drag & drop
- Attribution machines
- Attribution couleurs
- Gestion urgences

### 3. Production
- Suivi OF temps réel
- Tableaux de bord machines
- Alertes automatiques
- Rendements

### 4. Stocks
- MP (multi-entrepôts)
- Produits finis
- Transferts
- Inventaires

### 5. Qualité
- Contrôle première pièce
- Non-conformités
- 2ème choix
- Traçabilité

### 6. Sous-traitance
- Tarifs
- Suivi sorties/retours
- Paiements

### 7. Expéditions
- Colisage
- Palettisation
- Documents export

## Rôles utilisateurs

- **ADMIN** : Accès complet
- **CHEF_PROD** : Gestion production
- **TISSEUR** : Suivi fabrication
- **MECANICIEN** : Maintenance
- **MAG_MP** : Stock MP
- **COUPEUR** : Coupe et lots
- **CHEF_ATELIER** : Atelier finition
- **MAG_PF** : Stock PF
- **CONTROLEUR** : Qualité
- **MAG_ST** : Sous-traitance

## Technologies

- **Backend** : Node.js, Express, PostgreSQL, Socket.IO
- **Frontend** : React, TypeScript, Tailwind CSS
- **Mobile** : PWA (Progressive Web App)
- **Desktop** : Electron


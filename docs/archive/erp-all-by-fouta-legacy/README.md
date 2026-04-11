# 🏭 ERP ALL BY FOUTA - Système de Gestion de Production Textile

Système ERP complet pour la gestion de production textile (foutas), incluant planification, suivi de fabrication, gestion des stocks, qualité et traçabilité complète.

## 📋 Table des matières

- [Architecture](#architecture)
- [Technologies](#technologies)
- [Installation](#installation)
- [Structure du projet](#structure-du-projet)
- [Modules](#modules)
- [Base de données](#base-de-données)
- [Documentation](#documentation)

## 🏗️ Architecture

### Frontend
- **Application Desktop** : React + TypeScript + Electron (Gestion/Planification)
- **Applications Mobile** : PWA React (7 applications métier)
  - Tisseur
  - Coupeur
  - Mécanicien
  - Magasinier MP
  - Magasinier PF
  - Magasinier Sous-Traitant
  - Contrôle Qualité

### Backend
- **API REST** : Node.js + Express
- **Base de données** : PostgreSQL
- **Temps réel** : Socket.IO
- **Cache** : Redis

## 🛠️ Technologies

- **Frontend** : React 18, TypeScript, Tailwind CSS, Recharts
- **Backend** : Node.js, Express, PostgreSQL, Socket.IO
- **Mobile** : PWA (Progressive Web App)
- **Desktop** : Electron
- **Impression** : QR Codes, Étiquettes thermiques

## 📦 Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- Redis (optionnel)

### Installation Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer .env avec vos paramètres
npm run migrate
npm start
```

### Installation Frontend

```bash
cd frontend
npm install
npm start
```

### Installation Base de données

```bash
cd database
# Exécuter dans l'ordre :
psql -U postgres -d fouta_erp -f 01_base_et_securite.sql
psql -U postgres -d fouta_erp -f 02_production_et_qualite.sql
psql -U postgres -d fouta_erp -f 03_flux_et_tracabilite.sql
```

## 📁 Structure du projet

```
PROJET/
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   └── package.json
├── frontend/             # Application React Desktop
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── mobile/               # Applications PWA
│   ├── apps/
│   │   ├── tisseur/
│   │   ├── coupeur/
│   │   └── ...
│   └── shared/
├── database/             # Scripts SQL
│   ├── 01_base_et_securite.sql
│   ├── 02_production_et_qualite.sql
│   └── 03_flux_et_tracabilite.sql
└── docs/                 # Documentation
```

## 🎯 Modules principaux

### 1. Gestion
- Commandes clients
- Catalogue produits
- Clients / Fournisseurs
- Sous-traitants

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
- Transferts entrepôts
- Inventaires

### 5. Qualité
- Contrôle première pièce
- Non-conformités
- 2ème choix
- Traçabilité complète

### 6. Sous-traitance
- Tarifs par modèle/dimension
- Suivi sorties/retours
- Paiements

### 7. Expéditions
- Colisage
- Palettisation
- Documents export

## 🗄️ Base de données

45+ tables organisées en modules :
- Référentiels (clients, articles, machines, personnel)
- Stocks (MP, PF, fournitures)
- Production (OF, planning, suivi)
- Qualité (NC, contrôles)
- Flux (demandes, notifications)
- Traçabilité (historiques, mouvements)

## 📚 Documentation

Voir le dossier `docs/` pour :
- Spécifications détaillées
- Guide d'utilisation
- API Documentation
- Architecture technique

## 👥 Rôles utilisateurs

- **Admin** : Accès complet
- **Chef Production** : Gestion production et planification
- **Tisseur** : Suivi fabrication
- **Mécanicien** : Maintenance machines
- **Magasinier MP** : Gestion stock matières premières
- **Coupeur** : Gestion coupe et lots
- **Magasinier PF** : Gestion produits finis
- **Contrôleur Qualité** : Contrôles qualité

## 🚀 Fonctionnalités clés

- ✅ Planification drag & drop
- ✅ Suivi temps réel production
- ✅ Gestion multi-entrepôts
- ✅ Traçabilité complète (QR codes)
- ✅ Alertes automatiques
- ✅ Gestion 2ème choix
- ✅ Impression étiquettes
- ✅ Mode hors ligne (PWA)
- ✅ Import/Export Excel
- ✅ Photos produits

## 📝 Licence

Propriétaire - ALL BY FOUTA

## 📞 Support

Pour toute question, contactez l'équipe de développement.


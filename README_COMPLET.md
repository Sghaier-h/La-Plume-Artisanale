# 🏭 ERP La Plume Artisanale - Application Complète

## 📋 Vue d'Ensemble

Système ERP complet pour la gestion de production textile (foutas), incluant :
- ✅ Catalogue articles avec BOM et sélecteurs
- ✅ Gestion clients et fournisseurs
- ✅ Commandes et ordres de fabrication
- ✅ Planning drag & drop
- ✅ Suivi de fabrication en temps réel
- ✅ Stock multi-entrepôts
- ✅ Traçabilité lots avec QR codes
- ✅ Qualité avancée (contrôle, non-conformités)
- ✅ Génération documents (PDF, Excel)

## 🚀 Démarrage Rapide

### Option 1 : Installation et Démarrage Automatique

```powershell
# 1. Installation complète
.\installer-complet.ps1

# 2. Démarrage automatique
.\demarrer-application.ps1
```

### Option 2 : Installation Manuelle

#### Backend
```bash
cd La-Plume-Artisanale/backend
npm install
npm install exceljs
cp .env.example .env
# Configurer .env
npm run dev
```

#### Frontend
```bash
cd La-Plume-Artisanale/frontend
npm install
npm start
```

## 📦 Modules Disponibles

### Gestion
- **Catalogue Articles** - Catalogue avec BOM, sélecteurs, variantes
- **Articles** - Articles simples
- **Clients** - Gestion clients
- **Fournisseurs** - Gestion fournisseurs
- **Commandes** - Gestion commandes

### Production
- **Machines** - Inventaire machines
- **Ordres de Fabrication** - Gestion OF
- **Planning** - Planning drag & drop visuel
- **Suivi Fabrication** - Suivi production temps réel

### Stock
- **Matières Premières** - Gestion MP
- **Stock Multi-Entrepôts** - 5 entrepôts, transferts
- **Traçabilité Lots** - QR codes, étiquettes

### Qualité
- **Qualité Avancée** - Contrôle première pièce, non-conformités

### Paramétrage
- **Paramétrage** - Paramètres système
- **Paramètres Catalogue** - Dimensions, finitions, couleurs, modèles

### Autres
- **Sous-traitants** - Gestion sous-traitance
- **Documents** - PDF, Excel

## 🔐 Connexion

**Mode Mock (développement) :**
- Email : `admin@system.local`
- Mot de passe : `Admin123!`

## 📁 Structure du Projet

```
La-Plume-Artisanale/
├── backend/
│   ├── src/
│   │   ├── controllers/     # 15 controllers
│   │   ├── routes/          # 15 routes
│   │   ├── middleware/      # Auth
│   │   └── utils/           # DB, helpers
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # 15 pages
│   │   ├── components/      # Navigation, etc.
│   │   ├── services/       # API services
│   │   └── hooks/          # useAuth
│   └── package.json
├── database/
│   ├── 01_base_et_securite.sql
│   ├── 02_production_et_qualite.sql
│   ├── 03_flux_et_tracabilite.sql
│   ├── 05_tables_catalogue.sql
│   ├── 06_tables_selecteurs.sql
│   ├── 07_tables_stock_multi_entrepots.sql
│   └── 08_tables_tracabilite_lots.sql
└── installer-complet.ps1
```

## 🛠️ Technologies

- **Backend** : Node.js, Express, PostgreSQL, Socket.IO
- **Frontend** : React, TypeScript, Tailwind CSS
- **PDF** : pdf-lib
- **Excel** : exceljs
- **QR Codes** : qrcode

## 📚 Documentation

- `DEMARRAGE_RAPIDE.md` - Guide de démarrage
- `SYSTEME_COMPLET_CREE.md` - Liste complète des modules
- `INSTALLATION_MODULES_COMPLETS.md` - Guide d'installation
- `RESUME_FINAL_COMPLET.md` - Résumé final

## ✅ Fonctionnalités Clés

### Catalogue Articles
- Organisation par modèle/dimensions
- Gestion BOM avec sélecteurs (S01-S08)
- Génération automatique références
- Paramètres entièrement modifiables

### Planning
- Interface drag & drop
- Attribution visuelle machines
- Réordonnancement OF

### Stock
- 5 entrepôts (E1, E2, E3, Usine, Fabrication)
- Transferts entre entrepôts
- Traçabilité complète

### Qualité
- Contrôle première pièce
- Non-conformités
- Actions correctives

## 🎉 Application Prête !

L'application est complète et prête à être utilisée. Tous les modules du cahier des charges ont été implémentés.

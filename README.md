# 🏭 ERP ALL BY FOUTA - La Plume Artisanale

Système de gestion de production ERP complet pour l'industrie textile.

## 📋 Description

ERP complet pour la gestion de production textile incluant :
- 📊 Planning et ordonnancement
- 🏭 Suivi de production en temps réel
- 📦 Gestion multi-entrepôts
- ✅ Contrôle qualité
- 📱 Applications Android par poste de travail
- ☁️ Architecture SaaS

## 🚀 Démarrage Rapide

### Installation locale

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos paramètres
npm run dev

# Frontend
cd frontend
npm install
npm start
```

### Base de données

```bash
cd database
psql -U postgres -d fouta_erp -f 01_base_et_securite.sql
psql -U postgres -d fouta_erp -f 02_production_et_qualite.sql
psql -U postgres -d fouta_erp -f 03_flux_et_tracabilite.sql
psql -U postgres -d fouta_erp -f 04_mobile_devices.sql
```

## 📚 Documentation

- **`INSTALLATION.md`** - Guide d'installation complet
- **`DEPLOIEMENT_OVH.md`** - Déploiement sur serveur OVH
- **`GUIDE_GITHUB.md`** - Workflow GitHub
- **`SETUP_GITHUB.md`** - Configuration GitHub
- **`QUICK_START.md`** - Démarrage rapide

## 🏗️ Architecture

- **Backend** : Node.js + Express + PostgreSQL
- **Frontend** : React + TypeScript + Tailwind CSS
- **Mobile** : Android (Kotlin) - 7 applications par poste
- **Base de données** : PostgreSQL avec 45+ tables
- **Temps réel** : Socket.IO

## 📱 Applications Android

- App Tisseur (Weaver)
- App Coupeur (Cutter)
- App Mécanicien (Mechanic)
- App Magasinier MP (Raw Material Warehouse)
- App Magasinier PF (Finished Product Warehouse)
- App Contrôle Qualité (Quality Control)
- App Sous-traitant (Sub-contractor)

## ☁️ Déploiement SaaS

Le projet est configuré pour un déploiement SaaS sur OVH Cloud.

Voir `DEPLOIEMENT_OVH.md` pour les instructions complètes.

## 🔗 Repository GitHub

**URL** : `https://github.com/Sghaier-h/La-Plume-Artisanale.git`

## 📝 License

Propriétaire - ALL BY FOUTA

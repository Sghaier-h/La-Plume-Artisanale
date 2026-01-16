# 🚀 ERP La Plume Artisanale

Système de gestion ERP complet pour la production artisanale de textiles.

## 📋 Structure du Projet

```
La-Plume-Artisanale/
├── backend/              # API Node.js/Express
├── frontend/            # Interface React
├── mobile/              # Applications mobiles (Android/iOS)
├── database/            # Scripts SQL de la base de données
├── scripts/             # Scripts de déploiement et utilitaires
├── docs/                # Documentation
│   ├── deployment/      # Guides de déploiement
│   ├── configuration/   # Guides de configuration
│   ├── troubleshooting/ # Guides de dépannage
│   ├── development/    # Guides de développement
│   └── database/       # Documentation base de données
└── tests/               # Tests automatisés
```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Installation

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Configurer .env avec vos paramètres
npm start

# Frontend
cd frontend
npm install
cp .env.example .env.production
npm start
```

## 📚 Documentation

- [Guide de déploiement](docs/deployment/)
- [Configuration](docs/configuration/)
- [Dépannage](docs/troubleshooting/)
- [Développement](docs/development/)
- [Base de données](docs/database/)

## 🗄️ Base de Données

Les scripts SQL sont dans le dossier `database/`. Voir [docs/database/ETAT_TABLES.md](docs/database/ETAT_TABLES.md) pour l'état des tables.

### Exécution des scripts

```bash
# Dans l'ordre
psql -U utilisateur -d laplume_artisanale -f database/01_base_et_securite.sql
psql -U utilisateur -d laplume_artisanale -f database/02_production_et_qualite.sql
psql -U utilisateur -d laplume_artisanale -f database/03_flux_et_tracabilite.sql
# ... etc
```

## 🔧 Scripts Utilitaires

- `scripts/organiser-git.ps1` - Organiser le dépôt Git
- `scripts/update-server.sh` - Mettre à jour le serveur depuis GitHub
- `scripts/deploy-*.sh` - Scripts de déploiement

## 📝 Modules Disponibles

- ✅ GPAO (Gestion de Production Assistée par Ordinateur)
- ✅ Gestion des articles et modèles
- ✅ Catalogue produit
- ✅ Ventes (Devis, Commandes, Factures)
- ✅ Achats
- ✅ Stock multi-entrepôts
- ✅ Traçabilité lots
- ✅ Maintenance
- ✅ Qualité avancée
- ✅ Planification Gantt
- ✅ Coûts
- ✅ Multi-société
- ✅ Communication externe
- ✅ E-commerce IA
- ✅ Point de vente
- ✅ CRM
- ✅ Comptabilité

## 🌐 Déploiement

Voir [docs/deployment/](docs/deployment/) pour les guides de déploiement.

## 📞 Support

Pour toute question, consultez la documentation dans `docs/`.

## 📄 Licence

Propriétaire - La Plume Artisanale

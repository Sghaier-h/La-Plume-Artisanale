# 📖 Guide d'Utilisation de la Base de Données

Guide complet pour naviguer et utiliser les scripts SQL de votre projet.

## 🎯 Navigation Rapide

### Je veux...

| Objectif | Fichier à consulter |
|----------|---------------------|
| **Comprendre l'organisation** | `README.md` |
| **Trouver un script rapidement** | `INDEX_SCRIPTS.md` |
| **Vérifier les données importées** | `imports/verification/10_verifier_import_donnees.sql` |
| **Voir le statut des imports** | `docs/IMPORT_DONNÉES_RÉELLES.md` |
| **Importer des données** | `imports/README.md` |

## 📁 Structure du Dossier Database

```
database/
│
├── 📄 README.md                    ← Vue d'ensemble
├── 📄 INDEX_SCRIPTS.md             ← Index de tous les scripts
├── 📄 GUIDE_UTILISATION.md         ← Vous êtes ici
│
├── 📐 schema/                      ← Structure de base (tables, modules)
│   ├── 00_INITIALISATION_COMPLETE.sql
│   ├── 01_base_et_securite.sql
│   ├── modules/                    ← Modules métier
│   └── ...
│
├── 📥 imports/                     ← Import des données réelles
│   ├── README.md                   ← Guide d'import
│   ├── structure/                  ← Scripts de structure
│   │   ├── 04_structure_commandes.sql
│   │   ├── 05_structure_utilisateurs_groupes.sql
│   │   ├── 07_structure_utilisateurs_dashboards.sql
│   │   └── 08_structure_clients_enrichie.sql
│   │
│   ├── data/                       ← Scripts de données
│   │   ├── 00_attributs.sql
│   │   ├── 01_modeles_data.sql
│   │   ├── 03_articles_data.sql
│   │   ├── 04_commandes_data.sql
│   │   ├── 05_utilisateurs_data.sql
│   │   └── 06_ajouter_groupe_soustraitant.sql
│   │
│   └── verification/               ← Scripts de vérification
│       ├── 09_verifier_migration_clients.sql
│       └── 10_verifier_import_donnees.sql ⭐
│
└── 📚 docs/                        ← Documentation
    ├── IMPORT_DONNÉES_RÉELLES.md
    ├── VERIFIER_IMPORT_DONNEES.md
    └── GUIDE_UTILISATION.md
```

## 🔄 Workflow Typique

### 1. Créer la Structure
```sql
-- Exécuter les scripts dans schema/ dans l'ordre
```

### 2. Préparer la Structure pour les Imports
```sql
-- Exécuter les scripts dans imports/structure/
```

### 3. Importer les Données
```sql
-- Exécuter les scripts dans imports/data/ dans l'ordre
```

### 4. Vérifier
```sql
-- Exécuter imports/verification/10_verifier_import_donnees.sql
```

## 📊 Scripts par Catégorie

### ✅ Déjà Exécutés (Selon IMPORT_DONNÉES_RÉELLES.md)

- ✅ Attributs (95 modèles, 37 couleurs, etc.)
- ✅ Modèles avec relations
- ✅ Articles (1503 articles)
- ✅ Commandes (15 commandes, 1326 lignes)
- ✅ Structure clients enrichie
- ✅ Utilisateurs et groupes

### ⚠️ À Vérifier

Utilisez `imports/verification/10_verifier_import_donnees.sql` pour vérifier l'état actuel.

## 🆘 Dépannage

### Problème : "Aucune donnée n'apparaît"

1. Vérifiez avec `imports/verification/10_verifier_import_donnees.sql`
2. Consultez les logs d'exécution des scripts
3. Vérifiez que vous êtes connecté à la bonne base de données

### Problème : "Table does not exist"

1. Exécutez d'abord les scripts de **structure** avant les scripts de **données**
2. Vérifiez l'ordre dans `INDEX_SCRIPTS.md`

### Problème : "Cannot GET /api/..."

1. Vérifiez que le backend est démarré
2. Vérifiez que les routes sont bien enregistrées dans `server.js`
3. Redémarrez le backend après avoir ajouté de nouvelles routes

## 📝 Convention de Nommage

- **`00_`** : Initialisation / Attributs de base
- **`01_`** : Modèles
- **`03_`** : Articles
- **`04_`** : Commandes
- **`05_`** : Utilisateurs
- **`08_`** : Structure clients enrichie
- **`09_`** : Vérification migration
- **`10_`** : Vérification complète

## 🔗 Liens Utiles

- **Backend** : `backend/src/` - Code serveur
- **Frontend** : `frontend/src/` - Interface utilisateur
- **Scripts Python** : `scripts/` - Scripts d'analyse et génération SQL

---

**Dernière mise à jour** : 2026-01-22

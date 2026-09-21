# 📁 Organisation de la Base de Données

Ce dossier contient tous les scripts SQL et la documentation pour la base de données.

## 📂 Structure des Dossiers

```
database/
├── README.md                          ← Vous êtes ici
├── schema/                            ← Structure de base de données
│   ├── 00_initialisation.sql         ← Script d'initialisation complet
│   ├── modules/                      ← Modules métier (ventes, achats, etc.)
│   └── README.md                     ← Guide des schémas
│
├── imports/                           ← Import des données réelles
│   ├── structure/                    ← Scripts de structure (tables, colonnes)
│   ├── data/                         ← Scripts d'import de données
│   ├── verification/                 ← Scripts de vérification
│   └── README.md                     ← Guide d'import
│
├── migrations/                        ← Migrations futures (à venir)
│   └── README.md
│
└── docs/                              ← Documentation
    ├── DOCUMENTATION_MODULES.md       ← ⭐ Documentation complète par module (Tables, Colonnes, Relations, Frontend)
    ├── RESUME_MODULES.md              ← Résumé rapide des modules
    ├── IMPORT_DONNÉES_RÉELLES.md     ← Suivi des imports
    ├── VERIFIER_IMPORT_DONNEES.md    ← Guide de vérification
    └── GUIDE_UTILISATION.md          ← Guide général
```

## 🚀 Démarrage Rapide

### Pour créer la base de données complète

1. **Structure de base** : Exécutez les scripts dans `schema/` dans l'ordre
2. **Import des données** : Exécutez les scripts dans `imports/` dans l'ordre
3. **Vérification** : Utilisez les scripts dans `imports/verification/`

### Ordre d'exécution recommandé

#### 1. Structure de Base (schema/)
```
00_initialisation.sql
01_base_et_securite.sql
02_production_et_qualite.sql
... (autres modules)
```

#### 2. Import des Données (imports/)
```
structure/
  ├── 04_structure_commandes.sql
  ├── 05_structure_utilisateurs_groupes.sql
  ├── 07_structure_utilisateurs_dashboards.sql
  └── 08_structure_clients_enrichie.sql

data/
  ├── 00_attributs.sql
  ├── 01_modeles.sql
  ├── 01_modeles_data.sql
  ├── 03_articles_data.sql
  ├── 04_commandes_data.sql
  ├── 05_utilisateurs_data.sql
  └── 06_ajouter_groupe_soustraitant.sql

verification/
  ├── 09_verifier_migration_clients.sql
  └── 10_verifier_import_donnees.sql
```

## 📋 Documentation

### Documentation Technique
- **`docs/DOCUMENTATION_COMPLETE_SYSTEME.md`** ⭐⭐⭐ : **Documentation COMPLÈTE de TOUS les modules** (Toutes les tables, toutes les colonnes, toutes les relations, toutes les fonctionnalités frontend)
- **`docs/LISTE_COMPLETE_TABLES.md`** ⭐⭐ : **Liste exhaustive de TOUTES les tables** du système (~150+ tables)
- **`docs/DOCUMENTATION_MODULES.md`** ⭐ : Documentation détaillée des modules principaux
- **`docs/RESUME_MODULES.md`** : Résumé rapide des modules
- **`docs/INDEX_DOCUMENTATION.md`** : Index de la documentation

### Guides d'Import
- **`docs/IMPORT_DONNÉES_RÉELLES.md`** : Suivi détaillé de tous les imports
- **`docs/VERIFIER_IMPORT_DONNEES.md`** : Comment vérifier que les données sont bien importées
- **`imports/README.md`** : Guide détaillé des imports

## 🔍 Recherche Rapide

### Je veux...
- **Documentation COMPLÈTE de TOUT le système** → `docs/DOCUMENTATION_COMPLETE_SYSTEME.md` ⭐⭐⭐
- **Liste de TOUTES les tables** → `docs/LISTE_COMPLETE_TABLES.md` ⭐⭐
- **Comprendre la structure de la base de données** → `docs/DOCUMENTATION_MODULES.md` ⭐
- **Voir un résumé rapide des modules** → `docs/RESUME_MODULES.md`
- **Créer la structure** → Voir les fichiers à la racine (`00_INITIALISATION_COMPLETE.sql`, etc.)
- **Importer des données** → Voir `imports/` (fichiers `00_attributs.sql`, `03_articles_data.sql`, etc.)
- **Vérifier les données** → Voir `imports/10_verifier_import_donnees.sql`
- **Trouver un script rapidement** → Voir `INDEX_SCRIPTS.md`
- **Comprendre l'organisation** → Lire `ORGANISATION_VISUELLE.md` ou `GUIDE_UTILISATION.md`
- **Voir le statut des imports** → Lire `docs/IMPORT_DONNÉES_RÉELLES.md`

## ⚠️ Important

- Les scripts sont **idempotents** (peuvent être exécutés plusieurs fois)
- Respectez l'**ordre d'exécution** indiqué
- Vérifiez toujours avec les scripts de **verification/** après un import

---

**Dernière mise à jour** : 2026-01-22

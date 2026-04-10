# 📥 Guide d'Import des Données

Ce dossier contient tous les scripts pour importer vos données réelles dans la base de données.

## 📂 Organisation

Les scripts sont organisés par type :

### 🏗️ Structure (`structure/`)
Scripts qui créent ou modifient la structure (tables, colonnes) **AVANT** l'import des données.

**Ordre d'exécution :**
1. `04_structure_commandes.sql` - Structure des commandes (personnalisation)
2. `05_structure_utilisateurs_groupes.sql` - Structure utilisateurs et groupes
3. `07_structure_utilisateurs_dashboards.sql` - Structure dashboards
4. `08_structure_clients_enrichie.sql` - Structure clients enrichie

### 📊 Données (`data/`)
Scripts qui importent les données réelles.

**Ordre d'exécution :**
1. `00_attributs.sql` - Attributs de base (Types Produits, Tissages, Dimensions, etc.)
2. `01_modeles.sql` - Structure des modèles (si nécessaire)
3. `01_modeles_data.sql` - Données des modèles avec relations
4. `03_articles_data.sql` - Articles du catalogue
5. `04_commandes_data.sql` - Commandes et lignes de commande
6. `05_utilisateurs_data.sql` - Utilisateurs avec groupes
7. `06_ajouter_groupe_soustraitant.sql` - Ajout du groupe Soustraitant

### ✅ Vérification (`verification/`)
Scripts pour vérifier que les données sont bien importées.

1. `09_verifier_migration_clients.sql` - Vérifie la migration clients
2. **`10_verifier_import_donnees.sql`** - ⭐ Vérification complète (utilisez celui-ci)

## 🚀 Démarrage Rapide

### Première Installation

```sql
-- 1. Structure
\i imports/structure/04_structure_commandes.sql
\i imports/structure/05_structure_utilisateurs_groupes.sql
\i imports/structure/07_structure_utilisateurs_dashboards.sql
\i imports/structure/08_structure_clients_enrichie.sql

-- 2. Données
\i imports/data/00_attributs.sql
\i imports/data/01_modeles_data.sql
\i imports/data/03_articles_data.sql
\i imports/data/04_commandes_data.sql
\i imports/data/05_utilisateurs_data.sql
\i imports/data/06_ajouter_groupe_soustraitant.sql

-- 3. Vérification
\i imports/verification/10_verifier_import_donnees.sql
```

### Vérification Rapide

Si vous voulez juste vérifier l'état actuel :

```sql
\i imports/verification/10_verifier_import_donnees.sql
```

## 📋 Statut des Imports

Consultez `../docs/IMPORT_DONNÉES_RÉELLES.md` pour le statut détaillé de chaque import.

## ⚠️ Notes Importantes

- Les scripts sont **idempotents** (peut être exécutés plusieurs fois)
- Respectez l'**ordre d'exécution** (structure → données → vérification)
- Toujours **vérifier** après un import avec `10_verifier_import_donnees.sql`

---

**Besoin d'aide ?** Consultez `../INDEX_SCRIPTS.md` pour trouver rapidement le script dont vous avez besoin.

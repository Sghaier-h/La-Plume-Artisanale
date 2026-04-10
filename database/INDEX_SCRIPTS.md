# 📑 Index des Scripts SQL

Guide rapide pour trouver le script dont vous avez besoin.

## 🗂️ Organisation Logique

### 📐 STRUCTURE DE BASE (Schéma)

Ces scripts créent la structure de la base de données (tables, contraintes, etc.)

#### Initialisation
- `00_INITIALISATION_COMPLETE.sql` - Script d'initialisation complet
- `01_base_et_securite.sql` - Base et sécurité
- `parametrage_initial.sql` - Paramétrage initial

#### Modules Métier
- `02_production_et_qualite.sql` - Production et qualité
- `03_flux_et_tracabilite.sql` - Flux et traçabilité
- `04_mobile_devices.sql` - Appareils mobiles
- `05_attributs_articles.sql` - Attributs des articles
- `05_tables_catalogue.sql` - Tables du catalogue
- `06_tables_selecteurs.sql` - Tables des sélecteurs
- `07_tables_stock_multi_entrepots.sql` - Stock multi-entrepôts
- `08_tables_tracabilite_lots.sql` - Traçabilité des lots
- `09_tables_communication_taches.sql` - Communication et tâches
- `10_tables_catalogue_produit.sql` - Catalogue produit
- `11_modules_ventes.sql` - Module ventes
- `12_modules_achats.sql` - Module achats
- `13_modules_stock_avance.sql` - Stock avancé
- `14_modules_comptabilite.sql` - Comptabilité
- `15_modules_crm.sql` - CRM
- `16_modules_point_de_vente.sql` - Point de vente
- `17_modules_maintenance.sql` - Maintenance
- `18_modules_couts.sql` - Coûts
- `18_modules_qualite_avance.sql` - Qualité avancée
- `19_modules_planification_gantt.sql` - Planification Gantt
- `20_modules_couts.sql` - Coûts (doublon?)
- `20_modules_gantt_planification.sql` - Gantt (doublon?)
- `21_modules_multisociete.sql` - Multi-société
- `22_modules_communication_externe.sql` - Communication externe
- `22_modules_ecommerce_ia.sql` - E-commerce IA
- `23_amelioration_qualite_avancee.sql` - Amélioration qualité
- `23_modules_ecommerce_ia.sql` - E-commerce IA (doublon?)
- `24_product_categories.sql` - Catégories produits
- `25_paie_tunisie.sql` - Paie Tunisie
- `26_comptabilite_tunisie.sql` - Comptabilité Tunisie
- `27_module_entrepot_complet.sql` - Module entrepôt complet

#### Schémas Spécialisés
- `schema-commercial-multitarif-multidevise.sql` - Commercial multi-tarif multi-devise

---

### 📥 IMPORT DES DONNÉES RÉELLES (imports/)

#### Structure (Tables et Colonnes)
Ces scripts créent ou modifient la structure avant l'import des données :

1. **`imports/04_structure_commandes.sql`**
   - Crée la table `parametres_types_personnalisation`
   - Ajoute les colonnes `id_type_personnalisation` et `fichier_personnalisation` à `articles_commande`
   - ⚠️ **À exécuter AVANT** `04_commandes_data.sql`

2. **`imports/05_structure_utilisateurs_groupes.sql`**
   - Crée la table `groupes` (FAB, ATL, COM, SOU)
   - Ajoute les colonnes `photo_emoji`, `photo_url`, `id_groupe`, etc. à `utilisateurs`
   - ⚠️ **À exécuter AVANT** `05_utilisateurs_data.sql`

3. **`imports/07_structure_utilisateurs_dashboards.sql`**
   - Crée la table `utilisateurs_dashboards`
   - ⚠️ **À exécuter AVANT** d'assigner des dashboards

4. **`imports/08_structure_clients_enrichie.sql`**
   - Crée les tables `categories_clients`, `types_commerciaux`, `adresses_client`, `contacts_client`
   - Ajoute les colonnes enrichies à `clients`
   - Crée les fonctions automatiques (type_client, devise)
   - ⚠️ **À exécuter AVANT** d'importer les clients enrichis

#### Données (Import des Données Réelles)
Ces scripts importent les données réelles :

1. **`imports/00_attributs.sql`**
   - Importe les attributs de base (Types Produits, Tissages, Dimensions, Finitions, Couleurs, etc.)
   - ✅ **Déjà exécuté** : 95 modèles, 37 couleurs, etc.

2. **`imports/01_modeles.sql`**
   - Structure des modèles (si nécessaire)

3. **`imports/01_modeles_data.sql`**
   - Met à jour les modèles existants avec leurs relations (Type Produit, Type Tissage)
   - Génère les descriptions automatiquement
   - ✅ **Déjà exécuté**

4. **`imports/03_articles_data.sql`**
   - Importe les articles du catalogue
   - ✅ **Déjà exécuté** : 1503 articles importés

5. **`imports/04_commandes_data.sql`**
   - Importe les commandes et leurs lignes
   - Crée automatiquement les clients manquants
   - ✅ **Déjà exécuté** : 15 commandes, 1326 lignes

6. **`imports/05_utilisateurs_data.sql`**
   - Importe les utilisateurs avec leurs groupes
   - ✅ **Déjà exécuté**

7. **`imports/06_ajouter_groupe_soustraitant.sql`**
   - Ajoute le groupe "Soustraitant" (SOU)
   - ✅ **Déjà exécuté**

#### Vérification
Ces scripts vérifient que les données sont bien importées :

1. **`imports/09_verifier_migration_clients.sql`**
   - Vérifie la migration des clients enrichis

2. **`imports/10_verifier_import_donnees.sql`**
   - Vérifie que toutes les données sont bien importées
   - Affiche des statistiques complètes
   - 📊 **Utilisez ce script pour diagnostiquer les problèmes**

---

### 🔧 Scripts Utilitaires

- `insert_attributs_catalogue.sql` - Insertion attributs catalogue
- `insert_modeles_articles_parents.sql` - Insertion modèles/articles parents
- `insert_articles_parents_toutes_donnees.sql` - Insertion complète articles parents
- `insert_donnees_test.sql` - Données de test
- `liste table.sql` - Liste des tables
- `script tableau.sql` - Script tableau

---

## 📊 Ordre d'Exécution Recommandé

### Pour une Nouvelle Installation

```
1. Structure de base (schema/)
   ├── 00_INITIALISATION_COMPLETE.sql
   └── (autres modules selon besoins)

2. Structure des imports (imports/structure/)
   ├── 04_structure_commandes.sql
   ├── 05_structure_utilisateurs_groupes.sql
   ├── 07_structure_utilisateurs_dashboards.sql
   └── 08_structure_clients_enrichie.sql

3. Import des données (imports/data/)
   ├── 00_attributs.sql
   ├── 01_modeles_data.sql
   ├── 03_articles_data.sql
   ├── 04_commandes_data.sql
   ├── 05_utilisateurs_data.sql
   └── 06_ajouter_groupe_soustraitant.sql

4. Vérification (imports/verification/)
   └── 10_verifier_import_donnees.sql
```

### Pour Vérifier l'État Actuel

```
imports/verification/10_verifier_import_donnees.sql
```

---

## 🔍 Recherche Rapide

| Je cherche... | Fichier |
|--------------|---------|
| Vérifier toutes les données | `imports/10_verifier_import_donnees.sql` |
| Importer les articles | `imports/03_articles_data.sql` |
| Importer les commandes | `imports/04_commandes_data.sql` |
| Structure clients enrichie | `imports/08_structure_clients_enrichie.sql` |
| Structure commandes | `imports/04_structure_commandes.sql` |
| Utilisateurs et groupes | `imports/05_structure_utilisateurs_groupes.sql` |
| Modèles avec relations | `imports/01_modeles_data.sql` |
| Attributs de base | `imports/00_attributs.sql` |

---

## 📚 Documentation

- **`IMPORT_DONNÉES_RÉELLES.md`** - Suivi détaillé de tous les imports
- **`VERIFIER_IMPORT_DONNEES.md`** - Guide de vérification
- **`ANALYSE_DOUBLONS.md`** - Analyse des doublons

---

**Dernière mise à jour** : 2026-01-22

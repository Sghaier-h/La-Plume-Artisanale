# 📋 Liste Complète des Fichiers

Liste exhaustive de tous les fichiers SQL et de documentation avec leur emplacement et leur rôle.

## 📐 STRUCTURE DE BASE (Schéma)

### Initialisation
- `00_INITIALISATION_COMPLETE.sql` - Script d'initialisation complet de la base
- `01_base_et_securite.sql` - Structure de base et sécurité
- `parametrage_initial.sql` - Paramétrage initial

### Modules de Base
- `02_production_et_qualite.sql` - Production et qualité
- `03_flux_et_tracabilite.sql` - Flux et traçabilité
- `04_mobile_devices.sql` - Appareils mobiles

### Catalogue et Articles
- `05_attributs_articles.sql` - Attributs des articles
- `05_tables_catalogue.sql` - Tables du catalogue
- `06_tables_selecteurs.sql` - Tables des sélecteurs
- `10_tables_catalogue_produit.sql` - Catalogue produit
- `24_product_categories.sql` - Catégories produits

### Stock et Entrepôts
- `07_tables_stock_multi_entrepots.sql` - Stock multi-entrepôts
- `27_module_entrepot_complet.sql` - Module entrepôt complet

### Traçabilité
- `08_tables_tracabilite_lots.sql` - Traçabilité des lots

### Communication
- `09_tables_communication_taches.sql` - Communication et tâches

### Modules Métier
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
- `20_modules_couts.sql` - Coûts (vérifier doublon)
- `20_modules_gantt_planification.sql` - Gantt (vérifier doublon)
- `21_modules_multisociete.sql` - Multi-société
- `22_modules_communication_externe.sql` - Communication externe
- `22_modules_ecommerce_ia.sql` - E-commerce IA
- `23_amelioration_qualite_avancee.sql` - Amélioration qualité
- `23_modules_ecommerce_ia.sql` - E-commerce IA (vérifier doublon)

### Modules Spécialisés
- `25_paie_tunisie.sql` - Paie Tunisie
- `26_comptabilite_tunisie.sql` - Comptabilité Tunisie
- `schema-commercial-multitarif-multidevise.sql` - Commercial multi-tarif multi-devise

---

## 📥 IMPORT DES DONNÉES RÉELLES

### Structure (À exécuter EN PREMIER)

**Emplacement** : `database/imports/`

1. **`04_structure_commandes.sql`**
   - Crée : `parametres_types_personnalisation`
   - Ajoute : colonnes personnalisation à `articles_commande`
   - ⚠️ **À exécuter AVANT** `04_commandes_data.sql`

2. **`05_structure_utilisateurs_groupes.sql`**
   - Crée : table `groupes` (FAB, ATL, COM, SOU)
   - Ajoute : colonnes à `utilisateurs` (photo, groupe, etc.)
   - ⚠️ **À exécuter AVANT** `05_utilisateurs_data.sql`

3. **`07_structure_utilisateurs_dashboards.sql`**
   - Crée : table `utilisateurs_dashboards`
   - ⚠️ **À exécuter AVANT** d'assigner des dashboards

4. **`08_structure_clients_enrichie.sql`**
   - Crée : `categories_clients`, `types_commerciaux`, `adresses_client`, `contacts_client`
   - Ajoute : colonnes enrichies à `clients`
   - Crée : fonctions automatiques (type_client, devise)
   - ⚠️ **À exécuter AVANT** d'importer les clients enrichis

### Données (À exécuter APRÈS la structure)

**Emplacement** : `database/imports/`

1. **`00_attributs.sql`**
   - Importe : Types Produits, Tissages, Dimensions, Finitions, Couleurs, etc.
   - ✅ **Statut** : Exécuté (95 modèles, 37 couleurs)

2. **`01_modeles.sql`**
   - Structure des modèles (si nécessaire)

3. **`01_modeles_data.sql`**
   - Met à jour les modèles avec relations (Type Produit, Type Tissage)
   - Génère les descriptions automatiquement
   - ✅ **Statut** : Exécuté

4. **`03_articles_data.sql`**
   - Importe les articles du catalogue
   - ✅ **Statut** : Exécuté (1503 articles)

5. **`04_commandes_data.sql`**
   - Importe les commandes et leurs lignes
   - Crée automatiquement les clients manquants
   - ✅ **Statut** : Exécuté (15 commandes, 1326 lignes)

6. **`05_utilisateurs_data.sql`**
   - Importe les utilisateurs avec leurs groupes
   - ✅ **Statut** : Exécuté

7. **`06_ajouter_groupe_soustraitant.sql`**
   - Ajoute le groupe "Soustraitant" (SOU)
   - ✅ **Statut** : Exécuté

### Vérification

**Emplacement** : `database/imports/`

1. **`09_verifier_migration_clients.sql`**
   - Vérifie la migration des clients enrichis

2. **`10_verifier_import_donnees.sql`** ⭐
   - Vérifie que toutes les données sont bien importées
   - Affiche des statistiques complètes
   - Indique ce qui manque
   - 📊 **Utilisez ce script pour diagnostiquer les problèmes**

---

## 📚 Documentation

**Emplacement** : `database/`

### Guides Principaux
- **`README.md`** - Vue d'ensemble de l'organisation
- **`INDEX_SCRIPTS.md`** - Index de tous les scripts avec recherche rapide
- **`GUIDE_UTILISATION.md`** - Guide complet d'utilisation
- **`ORGANISATION_VISUELLE.md`** - Organisation visuelle avec arborescence
- **`QUICK_START.md`** - Démarrage rapide pour actions courantes
- **`LISTE_COMPLETE_FICHIERS.md`** - Vous êtes ici (liste exhaustive)

### Documentation Spécialisée
- **`IMPORT_DONNÉES_RÉELLES.md`** - Suivi détaillé de tous les imports
- **`VERIFIER_IMPORT_DONNEES.md`** - Guide de vérification des données
- **`ANALYSE_DOUBLONS.md`** - Analyse des doublons

### Documentation dans imports/
- **`imports/README.md`** - Guide d'import des données
- **`imports/00_ATTRIBUTS_TEMPLATE.md`** - Template pour les attributs
- **`imports/VERIFICATION_ATTRIBUTS.md`** - Vérification des attributs

---

## 🔧 Scripts Utilitaires

**Emplacement** : `database/`

- `insert_attributs_catalogue.sql` - Insertion attributs catalogue
- `insert_modeles_articles_parents.sql` - Insertion modèles/articles parents
- `insert_articles_parents_toutes_donnees.sql` - Insertion complète articles parents
- `insert_donnees_test.sql` - Données de test
- `liste table.sql` - Liste des tables
- `script tableau.sql` - Script tableau

---

## 🎯 Par Où Commencer ?

### Si vous voulez...

1. **Comprendre l'organisation** → `README.md`
2. **Trouver un script rapidement** → `INDEX_SCRIPTS.md`
3. **Voir l'organisation visuelle** → `ORGANISATION_VISUELLE.md`
4. **Vérifier les données** → `imports/10_verifier_import_donnees.sql`
5. **Voir le statut des imports** → `IMPORT_DONNÉES_RÉELLES.md`
6. **Démarrage rapide** → `QUICK_START.md`

---

**Dernière mise à jour** : 2026-01-22

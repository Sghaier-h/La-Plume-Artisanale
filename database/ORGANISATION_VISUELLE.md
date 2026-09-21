# 🗂️ Organisation Visuelle des Fichiers

Guide visuel pour vous retrouver rapidement dans les fichiers SQL.

## 📍 Où se trouve chaque fichier ?

### 🏗️ STRUCTURE (Schéma de Base)

**Fichiers à la racine de `database/` :**

```
📁 database/
├── 📄 00_INITIALISATION_COMPLETE.sql        ← Démarrage complet
├── 📄 01_base_et_securite.sql               ← Base et sécurité
├── 📄 parametrage_initial.sql               ← Paramétrage
│
├── 📄 02_production_et_qualite.sql         ← Production
├── 📄 03_flux_et_tracabilite.sql           ← Flux
├── 📄 04_mobile_devices.sql                ← Mobile
│
├── 📄 05_attributs_articles.sql            ← Attributs
├── 📄 05_tables_catalogue.sql              ← Catalogue
├── 📄 06_tables_selecteurs.sql             ← Sélecteurs
├── 📄 07_tables_stock_multi_entrepots.sql  ← Stock
├── 📄 08_tables_tracabilite_lots.sql       ← Traçabilité
├── 📄 09_tables_communication_taches.sql   ← Communication
├── 📄 10_tables_catalogue_produit.sql      ← Catalogue produit
│
├── 📄 11_modules_ventes.sql                ← Module Ventes
├── 📄 12_modules_achats.sql                ← Module Achats
├── 📄 13_modules_stock_avance.sql          ← Stock avancé
├── 📄 14_modules_comptabilite.sql          ← Comptabilité
├── 📄 15_modules_crm.sql                   ← CRM
├── 📄 16_modules_point_de_vente.sql        ← Point de vente
├── 📄 17_modules_maintenance.sql           ← Maintenance
├── 📄 18_modules_couts.sql                 ← Coûts
├── 📄 18_modules_qualite_avance.sql        ← Qualité avancée
├── 📄 19_modules_planification_gantt.sql   ← Gantt
├── 📄 20_modules_couts.sql                 ← Coûts (doublon?)
├── 📄 20_modules_gantt_planification.sql   ← Gantt (doublon?)
├── 📄 21_modules_multisociete.sql          ← Multi-société
├── 📄 22_modules_communication_externe.sql ← Communication externe
├── 📄 22_modules_ecommerce_ia.sql         ← E-commerce IA
├── 📄 23_amelioration_qualite_avancee.sql   ← Qualité améliorée
├── 📄 23_modules_ecommerce_ia.sql         ← E-commerce IA (doublon?)
├── 📄 24_product_categories.sql            ← Catégories produits
├── 📄 25_paie_tunisie.sql                  ← Paie Tunisie
├── 📄 26_comptabilite_tunisie.sql          ← Comptabilité Tunisie
├── 📄 27_module_entrepot_complet.sql       ← Entrepôt complet
│
└── 📄 schema-commercial-multitarif-multidevise.sql ← Commercial
```

---

### 📥 IMPORT DES DONNÉES RÉELLES

**Fichiers dans `database/imports/` :**

#### 🏗️ Structure (À exécuter EN PREMIER)

```
📁 imports/
│
├── 📄 04_structure_commandes.sql           ← Structure commandes
│   └── Crée: parametres_types_personnalisation
│   └── Ajoute: colonnes personnalisation à articles_commande
│
├── 📄 05_structure_utilisateurs_groupes.sql ← Structure utilisateurs
│   └── Crée: table groupes
│   └── Ajoute: colonnes utilisateurs (photo, groupe, etc.)
│
├── 📄 07_structure_utilisateurs_dashboards.sql ← Structure dashboards
│   └── Crée: table utilisateurs_dashboards
│
└── 📄 08_structure_clients_enrichie.sql    ← Structure clients enrichie
    └── Crée: categories_clients, types_commerciaux, adresses_client, contacts_client
    └── Ajoute: colonnes enrichies à clients
    └── Crée: fonctions automatiques
```

#### 📊 Données (À exécuter APRÈS la structure)

```
📁 imports/
│
├── 📄 00_attributs.sql                     ← Attributs de base
│   └── Types Produits, Tissages, Dimensions, Finitions, Couleurs
│   └── ✅ 95 modèles, 37 couleurs importés
│
├── 📄 01_modeles.sql                       ← Structure modèles (si nécessaire)
│
├── 📄 01_modeles_data.sql                  ← Données modèles avec relations
│   └── Met à jour les modèles avec Type Produit et Type Tissage
│   └── ✅ Exécuté
│
├── 📄 03_articles_data.sql                 ← Articles du catalogue
│   └── ✅ 1503 articles importés
│
├── 📄 04_commandes_data.sql               ← Commandes et lignes
│   └── Crée automatiquement les clients manquants
│   └── ✅ 15 commandes, 1326 lignes importées
│
├── 📄 05_utilisateurs_data.sql            ← Utilisateurs avec groupes
│   └── ✅ Exécuté
│
└── 📄 06_ajouter_groupe_soustraitant.sql  ← Ajout groupe SOU
    └── ✅ Exécuté
```

#### ✅ Vérification (Pour diagnostiquer)

```
📁 imports/
│
├── 📄 09_verifier_migration_clients.sql    ← Vérifie migration clients
│
└── 📄 10_verifier_import_donnees.sql       ← ⭐ VÉRIFICATION COMPLÈTE
    └── Affiche toutes les statistiques
    └── Indique ce qui manque
```

---

### 📚 Documentation

**Fichiers dans `database/` :**

```
📁 database/
│
├── 📄 README.md                            ← Vue d'ensemble
├── 📄 INDEX_SCRIPTS.md                     ← Index de tous les scripts
├── 📄 GUIDE_UTILISATION.md                 ← Guide complet
├── 📄 ORGANISATION_VISUELLE.md             ← Vous êtes ici
│
├── 📄 IMPORT_DONNÉES_RÉELLES.md            ← Suivi des imports
├── 📄 VERIFIER_IMPORT_DONNEES.md           ← Guide de vérification
└── 📄 ANALYSE_DOUBLONS.md                  ← Analyse des doublons
```

---

## 🎯 Scénarios d'Utilisation

### Scénario 1 : "Je veux vérifier si mes données sont bien importées"

👉 **Fichier** : `imports/10_verifier_import_donnees.sql`

### Scénario 2 : "Je veux importer des articles"

👉 **Fichier** : `imports/03_articles_data.sql`  
👉 **Prérequis** : `00_attributs.sql` et `01_modeles_data.sql` doivent être exécutés

### Scénario 3 : "Je veux importer des commandes"

👉 **Fichier** : `imports/04_commandes_data.sql`  
👉 **Prérequis** : 
- `04_structure_commandes.sql` (structure)
- `03_articles_data.sql` (articles)
- `08_structure_clients_enrichie.sql` (structure clients)

### Scénario 4 : "Je veux comprendre l'organisation"

👉 **Fichier** : `README.md` ou `GUIDE_UTILISATION.md`

### Scénario 5 : "Je cherche un script spécifique"

👉 **Fichier** : `INDEX_SCRIPTS.md` (recherche rapide)

---

## 📋 Checklist d'Installation

Utilisez cette checklist pour une installation complète :

### Phase 1 : Structure de Base
- [ ] `00_INITIALISATION_COMPLETE.sql`
- [ ] Autres modules selon besoins

### Phase 2 : Structure des Imports
- [ ] `imports/04_structure_commandes.sql`
- [ ] `imports/05_structure_utilisateurs_groupes.sql`
- [ ] `imports/07_structure_utilisateurs_dashboards.sql`
- [ ] `imports/08_structure_clients_enrichie.sql`

### Phase 3 : Import des Données
- [ ] `imports/00_attributs.sql`
- [ ] `imports/01_modeles_data.sql`
- [ ] `imports/03_articles_data.sql`
- [ ] `imports/04_commandes_data.sql`
- [ ] `imports/05_utilisateurs_data.sql`
- [ ] `imports/06_ajouter_groupe_soustraitant.sql`

### Phase 4 : Vérification
- [ ] `imports/verification/10_verifier_import_donnees.sql`

---

## 🔍 Recherche par Mot-Clé

| Mot-clé | Fichier(s) |
|---------|-----------|
| **modèles** | `imports/01_modeles.sql`, `imports/01_modeles_data.sql` |
| **articles** | `imports/03_articles_data.sql` |
| **commandes** | `imports/04_structure_commandes.sql`, `imports/04_commandes_data.sql` |
| **clients** | `imports/08_structure_clients_enrichie.sql` |
| **utilisateurs** | `imports/05_structure_utilisateurs_groupes.sql`, `imports/05_utilisateurs_data.sql` |
| **vérifier** | `imports/10_verifier_import_donnees.sql` |
| **attributs** | `imports/00_attributs.sql` |
| **personnalisation** | `imports/04_structure_commandes.sql` |

---

**💡 Astuce** : Utilisez `INDEX_SCRIPTS.md` pour une recherche encore plus rapide !

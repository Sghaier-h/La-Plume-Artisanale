# 📚 Documentation Complète par Module

Documentation détaillée de tous les modules avec leurs tables, colonnes, relations et fonctionnalités frontend.

## 📑 Index des Modules

1. [Module Clients (CRM Enrichi)](#module-clients-crm-enrichi)
2. [Module Ventes](#module-ventes)
3. [Module Articles & Catalogue](#module-articles--catalogue)
4. [Module Commandes](#module-commandes)
5. [Module Utilisateurs & Groupes](#module-utilisateurs--groupes)
6. [Module Production](#module-production)
7. [Module Stock](#module-stock)
8. [Module Facturation](#module-facturation)
9. [Module Livraisons](#module-livraisons)

---

## 📖 Module Clients (CRM Enrichi)

**Fichier SQL** : `imports/08_structure_clients_enrichie.sql`  
**Pages Frontend** : `Clients.tsx`, `ClientDetails.tsx`

### 🗄️ Tables

#### Table : `clients`
Table principale des clients avec colonnes enrichies.

**Colonnes principales :**
- `id_client` (SERIAL PRIMARY KEY)
- `code_client` (VARCHAR) - Code unique du client
- `raison_sociale` (VARCHAR) - Nom/Raison sociale
- `type_client` (VARCHAR) - 'CLIENT' ou 'PROSPECT' (automatique)
- `id_categorie` (INTEGER) → `categories_clients(id_categorie)`
- `id_commercial` (INTEGER) → `utilisateurs(id_utilisateur)`
- `id_type_commercial` (INTEGER) → `types_commerciaux(id_type_commercial)`
- `civilite` (VARCHAR) - Pour particuliers
- `siren_siret` (VARCHAR)
- `numero_tva` (VARCHAR)
- `site_web` (VARCHAR)
- `conditions_paiement` (VARCHAR)
- `plafond_credit` (NUMERIC)
- `taux_remise` (NUMERIC)
- `devise` (VARCHAR) - Déterminée automatiquement par pays
- `actif` (BOOLEAN)
- `raison_desactivation` (TEXT)
- `date_desactivation` (TIMESTAMP)

#### Table : `categories_clients`
Catégories de clients (Professionnel/Particulier, Local/Export).

**Colonnes :**
- `id_categorie` (SERIAL PRIMARY KEY)
- `code_categorie` (VARCHAR UNIQUE) - 'PROF_LOCAL', 'PROF_EXPORT', 'PART_LOCAL', 'PART_EXPORT'
- `libelle` (VARCHAR)
- `description` (TEXT)
- `actif` (BOOLEAN)

#### Table : `types_commerciaux`
Types de commerciaux (Commercial, E-commerce, Partenaire, Autre).

**Colonnes :**
- `id_type_commercial` (SERIAL PRIMARY KEY)
- `code_type` (VARCHAR UNIQUE)
- `libelle` (VARCHAR)
- `description` (TEXT)
- `actif` (BOOLEAN)

#### Table : `adresses_client`
Adresses multiples par client (facturation, livraison).

**Colonnes :**
- `id_adresse` (SERIAL PRIMARY KEY)
- `id_client` (INTEGER) → `clients(id_client)` ON DELETE CASCADE
- `type_adresse` (VARCHAR) - 'FACTURATION', 'LIVRAISON'
- `principale` (BOOLEAN) - Une seule adresse principale par type
- `civilite` (VARCHAR)
- `nom_adresse` (VARCHAR) - Nom de l'adresse (ex: "Siège social")
- `adresse_ligne1` (VARCHAR) - Obligatoire
- `adresse_ligne2` (VARCHAR)
- `code_postal` (VARCHAR)
- `ville` (VARCHAR)
- `departement` (VARCHAR)
- `pays` (VARCHAR) - Détermine la devise automatiquement
- `actif` (BOOLEAN)

#### Table : `contacts_client`
Contacts multiples par client.

**Colonnes :**
- `id_contact` (SERIAL PRIMARY KEY)
- `id_client` (INTEGER) → `clients(id_client)` ON DELETE CASCADE
- `contact_principal` (BOOLEAN) - Un seul contact principal par client
- `civilite` (VARCHAR)
- `nom` (VARCHAR) - Obligatoire
- `prenom` (VARCHAR)
- `fonction` (VARCHAR)
- `service_bureau` (VARCHAR)
- `email` (VARCHAR)
- `telephone_fixe` (VARCHAR)
- `telephone_portable` (VARCHAR)
- `actif` (BOOLEAN)

### 🔗 Relations

```
clients
├── id_categorie → categories_clients(id_categorie)
├── id_commercial → utilisateurs(id_utilisateur)
├── id_type_commercial → types_commerciaux(id_type_commercial)
│
adresses_client
└── id_client → clients(id_client) [CASCADE]

contacts_client
└── id_client → clients(id_client) [CASCADE]

commandes
└── id_client → clients(id_client)
```

### ⚙️ Fonctions Automatiques

1. **`mettre_a_jour_type_client()`**
   - Met à jour automatiquement `type_client` :
     - 'CLIENT' si le client a au moins une commande
     - 'PROSPECT' sinon

2. **`determiner_devise_par_pays()`**
   - Détermine la devise selon le pays :
     - 'TND' pour Tunisie
     - 'EUR' pour Europe
     - 'USD' pour le reste du monde

### 🎨 Fonctionnalités Frontend

#### Page : `Clients.tsx`

**Fonctionnalités :**
- ✅ Liste des clients avec affichage ligne/catalogue
- ✅ Recherche par code, raison sociale, email
- ✅ Filtres : Type (Client/Prospect), Catégorie, Statut
- ✅ Création/Modification de client avec formulaire enrichi
- ✅ Affichage des informations : Type, Catégorie, Ville, Pays
- ✅ Navigation vers les détails du client

**Champs du formulaire :**
- Informations générales (Code, Raison sociale, Civilité, SIREN/SIRET, TVA, Site web)
- Catégorie (dropdown)
- Commercial (assignation + type commercial)
- Adresse de facturation (complète)
- Contact principal (complète)
- Conditions commerciales (Paiement, Plafond crédit, Remise, Statut)

#### Page : `ClientDetails.tsx`

**Fonctionnalités :**
- ✅ Vue détaillée du client avec onglets :
  - **Informations** : Toutes les données du client
  - **Adresses** : Liste des adresses (facturation/livraison) avec gestion CRUD
  - **Contacts** : Liste des contacts avec gestion CRUD
  - **Commandes** : Toutes les commandes du client
  - **Bons de livraison** : Tous les BL du client
  - **Factures** : Toutes les factures du client
- ✅ Modals pour créer/modifier adresses et contacts
- ✅ Désignation du contact principal
- ✅ Désignation de l'adresse principale par type

---

## 📖 Module Ventes

**Fichier SQL** : `11_modules_ventes.sql`  
**Pages Frontend** : `Devis.tsx`, `Commandes.tsx`, `Facture.tsx`, `BonLivraison.tsx`

### 🗄️ Tables

#### Table : `devis`
Devis clients.

**Colonnes :**
- `id_devis` (SERIAL PRIMARY KEY)
- `numero_devis` (VARCHAR UNIQUE) - Généré automatiquement
- `id_client` (INTEGER) → `clients(id_client)`
- `id_contact` (INTEGER) → `contacts(id_contact)`
- `date_devis` (DATE)
- `date_validite` (DATE)
- `statut` (VARCHAR) - 'BROUILLON', 'ENVOYE', 'ACCEPTE', 'REFUSE', 'EXPIRE', 'TRANSFORME'
- `montant_ht`, `montant_tva`, `montant_ttc` (NUMERIC)
- `remise_globale` (NUMERIC)
- `reference_client` (VARCHAR)
- `conditions_paiement`, `conditions_livraison` (VARCHAR)
- `notes` (TEXT)
- `id_commande` (INTEGER) → `commandes_clients(id_commande)` - Si transformé en commande
- `date_transformation` (TIMESTAMP)
- `created_by` (INTEGER) → `utilisateurs(id_utilisateur)`

#### Table : `lignes_devis`
Lignes d'un devis.

**Colonnes :**
- `id_ligne` (SERIAL PRIMARY KEY)
- `id_devis` (INTEGER) → `devis(id_devis)` [CASCADE]
- `id_article` (INTEGER) → `articles_catalogue(id_article)`
- `designation` (VARCHAR)
- `quantite` (NUMERIC)
- `prix_unitaire_ht` (NUMERIC)
- `taux_tva` (NUMERIC)
- `remise` (NUMERIC)
- `montant_ht`, `montant_tva`, `montant_ttc` (NUMERIC)
- `ordre` (INTEGER)

#### Table : `commandes` (alias `commandes_clients`)
Commandes clients.

**Colonnes :**
- `id_commande` (SERIAL PRIMARY KEY)
- `numero_commande` (VARCHAR UNIQUE) - Généré automatiquement
- `id_client` (INTEGER) → `clients(id_client)` [NOT NULL]
- `ref_client` (VARCHAR) - Référence client
- `num_commande_client` (VARCHAR) - Numéro de commande du client
- `id_devis` (INTEGER) → `devis(id_devis)`
- `date_commande` (DATE)
- `date_livraison_prevue` (DATE)
- `date_envoie` (DATE) - Date d'envoi
- `statut` (VARCHAR) - 'en_attente', 'en_preparation', 'partiellement_livree', 'livree', 'Annuler'
- `priorite` (VARCHAR) - 'normale', 'urgente', 'prioritaire'
- `devise` (VARCHAR) - 'TND', 'EUR', 'USD'
- `montant_ht`, `montant_tva`, `montant_ttc` (NUMERIC)
- `remise_globale` (NUMERIC)
- `conditions_paiement` (VARCHAR)
- `adresse_livraison`, `adresse_facturation` (TEXT)
- `notes` (TEXT)
- `created_by` (INTEGER) → `utilisateurs(id_utilisateur)`
- `created_at`, `updated_at` (TIMESTAMP)

#### Table : `articles_commande` (alias `lignes_commande`)
Lignes d'une commande.

**Colonnes :**
- `id_ligne` (SERIAL PRIMARY KEY)
- `id_commande` (INTEGER) → `commandes(id_commande)` [CASCADE]
- `id_article` (INTEGER) → `articles_catalogue(id_article)` - **Peut être NULL** (article hors catalogue/personnalisé)
- `ref_commercial` (VARCHAR) - Référence commerciale de l'article
- `ref_commerciale` (VARCHAR) - Alias de ref_commercial
- `designation` (VARCHAR) - Désignation de l'article
- `description_article` (TEXT) - Description détaillée
- `quantite_commandee` (NUMERIC) - Quantité commandée
- `quantite_livree` (NUMERIC) - Quantité livrée
- `quantite_reservee` (NUMERIC) - Quantité réservée en stock
- `prix_unitaire_ht` (NUMERIC) - Prix unitaire HT
- `taux_tva` (NUMERIC) - Taux de TVA
- `remise` (NUMERIC) - Remise en %
- `montant_ht`, `montant_tva`, `montant_ttc` (NUMERIC) - Montants calculés
- `prix_total_ht` (NUMERIC) - Prix total HT (alias de montant_ht)
- **Personnalisation :**
  - `personnalisation` (BOOLEAN) - Si l'article est personnalisé
  - `id_type_personnalisation` (INTEGER) → `parametres_types_personnalisation(id)` - Type (Broderie, Sérigraphie, Autre)
  - `fichier_personnalisation` (VARCHAR) - URL/chemin du fichier joint
  - `details_personnalisation` (TEXT) - Détails de la personnalisation
- `dimensions` (VARCHAR) - Dimensions de l'article
- `type_finition` (VARCHAR) - Type de finition
- `ordre` (INTEGER) - Ordre d'affichage

### 🔗 Relations

```
devis
├── id_client → clients(id_client)
├── id_contact → contacts(id_contact)
├── id_commande → commandes_clients(id_commande)
└── created_by → utilisateurs(id_utilisateur)

lignes_devis
├── id_devis → devis(id_devis) [CASCADE]
└── id_article → articles_catalogue(id_article)

commandes (commandes_clients)
├── id_client → clients(id_client) [NOT NULL]
├── id_devis → devis(id_devis)
└── created_by → utilisateurs(id_utilisateur)

articles_commande (lignes_commande)
├── id_commande → commandes(id_commande) [CASCADE]
├── id_article → articles_catalogue(id_article) [NULL autorisé - articles hors catalogue]
└── id_type_personnalisation → parametres_types_personnalisation(id)
```

### ⚙️ Fonctions Automatiques

1. **`generer_numero_devis()`** - Génère 'DEV-YYYY-NNNNNN'
2. **`generer_numero_commande()`** - Génère 'CMD-YYYY-NNNNNN'
3. **Triggers** - Mise à jour automatique de `updated_at`

### 🎨 Fonctionnalités Frontend

#### Page : `Commandes.tsx`

**Fonctionnalités :**
- ✅ Liste des commandes avec statuts
- ✅ Recherche et filtres
- ✅ Création/Modification de commande
- ✅ Gestion des lignes de commande
- ✅ **Personnalisation** :
  - Si `personnalisation = "Oui"` :
    - Affichage du dropdown "Type de personnalisation" (Broderie, Sérigraphie, Autre)
    - Affichage du champ "Fichier joint" (upload)
    - Affichage du champ "Détails personnalisation"
- ✅ Sélection d'articles (catalogue ou hors catalogue)
- ✅ Calcul automatique des totaux
- ✅ Gestion des statuts

#### Page : `CommandeDetails.tsx`

**Fonctionnalités :**
- ✅ Vue détaillée de la commande
- ✅ Liste des lignes avec personnalisation
- ✅ Informations client
- ✅ Historique des modifications

#### Page : `Devis.tsx`

**Fonctionnalités :**
- ✅ Liste des devis
- ✅ Création/Modification
- ✅ Transformation en commande
- ✅ Gestion des statuts

---

## 📖 Module Articles & Catalogue

**Fichier SQL** : `05_tables_catalogue.sql`, `imports/03_articles_data.sql`  
**Pages Frontend** : `Articles.tsx`, `ArticlesCatalogue.tsx`, `CatalogueArticles.tsx`, `Modeles.tsx`

### 🗄️ Tables

#### Table : `articles_catalogue`
Articles du catalogue.

**Colonnes principales :**
- `id_article` (SERIAL PRIMARY KEY)
- `ref_commercial` (VARCHAR) - Générée automatiquement
- `ref_fabrication` (VARCHAR) - Générée automatiquement
- `produit` (VARCHAR)
- `modele` (VARCHAR)
- `code_modele` (VARCHAR)
- `id_modele` (INTEGER) → `parametres_modeles(id)`
- `nombre_couleur`, `code_nombre_couleur` (VARCHAR)
- `type_tissage`, `code_type_tissage` (VARCHAR)
- `id_tissage` (INTEGER) → `parametres_tissages(id)`
- `dimensions`, `code_dimensions` (VARCHAR)
- `id_dimension` (INTEGER) → `parametres_dimensions(id)`
- `type_finition`, `code_type_finition` (VARCHAR)
- `id_finition` (INTEGER) → `parametres_finitions(id)`
- `code_selecteur_01` à `code_selecteur_06` (VARCHAR) - Pour couleurs multiples
- `couleur_article`, `code_couleur_article` (VARCHAR) - Générée automatiquement
- `designation_article` (VARCHAR) - Générée automatiquement
- `designation_auto` (BOOLEAN) - Génération automatique activée
- `description_article` (TEXT)
- `description_auto` (BOOLEAN) - Génération automatique activée
- `couleur_auto` (BOOLEAN) - Génération automatique activée
- `prix_revient`, `prix_vente` (NUMERIC)
- `qte_minimal_stock` (NUMERIC)
- `dans_catalogue_produit` (BOOLEAN) - Si dans le catalogue e-commerce
- `actif` (BOOLEAN)
- `photo_article` (VARCHAR) - URL de la photo

#### Table : `parametres_modeles`
Modèles de base (articles parents).

**Colonnes :**
- `id` (SERIAL PRIMARY KEY)
- `code_modele` (VARCHAR UNIQUE)
- `libelle` (VARCHAR) - Désignation
- `description` (TEXT) - Générée automatiquement
- `id_type_produit` (INTEGER) → `parametres_types_produits(id)`
- `id_tissage` (INTEGER) → `parametres_tissages(id)`
- `photo_modele` (VARCHAR)
- `actif` (BOOLEAN)
- `dans_catalogue_produit` (BOOLEAN)

#### Table : `parametres_types_personnalisation`
Types de personnalisation.

**Colonnes :**
- `id` (SERIAL PRIMARY KEY)
- `code` (VARCHAR UNIQUE) - 'BRODERIE', 'SERIGRAPHIE', 'AUTRE'
- `libelle` (VARCHAR)

### 🔗 Relations

```
articles_catalogue
├── id_modele → parametres_modeles(id)
├── id_tissage → parametres_tissages(id)
├── id_dimension → parametres_dimensions(id)
└── id_finition → parametres_finitions(id)

articles_commande
└── id_article → articles_catalogue(id_article) [NULL autorisé]
```

### 🎨 Fonctionnalités Frontend

#### Page : `Articles.tsx`

**Fonctionnalités :**
- ✅ Liste des articles (ligne/catalogue)
- ✅ Recherche et filtres
- ✅ Création/Modification d'article
- ✅ Génération automatique des références (commerciale, fabrication)
- ✅ Génération automatique de la couleur article
- ✅ Génération automatique de la description
- ✅ Sélection du modèle avec chargement automatique des attributs
- ✅ Gestion des sélecteurs de couleur (1 à 6 selon nombre de couleurs)
- ✅ Upload de photo
- ✅ Gestion du stock par entrepôt
- ✅ Affichage des articles du catalogue par modèle

#### Page : `Modeles.tsx`

**Fonctionnalités :**
- ✅ Liste des modèles (ligne/catalogue)
- ✅ Création/Modification de modèle
- ✅ Attribution Type Produit et Type Tissage
- ✅ Génération automatique de la description
- ✅ Gestion des attributs multiples (dimensions, types de tissage, finitions)
- ✅ Upload de photo
- ✅ Vérification d'unicité du code modèle

---

## 📖 Module Utilisateurs & Groupes

**Fichier SQL** : `imports/05_structure_utilisateurs_groupes.sql`, `imports/07_structure_utilisateurs_dashboards.sql`  
**Pages Frontend** : `Equipe.tsx`, `Login.tsx`

### 🗄️ Tables

#### Table : `utilisateurs`
Utilisateurs du système.

**Colonnes principales :**
- `id_utilisateur` (SERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE)
- `nom_utilisateur` (VARCHAR)
- `mot_de_passe_hash` (VARCHAR) - Hash bcrypt
- `prenom`, `nom` (VARCHAR)
- `numero_employe` (VARCHAR)
- `photo_emoji` (VARCHAR) - Emoji pour l'avatar
- `photo_url` (VARCHAR) - URL de la photo
- `id_groupe` (INTEGER) → `groupes(id_groupe)`
- `id_operateur` (INTEGER) → `equipe_fabrication(id_operateur)`
- `actif` (BOOLEAN)
- `derniere_connexion` (TIMESTAMP)
- `date_creation` (TIMESTAMP)

#### Table : `groupes`
Groupes d'utilisateurs.

**Colonnes :**
- `id_groupe` (SERIAL PRIMARY KEY)
- `code_groupe` (VARCHAR UNIQUE) - 'FAB', 'ATL', 'COM', 'SOU'
- `libelle` (VARCHAR) - 'Fabrication', 'Atelier', 'Commercial', 'Soustraitant'
- `description` (TEXT)
- `actif` (BOOLEAN)

#### Table : `utilisateurs_roles`
Relation many-to-many utilisateurs ↔ rôles.

**Colonnes :**
- `id_utilisateur` (INTEGER) → `utilisateurs(id_utilisateur)`
- `id_role` (INTEGER) → `roles(id_role)`

#### Table : `utilisateurs_dashboards`
Relation many-to-many utilisateurs ↔ dashboards.

**Colonnes :**
- `id_utilisateur` (INTEGER) → `utilisateurs(id_utilisateur)`
- `code_dashboard` (VARCHAR) - Code du dashboard

### 🔗 Relations

```
utilisateurs
├── id_groupe → groupes(id_groupe)
└── id_operateur → equipe_fabrication(id_operateur)

utilisateurs_roles
├── id_utilisateur → utilisateurs(id_utilisateur)
└── id_role → roles(id_role)

utilisateurs_dashboards
└── id_utilisateur → utilisateurs(id_utilisateur)
```

### 🎨 Fonctionnalités Frontend

#### Page : `Equipe.tsx`

**Fonctionnalités :**
- ✅ Liste de l'équipe de fabrication
- ✅ Création/Modification d'accès utilisateur
- ✅ Attribution d'email et mot de passe
- ✅ Attribution de dashboards (multi-sélection)
- ✅ Gestion des groupes

#### Page : `Login.tsx`

**Fonctionnalités :**
- ✅ Connexion avec email/mot de passe
- ✅ Gestion de session
- ✅ Redirection selon les dashboards assignés

---

## 📖 Module Facturation

**Fichier SQL** : `11_modules_ventes.sql`  
**Pages Frontend** : `Facture.tsx`, `Avoir.tsx`

### 🗄️ Tables

#### Table : `factures_clients`
Factures clients.

**Colonnes :**
- `id_facture` (SERIAL PRIMARY KEY)
- `numero_facture` (VARCHAR UNIQUE) - Généré automatiquement
- `id_client` (INTEGER) → `clients(id_client)`
- `id_commande` (INTEGER) → `commandes_clients(id_commande)`
- `id_livraison` (INTEGER) → `livraisons(id_livraison)`
- `date_facture` (DATE)
- `date_echeance` (DATE)
- `statut` (VARCHAR) - 'BROUILLON', 'EMISE', 'PARTIELLEMENT_PAYEE', 'PAYEE', 'ANNULEE', 'IMPAYEE'
- `montant_ht`, `montant_tva`, `montant_ttc` (NUMERIC)
- `montant_paye`, `montant_restant` (NUMERIC)
- `remise_globale` (NUMERIC)
- `adresse_facturation` (TEXT)
- `conditions_paiement` (VARCHAR)
- `notes` (TEXT)
- `numero_tva_client` (VARCHAR)
- `est_avoir` (BOOLEAN) - Si c'est un avoir
- `id_facture_origine` (INTEGER) → `factures_clients(id_facture)` - Facture d'origine pour avoir
- `created_by` (INTEGER) → `utilisateurs(id_utilisateur)`

#### Table : `lignes_facture`
Lignes d'une facture.

**Colonnes :**
- `id_ligne` (SERIAL PRIMARY KEY)
- `id_facture` (INTEGER) → `factures_clients(id_facture)` [CASCADE]
- `id_article` (INTEGER) → `articles_catalogue(id_article)`
- `designation` (VARCHAR)
- `quantite` (NUMERIC)
- `prix_unitaire_ht` (NUMERIC)
- `taux_tva` (NUMERIC)
- `remise` (NUMERIC)
- `montant_ht`, `montant_tva`, `montant_ttc` (NUMERIC)
- `ordre` (INTEGER)

#### Table : `paiements_clients`
Paiements des factures.

**Colonnes :**
- `id_paiement` (SERIAL PRIMARY KEY)
- `id_facture` (INTEGER) → `factures_clients(id_facture)`
- `date_paiement` (DATE)
- `montant` (NUMERIC)
- `mode_paiement` (VARCHAR) - 'ESPECES', 'CHEQUE', 'VIREMENT', 'CB', 'PRELEVEMENT', 'AUTRE'
- `reference_paiement` (VARCHAR)
- `numero_cheque` (VARCHAR)
- `banque` (VARCHAR)
- `notes` (TEXT)
- `created_by` (INTEGER) → `utilisateurs(id_utilisateur)`

### 🔗 Relations

```
factures_clients
├── id_client → clients(id_client)
├── id_commande → commandes_clients(id_commande)
├── id_livraison → livraisons(id_livraison)
├── id_facture_origine → factures_clients(id_facture)
└── created_by → utilisateurs(id_utilisateur)

lignes_facture
├── id_facture → factures_clients(id_facture) [CASCADE]
└── id_article → articles_catalogue(id_article)

paiements_clients
├── id_facture → factures_clients(id_facture)
└── created_by → utilisateurs(id_utilisateur)
```

### ⚙️ Fonctions Automatiques

1. **`generer_numero_facture()`** - Génère 'FAC-YYYY-NNNNNN'

### 🎨 Fonctionnalités Frontend

#### Page : `Facture.tsx`

**Fonctionnalités :**
- ✅ Liste des factures
- ✅ Création depuis commande ou livraison
- ✅ Gestion des statuts
- ✅ Suivi des paiements
- ✅ Génération PDF

#### Page : `Avoir.tsx`

**Fonctionnalités :**
- ✅ Création d'avoir depuis facture
- ✅ Gestion des avoirs

---

## 📖 Module Livraisons

**Fichier SQL** : `11_modules_ventes.sql`  
**Pages Frontend** : `BonLivraison.tsx`

### 🗄️ Tables

#### Table : `livraisons`
Bons de livraison.

**Colonnes :**
- `id_livraison` (SERIAL PRIMARY KEY)
- `numero_livraison` (VARCHAR UNIQUE)
- `id_commande` (INTEGER) → `commandes_clients(id_commande)`
- `date_livraison` (DATE)
- `statut` (VARCHAR) - 'PREVUE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'RETOUR'
- `transporteur` (VARCHAR)
- `numero_suivi` (VARCHAR)
- `adresse_livraison` (TEXT)
- `notes` (TEXT)
- `created_by` (INTEGER) → `utilisateurs(id_utilisateur)`

#### Table : `lignes_livraison`
Lignes d'un bon de livraison.

**Colonnes :**
- `id_ligne` (SERIAL PRIMARY KEY)
- `id_livraison` (INTEGER) → `livraisons(id_livraison)` [CASCADE]
- `id_ligne_commande` (INTEGER) → `lignes_commande(id_ligne)`
- `id_article` (INTEGER) → `articles_catalogue(id_article)`
- `quantite_livree` (NUMERIC)
- `numero_lot` (VARCHAR)
- `date_peremption` (DATE)
- `ordre` (INTEGER)

### 🔗 Relations

```
livraisons
├── id_commande → commandes_clients(id_commande)
└── created_by → utilisateurs(id_utilisateur)

lignes_livraison
├── id_livraison → livraisons(id_livraison) [CASCADE]
├── id_ligne_commande → lignes_commande(id_ligne)
└── id_article → articles_catalogue(id_article)
```

### 🎨 Fonctionnalités Frontend

#### Page : `BonLivraison.tsx`

**Fonctionnalités :**
- ✅ Liste des bons de livraison
- ✅ Création depuis commande
- ✅ Gestion des quantités livrées
- ✅ Suivi des lots
- ✅ Génération PDF

---

## 📊 Diagramme des Relations Principales

```
clients
├── adresses_client (1-N)
├── contacts_client (1-N)
├── commandes_clients (1-N)
│   └── articles_commande (1-N)
│       └── articles_catalogue (N-1)
│           └── parametres_modeles (N-1)
└── factures_clients (1-N)
    ├── lignes_facture (1-N)
    └── paiements_clients (1-N)

utilisateurs
├── groupes (N-1)
├── utilisateurs_roles (N-N)
└── utilisateurs_dashboards (N-N)
```

---

**Dernière mise à jour** : 2026-01-22

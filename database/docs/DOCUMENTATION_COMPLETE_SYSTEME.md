# 📚 Documentation Complète du Système - Tous les Modules et Tables

Documentation exhaustive de tous les modules, toutes les tables avec leurs colonnes, toutes les relations et toutes les fonctionnalités frontend.

**Version** : 1.0  
**Date** : 2026-01-22  
**Système** : ERP La Plume Artisanale

---

## 📑 Table des Matières

1. [Module Base et Sécurité](#1-module-base-et-sécurité)
2. [Module Production et Qualité](#2-module-production-et-qualité)
3. [Module Flux et Traçabilité](#3-module-flux-et-traçabilité)
4. [Module Stock Multi-Entrepôts](#4-module-stock-multi-entrepôts)
5. [Module Catalogue et Articles](#5-module-catalogue-et-articles)
6. [Module Clients (CRM Enrichi)](#6-module-clients-crm-enrichi)
7. [Module Ventes](#7-module-ventes)
8. [Module Achats](#8-module-achats)
9. [Module Stock Avancé](#9-module-stock-avancé)
10. [Module Facturation](#10-module-facturation)
11. [Module Livraisons](#11-module-livraisons)
12. [Module Comptabilité](#12-module-comptabilité)
13. [Module CRM (Opportunités)](#13-module-crm-opportunités)
14. [Module Point de Vente](#14-module-point-de-vente)
15. [Module Planification Gantt](#15-module-planification-gantt)
16. [Module Maintenance](#16-module-maintenance)
17. [Module Coûts](#17-module-coûts)
18. [Module Qualité Avancée](#18-module-qualité-avancée)
19. [Module Multi-Société](#19-module-multi-société)
20. [Module E-commerce IA](#20-module-e-commerce-ia)
21. [Module Communication Externe](#21-module-communication-externe)
22. [Module Utilisateurs et Groupes](#22-module-utilisateurs-et-groupes)
23. [Module Tracabilité Lots](#23-module-tracabilité-lots)
24. [Module Communication et Tâches](#24-module-communication-et-tâches)
25. [Module Mobile Devices](#25-module-mobile-devices)
26. [Module Paie Tunisie](#26-module-paie-tunisie)
27. [Module Comptabilité Tunisie](#27-module-comptabilité-tunisie)
28. [Module Entrepôt Complet](#28-module-entrepôt-complet)

---

## 1. Module Base et Sécurité

**Fichier SQL** : `01_base_et_securite.sql`, `00_INITIALISATION_COMPLETE.sql`

### Tables

#### Table : `parametres_systeme`
Paramètres système globaux.

**Colonnes :**
- `id_parametre` (SERIAL PRIMARY KEY)
- `cle` (VARCHAR(100) UNIQUE NOT NULL)
- `valeur` (TEXT)
- `description` (TEXT)
- `type_donnee` (VARCHAR(50) DEFAULT 'string')
- `date_modification` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `create_uid` (INTEGER)
- `write_uid` (INTEGER)

#### Table : `types_articles`
Types d'articles.

**Colonnes :**
- `id_type_article` (SERIAL PRIMARY KEY)
- `code_type` (VARCHAR(20) UNIQUE NOT NULL)
- `libelle` (VARCHAR(100) NOT NULL)
- `description` (TEXT)
- `actif` (BOOLEAN DEFAULT true)

#### Table : `articles_catalogue`
Articles du catalogue (structure de base).

**Colonnes :**
- `id_article` (SERIAL PRIMARY KEY)
- `code_article` (VARCHAR(50) UNIQUE NOT NULL)
- `designation` (VARCHAR(200) NOT NULL)
- `id_type_article` (INTEGER) → `types_articles(id_type_article)`
- `specification` (TEXT)
- `unite_vente` (VARCHAR(20) DEFAULT 'mètre')
- `prix_unitaire_base` (DECIMAL(10,2))
- `temps_production_standard` (DECIMAL(10,2))
- `actif` (BOOLEAN DEFAULT true)
- `date_creation` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `date_modification` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

**Colonnes enrichies (ajoutées dans `05_tables_catalogue.sql`) :**
- `ref_commerciale` (VARCHAR(100))
- `ref_fabrication` (VARCHAR(100))
- `id_modele` (INTEGER) → `parametres_modeles(id)`
- `id_dimension` (INTEGER) → `parametres_dimensions(id)`
- `id_finition` (INTEGER) → `parametres_finitions(id)`
- `id_tissage` (INTEGER) → `parametres_tissages(id)`
- `nb_couleurs` (INTEGER DEFAULT 1)
- `prix_revient` (DECIMAL(10,2))
- `temps_production` (DECIMAL(10,2))
- `description` (TEXT)
- `dans_catalogue_produit` (BOOLEAN)
- `photo_article` (VARCHAR)

#### Table : `selecteurs`
Sélecteurs pour machines.

**Colonnes :**
- `id_selecteur` (SERIAL PRIMARY KEY)
- `code_selecteur` (VARCHAR(10) UNIQUE NOT NULL)
- `description` (VARCHAR(200))
- `actif` (BOOLEAN DEFAULT true)

#### Table : `types_machines`
Types de machines.

**Colonnes :**
- `id_type_machine` (SERIAL PRIMARY KEY)
- `code_type` (VARCHAR(20) UNIQUE NOT NULL)
- `libelle` (VARCHAR(100) NOT NULL)
- `description` (TEXT)
- `actif` (BOOLEAN DEFAULT true)

#### Table : `machines`
Machines de production.

**Colonnes :**
- `id_machine` (SERIAL PRIMARY KEY)
- `numero_machine` (VARCHAR(20) UNIQUE NOT NULL)
- `id_type_machine` (INTEGER) → `types_machines(id_type_machine)`
- `marque` (VARCHAR(100))
- `modele` (VARCHAR(100))
- `numero_serie` (VARCHAR(100))
- `annee_fabrication` (INTEGER)
- `date_mise_service` (DATE)
- `statut` (VARCHAR(50) DEFAULT 'operationnel')
- `vitesse_nominale` (DECIMAL(10,2))
- `largeur_utile` (DECIMAL(10,2))
- `capacite_production` (DECIMAL(10,2))
- `id_selecteur_actuel` (INTEGER) → `selecteurs(id_selecteur)`
- `emplacement` (VARCHAR(100))
- `observations` (TEXT)
- `date_derniere_maintenance` (DATE)
- `date_prochaine_maintenance` (DATE)
- `actif` (BOOLEAN DEFAULT true)
- `date_creation` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Table : `equipe_fabrication`
Équipe de fabrication.

**Colonnes :**
- `id_operateur` (SERIAL PRIMARY KEY)
- `matricule` (VARCHAR(20) UNIQUE NOT NULL)
- `nom` (VARCHAR(100) NOT NULL)
- `prenom` (VARCHAR(100) NOT NULL)
- `fonction` (VARCHAR(100) NOT NULL)
- `departement` (VARCHAR(100))
- `telephone` (VARCHAR(20))
- `email` (VARCHAR(150))
- `date_embauche` (DATE)
- `niveau_qualification` (VARCHAR(50))
- `habilitations` (TEXT)
- `taux_horaire` (DECIMAL(10,2))
- `actif` (BOOLEAN DEFAULT true)
- `date_creation` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Table : `clients`
Clients (structure de base).

**Colonnes de base :**
- `id_client` (SERIAL PRIMARY KEY)
- `code_client` (VARCHAR(50) UNIQUE NOT NULL)
- `raison_sociale` (VARCHAR(255) NOT NULL)
- `actif` (BOOLEAN DEFAULT true)
- `date_creation` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

**Colonnes enrichies (ajoutées dans `08_structure_clients_enrichie.sql`) :**
- `type_client` (VARCHAR(20) DEFAULT 'PROSPECT')
- `id_categorie` (INTEGER) → `categories_clients(id_categorie)`
- `id_commercial` (INTEGER) → `utilisateurs(id_utilisateur)`
- `id_type_commercial` (INTEGER) → `types_commerciaux(id_type_commercial)`
- `civilite` (VARCHAR(20))
- `siren_siret` (VARCHAR(50))
- `numero_tva` (VARCHAR(50))
- `site_web` (VARCHAR(255))
- `conditions_paiement` (VARCHAR(200))
- `plafond_credit` (NUMERIC(12,2))
- `taux_remise` (NUMERIC(5,2))
- `devise` (VARCHAR(10))
- `raison_desactivation` (TEXT)
- `date_desactivation` (TIMESTAMP)

#### Table : `commandes`
Commandes clients (structure de base).

**Colonnes principales :**
- `id_commande` (SERIAL PRIMARY KEY)
- `numero_commande` (VARCHAR(50) UNIQUE NOT NULL)
- `id_client` (INTEGER NOT NULL) → `clients(id_client)`
- `date_commande` (DATE NOT NULL DEFAULT CURRENT_DATE)
- `date_livraison_prevue` (DATE)
- `statut` (VARCHAR(30) DEFAULT 'en_attente')
- `priorite` (VARCHAR(20) DEFAULT 'normale')
- `devise` (VARCHAR(10) DEFAULT 'TND')
- `conditions_paiement` (VARCHAR(200))
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

**Colonnes enrichies (ajoutées dans `04_structure_commandes.sql`) :**
- `ref_client` (VARCHAR(100))
- `num_commande_client` (VARCHAR(100))
- `date_envoie` (DATE)

#### Table : `articles_commande`
Lignes de commande (structure de base).

**Colonnes principales :**
- `id_ligne` (SERIAL PRIMARY KEY)
- `id_commande` (INTEGER NOT NULL) → `commandes(id_commande)` [CASCADE]
- `id_article` (INTEGER) → `articles_catalogue(id_article)` [NULL autorisé]
- `designation` (VARCHAR(200) NOT NULL)
- `quantite_commandee` (NUMERIC(10,3) NOT NULL)
- `prix_unitaire_ht` (NUMERIC(10,2) NOT NULL)
- `montant_ht` (NUMERIC(12,2) NOT NULL)
- `ordre` (INTEGER DEFAULT 0)

**Colonnes enrichies (ajoutées dans `04_structure_commandes.sql`) :**
- `ref_commerciale` (VARCHAR(100))
- `description_article` (TEXT)
- `dimensions` (VARCHAR(100))
- `type_finition` (VARCHAR(100))
- `personnalisation` (BOOLEAN DEFAULT false)
- `details_personnalisation` (TEXT)
- `id_type_personnalisation` (INTEGER) → `parametres_types_personnalisation(id)`
- `fichier_personnalisation` (VARCHAR(500))
- `prix_total_ht` (DECIMAL(12,2))

#### Table : `ordres_fabrication`
Ordres de fabrication.

**Colonnes :**
- `id_of` (SERIAL PRIMARY KEY)
- `numero_of` (VARCHAR(50) UNIQUE NOT NULL)
- `id_commande` (INTEGER) → `commandes(id_commande)`
- `id_article` (INTEGER) → `articles_catalogue(id_article)`
- `date_lancement` (DATE)
- `date_fin_prevue` (DATE)
- `date_fin_reelle` (DATE)
- `statut` (VARCHAR(30) DEFAULT 'planifie')
- `quantite_prevue` (NUMERIC(10,3) NOT NULL)
- `quantite_produite` (NUMERIC(10,3) DEFAULT 0)
- `quantite_rejetee` (NUMERIC(10,3) DEFAULT 0)
- `priorite` (VARCHAR(20) DEFAULT 'normale')
- `notes` (TEXT)
- `created_by` (INTEGER) → `utilisateurs(id_utilisateur)`
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Table : `sous_of`
Sous-ordres de fabrication.

**Colonnes :**
- `id_sous_of` (SERIAL PRIMARY KEY)
- `id_of` (INTEGER NOT NULL) → `ordres_fabrication(id_of)` [CASCADE]
- `numero_sous_of` (VARCHAR(50))
- `id_machine` (INTEGER) → `machines(id_machine)`
- `etape` (VARCHAR(50))
- `date_debut_prevue` (DATE)
- `date_fin_prevue` (DATE)
- `date_debut_reelle` (DATE)
- `date_fin_reelle` (DATE)
- `statut` (VARCHAR(30) DEFAULT 'planifie')
- `quantite_prevue` (NUMERIC(10,3))
- `quantite_produite` (NUMERIC(10,3) DEFAULT 0)
- `notes` (TEXT)

#### Table : `planning_machines`
Planning des machines.

**Colonnes :**
- `id_planning` (SERIAL PRIMARY KEY)
- `id_machine` (INTEGER NOT NULL) → `machines(id_machine)`
- `id_of` (INTEGER) → `ordres_fabrication(id_of)`
- `date_debut` (TIMESTAMP NOT NULL)
- `date_fin` (TIMESTAMP NOT NULL)
- `statut` (VARCHAR(30) DEFAULT 'planifie')
- `notes` (TEXT)

#### Table : `fournisseurs`
Fournisseurs.

**Colonnes :**
- `id_fournisseur` (SERIAL PRIMARY KEY)
- `code_fournisseur` (VARCHAR(50) UNIQUE NOT NULL)
- `raison_sociale` (VARCHAR(255) NOT NULL)
- `adresse` (TEXT)
- `ville` (VARCHAR(100))
- `code_postal` (VARCHAR(20))
- `pays` (VARCHAR(100) DEFAULT 'Tunisie')
- `telephone` (VARCHAR(50))
- `email` (VARCHAR(255))
- `site_web` (VARCHAR(255))
- `numero_tva` (VARCHAR(50))
- `conditions_paiement` (VARCHAR(200))
- `actif` (BOOLEAN DEFAULT true)
- `date_creation` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Table : `types_mp`
Types de matières premières.

**Colonnes :**
- `id_type_mp` (SERIAL PRIMARY KEY)
- `code_type` (VARCHAR(20) UNIQUE NOT NULL)
- `libelle` (VARCHAR(100) NOT NULL)
- `description` (TEXT)
- `actif` (BOOLEAN DEFAULT true)

#### Table : `matieres_premieres`
Matières premières.

**Colonnes :**
- `id_mp` (SERIAL PRIMARY KEY)
- `code_mp` (VARCHAR(50) UNIQUE NOT NULL)
- `designation` (VARCHAR(200) NOT NULL)
- `id_type_mp` (INTEGER) → `types_mp(id_type_mp)`
- `unite` (VARCHAR(20) DEFAULT 'kg')
- `poids_unitaire` (DECIMAL(10,3))
- `prix_unitaire` (DECIMAL(10,2))
- `fournisseur_principal` (VARCHAR(200))
- `actif` (BOOLEAN DEFAULT true)
- `date_creation` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Table : `stock_mp`
Stock de matières premières.

**Colonnes :**
- `id_stock_mp` (SERIAL PRIMARY KEY)
- `id_mp` (INTEGER NOT NULL) → `matieres_premieres(id_mp)`
- `quantite_disponible` (DECIMAL(10,3) DEFAULT 0)
- `quantite_reservee` (DECIMAL(10,3) DEFAULT 0)
- `quantite_commande` (DECIMAL(10,3) DEFAULT 0)
- `seuil_alerte` (DECIMAL(10,3))
- `seuil_reapprovisionnement` (DECIMAL(10,3))
- `date_derniere_entree` (TIMESTAMP)
- `date_derniere_sortie` (TIMESTAMP)
- `date_creation` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Table : `inventaires_mp`
Inventaires de matières premières.

**Colonnes :**
- `id_inventaire_mp` (SERIAL PRIMARY KEY)
- `numero_inventaire` (VARCHAR(50) UNIQUE NOT NULL)
- `date_inventaire` (DATE NOT NULL DEFAULT CURRENT_DATE)
- `statut` (VARCHAR(30) DEFAULT 'en_cours')
- `created_by` (INTEGER) → `utilisateurs(id_utilisateur)`
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Table : `inventaires_mp_detail`
Détails des inventaires MP.

**Colonnes :**
- `id_detail` (SERIAL PRIMARY KEY)
- `id_inventaire_mp` (INTEGER NOT NULL) → `inventaires_mp(id_inventaire_mp)` [CASCADE]
- `id_mp` (INTEGER NOT NULL) → `matieres_premieres(id_mp)`
- `quantite_theorique` (DECIMAL(10,3) DEFAULT 0)
- `quantite_comptee` (DECIMAL(10,3) DEFAULT 0)
- `ecart` (DECIMAL(10,3) DEFAULT 0)
- `numero_lot` (VARCHAR(50))
- `observations` (TEXT)

#### Table : `mouvements_mp`
Mouvements de matières premières.

**Colonnes :**
- `id_mouvement` (SERIAL PRIMARY KEY)
- `id_mp` (INTEGER NOT NULL) → `matieres_premieres(id_mp)`
- `type_mouvement` (VARCHAR(30) NOT NULL) - 'ENTREE', 'SORTIE', 'AJUSTEMENT'
- `quantite` (DECIMAL(10,3) NOT NULL)
- `prix_unitaire` (DECIMAL(10,2))
- `date_mouvement` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `id_reference` (INTEGER) - ID du document source
- `type_reference` (VARCHAR(50)) - Type du document
- `numero_lot` (VARCHAR(50))
- `motif` (TEXT)
- `created_by` (INTEGER) → `utilisateurs(id_utilisateur)`

#### Table : `demandes_ourdissage`
Demandes d'ourdissage.

**Colonnes :**
- `id_demande` (SERIAL PRIMARY KEY)
- `numero_demande` (VARCHAR(50) UNIQUE NOT NULL)
- `id_of` (INTEGER) → `ordres_fabrication(id_of)`
- `id_mp` (INTEGER NOT NULL) → `matieres_premieres(id_mp)`
- `quantite_demandee` (DECIMAL(10,3) NOT NULL)
- `date_demande` (DATE NOT NULL DEFAULT CURRENT_DATE)
- `date_besoin` (DATE)
- `statut` (VARCHAR(30) DEFAULT 'en_attente')
- `priorite` (VARCHAR(20) DEFAULT 'normale')
- `notes` (TEXT)
- `created_by` (INTEGER) → `utilisateurs(id_utilisateur)`

#### Table : `preparation_mp`
Préparations de matières premières.

**Colonnes :**
- `id_preparation` (SERIAL PRIMARY KEY)
- `numero_preparation` (VARCHAR(50) UNIQUE NOT NULL)
- `id_demande` (INTEGER) → `demandes_ourdissage(id_demande)`
- `id_mp` (INTEGER NOT NULL) → `matieres_premieres(id_mp)`
- `quantite_preparee` (DECIMAL(10,3) NOT NULL)
- `date_preparation` (DATE NOT NULL DEFAULT CURRENT_DATE)
- `statut` (VARCHAR(30) DEFAULT 'en_cours')
- `prepare_par` (INTEGER) → `equipe_fabrication(id_operateur)`
- `notes` (TEXT)

#### Table : `roles`
Rôles utilisateurs.

**Colonnes :**
- `id_role` (SERIAL PRIMARY KEY)
- `code_role` (VARCHAR(50) UNIQUE NOT NULL)
- `nom_role` (VARCHAR(100) NOT NULL)
- `description` (TEXT)
- `permissions` (TEXT[]) - Tableau de permissions
- `actif` (BOOLEAN DEFAULT true)
- `date_creation` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Table : `utilisateurs`
Utilisateurs du système.

**Colonnes de base :**
- `id_utilisateur` (SERIAL PRIMARY KEY)
- `email` (VARCHAR(255) UNIQUE NOT NULL)
- `nom_utilisateur` (VARCHAR(100))
- `mot_de_passe_hash` (VARCHAR(255) NOT NULL)
- `actif` (BOOLEAN DEFAULT true)
- `date_creation` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `derniere_connexion` (TIMESTAMP)

**Colonnes enrichies (ajoutées dans `05_structure_utilisateurs_groupes.sql`) :**
- `prenom` (VARCHAR(100))
- `nom` (VARCHAR(100))
- `numero_employe` (VARCHAR(50))
- `photo_emoji` (VARCHAR(10))
- `photo_url` (VARCHAR(500))
- `id_groupe` (INTEGER) → `groupes(id_groupe)`
- `id_operateur` (INTEGER) → `equipe_fabrication(id_operateur)`

#### Table : `utilisateurs_roles`
Relation utilisateurs ↔ rôles.

**Colonnes :**
- `id_utilisateur` (INTEGER NOT NULL) → `utilisateurs(id_utilisateur)`
- `id_role` (INTEGER NOT NULL) → `roles(id_role)`
- PRIMARY KEY (`id_utilisateur`, `id_role`)

#### Table : `logs_systeme`
Logs système.

**Colonnes :**
- `id_log` (SERIAL PRIMARY KEY)
- `niveau` (VARCHAR(20) NOT NULL) - 'INFO', 'WARNING', 'ERROR', 'DEBUG'
- `message` (TEXT NOT NULL)
- `module` (VARCHAR(100))
- `id_utilisateur` (INTEGER) → `utilisateurs(id_utilisateur)`
- `ip_address` (VARCHAR(50))
- `user_agent` (TEXT)
- `date_log` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### Relations

```
parametres_systeme (isolé)

types_articles (1) ──< (N) articles_catalogue
articles_catalogue (1) ──< (N) articles_commande
articles_catalogue (1) ──< (N) ordres_fabrication

selecteurs (1) ──< (N) machines
types_machines (1) ──< (N) machines
machines (1) ──< (N) sous_of
machines (1) ──< (N) planning_machines

equipe_fabrication (1) ──< (N) utilisateurs (id_operateur)

clients (1) ──< (N) commandes
commandes (1) ──< (N) articles_commande
commandes (1) ──< (N) ordres_fabrication
ordres_fabrication (1) ──< (N) sous_of

types_mp (1) ──< (N) matieres_premieres
matieres_premieres (1) ──< (N) stock_mp
matieres_premieres (1) ──< (N) mouvements_mp
matieres_premieres (1) ──< (N) demandes_ourdissage
matieres_premieres (1) ──< (N) preparation_mp

fournisseurs (1) ──< (N) matieres_premieres (fournisseur_principal)

utilisateurs (N) ──< (N) utilisateurs_roles ──> (N) roles
utilisateurs (1) ──< (N) logs_systeme
```

### Fonctionnalités Frontend

**Pages associées :**
- `Login.tsx` - Connexion utilisateurs
- `Equipe.tsx` - Gestion équipe fabrication
- `Machines.tsx` - Gestion machines
- `MatieresPremieres.tsx` - Gestion matières premières
- `MatierePremiereStock.tsx` - Stock MP
- `Clients.tsx` - Gestion clients (base)
- `Commandes.tsx` - Gestion commandes
- `OF.tsx` - Ordres de fabrication
- `OFDetails.tsx` - Détails OF
- `Parametrage.tsx` - Paramètres système

---

## 2. Module Production et Qualité

**Fichier SQL** : `02_production_et_qualite.sql`

### Tables

#### Table : `ensouples`
Ensouples (bobines de fil).

**Colonnes :**
- `id_ensouple` (SERIAL PRIMARY KEY)
- `numero_ensouple` (VARCHAR(50) UNIQUE NOT NULL)
- `id_mp` (INTEGER) → `matieres_premieres(id_mp)`
- `metrage_initial` (DECIMAL(10,2) NOT NULL)
- `metrage_restant` (DECIMAL(10,2))
- `poids_initial` (DECIMAL(10,3))
- `poids_restant` (DECIMAL(10,3))
- `date_reception` (DATE)
- `date_nouage` (DATE)
- `statut` (VARCHAR(50) DEFAULT 'disponible')
- `emplacement` (VARCHAR(100))
- `qr_code_ensouple` (VARCHAR(255))
- `observations` (TEXT)
- `date_creation` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Table : `ensouples_attributions`
Attributions d'ensouples aux machines.

**Colonnes :**
- `id_attribution` (SERIAL PRIMARY KEY)
- `id_ensouple` (INTEGER NOT NULL) → `ensouples(id_ensouple)`
- `id_machine` (INTEGER NOT NULL) → `machines(id_machine)`
- `id_of` (INTEGER) → `ordres_fabrication(id_of)`
- `date_attribution` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `date_retrait` (TIMESTAMP)
- `metrage_consomme` (DECIMAL(10,2))
- `attribue_par` (INTEGER) → `equipe_fabrication(id_operateur)`
- `statut` (VARCHAR(50) DEFAULT 'en_cours')
- `observations` (TEXT)

#### Table : `controle_premiere_piece`
Contrôle première pièce.

**Colonnes :**
- `id_controle` (SERIAL PRIMARY KEY)
- `id_machine` (INTEGER NOT NULL) → `machines(id_machine)`
- `id_of` (INTEGER NOT NULL) → `ordres_fabrication(id_of)`
- `date_controle` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `id_operateur` (INTEGER NOT NULL) → `equipe_fabrication(id_operateur)`
- `poids_mesure` (DECIMAL(10,3))
- `poids_attendu` (DECIMAL(10,3))
- `ecart_poids` (DECIMAL(10,3))
- `largeur_mesure` (DECIMAL(10,2))
- `largeur_attendue` (DECIMAL(10,2))
- `ecart_largeur` (DECIMAL(10,2))
- `densite_trame` (DECIMAL(10,2))
- `densite_chaine` (DECIMAL(10,2))
- `aspect_visuel` (VARCHAR(50))
- `conformite` (BOOLEAN DEFAULT false)
- `observations` (TEXT)
- `actions_correctives` (TEXT)

#### Table : `suivi_fabrication`
Suivi de fabrication.

**Colonnes :**
- `id_suivi` (SERIAL PRIMARY KEY)
- `id_of` (INTEGER NOT NULL) → `ordres_fabrication(id_of)`
- `id_sous_of` (INTEGER) → `sous_of(id_sous_of)`
- `id_machine` (INTEGER) → `machines(id_machine)`
- `id_operateur` (INTEGER) → `equipe_fabrication(id_operateur)`
- `date_debut` (TIMESTAMP)
- `date_fin` (TIMESTAMP)
- `quantite_produite` (DECIMAL(10,3) DEFAULT 0)
- `quantite_rejetee` (DECIMAL(10,3) DEFAULT 0)
- `temps_production` (INTEGER) - En minutes
- `statut` (VARCHAR(30) DEFAULT 'en_cours')
- `observations` (TEXT)

#### Table : `lots_coupe`
Lots de coupe.

**Colonnes :**
- `id_lot_coupe` (SERIAL PRIMARY KEY)
- `numero_lot` (VARCHAR(50) UNIQUE NOT NULL)
- `id_of` (INTEGER) → `ordres_fabrication(id_of)`
- `date_coupe` (DATE NOT NULL DEFAULT CURRENT_DATE)
- `quantite_pieces` (INTEGER NOT NULL)
- `statut` (VARCHAR(30) DEFAULT 'en_attente')
- `coupe_par` (INTEGER) → `equipe_fabrication(id_operateur)`
- `notes` (TEXT)

#### Table : `sous_traitants`
Sous-traitants.

**Colonnes :**
- `id_sous_traitant` (SERIAL PRIMARY KEY)
- `code_sous_traitant` (VARCHAR(50) UNIQUE NOT NULL)
- `raison_sociale` (VARCHAR(255) NOT NULL)
- `adresse` (TEXT)
- `telephone` (VARCHAR(50))
- `email` (VARCHAR(255))
- `specialite` (VARCHAR(200))
- `actif` (BOOLEAN DEFAULT true)
- `date_creation` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Table : `mouvements_sous_traitance`
Mouvements de sous-traitance.

**Colonnes :**
- `id_mouvement` (SERIAL PRIMARY KEY)
- `id_sous_traitant` (INTEGER NOT NULL) → `sous_traitants(id_sous_traitant)`
- `id_of` (INTEGER) → `ordres_fabrication(id_of)`
- `type_mouvement` (VARCHAR(30) NOT NULL) - 'SORTIE', 'RETOUR'
- `quantite` (DECIMAL(10,3) NOT NULL)
- `date_mouvement` (DATE NOT NULL DEFAULT CURRENT_DATE)
- `statut` (VARCHAR(30) DEFAULT 'en_attente')
- `notes` (TEXT)

#### Table : `mouvements_st_detail`
Détails mouvements sous-traitance.

**Colonnes :**
- `id_detail` (SERIAL PRIMARY KEY)
- `id_mouvement` (INTEGER NOT NULL) → `mouvements_sous_traitance(id_mouvement)` [CASCADE]
- `id_article` (INTEGER) → `articles_catalogue(id_article)`
- `quantite` (DECIMAL(10,3) NOT NULL)
- `notes` (TEXT)

#### Table : `stock_produits_finis`
Stock produits finis.

**Colonnes :**
- `id_stock_pf` (SERIAL PRIMARY KEY)
- `id_article` (INTEGER NOT NULL) → `articles_catalogue(id_article)`
- `quantite_disponible` (DECIMAL(10,3) DEFAULT 0)
- `quantite_reservee` (DECIMAL(10,3) DEFAULT 0)
- `quantite_commande` (DECIMAL(10,3) DEFAULT 0)
- `numero_lot` (VARCHAR(50))
- `date_fabrication` (DATE)
- `date_peremption` (DATE)
- `emplacement` (VARCHAR(100))
- `date_derniere_entree` (TIMESTAMP)
- `date_derniere_sortie` (TIMESTAMP)

#### Table : `expeditions`
Expéditions.

**Colonnes :**
- `id_expedition` (SERIAL PRIMARY KEY)
- `numero_expedition` (VARCHAR(50) UNIQUE NOT NULL)
- `id_commande` (INTEGER) → `commandes(id_commande)`
- `date_expedition` (DATE NOT NULL DEFAULT CURRENT_DATE)
- `statut` (VARCHAR(30) DEFAULT 'en_preparation')
- `transporteur` (VARCHAR(100))
- `numero_suivi` (VARCHAR(100))
- `adresse_livraison` (TEXT)
- `notes` (TEXT)
- `created_by` (INTEGER) → `utilisateurs(id_utilisateur)`

#### Table : `expedition_palettes`
Palettes d'expédition.

**Colonnes :**
- `id_palette` (SERIAL PRIMARY KEY)
- `id_expedition` (INTEGER NOT NULL) → `expeditions(id_expedition)` [CASCADE]
- `numero_palette` (VARCHAR(50) NOT NULL)
- `poids` (DECIMAL(10,2))
- `dimensions` (VARCHAR(100))
- `statut` (VARCHAR(30) DEFAULT 'en_preparation')

#### Table : `expedition_colis`
Colis d'expédition.

**Colonnes :**
- `id_colis` (SERIAL PRIMARY KEY)
- `id_expedition` (INTEGER NOT NULL) → `expeditions(id_expedition)` [CASCADE]
- `id_palette` (INTEGER) → `expedition_palettes(id_palette)`
- `numero_colis` (VARCHAR(50) NOT NULL)
- `poids` (DECIMAL(10,2))
- `dimensions` (VARCHAR(100))
- `statut` (VARCHAR(30) DEFAULT 'en_preparation')

#### Table : `expedition_colis_detail`
Détails des colis.

**Colonnes :**
- `id_detail` (SERIAL PRIMARY KEY)
- `id_colis` (INTEGER NOT NULL) → `expedition_colis(id_colis)` [CASCADE]
- `id_article` (INTEGER) → `articles_catalogue(id_article)`
- `quantite` (DECIMAL(10,3) NOT NULL)
- `numero_lot` (VARCHAR(50))

#### Table : `inventaires_pf`
Inventaires produits finis.

**Colonnes :**
- `id_inventaire_pf` (SERIAL PRIMARY KEY)
- `numero_inventaire` (VARCHAR(50) UNIQUE NOT NULL)
- `date_inventaire` (DATE NOT NULL DEFAULT CURRENT_DATE)
- `statut` (VARCHAR(30) DEFAULT 'en_cours')
- `created_by` (INTEGER) → `utilisateurs(id_utilisateur)`
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Table : `inventaires_pf_detail`
Détails inventaires PF.

**Colonnes :**
- `id_detail` (SERIAL PRIMARY KEY)
- `id_inventaire_pf` (INTEGER NOT NULL) → `inventaires_pf(id_inventaire_pf)` [CASCADE]
- `id_article` (INTEGER NOT NULL) → `articles_catalogue(id_article)`
- `quantite_theorique` (DECIMAL(10,3) DEFAULT 0)
- `quantite_comptee` (DECIMAL(10,3) DEFAULT 0)
- `ecart` (DECIMAL(10,3) DEFAULT 0)
- `numero_lot` (VARCHAR(50))
- `observations` (TEXT)

#### Table : `suivi_finition`
Suivi finition.

**Colonnes :**
- `id_suivi` (SERIAL PRIMARY KEY)
- `id_of` (INTEGER) → `ordres_fabrication(id_of)`
- `id_lot_coupe` (INTEGER) → `lots_coupe(id_lot_coupe)`
- `etape_finition` (VARCHAR(50))
- `date_debut` (DATE)
- `date_fin` (DATE)
- `statut` (VARCHAR(30) DEFAULT 'en_attente')
- `realise_par` (INTEGER) → `equipe_fabrication(id_operateur)`
- `notes` (TEXT)

#### Table : `operations_finition`
Opérations de finition.

**Colonnes :**
- `id_operation` (SERIAL PRIMARY KEY)
- `id_suivi` (INTEGER) → `suivi_finition(id_suivi)`
- `type_operation` (VARCHAR(50))
- `date_operation` (DATE NOT NULL DEFAULT CURRENT_DATE)
- `quantite_traitee` (INTEGER)
- `statut` (VARCHAR(30) DEFAULT 'en_cours')
- `notes` (TEXT)

#### Table : `incidents_production`
Incidents de production.

**Colonnes :**
- `id_incident` (SERIAL PRIMARY KEY)
- `numero_incident` (VARCHAR(50) UNIQUE NOT NULL)
- `id_machine` (INTEGER) → `machines(id_machine)`
- `id_of` (INTEGER) → `ordres_fabrication(id_of)`
- `date_incident` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `type_incident` (VARCHAR(50))
- `gravite` (VARCHAR(20) DEFAULT 'moyenne')
- `description` (TEXT NOT NULL)
- `statut` (VARCHAR(30) DEFAULT 'ouvert')
- `resolu_par` (INTEGER) → `equipe_fabrication(id_operateur)`
- `date_resolution` (TIMESTAMP)
- `solution` (TEXT)
- `temps_arret` (INTEGER) - En minutes

#### Table : `arrets_production`
Arrêts de production.

**Colonnes :**
- `id_arret` (SERIAL PRIMARY KEY)
- `id_machine` (INTEGER NOT NULL) → `machines(id_machine)`
- `id_of` (INTEGER) → `ordres_fabrication(id_of)`
- `date_debut` (TIMESTAMP NOT NULL)
- `date_fin` (TIMESTAMP)
- `type_arret` (VARCHAR(50)) - 'PLANIFIE', 'NON_PLANIFIE', 'MAINTENANCE', 'PANNE'
- `duree` (INTEGER) - En minutes
- `motif` (TEXT)
- `statut` (VARCHAR(30) DEFAULT 'en_cours')

#### Table : `demandes_intervention`
Demandes d'intervention.

**Colonnes :**
- `id_demande` (SERIAL PRIMARY KEY)
- `numero_demande` (VARCHAR(50) UNIQUE NOT NULL)
- `id_machine` (INTEGER) → `machines(id_machine)`
- `id_incident` (INTEGER) → `incidents_production(id_incident)`
- `date_demande` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `demande_par` (INTEGER) → `equipe_fabrication(id_operateur)`
- `priorite` (VARCHAR(20) DEFAULT 'normale')
- `description` (TEXT NOT NULL)
- `statut` (VARCHAR(30) DEFAULT 'en_attente')
- `traite_par` (INTEGER) → `equipe_fabrication(id_operateur)`
- `date_intervention` (TIMESTAMP)
- `solution` (TEXT)

#### Table : `demandes_achat_pieces`
Demandes d'achat de pièces.

**Colonnes :**
- `id_demande` (SERIAL PRIMARY KEY)
- `numero_demande` (VARCHAR(50) UNIQUE NOT NULL)
- `id_demande_intervention` (INTEGER) → `demandes_intervention(id_demande)`
- `id_machine` (INTEGER) → `machines(id_machine)`
- `date_demande` (DATE NOT NULL DEFAULT CURRENT_DATE)
- `designation_piece` (VARCHAR(200) NOT NULL)
- `quantite` (INTEGER NOT NULL)
- `urgence` (VARCHAR(20) DEFAULT 'normale')
- `statut` (VARCHAR(30) DEFAULT 'en_attente')
- `notes` (TEXT)

#### Table : `types_non_conformites`
Types de non-conformités.

**Colonnes :**
- `id_type_nc` (SERIAL PRIMARY KEY)
- `code_type` (VARCHAR(20) UNIQUE NOT NULL)
- `libelle` (VARCHAR(100) NOT NULL)
- `description` (TEXT)
- `actif` (BOOLEAN DEFAULT true)

#### Table : `non_conformites`
Non-conformités.

**Colonnes :**
- `id_nc` (SERIAL PRIMARY KEY)
- `numero_nc` (VARCHAR(50) UNIQUE NOT NULL)
- `id_type_nc` (INTEGER) → `types_non_conformites(id_type_nc)`
- `id_of` (INTEGER) → `ordres_fabrication(id_of)`
- `id_lot_coupe` (INTEGER) → `lots_coupe(id_lot_coupe)`
- `date_detection` (DATE NOT NULL DEFAULT CURRENT_DATE)
- `detectee_par` (INTEGER) → `equipe_fabrication(id_operateur)`
- `description` (TEXT NOT NULL)
- `gravite` (VARCHAR(20) DEFAULT 'moyenne')
- `statut` (VARCHAR(30) DEFAULT 'ouverte')
- `resolue_par` (INTEGER) → `equipe_fabrication(id_operateur)`
- `date_resolution` (DATE)
- `solution` (TEXT)
- `quantite_affectee` (DECIMAL(10,3))

#### Table : `procedures_nc`
Procédures de non-conformité.

**Colonnes :**
- `id_procedure` (SERIAL PRIMARY KEY)
- `id_nc` (INTEGER NOT NULL) → `non_conformites(id_nc)` [CASCADE]
- `etape` (VARCHAR(50))
- `date_etape` (DATE)
- `realise_par` (INTEGER) → `equipe_fabrication(id_operateur)`
- `statut` (VARCHAR(30) DEFAULT 'en_attente')
- `notes` (TEXT)

#### Table : `types_alertes`
Types d'alertes.

**Colonnes :**
- `id_type_alerte` (SERIAL PRIMARY KEY)
- `code_type` (VARCHAR(20) UNIQUE NOT NULL)
- `libelle` (VARCHAR(100) NOT NULL)
- `description` (TEXT)
- `niveau` (VARCHAR(20)) - 'INFO', 'WARNING', 'CRITIQUE'
- `actif` (BOOLEAN DEFAULT true)

#### Table : `alertes_actives`
Alertes actives.

**Colonnes :**
- `id_alerte` (SERIAL PRIMARY KEY)
- `id_type_alerte` (INTEGER NOT NULL) → `types_alertes(id_type_alerte)`
- `titre` (VARCHAR(200) NOT NULL)
- `message` (TEXT NOT NULL)
- `date_alerte` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `statut` (VARCHAR(30) DEFAULT 'active')
- `consultee` (BOOLEAN DEFAULT false)
- `date_consultation` (TIMESTAMP)
- `resolue` (BOOLEAN DEFAULT false)
- `date_resolution` (TIMESTAMP)

#### Table : `historique_alertes`
Historique des alertes.

**Colonnes :**
- `id_historique` (SERIAL PRIMARY KEY)
- `id_alerte` (INTEGER) → `alertes_actives(id_alerte)`
- `action` (VARCHAR(50))
- `date_action` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `id_utilisateur` (INTEGER) → `utilisateurs(id_utilisateur)`
- `notes` (TEXT)

#### Table : `sla_interventions`
SLA des interventions.

**Colonnes :**
- `id_sla` (SERIAL PRIMARY KEY)
- `id_demande_intervention` (INTEGER) → `demandes_intervention(id_demande)`
- `duree_maximale` (INTEGER) - En minutes
- `duree_reelle` (INTEGER) - En minutes
- `respecte_sla` (BOOLEAN)
- `date_calcul` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### Relations

```
ensouples (1) ──< (N) ensouples_attributions
machines (1) ──< (N) ensouples_attributions
ordres_fabrication (1) ──< (N) ensouples_attributions

machines (1) ──< (N) controle_premiere_piece
ordres_fabrication (1) ──< (N) controle_premiere_piece

ordres_fabrication (1) ──< (N) suivi_fabrication
sous_of (1) ──< (N) suivi_fabrication
machines (1) ──< (N) suivi_fabrication

ordres_fabrication (1) ──< (N) lots_coupe
lots_coupe (1) ──< (N) suivi_finition

sous_traitants (1) ──< (N) mouvements_sous_traitance
ordres_fabrication (1) ──< (N) mouvements_sous_traitance

articles_catalogue (1) ──< (N) stock_produits_finis
articles_catalogue (1) ──< (N) inventaires_pf_detail

commandes (1) ──< (N) expeditions
expeditions (1) ──< (N) expedition_palettes
expedition_palettes (1) ──< (N) expedition_colis
expedition_colis (1) ──< (N) expedition_colis_detail

machines (1) ──< (N) incidents_production
machines (1) ──< (N) arrets_production
machines (1) ──< (N) demandes_intervention

types_non_conformites (1) ──< (N) non_conformites
ordres_fabrication (1) ──< (N) non_conformites
non_conformites (1) ──< (N) procedures_nc

types_alertes (1) ──< (N) alertes_actives
alertes_actives (1) ──< (N) historique_alertes
```

### Fonctionnalités Frontend

**Pages associées :**
- `Productions.tsx` - Suivi production
- `SuiviFabrication.tsx` - Suivi fabrication
- `QualiteAvance.tsx` - Qualité avancée
- `TableauBordMagasinPF.tsx` - Tableau de bord magasin PF
- `ListePalettes.tsx` - Liste palettes
- `ListeColisage.tsx` - Liste colisage
- `Soustraitants.tsx` - Gestion sous-traitants
- `DashboardChefProduction.tsx` - Dashboard chef production
- `DashboardTisseur.tsx` - Dashboard tisseur
- `TabletteTisseur.tsx` - Tablette tisseur
- `TabletteCoupeur.tsx` - Tablette coupeur
- `TabletteQualite.tsx` - Tablette qualité

---

## 3. Module Flux et Traçabilité

**Fichier SQL** : `03_flux_et_tracabilite.sql`

### Tables Principales

1. **`demandes_mp_tisseur`** - Demandes MP pour tisseur
2. **`historique_livraisons_mp`** - Historique livraisons MP
3. **`demandes_retour_mp`** - Demandes retour MP
4. **`demandes_completion_commande`** - Demandes completion commande
5. **`demandes_finition`** - Demandes finition
6. **`demandes_controle_qualite`** - Demandes contrôle qualité
7. **`demandes_expedition`** - Demandes expédition
8. **`notifications_demandes`** - Notifications demandes
9. **`motifs_2eme_choix`** - Motifs 2ème choix
10. **`grille_prix_2eme_choix`** - Grille prix 2ème choix
11. **`conditions_acceptation_2eme_choix`** - Conditions acceptation
12. **`declarations_2eme_choix`** - Déclarations 2ème choix
13. **`historique_mouvements_2eme_choix`** - Historique mouvements

**Pour les détails complets de chaque table, consultez le fichier SQL correspondant.**

---

## 4. Module Stock Multi-Entrepôts

**Fichier SQL** : `07_tables_stock_multi_entrepots.sql`

### Tables

1. **`entrepots`** - Entrepôts
2. **`stock_entrepots`** - Stock par entrepôt
3. **`transferts_entrepots`** - Transferts entre entrepôts

**Frontend** : `Entrepot.tsx`

---

## 5. Module Catalogue et Articles

**Fichiers SQL** : `05_tables_catalogue.sql`, `05_attributs_articles.sql`, `10_tables_catalogue_produit.sql`, `imports/00_attributs.sql`

### Tables Principales

1. **`parametres_modeles`** - Modèles de base (articles parents)
2. **`parametres_dimensions`** - Dimensions
3. **`parametres_finitions`** - Types de finitions
4. **`parametres_tissages`** - Types de tissages
5. **`parametres_couleurs`** - Couleurs
6. **`parametres_types_produits`** - Types de produits
7. **`parametres_nombre_couleurs`** - Nombre de couleurs
8. **`parametres_personnalisations`** - Options personnalisation
9. **`parametres_types_personnalisation`** - Types (Broderie, Sérigraphie, Autre)
10. **`nomenclature_selecteurs`** - Nomenclature sélecteurs (BOM)
11. **`produits`** - Produits (modèle de base)
12. **`attributs_produit`** - Attributs personnalisables
13. **`produit_attributs`** - Association produit-attributs
14. **`variantes_produit`** - Variantes produit
15. **`product_category`** - Catégories produits

**Frontend** : `Articles.tsx`, `Modeles.tsx`, `ParametresCatalogue.tsx`, `GestionAttributs.tsx`

---

## 6. Module Clients (CRM Enrichi)

**Fichier SQL** : `imports/08_structure_clients_enrichie.sql`

**Documentation complète** : Voir section "Module Clients (CRM Enrichi)" dans `DOCUMENTATION_MODULES.md`

---

## 7. Module Ventes

**Fichier SQL** : `11_modules_ventes.sql`

**Documentation complète** : Voir section "Module Ventes" dans `DOCUMENTATION_MODULES.md`

---

## 8. Module Achats

**Fichier SQL** : `12_modules_achats.sql`

### Tables

1. **`demandes_achat`** - Demandes d'achat
2. **`lignes_demande_achat`** - Lignes de demande
3. **`commandes_fournisseurs`** - Commandes fournisseurs
4. **`lignes_commande_fournisseur`** - Lignes de commande
5. **`receptions`** - Réceptions
6. **`lignes_reception`** - Lignes de réception
7. **`factures_fournisseurs`** - Factures fournisseurs
8. **`lignes_facture_fournisseur`** - Lignes de facture
9. **`paiements_fournisseurs`** - Paiements fournisseurs

**Frontend** : `PurchaseOrders.tsx`, `Fournisseurs.tsx`

---

## 9. Module Stock Avancé

**Fichier SQL** : `13_modules_stock_avance.sql`

### Tables

1. **`inventaires`** - Inventaires
2. **`lignes_inventaire`** - Lignes d'inventaire
3. **`mouvements_stock`** - Mouvements de stock
4. **`stock_reel`** - Stock réel (vue matérialisée)
5. **`reservations_stock`** - Réservations de stock
6. **`emplacements`** - Emplacements dans entrepôts

**Frontend** : `Inventaire.tsx`, `Mouvement.tsx`

---

## 10. Module Facturation

**Fichier SQL** : `11_modules_ventes.sql` (partie facturation)

**Documentation complète** : Voir section "Module Facturation" dans `DOCUMENTATION_MODULES.md`

---

## 11. Module Livraisons

**Fichier SQL** : `11_modules_ventes.sql` (partie livraisons)

**Documentation complète** : Voir section "Module Livraisons" dans `DOCUMENTATION_MODULES.md`

---

## 12. Module Comptabilité

**Fichier SQL** : `14_modules_comptabilite.sql`

### Tables

1. **`plan_comptable`** - Plan comptable
2. **`journaux_comptables`** - Journaux comptables
3. **`ecritures_comptables`** - Écritures comptables
4. **`lignes_ecriture`** - Lignes d'écriture
5. **`rapprochements_bancaires`** - Rapprochements bancaires
6. **`centres_analytiques`** - Centres analytiques

**Frontend** : `AccountMoves.tsx`

---

## 13. Module CRM (Opportunités)

**Fichier SQL** : `15_modules_crm.sql`

### Tables

1. **`contacts`** - Contacts (clients/fournisseurs)
2. **`opportunites`** - Opportunités
3. **`activites_crm`** - Activités CRM
4. **`campagnes`** - Campagnes marketing
5. **`participants_campagne`** - Participants aux campagnes

**Frontend** : `CRMLeads.tsx`

---

## 14. Module Point de Vente

**Fichier SQL** : `16_modules_point_de_vente.sql`

### Tables

1. **`caisses`** - Caisses
2. **`sessions_caisse`** - Sessions de caisse
3. **`ventes_caisse`** - Ventes en caisse
4. **`lignes_vente_caisse`** - Lignes de vente
5. **`remboursements_caisse`** - Remboursements

**Frontend** : `SaleOrders.tsx`

---

## 15. Module Planification Gantt

**Fichier SQL** : `19_modules_planification_gantt.sql`

### Tables

1. **`projets`** - Projets
2. **`taches_planification`** - Tâches de planification
3. **`ressources_planification`** - Ressources
4. **`affectations_ressources`** - Affectations ressources
5. **`contraintes_planification`** - Contraintes
6. **`optimisations_planification`** - Optimisations
7. **`vues_gantt`** - Vues Gantt

**Frontend** : `PlanificationGantt.tsx`, `PlanningDragDrop.tsx`

---

## 16. Module Maintenance

**Fichier SQL** : `17_modules_maintenance.sql`

### Tables

1. **`types_maintenance`** - Types de maintenance
2. **`interventions_maintenance`** - Interventions
3. **`pieces_detachees`** - Pièces détachées
4. **`planification_maintenance`** - Planification

**Frontend** : `Maintenance.tsx`, `TableauBordMecanicien.tsx`

---

## 17. Module Coûts

**Fichier SQL** : `18_modules_couts.sql`

### Tables

1. **`couts_of_theoriques`** - Coûts OF théoriques vs réels
2. **`couts_operation_theoriques`** - Coûts opération
3. **`couts_matiere_premiere`** - Coûts MP
4. **`budgets_production`** - Budgets production

**Frontend** : `Couts.tsx`

---

## 18. Module Qualité Avancée

**Fichier SQL** : `18_modules_qualite_avance.sql`

**Frontend** : `QualiteAvance.tsx`, `TabletteQualite.tsx`

---

## 19. Module Multi-Société

**Fichier SQL** : `21_modules_multisociete.sql`, `00_INITIALISATION_COMPLETE.sql`

### Tables

1. **`societes`** - Sociétés
2. **`etablissements`** - Établissements
3. **`parametres_societe`** - Paramètres par société

**Frontend** : `MultiSociete.tsx`

---

## 20. Module E-commerce IA

**Fichier SQL** : `22_modules_ecommerce_ia.sql`, `23_modules_ecommerce_ia.sql`

**Frontend** : `Ecommerce.tsx`

---

## 21. Module Communication Externe

**Fichier SQL** : `22_modules_communication_externe.sql`

**Frontend** : `Communication.tsx`

---

## 22. Module Utilisateurs et Groupes

**Fichiers SQL** : `imports/05_structure_utilisateurs_groupes.sql`, `imports/07_structure_utilisateurs_dashboards.sql`

**Documentation complète** : Voir section "Module Utilisateurs & Groupes" dans `DOCUMENTATION_MODULES.md`

---

## 23. Module Tracabilité Lots

**Fichier SQL** : `08_tables_tracabilite_lots.sql`

### Tables

1. **`lots_mp`** - Lots matières premières

---

## 24. Module Communication et Tâches

**Fichier SQL** : `09_tables_communication_taches.sql`

### Tables

1. **`taches`** - Tâches inter-postes
2. **`notifications`** - Notifications utilisateurs
3. **`messages_postes`** - Messages entre postes

**Frontend** : `MessagesOperateurs.tsx`, `Communication.tsx`

---

## 25. Module Mobile Devices

**Fichier SQL** : `04_mobile_devices.sql`

**Frontend** : Toutes les pages `Tablette*.tsx`

---

## 26. Module Paie Tunisie

**Fichier SQL** : `25_paie_tunisie.sql`

### Tables

1. **`hr_salary_rule`** - Règles de salaire
2. **`hr_payroll_structure`** - Structures de paie
3. **`hr_payslip_line`** - Lignes de bulletin
4. **`hr_contract`** - Contrats de travail

---

## 27. Module Comptabilité Tunisie

**Fichier SQL** : `26_comptabilite_tunisie.sql`

### Tables

1. **`account_tax`** - Taxes comptables
2. **`account_fiscal_position`** - Positions fiscales
3. **`account_fiscal_position_rule`** - Règles positions
4. **`account_withholding_tax`** - Retenues à la source
5. **`account_tax_report`** - Déclarations fiscales

---

## 28. Module Entrepôt Complet

**Fichier SQL** : `27_module_entrepot_complet.sql`

### Tables

1. **`stock_warehouse`** - Entrepôts (structure complète)
2. **`stock_location`** - Emplacements hiérarchiques
3. **`stock_quant`** - Quantités par produit/emplacement
4. **`stock_move`** - Mouvements de stock
5. **`stock_picking`** - Réceptions/Livraisons
6. **`stock_picking_type`** - Types d'opérations
7. **`stock_picking_move_rel`** - Relation picking/mouvements
8. **`stock_route`** - Routes logistiques
9. **`stock_rule`** - Règles de réapprovisionnement
10. **`stock_removal`** - Stratégies d'enlèvement
11. **`stock_putaway`** - Stratégies de rangement

**Frontend** : `Entrepot.tsx`, `StockPickings.tsx`

---

## 📚 Documentation Complémentaire

Pour une liste complète de toutes les tables avec leurs colonnes, consultez :
- **`LISTE_COMPLETE_TABLES.md`** - Liste exhaustive de toutes les tables
- **`DOCUMENTATION_MODULES.md`** - Documentation détaillée des modules principaux

---

**Dernière mise à jour** : 2026-01-22

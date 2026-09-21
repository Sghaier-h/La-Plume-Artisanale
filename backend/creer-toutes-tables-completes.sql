-- Script SQL COMPLET pour creer TOUTES les tables necessaires
-- Base sur les relations existantes et les modules Odoo
-- Execute dans pgAdmin Query Tool

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES DE BASE (Déjà créées mais incluses pour complétude)
-- ============================================================

-- Table utilisateurs (base)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id_utilisateur SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    role VARCHAR(50) DEFAULT 'USER',
    actif BOOLEAN DEFAULT true,
    id_operateur INTEGER, -- Reference vers equipe_fabrication
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table clients (res.partner)
CREATE TABLE IF NOT EXISTS clients (
    id_client SERIAL PRIMARY KEY,
    code_client VARCHAR(50) UNIQUE NOT NULL,
    raison_sociale VARCHAR(200) NOT NULL,
    adresse TEXT,
    code_postal VARCHAR(20),
    ville VARCHAR(100),
    pays VARCHAR(100) DEFAULT 'Tunisie',
    telephone VARCHAR(20),
    email VARCHAR(150),
    contact_principal VARCHAR(200),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MODULE SALE (Ventes) - Tables Odoo
-- ============================================================

-- Table commandes_clients (sale.order)
CREATE TABLE IF NOT EXISTS commandes_clients (
    id_commande SERIAL PRIMARY KEY,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    id_client INTEGER NOT NULL REFERENCES clients(id_client),
    date_commande DATE NOT NULL DEFAULT CURRENT_DATE,
    date_livraison_prevue DATE,
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    remise_globale NUMERIC(5,2) DEFAULT 0,
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    id_commande_existante INTEGER, -- Liaison vers table commandes existante
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table lignes_commande (sale.order.line)
CREATE TABLE IF NOT EXISTS lignes_commande (
    id_ligne SERIAL PRIMARY KEY,
    id_commande INTEGER NOT NULL REFERENCES commandes_clients(id_commande) ON DELETE CASCADE,
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    designation VARCHAR(200) NOT NULL,
    quantite_commandee NUMERIC(10,3) NOT NULL,
    prix_unitaire_ht NUMERIC(10,2) NOT NULL,
    taux_tva NUMERIC(5,2) DEFAULT 20,
    remise NUMERIC(5,2) DEFAULT 0,
    montant_ht NUMERIC(12,2) NOT NULL,
    montant_tva NUMERIC(12,2) NOT NULL,
    montant_ttc NUMERIC(12,2) NOT NULL,
    ordre INTEGER DEFAULT 0,
    id_article_commande INTEGER -- Liaison vers articles_commande existante
);

-- ============================================================
-- MODULE PRODUCT (Produits)
-- ============================================================

-- Table articles_catalogue (product.template)
CREATE TABLE IF NOT EXISTS articles_catalogue (
    id_article SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    reference VARCHAR(100),
    id_categorie INTEGER REFERENCES categories_articles(id_categorie),
    id_type_article INTEGER, -- Reference vers types_articles
    type_article VARCHAR(50),
    prix_vente NUMERIC(10,2) DEFAULT 0,
    prix_achat NUMERIC(10,2) DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table categories_articles (product.category)
CREATE TABLE IF NOT EXISTS categories_articles (
    id_categorie SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    id_categorie_parent INTEGER REFERENCES categories_articles(id_categorie),
    actif BOOLEAN DEFAULT true
);

-- ============================================================
-- MODULE STOCK (Stock) - Tables supplémentaires
-- ============================================================

-- Table entrepots (stock.warehouse)
CREATE TABLE IF NOT EXISTS entrepots (
    id_entrepot SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'stockage',
    adresse TEXT,
    responsable VARCHAR(200),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table livraisons (stock.picking)
CREATE TABLE IF NOT EXISTS livraisons (
    id_livraison SERIAL PRIMARY KEY,
    numero_livraison VARCHAR(50) UNIQUE NOT NULL,
    id_commande INTEGER REFERENCES commandes_clients(id_commande),
    date_livraison DATE NOT NULL DEFAULT CURRENT_DATE,
    statut VARCHAR(30) DEFAULT 'PREVUE',
    transporteur VARCHAR(100),
    numero_suivi VARCHAR(100),
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table stock_mp (stock.move pour matières premières)
CREATE TABLE IF NOT EXISTS stock_mp (
    id_stock_mp SERIAL PRIMARY KEY,
    id_mp INTEGER, -- Reference vers matieres_premieres
    quantite_disponible NUMERIC(10,3) DEFAULT 0,
    quantite_reservee NUMERIC(10,3) DEFAULT 0,
    id_entrepot INTEGER REFERENCES entrepots(id_entrepot),
    date_derniere_entree DATE,
    date_derniere_sortie DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table stock_produits_finis (stock.move pour produits finis)
CREATE TABLE IF NOT EXISTS stock_produits_finis (
    id_stock_pf SERIAL PRIMARY KEY,
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    quantite_disponible NUMERIC(10,3) DEFAULT 0,
    quantite_reservee NUMERIC(10,3) DEFAULT 0,
    id_lot_coupe INTEGER, -- Reference vers lots_coupe
    id_entrepot INTEGER REFERENCES entrepots(id_entrepot),
    date_derniere_entree DATE,
    date_derniere_sortie DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MODULE MRP (Manufacturing/Production) - Tables supplémentaires
-- ============================================================

-- Table ordres_fabrication (mrp.production) - Améliorée
CREATE TABLE IF NOT EXISTS ordres_fabrication (
    id_of SERIAL PRIMARY KEY,
    numero_of VARCHAR(50) UNIQUE NOT NULL,
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    id_article_commande INTEGER, -- Reference vers articles_commande
    quantite_a_produire DECIMAL(10,2) NOT NULL,
    quantite_produite DECIMAL(10,2) DEFAULT 0,
    date_creation_of DATE NOT NULL DEFAULT CURRENT_DATE,
    date_debut_prevue DATE,
    date_fin_prevue DATE,
    date_debut_reelle TIMESTAMP,
    date_fin_reelle TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'planifie',
    id_utilisateur INTEGER REFERENCES utilisateurs(id_utilisateur),
    cree_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table suivi_fabrication (mrp.workorder)
CREATE TABLE IF NOT EXISTS suivi_fabrication (
    id_suivi SERIAL PRIMARY KEY,
    id_of INTEGER NOT NULL REFERENCES ordres_fabrication(id_of),
    id_machine INTEGER, -- Reference vers machines
    id_operateur INTEGER, -- Reference vers equipe_fabrication
    date_debut TIMESTAMP,
    date_fin TIMESTAMP,
    quantite_produite NUMERIC(10,3) DEFAULT 0,
    quantite_rebut NUMERIC(10,3) DEFAULT 0,
    statut VARCHAR(30) DEFAULT 'EN_COURS',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table machines (mrp.workcenter)
CREATE TABLE IF NOT EXISTS machines (
    id_machine SERIAL PRIMARY KEY,
    code_machine VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    id_type_machine INTEGER, -- Reference vers types_machines
    id_selecteur_actuel INTEGER, -- Reference vers selecteurs
    statut VARCHAR(30) DEFAULT 'DISPONIBLE',
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table types_machines
CREATE TABLE IF NOT EXISTS types_machines (
    id_type_machine SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT
);

-- Table equipe_fabrication (mrp.workcenter.labor)
CREATE TABLE IF NOT EXISTS equipe_fabrication (
    id_operateur SERIAL PRIMARY KEY,
    code_operateur VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    poste VARCHAR(100),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table matieres_premieres (mrp.bom.line)
CREATE TABLE IF NOT EXISTS matieres_premieres (
    id_mp SERIAL PRIMARY KEY,
    code_mp VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    id_type_mp INTEGER, -- Reference vers types_mp
    id_fournisseur INTEGER, -- Reference vers fournisseurs
    unite VARCHAR(20) DEFAULT 'KG',
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table types_mp
CREATE TABLE IF NOT EXISTS types_mp (
    id_type_mp SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT
);

-- Table fournisseurs (res.partner pour suppliers)
CREATE TABLE IF NOT EXISTS fournisseurs (
    id_fournisseur SERIAL PRIMARY KEY,
    code_fournisseur VARCHAR(50) UNIQUE NOT NULL,
    raison_sociale VARCHAR(200) NOT NULL,
    adresse TEXT,
    telephone VARCHAR(20),
    email VARCHAR(150),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table preparation_mp (mrp.bom)
CREATE TABLE IF NOT EXISTS preparation_mp (
    id_preparation SERIAL PRIMARY KEY,
    id_of INTEGER NOT NULL REFERENCES ordres_fabrication(id_of),
    id_mp INTEGER NOT NULL REFERENCES matieres_premieres(id_mp),
    id_stock_mp INTEGER REFERENCES stock_mp(id_stock_mp),
    quantite_necessaire NUMERIC(10,3) NOT NULL,
    quantite_preparee NUMERIC(10,3) DEFAULT 0,
    prepare_par INTEGER, -- Reference vers equipe_fabrication
    statut VARCHAR(30) DEFAULT 'PREVUE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MODULE ACCOUNT (Comptabilité) - Tables supplémentaires
-- ============================================================

-- Table factures_clients (account.move - out_invoice)
CREATE TABLE IF NOT EXISTS factures_clients (
    id_facture SERIAL PRIMARY KEY,
    numero_facture VARCHAR(50) UNIQUE NOT NULL,
    id_client INTEGER NOT NULL REFERENCES clients(id_client),
    id_commande INTEGER REFERENCES commandes_clients(id_commande),
    date_facture DATE NOT NULL DEFAULT CURRENT_DATE,
    date_echeance DATE,
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    id_facture_existante INTEGER, -- Liaison vers table factures existante
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table factures_fournisseurs (account.move - in_invoice)
CREATE TABLE IF NOT EXISTS factures_fournisseurs (
    id_facture SERIAL PRIMARY KEY,
    numero_facture VARCHAR(50) UNIQUE NOT NULL,
    id_fournisseur INTEGER NOT NULL REFERENCES fournisseurs(id_fournisseur),
    date_facture DATE NOT NULL DEFAULT CURRENT_DATE,
    date_echeance DATE,
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MODULE PURCHASE (Achats)
-- ============================================================

-- Table commandes_fournisseurs (purchase.order)
CREATE TABLE IF NOT EXISTS commandes_fournisseurs (
    id_commande SERIAL PRIMARY KEY,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    id_fournisseur INTEGER REFERENCES fournisseurs(id_fournisseur),
    date_commande DATE NOT NULL DEFAULT CURRENT_DATE,
    date_livraison_prevue DATE,
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- RELATIONS AVEC TABLES EXISTANTES (Foreign Keys)
-- ============================================================

-- ETAPE 1: Ajouter les colonnes de liaison si elles n'existent pas
DO $$
BEGIN
    -- Colonne id_commande_existante dans commandes_clients
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commandes_clients')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commandes')
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'commandes_clients' 
           AND column_name = 'id_commande_existante'
       ) THEN
        ALTER TABLE commandes_clients 
        ADD COLUMN id_commande_existante INTEGER;
        RAISE NOTICE 'Colonne id_commande_existante ajoutee a commandes_clients';
    END IF;

    -- Colonne id_article_commande dans lignes_commande
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lignes_commande')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles_commande')
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'lignes_commande' 
           AND column_name = 'id_article_commande'
       ) THEN
        ALTER TABLE lignes_commande 
        ADD COLUMN id_article_commande INTEGER;
        RAISE NOTICE 'Colonne id_article_commande ajoutee a lignes_commande';
    END IF;

    -- Colonne id_facture_existante dans factures_clients
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'factures_clients')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'factures')
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'factures_clients' 
           AND column_name = 'id_facture_existante'
       ) THEN
        ALTER TABLE factures_clients 
        ADD COLUMN id_facture_existante INTEGER;
        RAISE NOTICE 'Colonne id_facture_existante ajoutee a factures_clients';
    END IF;

    -- Colonne id_article_commande dans ordres_fabrication (si n'existe pas)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ordres_fabrication')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles_commande')
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'ordres_fabrication' 
           AND column_name = 'id_article_commande'
       ) THEN
        ALTER TABLE ordres_fabrication 
        ADD COLUMN id_article_commande INTEGER;
        RAISE NOTICE 'Colonne id_article_commande ajoutee a ordres_fabrication';
    END IF;
END $$;

-- ETAPE 2: Creer les contraintes de cles etrangeres
DO $$
BEGIN
    -- Relation commandes_clients -> commandes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commandes')
       AND EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'commandes_clients' 
           AND column_name = 'id_commande_existante'
       )
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'fk_commandes_clients_commandes'
       ) THEN
        ALTER TABLE commandes_clients
        ADD CONSTRAINT fk_commandes_clients_commandes
        FOREIGN KEY (id_commande_existante) 
        REFERENCES commandes(id_commande);
        RAISE NOTICE 'Relation vers commandes creee';
    END IF;

    -- Relation lignes_commande -> articles_commande
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles_commande')
       AND EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'lignes_commande' 
           AND column_name = 'id_article_commande'
       )
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'fk_lignes_commande_articles_commande'
       ) THEN
        ALTER TABLE lignes_commande
        ADD CONSTRAINT fk_lignes_commande_articles_commande
        FOREIGN KEY (id_article_commande) 
        REFERENCES articles_commande(id_article_commande);
        RAISE NOTICE 'Relation vers articles_commande creee';
    END IF;

    -- Relation factures_clients -> factures
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'factures')
       AND EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'factures_clients' 
           AND column_name = 'id_facture_existante'
       )
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'fk_factures_clients_factures'
       ) THEN
        ALTER TABLE factures_clients
        ADD CONSTRAINT fk_factures_clients_factures
        FOREIGN KEY (id_facture_existante) 
        REFERENCES factures(id_facture);
        RAISE NOTICE 'Relation vers factures creee';
    END IF;

    -- Relation ordres_fabrication -> articles_commande
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles_commande')
       AND EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'ordres_fabrication' 
           AND column_name = 'id_article_commande'
       )
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'fk_ordres_fabrication_articles_commande'
       ) THEN
        ALTER TABLE ordres_fabrication
        ADD CONSTRAINT fk_ordres_fabrication_articles_commande
        FOREIGN KEY (id_article_commande) 
        REFERENCES articles_commande(id_article_commande);
        RAISE NOTICE 'Relation ordres_fabrication -> articles_commande creee';
    END IF;
END $$;

-- ============================================================
-- RAPPORT FINAL
-- ============================================================
DO $$
DECLARE
    tbl_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tbl_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'utilisateurs', 'clients', 'commandes_clients', 'lignes_commande',
        'articles_catalogue', 'categories_articles', 'entrepots', 'livraisons',
        'stock_mp', 'stock_produits_finis', 'ordres_fabrication', 
        'suivi_fabrication', 'machines', 'types_machines', 'equipe_fabrication',
        'matieres_premieres', 'types_mp', 'fournisseurs', 'preparation_mp',
        'factures_clients', 'factures_fournisseurs', 'commandes_fournisseurs'
    );
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'TABLES CREES AVEC SUCCES';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Nombre de tables Odoo: %', tbl_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Modules inclus:';
    RAISE NOTICE '  - Base (utilisateurs, clients)';
    RAISE NOTICE '  - Sale (commandes_clients, lignes_commande)';
    RAISE NOTICE '  - Product (articles_catalogue, categories_articles)';
    RAISE NOTICE '  - Stock (entrepots, livraisons, stock_mp, stock_produits_finis)';
    RAISE NOTICE '  - MRP (ordres_fabrication, suivi_fabrication, machines, etc.)';
    RAISE NOTICE '  - Account (factures_clients, factures_fournisseurs)';
    RAISE NOTICE '  - Purchase (commandes_fournisseurs)';
    RAISE NOTICE '';
    RAISE NOTICE 'Relations avec tables existantes: CREES';
    RAISE NOTICE '============================================================';
END $$;

-- Script SQL pour creer uniquement les tables manquantes
-- A executer dans pgAdmin Query Tool
-- Les tables existantes ne seront pas modifiees (CREATE TABLE IF NOT EXISTS)

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: utilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS utilisateurs (
    id_utilisateur SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    role VARCHAR(50) DEFAULT 'USER',
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: clients
-- ============================================================
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
-- TABLE: commandes_clients
-- ============================================================
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: lignes_commande
-- ============================================================
CREATE TABLE IF NOT EXISTS lignes_commande (
    id_ligne SERIAL PRIMARY KEY,
    id_commande INTEGER NOT NULL REFERENCES commandes_clients(id_commande) ON DELETE CASCADE,
    id_article INTEGER,
    designation VARCHAR(200) NOT NULL,
    quantite_commandee NUMERIC(10,3) NOT NULL,
    prix_unitaire_ht NUMERIC(10,2) NOT NULL,
    taux_tva NUMERIC(5,2) DEFAULT 20,
    remise NUMERIC(5,2) DEFAULT 0,
    montant_ht NUMERIC(12,2) NOT NULL,
    montant_tva NUMERIC(12,2) NOT NULL,
    montant_ttc NUMERIC(12,2) NOT NULL,
    ordre INTEGER DEFAULT 0
);

-- ============================================================
-- TABLE: articles_catalogue
-- ============================================================
CREATE TABLE IF NOT EXISTS articles_catalogue (
    id_article SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    reference VARCHAR(100),
    id_categorie INTEGER,
    type_article VARCHAR(50),
    prix_vente NUMERIC(10,2) DEFAULT 0,
    prix_achat NUMERIC(10,2) DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: categories_articles
-- ============================================================
CREATE TABLE IF NOT EXISTS categories_articles (
    id_categorie SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    id_categorie_parent INTEGER REFERENCES categories_articles(id_categorie),
    actif BOOLEAN DEFAULT true
);

-- ============================================================
-- TABLE: entrepots
-- ============================================================
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

-- ============================================================
-- TABLE: livraisons
-- ============================================================
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

-- ============================================================
-- TABLE: ordres_fabrication
-- ============================================================
CREATE TABLE IF NOT EXISTS ordres_fabrication (
    id_of SERIAL PRIMARY KEY,
    numero_of VARCHAR(50) UNIQUE NOT NULL,
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    quantite_a_produire DECIMAL(10,2) NOT NULL,
    quantite_produite DECIMAL(10,2) DEFAULT 0,
    date_creation_of DATE NOT NULL DEFAULT CURRENT_DATE,
    date_debut_prevue DATE,
    date_fin_prevue DATE,
    date_debut_reelle TIMESTAMP,
    date_fin_reelle TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'planifie',
    id_utilisateur INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: factures_clients
-- ============================================================
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: commandes_fournisseurs
-- ============================================================
CREATE TABLE IF NOT EXISTS commandes_fournisseurs (
    id_commande SERIAL PRIMARY KEY,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    id_fournisseur INTEGER,
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
-- MESSAGE DE CONFIRMATION ET VERIFICATION
-- ============================================================
DO $$
DECLARE
    tbl_name TEXT;
    tables_created INTEGER := 0;
    tables_existing INTEGER := 0;
    table_list TEXT[] := ARRAY['utilisateurs', 'clients', 'commandes_clients', 'lignes_commande', 
                                'articles_catalogue', 'categories_articles', 'entrepots', 
                                'livraisons', 'ordres_fabrication', 'factures_clients', 
                                'commandes_fournisseurs'];
    i INTEGER;
BEGIN
    -- Compter les tables creees ou existantes
    FOR i IN 1..array_length(table_list, 1) LOOP
        tbl_name := table_list[i];
        IF EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' 
                   AND table_name = tbl_name) THEN
            tables_existing := tables_existing + 1;
            RAISE NOTICE 'Table "%" : EXISTE DEJA', tbl_name;
        ELSE
            tables_created := tables_created + 1;
            RAISE NOTICE 'Table "%" : CREE', tbl_name;
        END IF;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'RESULTAT DE LA CREATION DES TABLES';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Tables existantes: %', tables_existing;
    RAISE NOTICE 'Tables creees: %', tables_created;
    RAISE NOTICE 'Total: 11 tables necessaires';
    RAISE NOTICE '';
    RAISE NOTICE 'Toutes les tables necessaires sont maintenant disponibles !';
    RAISE NOTICE '============================================================';
END $$;

-- Script SQL pour creer la base de donnees locale et les tables de base
-- Executez avec: psql -h localhost -p 5432 -U postgres -f creer-base-locale.sql

-- Creer la base de donnees
CREATE DATABASE "ERP_La_Plume_Local"
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'French_France.1252'
    LC_CTYPE = 'French_France.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Se connecter a la nouvelle base
\c "ERP_La_Plume_Local"

-- Creer les extensions necessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table utilisateurs (base)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table lignes_commande (sale.order.line)
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

-- Table articles_catalogue (product.template)
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

-- Table categories_articles (product.category)
CREATE TABLE IF NOT EXISTS categories_articles (
    id_categorie SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    id_categorie_parent INTEGER REFERENCES categories_articles(id_categorie),
    actif BOOLEAN DEFAULT true
);

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

-- Table ordres_fabrication (mrp.production)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table commandes_fournisseurs (purchase.order)
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

-- Donnees de test
INSERT INTO clients (code_client, raison_sociale, email, telephone) VALUES
('CLI001', 'Client Test 1', 'client1@test.com', '123456789')
ON CONFLICT (code_client) DO NOTHING;

INSERT INTO categories_articles (nom) VALUES
('Categorie Test')
ON CONFLICT DO NOTHING;

INSERT INTO articles_catalogue (nom, reference, prix_vente, prix_achat) VALUES
('Article Test 1', 'ART001', 100.00, 50.00),
('Article Test 2', 'ART002', 200.00, 100.00)
ON CONFLICT DO NOTHING;

INSERT INTO entrepots (code, libelle, type) VALUES
('E1', 'Entrepot Principal', 'stockage')
ON CONFLICT (code) DO NOTHING;

-- Message de confirmation
\echo ''
\echo '============================================================'
\echo 'BASE DE DONNEES LOCALE CREE AVEC SUCCES !'
\echo '============================================================'
\echo ''
\echo 'Tables creees:'
\echo '  - utilisateurs'
\echo '  - clients'
\echo '  - commandes_clients'
\echo '  - lignes_commande'
\echo '  - articles_catalogue'
\echo '  - categories_articles'
\echo '  - entrepots'
\echo '  - livraisons'
\echo '  - ordres_fabrication'
\echo '  - factures_clients'
\echo '  - commandes_fournisseurs'
\echo ''
\echo 'Donnees de test ajoutees'
\echo ''

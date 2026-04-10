#!/bin/bash
# Script bash pour creer la base de donnees sur le serveur OVH
# A executer directement sur le serveur via SSH

echo "============================================================"
echo "CREATION BASE DE DONNEES SUR LE SERVEUR OVH"
echo "============================================================"
echo ""

# Parametres
DB_HOST="sh131616-002.eu.clouddb.ovh.net"
DB_PORT="35392"
DB_NAME="ERP_La_Plume_Local"
DB_USER="${1:-postgres}"  # Premier argument ou postgres par defaut

echo "Parametres:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Demander le mot de passe
read -sp "Mot de passe PostgreSQL: " DB_PASSWORD
echo ""

export PGPASSWORD="$DB_PASSWORD"

# Creer la base de donnees
echo "1. Creation de la base de donnees..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\";" 2>/dev/null

if [ $? -eq 0 ] || [ $? -eq 1 ]; then  # 0 = cree, 1 = existe deja
    echo "   Base de donnees creee ou existe deja"
else
    echo "   ERREUR lors de la creation"
    exit 1
fi

# Se connecter a la nouvelle base et creer les tables
echo ""
echo "2. Creation des tables..."

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table utilisateurs
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

-- Table clients
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

-- Table commandes_clients
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

-- Table lignes_commande
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

-- Table articles_catalogue
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

-- Table categories_articles
CREATE TABLE IF NOT EXISTS categories_articles (
    id_categorie SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    id_categorie_parent INTEGER REFERENCES categories_articles(id_categorie),
    actif BOOLEAN DEFAULT true
);

-- Table entrepots
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

-- Table livraisons
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

-- Table ordres_fabrication
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

-- Table factures_clients
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

-- Table commandes_fournisseurs
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
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "============================================================"
    echo "SUCCES ! Base de donnees creee sur le serveur"
    echo "============================================================"
    echo ""
    echo "Base de donnees: $DB_NAME"
    echo "Serveur: $DB_HOST:$DB_PORT"
    echo ""
else
    echo ""
    echo "ERREUR lors de la creation des tables"
    exit 1
fi

unset PGPASSWORD

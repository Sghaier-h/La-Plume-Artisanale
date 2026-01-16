-- ============================================================================
-- MODULE VENTES - DEVIS, COMMANDES, FACTURES
-- ============================================================================

-- Table : devis
CREATE TABLE IF NOT EXISTS devis (
    id_devis SERIAL PRIMARY KEY,
    numero_devis VARCHAR(50) UNIQUE NOT NULL,
    id_client INTEGER NOT NULL REFERENCES clients(id_client),
    id_contact INTEGER REFERENCES contacts(id_contact),
    date_devis DATE NOT NULL DEFAULT CURRENT_DATE,
    date_validite DATE,
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    -- Statuts: BROUILLON, ENVOYE, ACCEPTE, REFUSE, EXPIRE, TRANSFORME
    
    -- Totaux
    montant_ht NUMERIC(12,2) DEFAULT 0,
    taux_tva NUMERIC(5,2) DEFAULT 20,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    remise_globale NUMERIC(5,2) DEFAULT 0,
    montant_remise NUMERIC(12,2) DEFAULT 0,
    
    -- Informations
    reference_client VARCHAR(100),
    conditions_paiement VARCHAR(200),
    conditions_livraison VARCHAR(200),
    notes TEXT,
    
    -- Transformation
    id_commande INTEGER REFERENCES commandes_clients(id_commande),
    date_transformation TIMESTAMP,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : lignes_devis
CREATE TABLE IF NOT EXISTS lignes_devis (
    id_ligne SERIAL PRIMARY KEY,
    id_devis INTEGER NOT NULL REFERENCES devis(id_devis) ON DELETE CASCADE,
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    designation VARCHAR(200) NOT NULL,
    quantite NUMERIC(10,3) NOT NULL DEFAULT 1,
    prix_unitaire_ht NUMERIC(10,2) NOT NULL,
    taux_tva NUMERIC(5,2) DEFAULT 20,
    remise NUMERIC(5,2) DEFAULT 0,
    montant_ht NUMERIC(12,2) NOT NULL,
    montant_tva NUMERIC(12,2) NOT NULL,
    montant_ttc NUMERIC(12,2) NOT NULL,
    ordre INTEGER DEFAULT 0
);

-- Table : commandes_clients
CREATE TABLE IF NOT EXISTS commandes_clients (
    id_commande SERIAL PRIMARY KEY,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    id_client INTEGER NOT NULL REFERENCES clients(id_client),
    id_devis INTEGER REFERENCES devis(id_devis),
    date_commande DATE NOT NULL DEFAULT CURRENT_DATE,
    date_livraison_prevue DATE,
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    -- Statuts: EN_ATTENTE, EN_PREPARATION, PARTIELLEMENT_LIVREE, LIVREE, ANNULEE
    
    -- Totaux
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    remise_globale NUMERIC(5,2) DEFAULT 0,
    
    -- Informations
    adresse_livraison TEXT,
    adresse_facturation TEXT,
    conditions_paiement VARCHAR(200),
    notes TEXT,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : lignes_commande
CREATE TABLE IF NOT EXISTS lignes_commande (
    id_ligne SERIAL PRIMARY KEY,
    id_commande INTEGER NOT NULL REFERENCES commandes_clients(id_commande) ON DELETE CASCADE,
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    designation VARCHAR(200) NOT NULL,
    quantite_commandee NUMERIC(10,3) NOT NULL,
    quantite_livree NUMERIC(10,3) DEFAULT 0,
    quantite_reservee NUMERIC(10,3) DEFAULT 0,
    prix_unitaire_ht NUMERIC(10,2) NOT NULL,
    taux_tva NUMERIC(5,2) DEFAULT 20,
    remise NUMERIC(5,2) DEFAULT 0,
    montant_ht NUMERIC(12,2) NOT NULL,
    montant_tva NUMERIC(12,2) NOT NULL,
    montant_ttc NUMERIC(12,2) NOT NULL,
    ordre INTEGER DEFAULT 0
);

-- Table : livraisons
CREATE TABLE IF NOT EXISTS livraisons (
    id_livraison SERIAL PRIMARY KEY,
    numero_livraison VARCHAR(50) UNIQUE NOT NULL,
    id_commande INTEGER NOT NULL REFERENCES commandes_clients(id_commande),
    date_livraison DATE NOT NULL DEFAULT CURRENT_DATE,
    statut VARCHAR(30) DEFAULT 'PREVUE',
    -- Statuts: PREVUE, EN_PREPARATION, EXPEDIEE, LIVREE, RETOUR
    
    -- Informations
    transporteur VARCHAR(100),
    numero_suivi VARCHAR(100),
    adresse_livraison TEXT,
    notes TEXT,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : lignes_livraison
CREATE TABLE IF NOT EXISTS lignes_livraison (
    id_ligne SERIAL PRIMARY KEY,
    id_livraison INTEGER NOT NULL REFERENCES livraisons(id_livraison) ON DELETE CASCADE,
    id_ligne_commande INTEGER REFERENCES lignes_commande(id_ligne),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    quantite_livree NUMERIC(10,3) NOT NULL,
    numero_lot VARCHAR(50),
    date_peremption DATE,
    ordre INTEGER DEFAULT 0
);

-- Table : factures_clients
CREATE TABLE IF NOT EXISTS factures_clients (
    id_facture SERIAL PRIMARY KEY,
    numero_facture VARCHAR(50) UNIQUE NOT NULL,
    id_client INTEGER NOT NULL REFERENCES clients(id_client),
    id_commande INTEGER REFERENCES commandes_clients(id_commande),
    id_livraison INTEGER REFERENCES livraisons(id_livraison),
    date_facture DATE NOT NULL DEFAULT CURRENT_DATE,
    date_echeance DATE,
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    -- Statuts: BROUILLON, EMISE, PARTIELLEMENT_PAYEE, PAYEE, ANNULEE, IMPAYEE
    
    -- Totaux
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    montant_paye NUMERIC(12,2) DEFAULT 0,
    montant_restant NUMERIC(12,2) DEFAULT 0,
    remise_globale NUMERIC(5,2) DEFAULT 0,
    
    -- Informations
    adresse_facturation TEXT,
    conditions_paiement VARCHAR(200),
    notes TEXT,
    numero_tva_client VARCHAR(50),
    
    -- Avoirs
    est_avoir BOOLEAN DEFAULT FALSE,
    id_facture_origine INTEGER REFERENCES factures_clients(id_facture),
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : lignes_facture
CREATE TABLE IF NOT EXISTS lignes_facture (
    id_ligne SERIAL PRIMARY KEY,
    id_facture INTEGER NOT NULL REFERENCES factures_clients(id_facture) ON DELETE CASCADE,
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    designation VARCHAR(200) NOT NULL,
    quantite NUMERIC(10,3) NOT NULL,
    prix_unitaire_ht NUMERIC(10,2) NOT NULL,
    taux_tva NUMERIC(5,2) DEFAULT 20,
    remise NUMERIC(5,2) DEFAULT 0,
    montant_ht NUMERIC(12,2) NOT NULL,
    montant_tva NUMERIC(12,2) NOT NULL,
    montant_ttc NUMERIC(12,2) NOT NULL,
    ordre INTEGER DEFAULT 0
);

-- Table : paiements_clients
CREATE TABLE IF NOT EXISTS paiements_clients (
    id_paiement SERIAL PRIMARY KEY,
    id_facture INTEGER NOT NULL REFERENCES factures_clients(id_facture),
    date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
    montant NUMERIC(12,2) NOT NULL,
    mode_paiement VARCHAR(50) NOT NULL,
    -- Modes: ESPECES, CHEQUE, VIREMENT, CB, PRELEVEMENT, AUTRE
    
    -- Informations
    reference_paiement VARCHAR(100),
    numero_cheque VARCHAR(50),
    banque VARCHAR(100),
    notes TEXT,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_devis_client ON devis(id_client);
CREATE INDEX IF NOT EXISTS idx_devis_statut ON devis(statut);
CREATE INDEX IF NOT EXISTS idx_devis_date ON devis(date_devis);
CREATE INDEX IF NOT EXISTS idx_lignes_devis ON lignes_devis(id_devis);
CREATE INDEX IF NOT EXISTS idx_commandes_client ON commandes_clients(id_client);
CREATE INDEX IF NOT EXISTS idx_commandes_statut ON commandes_clients(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_date ON commandes_clients(date_commande);
CREATE INDEX IF NOT EXISTS idx_lignes_commande ON lignes_commande(id_commande);
CREATE INDEX IF NOT EXISTS idx_factures_client ON factures_clients(id_client);
CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures_clients(statut);
CREATE INDEX IF NOT EXISTS idx_factures_date ON factures_clients(date_facture);
CREATE INDEX IF NOT EXISTS idx_paiements_facture ON paiements_clients(id_facture);

-- Fonctions pour générer numéros automatiques
CREATE OR REPLACE FUNCTION generer_numero_devis()
RETURNS VARCHAR(50) AS $$
DECLARE
    numero VARCHAR(50);
    annee VARCHAR(4);
    compteur INTEGER;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_devis FROM '\d+$') AS INTEGER)), 0) + 1
    INTO compteur
    FROM devis
    WHERE numero_devis LIKE 'DEV-' || annee || '-%';
    numero := 'DEV-' || annee || '-' || LPAD(compteur::TEXT, 6, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generer_numero_commande()
RETURNS VARCHAR(50) AS $$
DECLARE
    numero VARCHAR(50);
    annee VARCHAR(4);
    compteur INTEGER;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_commande FROM '\d+$') AS INTEGER)), 0) + 1
    INTO compteur
    FROM commandes_clients
    WHERE numero_commande LIKE 'CMD-' || annee || '-%';
    numero := 'CMD-' || annee || '-' || LPAD(compteur::TEXT, 6, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generer_numero_facture()
RETURNS VARCHAR(50) AS $$
DECLARE
    numero VARCHAR(50);
    annee VARCHAR(4);
    compteur INTEGER;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_facture FROM '\d+$') AS INTEGER)), 0) + 1
    INTO compteur
    FROM factures_clients
    WHERE numero_facture LIKE 'FAC-' || annee || '-%';
    numero := 'FAC-' || annee || '-' || LPAD(compteur::TEXT, 6, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_devis_updated_at BEFORE UPDATE ON devis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_commandes_updated_at BEFORE UPDATE ON commandes_clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_factures_updated_at BEFORE UPDATE ON factures_clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

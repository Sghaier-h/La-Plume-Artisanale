-- ============================================================================
-- MODULE VENTES COMPLET - DEVIS, COMMANDES, BONS DE LIVRAISON, FACTURES, AVOIRS, BONS DE RETOUR
-- ============================================================================

-- ============================================================================
-- 1. DEVIS
-- ============================================================================

CREATE TABLE IF NOT EXISTS devis (
    id_devis SERIAL PRIMARY KEY,
    numero_devis VARCHAR(50) UNIQUE NOT NULL,
    id_client INTEGER NOT NULL REFERENCES clients(id_client),
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
    id_commande INTEGER REFERENCES commandes(id_commande),
    date_transformation TIMESTAMP,
    
    -- Métadonnées
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_devis_client ON devis(id_client);
CREATE INDEX IF NOT EXISTS idx_devis_statut ON devis(statut);
CREATE INDEX IF NOT EXISTS idx_devis_date ON devis(date_devis);

-- Table : lignes_devis
CREATE TABLE IF NOT EXISTS lignes_devis (
    id_ligne SERIAL PRIMARY KEY,
    id_devis INTEGER NOT NULL REFERENCES devis(id_devis) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_lignes_devis_devis ON lignes_devis(id_devis);

-- ============================================================================
-- 2. BONS DE LIVRAISON
-- ============================================================================

CREATE TABLE IF NOT EXISTS bons_livraison (
    id_bl SERIAL PRIMARY KEY,
    numero_bl VARCHAR(50) UNIQUE NOT NULL,
    id_commande INTEGER NOT NULL REFERENCES commandes(id_commande),
    id_client INTEGER NOT NULL REFERENCES clients(id_client),
    date_livraison DATE NOT NULL DEFAULT CURRENT_DATE,
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    -- Statuts: BROUILLON, EN_PREPARATION, EXPEDIEE, LIVREE, RETOURNEE
    
    -- Informations livraison
    transporteur VARCHAR(100),
    numero_suivi VARCHAR(100),
    adresse_livraison TEXT,
    notes TEXT,
    
    -- Totaux
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    
    -- Métadonnées
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bl_commande ON bons_livraison(id_commande);
CREATE INDEX IF NOT EXISTS idx_bl_client ON bons_livraison(id_client);
CREATE INDEX IF NOT EXISTS idx_bl_statut ON bons_livraison(statut);

-- Table : lignes_bl
CREATE TABLE IF NOT EXISTS lignes_bl (
    id_ligne SERIAL PRIMARY KEY,
    id_bl INTEGER NOT NULL REFERENCES bons_livraison(id_bl) ON DELETE CASCADE,
    id_ligne_commande INTEGER REFERENCES articles_commande(id_article_commande),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    designation VARCHAR(200) NOT NULL,
    quantite_livree NUMERIC(10,3) NOT NULL,
    prix_unitaire_ht NUMERIC(10,2) NOT NULL,
    taux_tva NUMERIC(5,2) DEFAULT 20,
    montant_ht NUMERIC(12,2) NOT NULL,
    montant_tva NUMERIC(12,2) NOT NULL,
    montant_ttc NUMERIC(12,2) NOT NULL,
    numero_lot VARCHAR(50),
    date_peremption DATE,
    ordre INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_lignes_bl_bl ON lignes_bl(id_bl);

-- ============================================================================
-- 3. FACTURES
-- ============================================================================

CREATE TABLE IF NOT EXISTS factures (
    id_facture SERIAL PRIMARY KEY,
    numero_facture VARCHAR(50) UNIQUE NOT NULL,
    id_commande INTEGER REFERENCES commandes(id_commande),
    id_bl INTEGER REFERENCES bons_livraison(id_bl),
    id_client INTEGER NOT NULL REFERENCES clients(id_client),
    date_facture DATE NOT NULL DEFAULT CURRENT_DATE,
    date_echeance DATE,
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    -- Statuts: BROUILLON, EMISE, ENVOYEE, REGLEE, PARTIELLEMENT_REGLEE, ANNULEE
    
    -- Totaux
    montant_ht NUMERIC(12,2) DEFAULT 0,
    taux_tva NUMERIC(5,2) DEFAULT 20,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    montant_regle NUMERIC(12,2) DEFAULT 0,
    montant_restant NUMERIC(12,2) DEFAULT 0,
    remise_globale NUMERIC(5,2) DEFAULT 0,
    montant_remise NUMERIC(12,2) DEFAULT 0,
    
    -- Informations
    reference_client VARCHAR(100),
    conditions_paiement VARCHAR(200),
    notes TEXT,
    
    -- Métadonnées
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_factures_commande ON factures(id_commande);
CREATE INDEX IF NOT EXISTS idx_factures_bl ON factures(id_bl);
CREATE INDEX IF NOT EXISTS idx_factures_client ON factures(id_client);
CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut);

-- Table : lignes_facture
CREATE TABLE IF NOT EXISTS lignes_facture (
    id_ligne SERIAL PRIMARY KEY,
    id_facture INTEGER NOT NULL REFERENCES factures(id_facture) ON DELETE CASCADE,
    id_ligne_commande INTEGER REFERENCES articles_commande(id_article_commande),
    id_ligne_bl INTEGER REFERENCES lignes_bl(id_ligne),
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

CREATE INDEX IF NOT EXISTS idx_lignes_facture_facture ON lignes_facture(id_facture);

-- ============================================================================
-- 4. AVOIRS
-- ============================================================================

CREATE TABLE IF NOT EXISTS avoirs (
    id_avoir SERIAL PRIMARY KEY,
    numero_avoir VARCHAR(50) UNIQUE NOT NULL,
    id_facture INTEGER REFERENCES factures(id_facture),
    id_client INTEGER NOT NULL REFERENCES clients(id_client),
    date_avoir DATE NOT NULL DEFAULT CURRENT_DATE,
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    -- Statuts: BROUILLON, EMIS, ENVOYE, APPLIQUE, ANNULE
    
    -- Motif
    motif VARCHAR(200) NOT NULL,
    type_avoir VARCHAR(50),
    -- Types: REMISE, RETOUR, ERREUR, GARANTIE, AUTRE
    
    -- Totaux
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    montant_applique NUMERIC(12,2) DEFAULT 0,
    montant_restant NUMERIC(12,2) DEFAULT 0,
    
    -- Informations
    reference_facture VARCHAR(100),
    notes TEXT,
    
    -- Métadonnées
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_avoirs_facture ON avoirs(id_facture);
CREATE INDEX IF NOT EXISTS idx_avoirs_client ON avoirs(id_client);
CREATE INDEX IF NOT EXISTS idx_avoirs_statut ON avoirs(statut);

-- Table : lignes_avoir
CREATE TABLE IF NOT EXISTS lignes_avoir (
    id_ligne SERIAL PRIMARY KEY,
    id_avoir INTEGER NOT NULL REFERENCES avoirs(id_avoir) ON DELETE CASCADE,
    id_ligne_facture INTEGER REFERENCES lignes_facture(id_ligne),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    designation VARCHAR(200) NOT NULL,
    quantite NUMERIC(10,3) NOT NULL,
    prix_unitaire_ht NUMERIC(10,2) NOT NULL,
    taux_tva NUMERIC(5,2) DEFAULT 20,
    montant_ht NUMERIC(12,2) NOT NULL,
    montant_tva NUMERIC(12,2) NOT NULL,
    montant_ttc NUMERIC(12,2) NOT NULL,
    ordre INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_lignes_avoir_avoir ON lignes_avoir(id_avoir);

-- ============================================================================
-- 5. BONS DE RETOUR
-- ============================================================================

CREATE TABLE IF NOT EXISTS bons_retour (
    id_retour SERIAL PRIMARY KEY,
    numero_retour VARCHAR(50) UNIQUE NOT NULL,
    id_bl INTEGER REFERENCES bons_livraison(id_bl),
    id_facture INTEGER REFERENCES factures(id_facture),
    id_client INTEGER NOT NULL REFERENCES clients(id_client),
    date_retour DATE NOT NULL DEFAULT CURRENT_DATE,
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    -- Statuts: BROUILLON, EN_ATTENTE, RECU, TRAITE, REFUSE
    
    -- Motif
    motif VARCHAR(200) NOT NULL,
    type_retour VARCHAR(50),
    -- Types: DEFECTUEUX, NON_CONFORME, ERREUR_LIVRAISON, AUTRE
    
    -- Informations
    adresse_retour TEXT,
    transporteur VARCHAR(100),
    numero_suivi VARCHAR(100),
    notes TEXT,
    
    -- Totaux
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    
    -- Métadonnées
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bons_retour_bl ON bons_retour(id_bl);
CREATE INDEX IF NOT EXISTS idx_bons_retour_facture ON bons_retour(id_facture);
CREATE INDEX IF NOT EXISTS idx_bons_retour_client ON bons_retour(id_client);
CREATE INDEX IF NOT EXISTS idx_bons_retour_statut ON bons_retour(statut);

-- Table : lignes_retour
CREATE TABLE IF NOT EXISTS lignes_retour (
    id_ligne SERIAL PRIMARY KEY,
    id_retour INTEGER NOT NULL REFERENCES bons_retour(id_retour) ON DELETE CASCADE,
    id_ligne_bl INTEGER REFERENCES lignes_bl(id_ligne),
    id_ligne_facture INTEGER REFERENCES lignes_facture(id_ligne),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    designation VARCHAR(200) NOT NULL,
    quantite_retournee NUMERIC(10,3) NOT NULL,
    prix_unitaire_ht NUMERIC(10,2) NOT NULL,
    taux_tva NUMERIC(5,2) DEFAULT 20,
    montant_ht NUMERIC(12,2) NOT NULL,
    montant_tva NUMERIC(12,2) NOT NULL,
    montant_ttc NUMERIC(12,2) NOT NULL,
    ordre INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_lignes_retour_retour ON lignes_retour(id_retour);

-- ============================================================================
-- FONCTIONS DE GÉNÉRATION DE NUMÉROS
-- ============================================================================

-- Fonction pour générer le numéro de devis
CREATE OR REPLACE FUNCTION generer_numero_devis()
RETURNS VARCHAR(50) AS $$
DECLARE
    annee VARCHAR(4);
    dernier_numero INTEGER;
    nouveau_numero VARCHAR(50);
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_devis FROM '\d+$') AS INTEGER)), 0) + 1
    INTO dernier_numero
    FROM devis
    WHERE numero_devis LIKE 'DEV-' || annee || '-%';
    
    nouveau_numero := 'DEV-' || annee || '-' || LPAD(dernier_numero::TEXT, 4, '0');
    
    RETURN nouveau_numero;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer le numéro de BL
CREATE OR REPLACE FUNCTION generer_numero_bl()
RETURNS VARCHAR(50) AS $$
DECLARE
    annee VARCHAR(4);
    dernier_numero INTEGER;
    nouveau_numero VARCHAR(50);
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_bl FROM '\d+$') AS INTEGER)), 0) + 1
    INTO dernier_numero
    FROM bons_livraison
    WHERE numero_bl LIKE 'BL-' || annee || '-%';
    
    nouveau_numero := 'BL-' || annee || '-' || LPAD(dernier_numero::TEXT, 4, '0');
    
    RETURN nouveau_numero;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer le numéro de facture
CREATE OR REPLACE FUNCTION generer_numero_facture()
RETURNS VARCHAR(50) AS $$
DECLARE
    annee VARCHAR(4);
    dernier_numero INTEGER;
    nouveau_numero VARCHAR(50);
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_facture FROM '\d+$') AS INTEGER)), 0) + 1
    INTO dernier_numero
    FROM factures
    WHERE numero_facture LIKE 'FAC-' || annee || '-%';
    
    nouveau_numero := 'FAC-' || annee || '-' || LPAD(dernier_numero::TEXT, 4, '0');
    
    RETURN nouveau_numero;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer le numéro d'avoir
CREATE OR REPLACE FUNCTION generer_numero_avoir()
RETURNS VARCHAR(50) AS $$
DECLARE
    annee VARCHAR(4);
    dernier_numero INTEGER;
    nouveau_numero VARCHAR(50);
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_avoir FROM '\d+$') AS INTEGER)), 0) + 1
    INTO dernier_numero
    FROM avoirs
    WHERE numero_avoir LIKE 'AVR-' || annee || '-%';
    
    nouveau_numero := 'AVR-' || annee || '-' || LPAD(dernier_numero::TEXT, 4, '0');
    
    RETURN nouveau_numero;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer le numéro de bon de retour
CREATE OR REPLACE FUNCTION generer_numero_retour()
RETURNS VARCHAR(50) AS $$
DECLARE
    annee VARCHAR(4);
    dernier_numero INTEGER;
    nouveau_numero VARCHAR(50);
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_retour FROM '\d+$') AS INTEGER)), 0) + 1
    INTO dernier_numero
    FROM bons_retour
    WHERE numero_retour LIKE 'RET-' || annee || '-%';
    
    nouveau_numero := 'RET-' || annee || '-' || LPAD(dernier_numero::TEXT, 4, '0');
    
    RETURN nouveau_numero;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE devis IS 'Table des devis clients';
COMMENT ON TABLE bons_livraison IS 'Table des bons de livraison';
COMMENT ON TABLE factures IS 'Table des factures clients';
COMMENT ON TABLE avoirs IS 'Table des avoirs (notes de crédit)';
COMMENT ON TABLE bons_retour IS 'Table des bons de retour clients';

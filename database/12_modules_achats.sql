-- ============================================================================
-- MODULE ACHATS - DEMANDES, COMMANDES FOURNISSEURS, FACTURES
-- ============================================================================

-- Table : demandes_achat
CREATE TABLE IF NOT EXISTS demandes_achat (
    id_demande SERIAL PRIMARY KEY,
    numero_demande VARCHAR(50) UNIQUE NOT NULL,
    id_service VARCHAR(100), -- Service demandeur
    date_demande DATE NOT NULL DEFAULT CURRENT_DATE,
    date_besoin DATE,
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    -- Statuts: BROUILLON, EN_ATTENTE, VALIDEE, COMMANDEE, RECEPTIONNEE, ANNULEE
    
    -- Totaux
    montant_estime_ht NUMERIC(12,2) DEFAULT 0,
    
    -- Informations
    motif TEXT,
    priorite INTEGER DEFAULT 2, -- 1=Urgent, 2=Normal, 3=Faible
    notes TEXT,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : lignes_demande_achat
CREATE TABLE IF NOT EXISTS lignes_demande_achat (
    id_ligne SERIAL PRIMARY KEY,
    id_demande INTEGER NOT NULL REFERENCES demandes_achat(id_demande) ON DELETE CASCADE,
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    designation VARCHAR(200) NOT NULL,
    quantite_demandee NUMERIC(10,3) NOT NULL,
    quantite_commandee NUMERIC(10,3) DEFAULT 0,
    quantite_receptionnee NUMERIC(10,3) DEFAULT 0,
    prix_unitaire_estime NUMERIC(10,2),
    montant_estime_ht NUMERIC(12,2),
    ordre INTEGER DEFAULT 0
);

-- Table : commandes_fournisseurs
CREATE TABLE IF NOT EXISTS commandes_fournisseurs (
    id_commande SERIAL PRIMARY KEY,
    numero_commande VARCHAR(50) UNIQUE NOT NULL,
    id_fournisseur INTEGER NOT NULL REFERENCES fournisseurs(id_fournisseur),
    id_demande INTEGER REFERENCES demandes_achat(id_demande),
    date_commande DATE NOT NULL DEFAULT CURRENT_DATE,
    date_livraison_prevue DATE,
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    -- Statuts: EN_ATTENTE, CONFIRMEE, PARTIELLEMENT_RECEPTIONNEE, RECEPTIONNEE, ANNULEE
    
    -- Totaux
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    remise_globale NUMERIC(5,2) DEFAULT 0,
    
    -- Informations
    adresse_livraison TEXT,
    conditions_paiement VARCHAR(200),
    delai_livraison INTEGER, -- En jours
    notes TEXT,
    reference_fournisseur VARCHAR(100),
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : lignes_commande_fournisseur
CREATE TABLE IF NOT EXISTS lignes_commande_fournisseur (
    id_ligne SERIAL PRIMARY KEY,
    id_commande INTEGER NOT NULL REFERENCES commandes_fournisseurs(id_commande) ON DELETE CASCADE,
    id_demande INTEGER REFERENCES demandes_achat(id_demande),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    designation VARCHAR(200) NOT NULL,
    quantite_commandee NUMERIC(10,3) NOT NULL,
    quantite_receptionnee NUMERIC(10,3) DEFAULT 0,
    prix_unitaire_ht NUMERIC(10,2) NOT NULL,
    taux_tva NUMERIC(5,2) DEFAULT 20,
    remise NUMERIC(5,2) DEFAULT 0,
    montant_ht NUMERIC(12,2) NOT NULL,
    montant_tva NUMERIC(12,2) NOT NULL,
    montant_ttc NUMERIC(12,2) NOT NULL,
    ordre INTEGER DEFAULT 0
);

-- Table : receptions
CREATE TABLE IF NOT EXISTS receptions (
    id_reception SERIAL PRIMARY KEY,
    numero_reception VARCHAR(50) UNIQUE NOT NULL,
    id_commande INTEGER NOT NULL REFERENCES commandes_fournisseurs(id_commande),
    date_reception DATE NOT NULL DEFAULT CURRENT_DATE,
    statut VARCHAR(30) DEFAULT 'EN_COURS',
    -- Statuts: EN_COURS, VALIDEE, REFUSEE, PARTIELLE
    
    -- Informations
    bon_livraison_fournisseur VARCHAR(100),
    controle_qualite BOOLEAN DEFAULT FALSE,
    notes TEXT,
    
    -- Métadonnées
    received_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : lignes_reception
CREATE TABLE IF NOT EXISTS lignes_reception (
    id_ligne SERIAL PRIMARY KEY,
    id_reception INTEGER NOT NULL REFERENCES receptions(id_reception) ON DELETE CASCADE,
    id_ligne_commande INTEGER REFERENCES lignes_commande_fournisseur(id_ligne),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    quantite_recue NUMERIC(10,3) NOT NULL,
    quantite_acceptee NUMERIC(10,3) DEFAULT 0,
    quantite_refusee NUMERIC(10,3) DEFAULT 0,
    numero_lot VARCHAR(50),
    date_peremption DATE,
    statut_qualite VARCHAR(30) DEFAULT 'EN_ATTENTE',
    -- Statuts: EN_ATTENTE, ACCEPTE, REFUSE, RETOURNE
    notes TEXT,
    ordre INTEGER DEFAULT 0
);

-- Table : factures_fournisseurs
CREATE TABLE IF NOT EXISTS factures_fournisseurs (
    id_facture SERIAL PRIMARY KEY,
    numero_facture VARCHAR(50) NOT NULL,
    numero_facture_fournisseur VARCHAR(100),
    id_fournisseur INTEGER NOT NULL REFERENCES fournisseurs(id_fournisseur),
    id_commande INTEGER REFERENCES commandes_fournisseurs(id_commande),
    id_reception INTEGER REFERENCES receptions(id_reception),
    date_facture DATE NOT NULL DEFAULT CURRENT_DATE,
    date_echeance DATE,
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    -- Statuts: BROUILLON, ENREGISTREE, PARTIELLEMENT_PAYEE, PAYEE, ANNULEE
    
    -- Totaux
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    montant_paye NUMERIC(12,2) DEFAULT 0,
    montant_restant NUMERIC(12,2) DEFAULT 0,
    remise_globale NUMERIC(5,2) DEFAULT 0,
    
    -- Informations
    conditions_paiement VARCHAR(200),
    notes TEXT,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : lignes_facture_fournisseur
CREATE TABLE IF NOT EXISTS lignes_facture_fournisseur (
    id_ligne SERIAL PRIMARY KEY,
    id_facture INTEGER NOT NULL REFERENCES factures_fournisseurs(id_facture) ON DELETE CASCADE,
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

-- Table : paiements_fournisseurs
CREATE TABLE IF NOT EXISTS paiements_fournisseurs (
    id_paiement SERIAL PRIMARY KEY,
    id_facture INTEGER NOT NULL REFERENCES factures_fournisseurs(id_facture),
    date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
    montant NUMERIC(12,2) NOT NULL,
    mode_paiement VARCHAR(50) NOT NULL,
    -- Modes: VIREMENT, CHEQUE, PRELEVEMENT, AUTRE
    
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
CREATE INDEX IF NOT EXISTS idx_demandes_date ON demandes_achat(date_demande);
CREATE INDEX IF NOT EXISTS idx_demandes_statut ON demandes_achat(statut);
CREATE INDEX IF NOT EXISTS idx_lignes_demande ON lignes_demande_achat(id_demande);
CREATE INDEX IF NOT EXISTS idx_commandes_fournisseur ON commandes_fournisseurs(id_fournisseur);
CREATE INDEX IF NOT EXISTS idx_commandes_fournisseur_statut ON commandes_fournisseurs(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_fournisseur_date ON commandes_fournisseurs(date_commande);
CREATE INDEX IF NOT EXISTS idx_lignes_commande_fournisseur ON lignes_commande_fournisseur(id_commande);
CREATE INDEX IF NOT EXISTS idx_receptions_commande ON receptions(id_commande);
CREATE INDEX IF NOT EXISTS idx_receptions_statut ON receptions(statut);
CREATE INDEX IF NOT EXISTS idx_factures_fournisseur ON factures_fournisseurs(id_fournisseur);
CREATE INDEX IF NOT EXISTS idx_factures_fournisseur_statut ON factures_fournisseurs(statut);
CREATE INDEX IF NOT EXISTS idx_paiements_fournisseur ON paiements_fournisseurs(id_facture);

-- Fonctions pour générer numéros automatiques
CREATE OR REPLACE FUNCTION generer_numero_demande_achat()
RETURNS VARCHAR(50) AS $$
DECLARE
    numero VARCHAR(50);
    annee VARCHAR(4);
    compteur INTEGER;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_demande FROM '\d+$') AS INTEGER)), 0) + 1
    INTO compteur
    FROM demandes_achat
    WHERE numero_demande LIKE 'DA-' || annee || '-%';
    numero := 'DA-' || annee || '-' || LPAD(compteur::TEXT, 6, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generer_numero_commande_fournisseur()
RETURNS VARCHAR(50) AS $$
DECLARE
    numero VARCHAR(50);
    annee VARCHAR(4);
    compteur INTEGER;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_commande FROM '\d+$') AS INTEGER)), 0) + 1
    INTO compteur
    FROM commandes_fournisseurs
    WHERE numero_commande LIKE 'CF-' || annee || '-%';
    numero := 'CF-' || annee || '-' || LPAD(compteur::TEXT, 6, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generer_numero_reception()
RETURNS VARCHAR(50) AS $$
DECLARE
    numero VARCHAR(50);
    annee VARCHAR(4);
    compteur INTEGER;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_reception FROM '\d+$') AS INTEGER)), 0) + 1
    INTO compteur
    FROM receptions
    WHERE numero_reception LIKE 'REC-' || annee || '-%';
    numero := 'REC-' || annee || '-' || LPAD(compteur::TEXT, 6, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_demandes_updated_at BEFORE UPDATE ON demandes_achat
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_commandes_fournisseur_updated_at BEFORE UPDATE ON commandes_fournisseurs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_receptions_updated_at BEFORE UPDATE ON receptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_factures_fournisseur_updated_at BEFORE UPDATE ON factures_fournisseurs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

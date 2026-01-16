-- ============================================================================
-- MODULE COMPTABILITÉ - PLAN COMPTABLE, JOURNAUX, ÉCRITURES
-- ============================================================================

-- Table : plan_comptable
CREATE TABLE IF NOT EXISTS plan_comptable (
    id_compte SERIAL PRIMARY KEY,
    numero_compte VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    
    -- Classification
    type_compte VARCHAR(30) NOT NULL,
    -- Types: ACTIF, PASSIF, CHARGE, PRODUIT, CAPITAUX
    classe_compte VARCHAR(10),
    -- Classes: 1=Financement, 2=Investissement, 3=Stock, 4=Tiers, 5=Trésorerie, 6=Charges, 7=Produits
    
    -- Hiérarchie
    compte_parent VARCHAR(20) REFERENCES plan_comptable(numero_compte),
    niveau INTEGER DEFAULT 1,
    est_analytique BOOLEAN DEFAULT FALSE,
    est_synthetique BOOLEAN DEFAULT TRUE,
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : journaux_comptables
CREATE TABLE IF NOT EXISTS journaux_comptables (
    id_journal SERIAL PRIMARY KEY,
    code_journal VARCHAR(10) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    
    -- Type
    type_journal VARCHAR(30) NOT NULL,
    -- Types: VENTES, ACHATS, BANQUE, CAISSE, OD_DIVERS, CENTRALISATION
    
    -- Configuration
    compte_bancaire VARCHAR(20), -- Compte de contrepartie
    prefixe_numero VARCHAR(10),
    format_numero VARCHAR(50), -- Ex: "VE{YYYY}{MM}{####}"
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    date_ouverture DATE,
    date_cloture DATE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : ecritures_comptables
CREATE TABLE IF NOT EXISTS ecritures_comptables (
    id_ecriture SERIAL PRIMARY KEY,
    id_journal INTEGER NOT NULL REFERENCES journaux_comptables(id_journal),
    numero_piece VARCHAR(50) NOT NULL,
    date_ecriture DATE NOT NULL,
    date_comptabilisation DATE NOT NULL,
    
    -- Référence
    id_reference INTEGER, -- ID du document source
    type_reference VARCHAR(50), -- Type: FACTURE_CLIENT, FACTURE_FOURNISSEUR, etc.
    numero_reference VARCHAR(100),
    
    -- Totaux
    montant_debit NUMERIC(12,2) DEFAULT 0,
    montant_credit NUMERIC(12,2) DEFAULT 0,
    
    -- État
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    -- Statuts: BROUILLON, COMPTABLE, LETTRE, CLOTURE
    lettree BOOLEAN DEFAULT FALSE,
    date_lettrage DATE,
    
    -- Informations
    libelle TEXT,
    notes TEXT,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(id_journal, numero_piece)
);

-- Table : lignes_ecriture
CREATE TABLE IF NOT EXISTS lignes_ecriture (
    id_ligne SERIAL PRIMARY KEY,
    id_ecriture INTEGER NOT NULL REFERENCES ecritures_comptables(id_ecriture) ON DELETE CASCADE,
    numero_compte VARCHAR(20) NOT NULL REFERENCES plan_comptable(numero_compte),
    
    -- Montants
    montant_debit NUMERIC(12,2) DEFAULT 0,
    montant_credit NUMERIC(12,2) DEFAULT 0,
    
    -- Informations
    libelle TEXT,
    reference VARCHAR(100),
    numero_piece VARCHAR(50),
    
    -- Tiers (si compte de tiers)
    id_tiers INTEGER, -- ID client ou fournisseur
    type_tiers VARCHAR(20), -- CLIENT ou FOURNISSEUR
    
    -- Analytique
    id_analytique INTEGER, -- Centre analytique
    repartition NUMERIC(5,2), -- Pourcentage
    
    -- Lettrage
    lettre_lettrage VARCHAR(10),
    
    ordre INTEGER DEFAULT 0
);

-- Table : rapprochements_bancaires
CREATE TABLE IF NOT EXISTS rapprochements_bancaires (
    id_rapprochement SERIAL PRIMARY KEY,
    id_journal INTEGER NOT NULL REFERENCES journaux_comptables(id_journal),
    numero_compte VARCHAR(20) NOT NULL REFERENCES plan_comptable(numero_compte),
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    
    -- Solde
    solde_comptable_debut NUMERIC(12,2) DEFAULT 0,
    solde_comptable_fin NUMERIC(12,2) DEFAULT 0,
    solde_releve_debut NUMERIC(12,2) DEFAULT 0,
    solde_releve_fin NUMERIC(12,2) DEFAULT 0,
    
    -- Écritures
    ecritures_rapprochees INTEGER DEFAULT 0,
    montant_rapproche NUMERIC(12,2) DEFAULT 0,
    
    -- État
    statut VARCHAR(30) DEFAULT 'EN_COURS',
    -- Statuts: EN_COURS, TERMINE, VALIDE
    date_validation DATE,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : centres_analytiques
CREATE TABLE IF NOT EXISTS centres_analytiques (
    id_centre SERIAL PRIMARY KEY,
    code_centre VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    
    -- Hiérarchie
    centre_parent INTEGER REFERENCES centres_analytiques(id_centre),
    niveau INTEGER DEFAULT 1,
    
    -- Type
    type_centre VARCHAR(30),
    -- Types: FONCTIONNEL, GEOGRAPHIQUE, PRODUIT, CLIENT
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_plan_comptable_numero ON plan_comptable(numero_compte);
CREATE INDEX IF NOT EXISTS idx_plan_comptable_type ON plan_comptable(type_compte);
CREATE INDEX IF NOT EXISTS idx_journaux_code ON journaux_comptables(code_journal);
CREATE INDEX IF NOT EXISTS idx_ecritures_journal ON ecritures_comptables(id_journal);
CREATE INDEX IF NOT EXISTS idx_ecritures_date ON ecritures_comptables(date_ecriture);
CREATE INDEX IF NOT EXISTS idx_ecritures_reference ON ecritures_comptables(type_reference, id_reference);
CREATE INDEX IF NOT EXISTS idx_ecritures_statut ON ecritures_comptables(statut);
CREATE INDEX IF NOT EXISTS idx_lignes_ecriture_compte ON lignes_ecriture(numero_compte);
CREATE INDEX IF NOT EXISTS idx_lignes_ecriture_ecriture ON lignes_ecriture(id_ecriture);
CREATE INDEX IF NOT EXISTS idx_rapprochements_journal ON rapprochements_bancaires(id_journal);
CREATE INDEX IF NOT EXISTS idx_rapprochements_statut ON rapprochements_bancaires(statut);

-- Fonction pour générer numéro pièce
CREATE OR REPLACE FUNCTION generer_numero_piece(journal_code VARCHAR, journal_prefixe VARCHAR)
RETURNS VARCHAR(50) AS $$
DECLARE
    numero VARCHAR(50);
    annee VARCHAR(4);
    mois VARCHAR(2);
    compteur INTEGER;
    format_num VARCHAR(50);
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    mois := TO_CHAR(CURRENT_DATE, 'MM');
    
    -- Construire format si disponible
    format_num := COALESCE(journal_prefixe, journal_code) || annee || mois;
    
    -- Compter pièces du mois
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_piece FROM '\d+$') AS INTEGER)), 0) + 1
    INTO compteur
    FROM ecritures_comptables e
    JOIN journaux_comptables j ON e.id_journal = j.id_journal
    WHERE j.code_journal = journal_code
    AND numero_piece LIKE format_num || '%';
    
    numero := format_num || LPAD(compteur::TEXT, 4, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Contrainte : Écritures équilibrées
ALTER TABLE ecritures_comptables
ADD CONSTRAINT check_ecriture_equilibree
CHECK (ABS(montant_debit - montant_credit) < 0.01);

-- Contrainte : Lignes écriture équilibrées
ALTER TABLE lignes_ecriture
ADD CONSTRAINT check_ligne_equilibree
CHECK ((montant_debit = 0 AND montant_credit > 0) OR (montant_debit > 0 AND montant_credit = 0));

-- Triggers
CREATE TRIGGER trigger_plan_comptable_updated_at BEFORE UPDATE ON plan_comptable
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_journaux_updated_at BEFORE UPDATE ON journaux_comptables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_ecritures_updated_at BEFORE UPDATE ON ecritures_comptables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_rapprochements_updated_at BEFORE UPDATE ON rapprochements_bancaires
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Données initiales : Plan comptable standard (PCG)
INSERT INTO plan_comptable (numero_compte, libelle, type_compte, classe_compte, niveau, actif) VALUES
-- Classe 6 - Charges
('601000', 'Achats stockés - Matières premières', 'CHARGE', '6', 2, TRUE),
('607000', 'Achats de marchandises', 'CHARGE', '6', 2, TRUE),
('608000', 'Autres achats', 'CHARGE', '6', 2, TRUE),
('609000', 'Rabais, remises et ristournes obtenus sur achats', 'CHARGE', '6', 2, TRUE),
('661000', 'Charges de personnel', 'CHARGE', '6', 2, TRUE),
('681000', 'Dotations aux amortissements', 'CHARGE', '6', 2, TRUE),

-- Classe 7 - Produits
('701000', 'Ventes de produits finis', 'PRODUIT', '7', 2, TRUE),
('707000', 'Ventes de marchandises', 'PRODUIT', '7', 2, TRUE),
('709000', 'Rabais, remises et ristournes accordés', 'PRODUIT', '7', 2, TRUE),

-- Classe 4 - Tiers
('411000', 'Clients', 'ACTIF', '4', 2, TRUE),
('401000', 'Fournisseurs', 'PASSIF', '4', 2, TRUE),

-- Classe 5 - Trésorerie
('512000', 'Banque', 'ACTIF', '5', 2, TRUE),
('531000', 'Caisse', 'ACTIF', '5', 2, TRUE),

-- Classe 3 - Stocks
('310000', 'Matières premières', 'ACTIF', '3', 2, TRUE),
('370000', 'Stocks de produits finis', 'ACTIF', '3', 2, TRUE)

ON CONFLICT (numero_compte) DO NOTHING;

-- Données initiales : Journaux standards
INSERT INTO journaux_comptables (code_journal, libelle, type_journal, prefixe_numero, actif) VALUES
('VE', 'Journal des Ventes', 'VENTES', 'VE', TRUE),
('AC', 'Journal des Achats', 'ACHATS', 'AC', TRUE),
('BQ', 'Journal de Banque', 'BANQUE', 'BQ', TRUE),
('CA', 'Journal de Caisse', 'CAISSE', 'CA', TRUE),
('OD', 'Journal des Opérations Diverses', 'OD_DIVERS', 'OD', TRUE)

ON CONFLICT (code_journal) DO NOTHING;

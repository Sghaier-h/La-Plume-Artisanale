-- ============================================================================
-- MODULE COMPTABILITÉ TUNISIE - PLAN COMPTABLE, TAXES, POSITIONS FISCALES
-- ============================================================================
-- Gestion complète de la comptabilité selon la législation tunisienne
-- Inspiré de l10n_tn d'Odoo
-- ============================================================================

-- Extension de la table plan_comptable pour Tunisie
ALTER TABLE plan_comptable ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES societes(id_societe);
ALTER TABLE plan_comptable ADD COLUMN IF NOT EXISTS account_type VARCHAR(50); -- receivable, payable, liquidity, other
ALTER TABLE plan_comptable ADD COLUMN IF NOT EXISTS reconcile BOOLEAN DEFAULT FALSE; -- Lettrable
ALTER TABLE plan_comptable ADD COLUMN IF NOT EXISTS deprecated BOOLEAN DEFAULT FALSE;

-- Table des taxes tunisiennes
CREATE TABLE IF NOT EXISTS account_tax (
    id_tax SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    
    -- Type de taxe
    type_tax_use VARCHAR(20) NOT NULL, -- sale, purchase, none
    amount_type VARCHAR(20) DEFAULT 'percent', -- percent, fixed, group, division
    amount NUMERIC(5,2) NOT NULL DEFAULT 0, -- Taux ou montant
    
    -- Taxes tunisiennes spécifiques
    -- TVA taux: 7%, 13%, 19%
    -- Timbre fiscal: 0.600 DT
    
    -- Calcul
    price_include BOOLEAN DEFAULT FALSE,
    include_base_amount BOOLEAN DEFAULT FALSE,
    
    -- Comptes
    account_id INTEGER REFERENCES plan_comptable(id_compte), -- Compte de charge
    refund_account_id INTEGER REFERENCES plan_comptable(id_compte), -- Compte de remboursement
    
    -- Groupement
    children_tax_ids INTEGER[], -- Taxes enfants (pour groupes)
    sequence INTEGER DEFAULT 0,
    
    -- Actif
    active BOOLEAN DEFAULT TRUE,
    company_id INTEGER REFERENCES societes(id_societe),
    
    -- Métadonnées
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_uid INTEGER,
    write_uid INTEGER
);

-- Table des positions fiscales (Tax Positions)
CREATE TABLE IF NOT EXISTS account_fiscal_position (
    id_position SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    
    -- Type position
    position_type VARCHAR(50), -- LOCAL, EXPORT, EXONEREE, etc.
    
    -- Pays
    country_id VARCHAR(2) DEFAULT 'TN', -- Code pays ISO
    
    -- Règles
    auto_apply BOOLEAN DEFAULT FALSE,
    sequence INTEGER DEFAULT 0,
    
    -- Configuration
    company_id INTEGER REFERENCES societes(id_societe),
    
    -- Métadonnées
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des règles de position fiscale
CREATE TABLE IF NOT EXISTS account_fiscal_position_rule (
    id_rule SERIAL PRIMARY KEY,
    fiscal_position_id INTEGER NOT NULL REFERENCES account_fiscal_position(id_position) ON DELETE CASCADE,
    tax_src_id INTEGER REFERENCES account_tax(id_tax),
    tax_dest_id INTEGER REFERENCES account_tax(id_tax),
    
    -- Conditions
    sequence INTEGER DEFAULT 0
);

-- Table des retenues à la source
CREATE TABLE IF NOT EXISTS account_withholding_tax (
    id_tax SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    
    -- Taux
    amount NUMERIC(5,2) NOT NULL DEFAULT 0,
    amount_type VARCHAR(20) DEFAULT 'percent',
    
    -- Seuil
    threshold NUMERIC(12,2) DEFAULT 0, -- Seuil minimum
    
    -- Comptes
    account_id INTEGER REFERENCES plan_comptable(id_compte),
    refund_account_id INTEGER REFERENCES plan_comptable(id_compte),
    
    -- Active
    active BOOLEAN DEFAULT TRUE,
    company_id INTEGER REFERENCES societes(id_societe),
    
    -- Métadonnées
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Extension des écritures comptables pour retenue à la source
ALTER TABLE ecritures_comptables ADD COLUMN IF NOT EXISTS withholding_tax_id INTEGER REFERENCES account_withholding_tax(id_tax);
ALTER TABLE ecritures_comptables ADD COLUMN IF NOT EXISTS withholding_amount NUMERIC(12,2) DEFAULT 0;

-- Extension des lignes d'écriture pour taxes
ALTER TABLE lignes_ecriture ADD COLUMN IF NOT EXISTS tax_ids INTEGER[]; -- IDs des taxes
ALTER TABLE lignes_ecriture ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12,2) DEFAULT 0; -- Montant de la taxe

-- Table des déclarations fiscales mensuelles
CREATE TABLE IF NOT EXISTS account_tax_report (
    id_report SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    period VARCHAR(10) NOT NULL, -- Format: YYYY-MM
    report_type VARCHAR(50) NOT NULL, -- TVA, IRPP, CNSS, etc.
    
    -- Totaux
    total_base NUMERIC(12,2) DEFAULT 0,
    total_tax NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) DEFAULT 0,
    
    -- État
    state VARCHAR(30) DEFAULT 'draft', -- draft, validated, sent, paid
    
    -- Dates
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    date_sent DATE,
    date_paid DATE,
    
    -- Fichiers
    file_path VARCHAR(500), -- Chemin vers le fichier de déclaration
    
    -- Métadonnées
    company_id INTEGER REFERENCES societes(id_societe),
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_account_tax_name ON account_tax(name);
CREATE INDEX IF NOT EXISTS idx_account_tax_type ON account_tax(type_tax_use);
CREATE INDEX IF NOT EXISTS idx_account_tax_company ON account_tax(company_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_position_name ON account_fiscal_position(name);
CREATE INDEX IF NOT EXISTS idx_fiscal_position_country ON account_fiscal_position(country_id);
CREATE INDEX IF NOT EXISTS idx_tax_report_period ON account_tax_report(period);
CREATE INDEX IF NOT EXISTS idx_tax_report_type ON account_tax_report(report_type);

-- Données initiales - Taxes tunisiennes
INSERT INTO account_tax (name, description, type_tax_use, amount_type, amount, active) VALUES
-- TVA Tunisie
('TVA 19%', 'TVA au taux de 19%', 'sale', 'percent', 19.00, TRUE),
('TVA 19% Achat', 'TVA au taux de 19% (Achat)', 'purchase', 'percent', 19.00, TRUE),
('TVA 13%', 'TVA au taux de 13%', 'sale', 'percent', 13.00, TRUE),
('TVA 13% Achat', 'TVA au taux de 13% (Achat)', 'purchase', 'percent', 13.00, TRUE),
('TVA 7%', 'TVA au taux de 7%', 'sale', 'percent', 7.00, TRUE),
('TVA 7% Achat', 'TVA au taux de 7% (Achat)', 'purchase', 'percent', 7.00, TRUE),
('TVA 0%', 'Exonéré de TVA', 'sale', 'percent', 0.00, TRUE),
-- Timbre fiscal
('Timbre Fiscal', 'Timbre fiscal obligatoire (0.600 DT)', 'sale', 'fixed', 0.600, TRUE)
ON CONFLICT DO NOTHING;

-- Données initiales - Positions fiscales Tunisie
INSERT INTO account_fiscal_position (name, position_type, country_id, active, auto_apply) VALUES
('Vente Locale', 'LOCAL', 'TN', TRUE, TRUE),
('Exportation', 'EXPORT', 'TN', TRUE, FALSE),
('Régime Totalement Exportateur', 'TOTAL_EXPORT', 'TN', TRUE, FALSE),
('Exonéré TVA', 'EXONEREE', 'TN', TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Module Comptabilité Tunisie créé avec succès!';
    RAISE NOTICE '✅ Taxes tunisiennes initiales insérées (TVA 7%, 13%, 19%)!';
    RAISE NOTICE '✅ Positions fiscales configurées!';
END $$;

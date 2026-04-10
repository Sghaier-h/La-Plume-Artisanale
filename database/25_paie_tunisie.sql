-- ============================================================================
-- MODULE PAIE TUNISIE - BULLETINS DE PAIE, COTISATIONS, IRPP
-- ============================================================================
-- Gestion complète de la paie selon la législation tunisienne
-- Inspiré de l10n_tn d'Odoo
-- ============================================================================

-- Table des règles salariales (Salary Rules)
CREATE TABLE IF NOT EXISTS hr_salary_rule (
    id_rule SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    -- Catégories: BASIC, ALW (Allowances), DED (Deductions), GROSS, NET, CNSS, IRPP, CSS
    sequence INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    
    -- Conditions
    condition_select VARCHAR(20) DEFAULT 'none', -- none, python, range
    condition_python TEXT, -- Code Python pour condition
    condition_range_min NUMERIC(12,2),
    condition_range_max NUMERIC(12,2),
    
    -- Calcul
    amount_select VARCHAR(20) DEFAULT 'fixed', -- fixed, percentage, python
    amount_fixed NUMERIC(12,2) DEFAULT 0,
    amount_percentage NUMERIC(5,2) DEFAULT 0,
    amount_percentage_base VARCHAR(50), -- Base du pourcentage
    amount_python TEXT, -- Code Python pour calcul
    
    -- Cotisations spécifiques Tunisie
    is_cnss BOOLEAN DEFAULT FALSE, -- Cotisation CNSS
    cnss_type VARCHAR(20), -- EMPLOYEE (salarié) ou EMPLOYER (patronal)
    cnss_rate NUMERIC(5,2), -- Taux CNSS (9.18% salarié, 16.57% patronal)
    
    is_irpp BOOLEAN DEFAULT FALSE, -- Impôt sur le Revenu
    is_css BOOLEAN DEFAULT FALSE, -- Contribution Sociale de Solidarité
    css_rate NUMERIC(5,2) DEFAULT 1.0, -- Taux CSS (1%)
    
    -- Apparence
    appears_on_payslip BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_uid INTEGER,
    write_uid INTEGER
);

-- Table des structures salariales (Salary Structures)
CREATE TABLE IF NOT EXISTS hr_payroll_structure (
    id_structure SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    active BOOLEAN DEFAULT TRUE,
    company_id INTEGER REFERENCES societes(id_societe),
    
    -- Configuration
    rule_ids INTEGER[], -- IDs des règles salariales
    parent_id INTEGER REFERENCES hr_payroll_structure(id_structure),
    
    -- Métadonnées
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Extension de la table bulletins de paie (hr_payslip)
-- Ajout des champs spécifiques Tunisie
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS structure_id INTEGER REFERENCES hr_payroll_structure(id_structure);
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS date_from DATE;
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS date_to DATE;
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS worked_days NUMERIC(10,2) DEFAULT 0;
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS worked_hours NUMERIC(10,2) DEFAULT 0;
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS basic_wage NUMERIC(12,2) DEFAULT 0; -- Salaire de base
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS gross_wage NUMERIC(12,2) DEFAULT 0; -- Salaire brut
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS net_wage NUMERIC(12,2) DEFAULT 0; -- Salaire net
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS total_deduction NUMERIC(12,2) DEFAULT 0; -- Total déductions
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS total_addition NUMERIC(12,2) DEFAULT 0; -- Total additions

-- Cotisations CNSS spécifiques
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS cnss_employee NUMERIC(12,2) DEFAULT 0; -- CNSS salarié (9.18%)
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS cnss_employer NUMERIC(12,2) DEFAULT 0; -- CNSS patronal (16.57%)
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS cnss_accident_travail NUMERIC(12,2) DEFAULT 0; -- TFP (0.5%)
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS foprolos NUMERIC(12,2) DEFAULT 0; -- FOPROLOS (1%)

-- Impôts
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS irpp NUMERIC(12,2) DEFAULT 0; -- IRPP
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS css NUMERIC(12,2) DEFAULT 0; -- CSS (1%)

-- Situation familiale (pour calcul IRPP)
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS situation_familiale VARCHAR(50); -- CELIBATAIRE, MARIE, CHEF_FAMILLE
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS nombre_enfants INTEGER DEFAULT 0;
ALTER TABLE hr_payslip ADD COLUMN IF NOT EXISTS chef_de_famille BOOLEAN DEFAULT FALSE;

-- Table des lignes de bulletin (hr_payslip_line)
CREATE TABLE IF NOT EXISTS hr_payslip_line (
    id_line SERIAL PRIMARY KEY,
    payslip_id INTEGER NOT NULL REFERENCES hr_payslip(id_payslip) ON DELETE CASCADE,
    salary_rule_id INTEGER REFERENCES hr_salary_rule(id_rule),
    
    -- Informations
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    sequence INTEGER DEFAULT 0,
    
    -- Montants
    rate NUMERIC(5,2) DEFAULT 0,
    amount NUMERIC(12,2) DEFAULT 0,
    quantity NUMERIC(10,2) DEFAULT 1,
    total NUMERIC(12,2) DEFAULT 0,
    
    -- Références
    slip_id INTEGER REFERENCES hr_payslip(id_payslip),
    employee_id INTEGER REFERENCES hr_employee(id_employee),
    contract_id INTEGER REFERENCES hr_contract(id_contract),
    
    -- Dates
    date_from DATE,
    date_to DATE,
    
    -- Apparence
    appears_on_payslip BOOLEAN DEFAULT TRUE
);

-- Table des contrats de travail
CREATE TABLE IF NOT EXISTS hr_contract (
    id_contract SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    employee_id INTEGER NOT NULL REFERENCES hr_employee(id_employee),
    structure_id INTEGER REFERENCES hr_payroll_structure(id_structure),
    
    -- Salaire
    wage NUMERIC(12,2) NOT NULL DEFAULT 0, -- Salaire de base
    wage_type VARCHAR(20) DEFAULT 'monthly', -- monthly, hourly, daily
    currency_id INTEGER REFERENCES res_currency(id_currency),
    
    -- Dates
    date_start DATE NOT NULL,
    date_end DATE,
    state VARCHAR(20) DEFAULT 'draft', -- draft, open, close, cancel
    
    -- Informations travail
    working_hours NUMERIC(5,2) DEFAULT 40.0, -- Heures par semaine
    working_hours_per_month NUMERIC(5,2) DEFAULT 173.33, -- Heures par mois
    
    -- Situation familiale (pour calcul IRPP)
    situation_familiale VARCHAR(50), -- CELIBATAIRE, MARIE, CHEF_FAMILLE
    nombre_enfants INTEGER DEFAULT 0,
    chef_de_famille BOOLEAN DEFAULT FALSE,
    
    -- Métadonnées
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_uid INTEGER,
    write_uid INTEGER
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_hr_salary_rule_code ON hr_salary_rule(code);
CREATE INDEX IF NOT EXISTS idx_hr_salary_rule_category ON hr_salary_rule(category);
CREATE INDEX IF NOT EXISTS idx_hr_payslip_employee ON hr_payslip(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_payslip_date ON hr_payslip(date_from, date_to);
CREATE INDEX IF NOT EXISTS idx_hr_payslip_state ON hr_payslip(state);
CREATE INDEX IF NOT EXISTS idx_hr_payslip_line_payslip ON hr_payslip_line(payslip_id);
CREATE INDEX IF NOT EXISTS idx_hr_payslip_line_code ON hr_payslip_line(code);
CREATE INDEX IF NOT EXISTS idx_hr_contract_employee ON hr_contract(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_contract_state ON hr_contract(state);

-- Données initiales - Règles salariales Tunisie
INSERT INTO hr_salary_rule (code, name, category, sequence, active, amount_select, is_cnss, cnss_type, cnss_rate, appears_on_payslip) VALUES
-- Salaire de base
('BASIC', 'Salaire de Base', 'BASIC', 10, TRUE, 'fixed', FALSE, NULL, NULL, TRUE),
-- Cotisations CNSS Salarié
('CNSS_EMP', 'CNSS Salarié', 'CNSS', 100, TRUE, 'percentage', TRUE, 'EMPLOYEE', 9.18, TRUE),
('CNSS_EMP_BASE', 'Base CNSS Salarié', 'CNSS', 99, TRUE, 'fixed', FALSE, NULL, NULL, FALSE),
-- Cotisations CNSS Patronal
('CNSS_PAT', 'CNSS Patronal', 'CNSS', 200, TRUE, 'percentage', TRUE, 'EMPLOYER', 16.57, TRUE),
('CNSS_PAT_BASE', 'Base CNSS Patronal', 'CNSS', 199, TRUE, 'fixed', FALSE, NULL, NULL, FALSE),
('CNSS_ACCIDENT', 'TFP - Taxe Formation Professionnelle', 'CNSS', 201, TRUE, 'percentage', TRUE, 'EMPLOYER', 0.50, TRUE),
('FOPROLOS', 'FOPROLOS - Fonds Promotion Logement Salariés', 'CNSS', 202, TRUE, 'percentage', TRUE, 'EMPLOYER', 1.00, TRUE),
-- IRPP
('IRPP', 'IRPP - Impôt sur le Revenu', 'IRPP', 300, TRUE, 'python', FALSE, NULL, NULL, TRUE),
('IRPP_BASE', 'Base IRPP', 'IRPP', 299, TRUE, 'fixed', FALSE, NULL, NULL, FALSE),
-- CSS
('CSS', 'CSS - Contribution Sociale de Solidarité', 'CSS', 400, TRUE, 'percentage', FALSE, NULL, NULL, TRUE),
-- Totaux
('GROSS', 'Salaire Brut', 'GROSS', 500, TRUE, 'fixed', FALSE, NULL, NULL, TRUE),
('TOTAL_DED', 'Total Déductions', 'DED', 600, TRUE, 'fixed', FALSE, NULL, NULL, TRUE),
('NET', 'Salaire Net', 'NET', 700, TRUE, 'fixed', FALSE, NULL, NULL, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Module Paie Tunisie créé avec succès!';
    RAISE NOTICE '✅ Règles salariales initiales insérées!';
    RAISE NOTICE '✅ Structure de calcul CNSS, IRPP, CSS configurée!';
END $$;

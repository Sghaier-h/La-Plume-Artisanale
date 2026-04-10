-- Script SQL pour créer les tables HR : Recrutement et Bulletins de paie
-- Extension du module HR avec gestion du recrutement et des salaires

-- Table des candidats / recrutement
CREATE TABLE IF NOT EXISTS hr_applicant (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    partner_name VARCHAR(255),
    email_from VARCHAR(255),
    phone VARCHAR(50),
    job_id INTEGER,
    department_id INTEGER,
    stage_id INTEGER,
    type_id INTEGER,
    user_id INTEGER,
    date_open TIMESTAMP,
    date_closed TIMESTAMP,
    priority VARCHAR(10) DEFAULT '1',
    salary_proposed DECIMAL(12, 2),
    salary_expected DECIMAL(12, 2),
    availability DATE,
    ref VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    description TEXT,
    state VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des étapes de recrutement
CREATE TABLE IF NOT EXISTS hr_recruitment_stage (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sequence INTEGER DEFAULT 0,
    job_id INTEGER,
    fold BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des bulletins de paie
CREATE TABLE IF NOT EXISTS hr_payslip (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    employee_id INTEGER NOT NULL,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    contract_id INTEGER NOT NULL,
    state VARCHAR(50) DEFAULT 'draft',
    struct_id INTEGER,
    basic_wage DECIMAL(12, 2),
    gross_wage DECIMAL(12, 2),
    net_wage DECIMAL(12, 2),
    total_deduction DECIMAL(12, 2),
    total_addition DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des contrats (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS hr_contract (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    employee_id INTEGER NOT NULL,
    department_id INTEGER,
    job_id INTEGER,
    date_start DATE NOT NULL,
    date_end DATE,
    trial_date_end DATE,
    state VARCHAR(50) DEFAULT 'draft',
    wage DECIMAL(12, 2) NOT NULL,
    wage_type VARCHAR(50) DEFAULT 'monthly',
    working_hours INTEGER,
    resource_calendar_id INTEGER,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des étapes de recrutement par défaut
INSERT INTO hr_recruitment_stage (name, sequence, fold) VALUES
    ('Nouveau', 1, FALSE),
    ('Entretien', 2, FALSE),
    ('Offre', 3, FALSE),
    ('Recruté', 4, TRUE),
    ('Refusé', 5, TRUE)
ON CONFLICT DO NOTHING;

-- Messages de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Tables HR (Recrutement et Salaires) créées avec succès';
END $$;

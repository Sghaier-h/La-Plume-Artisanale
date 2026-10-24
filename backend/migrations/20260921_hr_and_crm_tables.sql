-- ─────────────────────────────────────────────────────────────────
-- HR (recrutement + payslips) & CRM (pipeline stages) — La Plume Artisanale
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT DO NOTHING).
-- ─────────────────────────────────────────────────────────────────

-- HR applicants (recrutement)
CREATE TABLE IF NOT EXISTS hr_recruitment_stages (
  id_stage SERIAL PRIMARY KEY,
  code VARCHAR(32) UNIQUE,
  libelle VARCHAR(128),
  ordre INTEGER DEFAULT 0,
  couleur VARCHAR(32)
);

INSERT INTO hr_recruitment_stages (code, libelle, ordre, couleur)
VALUES
  ('nouveau','Nouveau',1,'#4A5D75'),
  ('entretien','Entretien',2,'#C89B3C'),
  ('test','Test',3,'#7A8C6A'),
  ('offre','Offre',4,'#B57B7B'),
  ('accepte','Accepté',5,'#6B8E4E'),
  ('refuse','Refusé',6,'#B84A2F')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS hr_applicants (
  id_applicant SERIAL PRIMARY KEY,
  nom VARCHAR(128), prenom VARCHAR(128),
  email VARCHAR(255), telephone VARCHAR(64),
  poste_vise VARCHAR(255),
  id_stage INTEGER REFERENCES hr_recruitment_stages(id_stage) ON DELETE SET NULL,
  statut VARCHAR(32) DEFAULT 'nouveau',
  cv_url VARCHAR(500),
  notes TEXT,
  motif_refus TEXT,
  date_candidature TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_embauche TIMESTAMP,
  created_by INTEGER, updated_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HR payslips (bulletins de paie)
CREATE TABLE IF NOT EXISTS hr_payslips (
  id_payslip SERIAL PRIMARY KEY,
  id_employe INTEGER,
  periode_debut DATE,
  periode_fin DATE,
  salaire_brut NUMERIC(12,3),
  cnss_salarie NUMERIC(12,3),
  irpp NUMERIC(12,3),
  css NUMERIC(12,3),
  salaire_net NUMERIC(12,3),
  statut VARCHAR(32) DEFAULT 'brouillon',
  notes TEXT,
  date_validation TIMESTAMP,
  date_paiement TIMESTAMP,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER, updated_by INTEGER
);

-- CRM stages (pipeline)
CREATE TABLE IF NOT EXISTS crm_stage (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128),
  ordre INTEGER,
  probabilite NUMERIC(5,2),
  fold BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true
);

INSERT INTO crm_stage (name, ordre, probabilite, fold, active)
VALUES
  ('Nouveau', 1, 10, false, true),
  ('Qualifié', 2, 25, false, true),
  ('Proposition', 3, 50, false, true),
  ('Négociation', 4, 75, false, true),
  ('Gagné', 5, 100, false, true),
  ('Perdu', 6, 0, true, true)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_hr_applicants_stage ON hr_applicants(id_stage);
CREATE INDEX IF NOT EXISTS idx_hr_applicants_statut ON hr_applicants(statut);
CREATE INDEX IF NOT EXISTS idx_hr_payslips_employe ON hr_payslips(id_employe);
CREATE INDEX IF NOT EXISTS idx_crm_stage_active ON crm_stage(active, ordre);

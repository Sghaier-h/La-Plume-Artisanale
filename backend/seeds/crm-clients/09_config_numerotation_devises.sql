-- =============================================================================
-- 09_config_numerotation_devises.sql — Presets numérotation + devises
-- Idempotent.
-- =============================================================================

-- Schémas si absents (autonome).
CREATE TABLE IF NOT EXISTS config_numerotation (
  id_config          SERIAL PRIMARY KEY,
  entite             VARCHAR(50) UNIQUE NOT NULL,
  format             VARCHAR(120) NOT NULL,
  sequence_courante  INTEGER NOT NULL DEFAULT 0,
  reset_period       VARCHAR(20) NOT NULL DEFAULT 'annuel',
  derniere_periode   VARCHAR(10),
  verrouille         BOOLEAN NOT NULL DEFAULT FALSE,
  date_creation      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_modification  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_config_devises (
  code               CHAR(3) PRIMARY KEY,
  libelle            VARCHAR(100) NOT NULL,
  symbole            VARCHAR(10),
  arrondi            INTEGER NOT NULL DEFAULT 2,
  taux_change_vs_tnd NUMERIC(15,6) NOT NULL DEFAULT 1,
  date_taux          TIMESTAMPTZ,
  actif              BOOLEAN NOT NULL DEFAULT TRUE,
  ordre              INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO config_numerotation (entite, format, reset_period) VALUES
  ('client',      'CLI-{YYYY}-{SEQ:4}',    'annuel'),
  ('contact',     'CTC-{SEQ:5}',           'jamais'),
  ('lead',        'LEAD-{YYYY}-{SEQ:4}',   'annuel'),
  ('opportunite', 'OPP-{YYYY}-{SEQ:4}',    'annuel'),
  ('interaction', 'INT-{YYYYMM}-{SEQ:4}',  'mensuel'),
  ('devis',       'DEV-{YYYY}-{SEQ:4}',    'annuel'),
  ('commande',    'CMD-{YYYY}-{SEQ:4}',    'annuel'),
  ('bl',          'BL-{YYYY}-{SEQ:4}',     'annuel'),
  ('facture',     'FA-{YYYY}-{SEQ:4}',     'annuel'),
  ('avoir',       'AV-{YYYY}-{SEQ:4}',     'annuel')
ON CONFLICT (entite) DO NOTHING;

INSERT INTO crm_config_devises (code, libelle, symbole, arrondi, taux_change_vs_tnd, actif, ordre) VALUES
  ('TND','Dinar tunisien','د.ت',3,1.000000,      TRUE,1),
  ('EUR','Euro',            '€',2,3.350000,      TRUE,2),
  ('USD','Dollar US',       '$',2,3.100000,      TRUE,3),
  ('GBP','Livre sterling',  '£',2,3.950000,      TRUE,4),
  ('CHF','Franc suisse',    'CHF',2,3.550000,    TRUE,5)
ON CONFLICT (code) DO NOTHING;

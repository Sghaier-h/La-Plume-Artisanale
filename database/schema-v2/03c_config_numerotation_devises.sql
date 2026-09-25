-- =============================================================================
-- 03c_config_numerotation_devises.sql — Numérotation configurable + devises
-- Structure générique (pas de préfixe crm_) car étendue à Ventes, Achats,
-- Fabrication.
-- =============================================================================

CREATE TABLE IF NOT EXISTS config_numerotation (
  id_config          SERIAL PRIMARY KEY,
  entite             VARCHAR(50) UNIQUE NOT NULL,   -- 'client','contact','lead','opportunite','interaction','devis','commande',...
  format             VARCHAR(120) NOT NULL,          -- ex. 'CLI-{YYYY}-{SEQ:4}'
  sequence_courante  INTEGER NOT NULL DEFAULT 0,
  reset_period       VARCHAR(20) NOT NULL DEFAULT 'annuel'
                     CHECK (reset_period IN ('jamais','annuel','mensuel')),
  derniere_periode   VARCHAR(10),                    -- 'YYYY' ou 'YYYY-MM'
  verrouille         BOOLEAN NOT NULL DEFAULT FALSE, -- true si des enregistrements existent (empêche changement rétroactif)
  date_creation      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_modification  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_config_devises (
  code               CHAR(3) PRIMARY KEY,             -- ISO 4217 : TND, EUR, USD…
  libelle            VARCHAR(100) NOT NULL,
  symbole            VARCHAR(10),                     -- 'د.ت' | '€' | '$' | '£' | 'CHF'
  arrondi            INTEGER NOT NULL DEFAULT 2,
  taux_change_vs_tnd NUMERIC(15,6) NOT NULL DEFAULT 1,
  date_taux          TIMESTAMPTZ,
  actif              BOOLEAN NOT NULL DEFAULT TRUE,
  ordre              INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ajout de la colonne devise sur comptes si absente (compat schéma legacy)
ALTER TABLE comptes ADD COLUMN IF NOT EXISTS devise CHAR(3) NOT NULL DEFAULT 'TND';
ALTER TABLE comptes ADD COLUMN IF NOT EXISTS taux_remise NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE comptes ADD COLUMN IF NOT EXISTS plafond_credit NUMERIC(15,2);
ALTER TABLE comptes ADD COLUMN IF NOT EXISTS conditions_paiement TEXT;
ALTER TABLE comptes ADD COLUMN IF NOT EXISTS delai_paiement INTEGER;
ALTER TABLE comptes ADD COLUMN IF NOT EXISTS mode_paiement_prefere VARCHAR(30);
ALTER TABLE comptes ADD COLUMN IF NOT EXISTS escompte_regl_anticipe NUMERIC(5,2);
ALTER TABLE comptes ADD COLUMN IF NOT EXISTS penalites_retard NUMERIC(5,2);
ALTER TABLE comptes ADD COLUMN IF NOT EXISTS id_type_commercial INTEGER;
ALTER TABLE comptes ADD COLUMN IF NOT EXISTS civilite VARCHAR(20);
ALTER TABLE comptes ADD COLUMN IF NOT EXISTS notes_commerciales TEXT;

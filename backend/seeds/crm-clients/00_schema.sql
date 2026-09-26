-- =============================================================================
-- 00_schema.sql — Applique les schémas complémentaires §3 avant les seeds
-- Idempotent : CREATE TABLE IF NOT EXISTS uniquement.
-- Reproduit le contenu de database/schema-v2/03b_crm_leads_interactions.sql
-- pour rester autonome (le script seed-demo.js exécute juste ces fichiers).
-- =============================================================================

CREATE TABLE IF NOT EXISTS leads (
  id_lead                    SERIAL PRIMARY KEY,
  canal                      VARCHAR(30) NOT NULL DEFAULT 'formulaire_web',
  source_detail              VARCHAR(200),
  nom_prospect               VARCHAR(150),
  email                      VARCHAR(200),
  telephone                  VARCHAR(30),
  societe                    VARCHAR(200),
  message                    TEXT,
  id_utilisateur_assigne     INT,
  statut                     VARCHAR(20) NOT NULL DEFAULT 'nouveau',
  id_client_converti         INT,
  motif_perte                VARCHAR(200),
  date_capture               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_conversion            TIMESTAMPTZ,
  cree_par                   INT,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interactions_crm (
  id_interaction    BIGSERIAL PRIMARY KEY,
  id_client         INT,
  id_lead           INT,
  id_contact        INT,
  type              VARCHAR(30) NOT NULL,
  sujet             VARCHAR(200),
  contenu           TEXT,
  direction         VARCHAR(10) NOT NULL DEFAULT 'sortant',
  id_utilisateur    INT,
  date_interaction  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  suivi_date        TIMESTAMPTZ,
  suivi_effectue    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_sources_leads (
  id_source SERIAL PRIMARY KEY,
  code      VARCHAR(50) UNIQUE NOT NULL,
  libelle   VARCHAR(150) NOT NULL,
  actif     BOOLEAN NOT NULL DEFAULT TRUE,
  ordre     INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_motifs_perte (
  id_motif  SERIAL PRIMARY KEY,
  code      VARCHAR(50) UNIQUE NOT NULL,
  libelle   VARCHAR(200) NOT NULL,
  actif     BOOLEAN NOT NULL DEFAULT TRUE,
  ordre     INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_categories_clients (
  id_categorie SERIAL PRIMARY KEY,
  code         VARCHAR(50) UNIQUE NOT NULL,
  libelle      VARCHAR(150) NOT NULL,
  couleur      VARCHAR(20),
  actif        BOOLEAN NOT NULL DEFAULT TRUE,
  ordre        INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

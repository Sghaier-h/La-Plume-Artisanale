-- =============================================================================
-- 03b_crm_leads_interactions.sql — Complément CRM :
--   • leads (funnel d'entrée, §3.4)
--   • interactions_crm (journal opérationnel, §3.5) — ajouté sans altérer
--     historique_commercial existant qui reste utilisé pour les événements
--     système (changement de statut, création…).
-- Contrat v2.2 — §3
-- =============================================================================

-- -----------------------------------------------------------------------------
-- leads (funnel d'entrée avant qualification en compte)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id_lead                    SERIAL PRIMARY KEY,
  canal                      VARCHAR(30) NOT NULL DEFAULT 'formulaire_web'
                             CHECK (canal IN (
                               'email_recu','formulaire_web','pub_facebook','pub_google',
                               'salon','whatsapp','telegram','telephone','referral','manual','import'
                             )),
  source_detail              VARCHAR(200),
  nom_prospect               VARCHAR(150),
  email                      VARCHAR(200),
  telephone                  VARCHAR(30),
  societe                    VARCHAR(200),
  message                    TEXT,
  id_utilisateur_assigne     INT REFERENCES users(id_user) ON DELETE SET NULL,
  statut                     VARCHAR(20) NOT NULL DEFAULT 'nouveau'
                             CHECK (statut IN ('nouveau','en_traitement','converti','perdu')),
  id_client_converti         INT REFERENCES comptes(id_client) ON DELETE SET NULL,
  motif_perte                VARCHAR(200),
  date_capture               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_conversion            TIMESTAMPTZ,
  cree_par                   INT REFERENCES users(id_user) ON DELETE SET NULL,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_statut  ON leads(statut);
CREATE INDEX IF NOT EXISTS idx_leads_canal   ON leads(canal);
CREATE INDEX IF NOT EXISTS idx_leads_assign  ON leads(id_utilisateur_assigne);
CREATE INDEX IF NOT EXISTS idx_leads_date    ON leads(date_capture DESC);

-- -----------------------------------------------------------------------------
-- interactions_crm — journal opérationnel des échanges (§3.5)
-- Distinct de historique_commercial (qui garde les événements système :
-- creation, changement_statut, attribution, archivage…).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS interactions_crm (
  id_interaction    BIGSERIAL PRIMARY KEY,
  id_client         INT REFERENCES comptes(id_client) ON DELETE CASCADE,
  id_lead           INT REFERENCES leads(id_lead)     ON DELETE CASCADE,
  id_contact        INT REFERENCES contacts(id_contact) ON DELETE SET NULL,
  type              VARCHAR(30) NOT NULL
                    CHECK (type IN (
                      'appel_entrant','appel_sortant','email_recu','email_envoye',
                      'whatsapp','telegram','rdv','note'
                    )),
  sujet             VARCHAR(200),
  contenu           TEXT,
  direction         VARCHAR(10) NOT NULL DEFAULT 'sortant'
                    CHECK (direction IN ('entrant','sortant','interne')),
  id_utilisateur    INT REFERENCES users(id_user) ON DELETE SET NULL,
  date_interaction  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  suivi_date        TIMESTAMPTZ,
  suivi_effectue    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (id_client IS NOT NULL OR id_lead IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_inter_client ON interactions_crm(id_client, date_interaction DESC);
CREATE INDEX IF NOT EXISTS idx_inter_lead   ON interactions_crm(id_lead,   date_interaction DESC);
CREATE INDEX IF NOT EXISTS idx_inter_type   ON interactions_crm(type);
CREATE INDEX IF NOT EXISTS idx_inter_user   ON interactions_crm(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_inter_suivi  ON interactions_crm(suivi_date) WHERE suivi_effectue = FALSE;

-- -----------------------------------------------------------------------------
-- Référentiels ParamCrm (sources, motifs, categories, canaux)
-- -----------------------------------------------------------------------------
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

-- Assignation N:M compte ↔ catégorie
CREATE TABLE IF NOT EXISTS comptes_categories (
  id_client    INT NOT NULL REFERENCES comptes(id_client) ON DELETE CASCADE,
  id_categorie INT NOT NULL REFERENCES crm_categories_clients(id_categorie) ON DELETE CASCADE,
  PRIMARY KEY (id_client, id_categorie)
);

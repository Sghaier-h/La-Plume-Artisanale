-- =============================================================================
-- 03_crm.sql — CRM : comptes (clients + prospects unifiés), contacts,
--                    adresses, comptes bancaires, historique commercial
-- Contrat v2.2 — §3
-- =============================================================================

-- -----------------------------------------------------------------------------
-- comptes (unifié : lead / prospect / client / archive)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comptes (
  id_client                     SERIAL PRIMARY KEY,
  code_client                   VARCHAR(32) UNIQUE,                 -- CLI-{YYYY}-{NNNN} attribué par NumeroSequenceService
  type_compte                   VARCHAR(20) NOT NULL DEFAULT 'societe' CHECK (type_compte IN ('societe','particulier')),
  statut_crm                    VARCHAR(20) NOT NULL DEFAULT 'lead' CHECK (statut_crm IN ('lead','prospect','client','archive')),
  raison_sociale                VARCHAR(200),
  nom                           VARCHAR(100),
  prenom                        VARCHAR(100),
  pays                          CHAR(2) NOT NULL DEFAULT 'TN',
  matricule_fiscal              VARCHAR(50),                        -- Tunisie
  numero_tva_intracom           VARCHAR(20),                        -- UE
  siret                         VARCHAR(14),                        -- France
  id_grille_tarif               INT,                                -- FK ajoutée après création tarifs (voir 04)
  id_commercial                 INT REFERENCES users(id_user) ON DELETE SET NULL ON UPDATE CASCADE,
  source_lead                   VARCHAR(50),
  canal_prefere                 VARCHAR(20) CHECK (canal_prefere IN ('email','whatsapp','telegram','telephone') OR canal_prefere IS NULL),
  consent_marketing_email       BOOLEAN NOT NULL DEFAULT FALSE,
  date_consent_email            TIMESTAMPTZ,
  consent_marketing_whatsapp    BOOLEAN NOT NULL DEFAULT FALSE,
  date_consent_whatsapp         TIMESTAMPTZ,
  consent_marketing_telegram    BOOLEAN NOT NULL DEFAULT FALSE,
  date_consent_telegram         TIMESTAMPTZ,
  notes                         TEXT,
  actif                         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cree_par                      INT REFERENCES users(id_user) ON DELETE SET NULL,
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modifie_par                   INT REFERENCES users(id_user) ON DELETE SET NULL,
  CHECK (
    (type_compte = 'societe'    AND raison_sociale IS NOT NULL) OR
    (type_compte = 'particulier' AND nom IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_comptes_code        ON comptes(code_client);
CREATE INDEX IF NOT EXISTS idx_comptes_statut      ON comptes(statut_crm);
CREATE INDEX IF NOT EXISTS idx_comptes_commercial  ON comptes(id_commercial);
CREATE INDEX IF NOT EXISTS idx_comptes_pays        ON comptes(pays);
CREATE INDEX IF NOT EXISTS idx_comptes_raison      ON comptes(raison_sociale);
CREATE INDEX IF NOT EXISTS idx_comptes_nom         ON comptes(nom, prenom);
COMMENT ON COLUMN comptes.code_client IS 'Généré via NumeroSequenceService code_document=CLI';

-- -----------------------------------------------------------------------------
-- contacts (personne physique attachée à un compte)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id_contact      SERIAL PRIMARY KEY,
  id_client       INT NOT NULL REFERENCES comptes(id_client)
                  ON DELETE CASCADE ON UPDATE CASCADE,
  role            VARCHAR(30) NOT NULL DEFAULT 'autre'
                  CHECK (role IN ('responsable','acheteur','commercial_client','technique','comptabilite','autre')),
  civilite        VARCHAR(5)  CHECK (civilite IN ('M','Mme') OR civilite IS NULL),
  nom             VARCHAR(100) NOT NULL,
  prenom          VARCHAR(100),
  fonction        VARCHAR(100),
  email           VARCHAR(150),
  telephone       VARCHAR(30),
  whatsapp        VARCHAR(30),
  est_principal   BOOLEAN NOT NULL DEFAULT FALSE,
  actif           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contacts_client ON contacts(id_client);
CREATE INDEX IF NOT EXISTS idx_contacts_email  ON contacts(email);
CREATE UNIQUE INDEX IF NOT EXISTS uq_contacts_principal
  ON contacts(id_client) WHERE est_principal = TRUE;

-- -----------------------------------------------------------------------------
-- adresses_client (multi par compte)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS adresses_client (
  id_adresse                SERIAL PRIMARY KEY,
  id_client                 INT NOT NULL REFERENCES comptes(id_client)
                            ON DELETE CASCADE ON UPDATE CASCADE,
  libelle                   VARCHAR(100),
  type_facturation          BOOLEAN NOT NULL DEFAULT FALSE,
  type_livraison            BOOLEAN NOT NULL DEFAULT FALSE,
  type_siege                BOOLEAN NOT NULL DEFAULT FALSE,
  rue                       VARCHAR(200),
  complement                VARCHAR(200),
  code_postal               VARCHAR(20),
  ville                     VARCHAR(100),
  region                    VARCHAR(100),
  pays                      CHAR(2) NOT NULL DEFAULT 'TN',
  contact_livraison_nom     VARCHAR(150),
  contact_livraison_telephone VARCHAR(30),
  est_defaut_facturation    BOOLEAN NOT NULL DEFAULT FALSE,
  est_defaut_livraison      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_adresses_client ON adresses_client(id_client);
CREATE UNIQUE INDEX IF NOT EXISTS uq_adr_defaut_fac
  ON adresses_client(id_client) WHERE est_defaut_facturation = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS uq_adr_defaut_liv
  ON adresses_client(id_client) WHERE est_defaut_livraison   = TRUE;

-- -----------------------------------------------------------------------------
-- comptes_bancaires_client (RIB/IBAN client pour virements)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comptes_bancaires_client (
  id_compte_bancaire SERIAL PRIMARY KEY,
  id_client          INT NOT NULL REFERENCES comptes(id_client)
                     ON DELETE CASCADE ON UPDATE CASCADE,
  libelle            VARCHAR(150) NOT NULL,
  banque             VARCHAR(150),
  rib                VARCHAR(50),
  iban               VARCHAR(40),
  bic                VARCHAR(20),
  devise             CHAR(3) NOT NULL DEFAULT 'TND',
  est_defaut         BOOLEAN NOT NULL DEFAULT FALSE,
  actif              BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cb_client ON comptes_bancaires_client(id_client);
CREATE UNIQUE INDEX IF NOT EXISTS uq_cb_defaut
  ON comptes_bancaires_client(id_client, devise) WHERE est_defaut = TRUE;

-- -----------------------------------------------------------------------------
-- historique_commercial (journal CRM = interactions + transitions statut)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historique_commercial (
  id_historique   BIGSERIAL PRIMARY KEY,
  id_client       INT NOT NULL REFERENCES comptes(id_client)
                  ON DELETE CASCADE ON UPDATE CASCADE,
  id_contact      INT REFERENCES contacts(id_contact) ON DELETE SET NULL ON UPDATE CASCADE,
  type_event      VARCHAR(30) NOT NULL,
      -- appel_entrant|appel_sortant|email_recu|email_envoye|whatsapp|telegram|rdv|note
      -- |changement_statut|attribution_commercial|creation|archivage
  direction       VARCHAR(10) CHECK (direction IN ('entrant','sortant','interne') OR direction IS NULL),
  sujet           VARCHAR(200),
  contenu         TEXT,
  ancien_statut   VARCHAR(20),                                      -- pour changement_statut
  nouveau_statut  VARCHAR(20),
  id_user         INT REFERENCES users(id_user) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hist_client ON historique_commercial(id_client, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hist_type   ON historique_commercial(type_event);
CREATE INDEX IF NOT EXISTS idx_hist_user   ON historique_commercial(id_user);

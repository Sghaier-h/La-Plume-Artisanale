-- =============================================================================
-- 02_params.sql — Paramètres société + Numérotations
-- Contrat v2.2 — §16, §16bis
-- =============================================================================

-- -----------------------------------------------------------------------------
-- parametres_societe (singleton par société)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parametres_societe (
  id_societe                SERIAL PRIMARY KEY,
  code_societe              VARCHAR(10) UNIQUE NOT NULL,   -- LP, AF, FT
  raison_sociale            VARCHAR(200) NOT NULL,
  forme_juridique           VARCHAR(50),                    -- SARL, SUARL, SA, EI
  capital_social            NUMERIC(14,3),
  devise_capital            CHAR(3)  NOT NULL DEFAULT 'TND',
  matricule_fiscal          VARCHAR(50),
  code_tva                  VARCHAR(30),
  rc                        VARCHAR(50),                    -- registre commerce
  logo_url                  VARCHAR(500),
  site_web                  VARCHAR(200),
  email_contact             VARCHAR(150),
  telephone_contact         VARCHAR(30),
  whatsapp_contact          VARCHAR(30),
  smtp_host                 VARCHAR(150),
  smtp_port                 INT,
  smtp_user                 VARCHAR(150),
  smtp_password             TEXT,                           -- chiffré
  smtp_ssl                  BOOLEAN NOT NULL DEFAULT TRUE,
  whatsapp_defaut_provider  VARCHAR(50),
  whatsapp_defaut_token     TEXT,                           -- chiffré
  mentions_legales_pdf      TEXT,                           -- pied documents
  conditions_generales_vente TEXT,
  actif                     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modifie_par               INT                             -- FK users (nullable, pas de FK dure pour éviter cycle)
);
COMMENT ON TABLE  parametres_societe IS 'Singleton — 1 ligne par entité juridique (LP par défaut)';
COMMENT ON COLUMN parametres_societe.smtp_password IS 'Chiffré applicatif (ne jamais logguer)';

-- -----------------------------------------------------------------------------
-- societe_adresses (multi)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS societe_adresses (
  id_adresse       SERIAL PRIMARY KEY,
  id_societe       INT NOT NULL REFERENCES parametres_societe(id_societe)
                   ON DELETE CASCADE ON UPDATE CASCADE,
  type_adresse     VARCHAR(30) NOT NULL,                   -- siege_social|usine|depot|bureau_commercial
  libelle          VARCHAR(150),
  rue              VARCHAR(200),
  complement       VARCHAR(200),
  code_postal      VARCHAR(20),
  ville            VARCHAR(100),
  region           VARCHAR(100),
  pays             CHAR(2) NOT NULL DEFAULT 'TN',
  est_principale   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_societe_adresses_societe ON societe_adresses(id_societe);
CREATE UNIQUE INDEX IF NOT EXISTS uq_societe_adresses_principale
  ON societe_adresses(id_societe) WHERE est_principale = TRUE;

-- -----------------------------------------------------------------------------
-- societe_bancaires (multi comptes RIB/IBAN)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS societe_bancaires (
  id_bancaire   SERIAL PRIMARY KEY,
  id_societe    INT NOT NULL REFERENCES parametres_societe(id_societe)
                ON DELETE CASCADE ON UPDATE CASCADE,
  libelle       VARCHAR(150) NOT NULL,
  banque        VARCHAR(150),
  agence        VARCHAR(150),
  rib           VARCHAR(50),
  iban          VARCHAR(40),
  bic           VARCHAR(20),
  devise        CHAR(3) NOT NULL DEFAULT 'TND',
  est_defaut    BOOLEAN NOT NULL DEFAULT FALSE,
  actif         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_societe_bancaires_societe ON societe_bancaires(id_societe);
CREATE UNIQUE INDEX IF NOT EXISTS uq_societe_bancaires_defaut
  ON societe_bancaires(id_societe, devise) WHERE est_defaut = TRUE;

-- -----------------------------------------------------------------------------
-- parametres_numerotation (§16bis.1)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parametres_numerotation (
  id_num              SERIAL PRIMARY KEY,
  id_societe          INT NOT NULL REFERENCES parametres_societe(id_societe)
                      ON DELETE CASCADE ON UPDATE CASCADE,
  code_document       VARCHAR(20) NOT NULL,   -- OF, CA, DEV, CMD, BL, FA, AVO, BC, REC, COL, PAL, ECR, CLI, FOU, ART, BSST, BRST
  prefixe             VARCHAR(10),
  suffixe             VARCHAR(10) NOT NULL DEFAULT '',
  format_annee        VARCHAR(10) NOT NULL DEFAULT 'aucune', -- aucune|AA|AAAA
  format_mois         VARCHAR(10) NOT NULL DEFAULT 'aucun',  -- aucun|MM
  separateur          VARCHAR(3)  NOT NULL DEFAULT '',
  longueur_sequence   INT NOT NULL DEFAULT 4 CHECK (longueur_sequence BETWEEN 1 AND 10),
  sequence_courante   BIGINT NOT NULL DEFAULT 0,
  reset_sequence      VARCHAR(10) NOT NULL DEFAULT 'jamais', -- jamais|annuel|mensuel
  annee_reset         INT,
  mois_reset          INT,
  template            VARCHAR(200),                          -- override si présent
  visible_menu_params BOOLEAN NOT NULL DEFAULT TRUE,
  verrouille          BOOLEAN NOT NULL DEFAULT FALSE,        -- true si pièces déjà émises
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by          INT,                                   -- FK users (soft)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_societe, code_document)
);
CREATE INDEX IF NOT EXISTS idx_pnum_societe ON parametres_numerotation(id_societe);
CREATE INDEX IF NOT EXISTS idx_pnum_code    ON parametres_numerotation(code_document);
COMMENT ON COLUMN parametres_numerotation.template IS
  'Ex: {prefixe}{AAAA}{sep}{seq:6}. Si NULL, template reconstruit depuis prefixe/format_annee/format_mois/separateur/longueur_sequence.';

-- -----------------------------------------------------------------------------
-- audit_numerotation (§16bis.3 tracé émissions)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_numerotation (
  id_audit_num    BIGSERIAL PRIMARY KEY,
  id_num          INT NOT NULL REFERENCES parametres_numerotation(id_num)
                  ON DELETE CASCADE ON UPDATE CASCADE,
  ancienne_seq    BIGINT NOT NULL,
  nouvelle_seq    BIGINT NOT NULL,
  numero_emis     VARCHAR(80) NOT NULL,
  contexte        VARCHAR(100),                     -- ex: "creation_devis id=42"
  id_user         INT,                              -- soft FK
  reset_effectue  BOOLEAN NOT NULL DEFAULT FALSE,   -- true si reset auto mensuel/annuel appliqué
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_num_id_num ON audit_numerotation(id_num, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_num_numero ON audit_numerotation(numero_emis);

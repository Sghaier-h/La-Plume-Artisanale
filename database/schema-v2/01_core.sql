-- =============================================================================
-- 01_core.sql — Domaine A : Core / Auth / Utilisateurs
-- Contrat v2.2 — §2bis, §17bis
-- PostgreSQL 15
-- =============================================================================

-- Extensions requises
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- -----------------------------------------------------------------------------
-- Table roles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id_role           SERIAL PRIMARY KEY,
  code              VARCHAR(50) UNIQUE NOT NULL, -- ADMIN, COMMERCIAL, ...
  libelle           VARCHAR(150) NOT NULL,
  description       TEXT,
  systeme           BOOLEAN NOT NULL DEFAULT FALSE, -- rôle non supprimable
  ordre_affichage   INT NOT NULL DEFAULT 0,
  actif             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON COLUMN roles.systeme IS 'true = rôle prédéfini par le contrat, non supprimable';

-- -----------------------------------------------------------------------------
-- Table permissions (catalogue granulaire <domaine>:<action>[:<scope>])
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permissions (
  id_permission     SERIAL PRIMARY KEY,
  code              VARCHAR(100) UNIQUE NOT NULL, -- ex facture:emettre
  domaine           VARCHAR(50)  NOT NULL,        -- facture, stock, ...
  action            VARCHAR(50)  NOT NULL,        -- emettre, consulter, ...
  scope             VARCHAR(50),                  -- soi, MP, ... (nullable)
  libelle           VARCHAR(200) NOT NULL,
  description       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_permissions_domaine ON permissions(domaine);

-- -----------------------------------------------------------------------------
-- Table role_permissions (N-N)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_permissions (
  id_role_permission SERIAL PRIMARY KEY,
  id_role            INT NOT NULL REFERENCES roles(id_role)
                     ON DELETE CASCADE ON UPDATE CASCADE,
  id_permission      INT NOT NULL REFERENCES permissions(id_permission)
                     ON DELETE CASCADE ON UPDATE CASCADE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_role, id_permission)
);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(id_role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_perm ON role_permissions(id_permission);

-- -----------------------------------------------------------------------------
-- Table users (utilisateurs applicatifs)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id_user                    SERIAL PRIMARY KEY,
  email                      CITEXT UNIQUE NOT NULL,      -- login principal
  username                   VARCHAR(50) UNIQUE,          -- alternatif
  mot_de_passe_hash          TEXT NOT NULL,               -- bcrypt cost 12
  id_employe                 INT,                         -- FK RH future (nullable)
  nom                        VARCHAR(100) NOT NULL,
  prenom                     VARCHAR(100) NOT NULL,
  telephone                  VARCHAR(30),                 -- E.164
  whatsapp                   VARCHAR(30),                 -- E.164
  role_principal             VARCHAR(50) NOT NULL,        -- code du rôle principal
  roles_supplementaires      TEXT[] NOT NULL DEFAULT '{}',
  permissions_supplementaires TEXT[] NOT NULL DEFAULT '{}',
  permissions_bloquees       TEXT[] NOT NULL DEFAULT '{}',
  id_langue                  VARCHAR(5) NOT NULL DEFAULT 'fr',
  photo_url                  VARCHAR(500),
  actif                      BOOLEAN NOT NULL DEFAULT TRUE,
  est_verifie                BOOLEAN NOT NULL DEFAULT FALSE,
  derniere_connexion         TIMESTAMPTZ,
  ip_derniere_connexion      INET,
  nb_echecs_connexion        INT NOT NULL DEFAULT 0,
  verrouille_jusqu           TIMESTAMPTZ,
  mfa_actif                  BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_secret_totp            TEXT,                        -- chiffré
  mfa_backup_codes_hash      TEXT[] NOT NULL DEFAULT '{}',
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cree_par                   INT,
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modifie_par                INT
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role_principal);
CREATE INDEX IF NOT EXISTS idx_users_actif ON users(actif);
COMMENT ON COLUMN users.mot_de_passe_hash IS 'bcrypt cost 12';
COMMENT ON COLUMN users.roles_supplementaires IS 'Multi-rôles complémentaires (codes)';

-- -----------------------------------------------------------------------------
-- Table user_roles (attribution N-N users <-> roles, mirror de role_principal + supp)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
  id_user_role   SERIAL PRIMARY KEY,
  id_user        INT NOT NULL REFERENCES users(id_user)
                 ON DELETE CASCADE ON UPDATE CASCADE,
  id_role        INT NOT NULL REFERENCES roles(id_role)
                 ON DELETE RESTRICT ON UPDATE CASCADE,
  est_principal  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cree_par       INT REFERENCES users(id_user) ON DELETE SET NULL,
  UNIQUE (id_user, id_role)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(id_user);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(id_role);

-- -----------------------------------------------------------------------------
-- Table sessions (multi-appareils)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id_session                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user                    INT NOT NULL REFERENCES users(id_user)
                             ON DELETE CASCADE ON UPDATE CASCADE,
  refresh_token_hash         TEXT NOT NULL,          -- bcrypt du refresh
  access_token_jti           VARCHAR(64),            -- pour blacklist Redis
  type_appareil              VARCHAR(30) NOT NULL,   -- web|mobile_ios|mobile_android|tablette_atelier
  nom_appareil               VARCHAR(200),
  user_agent                 TEXT,
  ip_creation                INET,
  ip_derniere_utilisation    INET,
  pays_derniere_utilisation  CHAR(2),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_derniere_utilisation  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_expiration            TIMESTAMPTZ NOT NULL,
  revoquee                   BOOLEAN NOT NULL DEFAULT FALSE,
  revoquee_par               INT REFERENCES users(id_user) ON DELETE SET NULL,
  motif_revocation           TEXT,
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(id_user);
CREATE INDEX IF NOT EXISTS idx_sessions_jti  ON sessions(access_token_jti);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(id_user) WHERE revoquee = FALSE;

-- -----------------------------------------------------------------------------
-- Table password_history (5 derniers hash pour empêcher réutilisation)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_history (
  id_password_history SERIAL PRIMARY KEY,
  id_user             INT NOT NULL REFERENCES users(id_user)
                      ON DELETE CASCADE ON UPDATE CASCADE,
  mot_de_passe_hash   TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_password_history_user ON password_history(id_user, created_at DESC);

-- -----------------------------------------------------------------------------
-- Table login_attempts (traçage tentatives login pour rate-limit / fail2ban)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS login_attempts (
  id_login_attempt SERIAL PRIMARY KEY,
  email_tente      CITEXT,                          -- même si compte n'existe pas
  id_user          INT REFERENCES users(id_user) ON DELETE SET NULL,
  succes           BOOLEAN NOT NULL,
  motif_echec      VARCHAR(100),                    -- password_incorrect, compte_verrouille, mfa_echec ...
  ip               INET,
  user_agent       TEXT,
  pays             CHAR(2),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email_tente, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip    ON login_attempts(ip, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user  ON login_attempts(id_user, created_at DESC);

-- -----------------------------------------------------------------------------
-- Table audit_log (traçage générique événements)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id_audit       BIGSERIAL PRIMARY KEY,
  id_user        INT REFERENCES users(id_user) ON DELETE SET NULL,
  type_event     VARCHAR(50) NOT NULL,   -- login_success, password_reset, mfa_enabled, permission_denied, ...
  entite         VARCHAR(80),            -- table concernée (nullable)
  id_entite      BIGINT,                 -- FK logique
  ip             INET,
  user_agent     TEXT,
  pays           CHAR(2),
  details_json   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_user   ON audit_log(id_user, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_event  ON audit_log(type_event, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entite ON audit_log(entite, id_entite);
COMMENT ON TABLE audit_log IS 'Journal audit centralisé — rétention 3 ans minimum';

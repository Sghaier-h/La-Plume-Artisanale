-- =====================================================================
-- SCHEMA V2 — MULTI-SOCIÉTÉS ÉTENDUES (§14quater.1 · Phase E1)
-- Fichier : 38_multi_societes.sql
-- Cible   : PostgreSQL 15
-- Contrat : docs/domain.md §14quater.1 (5 entités du groupe)
--   LP      — La Plume Artisanale     (fabrication, société principale)
--   CAPSCOR — CAPSCOR                 (import-export avec associé)
--   AT      — Artisanat Tunisien      (commercial / dropshipping)
--   PMG     — PMG TEX TUNISIE         (tissage spécialisé)
--   HS      — Hamdi Sghaier           (perso / gérant)
--
-- Idempotent : CREATE TABLE IF NOT EXISTS + ALTER … ADD COLUMN IF NOT EXISTS
-- Prérequis  : 01_core.sql (users), 03_crm.sql (comptes),
--              15_ventes_devis_cmd.sql, 16_ventes_bl_fa.sql,
--              09_fabrication_of.sql, 22_rh_effectif.sql
-- Back-compat : les colonnes `id_societe` ajoutées sont NULLABLE avec un
--               DEFAULT 1 (= LP). Les lignes existantes et les requêtes
--               legacy qui ignorent `id_societe` continuent de fonctionner.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Table societes — crée ou complète la table existante
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS societes (
    id_societe              SERIAL PRIMARY KEY,
    code_societe            VARCHAR(50) UNIQUE NOT NULL,
    raison_sociale          VARCHAR(200) NOT NULL,
    nom_commercial          VARCHAR(200),
    forme_juridique         VARCHAR(50),
    siret                   VARCHAR(40),
    tva_intracommunautaire  VARCHAR(50),
    adresse                 TEXT,
    code_postal             VARCHAR(20),
    ville                   VARCHAR(100),
    pays                    VARCHAR(100) DEFAULT 'Tunisie',
    telephone               VARCHAR(50),
    email                   VARCHAR(200),
    site_web                VARCHAR(200),
    logo_url                VARCHAR(500),
    devise                  VARCHAR(10) DEFAULT 'TND',
    langue                  VARCHAR(10) DEFAULT 'fr',
    fuseau_horaire          VARCHAR(50) DEFAULT 'Africa/Tunis',
    type_societe            VARCHAR(30),   -- fabrication / import_export / commerce / perso / tissage
    est_consolidation       BOOLEAN NOT NULL DEFAULT FALSE,
    actif                   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ajout idempotent des colonnes manquantes si la table existait déjà
ALTER TABLE societes
  ADD COLUMN IF NOT EXISTS siret                   VARCHAR(40),
  ADD COLUMN IF NOT EXISTS tva_intracommunautaire  VARCHAR(50),
  ADD COLUMN IF NOT EXISTS adresse                 TEXT,
  ADD COLUMN IF NOT EXISTS logo_url                VARCHAR(500),
  ADD COLUMN IF NOT EXISTS type_societe            VARCHAR(30),
  ADD COLUMN IF NOT EXISTS est_consolidation       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS actif                   BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_societes_code  ON societes(code_societe);
CREATE INDEX IF NOT EXISTS idx_societes_actif ON societes(actif);
CREATE INDEX IF NOT EXISTS idx_societes_type  ON societes(type_societe);

-- ---------------------------------------------------------------------
-- 2. Users : société courante (dernière société active choisie par l'user)
-- ---------------------------------------------------------------------
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS societe_courante INT REFERENCES societes(id_societe) ON DELETE SET NULL;

-- ---------------------------------------------------------------------
-- 3. Table de liaison users ↔ societes (ACL multi-sociétés)
--    Si vide pour un user → accès à toutes les sociétés actives (back-compat).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users_societes_acces (
    id_acces      SERIAL PRIMARY KEY,
    id_user       INT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    id_societe    INT NOT NULL REFERENCES societes(id_societe) ON DELETE CASCADE,
    role_societe  VARCHAR(50),   -- ADMIN / GESTIONNAIRE / LECTEUR
    societe_par_defaut BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(id_user, id_societe)
);
CREATE INDEX IF NOT EXISTS idx_users_societes_acces_user    ON users_societes_acces(id_user);
CREATE INDEX IF NOT EXISTS idx_users_societes_acces_societe ON users_societes_acces(id_societe);

-- ---------------------------------------------------------------------
-- 4. Ajout de la colonne id_societe sur les tables métier concernées
--    (DEFAULT 1 = LP pour la back-compat historique)
-- ---------------------------------------------------------------------
DO $$
DECLARE
  tbl TEXT;
  tbls TEXT[] := ARRAY[
    'comptes',                 -- CRM clients/prospects
    'commandes',
    'factures',
    'devis',
    'avoirs',
    'bons_livraison',
    'ordres_fabrication',
    'employes',
    'bons_sous_traitance_envoi'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN IF NOT EXISTS id_societe INT NOT NULL DEFAULT 1 REFERENCES societes(id_societe) ON DELETE RESTRICT',
        tbl
      );
      EXECUTE format(
        'CREATE INDEX IF NOT EXISTS %I ON %I(id_societe)',
        'idx_' || tbl || '_societe', tbl
      );
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 5. Vue consolidée des ventes (dashboard admin)
--    Agrège factures validées par société + ligne synthèse « ALL ».
--    Montants exprimés en TND (devise par défaut) — la conversion
--    multi-devise reste du ressort de l'application.
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_consolide_ventes AS
WITH par_societe AS (
    SELECT
        s.id_societe,
        s.code_societe,
        s.raison_sociale,
        COUNT(f.id_facture)                         AS nb_factures,
        COALESCE(SUM(f.montant_ht), 0)::NUMERIC(14,2)  AS total_ht,
        COALESCE(SUM(f.montant_tva), 0)::NUMERIC(14,2) AS total_tva,
        COALESCE(SUM(f.montant_ttc), 0)::NUMERIC(14,2) AS total_ttc,
        COALESCE(SUM(f.montant_restant), 0)::NUMERIC(14,2) AS reste_du
    FROM societes s
    LEFT JOIN factures f
      ON f.id_societe = s.id_societe
     AND COALESCE(f.statut, 'emise') IN ('emise', 'partiellement_payee', 'payee', 'en_retard')
    WHERE s.actif = TRUE AND s.est_consolidation = FALSE
    GROUP BY s.id_societe, s.code_societe, s.raison_sociale
)
SELECT  id_societe, code_societe, raison_sociale,
        nb_factures, total_ht, total_tva, total_ttc, reste_du
  FROM par_societe
UNION ALL
SELECT  0 AS id_societe,
        'ALL' AS code_societe,
        'Consolidation groupe' AS raison_sociale,
        COALESCE(SUM(nb_factures), 0)::BIGINT,
        COALESCE(SUM(total_ht), 0)::NUMERIC(14,2),
        COALESCE(SUM(total_tva), 0)::NUMERIC(14,2),
        COALESCE(SUM(total_ttc), 0)::NUMERIC(14,2),
        COALESCE(SUM(reste_du), 0)::NUMERIC(14,2)
  FROM par_societe;

COMMENT ON VIEW v_consolide_ventes IS
'§14quater.1 — ventes par société + ligne consolidée (code_societe=ALL, id_societe=0).';

-- ---------------------------------------------------------------------
-- 6. Trigger updated_at (défensif : pose la fonction si absente)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION tg_set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_societes_updated_at ON societes;
CREATE TRIGGER trg_societes_updated_at
    BEFORE UPDATE ON societes
    FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();

-- =====================================================================
-- Fin de 38_multi_societes.sql
-- Les 5 entrées (LP/CAPSCOR/AT/PMG/HS) sont insérées par le seed Node :
-- `backend/seeds/multi-societes/01_societes.js`.
-- =====================================================================

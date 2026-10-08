-- ─────────────────────────────────────────────────────────────────
-- Migration : taches / couts / modeles — schéma métier fouta
-- Ajoute les colonnes réelles aux tables stubs.
-- Idempotent (IF NOT EXISTS).
-- ─────────────────────────────────────────────────────────────────

-- TACHES : assignation aux opérateurs -----------------------------
ALTER TABLE taches ADD COLUMN IF NOT EXISTS id_of              INTEGER REFERENCES ordres_fabrication(id_of) ON DELETE SET NULL;
ALTER TABLE taches ADD COLUMN IF NOT EXISTS id_operateur       INTEGER REFERENCES equipe_fabrication(id_operateur) ON DELETE SET NULL;
ALTER TABLE taches ADD COLUMN IF NOT EXISTS titre              VARCHAR(255);
ALTER TABLE taches ADD COLUMN IF NOT EXISTS poste              VARCHAR(64);
ALTER TABLE taches ADD COLUMN IF NOT EXISTS statut             VARCHAR(32) NOT NULL DEFAULT 'en_attente';
ALTER TABLE taches ADD COLUMN IF NOT EXISTS priorite           VARCHAR(16) NOT NULL DEFAULT 'normale';
ALTER TABLE taches ADD COLUMN IF NOT EXISTS date_echeance      TIMESTAMP;
ALTER TABLE taches ADD COLUMN IF NOT EXISTS date_debut         TIMESTAMP;
ALTER TABLE taches ADD COLUMN IF NOT EXISTS date_fin           TIMESTAMP;
ALTER TABLE taches ADD COLUMN IF NOT EXISTS progression        INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_taches_operateur ON taches(id_operateur, statut);
CREATE INDEX IF NOT EXISTS idx_taches_of        ON taches(id_of);
CREATE INDEX IF NOT EXISTS idx_taches_statut    ON taches(statut, priorite);

-- COUTS DE PRODUCTION par OF --------------------------------------
ALTER TABLE couts ADD COLUMN IF NOT EXISTS id_of              INTEGER REFERENCES ordres_fabrication(id_of) ON DELETE CASCADE;
ALTER TABLE couts ADD COLUMN IF NOT EXISTS cout_matieres      NUMERIC(12,3) NOT NULL DEFAULT 0;
ALTER TABLE couts ADD COLUMN IF NOT EXISTS cout_main_oeuvre   NUMERIC(12,3) NOT NULL DEFAULT 0;
ALTER TABLE couts ADD COLUMN IF NOT EXISTS cout_machine       NUMERIC(12,3) NOT NULL DEFAULT 0;
ALTER TABLE couts ADD COLUMN IF NOT EXISTS cout_indirect      NUMERIC(12,3) NOT NULL DEFAULT 0;
ALTER TABLE couts ADD COLUMN IF NOT EXISTS cout_total         NUMERIC(12,3) NOT NULL DEFAULT 0;
ALTER TABLE couts ADD COLUMN IF NOT EXISTS temps_main_oeuvre  NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE couts ADD COLUMN IF NOT EXISTS temps_machine      NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE couts ADD COLUMN IF NOT EXISTS marge_prevue       NUMERIC(12,3);
ALTER TABLE couts ADD COLUMN IF NOT EXISTS marge_reelle       NUMERIC(12,3);
ALTER TABLE couts ADD COLUMN IF NOT EXISTS date_calcul        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_couts_of ON couts(id_of);

-- MODELES : catalogue fouta -------------------------------------
ALTER TABLE modeles ADD COLUMN IF NOT EXISTS code_modele        VARCHAR(64);
ALTER TABLE modeles ADD COLUMN IF NOT EXISTS libelle            VARCHAR(255);
ALTER TABLE modeles ADD COLUMN IF NOT EXISTS categorie          VARCHAR(64);
ALTER TABLE modeles ADD COLUMN IF NOT EXISTS image_url          VARCHAR(500);
ALTER TABLE modeles ADD COLUMN IF NOT EXISTS dimensions_std     VARCHAR(128);
ALTER TABLE modeles ADD COLUMN IF NOT EXISTS composition        TEXT;
ALTER TABLE modeles ADD COLUMN IF NOT EXISTS prix_base          NUMERIC(12,3);

CREATE INDEX IF NOT EXISTS idx_modeles_code ON modeles(code_modele);

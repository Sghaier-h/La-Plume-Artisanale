-- =====================================================================
-- SCHEMA V2 — FORMATIONS & ENTRETIENS ANNUELS (§11bis.10 / §11bis.11)
-- Fichier : 41_rh_formations_entretiens.sql
-- Cible   : PostgreSQL 15
-- Contrat : docs/domain.md §11bis.10 (formations) + Phase G2 §11bis.11 (entretiens)
--
-- Idempotent : CREATE TABLE / INDEX IF NOT EXISTS + ALTER … ADD COLUMN IF NOT EXISTS
-- Prérequis : 22_rh_effectif.sql (employes), 38_multi_societes.sql (societes)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. formations — sessions de formation (interne / externe / e-learning)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS formations (
    id_formation          BIGSERIAL PRIMARY KEY,
    titre                 VARCHAR(200) NOT NULL,
    description           TEXT,
    type                  VARCHAR(20) NOT NULL DEFAULT 'externe'
                            CHECK (type IN ('interne','externe','e-learning','habilitation')),
    duree_heures          NUMERIC(6,2) NOT NULL DEFAULT 0,
    cout_tnd              NUMERIC(12,3) NOT NULL DEFAULT 0,
    formateur             VARCHAR(200),
    organisme             VARCHAR(200),
    date_debut            DATE,
    date_fin              DATE,
    statut                VARCHAR(20) NOT NULL DEFAULT 'planifiee'
                            CHECK (statut IN ('planifiee','en_cours','terminee','annulee')),
    id_societe            BIGINT,
    cree_par              BIGINT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE formations
  ADD COLUMN IF NOT EXISTS description           TEXT,
  ADD COLUMN IF NOT EXISTS duree_heures          NUMERIC(6,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cout_tnd              NUMERIC(12,3) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS formateur             VARCHAR(200),
  ADD COLUMN IF NOT EXISTS organisme             VARCHAR(200),
  ADD COLUMN IF NOT EXISTS id_societe            BIGINT,
  ADD COLUMN IF NOT EXISTS cree_par              BIGINT,
  ADD COLUMN IF NOT EXISTS created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_formations_statut      ON formations(statut);
CREATE INDEX IF NOT EXISTS idx_formations_type        ON formations(type);
CREATE INDEX IF NOT EXISTS idx_formations_date_debut  ON formations(date_debut DESC);
CREATE INDEX IF NOT EXISTS idx_formations_societe     ON formations(id_societe);

-- ---------------------------------------------------------------------
-- 2. formations_participants — inscription + attestation par employé
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS formations_participants (
    id_participant        BIGSERIAL PRIMARY KEY,
    id_formation          BIGINT NOT NULL REFERENCES formations(id_formation) ON DELETE CASCADE,
    id_employe            BIGINT NOT NULL REFERENCES employes(id_employe)     ON DELETE CASCADE,
    statut                VARCHAR(20) NOT NULL DEFAULT 'inscrit'
                            CHECK (statut IN ('inscrit','present','absent','desiste')),
    note_satisfaction     NUMERIC(3,1),               -- 0.0 .. 10.0
    attestation_url       TEXT,
    commentaire           TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_formation, id_employe)
);

CREATE INDEX IF NOT EXISTS idx_formations_part_formation ON formations_participants(id_formation);
CREATE INDEX IF NOT EXISTS idx_formations_part_employe   ON formations_participants(id_employe);
CREATE INDEX IF NOT EXISTS idx_formations_part_statut    ON formations_participants(statut);

-- ---------------------------------------------------------------------
-- 3. entretiens_annuels — campagne d'entretiens (annuel / probatoire / …)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entretiens_annuels (
    id_entretien          BIGSERIAL PRIMARY KEY,
    id_employe            BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE CASCADE,
    id_evaluateur         BIGINT REFERENCES employes(id_employe) ON DELETE SET NULL,
    date_entretien        DATE NOT NULL,
    type                  VARCHAR(20) NOT NULL DEFAULT 'annuel'
                            CHECK (type IN ('annuel','probatoire','recadrage','depart')),
    score_global          NUMERIC(3,1),               -- 0.0 .. 10.0
    objectifs_atteints    JSONB NOT NULL DEFAULT '[]'::jsonb,
    objectifs_prochains   JSONB NOT NULL DEFAULT '[]'::jsonb,
    besoins_formation     TEXT,
    statut                VARCHAR(20) NOT NULL DEFAULT 'planifie'
                            CHECK (statut IN ('planifie','realise','valide')),
    signature_svg         TEXT,
    id_societe            BIGINT,
    cree_par              BIGINT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE entretiens_annuels
  ADD COLUMN IF NOT EXISTS id_societe           BIGINT,
  ADD COLUMN IF NOT EXISTS cree_par             BIGINT,
  ADD COLUMN IF NOT EXISTS created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_entretiens_employe    ON entretiens_annuels(id_employe);
CREATE INDEX IF NOT EXISTS idx_entretiens_evaluateur ON entretiens_annuels(id_evaluateur);
CREATE INDEX IF NOT EXISTS idx_entretiens_statut     ON entretiens_annuels(statut);
CREATE INDEX IF NOT EXISTS idx_entretiens_type       ON entretiens_annuels(type);
CREATE INDEX IF NOT EXISTS idx_entretiens_date       ON entretiens_annuels(date_entretien DESC);
CREATE INDEX IF NOT EXISTS idx_entretiens_societe    ON entretiens_annuels(id_societe);

-- ---------------------------------------------------------------------
-- Trigger : horodatage de modification (formations)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_formations_touch() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_formations_touch ON formations;
CREATE TRIGGER trg_formations_touch
  BEFORE UPDATE ON formations
  FOR EACH ROW EXECUTE FUNCTION fn_formations_touch();

DROP TRIGGER IF EXISTS trg_entretiens_touch ON entretiens_annuels;
CREATE TRIGGER trg_entretiens_touch
  BEFORE UPDATE ON entretiens_annuels
  FOR EACH ROW EXECUTE FUNCTION fn_formations_touch();

DROP TRIGGER IF EXISTS trg_formations_part_touch ON formations_participants;
CREATE TRIGGER trg_formations_part_touch
  BEFORE UPDATE ON formations_participants
  FOR EACH ROW EXECUTE FUNCTION fn_formations_touch();

COMMENT ON TABLE formations IS
  '§11bis.10 — Catalogue sessions de formation (interne / externe / e-learning / habilitation). Budget TFP 2% masse salariale annuelle.';
COMMENT ON TABLE formations_participants IS
  '§11bis.10 — Inscriptions employés à une formation (statut, note satisfaction, attestation).';
COMMENT ON TABLE entretiens_annuels IS
  '§11bis.11 — Campagnes d''entretiens annuels / probatoires / recadrage / départ. Score global 0-10 et objectifs JSONB.';

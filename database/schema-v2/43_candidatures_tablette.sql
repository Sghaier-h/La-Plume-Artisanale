-- =====================================================================
-- SCHEMA V2 — RECRUTEMENT TABLETTE CANDIDAT (§11bis.recrutement — Phase H)
-- Fichier : 43_candidatures_tablette.sql
-- Cible   : PostgreSQL 15
-- Contrat : docs/domain.md §11bis (extension recrutement tablette public)
--
-- Idempotent : CREATE TABLE / INDEX IF NOT EXISTS + ALTER … ADD COLUMN IF NOT EXISTS
-- Prérequis : 25_rh_recrutement.sql (candidatures / postes_ouverts)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. questions_recrutement — pool de questions dynamiques (par poste cible)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions_recrutement (
    id_question        BIGSERIAL PRIMARY KEY,
    poste_cible        VARCHAR(60) NOT NULL,
    question_type      VARCHAR(20) NOT NULL DEFAULT 'texte'
                         CHECK (question_type IN ('texte','multi','test_logique','note')),
    question_text      TEXT NOT NULL,
    choix_json         JSONB,         -- liste de choix si type = 'multi' ou 'test_logique'
    bonne_reponse      TEXT,          -- clé/valeur attendue (test_logique seulement)
    poids              INT NOT NULL DEFAULT 1,
    actif              BOOLEAN NOT NULL DEFAULT TRUE,
    ordre              INT NOT NULL DEFAULT 0,
    id_societe         BIGINT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE questions_recrutement
  ADD COLUMN IF NOT EXISTS id_societe BIGINT;

CREATE INDEX IF NOT EXISTS idx_quest_poste   ON questions_recrutement(poste_cible);
CREATE INDEX IF NOT EXISTS idx_quest_actif   ON questions_recrutement(actif);
CREATE INDEX IF NOT EXISTS idx_quest_ordre   ON questions_recrutement(ordre);

-- ---------------------------------------------------------------------
-- 2. candidatures_tablette_detail — payload de passage tablette public
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidatures_tablette_detail (
    id_detail          BIGSERIAL PRIMARY KEY,
    id_candidature     BIGINT REFERENCES candidatures(id_candidature) ON DELETE SET NULL,
    poste_cible        VARCHAR(60),
    identite_json      JSONB NOT NULL DEFAULT '{}'::jsonb,
    parcours_json      JSONB NOT NULL DEFAULT '{}'::jsonb,
    reponses_json      JSONB NOT NULL DEFAULT '[]'::jsonb,
    test_logique_json  JSONB NOT NULL DEFAULT '[]'::jsonb,
    attentes_salariales NUMERIC(12,3),
    photo_cv_url       TEXT,
    signature_svg      TEXT,
    score_total        NUMERIC(6,2) DEFAULT 0,
    duree_minutes      INT,
    ip_source          VARCHAR(64),
    user_agent         TEXT,
    date_passage       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    id_societe         BIGINT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE candidatures_tablette_detail
  ADD COLUMN IF NOT EXISTS id_societe BIGINT,
  ADD COLUMN IF NOT EXISTS photo_cv_url TEXT;

CREATE INDEX IF NOT EXISTS idx_candtab_candidature ON candidatures_tablette_detail(id_candidature);
CREATE INDEX IF NOT EXISTS idx_candtab_poste       ON candidatures_tablette_detail(poste_cible);
CREATE INDEX IF NOT EXISTS idx_candtab_date        ON candidatures_tablette_detail(date_passage DESC);

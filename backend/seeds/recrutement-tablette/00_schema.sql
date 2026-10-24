-- =============================================================================
-- 00_schema.sql — Applique le schéma recrutement tablette (Phase H) avant seeds
-- Reproduit database/schema-v2/43_candidatures_tablette.sql pour autonomie.
-- =============================================================================

-- `candidatures` doit exister (25_rh_recrutement.sql) ; version minimale ici
-- en cas d'exécution isolée (sans qu'elle override la vraie).
CREATE TABLE IF NOT EXISTS postes_ouverts (
    id_poste_ouvert     BIGSERIAL PRIMARY KEY,
    code                VARCHAR(20) UNIQUE,
    intitule            VARCHAR(255) NOT NULL,
    description         TEXT,
    statut              VARCHAR(20) NOT NULL DEFAULT 'brouillon',
    canaux              JSONB,
    date_publication    DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS candidatures (
    id_candidature      BIGSERIAL PRIMARY KEY,
    id_poste_ouvert     BIGINT REFERENCES postes_ouverts(id_poste_ouvert),
    nom                 VARCHAR(120) NOT NULL,
    prenom              VARCHAR(120) NOT NULL,
    email               VARCHAR(120),
    telephone           VARCHAR(40),
    cv_url              TEXT,
    source              VARCHAR(60),
    statut              VARCHAR(30) NOT NULL DEFAULT 'reçue',
    score_matching      NUMERIC(4,1),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions_recrutement (
    id_question        BIGSERIAL PRIMARY KEY,
    poste_cible        VARCHAR(60) NOT NULL,
    question_type      VARCHAR(20) NOT NULL DEFAULT 'texte'
                         CHECK (question_type IN ('texte','multi','test_logique','note')),
    question_text      TEXT NOT NULL,
    choix_json         JSONB,
    bonne_reponse      TEXT,
    poids              INT NOT NULL DEFAULT 1,
    actif              BOOLEAN NOT NULL DEFAULT TRUE,
    ordre              INT NOT NULL DEFAULT 0,
    id_societe         BIGINT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quest_poste   ON questions_recrutement(poste_cible);
CREATE INDEX IF NOT EXISTS idx_quest_actif   ON questions_recrutement(actif);

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
CREATE INDEX IF NOT EXISTS idx_candtab_candidature ON candidatures_tablette_detail(id_candidature);
CREATE INDEX IF NOT EXISTS idx_candtab_poste       ON candidatures_tablette_detail(poste_cible);

-- =============================================================================
-- 00_schema.sql — Applique le schéma formations + entretiens avant les seeds
--
-- Reproduit database/schema-v2/41_rh_formations_entretiens.sql pour rester
-- autonome : le script seed-formations-entretiens.js n'exécute que ce dossier.
-- Idempotent (CREATE TABLE IF NOT EXISTS + ALTER COLUMN IF NOT EXISTS).
-- =============================================================================

-- Minimum employes (si effectif non peuplé) — matricules compatibles rh-etendu
CREATE TABLE IF NOT EXISTS employes (
    id_employe   BIGSERIAL PRIMARY KEY,
    matricule    VARCHAR(20) NOT NULL UNIQUE,
    nom          VARCHAR(120) NOT NULL,
    prenom       VARCHAR(120) NOT NULL,
    date_embauche DATE,
    statut       VARCHAR(20) NOT NULL DEFAULT 'actif',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS formations (
    id_formation  BIGSERIAL PRIMARY KEY,
    titre         VARCHAR(200) NOT NULL,
    description   TEXT,
    type          VARCHAR(20) NOT NULL DEFAULT 'externe'
                   CHECK (type IN ('interne','externe','e-learning','habilitation')),
    duree_heures  NUMERIC(6,2) NOT NULL DEFAULT 0,
    cout_tnd      NUMERIC(12,3) NOT NULL DEFAULT 0,
    formateur     VARCHAR(200),
    organisme     VARCHAR(200),
    date_debut    DATE,
    date_fin      DATE,
    statut        VARCHAR(20) NOT NULL DEFAULT 'planifiee'
                   CHECK (statut IN ('planifiee','en_cours','terminee','annulee')),
    id_societe    BIGINT,
    cree_par      BIGINT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE formations
  ADD COLUMN IF NOT EXISTS description  TEXT,
  ADD COLUMN IF NOT EXISTS duree_heures NUMERIC(6,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cout_tnd     NUMERIC(12,3) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS formateur    VARCHAR(200),
  ADD COLUMN IF NOT EXISTS organisme    VARCHAR(200),
  ADD COLUMN IF NOT EXISTS id_societe   BIGINT,
  ADD COLUMN IF NOT EXISTS cree_par     BIGINT,
  ADD COLUMN IF NOT EXISTS created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_formations_statut     ON formations(statut);
CREATE INDEX IF NOT EXISTS idx_formations_type       ON formations(type);
CREATE INDEX IF NOT EXISTS idx_formations_date_debut ON formations(date_debut DESC);

CREATE TABLE IF NOT EXISTS formations_participants (
    id_participant BIGSERIAL PRIMARY KEY,
    id_formation   BIGINT NOT NULL REFERENCES formations(id_formation) ON DELETE CASCADE,
    id_employe     BIGINT NOT NULL REFERENCES employes(id_employe)     ON DELETE CASCADE,
    statut         VARCHAR(20) NOT NULL DEFAULT 'inscrit'
                    CHECK (statut IN ('inscrit','present','absent','desiste')),
    note_satisfaction NUMERIC(3,1),
    attestation_url TEXT,
    commentaire     TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_formation, id_employe)
);
CREATE INDEX IF NOT EXISTS idx_formations_part_formation ON formations_participants(id_formation);
CREATE INDEX IF NOT EXISTS idx_formations_part_employe   ON formations_participants(id_employe);

CREATE TABLE IF NOT EXISTS entretiens_annuels (
    id_entretien   BIGSERIAL PRIMARY KEY,
    id_employe     BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE CASCADE,
    id_evaluateur  BIGINT REFERENCES employes(id_employe) ON DELETE SET NULL,
    date_entretien DATE NOT NULL,
    type           VARCHAR(20) NOT NULL DEFAULT 'annuel'
                    CHECK (type IN ('annuel','probatoire','recadrage','depart')),
    score_global   NUMERIC(3,1),
    objectifs_atteints  JSONB NOT NULL DEFAULT '[]'::jsonb,
    objectifs_prochains JSONB NOT NULL DEFAULT '[]'::jsonb,
    besoins_formation   TEXT,
    statut         VARCHAR(20) NOT NULL DEFAULT 'planifie'
                    CHECK (statut IN ('planifie','realise','valide')),
    signature_svg  TEXT,
    id_societe     BIGINT,
    cree_par       BIGINT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE entretiens_annuels
  ADD COLUMN IF NOT EXISTS id_societe BIGINT,
  ADD COLUMN IF NOT EXISTS cree_par   BIGINT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_entretiens_employe    ON entretiens_annuels(id_employe);
CREATE INDEX IF NOT EXISTS idx_entretiens_evaluateur ON entretiens_annuels(id_evaluateur);
CREATE INDEX IF NOT EXISTS idx_entretiens_statut     ON entretiens_annuels(statut);
CREATE INDEX IF NOT EXISTS idx_entretiens_date       ON entretiens_annuels(date_entretien DESC);

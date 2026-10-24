-- =============================================================================
-- 00_schema.sql — Applique le schéma avertissements (Phase H) avant les seeds
-- Reproduit database/schema-v2/42_rh_avertissements_auto.sql pour autonomie.
-- Idempotent (CREATE TABLE IF NOT EXISTS + ALTER COLUMN IF NOT EXISTS).
-- =============================================================================

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

CREATE TABLE IF NOT EXISTS avertissements_rh (
    id_avertissement       BIGSERIAL PRIMARY KEY,
    id_employe             BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE CASCADE,
    type                   VARCHAR(30) NOT NULL
                             CHECK (type IN ('retard_repete','absence_non_just',
                                             'baisse_productivite','refus_consigne','autre')),
    niveau                 VARCHAR(20) NOT NULL DEFAULT 'attention'
                             CHECK (niveau IN ('info','attention','grave','sanction')),
    message                TEXT NOT NULL,
    periode_debut          DATE,
    periode_fin            DATE,
    auto_genere            BOOLEAN NOT NULL DEFAULT TRUE,
    genere_par             VARCHAR(64) DEFAULT 'scanner',
    statut                 VARCHAR(20) NOT NULL DEFAULT 'nouveau'
                             CHECK (statut IN ('nouveau','lu','contestee','traitee','classee')),
    date_envoi             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_lu                TIMESTAMPTZ,
    date_accuse_reception  TIMESTAMPTZ,
    signature_svg          TEXT,
    raison_contestation    TEXT,
    date_contestation      TIMESTAMPTZ,
    id_societe             BIGINT,
    id_document_archive    BIGINT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avertissements_employe   ON avertissements_rh(id_employe);
CREATE INDEX IF NOT EXISTS idx_avertissements_statut    ON avertissements_rh(statut);
CREATE INDEX IF NOT EXISTS idx_avertissements_date      ON avertissements_rh(date_envoi DESC);
CREATE INDEX IF NOT EXISTS idx_avertissements_niveau    ON avertissements_rh(niveau);

CREATE TABLE IF NOT EXISTS avertissements_regles (
    id_regle               BIGSERIAL PRIMARY KEY,
    code                   VARCHAR(30) NOT NULL
                             CHECK (code IN ('retard_repete','absence_non_just',
                                             'baisse_productivite','refus_consigne','autre')),
    nom                    VARCHAR(200) NOT NULL,
    actif                  BOOLEAN NOT NULL DEFAULT TRUE,
    seuil_valeur           INT NOT NULL DEFAULT 5,
    periode_jours          INT NOT NULL DEFAULT 30,
    niveau_declenche       VARCHAR(20) NOT NULL DEFAULT 'attention'
                             CHECK (niveau_declenche IN ('info','attention','grave','sanction')),
    message_template       TEXT,
    id_societe             BIGINT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (code, id_societe)
);

CREATE INDEX IF NOT EXISTS idx_avregles_actif  ON avertissements_regles(actif);
CREATE INDEX IF NOT EXISTS idx_avregles_code   ON avertissements_regles(code);

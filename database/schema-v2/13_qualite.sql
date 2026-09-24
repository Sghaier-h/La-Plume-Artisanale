-- =====================================================================
-- Contrôle Qualité — Réf. docs/domain.md §7.9
-- Contrôles, nomenclature défauts, signalements, photos
-- =====================================================================

DO $$ BEGIN
    CREATE TYPE ctrl_type_enum AS ENUM ('visuel','dimensionnel','colorimetrique','resistance','poids','retour_soustraitance');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE ctrl_decision_enum AS ENUM ('laisser_passer_1c','passer_2c','rework','rebut');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------
-- controles_qualite (§7.9)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS controles_qualite (
    id_ctrl            BIGSERIAL PRIMARY KEY,
    id_of              BIGINT NOT NULL REFERENCES ordres_fabrication(id_of) ON DELETE CASCADE,
    id_of_poste        BIGINT REFERENCES of_postes(id_of_poste) ON DELETE SET NULL,
    id_controleur      BIGINT NOT NULL,
    date_controle      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type_controle      ctrl_type_enum NOT NULL DEFAULT 'visuel',
    qte_1er_choix      NUMERIC(14,3) NOT NULL DEFAULT 0,
    qte_2e_choix       NUMERIC(14,3) NOT NULL DEFAULT 0,
    qte_ourlet         NUMERIC(14,3) NOT NULL DEFAULT 0,
    qte_rebut          NUMERIC(14,3) NOT NULL DEFAULT 0,
    decision           ctrl_decision_enum,
    est_bloquant       BOOLEAN NOT NULL DEFAULT FALSE,
    defauts_json       JSONB DEFAULT '{}'::jsonb,
    photos_urls        TEXT[] DEFAULT ARRAY[]::TEXT[],
    commentaire        TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_ctrl_of        ON controles_qualite(id_of);
CREATE INDEX IF NOT EXISTS ix_ctrl_date      ON controles_qualite(date_controle);
CREATE INDEX IF NOT EXISTS ix_ctrl_bloquant  ON controles_qualite(est_bloquant) WHERE est_bloquant;

-- ---------------------------------------------------------------------
-- defauts_types : nomenclature des défauts (seed 10_defauts_types.sql)
-- ---------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE defaut_severite_enum AS ENUM ('mineur','majeur','critique');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE defaut_categorie_enum AS ENUM ('tissage','fil','matiere','finition','colorimetrie','dimension','autre');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS defauts_types (
    id_defaut_type     BIGSERIAL PRIMARY KEY,
    code               VARCHAR(30) UNIQUE NOT NULL,
    libelle            VARCHAR(200) NOT NULL,
    categorie          defaut_categorie_enum NOT NULL,
    severite_defaut    defaut_severite_enum NOT NULL DEFAULT 'mineur',
    description        TEXT,
    action_recommandee VARCHAR(200),
    actif              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_defauts_types_cat ON defauts_types(categorie);

-- ---------------------------------------------------------------------
-- defauts_signales : instances défauts sur un contrôle / OF / poste
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS defauts_signales (
    id_defaut_signale  BIGSERIAL PRIMARY KEY,
    id_defaut_type     BIGINT NOT NULL REFERENCES defauts_types(id_defaut_type),
    id_of              BIGINT REFERENCES ordres_fabrication(id_of) ON DELETE CASCADE,
    id_ctrl            BIGINT REFERENCES controles_qualite(id_ctrl) ON DELETE CASCADE,
    id_of_poste        BIGINT REFERENCES of_postes(id_of_poste) ON DELETE SET NULL,
    id_machine         BIGINT,
    id_operateur       BIGINT,
    id_signaleur       BIGINT NOT NULL,
    date_signalement   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    quantite_impactee  NUMERIC(14,3),
    localisation       VARCHAR(200),
    commentaire        TEXT,
    resolu             BOOLEAN NOT NULL DEFAULT FALSE,
    date_resolution    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_def_signales_of      ON defauts_signales(id_of);
CREATE INDEX IF NOT EXISTS ix_def_signales_ctrl    ON defauts_signales(id_ctrl);
CREATE INDEX IF NOT EXISTS ix_def_signales_type    ON defauts_signales(id_defaut_type);
CREATE INDEX IF NOT EXISTS ix_def_signales_machine ON defauts_signales(id_machine);
CREATE INDEX IF NOT EXISTS ix_def_signales_date    ON defauts_signales(date_signalement);

-- ---------------------------------------------------------------------
-- photos_defauts : uploads liés à un signalement (multi-photos)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS photos_defauts (
    id_photo           BIGSERIAL PRIMARY KEY,
    id_defaut_signale  BIGINT NOT NULL REFERENCES defauts_signales(id_defaut_signale) ON DELETE CASCADE,
    url                VARCHAR(500) NOT NULL,
    mime_type          VARCHAR(50),
    taille_octets      BIGINT,
    largeur_px         INTEGER,
    hauteur_px         INTEGER,
    id_uploader        BIGINT,
    ordre              INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_photos_defauts_sig ON photos_defauts(id_defaut_signale);

-- =====================================================================
-- Sous-traitance de fabrication — Réf. docs/domain.md §7.10, §7.11
-- Bons sortie/retour persistants avec numéros, signatures, litiges
-- =====================================================================

DO $$ BEGIN
    CREATE TYPE st_statut_bon_enum AS ENUM (
        'en_preparation','expedie','chez_st','en_retour_partiel','retour_complet','litige','annule'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE st_type_mouvement_enum AS ENUM ('envoi','retour','perte','ajustement');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------
-- sous_traitants
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sous_traitants (
    id_soustraitant    BIGSERIAL PRIMARY KEY,
    code               VARCHAR(20) UNIQUE NOT NULL,
    raison_sociale     VARCHAR(200) NOT NULL,
    contact_nom        VARCHAR(200),
    contact_telephone  VARCHAR(50),
    contact_email      VARCHAR(200),
    adresse            TEXT,
    ville              VARCHAR(100),
    pays               VARCHAR(60) DEFAULT 'Tunisie',
    matricule_fiscal   VARCHAR(50),
    specialites        TEXT[],           -- {tissage, ourdissage, coupe, ourlet...}
    taux_horaire_ht    NUMERIC(12,3),
    delai_moyen_jours  INTEGER,
    note_qualite       NUMERIC(3,2),     -- 0-5
    actif              BOOLEAN NOT NULL DEFAULT TRUE,
    notes              TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_st_actif ON sous_traitants(actif);

-- ---------------------------------------------------------------------
-- of_sous_traitance : pivot OF ↔ sous-traitant + bon d'envoi
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS of_sous_traitance (
    id_of_st           BIGSERIAL PRIMARY KEY,
    numero_bon         VARCHAR(30) UNIQUE NOT NULL,       -- BSST-YYYY-NNNNN
    id_of              BIGINT NOT NULL REFERENCES ordres_fabrication(id_of) ON DELETE CASCADE,
    id_of_poste        BIGINT REFERENCES of_postes(id_of_poste),
    id_soustraitant    BIGINT NOT NULL REFERENCES sous_traitants(id_soustraitant),

    date_envoi_prevue  DATE,
    date_envoi_reel    TIMESTAMPTZ,
    date_retour_prevue DATE NOT NULL,                     -- obligatoire (§7.11)
    date_retour_reel   TIMESTAMPTZ,

    quantite_envoyee   NUMERIC(14,3) NOT NULL,
    quantite_retournee NUMERIC(14,3) NOT NULL DEFAULT 0,
    quantite_perdue    NUMERIC(14,3) NOT NULL DEFAULT 0,
    cout_prestation_ht NUMERIC(14,3),

    statut             st_statut_bon_enum NOT NULL DEFAULT 'en_preparation',
    id_utilisateur_expedition BIGINT,
    id_utilisateur_reception  BIGINT,
    signature_expediteur_url  VARCHAR(500),
    signature_receveur_url    VARCHAR(500),
    photos_urls              TEXT[] DEFAULT ARRAY[]::TEXT[],
    litige_en_cours          BOOLEAN NOT NULL DEFAULT FALSE,
    motif_litige             TEXT,
    notes                    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_of_st_of      ON of_sous_traitance(id_of);
CREATE INDEX IF NOT EXISTS ix_of_st_st      ON of_sous_traitance(id_soustraitant);
CREATE INDEX IF NOT EXISTS ix_of_st_statut  ON of_sous_traitance(statut);
CREATE INDEX IF NOT EXISTS ix_of_st_dt_env  ON of_sous_traitance(date_envoi_reel);
CREATE INDEX IF NOT EXISTS ix_of_st_dt_ret  ON of_sous_traitance(date_retour_prevue);

-- ---------------------------------------------------------------------
-- mouvements_st : envoi / retour / perte détaillés (histoire complète)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mouvements_st (
    id_mouvement_st    BIGSERIAL PRIMARY KEY,
    id_of_st           BIGINT NOT NULL REFERENCES of_sous_traitance(id_of_st) ON DELETE CASCADE,
    type_mouvement     st_type_mouvement_enum NOT NULL,
    date_mouvement     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    quantite           NUMERIC(14,3) NOT NULL,
    id_lot             BIGINT,
    id_utilisateur     BIGINT,
    motif              VARCHAR(200),
    reference_document VARCHAR(50),
    commentaire        TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_mvt_st_of_st ON mouvements_st(id_of_st);
CREATE INDEX IF NOT EXISTS ix_mvt_st_type  ON mouvements_st(type_mouvement);
CREATE INDEX IF NOT EXISTS ix_mvt_st_date  ON mouvements_st(date_mouvement);

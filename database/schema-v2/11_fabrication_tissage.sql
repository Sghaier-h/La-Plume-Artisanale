-- =====================================================================
-- Fabrication — Tissage : métiers, sessions temps réel, snapshots
-- Réf. docs/domain.md §7.4 (machines), §7.18 (snapshot 37 col)
-- =====================================================================

DO $$ BEGIN
    CREATE TYPE metier_type_ratiere_enum AS ENUM ('R16','R20','Dornier','Staubli_2666','Bonas','Grosse','Jacquard','autre');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE metier_etat_enum AS ENUM ('en_service','en_maintenance','en_panne','arret');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE metier_unite_compteur_enum AS ENUM ('pieces','metres');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------
-- metiers (machines de tissage)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS metiers (
    id_machine           BIGSERIAL PRIMARY KEY,
    code_machine         VARCHAR(20) UNIQUE NOT NULL,     -- M2301, M2302...
    libelle              VARCHAR(200) NOT NULL,
    id_poste             BIGINT,
    type_ratiere         metier_type_ratiere_enum NOT NULL DEFAULT 'R16',
    nb_couleurs_selecteur INTEGER NOT NULL DEFAULT 6 CHECK (nb_couleurs_selecteur BETWEEN 1 AND 8),
    laize_machine_cm     NUMERIC(6,2),
    laize_actuelle_cm    NUMERIC(6,2),
    nb_fils_par_cm       NUMERIC(6,2),
    nb_fils_chaine_total INTEGER,
    longueur_peigne_cm   NUMERIC(6,2),
    type_programme       VARCHAR(50),
    vitesse_max_duite_min INTEGER,
    rapport_compteur     NUMERIC(8,4) DEFAULT 1,
    unite_compteur       metier_unite_compteur_enum NOT NULL DEFAULT 'metres',
    etat                 metier_etat_enum NOT NULL DEFAULT 'en_service',
    id_parc_machines     BIGINT,
    numero_serie         VARCHAR(50),
    date_derniere_maintenance DATE,
    date_prochaine_maintenance DATE,
    actif                BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_metiers_etat    ON metiers(etat);
CREATE INDEX IF NOT EXISTS ix_metiers_ratiere ON metiers(type_ratiere);

-- ---------------------------------------------------------------------
-- sessions_tissage : session opérateur × machine × OF
-- ---------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE session_tissage_statut_enum AS ENUM ('en_cours','pause','termine','incident','annule');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS sessions_tissage (
    id_session          BIGSERIAL PRIMARY KEY,
    id_of               BIGINT NOT NULL REFERENCES ordres_fabrication(id_of) ON DELETE CASCADE,
    id_machine          BIGINT NOT NULL REFERENCES metiers(id_machine),
    id_operateur        BIGINT NOT NULL,
    date_debut          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_fin            TIMESTAMPTZ,
    duites_debut        INTEGER,
    duites_fin          INTEGER,
    duites_total        INTEGER,                    -- calc à la clôture
    compteur_debut      NUMERIC(12,2),
    compteur_fin        NUMERIC(12,2),
    metres_produits     NUMERIC(12,2),
    incidents_json      JSONB DEFAULT '[]'::jsonb,  -- [{type,horodatage,motif}]
    nb_incidents        INTEGER NOT NULL DEFAULT 0,
    statut              session_tissage_statut_enum NOT NULL DEFAULT 'en_cours',
    notes               TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_sess_tissage_of        ON sessions_tissage(id_of);
CREATE INDEX IF NOT EXISTS ix_sess_tissage_machine   ON sessions_tissage(id_machine);
CREATE INDEX IF NOT EXISTS ix_sess_tissage_operateur ON sessions_tissage(id_operateur);
CREATE INDEX IF NOT EXISTS ix_sess_tissage_date      ON sessions_tissage(date_debut);
CREATE INDEX IF NOT EXISTS ix_sess_tissage_statut    ON sessions_tissage(statut);

-- ---------------------------------------------------------------------
-- snapshots_ofs_tissage : dénormalisé pour dashboards temps réel (§7.18)
-- Régénéré toutes les 5 min par service background
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS snapshots_ofs_tissage (
    id_snapshot           BIGSERIAL PRIMARY KEY,
    id_of                 BIGINT NOT NULL REFERENCES ordres_fabrication(id_of) ON DELETE CASCADE,
    numero_of             VARCHAR(30) NOT NULL,
    id_machine            BIGINT,
    code_machine          VARCHAR(20),
    ordre_planif_machine  INTEGER,
    id_article            BIGINT,
    code_article          VARCHAR(50),
    libelle_article       VARCHAR(200),
    dimensions            VARCHAR(50),
    id_client             BIGINT,
    nom_client            VARCHAR(200),

    qte_a_fabriquer       NUMERIC(14,3),
    qte_fabriquee         NUMERIC(14,3),
    qte_restante          NUMERIC(14,3),

    unite_compteur        metier_unite_compteur_enum,
    longueur_cible_m      NUMERIC(12,2),
    compteur_actuel       NUMERIC(12,2),
    metres_restants       NUMERIC(12,2),

    etat_prep_mp          of_etat_prep_mp_enum,
    etat_tissage          of_etat_tissage_enum,
    etat_coupe            of_etat_coupe_enum,
    coupe_confirme        BOOLEAN,

    vitesse_duite_min     INTEGER,
    duites_par_cm         NUMERIC(6,2),
    duites_restantes      INTEGER,
    temps_restant_min     INTEGER,

    laize_cm              NUMERIC(6,2),
    machines_compatibles  TEXT,          -- CSV codes
    notes_speciales       TEXT,
    alerte_500m           BOOLEAN NOT NULL DEFAULT FALSE,

    date_snapshot         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_of, date_snapshot)
);
CREATE INDEX IF NOT EXISTS ix_snap_tissage_of      ON snapshots_ofs_tissage(id_of);
CREATE INDEX IF NOT EXISTS ix_snap_tissage_machine ON snapshots_ofs_tissage(id_machine);
CREATE INDEX IF NOT EXISTS ix_snap_tissage_date    ON snapshots_ofs_tissage(date_snapshot);
CREATE INDEX IF NOT EXISTS ix_snap_tissage_alerte  ON snapshots_ofs_tissage(alerte_500m) WHERE alerte_500m;

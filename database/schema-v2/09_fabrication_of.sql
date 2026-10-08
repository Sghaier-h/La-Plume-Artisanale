-- =====================================================================
-- DOMAINE C — Fabrication : Ordres de Fabrication (OF)
-- Réf. docs/domain.md §7.5, §7.6, §7.14
-- PostgreSQL 15
-- =====================================================================

-- Enum statut OF (voir §7.14)
DO $$ BEGIN
    CREATE TYPE of_statut_enum AS ENUM (
        'brouillon','planifie','en_attente_mp','prep_mp','ourdissage',
        'tissage','coupe','finition','controle','bloque_qc',
        'termine','cloture','livre','annule'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE of_type_enum AS ENUM ('commande','stock','complement','rework','prototype');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE of_priorite_enum AS ENUM ('urgente','haute','normale','basse');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE of_etat_prep_mp_enum AS ENUM ('non_prepare','prepare_partiel','prepare','manque_matiere','pas_de_besoin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE of_etat_tissage_enum AS ENUM ('attente','planifier','machine_alimentee','depart','en_cours','pause','termine','termine_qte_manquante');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE of_etat_coupe_enum AS ENUM ('non_demarre','en_cours','pause','termine','termine_qte_manquante');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------
-- Table : ordres_fabrication (OF)
-- Numéro OF 6 chiffres via NumeroSequenceService (§16bis)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ordres_fabrication (
    id_of                     BIGSERIAL PRIMARY KEY,
    numero_of                 VARCHAR(30) UNIQUE NOT NULL,   -- OF123456 / CA1234 / OF123456.1
    type_of                   of_type_enum NOT NULL DEFAULT 'commande',
    id_of_parent              BIGINT REFERENCES ordres_fabrication(id_of) ON DELETE SET NULL,

    id_article                BIGINT NOT NULL,
    id_bom                    BIGINT,
    id_gamme                  BIGINT,

    id_commande               BIGINT,
    id_ligne_commande         BIGINT,
    id_catalogue              BIGINT,

    quantite_prevue           NUMERIC(14,3) NOT NULL DEFAULT 0,
    quantite_produite         NUMERIC(14,3) NOT NULL DEFAULT 0,
    quantite_rebut            NUMERIC(14,3) NOT NULL DEFAULT 0,
    qte_1er_choix             NUMERIC(14,3) NOT NULL DEFAULT 0,
    qte_2e_choix              NUMERIC(14,3) NOT NULL DEFAULT 0,
    qte_ourlet                NUMERIC(14,3) NOT NULL DEFAULT 0,
    qte_dechet                NUMERIC(14,3) NOT NULL DEFAULT 0,

    priorite                  of_priorite_enum NOT NULL DEFAULT 'normale',
    statut                    of_statut_enum   NOT NULL DEFAULT 'brouillon',
    etat_preparation_mp       of_etat_prep_mp_enum NOT NULL DEFAULT 'non_prepare',
    etat_tissage              of_etat_tissage_enum NOT NULL DEFAULT 'attente',
    etat_coupe                of_etat_coupe_enum   NOT NULL DEFAULT 'non_demarre',

    id_machine_prevue         BIGINT,
    temps_production_prevu_sec INTEGER,
    compteur_machine_affichage INTEGER,
    largeur_tissu_cm          NUMERIC(6,2),
    longueur_tissu_m          NUMERIC(10,2),
    metrage_fil_chaine_m      NUMERIC(12,2),
    duite_par_cm              NUMERIC(6,2),
    nb_duites_total_production INTEGER,
    qr_mp_final               VARCHAR(50),

    date_creation_of          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_planification        TIMESTAMPTZ,
    date_debut_reel           TIMESTAMPTZ,
    date_fin_prevue           TIMESTAMPTZ,
    date_fin_reel             TIMESTAMPTZ,

    cout_theorique_ht         NUMERIC(14,3),
    cout_reel_ht              NUMERIC(14,3),

    id_lot_produit            BIGINT,
    chef_production_id_utilisateur BIGINT,
    notes_speciales           TEXT,
    est_sous_traite           BOOLEAN NOT NULL DEFAULT FALSE,
    id_soustraitant           BIGINT,
    motif_refus_complement    TEXT,
    ordre_planif_machine      INTEGER,

    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by                BIGINT,
    updated_by                BIGINT
);

CREATE INDEX IF NOT EXISTS ix_of_statut         ON ordres_fabrication(statut);
CREATE INDEX IF NOT EXISTS ix_of_article        ON ordres_fabrication(id_article);
CREATE INDEX IF NOT EXISTS ix_of_machine        ON ordres_fabrication(id_machine_prevue);
CREATE INDEX IF NOT EXISTS ix_of_commande       ON ordres_fabrication(id_commande);
CREATE INDEX IF NOT EXISTS ix_of_type           ON ordres_fabrication(type_of);
CREATE INDEX IF NOT EXISTS ix_of_date_debut     ON ordres_fabrication(date_debut_reel);
CREATE INDEX IF NOT EXISTS ix_of_date_creation  ON ordres_fabrication(date_creation_of);

-- ---------------------------------------------------------------------
-- of_lignes : lignes produites détaillées par OF (multi-composants)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS of_lignes (
    id_of_ligne     BIGSERIAL PRIMARY KEY,
    id_of           BIGINT NOT NULL REFERENCES ordres_fabrication(id_of) ON DELETE CASCADE,
    numero_ligne    INTEGER NOT NULL,
    id_article      BIGINT NOT NULL,
    quantite_prevue NUMERIC(14,3) NOT NULL DEFAULT 0,
    quantite_produite NUMERIC(14,3) NOT NULL DEFAULT 0,
    unite           VARCHAR(10),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_of, numero_ligne)
);
CREATE INDEX IF NOT EXISTS ix_of_lignes_of ON of_lignes(id_of);

-- ---------------------------------------------------------------------
-- of_postes : postes assignés par OF (prep_mp, ourdissage, tissage, coupe, finition, controle)
-- ---------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE of_poste_code_enum AS ENUM (
        'prep_mp','ourdissage','tissage','coupe','finition','controle','sous_traitance'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE of_poste_statut_enum AS ENUM ('a_faire','en_cours','en_pause','termine','bloque_qc','annule');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS of_postes (
    id_of_poste     BIGSERIAL PRIMARY KEY,
    id_of           BIGINT NOT NULL REFERENCES ordres_fabrication(id_of) ON DELETE CASCADE,
    code_poste      of_poste_code_enum NOT NULL,
    ordre           INTEGER NOT NULL,
    id_machine      BIGINT,
    id_operateur    BIGINT,
    statut          of_poste_statut_enum NOT NULL DEFAULT 'a_faire',
    date_debut_prevue TIMESTAMPTZ,
    date_debut_reel   TIMESTAMPTZ,
    date_fin_prevue   TIMESTAMPTZ,
    date_fin_reel     TIMESTAMPTZ,
    duree_estimee_sec INTEGER,
    duree_reelle_sec  INTEGER,
    quantite_produite NUMERIC(14,3) DEFAULT 0,
    quantite_rebut    NUMERIC(14,3) DEFAULT 0,
    commentaire       TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_of, code_poste, ordre)
);
CREATE INDEX IF NOT EXISTS ix_of_postes_of      ON of_postes(id_of);
CREATE INDEX IF NOT EXISTS ix_of_postes_machine ON of_postes(id_machine);
CREATE INDEX IF NOT EXISTS ix_of_postes_statut  ON of_postes(statut);

-- ---------------------------------------------------------------------
-- of_status_transitions : historique des changements de statut
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS of_status_transitions (
    id_transition   BIGSERIAL PRIMARY KEY,
    id_of           BIGINT NOT NULL REFERENCES ordres_fabrication(id_of) ON DELETE CASCADE,
    statut_avant    of_statut_enum,
    statut_apres    of_statut_enum NOT NULL,
    motif           VARCHAR(200),
    commentaire     TEXT,
    id_utilisateur  BIGINT,
    horodatage      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_of_transitions_of   ON of_status_transitions(id_of);
CREATE INDEX IF NOT EXISTS ix_of_transitions_date ON of_status_transitions(horodatage);

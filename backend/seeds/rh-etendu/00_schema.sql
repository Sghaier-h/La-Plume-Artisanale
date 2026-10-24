-- =============================================================================
-- 00_schema.sql — Applique le schéma RH étendu avant les seeds (idempotent)
--
-- Reproduit database/schema-v2/36_rh_etendu.sql pour rester autonome : le
-- script seed-rh-etendu.js exécute uniquement ce dossier dans l'ordre.
-- =============================================================================

-- Pré-requis : table employes doit déjà exister (schema-v2/22_rh_effectif.sql).
-- Si ce n'est pas le cas, créer un minimum pour que les seeds passent en démo.
CREATE TABLE IF NOT EXISTS employes (
    id_employe          BIGSERIAL PRIMARY KEY,
    matricule           VARCHAR(20) NOT NULL UNIQUE,
    nom                 VARCHAR(120) NOT NULL,
    prenom              VARCHAR(120) NOT NULL,
    date_embauche       DATE,
    statut              VARCHAR(20) NOT NULL DEFAULT 'actif',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE employes
  ADD COLUMN IF NOT EXISTS solde_courant                  NUMERIC(14,3) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS date_dernier_mouvement         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rib_bancaire                   VARCHAR(40),
  ADD COLUMN IF NOT EXISTS banque                         VARCHAR(120),
  ADD COLUMN IF NOT EXISTS caisse_defaut_paiement_salaire BIGINT;

CREATE INDEX IF NOT EXISTS idx_employes_solde_courant ON employes(solde_courant);

CREATE TABLE IF NOT EXISTS comptes_employes_mouvements (
    id_mouvement_emp   BIGSERIAL PRIMARY KEY,
    id_employe         BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE CASCADE,
    date_mouvement     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type_mvt           VARCHAR(32) NOT NULL,
    sens               CHAR(1) NOT NULL DEFAULT 'C',
    montant            NUMERIC(14,3) NOT NULL,
    libelle            VARCHAR(255),
    id_bulletin        BIGINT,
    id_paiement        BIGINT,
    id_avance          BIGINT,
    id_ajustement      BIGINT,
    id_compensation    BIGINT,
    solde_apres        NUMERIC(14,3),
    cree_par           BIGINT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS avances_salaires (
    id_avance              BIGSERIAL PRIMARY KEY,
    id_employe             BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE RESTRICT,
    date_demande           DATE NOT NULL DEFAULT CURRENT_DATE,
    montant_demande        NUMERIC(14,3) NOT NULL,
    motif                  TEXT,
    date_approbation       DATE,
    approuve_par           BIGINT,
    statut                 VARCHAR(32) NOT NULL DEFAULT 'demande',
    date_paiement          DATE,
    id_paiement            BIGINT,
    id_caisse_source       BIGINT,
    modalite_remboursement VARCHAR(32),
    solde_restant_avance   NUMERIC(14,3) DEFAULT 0,
    motif_refus            TEXT,
    cree_par               BIGINT,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ajustements_comptes_rh (
    id_ajustement      BIGSERIAL PRIMARY KEY,
    code_ajustement    VARCHAR(60) NOT NULL UNIQUE,
    id_employe         BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE RESTRICT,
    date_ajustement    DATE NOT NULL DEFAULT CURRENT_DATE,
    montant            NUMERIC(14,3) NOT NULL,
    motif              TEXT NOT NULL,
    type_ajustement    VARCHAR(32) NOT NULL,
    ancienne_valeur    NUMERIC(14,3),
    nouvelle_valeur    NUMERIC(14,3),
    cree_par           BIGINT NOT NULL,
    valide_par         BIGINT,
    date_validation    TIMESTAMPTZ,
    statut_validation  VARCHAR(20) NOT NULL DEFAULT 'en_attente',
    motif_rejet        TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compensations_rh (
    id_comp_rh                   BIGSERIAL PRIMARY KEY,
    id_employe                   BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE RESTRICT,
    date_compensation            DATE NOT NULL DEFAULT CURRENT_DATE,
    type_compensation            VARCHAR(32) NOT NULL,
    montant_a_compenser          NUMERIC(14,3) NOT NULL,
    source                       VARCHAR(32) NOT NULL,
    id_compensation_croisee_liee BIGINT,
    statut                       VARCHAR(20) NOT NULL DEFAULT 'en_attente',
    date_application             TIMESTAMPTZ,
    applique_par                 BIGINT,
    motif                        TEXT,
    cree_par                     BIGINT,
    created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS code_pin_employe (
    id_pin                 BIGSERIAL PRIMARY KEY,
    id_employe             BIGINT NOT NULL UNIQUE REFERENCES employes(id_employe) ON DELETE CASCADE,
    pin_hash               VARCHAR(255) NOT NULL,
    salt                   VARCHAR(64)  NOT NULL,
    pin_longueur           SMALLINT NOT NULL DEFAULT 4,
    date_derniere_maj      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    bloque                 BOOLEAN NOT NULL DEFAULT FALSE,
    nb_tentatives_echec    SMALLINT NOT NULL DEFAULT 0,
    date_blocage           TIMESTAMPTZ,
    debloque_par           BIGINT,
    date_deblocage         TIMESTAMPTZ,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demandes_rh (
    id_demande         BIGSERIAL PRIMARY KEY,
    id_employe         BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE CASCADE,
    type_demande       VARCHAR(32) NOT NULL,
    objet              VARCHAR(255),
    description        TEXT,
    piece_jointe_path  TEXT,
    signature_svg      TEXT,
    montant_demande    NUMERIC(14,3),
    date_debut_conge   DATE,
    date_fin_conge     DATE,
    statut             VARCHAR(20) NOT NULL DEFAULT 'demande',
    date_demande       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_traitement    TIMESTAMPTZ,
    traite_par         BIGINT,
    motif_refus        TEXT,
    reponse_rh         TEXT,
    id_avance_liee     BIGINT,
    id_conge_lie       BIGINT,
    id_document_archive BIGINT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planning_employes (
    id_planning        BIGSERIAL PRIMARY KEY,
    id_employe         BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE CASCADE,
    date_planning      DATE NOT NULL,
    horaire_debut      TIME NOT NULL,
    horaire_fin        TIME NOT NULL,
    type_shift         VARCHAR(20) NOT NULL DEFAULT 'journee',
    machine_assignee   BIGINT,
    of_assigne         BIGINT,
    statut             VARCHAR(20) NOT NULL DEFAULT 'planifie',
    notes              TEXT,
    cree_par           BIGINT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pointages_evenements (
    id_evt             BIGSERIAL PRIMARY KEY,
    id_employe         BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE CASCADE,
    date_evt           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type_evt           VARCHAR(16) NOT NULL,
    photo_url          TEXT,
    source             VARCHAR(20) NOT NULL DEFAULT 'tablette_pin',
    id_appareil        VARCHAR(64),
    notes              TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

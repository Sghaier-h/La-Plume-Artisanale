-- =====================================================================
-- Schéma v2 — RH : temps (pointages, congés, absences, heures supp)
-- =====================================================================

CREATE TABLE IF NOT EXISTS pointages (
    id_pointage         BIGSERIAL PRIMARY KEY,
    id_employe          BIGINT NOT NULL REFERENCES employes(id_employe),
    date_pointage       DATE NOT NULL,
    heure_entree        TIME,
    heure_sortie        TIME,
    heure_entree_pm     TIME,                             -- retour de pause déjeuner
    heure_sortie_pm     TIME,
    heures_travaillees  NUMERIC(5,2),
    heures_pause        NUMERIC(5,2) DEFAULT 0,
    heures_retard       NUMERIC(5,2) DEFAULT 0,
    source              VARCHAR(20) DEFAULT 'timemoto',   -- timemoto | manuel | mobile | badge
    id_appareil         VARCHAR(64),
    id_utilisateur      BIGINT,
    valide              BOOLEAN NOT NULL DEFAULT FALSE,
    id_valideur         BIGINT,
    date_validation     TIMESTAMPTZ,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(id_employe, date_pointage)
);
CREATE INDEX IF NOT EXISTS idx_pointages_employe ON pointages(id_employe);
CREATE INDEX IF NOT EXISTS idx_pointages_date    ON pointages(date_pointage);

CREATE TABLE IF NOT EXISTS types_conges (
    id_type             BIGSERIAL PRIMARY KEY,
    code                VARCHAR(20) NOT NULL UNIQUE,
    libelle             VARCHAR(120) NOT NULL,
    remunere            BOOLEAN NOT NULL DEFAULT TRUE,
    duree_max_jours     INT,
    justificatif_requis BOOLEAN DEFAULT FALSE,
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    notes               TEXT
);

CREATE TABLE IF NOT EXISTS conges (
    id_conge            BIGSERIAL PRIMARY KEY,
    id_employe          BIGINT NOT NULL REFERENCES employes(id_employe),
    id_type             BIGINT NOT NULL REFERENCES types_conges(id_type),
    date_debut          DATE NOT NULL,
    date_fin            DATE NOT NULL,
    nb_jours            NUMERIC(5,2) NOT NULL,
    demi_journee        BOOLEAN DEFAULT FALSE,
    motif               VARCHAR(255),
    statut              VARCHAR(20) NOT NULL DEFAULT 'demande', -- demande | approuve | refuse | annule
    id_approbateur      BIGINT,
    date_decision       TIMESTAMPTZ,
    commentaire_decision TEXT,
    justificatif_url    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conges_employe ON conges(id_employe);
CREATE INDEX IF NOT EXISTS idx_conges_statut  ON conges(statut);
CREATE INDEX IF NOT EXISTS idx_conges_periode ON conges(date_debut, date_fin);

CREATE TABLE IF NOT EXISTS absences (
    id_absence          BIGSERIAL PRIMARY KEY,
    id_employe          BIGINT NOT NULL REFERENCES employes(id_employe),
    date_absence        DATE NOT NULL,
    duree_h             NUMERIC(5,2) NOT NULL DEFAULT 8,
    type_absence        VARCHAR(30) NOT NULL,            -- injustifiee | maladie | autorisee
    justifiee           BOOLEAN DEFAULT FALSE,
    justificatif_url    TEXT,
    retenue_salaire     NUMERIC(12,3),
    id_utilisateur      BIGINT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS heures_supp (
    id_hs               BIGSERIAL PRIMARY KEY,
    id_employe          BIGINT NOT NULL REFERENCES employes(id_employe),
    date_hs             DATE NOT NULL,
    nb_heures           NUMERIC(5,2) NOT NULL,
    taux_majoration_pct NUMERIC(5,2) DEFAULT 25,          -- 25% jour, 50% dimanche/férié
    motif               VARCHAR(255),
    id_approbateur      BIGINT,
    statut              VARCHAR(20) DEFAULT 'demande',
    id_paie             BIGINT REFERENCES paies(id_paie), -- si intégré à une paie
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hs_employe ON heures_supp(id_employe);

-- Compteurs de congés (soldes)
CREATE TABLE IF NOT EXISTS soldes_conges (
    id_solde            BIGSERIAL PRIMARY KEY,
    id_employe          BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE CASCADE,
    id_type             BIGINT NOT NULL REFERENCES types_conges(id_type),
    annee               INT NOT NULL,
    solde_acquis        NUMERIC(6,2) DEFAULT 0,
    solde_pris          NUMERIC(6,2) DEFAULT 0,
    solde_restant       NUMERIC(6,2) GENERATED ALWAYS AS (solde_acquis - solde_pris) STORED,
    UNIQUE(id_employe, id_type, annee)
);

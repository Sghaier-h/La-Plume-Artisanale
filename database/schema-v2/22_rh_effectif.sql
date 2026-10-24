-- =====================================================================
-- Schéma v2 — RH : effectif, contrats, structure (§11bis)
-- =====================================================================

CREATE TABLE IF NOT EXISTS services (
    id_service          BIGSERIAL PRIMARY KEY,
    code                VARCHAR(20) UNIQUE,
    libelle             VARCHAR(120) NOT NULL,
    id_service_parent   BIGINT REFERENCES services(id_service),
    id_responsable      BIGINT,
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS postes_travail (
    id_poste            BIGSERIAL PRIMARY KEY,
    code                VARCHAR(20) UNIQUE,
    intitule            VARCHAR(120) NOT NULL,
    id_service          BIGINT REFERENCES services(id_service),
    fonction            VARCHAR(120),
    niveau              VARCHAR(30),                     -- ouvrier | agent_maitrise | cadre
    salaire_min         NUMERIC(12,3),
    salaire_max         NUMERIC(12,3),
    description         TEXT,
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employes (
    id_employe          BIGSERIAL PRIMARY KEY,
    matricule           VARCHAR(20) NOT NULL UNIQUE,
    id_utilisateur      BIGINT,                          -- lien user si présent
    nom                 VARCHAR(120) NOT NULL,
    prenom              VARCHAR(120) NOT NULL,
    sexe                CHAR(1),                         -- M/F
    date_naissance      DATE,
    lieu_naissance      VARCHAR(120),
    cin                 VARCHAR(20),
    numero_cnss         VARCHAR(20),
    numero_fiscal       VARCHAR(20),
    situation_familiale VARCHAR(20),
    nb_enfants          SMALLINT DEFAULT 0,
    adresse             TEXT,
    telephone           VARCHAR(40),
    email               VARCHAR(120),
    date_embauche       DATE,
    date_sortie         DATE,
    id_service          BIGINT REFERENCES services(id_service),
    id_poste            BIGINT REFERENCES postes_travail(id_poste),
    id_manager          BIGINT REFERENCES employes(id_employe),
    statut              VARCHAR(20) NOT NULL DEFAULT 'actif',   -- actif | conge | suspendu | sorti
    photo_url           TEXT,
    rib                 VARCHAR(40),
    banque              VARCHAR(120),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_employes_service ON employes(id_service);
CREATE INDEX IF NOT EXISTS idx_employes_poste   ON employes(id_poste);
CREATE INDEX IF NOT EXISTS idx_employes_statut  ON employes(statut);

CREATE TABLE IF NOT EXISTS contrats (
    id_contrat          BIGSERIAL PRIMARY KEY,
    id_employe          BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE CASCADE,
    type_contrat        VARCHAR(20) NOT NULL,            -- CDI | CDD | stage | freelance | interim
    date_debut          DATE NOT NULL,
    date_fin            DATE,
    periode_essai_j     INT DEFAULT 0,
    salaire_base        NUMERIC(12,3) NOT NULL,
    devise              CHAR(3) DEFAULT 'TND',
    horaire_hebdo_h     NUMERIC(5,2) DEFAULT 40,
    id_poste            BIGINT REFERENCES postes_travail(id_poste),
    id_service          BIGINT REFERENCES services(id_service),
    statut              VARCHAR(20) NOT NULL DEFAULT 'actif', -- actif | rompu | expire | renouvele
    date_rupture        DATE,
    motif_rupture       VARCHAR(255),
    document_url        TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contrats_employe ON contrats(id_employe);

CREATE TABLE IF NOT EXISTS historique_carriere (
    id_historique       BIGSERIAL PRIMARY KEY,
    id_employe          BIGINT NOT NULL REFERENCES employes(id_employe) ON DELETE CASCADE,
    date_evenement      DATE NOT NULL,
    type_evenement      VARCHAR(30) NOT NULL,            -- embauche | mutation | promotion | augmentation | sanction | prime | formation | sortie
    id_service_avant    BIGINT REFERENCES services(id_service),
    id_service_apres    BIGINT REFERENCES services(id_service),
    id_poste_avant      BIGINT REFERENCES postes_travail(id_poste),
    id_poste_apres      BIGINT REFERENCES postes_travail(id_poste),
    salaire_avant       NUMERIC(12,3),
    salaire_apres       NUMERIC(12,3),
    description         TEXT,
    id_utilisateur      BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hist_employe ON historique_carriere(id_employe);

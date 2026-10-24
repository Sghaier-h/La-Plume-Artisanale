-- =====================================================================
-- Schéma v2 — RH : Recrutement
-- =====================================================================

CREATE TABLE IF NOT EXISTS postes_ouverts (
    id_poste_ouvert     BIGSERIAL PRIMARY KEY,
    code                VARCHAR(20) UNIQUE,
    id_poste            BIGINT REFERENCES postes_travail(id_poste),
    id_service          BIGINT REFERENCES services(id_service),
    intitule            VARCHAR(255) NOT NULL,
    description         TEXT,
    profil_recherche    TEXT,
    type_contrat        VARCHAR(20),
    salaire_min         NUMERIC(12,3),
    salaire_max         NUMERIC(12,3),
    nb_postes           INT DEFAULT 1,
    date_publication    DATE,
    date_cloture        DATE,
    statut              VARCHAR(20) NOT NULL DEFAULT 'brouillon', -- brouillon | publie | ferme | pourvu | annule
    canaux              JSONB,                            -- ex: ["linkedin","site","interne"]
    id_responsable      BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidatures (
    id_candidature      BIGSERIAL PRIMARY KEY,
    id_poste_ouvert     BIGINT NOT NULL REFERENCES postes_ouverts(id_poste_ouvert),
    nom                 VARCHAR(120) NOT NULL,
    prenom              VARCHAR(120) NOT NULL,
    email               VARCHAR(120),
    telephone           VARCHAR(40),
    cv_url              TEXT,
    lettre_motivation_url TEXT,
    source              VARCHAR(60),                      -- site | linkedin | recommandation | autre
    statut              VARCHAR(30) NOT NULL DEFAULT 'reçue',
                        -- reçue | preselectionnee | entretien | offre | acceptee | refusee | retiree
    score_matching      NUMERIC(4,1),
    notes               TEXT,
    id_utilisateur_traitement BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_candidatures_poste ON candidatures(id_poste_ouvert);
CREATE INDEX IF NOT EXISTS idx_candidatures_statut ON candidatures(statut);

CREATE TABLE IF NOT EXISTS entretiens (
    id_entretien        BIGSERIAL PRIMARY KEY,
    id_candidature      BIGINT NOT NULL REFERENCES candidatures(id_candidature) ON DELETE CASCADE,
    type_entretien      VARCHAR(20) NOT NULL,             -- telephonique | visio | presentiel | technique
    date_entretien      TIMESTAMPTZ NOT NULL,
    duree_min           INT DEFAULT 60,
    lieu                VARCHAR(255),
    id_intervieweurs    JSONB,                            -- liste id_employe
    statut              VARCHAR(20) DEFAULT 'planifie',   -- planifie | realise | annule | reporte
    evaluation_globale  VARCHAR(20),                      -- tres_positif | positif | mitige | negatif
    note_technique      NUMERIC(4,1),
    note_soft_skills    NUMERIC(4,1),
    compte_rendu        TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offres_embauche (
    id_offre            BIGSERIAL PRIMARY KEY,
    id_candidature      BIGINT NOT NULL REFERENCES candidatures(id_candidature),
    date_offre          DATE NOT NULL DEFAULT CURRENT_DATE,
    date_reponse_limite DATE,
    type_contrat        VARCHAR(20) NOT NULL,
    salaire_propose     NUMERIC(12,3) NOT NULL,
    date_debut_prevue   DATE,
    avantages           TEXT,
    statut              VARCHAR(20) DEFAULT 'envoyee',    -- envoyee | acceptee | refusee | expiree | retiree
    document_url        TEXT,
    id_employe_cree     BIGINT REFERENCES employes(id_employe), -- si acceptée
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

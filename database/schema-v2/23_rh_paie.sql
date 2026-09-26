-- =====================================================================
-- Schéma v2 — RH : Paie (§11bis)
-- CNSS Tunisie : 9.18% employé / 16.57% employeur
-- IRPP Tunisie : barème progressif 5 tranches
-- =====================================================================

CREATE TABLE IF NOT EXISTS paies (
    id_paie             BIGSERIAL PRIMARY KEY,
    id_employe          BIGINT NOT NULL REFERENCES employes(id_employe),
    id_contrat          BIGINT REFERENCES contrats(id_contrat),
    periode_annee       INT NOT NULL,
    periode_mois        SMALLINT NOT NULL CHECK (periode_mois BETWEEN 1 AND 12),
    date_calcul         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_paiement       DATE,
    statut              VARCHAR(20) NOT NULL DEFAULT 'brouillon', -- brouillon | valide | paye | annule
    salaire_base        NUMERIC(12,3) NOT NULL,
    heures_normales     NUMERIC(6,2),
    heures_supp         NUMERIC(6,2) DEFAULT 0,
    montant_heures_supp NUMERIC(12,3) DEFAULT 0,
    primes_totales      NUMERIC(12,3) DEFAULT 0,
    indemnites_totales  NUMERIC(12,3) DEFAULT 0,
    salaire_brut        NUMERIC(12,3) NOT NULL DEFAULT 0,
    -- CNSS
    cnss_employe        NUMERIC(12,3) DEFAULT 0,          -- 9.18%
    cnss_employeur      NUMERIC(12,3) DEFAULT 0,          -- 16.57%
    -- IRPP
    salaire_imposable   NUMERIC(12,3) DEFAULT 0,
    irpp                NUMERIC(12,3) DEFAULT 0,
    css                 NUMERIC(12,3) DEFAULT 0,          -- Contribution Sociale Solidaire 1%
    autres_retenues     NUMERIC(12,3) DEFAULT 0,
    net_a_payer         NUMERIC(12,3) NOT NULL DEFAULT 0,
    mode_paiement       VARCHAR(20),
    reference_paiement  VARCHAR(64),
    id_ecriture_compta  BIGINT,
    bulletin_pdf_url    TEXT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(id_employe, periode_annee, periode_mois)
);
CREATE INDEX IF NOT EXISTS idx_paies_periode ON paies(periode_annee, periode_mois);

CREATE TABLE IF NOT EXISTS paie_lignes (
    id_ligne            BIGSERIAL PRIMARY KEY,
    id_paie             BIGINT NOT NULL REFERENCES paies(id_paie) ON DELETE CASCADE,
    type_ligne          VARCHAR(20) NOT NULL,            -- gain | retenue | patronale | info
    code_rubrique       VARCHAR(30) NOT NULL,            -- SBASE | HSUPP | PRIME_ANC | CNSS_S | IRPP | CSS ...
    libelle             VARCHAR(120) NOT NULL,
    base                NUMERIC(12,3),
    taux                NUMERIC(6,3),
    montant             NUMERIC(12,3) NOT NULL,
    compte_compta       VARCHAR(20),
    ordre               INT DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_paie_lignes_paie ON paie_lignes(id_paie);

CREATE TABLE IF NOT EXISTS bulletins_pdf (
    id_bulletin         BIGSERIAL PRIMARY KEY,
    id_paie             BIGINT NOT NULL REFERENCES paies(id_paie) ON DELETE CASCADE,
    fichier_url         TEXT NOT NULL,
    hash_fichier        VARCHAR(64),
    date_generation     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    envoye_email        BOOLEAN DEFAULT FALSE,
    date_envoi          TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cnss_declarations (
    id_declaration      BIGSERIAL PRIMARY KEY,
    periode_annee       INT NOT NULL,
    periode_trimestre   SMALLINT NOT NULL CHECK (periode_trimestre BETWEEN 1 AND 4),
    date_declaration    DATE,
    date_paiement       DATE,
    statut              VARCHAR(20) DEFAULT 'brouillon', -- brouillon | soumise | payee
    nb_salaries         INT DEFAULT 0,
    masse_salariale     NUMERIC(14,3) DEFAULT 0,
    total_part_salariale  NUMERIC(14,3) DEFAULT 0,        -- 9.18%
    total_part_patronale  NUMERIC(14,3) DEFAULT 0,        -- 16.57%
    total_a_payer       NUMERIC(14,3) DEFAULT 0,
    reference_recette   VARCHAR(64),
    fichier_url         TEXT,
    id_ecriture_compta  BIGINT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(periode_annee, periode_trimestre)
);

CREATE TABLE IF NOT EXISTS irpp_declarations (
    id_declaration      BIGSERIAL PRIMARY KEY,
    periode_annee       INT NOT NULL,
    periode_mois        SMALLINT NOT NULL CHECK (periode_mois BETWEEN 1 AND 12),
    date_declaration    DATE,
    date_paiement       DATE,
    statut              VARCHAR(20) DEFAULT 'brouillon',
    total_salaire_imposable NUMERIC(14,3) DEFAULT 0,
    total_irpp          NUMERIC(14,3) DEFAULT 0,
    total_css           NUMERIC(14,3) DEFAULT 0,
    reference_recette   VARCHAR(64),
    fichier_url         TEXT,
    id_ecriture_compta  BIGINT,
    UNIQUE(periode_annee, periode_mois)
);

-- Barème IRPP Tunisie (référence — les valeurs sont en seeds/18_irpp_tranches.sql)
CREATE TABLE IF NOT EXISTS irpp_bareme (
    id_tranche          BIGSERIAL PRIMARY KEY,
    annee_fiscale       INT NOT NULL,
    ordre_tranche       SMALLINT NOT NULL,
    seuil_bas           NUMERIC(14,3) NOT NULL,
    seuil_haut          NUMERIC(14,3),                    -- NULL = infini
    taux_pct            NUMERIC(5,2) NOT NULL,
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(annee_fiscale, ordre_tranche)
);

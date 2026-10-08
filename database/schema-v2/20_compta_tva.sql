-- =====================================================================
-- Schéma v2 — TVA & timbre fiscal (§10.5, §13.1)
-- Taux Tunisie : 19% (standard), 13%, 7%, 0% (export/exonéré)
-- Timbre fiscal : 1 DT par facture
-- =====================================================================

CREATE TABLE IF NOT EXISTS tva_taux (
    id_taux             BIGSERIAL PRIMARY KEY,
    code                VARCHAR(10) NOT NULL UNIQUE,     -- TVA19 | TVA13 | TVA7 | TVA0
    taux_pct            NUMERIC(5,2) NOT NULL,
    libelle             VARCHAR(80) NOT NULL,
    compte_collectee    VARCHAR(20),                     -- 4367 par ex
    compte_deductible   VARCHAR(20),                     -- 4366
    est_defaut          BOOLEAN NOT NULL DEFAULT FALSE,
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    date_debut_validite DATE DEFAULT CURRENT_DATE,
    date_fin_validite   DATE,
    notes               TEXT
);

CREATE TABLE IF NOT EXISTS tva_declarations (
    id_declaration      BIGSERIAL PRIMARY KEY,
    periode_annee       INT NOT NULL,
    periode_mois        SMALLINT NOT NULL CHECK (periode_mois BETWEEN 1 AND 12),
    date_declaration    DATE,
    date_paiement       DATE,
    statut              VARCHAR(20) NOT NULL DEFAULT 'brouillon', -- brouillon | soumise | payee
    tva_collectee_total NUMERIC(14,3) NOT NULL DEFAULT 0,
    tva_deductible_total NUMERIC(14,3) NOT NULL DEFAULT 0,
    credit_reporte      NUMERIC(14,3) NOT NULL DEFAULT 0,
    tva_a_payer         NUMERIC(14,3) NOT NULL DEFAULT 0,
    reference_recette   VARCHAR(64),
    id_ecriture_compta  BIGINT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(periode_annee, periode_mois)
);

CREATE TABLE IF NOT EXISTS tva_declaration_lignes (
    id_ligne            BIGSERIAL PRIMARY KEY,
    id_declaration      BIGINT NOT NULL REFERENCES tva_declarations(id_declaration) ON DELETE CASCADE,
    id_taux             BIGINT REFERENCES tva_taux(id_taux),
    sens                VARCHAR(10) NOT NULL,            -- collectee | deductible
    base_ht             NUMERIC(14,3) NOT NULL DEFAULT 0,
    montant_tva         NUMERIC(14,3) NOT NULL DEFAULT 0,
    source_type         VARCHAR(20),                     -- factures | achats | avoirs
    notes               TEXT
);
CREATE INDEX IF NOT EXISTS idx_tva_lignes_decl ON tva_declaration_lignes(id_declaration);

CREATE TABLE IF NOT EXISTS timbres_fiscaux (
    id_timbre           BIGSERIAL PRIMARY KEY,
    date_operation      DATE NOT NULL DEFAULT CURRENT_DATE,
    source_type         VARCHAR(20) NOT NULL,            -- facture | facture_ff
    source_id           BIGINT NOT NULL,
    montant             NUMERIC(6,3) NOT NULL DEFAULT 1.000,
    compte_compta       VARCHAR(20) DEFAULT '4457',      -- droits d'enregistrement/timbre
    id_ecriture_compta  BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_timbres_source ON timbres_fiscaux(source_type, source_id);

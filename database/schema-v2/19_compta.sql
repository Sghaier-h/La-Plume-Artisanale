-- =====================================================================
-- Schéma v2 — Comptabilité générale (§10)
-- PCG Tunisie (classes 1-7), journaux (VE, AC, BQ, CA, OD), écritures, exercices
-- =====================================================================

CREATE TABLE IF NOT EXISTS plan_comptable_tunisien (
    id_compte           BIGSERIAL PRIMARY KEY,
    numero_compte       VARCHAR(20) NOT NULL UNIQUE,     -- ex: 411, 707, 601, 4366
    intitule            VARCHAR(255) NOT NULL,
    classe              SMALLINT NOT NULL,                -- 1..7
    nature              VARCHAR(20) NOT NULL,             -- actif | passif | charge | produit | mixte
    compte_parent       VARCHAR(20),
    est_collectif       BOOLEAN NOT NULL DEFAULT FALSE,   -- ex: 411 clients (auxiliaires)
    lettrable           BOOLEAN NOT NULL DEFAULT FALSE,
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pct_classe ON plan_comptable_tunisien(classe);
CREATE INDEX IF NOT EXISTS idx_pct_parent ON plan_comptable_tunisien(compte_parent);

CREATE TABLE IF NOT EXISTS journaux_comptables (
    id_journal          BIGSERIAL PRIMARY KEY,
    code                VARCHAR(4) NOT NULL UNIQUE,      -- VE | AC | BQ | CA | OD
    intitule            VARCHAR(80) NOT NULL,
    type_journal        VARCHAR(20) NOT NULL,             -- ventes | achats | banque | caisse | od
    compte_contrepartie VARCHAR(20),                      -- ex: 411 pour VE
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercices_comptables (
    id_exercice         BIGSERIAL PRIMARY KEY,
    libelle             VARCHAR(20) NOT NULL UNIQUE,     -- ex: 2026
    date_debut          DATE NOT NULL,
    date_fin            DATE NOT NULL,
    statut              VARCHAR(20) NOT NULL DEFAULT 'ouvert', -- ouvert | cloture_provisoire | cloture_definitive
    date_cloture        TIMESTAMPTZ,
    id_utilisateur_cloture BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ecritures (
    id_ecriture         BIGSERIAL PRIMARY KEY,
    id_journal          BIGINT NOT NULL REFERENCES journaux_comptables(id_journal),
    id_exercice         BIGINT REFERENCES exercices_comptables(id_exercice),
    numero_piece        VARCHAR(32) NOT NULL,            -- ex: VE-2026-00001
    date_ecriture       DATE NOT NULL,
    libelle             VARCHAR(255) NOT NULL,
    reference_externe   VARCHAR(64),
    source_type         VARCHAR(20),                     -- facture | avoir | paiement | paie | od | reception
    source_id           BIGINT,
    montant_total       NUMERIC(14,3) NOT NULL DEFAULT 0,
    statut              VARCHAR(20) NOT NULL DEFAULT 'brouillon', -- brouillon | validee | verrouillee
    id_utilisateur_creation BIGINT,
    id_utilisateur_validation BIGINT,
    date_validation     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(id_journal, numero_piece)
);
CREATE INDEX IF NOT EXISTS idx_ecritures_journal   ON ecritures(id_journal);
CREATE INDEX IF NOT EXISTS idx_ecritures_exercice  ON ecritures(id_exercice);
CREATE INDEX IF NOT EXISTS idx_ecritures_date      ON ecritures(date_ecriture);
CREATE INDEX IF NOT EXISTS idx_ecritures_source    ON ecritures(source_type, source_id);

CREATE TABLE IF NOT EXISTS ecritures_lignes (
    id_ligne            BIGSERIAL PRIMARY KEY,
    id_ecriture         BIGINT NOT NULL REFERENCES ecritures(id_ecriture) ON DELETE CASCADE,
    ordre               INT NOT NULL DEFAULT 1,
    numero_compte       VARCHAR(20) NOT NULL,            -- FK logique vers plan_comptable_tunisien
    compte_auxiliaire   VARCHAR(20),                     -- ex: 411CLI0042
    libelle             VARCHAR(255) NOT NULL,
    debit               NUMERIC(14,3) NOT NULL DEFAULT 0,
    credit              NUMERIC(14,3) NOT NULL DEFAULT 0,
    lettrage            VARCHAR(8),                      -- code lettrage (ex: A, B, AA...)
    date_lettrage       DATE,
    id_tiers            BIGINT,                          -- client / fournisseur
    tiers_type          VARCHAR(20),                     -- client | fournisseur | employe | none
    CHECK ((debit >= 0) AND (credit >= 0)),
    CHECK (NOT (debit > 0 AND credit > 0))
);
CREATE INDEX IF NOT EXISTS idx_ecr_lignes_ecriture ON ecritures_lignes(id_ecriture);
CREATE INDEX IF NOT EXISTS idx_ecr_lignes_compte   ON ecritures_lignes(numero_compte);
CREATE INDEX IF NOT EXISTS idx_ecr_lignes_lettrage ON ecritures_lignes(lettrage) WHERE lettrage IS NOT NULL;

CREATE TABLE IF NOT EXISTS cloture_periodes (
    id_cloture          BIGSERIAL PRIMARY KEY,
    id_exercice         BIGINT NOT NULL REFERENCES exercices_comptables(id_exercice),
    type_periode        VARCHAR(20) NOT NULL,            -- mois | trimestre | annuel
    date_debut          DATE NOT NULL,
    date_fin            DATE NOT NULL,
    statut              VARCHAR(20) NOT NULL DEFAULT 'ouverte', -- ouverte | cloturee
    date_cloture        TIMESTAMPTZ,
    id_utilisateur      BIGINT,
    notes               TEXT,
    UNIQUE(id_exercice, type_periode, date_debut)
);

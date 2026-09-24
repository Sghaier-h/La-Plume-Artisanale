-- =====================================================================
-- Schéma v2 — Domaine D : Ventes (BL, Factures, Avoirs, Paiements)
-- Réf. docs/domain.md §8.3 (BL), §8.4 (factures), §8.5 (avoirs), §13.1 (timbre)
-- =====================================================================

CREATE TABLE IF NOT EXISTS bons_livraison (
    id_bl               BIGSERIAL PRIMARY KEY,
    numero              VARCHAR(32) NOT NULL UNIQUE,     -- BL-2026-00001
    id_client           BIGINT NOT NULL,
    id_commande         BIGINT REFERENCES commandes(id_commande),
    id_societe          BIGINT,
    date_bl             DATE NOT NULL DEFAULT CURRENT_DATE,
    date_expedition     TIMESTAMPTZ,
    statut              VARCHAR(20) NOT NULL DEFAULT 'brouillon',
                        -- brouillon | prepare | expedie | livre | facture | annule
    adresse_livraison   TEXT,
    transporteur        VARCHAR(120),
    numero_suivi        VARCHAR(64),
    nb_colis            INT DEFAULT 0,
    poids_total_kg      NUMERIC(10,3),
    notes               TEXT,
    id_utilisateur_creation BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bl_client ON bons_livraison(id_client);
CREATE INDEX IF NOT EXISTS idx_bl_cmd    ON bons_livraison(id_commande);
CREATE INDEX IF NOT EXISTS idx_bl_statut ON bons_livraison(statut);

CREATE TABLE IF NOT EXISTS bl_lignes (
    id_ligne            BIGSERIAL PRIMARY KEY,
    id_bl               BIGINT NOT NULL REFERENCES bons_livraison(id_bl) ON DELETE CASCADE,
    id_ligne_commande   BIGINT REFERENCES commandes_lignes(id_ligne),
    id_article          BIGINT,
    designation         VARCHAR(255) NOT NULL,
    quantite            NUMERIC(14,3) NOT NULL,
    unite               VARCHAR(16),
    id_lot              BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bl_lignes_bl ON bl_lignes(id_bl);

CREATE TABLE IF NOT EXISTS factures (
    id_facture          BIGSERIAL PRIMARY KEY,
    numero              VARCHAR(32) NOT NULL UNIQUE,     -- FA-2026-00001
    type_facture        VARCHAR(20) NOT NULL DEFAULT 'vente',  -- vente | acompte | proforma
    id_client           BIGINT NOT NULL,
    id_commande         BIGINT REFERENCES commandes(id_commande),
    id_bl               BIGINT REFERENCES bons_livraison(id_bl),
    id_societe          BIGINT,
    date_facture        DATE NOT NULL DEFAULT CURRENT_DATE,
    date_echeance       DATE,
    statut              VARCHAR(20) NOT NULL DEFAULT 'brouillon',
                        -- brouillon | emise | partiellement_payee | payee | en_retard | annulee
    montant_ht          NUMERIC(14,3) NOT NULL DEFAULT 0,
    montant_tva         NUMERIC(14,3) NOT NULL DEFAULT 0,
    timbre_fiscal       NUMERIC(6,3)  NOT NULL DEFAULT 1.000, -- 1 DT §13.1
    montant_ttc         NUMERIC(14,3) NOT NULL DEFAULT 0,
    montant_paye        NUMERIC(14,3) NOT NULL DEFAULT 0,
    montant_restant     NUMERIC(14,3) NOT NULL DEFAULT 0,
    devise              CHAR(3) NOT NULL DEFAULT 'TND',
    conditions_paiement VARCHAR(120),
    notes               TEXT,
    id_ecriture_compta  BIGINT,                          -- lien §10
    id_utilisateur_creation BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_factures_client   ON factures(id_client);
CREATE INDEX IF NOT EXISTS idx_factures_statut   ON factures(statut);
CREATE INDEX IF NOT EXISTS idx_factures_echeance ON factures(date_echeance);

CREATE TABLE IF NOT EXISTS factures_lignes (
    id_ligne            BIGSERIAL PRIMARY KEY,
    id_facture          BIGINT NOT NULL REFERENCES factures(id_facture) ON DELETE CASCADE,
    ordre               INT DEFAULT 1,
    id_article          BIGINT,
    designation         VARCHAR(255) NOT NULL,
    quantite            NUMERIC(14,3) NOT NULL,
    unite               VARCHAR(16),
    prix_unitaire_ht    NUMERIC(14,4) NOT NULL,
    remise_pct          NUMERIC(5,2) DEFAULT 0,
    taux_tva            NUMERIC(5,2) NOT NULL DEFAULT 19,
    montant_ht          NUMERIC(14,3) NOT NULL,
    montant_tva         NUMERIC(14,3) NOT NULL,
    montant_ttc         NUMERIC(14,3) NOT NULL,
    id_compte_vente     VARCHAR(20),                     -- ex: 707
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_factures_lignes_facture ON factures_lignes(id_facture);

CREATE TABLE IF NOT EXISTS avoirs (
    id_avoir            BIGSERIAL PRIMARY KEY,
    numero              VARCHAR(32) NOT NULL UNIQUE,     -- AV-2026-00001
    id_facture_origine  BIGINT REFERENCES factures(id_facture),
    id_client           BIGINT NOT NULL,
    date_avoir          DATE NOT NULL DEFAULT CURRENT_DATE,
    motif               VARCHAR(255),
    montant_ht          NUMERIC(14,3) NOT NULL DEFAULT 0,
    montant_tva         NUMERIC(14,3) NOT NULL DEFAULT 0,
    montant_ttc         NUMERIC(14,3) NOT NULL DEFAULT 0,
    statut              VARCHAR(20) NOT NULL DEFAULT 'emis',
    id_ecriture_compta  BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_avoirs_client ON avoirs(id_client);

CREATE TABLE IF NOT EXISTS paiements_clients (
    id_paiement         BIGSERIAL PRIMARY KEY,
    numero              VARCHAR(32) UNIQUE,
    id_client           BIGINT NOT NULL,
    date_paiement       DATE NOT NULL DEFAULT CURRENT_DATE,
    montant             NUMERIC(14,3) NOT NULL,
    devise              CHAR(3) DEFAULT 'TND',
    mode_paiement       VARCHAR(20) NOT NULL,           -- especes | cheque | virement | traite | cb
    reference           VARCHAR(64),
    date_encaissement   DATE,
    id_banque           BIGINT,
    id_caisse           BIGINT,
    statut              VARCHAR(20) DEFAULT 'recu',      -- recu | encaisse | rejete
    id_ecriture_compta  BIGINT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_paiements_client ON paiements_clients(id_client);

-- Multi-paiement: allocation d'un paiement sur N factures
CREATE TABLE IF NOT EXISTS factures_paiements (
    id_alloc            BIGSERIAL PRIMARY KEY,
    id_facture          BIGINT NOT NULL REFERENCES factures(id_facture) ON DELETE CASCADE,
    id_paiement         BIGINT NOT NULL REFERENCES paiements_clients(id_paiement) ON DELETE CASCADE,
    montant_affecte     NUMERIC(14,3) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(id_facture, id_paiement)
);
CREATE INDEX IF NOT EXISTS idx_fp_facture ON factures_paiements(id_facture);
CREATE INDEX IF NOT EXISTS idx_fp_paiement ON factures_paiements(id_paiement);

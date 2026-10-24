-- =====================================================================
-- Schéma v2 — Domaine D : Ventes (Devis & Commandes)
-- Réf. docs/domain.md §8.1 (devis), §8.2 (commandes)
-- PostgreSQL 15+
-- =====================================================================

CREATE TABLE IF NOT EXISTS devis (
    id_devis            BIGSERIAL PRIMARY KEY,
    numero              VARCHAR(32) NOT NULL UNIQUE,     -- ex: DEV-2026-00001
    id_client           BIGINT NOT NULL,
    id_societe          BIGINT,
    date_devis          DATE NOT NULL DEFAULT CURRENT_DATE,
    date_validite       DATE,
    statut              VARCHAR(20) NOT NULL DEFAULT 'brouillon',
                        -- brouillon | envoye | accepte | refuse | expire | converti
    montant_ht          NUMERIC(14,3) NOT NULL DEFAULT 0,
    montant_tva         NUMERIC(14,3) NOT NULL DEFAULT 0,
    timbre_fiscal       NUMERIC(6,3)  NOT NULL DEFAULT 0,   -- 1 DT Tunisie
    montant_ttc         NUMERIC(14,3) NOT NULL DEFAULT 0,
    devise              CHAR(3)       NOT NULL DEFAULT 'TND',
    conditions_paiement VARCHAR(120),
    notes               TEXT,
    id_commande         BIGINT,                              -- rempli si converti
    id_utilisateur_creation BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_devis_client ON devis(id_client);
CREATE INDEX IF NOT EXISTS idx_devis_statut ON devis(statut);
CREATE INDEX IF NOT EXISTS idx_devis_date   ON devis(date_devis);

CREATE TABLE IF NOT EXISTS devis_lignes (
    id_ligne            BIGSERIAL PRIMARY KEY,
    id_devis            BIGINT NOT NULL REFERENCES devis(id_devis) ON DELETE CASCADE,
    ordre               INT NOT NULL DEFAULT 1,
    id_article          BIGINT,
    id_modele           BIGINT,
    designation         VARCHAR(255) NOT NULL,
    quantite            NUMERIC(14,3) NOT NULL,
    unite               VARCHAR(16),
    prix_unitaire_ht    NUMERIC(14,4) NOT NULL,
    remise_pct          NUMERIC(5,2) DEFAULT 0,
    taux_tva            NUMERIC(5,2) NOT NULL DEFAULT 19,
    montant_ht          NUMERIC(14,3) NOT NULL,
    montant_tva         NUMERIC(14,3) NOT NULL,
    montant_ttc         NUMERIC(14,3) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_devis_lignes_devis ON devis_lignes(id_devis);

CREATE TABLE IF NOT EXISTS commandes (
    id_commande         BIGSERIAL PRIMARY KEY,
    numero              VARCHAR(32) NOT NULL UNIQUE,     -- ex: CMD-2026-00001
    id_client           BIGINT NOT NULL,
    id_societe          BIGINT,
    id_devis_source     BIGINT REFERENCES devis(id_devis),
    date_commande       DATE NOT NULL DEFAULT CURRENT_DATE,
    date_livraison_prev DATE,
    statut              VARCHAR(20) NOT NULL DEFAULT 'brouillon',
                        -- brouillon | validee | en_production | prete | livree_partielle | livree | facturee | close | annulee
    priorite            SMALLINT DEFAULT 3,             -- 1 haute → 5 basse
    montant_ht          NUMERIC(14,3) NOT NULL DEFAULT 0,
    montant_tva         NUMERIC(14,3) NOT NULL DEFAULT 0,
    timbre_fiscal       NUMERIC(6,3)  NOT NULL DEFAULT 0,
    montant_ttc         NUMERIC(14,3) NOT NULL DEFAULT 0,
    devise              CHAR(3)       NOT NULL DEFAULT 'TND',
    conditions_paiement VARCHAR(120),
    notes               TEXT,
    id_utilisateur_creation BIGINT,
    date_validation     TIMESTAMPTZ,
    ofs_generes         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_commandes_client ON commandes(id_client);
CREATE INDEX IF NOT EXISTS idx_commandes_statut ON commandes(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_date   ON commandes(date_commande);

CREATE TABLE IF NOT EXISTS commandes_lignes (
    id_ligne            BIGSERIAL PRIMARY KEY,
    id_commande         BIGINT NOT NULL REFERENCES commandes(id_commande) ON DELETE CASCADE,
    ordre               INT NOT NULL DEFAULT 1,
    id_article          BIGINT,
    id_modele           BIGINT,
    designation         VARCHAR(255) NOT NULL,
    quantite            NUMERIC(14,3) NOT NULL,
    quantite_livree     NUMERIC(14,3) NOT NULL DEFAULT 0,
    unite               VARCHAR(16),
    prix_unitaire_ht    NUMERIC(14,4) NOT NULL,
    remise_pct          NUMERIC(5,2) DEFAULT 0,
    taux_tva            NUMERIC(5,2) NOT NULL DEFAULT 19,
    montant_ht          NUMERIC(14,3) NOT NULL,
    montant_tva         NUMERIC(14,3) NOT NULL,
    montant_ttc         NUMERIC(14,3) NOT NULL,
    date_livraison_ligne DATE,
    statut_ligne        VARCHAR(20) DEFAULT 'a_produire',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cmd_lignes_cmd ON commandes_lignes(id_commande);
CREATE INDEX IF NOT EXISTS idx_cmd_lignes_article ON commandes_lignes(id_article);

-- Traçabilité ligne commande → Ordre de Fabrication (§8.9, §5)
CREATE TABLE IF NOT EXISTS commande_of_liens (
    id_lien             BIGSERIAL PRIMARY KEY,
    id_commande         BIGINT NOT NULL REFERENCES commandes(id_commande) ON DELETE CASCADE,
    id_ligne_commande   BIGINT NOT NULL REFERENCES commandes_lignes(id_ligne) ON DELETE CASCADE,
    id_of               BIGINT NOT NULL,                  -- FK vers ordres_fabrication (schéma production)
    quantite_affectee   NUMERIC(14,3) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(id_ligne_commande, id_of)
);
CREATE INDEX IF NOT EXISTS idx_cmd_of_liens_cmd ON commande_of_liens(id_commande);
CREATE INDEX IF NOT EXISTS idx_cmd_of_liens_of  ON commande_of_liens(id_of);

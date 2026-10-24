-- =====================================================================
-- Schéma v2 — Achats & Fournisseurs (§9)
-- =====================================================================

CREATE TABLE IF NOT EXISTS fournisseurs (
    id_fournisseur      BIGSERIAL PRIMARY KEY,
    code                VARCHAR(20) UNIQUE,
    raison_sociale      VARCHAR(255) NOT NULL,
    type_fournisseur    VARCHAR(20) NOT NULL DEFAULT 'bien',   -- bien | service | mixte
    matricule_fiscal    VARCHAR(20),
    adresse             TEXT,
    ville               VARCHAR(80),
    code_postal         VARCHAR(10),
    pays                VARCHAR(60) DEFAULT 'Tunisie',
    telephone           VARCHAR(40),
    email               VARCHAR(120),
    contact_nom         VARCHAR(120),
    devise              CHAR(3) DEFAULT 'TND',
    conditions_paiement VARCHAR(120),
    delai_paiement_j    INT DEFAULT 30,
    rib                 VARCHAR(40),
    banque              VARCHAR(120),
    compte_compta       VARCHAR(20),                      -- 401xxx
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fournisseurs_raison ON fournisseurs(raison_sociale);
CREATE INDEX IF NOT EXISTS idx_fournisseurs_type   ON fournisseurs(type_fournisseur);

CREATE TABLE IF NOT EXISTS demandes_achat (
    id_da               BIGSERIAL PRIMARY KEY,
    numero              VARCHAR(32) NOT NULL UNIQUE,
    date_demande        DATE NOT NULL DEFAULT CURRENT_DATE,
    id_demandeur        BIGINT,
    service             VARCHAR(120),
    priorite            SMALLINT DEFAULT 3,
    statut              VARCHAR(20) NOT NULL DEFAULT 'brouillon',
                        -- brouillon | soumise | approuvee | refusee | convertie
    motif               TEXT,
    date_besoin         DATE,
    id_approbateur      BIGINT,
    date_approbation    TIMESTAMPTZ,
    id_bc               BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demandes_achat_lignes (
    id_ligne            BIGSERIAL PRIMARY KEY,
    id_da               BIGINT NOT NULL REFERENCES demandes_achat(id_da) ON DELETE CASCADE,
    id_article          BIGINT,
    designation         VARCHAR(255) NOT NULL,
    quantite            NUMERIC(14,3) NOT NULL,
    unite               VARCHAR(16),
    prix_estime         NUMERIC(14,4)
);
CREATE INDEX IF NOT EXISTS idx_da_lignes_da ON demandes_achat_lignes(id_da);

CREATE TABLE IF NOT EXISTS bons_commande_achat (
    id_bc               BIGSERIAL PRIMARY KEY,
    numero              VARCHAR(32) NOT NULL UNIQUE,     -- BC-2026-00001
    id_fournisseur      BIGINT NOT NULL REFERENCES fournisseurs(id_fournisseur),
    id_da_source        BIGINT REFERENCES demandes_achat(id_da),
    date_bc             DATE NOT NULL DEFAULT CURRENT_DATE,
    date_livraison_prev DATE,
    statut              VARCHAR(20) NOT NULL DEFAULT 'brouillon',
                        -- brouillon | envoye | confirme | recu_partiel | recu | facture | close | annule
    montant_ht          NUMERIC(14,3) DEFAULT 0,
    montant_tva         NUMERIC(14,3) DEFAULT 0,
    montant_ttc         NUMERIC(14,3) DEFAULT 0,
    devise              CHAR(3) DEFAULT 'TND',
    conditions_paiement VARCHAR(120),
    incoterm            VARCHAR(10),
    id_utilisateur_creation BIGINT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bc_fournisseur ON bons_commande_achat(id_fournisseur);
CREATE INDEX IF NOT EXISTS idx_bc_statut      ON bons_commande_achat(statut);

CREATE TABLE IF NOT EXISTS bc_lignes (
    id_ligne            BIGSERIAL PRIMARY KEY,
    id_bc               BIGINT NOT NULL REFERENCES bons_commande_achat(id_bc) ON DELETE CASCADE,
    ordre               INT DEFAULT 1,
    id_article          BIGINT,
    designation         VARCHAR(255) NOT NULL,
    quantite            NUMERIC(14,3) NOT NULL,
    quantite_recue      NUMERIC(14,3) DEFAULT 0,
    unite               VARCHAR(16),
    prix_unitaire_ht    NUMERIC(14,4) NOT NULL,
    taux_tva            NUMERIC(5,2) DEFAULT 19,
    montant_ht          NUMERIC(14,3) NOT NULL,
    montant_tva         NUMERIC(14,3) NOT NULL,
    montant_ttc         NUMERIC(14,3) NOT NULL,
    id_compte_achat     VARCHAR(20)                       -- 601/61/62
);
CREATE INDEX IF NOT EXISTS idx_bc_lignes_bc ON bc_lignes(id_bc);

CREATE TABLE IF NOT EXISTS receptions_fournisseur (
    id_reception        BIGSERIAL PRIMARY KEY,
    numero              VARCHAR(32) NOT NULL UNIQUE,     -- RCP-2026-00001
    id_bc               BIGINT REFERENCES bons_commande_achat(id_bc),
    id_fournisseur      BIGINT NOT NULL REFERENCES fournisseurs(id_fournisseur),
    date_reception      DATE NOT NULL DEFAULT CURRENT_DATE,
    numero_bl_fourn     VARCHAR(64),
    statut              VARCHAR(20) NOT NULL DEFAULT 'brouillon',
                        -- brouillon | validee | contestee | annulee
    id_entrepot         BIGINT,
    id_utilisateur      BIGINT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rcp_bc ON receptions_fournisseur(id_bc);

CREATE TABLE IF NOT EXISTS receptions_lignes (
    id_ligne            BIGSERIAL PRIMARY KEY,
    id_reception        BIGINT NOT NULL REFERENCES receptions_fournisseur(id_reception) ON DELETE CASCADE,
    id_ligne_bc         BIGINT REFERENCES bc_lignes(id_ligne),
    id_article          BIGINT,
    quantite_recue      NUMERIC(14,3) NOT NULL,
    quantite_conforme   NUMERIC(14,3),
    quantite_refusee    NUMERIC(14,3) DEFAULT 0,
    motif_refus         VARCHAR(255),
    id_lot              BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rcp_lignes_reception ON receptions_lignes(id_reception);

CREATE TABLE IF NOT EXISTS factures_fournisseur (
    id_facture_ff       BIGSERIAL PRIMARY KEY,
    numero_interne      VARCHAR(32) NOT NULL UNIQUE,     -- FF-2026-00001
    numero_fournisseur  VARCHAR(64),
    id_fournisseur      BIGINT NOT NULL REFERENCES fournisseurs(id_fournisseur),
    id_bc               BIGINT REFERENCES bons_commande_achat(id_bc),
    id_reception        BIGINT REFERENCES receptions_fournisseur(id_reception),
    date_facture        DATE NOT NULL,
    date_reception_fact DATE DEFAULT CURRENT_DATE,
    date_echeance       DATE,
    statut              VARCHAR(20) NOT NULL DEFAULT 'a_valider',
                        -- a_valider | validee | partiellement_payee | payee | en_retard | contestee | annulee
    montant_ht          NUMERIC(14,3) NOT NULL DEFAULT 0,
    montant_tva         NUMERIC(14,3) NOT NULL DEFAULT 0,
    timbre_fiscal       NUMERIC(6,3)  DEFAULT 1.000,
    montant_ttc         NUMERIC(14,3) NOT NULL DEFAULT 0,
    montant_paye        NUMERIC(14,3) NOT NULL DEFAULT 0,
    montant_restant     NUMERIC(14,3) NOT NULL DEFAULT 0,
    devise              CHAR(3) DEFAULT 'TND',
    id_ecriture_compta  BIGINT,
    fichier_pdf_url     TEXT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ff_fournisseur ON factures_fournisseur(id_fournisseur);
CREATE INDEX IF NOT EXISTS idx_ff_statut      ON factures_fournisseur(statut);
CREATE INDEX IF NOT EXISTS idx_ff_echeance    ON factures_fournisseur(date_echeance);

CREATE TABLE IF NOT EXISTS factures_fournisseur_lignes (
    id_ligne            BIGSERIAL PRIMARY KEY,
    id_facture_ff       BIGINT NOT NULL REFERENCES factures_fournisseur(id_facture_ff) ON DELETE CASCADE,
    id_article          BIGINT,
    designation         VARCHAR(255) NOT NULL,
    quantite            NUMERIC(14,3),
    prix_unitaire_ht    NUMERIC(14,4),
    taux_tva            NUMERIC(5,2) DEFAULT 19,
    montant_ht          NUMERIC(14,3) NOT NULL,
    montant_tva         NUMERIC(14,3) NOT NULL,
    montant_ttc         NUMERIC(14,3) NOT NULL,
    id_compte_achat     VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS paiements_fournisseur (
    id_paiement         BIGSERIAL PRIMARY KEY,
    numero              VARCHAR(32) UNIQUE,
    id_fournisseur      BIGINT NOT NULL REFERENCES fournisseurs(id_fournisseur),
    date_paiement       DATE NOT NULL DEFAULT CURRENT_DATE,
    montant             NUMERIC(14,3) NOT NULL,
    devise              CHAR(3) DEFAULT 'TND',
    mode_paiement       VARCHAR(20) NOT NULL,           -- especes | cheque | virement | traite
    reference           VARCHAR(64),
    id_banque           BIGINT,
    id_caisse           BIGINT,
    statut              VARCHAR(20) DEFAULT 'emis',
    id_ecriture_compta  BIGINT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_paiements_ff ON paiements_fournisseur(id_fournisseur);

CREATE TABLE IF NOT EXISTS factures_fournisseur_paiements (
    id_alloc            BIGSERIAL PRIMARY KEY,
    id_facture_ff       BIGINT NOT NULL REFERENCES factures_fournisseur(id_facture_ff) ON DELETE CASCADE,
    id_paiement         BIGINT NOT NULL REFERENCES paiements_fournisseur(id_paiement) ON DELETE CASCADE,
    montant_affecte     NUMERIC(14,3) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(id_facture_ff, id_paiement)
);

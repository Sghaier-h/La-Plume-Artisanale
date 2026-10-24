-- =====================================================================
-- Schéma v2 — Caisse (§10.4)
-- Seuils Tunisie : 50 DT (bloc), 500 DT (facture obligatoire Art.34 CGI),
-- 5000 DT (max espèces Loi 2018-52)
-- =====================================================================

CREATE TABLE IF NOT EXISTS caisses (
    id_caisse           BIGSERIAL PRIMARY KEY,
    code                VARCHAR(20) UNIQUE,
    libelle             VARCHAR(120) NOT NULL,
    id_societe          BIGINT,
    responsable         BIGINT,                          -- id utilisateur
    compte_compta       VARCHAR(20) DEFAULT '54',        -- caisse
    devise              CHAR(3) DEFAULT 'TND',
    solde_initial       NUMERIC(14,3) DEFAULT 0,
    solde_theorique     NUMERIC(14,3) NOT NULL DEFAULT 0,
    seuil_bloc_dt       NUMERIC(10,3) DEFAULT 50.000,
    seuil_facture_dt    NUMERIC(10,3) DEFAULT 500.000,
    seuil_max_dt        NUMERIC(10,3) DEFAULT 5000.000,
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fond_caisse_comptages (
    id_comptage         BIGSERIAL PRIMARY KEY,
    id_caisse           BIGINT NOT NULL REFERENCES caisses(id_caisse),
    date_comptage       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type_comptage       VARCHAR(20) NOT NULL,            -- ouverture | fermeture | controle
    solde_theorique     NUMERIC(14,3) NOT NULL,
    solde_physique      NUMERIC(14,3) NOT NULL,
    ecart               NUMERIC(14,3) GENERATED ALWAYS AS (solde_physique - solde_theorique) STORED,
    detail_billets      JSONB,                           -- {"50":10,"20":5,...}
    motif_ecart         TEXT,
    id_utilisateur      BIGINT,
    id_utilisateur_valide BIGINT,
    statut              VARCHAR(20) DEFAULT 'brouillon' -- brouillon | valide
);
CREATE INDEX IF NOT EXISTS idx_comptages_caisse ON fond_caisse_comptages(id_caisse);

CREATE TABLE IF NOT EXISTS mouvements_caisse (
    id_mouvement        BIGSERIAL PRIMARY KEY,
    id_caisse           BIGINT NOT NULL REFERENCES caisses(id_caisse),
    date_mouvement      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sens                VARCHAR(10) NOT NULL,            -- entree | sortie
    type_mouvement      VARCHAR(20) NOT NULL,            -- vente | paiement_client | paiement_ff | frais | virement | approvisionnement | retrait
    montant             NUMERIC(14,3) NOT NULL CHECK (montant > 0),
    devise              CHAR(3) DEFAULT 'TND',
    libelle             VARCHAR(255),
    reference           VARCHAR(64),
    source_type         VARCHAR(30),                     -- facture | paiement | depense
    source_id           BIGINT,
    id_ecriture_compta  BIGINT,                          -- NULL si dépense courante non comptabilisée
    seuil_franchi       VARCHAR(20),                     -- info: bloc50 | facture500 | max5000
    justificatif_url    TEXT,
    id_utilisateur      BIGINT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mvt_caisse ON mouvements_caisse(id_caisse);
CREATE INDEX IF NOT EXISTS idx_mvt_date   ON mouvements_caisse(date_mouvement);
CREATE INDEX IF NOT EXISTS idx_mvt_type   ON mouvements_caisse(type_mouvement);

-- Dépenses courantes en espèces (§9.9) — journal informel, écriture optionnelle
CREATE TABLE IF NOT EXISTS depenses_courantes_espece (
    id_depense          BIGSERIAL PRIMARY KEY,
    id_caisse           BIGINT REFERENCES caisses(id_caisse),
    date_depense        DATE NOT NULL DEFAULT CURRENT_DATE,
    categorie           VARCHAR(60) NOT NULL,            -- pourboire | cafe_ouvriers | depannage | divers
    montant             NUMERIC(10,3) NOT NULL,
    beneficiaire        VARCHAR(120),
    justificatif_url    TEXT,
    id_mouvement_caisse BIGINT REFERENCES mouvements_caisse(id_mouvement),
    id_ecriture_compta  BIGINT,                          -- NULL par défaut
    id_utilisateur      BIGINT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

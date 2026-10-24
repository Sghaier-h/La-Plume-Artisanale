-- =====================================================================
-- SCHEMA V2 — APPORT GÉRANT (§14quater.6) + ÉDITION ADMIN TRACÉE
--                (§14quater.8-9)
-- Fichier : 39_apport_gerant_et_admin.sql
-- Cible   : PostgreSQL 15
-- Idempotent : CREATE TABLE / INDEX IF NOT EXISTS
-- Prérequis : 01_core.sql (users), 21_compta_caisse.sql (caisses +
--             mouvements_caisse), 34_comptabilite_etendue.sql (type
--             'apport_gerant' sur caisses + colonnes type_mvt/mode_paiement
--             sur mouvements_caisse), 37_documents_archive.sql
--             (documents_archive pour pièces justificatives).
--
-- Préserve 100 % des tables Phase A : l'apport gérant alimente simplement
-- `mouvements_caisse` avec `type_mouvement='apport_gerant'`.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Comptes courants d'associés (CCA) — §14quater.6
--    Un enregistrement par gérant × société. Le solde reflète l'avoir
--    net du gérant envers la société : positif = la société lui doit,
--    négatif = il doit à la société.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comptes_courants_associes (
    id_cca            BIGSERIAL PRIMARY KEY,
    id_user_gerant    BIGINT NOT NULL,                         -- → users.id_user
    id_societe        BIGINT,                                  -- → societes.id_societe (nullable mono-société)
    libelle           VARCHAR(120),
    solde             NUMERIC(14,3) NOT NULL DEFAULT 0,        -- somme algébrique des mouvements
    actif             BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cca_gerant_societe UNIQUE (id_user_gerant, id_societe)
);

CREATE INDEX IF NOT EXISTS idx_cca_gerant   ON comptes_courants_associes(id_user_gerant);
CREATE INDEX IF NOT EXISTS idx_cca_societe  ON comptes_courants_associes(id_societe);
CREATE INDEX IF NOT EXISTS idx_cca_actif    ON comptes_courants_associes(actif);

-- ---------------------------------------------------------------------
-- 2. Mouvements d'apport / retrait sur le CCA — §14quater.6
--    'apport'  : le gérant injecte de l'argent dans une caisse → solde +
--    'retrait' : la société rembourse le gérant via une caisse  → solde -
--    `id_caisse_destination` est la caisse crédité (apport) ou débitée
--    (retrait). `id_document_archive` → pièce justificative (chèque scan,
--    reçu photo, etc. — table documents_archive §14quater Phase A).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS apports_gerant_mouvements (
    id_mvt_apport           BIGSERIAL PRIMARY KEY,
    id_cca                  BIGINT NOT NULL REFERENCES comptes_courants_associes(id_cca),
    montant                 NUMERIC(14,3) NOT NULL CHECK (montant > 0),
    type_mvt                VARCHAR(10) NOT NULL CHECK (type_mvt IN ('apport','retrait')),
    mode_paiement           VARCHAR(20) NOT NULL DEFAULT 'espece'
                               CHECK (mode_paiement IN ('espece','cheque','virement')),
    id_caisse_destination   BIGINT NOT NULL REFERENCES caisses(id_caisse),
    id_mouvement_caisse     BIGINT,                            -- → mouvements_caisse(id_mouvement) FK logique
    id_document_archive     BIGINT,                            -- → documents_archive(id_document) FK logique
    reference               VARCHAR(80),                       -- n° chèque, référence virement
    date_mouvement          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    libelle                 VARCHAR(255),
    notes                   TEXT,
    saisi_par               BIGINT,                            -- → users.id_user ADMIN
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apg_cca            ON apports_gerant_mouvements(id_cca);
CREATE INDEX IF NOT EXISTS idx_apg_caisse         ON apports_gerant_mouvements(id_caisse_destination);
CREATE INDEX IF NOT EXISTS idx_apg_type           ON apports_gerant_mouvements(type_mvt);
CREATE INDEX IF NOT EXISTS idx_apg_date           ON apports_gerant_mouvements(date_mouvement);
CREATE INDEX IF NOT EXISTS idx_apg_mvt_caisse     ON apports_gerant_mouvements(id_mouvement_caisse);
CREATE INDEX IF NOT EXISTS idx_apg_document       ON apports_gerant_mouvements(id_document_archive);
CREATE INDEX IF NOT EXISTS idx_apg_saisi_par      ON apports_gerant_mouvements(saisi_par);

-- ---------------------------------------------------------------------
-- 3. Historique édition ADMIN de documents validés — §14quater.8-9
--    Traçabilité intégrale (qui, quand, pourquoi, diff JSON avant/après,
--    IP) de toute modification faite par un ADMIN sur un devis / commande
--    / facture / avoir déjà sorti du statut 'brouillon'.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historique_editions_admin (
    id_edition        BIGSERIAL PRIMARY KEY,
    type_doc          VARCHAR(20) NOT NULL
                        CHECK (type_doc IN ('devis','commande','facture','avoir','bl')),
    id_doc            BIGINT NOT NULL,
    id_admin          BIGINT NOT NULL,                         -- → users.id_user
    date_edition      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    raison            TEXT NOT NULL,                           -- raison obligatoire saisie par l'admin
    avant_jsonb       JSONB NOT NULL,
    apres_jsonb       JSONB NOT NULL,
    diff_resume       TEXT,                                    -- optionnel : résumé lisible
    ip_address        VARCHAR(64),
    user_agent        VARCHAR(255),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hea_type_doc   ON historique_editions_admin(type_doc, id_doc);
CREATE INDEX IF NOT EXISTS idx_hea_admin      ON historique_editions_admin(id_admin);
CREATE INDEX IF NOT EXISTS idx_hea_date       ON historique_editions_admin(date_edition DESC);
CREATE INDEX IF NOT EXISTS idx_hea_diff_gin   ON historique_editions_admin USING GIN (apres_jsonb);

-- ---------------------------------------------------------------------
-- 4. Vue de synthèse CCA (solde recalculé en live par cohérence).
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_cca_soldes AS
  SELECT c.id_cca,
         c.id_user_gerant,
         c.id_societe,
         c.libelle,
         c.actif,
         COALESCE(SUM(CASE WHEN m.type_mvt='apport'  THEN m.montant ELSE 0 END),0)
       - COALESCE(SUM(CASE WHEN m.type_mvt='retrait' THEN m.montant ELSE 0 END),0)
           AS solde_calcule,
         c.solde           AS solde_stocke,
         COUNT(m.id_mvt_apport) AS nb_mouvements,
         MAX(m.date_mouvement)  AS dernier_mouvement
    FROM comptes_courants_associes c
    LEFT JOIN apports_gerant_mouvements m ON m.id_cca = c.id_cca
   GROUP BY c.id_cca;

-- ---------------------------------------------------------------------
-- Fin du script 39_apport_gerant_et_admin.sql
-- ---------------------------------------------------------------------

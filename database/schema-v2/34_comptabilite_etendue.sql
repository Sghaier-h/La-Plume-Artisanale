-- =====================================================================
-- SCHEMA V2 — COMPTABILITÉ ÉTENDUE (§14quater · Phase A)
-- Fichier : 34_comptabilite_etendue.sql
-- Cible   : PostgreSQL 15
-- Contrat : docs/domain.md §14quater (caisses multiples, dossiers import,
--           cessions intra-groupe, dépenses espèces en bloc, compensations
--           croisées, rapprochement bancaire automatisé).
-- Idempotent : CREATE TABLE IF NOT EXISTS + ALTER TABLE IF NOT EXISTS
-- Prérequis : 01_core.sql (users), 19_compta.sql, 21_compta_caisse.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Extensions de la table `caisses` existante (§14quater.1)
--    On ajoute type_caisse (classement fonctionnel), ordre d'affichage,
--    updated_at (audit). Les colonnes existantes code/libelle/solde_initial
--    sont conservées.
-- ---------------------------------------------------------------------
ALTER TABLE caisses
  ADD COLUMN IF NOT EXISTS type_caisse VARCHAR(30) NOT NULL DEFAULT 'custom'
    CHECK (type_caisse IN ('principale','cheques_clients','compensation',
                            'apport_gerant','showroom','custom')),
  ADD COLUMN IF NOT EXISTS ordre        INT NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_caisses_type   ON caisses(type_caisse);
CREATE INDEX IF NOT EXISTS idx_caisses_ordre  ON caisses(ordre);

-- ---------------------------------------------------------------------
-- 2. Routage automatique "mode de paiement → caisse par défaut"
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS routage_caisse_par_mode (
    id_routage          BIGSERIAL PRIMARY KEY,
    mode_paiement       VARCHAR(40) NOT NULL UNIQUE,     -- 'espece','cheque','virement','cb','mobile_money','traite','compensation'
    id_caisse_default   BIGINT NOT NULL REFERENCES caisses(id_caisse),
    libelle             VARCHAR(120),
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_routage_actif ON routage_caisse_par_mode(actif);

-- ---------------------------------------------------------------------
-- 3. Mouvements de caisse enrichis (§14quater.1)
--    La table `mouvements_caisse` existe déjà (21_compta_caisse.sql) : on
--    ajoute les colonnes attendues par la Phase A sans la dupliquer. Une
--    vue `caisses_mouvements` expose un alias plus parlant.
-- ---------------------------------------------------------------------
ALTER TABLE mouvements_caisse
  ADD COLUMN IF NOT EXISTS type_mvt       VARCHAR(20),          -- entree | sortie | transfert
  ADD COLUMN IF NOT EXISTS mode_paiement  VARCHAR(40),
  ADD COLUMN IF NOT EXISTS id_piece_liee  BIGINT,
  ADD COLUMN IF NOT EXISTS piece_type     VARCHAR(40),
  ADD COLUMN IF NOT EXISTS cree_par       BIGINT;

-- Normalise type_mvt depuis `sens` quand il est NULL
UPDATE mouvements_caisse
   SET type_mvt = CASE WHEN sens = 'entree' THEN 'entree' ELSE 'sortie' END
 WHERE type_mvt IS NULL;

CREATE INDEX IF NOT EXISTS idx_mvt_type_mvt     ON mouvements_caisse(type_mvt);
CREATE INDEX IF NOT EXISTS idx_mvt_mode         ON mouvements_caisse(mode_paiement);
CREATE INDEX IF NOT EXISTS idx_mvt_piece_liee   ON mouvements_caisse(piece_type, id_piece_liee);

CREATE OR REPLACE VIEW caisses_mouvements AS
  SELECT id_mouvement,
         id_caisse,
         date_mouvement,
         COALESCE(type_mvt, sens)                           AS type_mvt,
         montant,
         mode_paiement,
         libelle,
         id_piece_liee,
         piece_type,
         COALESCE(cree_par, id_utilisateur)                 AS cree_par,
         id_ecriture_compta,
         justificatif_url,
         created_at
    FROM mouvements_caisse;

-- ---------------------------------------------------------------------
-- 4. Dossiers d'import (§14quater.2)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dossiers_import (
    id_dossier              BIGSERIAL PRIMARY KEY,
    numero_dossier          VARCHAR(30) NOT NULL UNIQUE,       -- IMP-YYYY-SEQ:5
    date_ouverture          DATE NOT NULL DEFAULT CURRENT_DATE,
    pays_origine            VARCHAR(80) NOT NULL,
    fournisseur_etranger    VARCHAR(200) NOT NULL,
    nb_colis                INT,
    poids_total_kg          NUMERIC(12,3),
    incoterm                VARCHAR(10),                        -- 'FOB','CIF','DAP',...
    devise_etrangere        CHAR(3) DEFAULT 'EUR',
    taux_change             NUMERIC(14,6),
    cout_total_dt           NUMERIC(14,3) DEFAULT 0,
    statut                  VARCHAR(20) NOT NULL DEFAULT 'ouvert'
                            CHECK (statut IN ('ouvert','en_douane','arrive','liquide','ferme','annule')),
    numero_declaration_douane VARCHAR(60),
    date_dedouanement       DATE,
    notes                   TEXT,
    cree_par                BIGINT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dossier_statut   ON dossiers_import(statut);
CREATE INDEX IF NOT EXISTS idx_dossier_date     ON dossiers_import(date_ouverture);
CREATE INDEX IF NOT EXISTS idx_dossier_pays     ON dossiers_import(pays_origine);

CREATE TABLE IF NOT EXISTS dossiers_import_lignes (
    id_ligne                BIGSERIAL PRIMARY KEY,
    id_dossier              BIGINT NOT NULL REFERENCES dossiers_import(id_dossier) ON DELETE CASCADE,
    description_marchandise VARCHAR(255) NOT NULL,
    quantite                NUMERIC(14,3) NOT NULL,
    unite                   VARCHAR(20) DEFAULT 'kg',
    poids_kg                NUMERIC(12,3),
    prix_unitaire_devise    NUMERIC(14,6),
    montant_devise          NUMERIC(14,3),
    cout_prorata_kg         NUMERIC(12,6),                 -- recalculé après imputation des frais
    id_article              BIGINT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dim_ligne_dossier ON dossiers_import_lignes(id_dossier);

CREATE TABLE IF NOT EXISTS dossiers_import_frais (
    id_frais                BIGSERIAL PRIMARY KEY,
    id_dossier              BIGINT NOT NULL REFERENCES dossiers_import(id_dossier) ON DELETE CASCADE,
    type_frais              VARCHAR(30) NOT NULL
                            CHECK (type_frais IN ('fret','assurance','douane','taxe',
                                                  'transport_local','manutention','commission','autre')),
    libelle                 VARCHAR(255),
    montant_dt              NUMERIC(14,3) NOT NULL CHECK (montant_dt >= 0),
    repartition_prorata     BOOLEAN NOT NULL DEFAULT TRUE,   -- false = frais ciblé non ventilé
    date_frais              DATE DEFAULT CURRENT_DATE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dim_frais_dossier ON dossiers_import_frais(id_dossier);

-- ---------------------------------------------------------------------
-- 5. Cessions intra-groupe (§14quater.3)
--    LP (La Plume) → CAPSCOR, calculées à partir des coûts d'un dossier.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cessions_intragroupe (
    id_cession              BIGSERIAL PRIMARY KEY,
    cle_unique              VARCHAR(100) NOT NULL UNIQUE,       -- idempotence du calcul
    numero_cession          VARCHAR(30) UNIQUE,                 -- CES-YYYY-SEQ:5
    id_dossier_import       BIGINT REFERENCES dossiers_import(id_dossier),
    id_societe_cedante      BIGINT,
    id_societe_cessionnaire BIGINT,
    poids_kg                NUMERIC(14,3),
    cout_cession_dt         NUMERIC(14,3) NOT NULL,
    marge_pct               NUMERIC(6,3) DEFAULT 0,
    statut                  VARCHAR(20) NOT NULL DEFAULT 'calculee'
                            CHECK (statut IN ('calculee','vendue','facturee','soldee','annulee')),
    id_vente_lp             BIGINT,
    id_achat_capscor        BIGINT,
    id_dette                BIGINT,
    id_paiement             BIGINT,
    date_calcul             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_facturation        TIMESTAMPTZ,
    date_solde              TIMESTAMPTZ,
    date_annulation         TIMESTAMPTZ,
    cree_par                BIGINT,
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cession_dossier ON cessions_intragroupe(id_dossier_import);
CREATE INDEX IF NOT EXISTS idx_cession_statut  ON cessions_intragroupe(statut);

-- ---------------------------------------------------------------------
-- 6. Dépenses espèces courantes (§9.9) — extension pour comptabilisation en bloc
-- ---------------------------------------------------------------------
ALTER TABLE depenses_courantes_espece
  ADD COLUMN IF NOT EXISTS libelle           VARCHAR(255),
  ADD COLUMN IF NOT EXISTS cree_par          BIGINT,
  ADD COLUMN IF NOT EXISTS comptabilisee     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS id_ecriture_bloc  BIGINT,
  ADD COLUMN IF NOT EXISTS signature_svg     TEXT;              -- signature tactile si > 50 DT

CREATE INDEX IF NOT EXISTS idx_dce_periode ON depenses_courantes_espece(date_depense);
CREATE INDEX IF NOT EXISTS idx_dce_bloc    ON depenses_courantes_espece(id_ecriture_bloc);

CREATE TABLE IF NOT EXISTS depenses_bloc_comptabilise (
    id_bloc                 BIGSERIAL PRIMARY KEY,
    periode_mois            VARCHAR(7) NOT NULL,                -- '2026-10'
    montant_total           NUMERIC(14,3) NOT NULL,
    nb_depenses             INT NOT NULL DEFAULT 0,
    id_ecriture             BIGINT,                             -- référence écriture OD
    date_cloture            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cree_par                BIGINT,
    notes                   TEXT,
    UNIQUE (periode_mois)
);

-- ---------------------------------------------------------------------
-- 7. Compensations croisées (§14quater.4) — opérations équilibrées
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compensations_croisees (
    id_compensation         BIGSERIAL PRIMARY KEY,
    numero_compensation     VARCHAR(30) NOT NULL UNIQUE,        -- COMP-YYYY-SEQ:5
    date_compensation       DATE NOT NULL DEFAULT CURRENT_DATE,
    libelle                 VARCHAR(255) NOT NULL,
    montant_total           NUMERIC(14,3) NOT NULL CHECK (montant_total >= 0),
    statut                  VARCHAR(20) NOT NULL DEFAULT 'brouillon'
                            CHECK (statut IN ('brouillon','validee','annulee')),
    date_validation         TIMESTAMPTZ,
    date_annulation         TIMESTAMPTZ,
    cree_par                BIGINT,
    valide_par              BIGINT,
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comp_statut ON compensations_croisees(statut);
CREATE INDEX IF NOT EXISTS idx_comp_date   ON compensations_croisees(date_compensation);

CREATE TABLE IF NOT EXISTS compensations_lignes (
    id_ligne_comp           BIGSERIAL PRIMARY KEY,
    id_compensation         BIGINT NOT NULL REFERENCES compensations_croisees(id_compensation) ON DELETE CASCADE,
    sens                    VARCHAR(10) NOT NULL CHECK (sens IN ('debit','credit')),
    id_tiers                BIGINT,
    type_tiers              VARCHAR(20) NOT NULL CHECK (type_tiers IN ('client','fournisseur','employe','autre')),
    nom_tiers               VARCHAR(200),
    libelle                 VARCHAR(255),
    montant                 NUMERIC(14,3) NOT NULL CHECK (montant > 0),
    id_piece_liee           BIGINT,
    piece_type              VARCHAR(40),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cl_comp   ON compensations_lignes(id_compensation);
CREATE INDEX IF NOT EXISTS idx_cl_tiers  ON compensations_lignes(type_tiers, id_tiers);

-- Fonction + trigger : balance = 0 à chaque passage en 'validee'
CREATE OR REPLACE FUNCTION fn_check_compensation_balance() RETURNS TRIGGER AS $$
DECLARE
  v_debit  NUMERIC(14,3) := 0;
  v_credit NUMERIC(14,3) := 0;
BEGIN
  IF NEW.statut = 'validee' THEN
    SELECT COALESCE(SUM(CASE WHEN sens='debit'  THEN montant ELSE 0 END),0),
           COALESCE(SUM(CASE WHEN sens='credit' THEN montant ELSE 0 END),0)
      INTO v_debit, v_credit
      FROM compensations_lignes
     WHERE id_compensation = NEW.id_compensation;
    IF ABS(v_debit - v_credit) > 0.001 THEN
      RAISE EXCEPTION 'Compensation %: balance débit (%s) ≠ crédit (%s)',
        NEW.numero_compensation, v_debit, v_credit USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_comp_balance ON compensations_croisees;
CREATE TRIGGER trg_check_comp_balance
  BEFORE UPDATE OF statut ON compensations_croisees
  FOR EACH ROW EXECUTE FUNCTION fn_check_compensation_balance();

-- ---------------------------------------------------------------------
-- 8. Rapprochement bancaire — imports fichiers + lignes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rapprochement_bancaire_imports (
    id_import_bq            BIGSERIAL PRIMARY KEY,
    id_compte_bancaire      BIGINT,
    date_import             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fichier_source          VARCHAR(255) NOT NULL,
    format                  VARCHAR(10) NOT NULL CHECK (format IN ('ofx','csv','xlsx','pdf')),
    nb_lignes_total         INT NOT NULL DEFAULT 0,
    nb_lignes_rapprochees   INT NOT NULL DEFAULT 0,
    importe_par             BIGINT,
    notes                   TEXT
);
CREATE INDEX IF NOT EXISTS idx_rbi_compte ON rapprochement_bancaire_imports(id_compte_bancaire);

CREATE TABLE IF NOT EXISTS rapprochement_bancaire_lignes (
    id_ligne_bq             BIGSERIAL PRIMARY KEY,
    id_import_bq            BIGINT NOT NULL REFERENCES rapprochement_bancaire_imports(id_import_bq) ON DELETE CASCADE,
    date_valeur             DATE NOT NULL,
    libelle_bq              VARCHAR(500) NOT NULL,
    montant_debit           NUMERIC(14,3) DEFAULT 0,
    montant_credit          NUMERIC(14,3) DEFAULT 0,
    reference_bq            VARCHAR(120),
    matching_statut         VARCHAR(20) NOT NULL DEFAULT 'non_matche'
                            CHECK (matching_statut IN ('non_matche','suggere','rapproche','ignore')),
    id_mouvement_journal_matche BIGINT,                          -- écriture bancaire ERP
    score_matching          NUMERIC(5,2),                        -- 0..100
    date_rapprochement      TIMESTAMPTZ,
    rapproche_par           BIGINT,
    notes                   TEXT,
    CHECK (montant_debit >= 0 AND montant_credit >= 0)
);
CREATE INDEX IF NOT EXISTS idx_rbl_import ON rapprochement_bancaire_lignes(id_import_bq);
CREATE INDEX IF NOT EXISTS idx_rbl_statut ON rapprochement_bancaire_lignes(matching_statut);
CREATE INDEX IF NOT EXISTS idx_rbl_date   ON rapprochement_bancaire_lignes(date_valeur);

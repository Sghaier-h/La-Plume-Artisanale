-- =====================================================================
-- Phase B — Sous-traitants étendus par type d'activité
-- Réf. docs/domain.md §7.11 (bons sortie/retour persistants) + §14quater.3
-- Enrichit `sous_traitants` (schema 14_sous_traitance.sql) avec :
--   · type_activite (enum métier Tunisie textile)
--   · activités secondaires, tarification, conditions commerciales
--   · comptes courants ST + mouvements (créance / paiement / compensation)
--   · travaux (axe analytique commune aux 10 opérations)
--   · signatures tactiles SVG sur bons sortie/retour
--   · anomalies ST (filet de sécurité §14bis.4)
--
-- Les documents attachés (photos bon papier, scans, certificats) sont
-- liés via la table centrale `documents_archive` (schema 37, Phase A).
-- Ici on garde JUSTE les signatures SVG direct colonne (donnée métier).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Enum type_activite + ALTER sous_traitants
-- ---------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE st_type_activite_enum AS ENUM (
        'ourdissage','nouage','tissage','frange','couture','teinture',
        'broderie','personnalisation','finition','autre'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE st_unite_facturation_enum AS ENUM (
        'piece','metre','kg','heure','forfait'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enrichissement de la table sous_traitants
ALTER TABLE sous_traitants
    ADD COLUMN IF NOT EXISTS type_activite       st_type_activite_enum,
    ADD COLUMN IF NOT EXISTS activites_secondaires TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS tarif_unitaire      NUMERIC(14,3),
    ADD COLUMN IF NOT EXISTS unite_facturation   st_unite_facturation_enum DEFAULT 'piece',
    ADD COLUMN IF NOT EXISTS qualite_moyenne_pct NUMERIC(5,2),
    ADD COLUMN IF NOT EXISTS date_debut_relation DATE,
    ADD COLUMN IF NOT EXISTS date_fin_relation   DATE,
    ADD COLUMN IF NOT EXISTS siret_matricule_fiscal VARCHAR(80),
    ADD COLUMN IF NOT EXISTS rib_bancaire        VARCHAR(50),
    ADD COLUMN IF NOT EXISTS banque              VARCHAR(100),
    ADD COLUMN IF NOT EXISTS conditions_paiement TEXT,
    ADD COLUMN IF NOT EXISTS caisse_defaut_paiement BIGINT,
    ADD COLUMN IF NOT EXISTS identification      VARCHAR(100);

CREATE INDEX IF NOT EXISTS ix_st_type_activite ON sous_traitants(type_activite);
CREATE INDEX IF NOT EXISTS ix_st_date_debut    ON sous_traitants(date_debut_relation);

-- ---------------------------------------------------------------------
-- 2. Comptes courants sous-traitants (créance / paiement / solde)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comptes_sous_traitants (
    id_compte_st        BIGSERIAL PRIMARY KEY,
    id_soustraitant     BIGINT NOT NULL UNIQUE REFERENCES sous_traitants(id_soustraitant) ON DELETE CASCADE,
    solde_initial       NUMERIC(14,3) NOT NULL DEFAULT 0,
    solde_courant       NUMERIC(14,3) NOT NULL DEFAULT 0,
    devise              VARCHAR(5) NOT NULL DEFAULT 'TND',
    date_dernier_mouvement TIMESTAMPTZ,
    date_reset_solde    DATE,             -- ex: 01/10/2025 ancien compte frange §14quater.9
    inactif             BOOLEAN NOT NULL DEFAULT FALSE,
    notes               TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_cst_inactif ON comptes_sous_traitants(inactif);
CREATE INDEX IF NOT EXISTS ix_cst_dernier ON comptes_sous_traitants(date_dernier_mouvement);

-- ---------------------------------------------------------------------
-- 3. Mouvements comptes ST (créance → paiement → compensation)
-- ---------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE cst_type_mvt_enum AS ENUM (
        'creance','paiement','ajustement','compensation'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS comptes_sous_traitants_mouvements (
    id_mouvement_cst    BIGSERIAL PRIMARY KEY,
    id_compte_st        BIGINT NOT NULL REFERENCES comptes_sous_traitants(id_compte_st) ON DELETE CASCADE,
    date_mouvement      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type_mvt            cst_type_mvt_enum NOT NULL,
    montant             NUMERIC(14,3) NOT NULL,     -- + créance, − paiement, ± ajustement
    libelle             VARCHAR(300),
    id_travail          BIGINT,                      -- FK soft vers travaux_sous_traitants
    id_paiement         BIGINT,                      -- FK soft vers paiements compta
    reference_externe   VARCHAR(100),                -- n° bon, chèque, virement
    cree_par            BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_mcst_compte ON comptes_sous_traitants_mouvements(id_compte_st);
CREATE INDEX IF NOT EXISTS ix_mcst_date   ON comptes_sous_traitants_mouvements(date_mouvement);
CREATE INDEX IF NOT EXISTS ix_mcst_type   ON comptes_sous_traitants_mouvements(type_mvt);

-- ---------------------------------------------------------------------
-- 4. Travaux sous-traitants (axe analytique transverse aux 10 activités)
-- ---------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE st_travail_statut_enum AS ENUM (
        'en_cours','termine','valide','refuse','paye'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS travaux_sous_traitants (
    id_travail          BIGSERIAL PRIMARY KEY,
    id_soustraitant     BIGINT NOT NULL REFERENCES sous_traitants(id_soustraitant),
    type_activite       st_type_activite_enum NOT NULL,
    id_bon_sortie       BIGINT,                      -- FK soft vers of_sous_traitance
    id_bon_retour       BIGINT,                      -- FK soft vers of_sous_traitance (même ou autre)
    id_of_lie           BIGINT,                      -- FK soft vers ordres_fabrication
    date_debut          DATE,
    date_fin            DATE,
    quantite            NUMERIC(14,3) NOT NULL DEFAULT 0,
    unite               st_unite_facturation_enum NOT NULL DEFAULT 'piece',
    tarif_applique      NUMERIC(14,3),
    montant             NUMERIC(14,3),               -- = quantite * tarif_applique
    statut              st_travail_statut_enum NOT NULL DEFAULT 'en_cours',
    date_validation     TIMESTAMPTZ,
    valide_par          BIGINT,
    motif_refus         TEXT,
    date_paiement       TIMESTAMPTZ,
    reference_paiement  VARCHAR(100),
    notes               TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_tst_st     ON travaux_sous_traitants(id_soustraitant);
CREATE INDEX IF NOT EXISTS ix_tst_type   ON travaux_sous_traitants(type_activite);
CREATE INDEX IF NOT EXISTS ix_tst_statut ON travaux_sous_traitants(statut);
CREATE INDEX IF NOT EXISTS ix_tst_debut  ON travaux_sous_traitants(date_debut);
CREATE INDEX IF NOT EXISTS ix_tst_of     ON travaux_sous_traitants(id_of_lie);

-- ---------------------------------------------------------------------
-- 5. Enrichissement bons de sortie/retour (signatures SVG tactile)
--     Les 2 bons partagent la table `of_sous_traitance` (schema 14).
--     On ajoute signature SVG canvas (donnée métier), instructions,
--     date livraison prévue, contrôle qualité express retour.
-- ---------------------------------------------------------------------
ALTER TABLE of_sous_traitance
    ADD COLUMN IF NOT EXISTS signature_sortie_svg TEXT,
    ADD COLUMN IF NOT EXISTS signature_recepteur_svg TEXT,
    ADD COLUMN IF NOT EXISTS signature_retour_svg TEXT,
    ADD COLUMN IF NOT EXISTS date_livraison_prevue DATE,
    ADD COLUMN IF NOT EXISTS instructions_speciales TEXT,
    ADD COLUMN IF NOT EXISTS quantite_rejetee     NUMERIC(14,3) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS motif_rejet          TEXT,
    ADD COLUMN IF NOT EXISTS date_controle        TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS controle_par         BIGINT,
    ADD COLUMN IF NOT EXISTS controle_qualite     JSONB;
      -- JSONB forme : {defauts_couture, defauts_teinture, defauts_dimension, autre, photo_url}

-- ---------------------------------------------------------------------
-- 6. Anomalies sous-traitants (filet de sécurité §14bis.4)
-- ---------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE st_anomalie_gravite_enum AS ENUM (
        'info','a_corriger','critique','corrige_auto'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS anomalies_sous_traitant (
    id_anomalie         BIGSERIAL PRIMARY KEY,
    id_soustraitant     BIGINT NOT NULL REFERENCES sous_traitants(id_soustraitant) ON DELETE CASCADE,
    gravite             st_anomalie_gravite_enum NOT NULL DEFAULT 'a_corriger',
    type_anomalie       VARCHAR(120) NOT NULL,
    description         TEXT,
    numero_suivi        VARCHAR(60),
    id_of               BIGINT,
    date_anomalie       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    qte_sortie          NUMERIC(14,3),
    qte_retour          NUMERIC(14,3),
    detaille            TEXT,
    proposition         TEXT,
    resolu              BOOLEAN NOT NULL DEFAULT FALSE,
    resolu_par          BIGINT,
    date_resolution     TIMESTAMPTZ,
    commentaire_resolution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_ano_st       ON anomalies_sous_traitant(id_soustraitant);
CREATE INDEX IF NOT EXISTS ix_ano_resolu   ON anomalies_sous_traitant(resolu);
CREATE INDEX IF NOT EXISTS ix_ano_gravite  ON anomalies_sous_traitant(gravite);
CREATE INDEX IF NOT EXISTS ix_ano_date     ON anomalies_sous_traitant(date_anomalie);

-- ---------------------------------------------------------------------
-- 7. Vue agrégée pour dashboard — perf par type_activite
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_sous_traitants_par_type AS
SELECT
    st.type_activite,
    COUNT(DISTINCT st.id_soustraitant) FILTER (WHERE st.actif)        AS nb_actifs,
    COUNT(DISTINCT st.id_soustraitant) FILTER (WHERE NOT st.actif)    AS nb_inactifs,
    COALESCE(SUM(cst.solde_courant), 0)                                AS creances_total,
    AVG(st.qualite_moyenne_pct) FILTER (WHERE st.qualite_moyenne_pct IS NOT NULL) AS qualite_moyenne
FROM sous_traitants st
LEFT JOIN comptes_sous_traitants cst ON cst.id_soustraitant = st.id_soustraitant
GROUP BY st.type_activite;

-- ---------------------------------------------------------------------
-- 8. Trigger synchronisation solde_courant comptes_sous_traitants
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_cst_update_solde() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comptes_sous_traitants
           SET solde_courant = solde_courant + NEW.montant,
               date_dernier_mouvement = NEW.date_mouvement,
               updated_at = NOW()
         WHERE id_compte_st = NEW.id_compte_st;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comptes_sous_traitants
           SET solde_courant = solde_courant - OLD.montant,
               updated_at = NOW()
         WHERE id_compte_st = OLD.id_compte_st;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cst_update_solde ON comptes_sous_traitants_mouvements;
CREATE TRIGGER trg_cst_update_solde
AFTER INSERT OR DELETE ON comptes_sous_traitants_mouvements
FOR EACH ROW EXECUTE FUNCTION fn_cst_update_solde();

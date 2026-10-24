-- =====================================================================
-- SCHEMA V2 — PRIMES DE RENDEMENT HORS BULLETIN (§11bis.7bis domain.md)
-- Fichier : 30_primes_rendement.sql
-- Cible : PostgreSQL 15
-- Contrat : docs/domain.md §11bis.7bis (Prime hors bulletin + écrans TV atelier)
-- Idempotent : CREATE TABLE IF NOT EXISTS
-- Prérequis : 22_rh_effectif.sql (employes)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Cagnottes hebdomadaires par équipe/atelier (§11bis.7bis)
-- Enveloppe globale à répartir selon scores
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS primes_cagnottes_semaine (
    id_cagnotte              SERIAL PRIMARY KEY,
    annee                    INT NOT NULL,
    numero_semaine           INT NOT NULL CHECK (numero_semaine BETWEEN 1 AND 53),
    atelier                  VARCHAR(30) NOT NULL
                              CHECK (atelier IN ('tissage','ourdissage','coupe','finition','preparation','emballage','toutes')),
    montant_dt               NUMERIC(10,3) NOT NULL,
    total_scores_equipe      NUMERIC(10,3) NOT NULL DEFAULT 0,
    nb_employes_eligibles    INT NOT NULL DEFAULT 0,
    montant_reparti_dt       NUMERIC(10,3) NOT NULL DEFAULT 0,
    statut                   VARCHAR(20) NOT NULL DEFAULT 'ouverte'
                              CHECK (statut IN ('ouverte','calculee','validee','payee','annulee')),
    date_calcul              TIMESTAMPTZ,
    date_validation          TIMESTAMPTZ,
    date_paiement            TIMESTAMPTZ,
    valide_par               INT,
    paye_par                 INT,
    cree_par                 INT,
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (annee, numero_semaine, atelier)
);
CREATE INDEX IF NOT EXISTS idx_cagnotte_semaine ON primes_cagnottes_semaine(annee, numero_semaine);
CREATE INDEX IF NOT EXISTS idx_cagnotte_statut  ON primes_cagnottes_semaine(statut);

-- ---------------------------------------------------------------------
-- Scores journaliers par employé (§11bis.7bis — 5 critères pondérés)
-- Score = Q×0.30 + Qual×0.25 + Pres×0.15 + Abs×0.15 + Disc×0.15
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS primes_scores_journaliers (
    id_score                 SERIAL PRIMARY KEY,
    id_employe               INT NOT NULL,
    date_journee             DATE NOT NULL,
    atelier                  VARCHAR(30) NOT NULL,
    score_quantite           NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (score_quantite BETWEEN 0 AND 100),
    score_qualite            NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (score_qualite BETWEEN 0 AND 100),
    score_presence           NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (score_presence BETWEEN 0 AND 100),
    score_absences           NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (score_absences BETWEEN 0 AND 100),
    score_discipline         NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (score_discipline BETWEEN 0 AND 100),
    score_global             NUMERIC(6,3) GENERATED ALWAYS AS (
        (score_quantite  * 0.30) +
        (score_qualite   * 0.25) +
        (score_presence  * 0.15) +
        (score_absences  * 0.15) +
        (score_discipline* 0.15)
    ) STORED,
    metriques_json           JSONB,
    date_calcul              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_employe, date_journee)
);
CREATE INDEX IF NOT EXISTS idx_scores_employe    ON primes_scores_journaliers(id_employe);
CREATE INDEX IF NOT EXISTS idx_scores_date       ON primes_scores_journaliers(date_journee);
CREATE INDEX IF NOT EXISTS idx_scores_atelier    ON primes_scores_journaliers(atelier);
CREATE INDEX IF NOT EXISTS idx_scores_global     ON primes_scores_journaliers(score_global DESC);

-- ---------------------------------------------------------------------
-- Bordereaux hors bulletin (§11bis.7bis)
-- Un bordereau = un versement cash de prime, séparé du salaire
-- Compte comptable 648 (charge non-CNSS), IRPP séparé
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS primes_bordereaux_hors_bulletin (
    id_bordereau             SERIAL PRIMARY KEY,
    numero_bordereau         VARCHAR(30) NOT NULL UNIQUE,
    id_cagnotte              INT NOT NULL REFERENCES primes_cagnottes_semaine(id_cagnotte),
    id_employe               INT NOT NULL,
    score_total_semaine      NUMERIC(8,3) NOT NULL,
    montant_dt               NUMERIC(10,3) NOT NULL,
    montant_irpp_dt          NUMERIC(10,3) NOT NULL DEFAULT 0,
    montant_net_dt           NUMERIC(10,3) GENERATED ALWAYS AS (montant_dt - montant_irpp_dt) STORED,
    mode_versement           VARCHAR(20) NOT NULL DEFAULT 'especes'
                              CHECK (mode_versement IN ('especes','virement','cheque')),
    compte_comptable         VARCHAR(10) NOT NULL DEFAULT '648',
    id_ecriture_comptable    INT,
    statut                   VARCHAR(20) NOT NULL DEFAULT 'a_verser'
                              CHECK (statut IN ('a_verser','verse','annule')),
    date_versement           DATE,
    verse_par                INT,
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bordereau_cagnotte  ON primes_bordereaux_hors_bulletin(id_cagnotte);
CREATE INDEX IF NOT EXISTS idx_bordereau_employe   ON primes_bordereaux_hors_bulletin(id_employe);
CREATE INDEX IF NOT EXISTS idx_bordereau_statut    ON primes_bordereaux_hors_bulletin(statut);
CREATE INDEX IF NOT EXISTS idx_bordereau_date_vers ON primes_bordereaux_hors_bulletin(date_versement);

-- ---------------------------------------------------------------------
-- Reçus signés (traçabilité versements espèces)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS primes_recus_signes (
    id_recu                  SERIAL PRIMARY KEY,
    id_bordereau             INT NOT NULL REFERENCES primes_bordereaux_hors_bulletin(id_bordereau) ON DELETE CASCADE,
    signature_url            VARCHAR(500),
    signature_type           VARCHAR(20)
                              CHECK (signature_type IN ('manuscrite_scan','electronique','biometrique','empreinte')),
    photo_remise_url         VARCHAR(500),
    ip_capture               INET,
    date_signature           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    remis_par                INT NOT NULL,
    temoin                   INT,
    UNIQUE (id_bordereau)
);
CREATE INDEX IF NOT EXISTS idx_recu_bordereau ON primes_recus_signes(id_bordereau);

-- ---------------------------------------------------------------------
-- Configuration écrans TV atelier (§11bis.7bis)
-- 2 écrans muraux 55" : Atelier Tissage + Atelier Finition/Préparation
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tv_atelier_config (
    id_ecran                 SERIAL PRIMARY KEY,
    code                     VARCHAR(30) NOT NULL UNIQUE,
    libelle                  VARCHAR(120) NOT NULL,
    atelier                  VARCHAR(30) NOT NULL
                              CHECK (atelier IN ('tissage','finition','preparation','ourdissage','coupe','emballage')),
    resolution               VARCHAR(20) DEFAULT '1920x1080',
    orientation              VARCHAR(20) DEFAULT 'horizontale' CHECK (orientation IN ('horizontale','verticale')),
    refresh_seconds          INT NOT NULL DEFAULT 30,
    widgets_json             JSONB NOT NULL DEFAULT '["horloge","top5","kpi_journee","kpi_semaine","barre_horaire","perte_dechet","2eme_choix"]'::jsonb,
    theme                    VARCHAR(20) NOT NULL DEFAULT 'dark',
    url_token                VARCHAR(60) NOT NULL UNIQUE,
    ip_tv                    INET,
    derniere_connexion       TIMESTAMPTZ,
    actif                    BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tv_atelier_atelier ON tv_atelier_config(atelier);
CREATE INDEX IF NOT EXISTS idx_tv_atelier_actif   ON tv_atelier_config(actif);

-- ---------------------------------------------------------------------
-- Snapshot temps réel TV (matérialisée refresh 30 s)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tv_atelier_snapshots (
    id_snapshot              SERIAL PRIMARY KEY,
    id_ecran                 INT NOT NULL REFERENCES tv_atelier_config(id_ecran) ON DELETE CASCADE,
    date_snapshot            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    horaire_ideal_pct        NUMERIC(6,3),
    horaire_reel_pct         NUMERIC(6,3),
    top5_json                JSONB,
    perte_dechet_kg          NUMERIC(10,3),
    perte_dechet_dt          NUMERIC(10,3),
    nb_2eme_choix            INT NOT NULL DEFAULT 0,
    nb_1er_choix             INT NOT NULL DEFAULT 0,
    kpi_json                 JSONB
);
CREATE INDEX IF NOT EXISTS idx_tv_snap_ecran ON tv_atelier_snapshots(id_ecran);
CREATE INDEX IF NOT EXISTS idx_tv_snap_date  ON tv_atelier_snapshots(date_snapshot DESC);

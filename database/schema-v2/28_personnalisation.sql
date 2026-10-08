-- =====================================================================
-- SCHEMA V2 — PERSONNALISATION & CONFIGURATEUR PRODUIT (§5.8 domain.md)
-- Fichier : 28_personnalisation.sql
-- Cible : PostgreSQL 15
-- Contrat : docs/domain.md §5.8 (Personnalisation) + §5.8.8 (UX Tostadora)
-- Idempotent : CREATE TABLE IF NOT EXISTS
-- Prérequis : 05_produits.sql (modeles, articles), 15_ventes_devis_cmd.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- Zones d'impression / broderie disponibles (référentiel)
-- 5 emplacements standard (§5.8.8) + extensions expertes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS personnalisation_zones (
    id_zone              SERIAL PRIMARY KEY,
    code                 VARCHAR(50)  NOT NULL UNIQUE,
    libelle              VARCHAR(150) NOT NULL,
    position_defaut_cm   JSONB,
    ordre_affichage      INT NOT NULL DEFAULT 0,
    surface_max_cm2      NUMERIC(8,2),
    actif                BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- Polices disponibles broderie (référentiel)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS personnalisation_polices (
    id_police            SERIAL PRIMARY KEY,
    code                 VARCHAR(50)  NOT NULL UNIQUE,
    nom_affichage        VARCHAR(150) NOT NULL,
    famille              VARCHAR(50)  NOT NULL DEFAULT 'sans_serif'
                          CHECK (famille IN ('serif','sans_serif','script','manuscrit','monospace')),
    supplement_dt        NUMERIC(6,3) NOT NULL DEFAULT 0,
    actif                BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- Couleurs fils Madeira/Isacord disponibles (référentiel broderie)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS personnalisation_fils_couleurs (
    id_fil               SERIAL PRIMARY KEY,
    marque               VARCHAR(30)  NOT NULL DEFAULT 'Madeira'
                          CHECK (marque IN ('Madeira','Isacord','Amann','Coats')),
    reference            VARCHAR(30)  NOT NULL,
    hex_color            VARCHAR(7)   NOT NULL,
    libelle              VARCHAR(120),
    stock_bobines        INT NOT NULL DEFAULT 0,
    actif                BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (marque, reference)
);

-- ---------------------------------------------------------------------
-- Configuration de personnalisation par article ou modèle (§5.8.2)
-- Une ligne active la personnalisation pour un scope produit
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS personnalisations_config (
    id_config                    SERIAL PRIMARY KEY,
    id_article                   INT REFERENCES articles(id_article) ON DELETE CASCADE,
    id_modele                    INT REFERENCES modeles(id_modele)   ON DELETE CASCADE,
    types_autorises              JSONB NOT NULL DEFAULT '["broderie"]'::jsonb,
    moq_par_type_json            JSONB NOT NULL DEFAULT '{"broderie":20,"serigraphie":50,"rayures_personnalisees":12,"couleurs_personnalisees":12,"dimensions_custom":20,"pack_compose":6}'::jsonb,
    zones_impression_json        JSONB NOT NULL DEFAULT '["coin_haut_gauche","coin_haut_droit","centre","coin_bas_gauche","coin_bas_droit"]'::jsonb,
    surfaces_max_cm2_json        JSONB,
    couleurs_disponibles_json    JSONB,
    polices_disponibles_json     JSONB,
    supplements_prix_json        JSONB NOT NULL DEFAULT '{}'::jsonb,
    delai_supplementaire_jours   INT   NOT NULL DEFAULT 5,
    prix_degressifs_json         JSONB,
    actif                        BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cree_par                     INT,
    modifie_par                  INT,
    CHECK ( (id_article IS NOT NULL) OR (id_modele IS NOT NULL) )
);
CREATE INDEX IF NOT EXISTS idx_pers_config_article ON personnalisations_config(id_article);
CREATE INDEX IF NOT EXISTS idx_pers_config_modele  ON personnalisations_config(id_modele);
CREATE INDEX IF NOT EXISTS idx_pers_config_actif   ON personnalisations_config(actif);

-- ---------------------------------------------------------------------
-- Choix client par ligne de devis/commande (§5.8.3)
-- Une ligne = une personnalisation appliquée à une ligne document
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS commandes_personnalisations (
    id_pers                  SERIAL PRIMARY KEY,
    id_ligne_devis           INT,
    id_ligne_commande        INT,
    type_personnalisation    VARCHAR(40) NOT NULL
                              CHECK (type_personnalisation IN (
                                'broderie','serigraphie','rayures_personnalisees',
                                'couleurs_personnalisees','dimensions_custom','pack_compose')),
    parametres_json          JSONB NOT NULL,
    preview_image_url        VARCHAR(500),
    fichier_source_url       VARCHAR(500),
    supplement_ht            NUMERIC(10,3) NOT NULL DEFAULT 0,
    moq_applique             INT NOT NULL,
    delai_ajoute_jours       INT NOT NULL DEFAULT 0,
    validee_par_client       BOOLEAN NOT NULL DEFAULT FALSE,
    date_validation_client   TIMESTAMPTZ,
    validee_par_commercial   BOOLEAN NOT NULL DEFAULT FALSE,
    date_validation_com      TIMESTAMPTZ,
    id_commercial            INT,
    specs_atelier_json       JSONB,
    fichier_dst_url          VARCHAR(500),
    fichier_films_urls       JSONB,
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK ( (id_ligne_devis IS NOT NULL) OR (id_ligne_commande IS NOT NULL) )
);
CREATE INDEX IF NOT EXISTS idx_cmd_pers_devis        ON commandes_personnalisations(id_ligne_devis);
CREATE INDEX IF NOT EXISTS idx_cmd_pers_commande     ON commandes_personnalisations(id_ligne_commande);
CREATE INDEX IF NOT EXISTS idx_cmd_pers_type         ON commandes_personnalisations(type_personnalisation);
CREATE INDEX IF NOT EXISTS idx_cmd_pers_val_client   ON commandes_personnalisations(validee_par_client);
CREATE INDEX IF NOT EXISTS idx_cmd_pers_val_commerc  ON commandes_personnalisations(validee_par_commercial);

-- ---------------------------------------------------------------------
-- Sauvegarde des designs partagés (URL courte "Partager mon design")
-- §5.8.8 : bouton partage Instagram/WhatsApp
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS personnalisations_partages (
    id_partage           SERIAL PRIMARY KEY,
    code_court           VARCHAR(12)  NOT NULL UNIQUE,
    id_config            INT REFERENCES personnalisations_config(id_config) ON DELETE SET NULL,
    parametres_snapshot  JSONB NOT NULL,
    preview_url          VARCHAR(500),
    canal_partage        VARCHAR(30)
                          CHECK (canal_partage IN ('whatsapp','instagram','facebook','email','sms','copy_link')),
    nb_vues              INT NOT NULL DEFAULT 0,
    nb_conversions_panier INT NOT NULL DEFAULT 0,
    ip_createur          INET,
    date_creation        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_expiration      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days')
);
CREATE INDEX IF NOT EXISTS idx_pers_partages_code ON personnalisations_partages(code_court);
CREATE INDEX IF NOT EXISTS idx_pers_partages_exp  ON personnalisations_partages(date_expiration);

-- ---------------------------------------------------------------------
-- Trigger auto-maj date_modification
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_pers_config_maj_date() RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pers_config_maj ON personnalisations_config;
CREATE TRIGGER trg_pers_config_maj
    BEFORE UPDATE ON personnalisations_config
    FOR EACH ROW EXECUTE FUNCTION set_pers_config_maj_date();

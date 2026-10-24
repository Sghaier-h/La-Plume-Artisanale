-- =====================================================================
-- SCHEMA V2 — E-COMMERCE B2B + B2C (§11quinquies domain.md)
-- Fichier : 29_ecommerce.sql
-- Cible : PostgreSQL 15
-- Contrat : docs/domain.md §11quinquies (vrais canaux vente, pas vitrines)
--           + §11quinquies.1bis (spécificités B2B : KYC, MOQ, remises volume)
-- Idempotent : CREATE TABLE IF NOT EXISTS
-- Prérequis : 03_crm.sql (comptes), 05_produits.sql (articles)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Sites e-commerce (multi-sites : Shopify, WooCommerce, custom Next.js)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sites_ecommerce (
    id_site                  SERIAL PRIMARY KEY,
    code                     VARCHAR(30)  NOT NULL UNIQUE,
    nom                      VARCHAR(200) NOT NULL,
    canal                    VARCHAR(20)  NOT NULL
                              CHECK (canal IN ('B2B','B2C','personnalisation')),
    plateforme               VARCHAR(30)  NOT NULL
                              CHECK (plateforme IN ('shopify','woocommerce','custom_nextjs','custom_php','prestashop','magento')),
    url_base                 VARCHAR(255) NOT NULL,
    api_endpoint             VARCHAR(255),
    api_key_encrypted        TEXT,
    api_secret_encrypted     TEXT,
    webhook_secret_hmac      TEXT,
    devise                   VARCHAR(3)   NOT NULL DEFAULT 'TND',
    langue_defaut            VARCHAR(5)   NOT NULL DEFAULT 'fr',
    langues_supportees       JSONB NOT NULL DEFAULT '["fr","en","ar"]'::jsonb,
    catalogue_ids_json       JSONB,
    id_entrepot_par_defaut   INT,
    stripe_account_id        VARCHAR(60),
    konnect_wallet_id        VARCHAR(60),
    actif                    BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sites_ec_canal      ON sites_ecommerce(canal);
CREATE INDEX IF NOT EXISTS idx_sites_ec_plateforme ON sites_ecommerce(plateforme);
CREATE INDEX IF NOT EXISTS idx_sites_ec_actif      ON sites_ecommerce(actif);

-- ---------------------------------------------------------------------
-- Comptes B2B avec KYC (§11quinquies.1bis)
-- Extension de comptes CRM avec vérification RC/MF/CIN
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comptes_b2b_web (
    id_compte_b2b            SERIAL PRIMARY KEY,
    id_compte                INT NOT NULL REFERENCES comptes(id_compte) ON DELETE CASCADE,
    id_site                  INT NOT NULL REFERENCES sites_ecommerce(id_site) ON DELETE CASCADE,
    email_login              VARCHAR(255) NOT NULL,
    mot_de_passe_hash        VARCHAR(255),
    kyc_statut               VARCHAR(30)  NOT NULL DEFAULT 'en_attente'
                              CHECK (kyc_statut IN ('en_attente','en_verification','valide','refuse','suspendu')),
    kyc_rc_url               VARCHAR(500),
    kyc_mf_url               VARCHAR(500),
    kyc_cin_url              VARCHAR(500),
    kyc_verifie_par          INT,
    kyc_date_verification    TIMESTAMPTZ,
    kyc_motif_refus          TEXT,
    delai_paiement_jours     INT NOT NULL DEFAULT 30
                              CHECK (delai_paiement_jours IN (0,30,45,60,90)),
    fin_de_mois              BOOLEAN NOT NULL DEFAULT FALSE,
    plafond_credit_ht        NUMERIC(12,3) NOT NULL DEFAULT 0,
    encours_ht               NUMERIC(12,3) NOT NULL DEFAULT 0,
    remise_supplementaire_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
    id_grille_tarif          INT,
    derniere_connexion       TIMESTAMPTZ,
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_site, email_login)
);
CREATE INDEX IF NOT EXISTS idx_b2b_compte    ON comptes_b2b_web(id_compte);
CREATE INDEX IF NOT EXISTS idx_b2b_site      ON comptes_b2b_web(id_site);
CREATE INDEX IF NOT EXISTS idx_b2b_kyc       ON comptes_b2b_web(kyc_statut);
CREATE INDEX IF NOT EXISTS idx_b2b_email     ON comptes_b2b_web(email_login);

-- ---------------------------------------------------------------------
-- MOQ B2B par article (§11quinquies.1bis)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS articles_moq_b2b (
    id_moq               SERIAL PRIMARY KEY,
    id_article           INT NOT NULL REFERENCES articles(id_article) ON DELETE CASCADE,
    id_site              INT REFERENCES sites_ecommerce(id_site) ON DELETE CASCADE,
    moq_pieces           INT NOT NULL DEFAULT 20,
    pas_multiple         INT NOT NULL DEFAULT 1,
    date_creation        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_article, id_site)
);
CREATE INDEX IF NOT EXISTS idx_moq_article ON articles_moq_b2b(id_article);
CREATE INDEX IF NOT EXISTS idx_moq_site    ON articles_moq_b2b(id_site);

-- ---------------------------------------------------------------------
-- Remises volume dégressives B2B (§11quinquies.1bis)
-- Ex : à partir de 200 pcs = -5 %, à partir de 500 pcs = -10 %
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS remises_volume_b2b (
    id_remise            SERIAL PRIMARY KEY,
    id_article           INT REFERENCES articles(id_article) ON DELETE CASCADE,
    id_modele            INT REFERENCES modeles(id_modele) ON DELETE CASCADE,
    id_famille           INT,
    id_site              INT REFERENCES sites_ecommerce(id_site) ON DELETE CASCADE,
    palier_qte           INT NOT NULL,
    remise_pct           NUMERIC(5,2) NOT NULL,
    prix_unitaire_ht     NUMERIC(10,3),
    actif                BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK ( (id_article IS NOT NULL) OR (id_modele IS NOT NULL) OR (id_famille IS NOT NULL) )
);
CREATE INDEX IF NOT EXISTS idx_remises_art  ON remises_volume_b2b(id_article);
CREATE INDEX IF NOT EXISTS idx_remises_mod  ON remises_volume_b2b(id_modele);
CREATE INDEX IF NOT EXISTS idx_remises_site ON remises_volume_b2b(id_site);

-- ---------------------------------------------------------------------
-- Commandes web reçues (§11quinquies.4)
-- Import via webhook Shopify/WooCommerce → conversion en commande ERP
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS commandes_web (
    id_commande_web          SERIAL PRIMARY KEY,
    id_site                  INT NOT NULL REFERENCES sites_ecommerce(id_site),
    reference_externe        VARCHAR(60) NOT NULL,
    canal                    VARCHAR(20) NOT NULL CHECK (canal IN ('B2B','B2C','personnalisation')),
    id_compte                INT REFERENCES comptes(id_compte),
    id_compte_b2b            INT REFERENCES comptes_b2b_web(id_compte_b2b),
    email_client             VARCHAR(255),
    telephone_client         VARCHAR(30),
    payload_json             JSONB NOT NULL,
    total_ttc                NUMERIC(12,3) NOT NULL,
    devise                   VARCHAR(3)    NOT NULL DEFAULT 'TND',
    statut_web               VARCHAR(30)   NOT NULL DEFAULT 'reçue'
                              CHECK (statut_web IN ('reçue','en_traitement','importee','erreur','ignoree','remboursee')),
    id_commande_erp          INT,
    id_devis_erp             INT,
    erreur_import            TEXT,
    hash_hmac                VARCHAR(128),
    ip_source                INET,
    date_commande_web        TIMESTAMPTZ NOT NULL,
    date_reception           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_import_erp          TIMESTAMPTZ,
    UNIQUE (id_site, reference_externe)
);
CREATE INDEX IF NOT EXISTS idx_cmdweb_site     ON commandes_web(id_site);
CREATE INDEX IF NOT EXISTS idx_cmdweb_canal    ON commandes_web(canal);
CREATE INDEX IF NOT EXISTS idx_cmdweb_statut   ON commandes_web(statut_web);
CREATE INDEX IF NOT EXISTS idx_cmdweb_email    ON commandes_web(email_client);
CREATE INDEX IF NOT EXISTS idx_cmdweb_date     ON commandes_web(date_commande_web);

-- ---------------------------------------------------------------------
-- Sync produits ERP → sites (§11quinquies.3)
-- Journal des synchronisations pour audit
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ecommerce_sync_log (
    id_sync              SERIAL PRIMARY KEY,
    id_site              INT NOT NULL REFERENCES sites_ecommerce(id_site) ON DELETE CASCADE,
    type_sync            VARCHAR(30) NOT NULL
                          CHECK (type_sync IN ('produit_create','produit_update','stock_update','prix_update','delete','batch')),
    id_article           INT REFERENCES articles(id_article),
    reference_externe    VARCHAR(60),
    payload_envoye_json  JSONB,
    reponse_recue_json   JSONB,
    statut               VARCHAR(20) NOT NULL DEFAULT 'ok'
                          CHECK (statut IN ('ok','erreur','partiel','ignore','retry')),
    erreur_message       TEXT,
    duree_ms             INT,
    date_sync            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_syncec_site   ON ecommerce_sync_log(id_site);
CREATE INDEX IF NOT EXISTS idx_syncec_type   ON ecommerce_sync_log(type_sync);
CREATE INDEX IF NOT EXISTS idx_syncec_statut ON ecommerce_sync_log(statut);
CREATE INDEX IF NOT EXISTS idx_syncec_date   ON ecommerce_sync_log(date_sync);

-- ---------------------------------------------------------------------
-- Codes promo web (§11quinquies.8)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS codes_promo_web (
    id_promo             SERIAL PRIMARY KEY,
    id_site              INT REFERENCES sites_ecommerce(id_site) ON DELETE CASCADE,
    code                 VARCHAR(30)  NOT NULL,
    type_remise          VARCHAR(20)  NOT NULL
                          CHECK (type_remise IN ('pct','montant','livraison_gratuite','produit_offert')),
    valeur               NUMERIC(10,3) NOT NULL,
    montant_min_commande NUMERIC(10,3),
    canal_cible          VARCHAR(20)
                          CHECK (canal_cible IN ('B2B','B2C','tous')),
    usage_max_total      INT,
    usage_max_client     INT DEFAULT 1,
    usage_courant        INT NOT NULL DEFAULT 0,
    date_debut           TIMESTAMPTZ NOT NULL,
    date_fin             TIMESTAMPTZ,
    actif                BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (id_site, code)
);
CREATE INDEX IF NOT EXISTS idx_promo_site  ON codes_promo_web(id_site);
CREATE INDEX IF NOT EXISTS idx_promo_actif ON codes_promo_web(actif);

-- =====================================================================
-- SCHEMA V2 — PUBLICITÉ DIGITALE (§11quinquies.9 domain.md)
-- Fichier : 31_publicite_digitale.sql
-- Cible : PostgreSQL 15
-- Contrat : docs/domain.md §11quinquies.9 (Meta / Google / TikTok / Instagram)
-- Idempotent : CREATE TABLE IF NOT EXISTS
-- Prérequis : 29_ecommerce.sql (sites_ecommerce)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Comptes publicitaires externes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comptes_pub_externes (
    id_compte_pub            SERIAL PRIMARY KEY,
    plateforme               VARCHAR(30) NOT NULL
                              CHECK (plateforme IN ('meta_ads','google_ads','tiktok_ads','instagram_ads','linkedin_ads','snapchat_ads','x_ads')),
    account_id_externe       VARCHAR(100) NOT NULL,
    account_name             VARCHAR(200),
    devise                   VARCHAR(3) NOT NULL DEFAULT 'EUR',
    access_token_encrypted   TEXT,
    refresh_token_encrypted  TEXT,
    date_expiration_token    TIMESTAMPTZ,
    fuseau_horaire           VARCHAR(50) DEFAULT 'Africa/Tunis',
    id_site                  INT REFERENCES sites_ecommerce(id_site) ON DELETE SET NULL,
    actif                    BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (plateforme, account_id_externe)
);
CREATE INDEX IF NOT EXISTS idx_compte_pub_plat ON comptes_pub_externes(plateforme);
CREATE INDEX IF NOT EXISTS idx_compte_pub_site ON comptes_pub_externes(id_site);

-- ---------------------------------------------------------------------
-- Campagnes publicitaires
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campagnes_pub (
    id_campagne              SERIAL PRIMARY KEY,
    id_compte_pub            INT NOT NULL REFERENCES comptes_pub_externes(id_compte_pub) ON DELETE CASCADE,
    campagne_id_externe      VARCHAR(100),
    nom                      VARCHAR(255) NOT NULL,
    objectif                 VARCHAR(40) NOT NULL
                              CHECK (objectif IN ('trafic','conversions','notoriete','engagement','ventes_catalogue','leads','video_views','app_installs')),
    canal_cible              VARCHAR(20)
                              CHECK (canal_cible IN ('B2B','B2C','personnalisation','tous')),
    budget_total             NUMERIC(10,2),
    budget_quotidien         NUMERIC(10,2),
    devise                   VARCHAR(3) NOT NULL DEFAULT 'EUR',
    date_debut               DATE NOT NULL,
    date_fin                 DATE,
    ciblage_json             JSONB,
    statut                   VARCHAR(20) NOT NULL DEFAULT 'brouillon'
                              CHECK (statut IN ('brouillon','active','en_pause','terminee','archivee','en_revision')),
    id_utilisateur_gestion   INT,
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_campagne_compte ON campagnes_pub(id_compte_pub);
CREATE INDEX IF NOT EXISTS idx_campagne_statut ON campagnes_pub(statut);
CREATE INDEX IF NOT EXISTS idx_campagne_dates  ON campagnes_pub(date_debut, date_fin);

-- ---------------------------------------------------------------------
-- Créatives (visuels, vidéos, textes)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS creatives_pub (
    id_creative              SERIAL PRIMARY KEY,
    id_campagne              INT NOT NULL REFERENCES campagnes_pub(id_campagne) ON DELETE CASCADE,
    type_creative            VARCHAR(30) NOT NULL
                              CHECK (type_creative IN ('image','video','carousel','story','reel','collection','texte_pur')),
    titre                    VARCHAR(255),
    description              TEXT,
    call_to_action           VARCHAR(50),
    url_destination          VARCHAR(500),
    fichier_url              VARCHAR(500),
    fichier_thumbnail_url    VARCHAR(500),
    format_ratio             VARCHAR(20),
    duree_secondes           INT,
    langue                   VARCHAR(5) DEFAULT 'fr',
    utm_params               JSONB,
    statut                   VARCHAR(20) NOT NULL DEFAULT 'active'
                              CHECK (statut IN ('active','en_pause','rejetee','en_revision','archivee')),
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_creative_campagne ON creatives_pub(id_campagne);
CREATE INDEX IF NOT EXISTS idx_creative_statut   ON creatives_pub(statut);

-- ---------------------------------------------------------------------
-- Pixels de tracking installés sur les sites
-- Meta Pixel, GA4, Google Ads, TikTok Pixel
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pixels_tracking (
    id_pixel                 SERIAL PRIMARY KEY,
    id_site                  INT NOT NULL REFERENCES sites_ecommerce(id_site) ON DELETE CASCADE,
    plateforme               VARCHAR(30) NOT NULL
                              CHECK (plateforme IN ('meta_pixel','google_analytics4','google_ads','tiktok_pixel','linkedin_insight','snap_pixel','hotjar','clarity')),
    pixel_id                 VARCHAR(100) NOT NULL,
    conversion_api_token     TEXT,
    events_config_json       JSONB NOT NULL DEFAULT '["page_view","add_to_cart","initiate_checkout","purchase"]'::jsonb,
    actif                    BOOLEAN NOT NULL DEFAULT TRUE,
    date_installation        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_site, plateforme, pixel_id)
);
CREATE INDEX IF NOT EXISTS idx_pixel_site      ON pixels_tracking(id_site);
CREATE INDEX IF NOT EXISTS idx_pixel_plat      ON pixels_tracking(plateforme);

-- ---------------------------------------------------------------------
-- Métriques journalières par campagne (import API pub)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS metriques_pub_journalieres (
    id_metrique              SERIAL PRIMARY KEY,
    id_campagne              INT NOT NULL REFERENCES campagnes_pub(id_campagne) ON DELETE CASCADE,
    id_creative              INT REFERENCES creatives_pub(id_creative) ON DELETE SET NULL,
    date_jour                DATE NOT NULL,
    impressions              INT NOT NULL DEFAULT 0,
    clics                    INT NOT NULL DEFAULT 0,
    ctr_pct                  NUMERIC(6,3) GENERATED ALWAYS AS (
        CASE WHEN impressions > 0 THEN (clics::numeric / impressions * 100) ELSE 0 END
    ) STORED,
    depense                  NUMERIC(10,2) NOT NULL DEFAULT 0,
    cpc                      NUMERIC(8,3) GENERATED ALWAYS AS (
        CASE WHEN clics > 0 THEN (depense / clics) ELSE 0 END
    ) STORED,
    conversions              INT NOT NULL DEFAULT 0,
    valeur_conversions       NUMERIC(12,3) NOT NULL DEFAULT 0,
    roas                     NUMERIC(8,3) GENERATED ALWAYS AS (
        CASE WHEN depense > 0 THEN (valeur_conversions / depense) ELSE 0 END
    ) STORED,
    devise                   VARCHAR(3) NOT NULL DEFAULT 'EUR',
    UNIQUE (id_campagne, id_creative, date_jour)
);
CREATE INDEX IF NOT EXISTS idx_metrique_campagne ON metriques_pub_journalieres(id_campagne);
CREATE INDEX IF NOT EXISTS idx_metrique_date     ON metriques_pub_journalieres(date_jour);

-- ---------------------------------------------------------------------
-- Conversions attribuées (via UTM + pixels)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversions_pub (
    id_conversion            SERIAL PRIMARY KEY,
    id_campagne              INT REFERENCES campagnes_pub(id_campagne) ON DELETE SET NULL,
    id_creative              INT REFERENCES creatives_pub(id_creative) ON DELETE SET NULL,
    id_commande_web          INT,
    id_site                  INT REFERENCES sites_ecommerce(id_site),
    type_conversion          VARCHAR(40) NOT NULL
                              CHECK (type_conversion IN ('page_view','add_to_cart','initiate_checkout','purchase','signup','lead','contact','custom')),
    utm_source               VARCHAR(80),
    utm_medium               VARCHAR(80),
    utm_campaign             VARCHAR(150),
    utm_content              VARCHAR(150),
    utm_term                 VARCHAR(150),
    valeur                   NUMERIC(12,3),
    devise                   VARCHAR(3) DEFAULT 'EUR',
    fbclid                   VARCHAR(200),
    gclid                    VARCHAR(200),
    ttclid                   VARCHAR(200),
    user_agent               TEXT,
    ip                       INET,
    date_conversion          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conv_campagne ON conversions_pub(id_campagne);
CREATE INDEX IF NOT EXISTS idx_conv_type     ON conversions_pub(type_conversion);
CREATE INDEX IF NOT EXISTS idx_conv_date     ON conversions_pub(date_conversion);
CREATE INDEX IF NOT EXISTS idx_conv_utm_camp ON conversions_pub(utm_campaign);

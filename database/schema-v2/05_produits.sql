-- =====================================================================
-- SCHEMA V2 — DOMAINE B : PRODUITS (§5 domain.md)
-- Fichier : 05_produits.sql
-- Cible : PostgreSQL 15
-- Contrat : docs/domain.md §5 (Produits) + §2.1 (nommage id_modele singulier)
-- Idempotent : CREATE TABLE IF NOT EXISTS
-- =====================================================================

-- ---------------------------------------------------------------------
-- Familles / Catégories de produits
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS familles_articles (
    id_famille           SERIAL PRIMARY KEY,
    code                 VARCHAR(30)  NOT NULL UNIQUE,
    libelle              VARCHAR(200) NOT NULL,
    description          TEXT,
    id_famille_parent    INT REFERENCES familles_articles(id_famille) ON DELETE SET NULL,
    ordre_affichage      INT NOT NULL DEFAULT 0,
    actif                BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cree_par             INT,
    modifie_par          INT
);
CREATE INDEX IF NOT EXISTS idx_familles_articles_parent ON familles_articles(id_famille_parent);
CREATE INDEX IF NOT EXISTS idx_familles_articles_actif  ON familles_articles(actif);

-- ---------------------------------------------------------------------
-- Modèles (produit parent) — §5.1
-- PK id_modele SINGULIER (contrat §2.1)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS modeles (
    id_modele                SERIAL PRIMARY KEY,
    code_modele              VARCHAR(30)  NOT NULL UNIQUE,
    libelle                  VARCHAR(200) NOT NULL,
    description              TEXT,
    image_url_principale     VARCHAR(500),
    id_famille               INT REFERENCES familles_articles(id_famille) ON DELETE SET NULL,
    type_produit             VARCHAR(30)  NOT NULL DEFAULT 'produit_fini'
                              CHECK (type_produit IN (
                                'produit_fini','semi_fini','matiere_premiere',
                                'fourniture_fabrication','fourniture_bureau',
                                'emballage','piece_rechange')),
    format_ref_commerciale   VARCHAR(200),
    format_ref_fabrication   VARCHAR(200),
    actif                    BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cree_par                 INT,
    modifie_par              INT
);
CREATE INDEX IF NOT EXISTS idx_modeles_famille       ON modeles(id_famille);
CREATE INDEX IF NOT EXISTS idx_modeles_type_produit  ON modeles(type_produit);
CREATE INDEX IF NOT EXISTS idx_modeles_actif         ON modeles(actif);
CREATE INDEX IF NOT EXISTS idx_modeles_code          ON modeles(code_modele);

-- ---------------------------------------------------------------------
-- Sélecteurs S01–S08 (§5.2, §7 fabrication, BOM)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS variantes_selecteurs (
    id_selecteur       SERIAL PRIMARY KEY,
    code               VARCHAR(10)  NOT NULL UNIQUE,     -- S01..S08
    numero             SMALLINT     NOT NULL UNIQUE
                        CHECK (numero BETWEEN 1 AND 8),
    libelle            VARCHAR(150) NOT NULL,            -- rôle du sélecteur
    role               VARCHAR(30)  NOT NULL DEFAULT 'trame'
                        CHECK (role IN ('chaine','trame','fourniture','emballage','etiquette')),
    description        TEXT,
    valeurs_possibles  JSONB NOT NULL DEFAULT '[]'::jsonb, -- liste de valeurs (couleurs, tissus…)
    actif              BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_selecteurs_numero ON variantes_selecteurs(numero);

-- ---------------------------------------------------------------------
-- Lettres UBTQCS = nombre couleurs (§5.5 génération référence)
-- U=1, B=2, T=3, Q=4, C=5, S=6, SP=7, H=8
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lettres_couleurs (
    id_lettre          SERIAL PRIMARY KEY,
    lettre             VARCHAR(2)   NOT NULL UNIQUE,     -- U, B, T, Q, C, S, SP, H
    nombre_couleurs    SMALLINT     NOT NULL UNIQUE
                        CHECK (nombre_couleurs BETWEEN 1 AND 8),
    libelle            VARCHAR(50)  NOT NULL,            -- Uni, Bicolore, Tricolore, ...
    absent_dans_ref    BOOLEAN NOT NULL DEFAULT FALSE,   -- true pour U (§5.5)
    ordre_affichage    SMALLINT NOT NULL DEFAULT 0,
    actif              BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------------------------------------------------------------------
-- Dimensions articles (variantes de taille)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS articles_dimensions (
    id_dimension       SERIAL PRIMARY KEY,
    code               VARCHAR(20)  NOT NULL UNIQUE,    -- '100x200', 'ADU', 'KID'
    libelle            VARCHAR(100) NOT NULL,
    largeur_cm         NUMERIC(8,2),
    longueur_cm        NUMERIC(8,2),
    hauteur_cm         NUMERIC(8,2),
    code_ref           VARCHAR(10),                     -- code DIM4 utilisé dans la ref (ex '1020', 'ADU')
    est_numerique      BOOLEAN NOT NULL DEFAULT TRUE,
    ordre_affichage    INT NOT NULL DEFAULT 0,
    actif              BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dimensions_actif ON articles_dimensions(actif);

-- ---------------------------------------------------------------------
-- Articles catalogue (variantes concrètes) — §5.5
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS articles_catalogue (
    id_article               SERIAL PRIMARY KEY,
    id_modele                INT NOT NULL REFERENCES modeles(id_modele) ON DELETE RESTRICT,
    code_article             VARCHAR(80)  NOT NULL UNIQUE,     -- clé technique
    ref_fabrication          VARCHAR(80)  NOT NULL UNIQUE,     -- atelier
    ref_commerciale          VARCHAR(80)  NOT NULL UNIQUE,     -- catalogue vente
    designation              VARCHAR(300) NOT NULL,
    image_url_principale     VARCHAR(500),

    -- Attributs de variante (§5.5)
    id_dimension             INT REFERENCES articles_dimensions(id_dimension) ON DELETE SET NULL,
    id_lettre_couleurs       INT REFERENCES lettres_couleurs(id_lettre) ON DELETE SET NULL,
    code_couleur_base        VARCHAR(4),         -- 2 chiffres id couleur principale
    suffixe_nuance           VARCHAR(4),         -- 01 = pleine
    codes_couleurs_add       VARCHAR(40),        -- codes additionnels séparés par tiret
    id_finition              INT,
    id_tissage               INT,
    id_personnalisation      INT,
    id_numero_metrique       INT,
    id_composition           INT,

    -- Miroir modele.type_produit dénormalisé
    type_stock               VARCHAR(30) NOT NULL DEFAULT 'produit_fini'
                              CHECK (type_stock IN (
                                'produit_fini','semi_fini','matiere_premiere',
                                'fourniture_fabrication','fourniture_bureau',
                                'emballage','piece_rechange')),

    -- Codes-barres
    ean_13                   VARCHAR(13) UNIQUE,
    ean_8                    VARCHAR(8)  UNIQUE,
    qr_code                  VARCHAR(50),

    -- Qualité
    qualite                  VARCHAR(20) NOT NULL DEFAULT 'premier_choix'
                              CHECK (qualite IN ('premier_choix','second_choix')),

    -- Prix
    prix_reviens             NUMERIC(14,3),
    prix_vente_ht            NUMERIC(14,3),
    prix_moyen_pondere_kg    NUMERIC(14,3),
    unite_vente              VARCHAR(10) NOT NULL DEFAULT 'pc',

    -- Logistique
    poids_net_g              NUMERIC(10,2),
    poids_brut_g             NUMERIC(10,2),
    longueur_cm              NUMERIC(8,2),
    largeur_cm               NUMERIC(8,2),
    hauteur_cm               NUMERIC(8,2),
    volume_cm3               NUMERIC(12,2),
    fragile                  BOOLEAN NOT NULL DEFAULT FALSE,

    id_fournisseur_defaut    INT,
    actif                    BOOLEAN NOT NULL DEFAULT TRUE,

    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cree_par                 INT,
    modifie_par              INT,

    -- Contrainte unique combinaison (§5.5)
    CONSTRAINT uq_articles_variante UNIQUE (
        id_modele, id_dimension, id_lettre_couleurs, code_couleur_base,
        suffixe_nuance, codes_couleurs_add, id_finition, id_tissage,
        id_personnalisation, id_numero_metrique, id_composition
    )
);

CREATE INDEX IF NOT EXISTS idx_articles_modele        ON articles_catalogue(id_modele);
CREATE INDEX IF NOT EXISTS idx_articles_ref_commerciale ON articles_catalogue(ref_commerciale);
CREATE INDEX IF NOT EXISTS idx_articles_ref_fab       ON articles_catalogue(ref_fabrication);
CREATE INDEX IF NOT EXISTS idx_articles_type_stock    ON articles_catalogue(type_stock);
CREATE INDEX IF NOT EXISTS idx_articles_actif         ON articles_catalogue(actif);
CREATE INDEX IF NOT EXISTS idx_articles_qualite       ON articles_catalogue(qualite);
CREATE INDEX IF NOT EXISTS idx_articles_ean13         ON articles_catalogue(ean_13);

-- =====================================================================
-- SCHEMA V2 — DOMAINE B : BOM (§5 / §7.2 domain.md)
-- Fichier : 06_bom.sql
-- BOM Master (en-tête) + BOM Composants (84 colonnes issues Excel BOM legacy)
-- =====================================================================

-- ---------------------------------------------------------------------
-- BOM Master (en-tête) — §7.2
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bom_master (
    id_bom                 SERIAL PRIMARY KEY,
    id_article             INT NOT NULL REFERENCES articles_catalogue(id_article) ON DELETE RESTRICT,
    code_bom_master        VARCHAR(80) NOT NULL UNIQUE,          -- <code_produit><code_dim>(<code_finition>)-<code_nb_couleurs>
    version                INT NOT NULL DEFAULT 1,
    est_active             BOOLEAN NOT NULL DEFAULT TRUE,
    type_fabrication       VARCHAR(30) NOT NULL DEFAULT 'unique'
                            CHECK (type_fabrication IN ('unique','multi_composants')),

    -- Dimensions (groupe : dimensions)
    largeur_cm             NUMERIC(10,3),
    longueur_cm            NUMERIC(10,3),
    laize_cm               NUMERIC(10,3),
    poids_theorique_g      NUMERIC(12,3),
    grammage_g_m2          NUMERIC(10,3),

    -- Paramètres tissage/qualité
    duites_par_cm          NUMERIC(10,3),
    nb_duites_total        INT,
    nb_fils_chaine         INT,
    numero_metrique_chaine INT,                                   -- NM chaîne
    numero_metrique_trame  INT,                                   -- NM trame
    perte_theorique_pct    NUMERIC(5,2),
    perte_reelle_pct       NUMERIC(5,2),

    -- Sélecteurs S01..S08 (référence trame par slot)
    id_selecteur_s01       INT REFERENCES variantes_selecteurs(id_selecteur),
    id_selecteur_s02       INT REFERENCES variantes_selecteurs(id_selecteur),
    id_selecteur_s03       INT REFERENCES variantes_selecteurs(id_selecteur),
    id_selecteur_s04       INT REFERENCES variantes_selecteurs(id_selecteur),
    id_selecteur_s05       INT REFERENCES variantes_selecteurs(id_selecteur),
    id_selecteur_s06       INT REFERENCES variantes_selecteurs(id_selecteur),
    id_selecteur_s07       INT REFERENCES variantes_selecteurs(id_selecteur),
    id_selecteur_s08       INT REFERENCES variantes_selecteurs(id_selecteur),

    notes                  TEXT,
    date_creation          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cree_par               INT,
    modifie_par            INT
);
CREATE INDEX IF NOT EXISTS idx_bom_master_article ON bom_master(id_article);
CREATE INDEX IF NOT EXISTS idx_bom_master_active  ON bom_master(est_active);

-- Une seule BOM active par article
CREATE UNIQUE INDEX IF NOT EXISTS uq_bom_active_per_article
    ON bom_master(id_article) WHERE est_active = TRUE;

-- ---------------------------------------------------------------------
-- BOM Composants — 84 colonnes BOM Excel groupées logiquement
-- Sections : identification, dimensions, sélecteurs, matériaux,
-- quantités par variante (Q_S01..Q_S08), poids, coûts, remplacements.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bom_composants (
    id_ligne_bom             SERIAL PRIMARY KEY,
    id_bom                   INT NOT NULL REFERENCES bom_master(id_bom) ON DELETE CASCADE,
    id_article_composant     INT NOT NULL REFERENCES articles_catalogue(id_article) ON DELETE RESTRICT,
    ordre                    INT NOT NULL DEFAULT 0,

    -- Identification composant
    code_composant           VARCHAR(80),
    libelle_composant        VARCHAR(200),
    role                     VARCHAR(30) NOT NULL DEFAULT 'trame'
                              CHECK (role IN ('chaine','trame','fourniture','emballage','etiquette')),
    numero_selecteur         SMALLINT CHECK (numero_selecteur BETWEEN 1 AND 8),
    id_etape_gamme           INT,

    -- Dimensions composant
    largeur_cm               NUMERIC(10,3),
    longueur_cm              NUMERIC(10,3),
    hauteur_cm               NUMERIC(10,3),
    laize_cm                 NUMERIC(10,3),

    -- Matériaux
    id_numero_metrique       INT,
    numero_metrique_valeur   NUMERIC(10,2),
    id_composition           INT,
    id_torsion               INT,
    grammage_g_m2            NUMERIC(10,3),
    id_couleur               INT,
    code_couleur             VARCHAR(20),
    code_hex                 VARCHAR(7),

    -- Quantité globale (base 1 unité produite)
    quantite                 NUMERIC(14,4) NOT NULL DEFAULT 0,
    unite                    VARCHAR(10) NOT NULL DEFAULT 'kg',    -- 'g','kg','m','pc'

    -- Quantités par sélecteur S01..S08 (formule métier)
    quantite_s01             NUMERIC(14,4),
    quantite_s02             NUMERIC(14,4),
    quantite_s03             NUMERIC(14,4),
    quantite_s04             NUMERIC(14,4),
    quantite_s05             NUMERIC(14,4),
    quantite_s06             NUMERIC(14,4),
    quantite_s07             NUMERIC(14,4),
    quantite_s08             NUMERIC(14,4),

    -- Ourdissage / Chaîne
    nb_fils_chaine           INT,
    metres_chaine            NUMERIC(12,3),
    poids_ourdissage_kg      NUMERIC(14,4),   -- calc: (nb_fils × m × 2) / (NM × 1000)

    -- Trame
    nb_duites               INT,
    metres_trame             NUMERIC(12,3),
    poids_trame_kg           NUMERIC(14,4),

    -- Poids
    poids_theorique_kg       NUMERIC(14,4),
    poids_reel_kg            NUMERIC(14,4),
    perte_pct                NUMERIC(5,2),

    -- Coûts
    prix_unitaire            NUMERIC(14,4),
    cout_ligne               NUMERIC(14,4),
    devise                   VARCHAR(3) NOT NULL DEFAULT 'TND',

    -- Remplacements
    remplacements_possibles  INT[],
    obligatoire              BOOLEAN NOT NULL DEFAULT TRUE,

    notes                    TEXT,
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cree_par                 INT,
    modifie_par              INT
);
CREATE INDEX IF NOT EXISTS idx_bom_comp_bom       ON bom_composants(id_bom);
CREATE INDEX IF NOT EXISTS idx_bom_comp_article   ON bom_composants(id_article_composant);
CREATE INDEX IF NOT EXISTS idx_bom_comp_role      ON bom_composants(role);
CREATE INDEX IF NOT EXISTS idx_bom_comp_selecteur ON bom_composants(numero_selecteur);

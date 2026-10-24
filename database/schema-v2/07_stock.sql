-- =====================================================================
-- SCHEMA V2 — DOMAINE B : STOCK (§6 domain.md)
-- Fichier : 07_stock.sql
-- Entrepôts, emplacements, MP (typage NM), SF, PF, pièces rechange,
-- inventaires, mouvements de stock.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Entrepots — §6.2
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entrepots (
    id_entrepot                SERIAL PRIMARY KEY,
    code                       VARCHAR(20)  NOT NULL UNIQUE,
    libelle                    VARCHAR(150) NOT NULL,
    type                       VARCHAR(30) NOT NULL DEFAULT 'entrepot_principal'
                                CHECK (type IN (
                                  'usine','entrepot_principal','entrepot_secondaire',
                                  'atelier_preparation','magasin_vente','hub_transit',
                                  'sous_traitant','showroom')),
    id_societe_adresse         INT,
    responsable_id_utilisateur INT,
    capacite_m3                NUMERIC(12,2),
    permet_vente               BOOLEAN NOT NULL DEFAULT FALSE,
    actif                      BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cree_par                   INT,
    modifie_par                INT
);
CREATE INDEX IF NOT EXISTS idx_entrepots_type  ON entrepots(type);
CREATE INDEX IF NOT EXISTS idx_entrepots_actif ON entrepots(actif);

-- ---------------------------------------------------------------------
-- Emplacements — §6.3
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emplacements (
    id_emplacement          SERIAL PRIMARY KEY,
    id_entrepot             INT NOT NULL REFERENCES entrepots(id_entrepot) ON DELETE CASCADE,
    code                    VARCHAR(30)  NOT NULL,
    libelle                 VARCHAR(150),
    capacite_max_articles   INT,
    actif                   BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_emplacement_par_entrepot UNIQUE (id_entrepot, code)
);
CREATE INDEX IF NOT EXISTS idx_emplacements_entrepot ON emplacements(id_entrepot);

-- ---------------------------------------------------------------------
-- Matières premières (typage NM) — §5/§6
-- Table complémentaire à articles_catalogue pour attributs MP spécifiques
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS matieres_premieres (
    id_matiere_premiere       SERIAL PRIMARY KEY,
    id_article                INT NOT NULL UNIQUE REFERENCES articles_catalogue(id_article) ON DELETE CASCADE,
    code_nm                   VARCHAR(20),                -- 'NM05', 'NM15', 'NM2/50'
    numero_metrique_valeur    NUMERIC(10,2),              -- 50 pour 'NM2/50'
    composition               VARCHAR(150),               -- '100% coton', '80/20 CO/PES'...
    torsion                   VARCHAR(20),                -- 'S','Z','faible','forte'
    grammage_g_m2             NUMERIC(10,3),
    couleur_hex               VARCHAR(7),
    poids_bobine_moyen_kg     NUMERIC(10,3),
    id_fournisseur_defaut     INT,
    stock_minimum_kg          NUMERIC(12,3),
    actif                     BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mp_code_nm ON matieres_premieres(code_nm);
CREATE INDEX IF NOT EXISTS idx_mp_actif   ON matieres_premieres(actif);

-- ---------------------------------------------------------------------
-- Produits semi-finis
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produits_semis (
    id_semi_fini              SERIAL PRIMARY KEY,
    id_article                INT NOT NULL UNIQUE REFERENCES articles_catalogue(id_article) ON DELETE CASCADE,
    id_of_source              INT,                        -- OF ayant produit ce SF
    etape_actuelle            VARCHAR(50),                -- OURDISSAGE, TISSAGE, ...
    prochain_poste_code       VARCHAR(50),
    metres_produits           NUMERIC(12,3),
    poids_kg                  NUMERIC(12,3),
    notes                     TEXT,
    actif                     BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sf_etape ON produits_semis(etape_actuelle);

-- ---------------------------------------------------------------------
-- Produits finis (extension article catalog pour PF)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produits_finis (
    id_produit_fini           SERIAL PRIMARY KEY,
    id_article                INT NOT NULL UNIQUE REFERENCES articles_catalogue(id_article) ON DELETE CASCADE,
    qualite                   VARCHAR(20) NOT NULL DEFAULT 'premier_choix'
                               CHECK (qualite IN ('premier_choix','second_choix')),
    id_catalogue_principal    INT,
    stock_minimum             NUMERIC(12,3),
    stock_maximum             NUMERIC(12,3),
    actif                     BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Pièces de rechange (§6.1)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pieces_rechange (
    id_piece                  SERIAL PRIMARY KEY,
    id_article                INT REFERENCES articles_catalogue(id_article) ON DELETE SET NULL,
    code_piece                VARCHAR(80) NOT NULL UNIQUE,
    libelle                   VARCHAR(200) NOT NULL,
    id_famille_piece          INT,
    reference_fabricant       VARCHAR(80),
    fabricant                 VARCHAR(150),
    machine_compatible        VARCHAR(200),               -- ex 'Dornier LWV'
    stock_minimum             NUMERIC(12,3),
    prix_unitaire             NUMERIC(14,3),
    id_fournisseur_defaut     INT,
    actif                     BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cree_par                  INT,
    modifie_par               INT
);
CREATE INDEX IF NOT EXISTS idx_pieces_famille ON pieces_rechange(id_famille_piece);
CREATE INDEX IF NOT EXISTS idx_pieces_actif   ON pieces_rechange(actif);

-- ---------------------------------------------------------------------
-- Inventaires — §6.8
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventaires (
    id_inventaire              SERIAL PRIMARY KEY,
    numero_inventaire          VARCHAR(30) NOT NULL UNIQUE,   -- INV-YYYYMMDD-NN
    id_entrepot                INT NOT NULL REFERENCES entrepots(id_entrepot) ON DELETE RESTRICT,
    mode                       VARCHAR(20) NOT NULL DEFAULT 'ajustement_delta'
                                CHECK (mode IN ('ajustement_delta','reset_absolu')),
    date_debut                 DATE,
    date_fin                   DATE,
    statut                     VARCHAR(20) NOT NULL DEFAULT 'en_preparation'
                                CHECK (statut IN ('en_preparation','en_cours','valide','annule')),
    responsable_id_utilisateur INT,
    notes                      TEXT,
    date_creation              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cree_par                   INT,
    modifie_par                INT
);
CREATE INDEX IF NOT EXISTS idx_inventaires_entrepot ON inventaires(id_entrepot);
CREATE INDEX IF NOT EXISTS idx_inventaires_statut   ON inventaires(statut);

CREATE TABLE IF NOT EXISTS inventaire_lignes (
    id_ligne              SERIAL PRIMARY KEY,
    id_inventaire         INT NOT NULL REFERENCES inventaires(id_inventaire) ON DELETE CASCADE,
    id_article            INT NOT NULL REFERENCES articles_catalogue(id_article) ON DELETE RESTRICT,
    id_emplacement        INT REFERENCES emplacements(id_emplacement),
    id_lot                INT,
    quantite_theorique    NUMERIC(14,3) NOT NULL DEFAULT 0,
    quantite_comptee      NUMERIC(14,3) NOT NULL DEFAULT 0,
    ecart                 NUMERIC(14,3) GENERATED ALWAYS AS (quantite_comptee - quantite_theorique) STORED,
    note                  TEXT,
    compte_par            INT,
    date_comptage         TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_inv_lignes_inv     ON inventaire_lignes(id_inventaire);
CREATE INDEX IF NOT EXISTS idx_inv_lignes_article ON inventaire_lignes(id_article);

-- ---------------------------------------------------------------------
-- Mouvements de stock — §6.5
-- Table immuable (INSERT only ; statut modifiable).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mouvements_stock (
    id_mouvement                 SERIAL PRIMARY KEY,
    numero_mouvement             VARCHAR(30) NOT NULL UNIQUE,      -- MVT-YYYYMMDD-NNNNN
    type_mouvement               VARCHAR(40) NOT NULL
                                  CHECK (type_mouvement IN (
                                    'reception_fournisseur','entree_fabrication',
                                    'sortie_vente','sortie_of',
                                    'transfert_entrepot',
                                    'reservation','liberation_reservation',
                                    'ajustement_positif','ajustement_negatif',
                                    'retour_client','mise_au_rebut')),
    id_article                   INT NOT NULL REFERENCES articles_catalogue(id_article) ON DELETE RESTRICT,
    quantite                     NUMERIC(14,3) NOT NULL,
    id_lot                       INT,
    qr_mp_reel                   VARCHAR(50),

    id_entrepot_source           INT REFERENCES entrepots(id_entrepot),
    id_emplacement_source        INT REFERENCES emplacements(id_emplacement),
    id_entrepot_destination      INT REFERENCES entrepots(id_entrepot),
    id_emplacement_destination   INT REFERENCES emplacements(id_emplacement),

    id_document_lie              INT,
    type_document_lie            VARCHAR(30)
                                  CHECK (type_document_lie IN (
                                    'bl','commande','of','bon_reception',
                                    'transfert','ajustement','inventaire','retour')),
    motif                        VARCHAR(300),
    date_mouvement               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effectue_par                 INT,
    valide_par                   INT,
    statut                       VARCHAR(20) NOT NULL DEFAULT 'valide'
                                  CHECK (statut IN ('en_attente','valide','annule')),
    date_creation                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

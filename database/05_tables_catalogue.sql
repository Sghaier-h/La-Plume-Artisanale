-- ============================================================================
-- TABLES POUR LE CATALOGUE D'ARTICLES
-- ============================================================================
-- Création des tables pour les paramètres catalogue et la nomenclature
-- ============================================================================

-- Paramètres Modèles
CREATE TABLE IF NOT EXISTS parametres_modeles (
    id SERIAL PRIMARY KEY,
    code_modele VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Paramètres Dimensions
CREATE TABLE IF NOT EXISTS parametres_dimensions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    largeur DECIMAL(10,2),
    longueur DECIMAL(10,2),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Paramètres Finitions
CREATE TABLE IF NOT EXISTS parametres_finitions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Paramètres Tissages
CREATE TABLE IF NOT EXISTS parametres_tissages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Paramètres Couleurs
CREATE TABLE IF NOT EXISTS parametres_couleurs (
    id SERIAL PRIMARY KEY,
    code_commercial VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    code_hex VARCHAR(7),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles Catalogue (extension)
ALTER TABLE articles_catalogue 
ADD COLUMN IF NOT EXISTS id_modele INTEGER REFERENCES parametres_modeles(id),
ADD COLUMN IF NOT EXISTS id_dimension INTEGER REFERENCES parametres_dimensions(id),
ADD COLUMN IF NOT EXISTS id_finition INTEGER REFERENCES parametres_finitions(id),
ADD COLUMN IF NOT EXISTS id_tissage INTEGER REFERENCES parametres_tissages(id),
ADD COLUMN IF NOT EXISTS nb_couleurs INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS ref_commerciale VARCHAR(100),
ADD COLUMN IF NOT EXISTS ref_fabrication VARCHAR(100),
ADD COLUMN IF NOT EXISTS prix_revient DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS temps_production DECIMAL(10,2);

-- Nomenclature Sélecteurs (BOM)
CREATE TABLE IF NOT EXISTS nomenclature_selecteurs (
    id_nomenclature SERIAL PRIMARY KEY,
    id_article INTEGER NOT NULL REFERENCES articles_catalogue(id_article) ON DELETE CASCADE,
    position INTEGER NOT NULL, -- 1 à 8 (S01 à S08)
    id_mp INTEGER REFERENCES matieres_premieres(id_mp),
    quantite_kg DECIMAL(10,3) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_article, position)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_articles_modele ON articles_catalogue(id_modele);
CREATE INDEX IF NOT EXISTS idx_articles_dimension ON articles_catalogue(id_dimension);
CREATE INDEX IF NOT EXISTS idx_nomenclature_article ON nomenclature_selecteurs(id_article);
CREATE INDEX IF NOT EXISTS idx_nomenclature_mp ON nomenclature_selecteurs(id_mp);

-- Données initiales - Modèles
INSERT INTO parametres_modeles (code_modele, libelle, description, actif) VALUES
('AR', 'ARTHUR', 'Modèle Arthur', true),
('IB', 'IBIZA', 'Modèle Ibiza', true),
('PO', 'PONCHO', 'Modèle Poncho', true),
('NDL', 'ND LILI', 'Modèle ND Lili', true)
ON CONFLICT (code_modele) DO NOTHING;

-- Données initiales - Dimensions
INSERT INTO parametres_dimensions (code, libelle, largeur, longueur, actif) VALUES
('1020', '100x200 cm', 100, 200, true),
('2426', '240x260 cm', 240, 260, true),
('160150', '160x150 cm', 160, 150, true),
('120180', '120x180 cm', 120, 180, true)
ON CONFLICT (code) DO NOTHING;

-- Données initiales - Finitions
INSERT INTO parametres_finitions (code, libelle, description, actif) VALUES
('FR', 'Frange', 'Finition avec frange', true),
('OR', 'Ourlet', 'Finition avec ourlet', true),
('BR', 'Bordure', 'Finition avec bordure', true)
ON CONFLICT (code) DO NOTHING;

-- Données initiales - Tissages
INSERT INTO parametres_tissages (code, libelle, description, actif) VALUES
('PL', 'Tissage Plat', 'Tissage plat standard', true),
('JA', 'Jacquard', 'Tissage jacquard', true),
('EP', 'Éponge', 'Tissage éponge', true)
ON CONFLICT (code) DO NOTHING;

-- Données initiales - Couleurs
INSERT INTO parametres_couleurs (code_commercial, nom, code_hex, actif) VALUES
('C01', 'BLANC', '#FFFFFF', true),
('C20', 'ROUGE', '#FF0000', true),
('C15', 'BLEU', '#0000FF', true),
('C32', 'VERT', '#00FF00', true),
('C45', 'JAUNE', '#FFFF00', true)
ON CONFLICT (code_commercial) DO NOTHING;

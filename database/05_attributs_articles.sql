-- ============================================================================
-- FICHIER : ATTRIBUTS ARTICLES
-- ============================================================================
-- Tables pour gérer les attributs paramétrables des articles
-- Dimensions, couleurs, finitions, références, sélecteurs
-- ============================================================================

-- Suppression des tables existantes
DROP TABLE IF EXISTS articles_attributs CASCADE;
DROP TABLE IF EXISTS articles_references CASCADE;
DROP TABLE IF EXISTS finitions_articles CASCADE;
DROP TABLE IF EXISTS couleurs_articles CASCADE;
DROP TABLE IF EXISTS dimensions_articles CASCADE;

-- ============================================================================
-- TABLES DES ATTRIBUTS
-- ============================================================================

-- Dimensions des articles
CREATE TABLE dimensions_articles (
    id_dimension SERIAL PRIMARY KEY,
    code_dimension VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    largeur DECIMAL(10,2),
    longueur DECIMAL(10,2),
    unite VARCHAR(20) DEFAULT 'cm',
    description TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Couleurs des articles
CREATE TABLE couleurs_articles (
    id_couleur SERIAL PRIMARY KEY,
    code_commercial VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    code_hex VARCHAR(7),
    code_rgb VARCHAR(20),
    description TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Finitions des articles
CREATE TABLE finitions_articles (
    id_finition SERIAL PRIMARY KEY,
    code_finition VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    temps_ajout DECIMAL(10,2), -- Temps supplémentaire en minutes
    cout_ajout DECIMAL(10,2), -- Coût supplémentaire
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Références d'articles (organisation par famille/référence)
CREATE TABLE articles_references (
    id_reference SERIAL PRIMARY KEY,
    code_reference VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajout de la colonne référence dans articles_catalogue
ALTER TABLE articles_catalogue 
ADD COLUMN IF NOT EXISTS id_reference INTEGER REFERENCES articles_references(id_reference),
ADD COLUMN IF NOT EXISTS id_dimension INTEGER REFERENCES dimensions_articles(id_dimension),
ADD COLUMN IF NOT EXISTS id_couleur INTEGER REFERENCES couleurs_articles(id_couleur),
ADD COLUMN IF NOT EXISTS id_finition INTEGER REFERENCES finitions_articles(id_finition),
ADD COLUMN IF NOT EXISTS id_selecteur INTEGER REFERENCES selecteurs(id_selecteur),
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS ordre_affichage INTEGER DEFAULT 0;

-- Table de liaison pour les attributs multiples (si un article peut avoir plusieurs couleurs/finitions)
CREATE TABLE articles_attributs (
    id_article_attribut SERIAL PRIMARY KEY,
    id_article INTEGER NOT NULL REFERENCES articles_catalogue(id_article) ON DELETE CASCADE,
    type_attribut VARCHAR(50) NOT NULL, -- 'couleur', 'finition', 'dimension'
    id_attribut INTEGER NOT NULL,
    valeur_attribut TEXT, -- Pour les valeurs personnalisées
    ordre INTEGER DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_article, type_attribut, id_attribut)
);

-- Index pour améliorer les performances
CREATE INDEX idx_articles_reference ON articles_catalogue(id_reference);
CREATE INDEX idx_articles_dimension ON articles_catalogue(id_dimension);
CREATE INDEX idx_articles_couleur ON articles_catalogue(id_couleur);
CREATE INDEX idx_articles_finition ON articles_catalogue(id_finition);
CREATE INDEX idx_articles_selecteur ON articles_catalogue(id_selecteur);
CREATE INDEX idx_articles_attributs_article ON articles_attributs(id_article);
CREATE INDEX idx_articles_attributs_type ON articles_attributs(type_attribut);

-- Données de base pour les tests
INSERT INTO dimensions_articles (code_dimension, libelle, largeur, longueur, unite) VALUES
('100x200', '100x200 cm', 100, 200, 'cm'),
('120x180', '120x180 cm', 120, 180, 'cm'),
('150x200', '150x200 cm', 150, 200, 'cm'),
('180x240', '180x240 cm', 180, 240, 'cm')
ON CONFLICT DO NOTHING;

INSERT INTO couleurs_articles (code_commercial, nom, code_hex) VALUES
('BLANC', 'BLANC', '#FFFFFF'),
('NOIR', 'NOIR', '#000000'),
('ROUGE', 'ROUGE', '#FF0000'),
('BLEU', 'BLEU', '#0000FF'),
('VERT', 'VERT', '#00FF00'),
('JAUNE', 'JAUNE', '#FFFF00'),
('ORANGE', 'ORANGE', '#FFA500'),
('VIOLET', 'VIOLET', '#800080')
ON CONFLICT DO NOTHING;

INSERT INTO finitions_articles (code_finition, libelle, description) VALUES
('FR', 'Frange', 'Finition avec frange'),
('OR', 'Ourlet', 'Finition avec ourlet'),
('BR', 'Bordure', 'Finition avec bordure'),
('DO', 'Double ourlet', 'Double ourlet renforcé')
ON CONFLICT DO NOTHING;

INSERT INTO articles_references (code_reference, libelle, description) VALUES
('REF001', 'Fouta Classique', 'Fouta traditionnelle classique'),
('REF002', 'Fouta Moderne', 'Fouta design moderne'),
('REF003', 'Fouta Premium', 'Fouta haut de gamme')
ON CONFLICT DO NOTHING;

-- ✅ Tables attributs articles créées

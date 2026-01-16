-- ============================================================================
-- TABLES POUR CATALOGUE PRODUIT AVEC ATTRIBUTS ET PHOTOS
-- ============================================================================

-- Table Produits (modèle de base)
CREATE TABLE IF NOT EXISTS produits (
    id_produit SERIAL PRIMARY KEY,
    
    -- Informations de base
    code_produit VARCHAR(50) UNIQUE NOT NULL,
    designation VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Photo principale
    photo_principale VARCHAR(500), -- URL du fichier photo
    
    -- Catégorie/Famille
    famille_produit VARCHAR(100), -- Ex: FOUTA, COUSSIN, TAPIS
    
    -- Statut
    actif BOOLEAN DEFAULT TRUE,
    
    -- Dates
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    updated_by INTEGER REFERENCES utilisateurs(id_utilisateur)
);

-- Table Attributs (attributs personnalisables)
CREATE TABLE IF NOT EXISTS attributs_produit (
    id_attribut SERIAL PRIMARY KEY,
    
    -- Informations attribut
    code_attribut VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    type_attribut VARCHAR(50) NOT NULL,
    -- Types: DIMENSION, COULEUR, FINITION, TISSAGE, MODELE, SELECTEUR
    
    -- Valeurs possibles (JSON pour flexibilité)
    valeurs_possibles JSONB, -- [{code: '1020', libelle: '100x200', couleur_hex: '#FFFFFF'}, ...]
    
    -- Configuration
    obligatoire BOOLEAN DEFAULT FALSE,
    ordre_affichage INTEGER DEFAULT 0,
    afficher_catalogue BOOLEAN DEFAULT TRUE,
    
    -- Statut
    actif BOOLEAN DEFAULT TRUE,
    
    -- Dates
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Produit-Attributs (association produit avec ses attributs)
CREATE TABLE IF NOT EXISTS produit_attributs (
    id_produit_attribut SERIAL PRIMARY KEY,
    
    -- Références
    id_produit INTEGER NOT NULL REFERENCES produits(id_produit) ON DELETE CASCADE,
    id_attribut INTEGER NOT NULL REFERENCES attributs_produit(id_attribut) ON DELETE CASCADE,
    
    -- Valeur par défaut pour cet attribut (optionnel)
    valeur_par_defaut VARCHAR(100),
    
    -- Configuration
    obligatoire BOOLEAN DEFAULT FALSE,
    
    UNIQUE(id_produit, id_attribut)
);

-- Table Variantes Produit (combinaisons d'attributs)
CREATE TABLE IF NOT EXISTS variantes_produit (
    id_variante SERIAL PRIMARY KEY,
    
    -- Référence produit
    id_produit INTEGER NOT NULL REFERENCES produits(id_produit) ON DELETE CASCADE,
    
    -- Référence article généré (si article créé)
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    
    -- Code variante unique
    code_variante VARCHAR(100) UNIQUE NOT NULL,
    
    -- Attributs sélectionnés (JSON: {id_attribut: valeur, ...})
    attributs_values JSONB NOT NULL,
    -- Ex: {"1": "1020", "2": "C01", "3": "FR"} pour Dimension=1020, Couleur=C01, Finition=FR
    
    -- Photo spécifique à cette variante (optionnel)
    photo_variante VARCHAR(500),
    
    -- Informations techniques (si différentes du produit de base)
    largeur_tissage NUMERIC(10,2),
    longueur_tissage NUMERIC(10,2),
    duite_cm NUMERIC(10,2),
    nombre_duite_total INTEGER,
    consommation_s01 NUMERIC(10,3),
    consommation_s02 NUMERIC(10,3),
    consommation_s03 NUMERIC(10,3),
    consommation_s04 NUMERIC(10,3),
    consommation_s05 NUMERIC(10,3),
    consommation_s06 NUMERIC(10,3),
    prix_revient NUMERIC(10,2),
    temps_production NUMERIC(10,2),
    
    -- Statut
    actif BOOLEAN DEFAULT TRUE,
    article_genere BOOLEAN DEFAULT FALSE, -- Si article créé depuis cette variante
    
    -- Dates
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Photos Produit (plusieurs photos par produit)
CREATE TABLE IF NOT EXISTS photos_produit (
    id_photo SERIAL PRIMARY KEY,
    
    -- Référence produit ou variante
    id_produit INTEGER REFERENCES produits(id_produit) ON DELETE CASCADE,
    id_variante INTEGER REFERENCES variantes_produit(id_variante) ON DELETE CASCADE,
    
    -- Informations photo
    chemin_fichier VARCHAR(500) NOT NULL, -- Chemin relatif ou URL
    nom_fichier VARCHAR(255) NOT NULL,
    type_fichier VARCHAR(50), -- image/jpeg, image/png, etc.
    taille_fichier INTEGER, -- En octets
    
    -- Métadonnées
    legende VARCHAR(200),
    ordre_affichage INTEGER DEFAULT 0,
    photo_principale BOOLEAN DEFAULT FALSE,
    
    -- Dates
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER REFERENCES utilisateurs(id_utilisateur)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_produits_code ON produits(code_produit);
CREATE INDEX IF NOT EXISTS idx_produits_famille ON produits(famille_produit);
CREATE INDEX IF NOT EXISTS idx_produits_actif ON produits(actif);
CREATE INDEX IF NOT EXISTS idx_attributs_code ON attributs_produit(code_attribut);
CREATE INDEX IF NOT EXISTS idx_attributs_type ON attributs_produit(type_attribut);
CREATE INDEX IF NOT EXISTS idx_produit_attributs_produit ON produit_attributs(id_produit);
CREATE INDEX IF NOT EXISTS idx_produit_attributs_attribut ON produit_attributs(id_attribut);
CREATE INDEX IF NOT EXISTS idx_variantes_produit ON variantes_produit(id_produit);
CREATE INDEX IF NOT EXISTS idx_variantes_code ON variantes_produit(code_variante);
CREATE INDEX IF NOT EXISTS idx_variantes_article ON variantes_produit(id_article);
CREATE INDEX IF NOT EXISTS idx_photos_produit ON photos_produit(id_produit);
CREATE INDEX IF NOT EXISTS idx_photos_variante ON photos_produit(id_variante);

-- Trigger pour mettre à jour date_modification
CREATE OR REPLACE FUNCTION update_produits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_produits_updated_at
    BEFORE UPDATE ON produits
    FOR EACH ROW
    EXECUTE FUNCTION update_produits_updated_at();

CREATE TRIGGER trigger_update_variantes_updated_at
    BEFORE UPDATE ON variantes_produit
    FOR EACH ROW
    EXECUTE FUNCTION update_produits_updated_at();

-- Données initiales : Attributs de base
INSERT INTO attributs_produit (code_attribut, libelle, type_attribut, valeurs_possibles, ordre_affichage, actif) VALUES
('ATT_DIMENSION', 'Dimension', 'DIMENSION', 
 '[{"code": "1020", "libelle": "100x200 cm"}, {"code": "1525", "libelle": "150x250 cm"}, {"code": "2003", "libelle": "200x300 cm"}]',
 1, TRUE),
('ATT_COULEUR', 'Couleur', 'COULEUR',
 '[{"code": "C01", "libelle": "Blanc", "couleur_hex": "#FFFFFF"}, {"code": "C20", "libelle": "Rouge", "couleur_hex": "#FF0000"}, {"code": "C30", "libelle": "Bleu", "couleur_hex": "#0000FF"}]',
 2, TRUE),
('ATT_FINITION', 'Finition', 'FINITION',
 '[{"code": "FR", "libelle": "Frange"}, {"code": "OR", "libelle": "Ourlet"}, {"code": "BO", "libelle": "Bordure"}]',
 3, TRUE),
('ATT_TISSAGE', 'Tissage', 'TISSAGE',
 '[{"code": "PL", "libelle": "Tissage Plat"}, {"code": "JA", "libelle": "Jacquard"}, {"code": "EP", "libelle": "Éponge"}]',
 4, TRUE),
('ATT_MODELE', 'Modèle', 'MODELE',
 '[{"code": "IB", "libelle": "IBIZA"}, {"code": "AR", "libelle": "ARTHUR"}, {"code": "PO", "libelle": "PONCHO"}]',
 0, TRUE)
ON CONFLICT (code_attribut) DO NOTHING;

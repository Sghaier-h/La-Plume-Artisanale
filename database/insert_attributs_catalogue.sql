-- ============================================================================
-- INSERTION DES ATTRIBUTS DU CATALOGUE
-- ============================================================================
-- Script pour insérer tous les attributs (types, dimensions, tissages, finitions, couleurs)
-- depuis les données Excel
-- ============================================================================

-- Types de Tissages
INSERT INTO parametres_tissages (code, libelle, description, actif) VALUES
('EP', 'Eponge', 'Tissage éponge', true),
('JA', 'Tissage Jacquard', 'Tissage jacquard', true),
('MIX', 'Tissage Mixte', 'Tissage mixte', true),
('ND', 'Tissage Nid d''Abeille', 'Tissage nid d''abeille', true),
('PL', 'Tissage Plat', 'Tissage plat', true)
ON CONFLICT (code) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  description = EXCLUDED.description,
  actif = EXCLUDED.actif;

-- Dimensions avec codes
INSERT INTO parametres_dimensions (code, libelle, largeur, longueur, actif) VALUES
('1016', '100/160 CM', 100, 160, true),
('1020', '100/200 CM', 100, 200, true),
('1626', '160/260 CM', 160, 260, true),
('1824', '180/240 CM', 180, 240, true),
('2020', '200/200 CM', 200, 200, true),
('2030', '200/300 CM', 200, 300, true),
('2426', '240/260 CM', 240, 260, true),
('2430', '240/300 CM', 240, 300, true),
('2450', '240/500 CM', 240, 500, true),
('2624', '260/240 CM', 260, 240, true),
('0103', '15/35 CM', 15, 35, true),
('0404', '40/40 CM', 40, 40, true),
('0405', '40/50 CM', 40, 50, true),
('0406', '40/60 CM', 40, 60, true),
('0505', '50/50 CM', 50, 50, true),
('0506', '50/60 CM', 50, 60, true),
('0507', '50/70 CM', 50, 70, true),
('0714', '70/140 CM', 70, 140, true),
('0720', '70/200 CM', 70, 200, true),
('0917', '90/170 CM', 90, 170, true),
('0918', '90/180 CM', 90, 180, true),
('0919', '90/190 CM', 90, 190, true),
('ADU', 'ADULT', NULL, NULL, true),
('EN', 'ENFANT', NULL, NULL, true),
('STD', 'STANDART', NULL, NULL, true)
ON CONFLICT (code) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  largeur = EXCLUDED.largeur,
  longueur = EXCLUDED.longueur,
  actif = EXCLUDED.actif;

-- Types de Finitions
INSERT INTO parametres_finitions (code, libelle, description, actif) VALUES
('Cou', 'Couture', 'Finition par couture', true),
('FR', 'Frange', 'Finition avec frange', true),
('Fcourt', 'Frange Court', 'Finition avec frange courte', true),
('Fcroisé', 'Frange Croisé', 'Finition avec frange croisée', true),
('Our4', 'Ourlet 4 Face', 'Ourlet sur 4 faces', true),
('Our2', 'Ourlet 2 Face', 'Ourlet sur 2 faces', true),
('U', 'Uni', 'Finition unie', true)
ON CONFLICT (code) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  description = EXCLUDED.description,
  actif = EXCLUDED.actif;

-- Couleurs
INSERT INTO parametres_couleurs (code_commercial, nom, actif) VALUES
('C01', 'BLANC', true),
('C02', 'ECRU', true),
('C03', 'BEIGE', true),
('C04', 'NATUREL', true),
('C05', 'TERRA', true),
('C06', 'GRIS CLAIR', true),
('C07', 'GRIS MOYEN', true),
('C08', 'GRIS ANTHRACITE', true),
('C09', 'NOIR', true),
('C10', 'BLEU MARINE', true),
('C11', 'BLEU GITANE', true),
('C12', 'BLEU DELAVE', true),
('C13', 'BLEU ROI', true),
('C14', 'BLEU TURQUOISE', true),
('C15', 'LAGON', true),
('C16', 'BLEU CIEL', true),
('C17', 'EMERAUDE', true),
('C18', 'VERT D''EAU', true),
('C19', 'CEDRE', true),
('C20', 'VERT OLIVE', true),
('C21', 'VERT PISTACHE', true),
('C22', 'JAUNE SAFRAN', true),
('C23', 'OR', true),
('C24', 'ORANGE', true),
('C25', 'ROUGE FERRARI', true),
('C26', 'ROUGE BORDEAU', true),
('C27', 'FRAMBOISE', true),
('C28', 'FUSHIA', true),
('C29', 'PRALINE', true),
('C30', 'SAUMON', true),
('C31', 'ROSE PALE', true),
('C32', 'LILA', true),
('C33', 'VIOLET', true),
('C34', 'LIN', true),
('CLin', 'LIN', true),
('CLuAr', 'LUREX ARGENTE', true),
('CLuDo', 'LUREX DOREE', true)
ON CONFLICT (code_commercial) DO UPDATE SET
  nom = EXCLUDED.nom,
  actif = EXCLUDED.actif;

-- Création d'une table pour les Types de Produits si elle n'existe pas
CREATE TABLE IF NOT EXISTS parametres_types_produits (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Types de Produits
INSERT INTO parametres_types_produits (code, libelle, description, actif) VALUES
('CS', 'Coussin Sac', 'Coussin sac', true),
('ECH', 'Echarpe', 'Echarpe', true),
('FOU', 'Fouta', 'Fouta', true),
('FE', 'Fouta Enfant', 'Fouta pour enfant', true),
('FEP', 'Fouta Eponge', 'Fouta éponge', true),
('FP', 'Fouta Personnaliser', 'Fouta personnalisée', true),
('HC', 'Housse De Coussin', 'Housse de coussin', true),
('JET', 'Jeté', 'Jeté', true),
('PT', 'Pack Torchon', 'Pack torchon', true),
('POC', 'Pochette', 'Pochette', true),
('PON', 'Poncho', 'Poncho', true),
('SF', 'Sac Fouta', 'Sac fouta', true),
('SER', 'Serviette', 'Serviette', true),
('TB', 'Tote Bag', 'Tote bag', true)
ON CONFLICT (code) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  description = EXCLUDED.description,
  actif = EXCLUDED.actif;

-- Création d'une table pour le Nombre de Couleurs si elle n'existe pas
CREATE TABLE IF NOT EXISTS parametres_nombre_couleurs (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    nombre INTEGER NOT NULL,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nombre de Couleurs
INSERT INTO parametres_nombre_couleurs (code, libelle, nombre, actif) VALUES
('B', '2 Couleurs', 2, true),
('T', '3 Couleurs', 3, true),
('Q', '4 Couleurs', 4, true),
('C', '5 Couleurs', 5, true),
('S', '6 Couleurs', 6, true),
('U', 'Uni', 1, true)
ON CONFLICT (code) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  nombre = EXCLUDED.nombre,
  actif = EXCLUDED.actif;

-- Assurer que les colonnes existent dans articles_catalogue
DO $$
BEGIN
  -- Vérifier et ajouter les colonnes si elles n'existent pas déjà
  -- Ces colonnes peuvent déjà exister depuis 05_tables_catalogue.sql
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles_catalogue' AND column_name = 'id_type_produit'
  ) THEN
    ALTER TABLE articles_catalogue 
    ADD COLUMN id_type_produit INTEGER REFERENCES parametres_types_produits(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles_catalogue' AND column_name = 'id_nombre_couleurs'
  ) THEN
    ALTER TABLE articles_catalogue 
    ADD COLUMN id_nombre_couleurs INTEGER REFERENCES parametres_nombre_couleurs(id);
  END IF;
END $$;

-- Message de confirmation
DO $$
DECLARE
  v_tissages INTEGER;
  v_dimensions INTEGER;
  v_finitions INTEGER;
  v_couleurs INTEGER;
  v_types_produits INTEGER;
  v_nb_couleurs INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_tissages FROM parametres_tissages;
  SELECT COUNT(*) INTO v_dimensions FROM parametres_dimensions;
  SELECT COUNT(*) INTO v_finitions FROM parametres_finitions;
  SELECT COUNT(*) INTO v_couleurs FROM parametres_couleurs;
  SELECT COUNT(*) INTO v_types_produits FROM parametres_types_produits;
  SELECT COUNT(*) INTO v_nb_couleurs FROM parametres_nombre_couleurs;
  
  RAISE NOTICE '✅ Insertion des attributs catalogue terminée';
  RAISE NOTICE '   - Types de tissages: %', v_tissages;
  RAISE NOTICE '   - Dimensions: %', v_dimensions;
  RAISE NOTICE '   - Finitions: %', v_finitions;
  RAISE NOTICE '   - Couleurs: %', v_couleurs;
  RAISE NOTICE '   - Types de produits: %', v_types_produits;
  RAISE NOTICE '   - Nombre de couleurs: %', v_nb_couleurs;
END $$;

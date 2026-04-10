-- ============================================================================
-- IMPORT DES ATTRIBUTS - DONNÉES RÉELLES
-- ============================================================================
-- Script pour importer les attributs (types produits, modèles, dimensions, etc.)
-- Généré le: 2026-01-22
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. TYPES DE PRODUITS
-- ============================================================================

-- S'assurer que la table existe
CREATE TABLE IF NOT EXISTS parametres_types_produits (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des types de produits
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
('PON', 'Poncho Adulte', 'Poncho pour adulte', true),
('SF', 'Sac Fouta', 'Sac fouta', true),
('SER', 'Serviette', 'Serviette', true),
('TB', 'Tote Bag', 'Tote bag', true),
('PONE', 'Poncho Enfant', 'Poncho pour enfant', true)
ON CONFLICT (code) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  description = EXCLUDED.description,
  actif = EXCLUDED.actif;

-- ============================================================================
-- 2. TYPES DE TISSAGES
-- ============================================================================

-- S'assurer que la table existe
CREATE TABLE IF NOT EXISTS parametres_tissages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des types de tissages
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

-- ============================================================================
-- 3. DIMENSIONS
-- ============================================================================

-- S'assurer que la table existe
CREATE TABLE IF NOT EXISTS parametres_dimensions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    largeur DECIMAL(10,2),
    longueur DECIMAL(10,2),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des dimensions
INSERT INTO parametres_dimensions (code, libelle, largeur, longueur, actif) VALUES
('1016', '100/160 CM', 100, 160, true),
('1020', '100/200 CM', 100, 200, true),
('0103', '15/35 CM', 15, 35, true),
('1626', '160/260 CM', 160, 260, true),
('1824', '180/240 CM', 180, 240, true),
('2020', '200/200 CM', 200, 200, true),
('2030', '200/300 CM', 200, 300, true),
('2426', '240/260 CM', 240, 260, true),
('2430', '240/300 CM', 240, 300, true),
('0404', '40/40 CM', 40, 40, true),
('0405', '40/50 CM', 40, 50, true),
('0406', '40/60 CM', 40, 60, true),
('0507', '50/70 CM', 50, 70, true),
('0714', '70/140 CM', 70, 140, true),
('0720', '70/200 CM', 70, 200, true),
('0917', '90/170 CM', 90, 170, true),
('0918', '90/180 CM', 90, 180, true),
('0919', '90/190 CM', 90, 190, true),
('0505', '50/50 CM', 50, 50, true),
('2450', '240/500 CM', 240, 500, true),
('2624', '260/240 CM', 260, 240, true),
('ADU', 'ADULT', NULL, NULL, true),
('EN', 'ENFANT', NULL, NULL, true),
('STD', 'STANDART', NULL, NULL, true),
('0506', '50/60 CM', 50, 60, true)
ON CONFLICT (code) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  largeur = EXCLUDED.largeur,
  longueur = EXCLUDED.longueur,
  actif = EXCLUDED.actif;

-- ============================================================================
-- 4. TYPES DE FINITIONS
-- ============================================================================

-- S'assurer que la table existe
CREATE TABLE IF NOT EXISTS parametres_finitions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des types de finitions
INSERT INTO parametres_finitions (code, libelle, description, actif) VALUES
('Cou', 'Couture', 'Finition par couture', true),
('FR', 'Frange', 'Finition avec frange', true),
('Fcourt', 'Frange Court', 'Finition avec frange courte', true),
('Fcroisé', 'Frange Croisé', 'Finition avec frange croisée', true),
('Our4', 'Ourlet 4 Face', 'Ourlet sur 4 faces', true),
('Our2', 'Ourlet 2 Face', 'Ourlet sur 2 faces', true)
ON CONFLICT (code) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  description = EXCLUDED.description,
  actif = EXCLUDED.actif;

-- ============================================================================
-- 5. PERSONNALISATION
-- ============================================================================

-- S'assurer que la table existe
CREATE TABLE IF NOT EXISTS parametres_personnalisations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des options de personnalisation
INSERT INTO parametres_personnalisations (code, libelle, description, actif) VALUES
('OUI', 'Oui', 'Personnalisation disponible', true),
('NON', 'Non', 'Personnalisation non disponible', true)
ON CONFLICT (code) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  description = EXCLUDED.description,
  actif = EXCLUDED.actif;

-- ============================================================================
-- 6. NOMBRE DE COULEURS
-- ============================================================================

-- S'assurer que la table existe
CREATE TABLE IF NOT EXISTS parametres_nombre_couleurs (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    nombre INTEGER NOT NULL,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion du nombre de couleurs
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

-- ============================================================================
-- 7. COULEURS
-- ============================================================================

-- S'assurer que la table existe
CREATE TABLE IF NOT EXISTS parametres_couleurs (
    id SERIAL PRIMARY KEY,
    code_commercial VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    code_hex VARCHAR(7),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des couleurs
INSERT INTO parametres_couleurs (code_commercial, nom, actif) VALUES
('C01', 'Blanc', true),
('C02', 'Ecru', true),
('C03', 'Beige', true),
('C04', 'Naturel', true),
('C05', 'Terra', true),
('C06', 'Gris Clair', true),
('C07', 'Gris Moyen', true),
('C08', 'Gris Anthracite', true),
('C09', 'Noir', true),
('C10', 'Bleu Marine', true),
('C11', 'Bleu Gitane', true),
('C12', 'Bleu Delave', true),
('C13', 'Bleu roi', true),
('C14', 'Bleu Turquoise', true),
('C15', 'Lagon', true),
('C16', 'Bleu Ciel', true),
('C17', 'Emeraude', true),
('C18', 'Vert d''eau', true),
('C19', 'Cedre', true),
('C20', 'Vert Olive', true),
('C21', 'Vert Pistache', true),
('C22', 'Jaune Safran', true),
('C23', 'Or', true),
('C24', 'Jaune Safran', true),
('C25', 'Orange', true),
('C26', 'Rouge Ferrari', true),
('C27', 'Rouge Bordeau', true),
('C28', 'Framboise', true),
('C29', 'Fushia', true),
('C30', 'Praline', true),
('C31', 'Saumon', true),
('C32', 'Rose Pale', true),
('C33', 'Lila', true),
('C34', 'Violet', true),
('CLin', 'Lin', true),
('CLuAr', 'Lurex Argenté', true),
('CLuDo', 'Lurex Dorée', true)
ON CONFLICT (code_commercial) DO UPDATE SET
  nom = EXCLUDED.nom,
  actif = EXCLUDED.actif;

-- ============================================================================
-- 8. MODÈLES
-- ============================================================================

-- S'assurer que la table existe
CREATE TABLE IF NOT EXISTS parametres_modeles (
    id SERIAL PRIMARY KEY,
    code_modele VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des modèles
INSERT INTO parametres_modeles (code_modele, libelle, description, actif) VALUES
('AR', 'ARTHUR', 'Modèle ARTHUR', true),
('BAL', 'BALI', 'Modèle BALI', true),
('BA', 'BASQUE', 'Modèle BASQUE', true),
('BE', 'BERBER', 'Modèle BERBER', true),
('BIB', 'BIBI', 'Modèle BIBI', true),
('CH', 'CHEVRON', 'Modèle CHEVRON', true),
('CHB', 'CHEVRON BANDE', 'Modèle CHEVRON BANDE', true),
('DEC', 'DECO', 'Modèle DECO', true),
('DEG', 'DEGRADER', 'Modèle DEGRADER', true),
('DL', 'DEGRADER DE LUREX', 'Modèle DEGRADER DE LUREX', true),
('ECH', 'CHEVRON', 'Modèle CHEVRON', true),
('FAF', 'FIL A FIL', 'Modèle FIL A FIL', true),
('FI', 'FIVE', 'Modèle FIVE', true),
('FP', 'FOUTA PERSONNALISER', 'Modèle FOUTA PERSONNALISER', true),
('GIN', 'GINKO', 'Modèle GINKO', true),
('HCNAT', 'NATTE', 'Modèle NATTE', true),
('HCRE', 'RELIEF', 'Modèle RELIEF', true),
('IB', 'IBIZA', 'Modèle IBIZA', true),
('INS', 'INSPIRATION', 'Modèle INSPIRATION', true),
('IS', 'ISTANBUL', 'Modèle ISTANBUL', true),
('KA', 'KAIROUAN', 'Modèle KAIROUAN', true),
('LI', 'LILI', 'Modèle LILI', true),
('LIL', 'LILI LUREX', 'Modèle LILI LUREX', true),
('LO', 'LONDON', 'Modèle LONDON', true),
('LOZ', 'LOZANGE', 'Modèle LOZANGE', true),
('MAL', 'MALIBU', 'Modèle MALIBU', true),
('EPMA', 'MARINIERE', 'Modèle MARINIERE', true),
('MA', 'MARINIERE', 'Modèle MARINIERE', true),
('MEA', 'MEANDRO', 'Modèle MEANDRO', true),
('MON', 'MONTAGNIA', 'Modèle MONTAGNIA', true),
('NAT', 'NATTE', 'Modèle NATTE', true),
('NA', 'NATURE', 'Modèle NATURE', true),
('NDAR', 'ND ARCACHON', 'Modèle ND ARCACHON', true),
('NDBA', 'ND BASQUE', 'Modèle ND BASQUE', true),
('NDBI', 'ND BIARRITZ', 'Modèle ND BIARRITZ', true),
('NDFI', 'ND FIVE', 'Modèle ND FIVE', true),
('NDFL', 'ND FLY', 'Modèle ND FLY', true),
('NDF', 'ND FOULA', 'Modèle ND FOULA', true),
('NDH', 'ND HOSSEGOR', 'Modèle ND HOSSEGOR', true),
('NDL', 'ND LILI', 'Modèle ND LILI', true),
('NDLIL', 'ND LILI LUREX', 'Modèle ND LILI LUREX', true),
('NDLO', 'ND LONDON', 'Modèle ND LONDON', true),
('NDMA', 'ND MARINIERE', 'Modèle ND MARINIERE', true),
('NDU', 'ND UNI', 'Modèle ND UNI', true),
('OLI', 'OLIVIER', 'Modèle OLIVIER', true),
('PACKCHI', 'CHIC', 'Modèle CHIC', true),
('PACKCL', 'CLASSIQUE', 'Modèle CLASSIQUE', true),
('PACKLO', 'LONDON', 'Modèle LONDON', true),
('PIC', 'PICASSO', 'Modèle PICASSO', true),
('POU', 'POCHETTE UNI', 'Modèle POCHETTE UNI', true),
('PONBI', 'BICOULEUR', 'Modèle BICOULEUR', true),
('PONU', 'UNI', 'Modèle UNI', true),
('RE', 'RELIEF', 'Modèle RELIEF', true),
('RON', 'RONDA', 'Modèle RONDA', true),
('SACFNDL', 'ND LILI', 'Modèle ND LILI', true),
('SIB', 'IBIZA', 'Modèle IBIZA', true),
('SO', 'SOUSSE', 'Modèle SOUSSE', true),
('EPST', 'ST TROPEZ', 'Modèle ST TROPEZ', true),
('ST', 'ST TROPEZ', 'Modèle ST TROPEZ', true),
('TAH', 'TAHITI', 'Modèle TAHITI', true),
('TB', 'UNI', 'Modèle UNI', true),
('TU', 'TURC', 'Modèle TURC', true),
('EPU', 'UNI', 'Modèle UNI', true),
('U', 'UNI', 'Modèle UNI', true),
('HCUNS', 'UNI SURPIQUE', 'Modèle UNI SURPIQUE', true),
('UNS', 'UNI SURPIQUE', 'Modèle UNI SURPIQUE', true),
('VE', 'VERONE', 'Modèle VERONE', true),
('ANA', 'ARTISANAT', 'Modèle ARTISANAT', true),
('AZU', 'AZUL', 'Modèle AZUL', true),
('BRI', 'BRISE', 'Modèle BRISE', true),
('COC', 'COCON', 'Modèle COCON', true),
('COR', 'CORAIL', 'Modèle CORAIL', true),
('CSIB', 'IBIZA', 'Modèle IBIZA', true),
('CSMA', 'MARINIERE', 'Modèle MARINIERE', true),
('DUN', 'DUNE', 'Modèle DUNE', true),
('ECU', 'ECUME', 'Modèle ECUME', true),
('NUA', 'NUAGE', 'Modèle NUAGE', true),
('SAB', 'SABLE', 'Modèle SABLE', true),
('SACJ', 'SAC JUTE', 'Modèle SAC JUTE', true),
('VAG', 'VAGUE', 'Modèle VAGUE', true),
('TAS', 'TASMANIE', 'Modèle TASMANIE', true),
('EPIB', 'IBIZA', 'Modèle IBIZA', true),
('TDL', 'TUNIQUE DEGRADER DE LUREX', 'Modèle TUNIQUE DEGRADER DE LUREX', true),
('RESF', 'RELIEF', 'Modèle RELIEF', true),
('VIO', 'VIOLET', 'Modèle VIOLET', true),
('SAN', 'SANDRINE', 'Modèle SANDRINE', true),
('MAX', 'MAXIME', 'Modèle MAXIME', true),
('PHU', 'PHUKET', 'Modèle PHUKET', true)
ON CONFLICT (code_modele) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  description = EXCLUDED.description,
  actif = EXCLUDED.actif;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

DO $$
DECLARE
  v_count_types INTEGER;
  v_count_tissages INTEGER;
  v_count_dimensions INTEGER;
  v_count_finitions INTEGER;
  v_count_personnalisations INTEGER;
  v_count_nb_couleurs INTEGER;
  v_count_couleurs INTEGER;
  v_count_modeles INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count_types FROM parametres_types_produits;
  SELECT COUNT(*) INTO v_count_tissages FROM parametres_tissages;
  SELECT COUNT(*) INTO v_count_dimensions FROM parametres_dimensions;
  SELECT COUNT(*) INTO v_count_finitions FROM parametres_finitions;
  SELECT COUNT(*) INTO v_count_personnalisations FROM parametres_personnalisations;
  SELECT COUNT(*) INTO v_count_nb_couleurs FROM parametres_nombre_couleurs;
  SELECT COUNT(*) INTO v_count_couleurs FROM parametres_couleurs;
  SELECT COUNT(*) INTO v_count_modeles FROM parametres_modeles;
  RAISE NOTICE '✅ Types de produits importés: %', v_count_types;
  RAISE NOTICE '✅ Types de tissages importés: %', v_count_tissages;
  RAISE NOTICE '✅ Dimensions importées: %', v_count_dimensions;
  RAISE NOTICE '✅ Types de finitions importés: %', v_count_finitions;
  RAISE NOTICE '✅ Options de personnalisation importées: %', v_count_personnalisations;
  RAISE NOTICE '✅ Nombre de couleurs importés: %', v_count_nb_couleurs;
  RAISE NOTICE '✅ Couleurs importées: %', v_count_couleurs;
  RAISE NOTICE '✅ Modèles importés: %', v_count_modeles;
END $$;

COMMIT;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

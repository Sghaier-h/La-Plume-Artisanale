-- ============================================================================
-- MISE À JOUR DES MODÈLES - DONNÉES RÉELLES
-- ============================================================================
-- Script pour mettre à jour les modèles existants avec leurs relations
-- (Type Produit, Type Tissage) et générer les descriptions
-- Généré le: 2026-01-22
-- Description: Format "Type de Produit Modèle Nom du Modèle"
-- ============================================================================
-- 
-- IMPORTANT: Les modèles existent déjà dans parametres_modeles (95 modèles de base)
-- Ce script met à jour les relations (id_type_produit, id_tissage) et les descriptions
-- Le code_modele est UNIQUE, donc si un code apparaît plusieurs fois dans les données,
-- on prend la première occurrence
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. MISE À JOUR DE LA STRUCTURE DE LA TABLE
-- ============================================================================

-- Ajouter les colonnes pour les relations si elles n'existent pas
DO $$
BEGIN
    -- Ajouter id_type_produit si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parametres_modeles' 
        AND column_name = 'id_type_produit'
    ) THEN
        ALTER TABLE parametres_modeles 
        ADD COLUMN id_type_produit INTEGER REFERENCES parametres_types_produits(id);
        
        RAISE NOTICE 'Colonne id_type_produit ajoutee a parametres_modeles';
    END IF;

    -- Ajouter id_tissage si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parametres_modeles' 
        AND column_name = 'id_tissage'
    ) THEN
        ALTER TABLE parametres_modeles 
        ADD COLUMN id_tissage INTEGER REFERENCES parametres_tissages(id);
        
        RAISE NOTICE 'Colonne id_tissage ajoutee a parametres_modeles';
    END IF;

    -- Ajouter colonne photo si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parametres_modeles' 
        AND column_name = 'photo_url'
    ) THEN
        ALTER TABLE parametres_modeles 
        ADD COLUMN photo_url VARCHAR(500);
        
        RAISE NOTICE 'Colonne photo_url ajoutee a parametres_modeles';
    END IF;
END $$;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_modeles_type_produit ON parametres_modeles(id_type_produit);
CREATE INDEX IF NOT EXISTS idx_modeles_tissage ON parametres_modeles(id_tissage);

-- ============================================================================
-- 2. MISE À JOUR DES MODÈLES EXISTANTS
-- ============================================================================

-- Mise à jour des modèles avec leurs relations et descriptions
-- On utilise DISTINCT ON pour ne garder qu'une seule occurrence par code_modele
UPDATE parametres_modeles pm
SET 
    libelle = COALESCE(m.libelle, pm.libelle),
    description = COALESCE(m.description, pm.description),
    id_type_produit = COALESCE(tp_code.id, tp_libelle.id, pm.id_type_produit),
    id_tissage = COALESCE(t.id, pm.id_tissage),
    actif = COALESCE(m.actif, pm.actif)
FROM (
    SELECT DISTINCT ON (code_modele)
        code_modele,
        libelle,
        description,
        code_type_produit,
        libelle_type_produit,
        code_tissage,
        actif
    FROM (VALUES
        ('AR', 'ARTHUR', 'Fouta Modèle ARTHUR', 'FOU', 'Fouta', 'PL', true),
        ('ANA', 'ARTISANAT', 'Jeté Modèle ARTISANAT', 'JET', 'Jeté', 'PL', true),
        ('AZU', 'AZUL', 'Fouta Modèle AZUL', 'FOU', 'Fouta', 'JA', true),
        ('BAL', 'BALI', 'Fouta Modèle BALI', 'FOU', 'Fouta', 'PL', true),
        ('BA', 'BASQUE', 'Fouta Modèle BASQUE', 'FOU', 'Fouta', 'PL', true),
        ('BE', 'BERBER', 'Fouta Modèle BERBER', 'FOU', 'Fouta', 'PL', true),
        ('BIB', 'BIBI', 'Fouta Modèle BIBI', 'FOU', 'Fouta', 'PL', true),
        ('BRI', 'BRISE', 'Fouta Modèle BRISE', 'FOU', 'Fouta', 'JA', true),
        ('CHB', 'CHEVRON BANDE', 'Fouta Modèle CHEVRON BANDE', 'FOU', 'Fouta', 'JA', true),
        ('COC', 'COCON', 'Fouta Modèle COCON', 'FOU', 'Fouta', 'JA', true),
        ('COR', 'CORAIL', 'Fouta Modèle CORAIL', 'FOU', 'Fouta', 'JA', true),
        ('CSIB', 'IBIZA', 'Coussin Sac Modèle IBIZA', 'CS', 'Coussin Sac', 'PL', true),
        ('CSMA', 'MARINIERE', 'Coussin Sac Modèle MARINIERE', 'CS', 'Coussin Sac', 'PL', true),
        ('DEC', 'DECO', 'Jeté Modèle DECO', 'JET', 'Jeté', 'JA', true),
        ('DEG', 'DEGRADER', 'Fouta Modèle DEGRADER', 'FOU', 'Fouta', 'PL', true),
        ('DL', 'DEGRADER DE LUREX', 'Fouta Modèle DEGRADER DE LUREX', 'FOU', 'Fouta', 'PL', true),
        ('TDL', 'TUNIQUE DEGRADER DE LUREX', 'Tunique Longue Modèle TUNIQUE DEGRADER DE LUREX', NULL, 'Tunique Longue', 'PL', true),
        ('DUN', 'DUNE', 'Fouta Modèle DUNE', 'FOU', 'Fouta', 'JA', true),
        ('ECH', 'CHEVRON', 'Echarpe Modèle CHEVRON', 'ECH', 'Echarpe', 'JA', true),
        ('ECU', 'ECUME', 'Fouta Modèle ECUME', 'FOU', 'Fouta', 'PL', true),
        ('FAF', 'FIL A FIL', 'Fouta Modèle FIL A FIL', 'FOU', 'Fouta', 'PL', true),
        ('FI', 'FIVE', 'Fouta Modèle FIVE', 'FOU', 'Fouta', 'PL', true),
        ('GIN', 'GINKO', 'Fouta Modèle GINKO', 'FOU', 'Fouta', 'JA', true),
        ('EPIB', 'IBIZA', 'Fouta Eponge Modèle IBIZA', 'FEP', 'Fouta Eponge', 'EP', true),
        ('IB', 'IBIZA', 'Fouta Modèle IBIZA', 'FOU', 'Fouta', 'PL', true),
        ('SIB', 'IBIZA', 'Serviette Modèle IBIZA', 'SER', 'Serviette', 'PL', true),
        ('INS', 'INSPIRATION', 'Fouta Modèle INSPIRATION', 'FOU', 'Fouta', 'JA', true),
        ('IS', 'ISTANBUL', 'Fouta Modèle ISTANBUL', 'FOU', 'Fouta', 'PL', true),
        ('KA', 'KAIROUAN', 'Fouta Modèle KAIROUAN', 'FOU', 'Fouta', 'PL', true),
        ('LI', 'LILI', 'Fouta Modèle LILI', 'FOU', 'Fouta', 'PL', true),
        ('LIL', 'LILI LUREX', 'Fouta Modèle LILI LUREX', 'FOU', 'Fouta', 'PL', true),
        ('LO', 'LONDON', 'Fouta Modèle LONDON', 'FOU', 'Fouta', 'JA', true),
        ('LOZ', 'LOZANGE', 'Fouta Modèle LOZANGE', 'FOU', 'Fouta', 'JA', true),
        ('EPMA', 'MARINIERE', 'Fouta Eponge Modèle MARINIERE', 'FEP', 'Fouta Eponge', 'EP', true),
        ('MEA', 'MEANDRO', 'Jeté Modèle MEANDRO', 'JET', 'Jeté', 'JA', true),
        ('MON', 'MONTAGNIA', 'Jeté Modèle MONTAGNIA', 'JET', 'Jeté', 'JA', true),
        ('NAT', 'NATTE', 'Fouta Modèle NATTE', 'FOU', 'Fouta', 'JA', true),
        ('NA', 'NATURE', 'Jeté Modèle NATURE', 'JET', 'Jeté', 'JA', true),
        ('NDBI', 'ND BIARRITZ', 'Fouta Modèle ND BIARRITZ', 'FOU', 'Fouta', 'ND', true),
        ('NDFI', 'ND FIVE', 'Fouta Modèle ND FIVE', 'FOU', 'Fouta', 'ND', true),
        ('NDFL', 'ND FLY', 'Fouta Modèle ND FLY', 'FOU', 'Fouta', 'ND', true),
        ('NDF', 'ND FOULA', 'Fouta Modèle ND FOULA', 'FOU', 'Fouta', 'ND', true),
        ('NDH', 'ND HOSSEGOR', 'Fouta Modèle ND HOSSEGOR', 'FOU', 'Fouta', 'ND', true),
        ('NDL', 'ND LILI', 'Fouta Modèle ND LILI', 'FOU', 'Fouta', 'ND', true),
        ('NDLO', 'ND LONDON', 'Fouta Modèle ND LONDON', 'FOU', 'Fouta', 'ND', true),
        ('NDU', 'ND UNI', 'Fouta Modèle ND UNI', 'FOU', 'Fouta', 'ND', true),
        ('NUA', 'NUAGE', 'Fouta Modèle NUAGE', 'FOU', 'Fouta', 'JA', true),
        ('OLI', 'OLIVIER', 'Jeté Modèle OLIVIER', 'JET', 'Jeté', 'JA', true),
        ('PACKCHI', 'CHIC', 'Pack Torchon Modèle CHIC', 'PT', 'Pack Torchon', 'MIX', true),
        ('PACKCL', 'CLASSIQUE', 'Pack Torchon Modèle CLASSIQUE', 'PT', 'Pack Torchon', 'MIX', true),
        ('PACKLO', 'LONDON', 'Pack Torchon Modèle LONDON', 'PT', 'Pack Torchon', 'MIX', true),
        ('PIC', 'PICASSO', 'Jeté Modèle PICASSO', 'JET', 'Jeté', 'JA', true),
        ('PONBI', 'BICOULEUR', 'Poncho Adulte Modèle BICOULEUR', 'PON', 'Poncho Adulte', 'EP', true),
        ('PONU', 'UNI', 'Poncho Adulte Modèle UNI', 'PON', 'Poncho Adulte', 'EP', true),
        ('HCRE', 'RELIEF', 'Housse De Coussin Modèle RELIEF', 'HC', 'Housse De Coussin', 'JA', true),
        ('RE', 'RELIEF', 'Jeté Modèle RELIEF', 'JET', 'Jeté', 'JA', true),
        ('RON', 'RONDA', 'Jeté Modèle RONDA', 'JET', 'Jeté', 'JA', true),
        ('SAB', 'SABLE', 'Fouta Modèle SABLE', 'FOU', 'Fouta', 'JA', true),
        ('SACJ', 'SAC JUTE', 'Sac de Plage Modèle SAC JUTE', NULL, 'Sac de Plage', 'PL', true),
        ('SO', 'SOUSSE', 'Fouta Modèle SOUSSE', 'FOU', 'Fouta', 'PL', true),
        ('EPST', 'ST TROPEZ', 'Fouta Eponge Modèle ST TROPEZ', 'FEP', 'Fouta Eponge', 'EP', true),
        ('TAH', 'TAHITI', 'Fouta Modèle TAHITI', 'FOU', 'Fouta', 'PL', true),
        ('TAS', 'TASMANIE', 'Fouta Modèle TASMANIE', 'FOU', 'Fouta', 'PL', true),
        ('TB', 'UNI', 'Tote Bag Modèle UNI', 'TB', 'Tote Bag', 'PL', true),
        ('EPU', 'UNI', 'Fouta Eponge Modèle UNI', 'FEP', 'Fouta Eponge', 'EP', true),
        ('UNS', 'UNI SURPIQUE', 'Fouta Modèle UNI SURPIQUE', 'FOU', 'Fouta', 'PL', true),
        ('VAG', 'VAGUE', 'Fouta Modèle VAGUE', 'FOU', 'Fouta', 'JA', true),
        ('VE', 'VERONE', 'Fouta Modèle VERONE', 'FOU', 'Fouta', 'JA', true),
        ('SACFNDL', 'ND LILI', 'Sac Fouta Modèle ND LILI', 'SF', 'Sac Fouta', 'MIX', true),
        ('VIO', 'VIOLET', 'Jeté Modèle VIOLET', 'JET', 'Jeté', 'JA', true),
        ('SAN', 'SANDRINE', 'Fouta Modèle SANDRINE', 'FOU', 'Fouta', 'PL', true),
        ('MAX', 'MAXIME', 'Fouta Modèle MAXIME', 'FOU', 'Fouta', 'MIX', true),
        ('PHU', 'PHUKET', 'Fouta Modèle PHUKET', 'FOU', 'Fouta', 'PL', true)
    ) AS m(code_modele, libelle, description, code_type_produit, libelle_type_produit, code_tissage, actif)
    WHERE code_modele IS NOT NULL AND code_modele != ''
    ORDER BY code_modele, libelle
) AS m
LEFT JOIN parametres_types_produits tp_code ON tp_code.code = m.code_type_produit
LEFT JOIN parametres_types_produits tp_libelle ON tp_libelle.libelle = m.libelle_type_produit AND m.code_type_produit IS NULL
LEFT JOIN parametres_tissages t ON t.code = m.code_tissage
WHERE pm.code_modele = m.code_modele;

-- ============================================================================
-- 3. VÉRIFICATION
-- ============================================================================

DO $$
DECLARE
    v_count INTEGER;
    v_avec_type_produit INTEGER;
    v_avec_tissage INTEGER;
    v_avec_description INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM parametres_modeles;
    SELECT COUNT(*) INTO v_avec_type_produit FROM parametres_modeles WHERE id_type_produit IS NOT NULL;
    SELECT COUNT(*) INTO v_avec_tissage FROM parametres_modeles WHERE id_tissage IS NOT NULL;
    SELECT COUNT(*) INTO v_avec_description FROM parametres_modeles WHERE description IS NOT NULL AND description != '';
    
    RAISE NOTICE 'Total modeles dans la base: %', v_count;
    RAISE NOTICE 'Modeles avec type produit: %', v_avec_type_produit;
    RAISE NOTICE 'Modeles avec type tissage: %', v_avec_tissage;
    RAISE NOTICE 'Modeles avec description: %', v_avec_description;
END $$;

COMMIT;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
-- 
-- NOTE: Les descriptions sont generees automatiquement au format:
-- "Type de Produit Modèle Nom du Modèle"
-- 
-- Les descriptions peuvent etre modifiees manuellement dans l'interface
-- Une colonne photo_url a ete ajoutee pour stocker les photos des modeles
-- ============================================================================

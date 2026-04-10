-- ============================================================================
-- IMPORT DES MODÈLES - DONNÉES RÉELLES
-- ============================================================================
-- Script pour importer les modèles avec leurs relations (Type Produit, Type Tissage)
-- Généré le: 2026-01-22
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
        
        RAISE NOTICE '✅ Colonne id_type_produit ajoutée à parametres_modeles';
    END IF;

    -- Ajouter id_tissage si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parametres_modeles' 
        AND column_name = 'id_tissage'
    ) THEN
        ALTER TABLE parametres_modeles 
        ADD COLUMN id_tissage INTEGER REFERENCES parametres_tissages(id);
        
        RAISE NOTICE '✅ Colonne id_tissage ajoutée à parametres_modeles';
    END IF;
END $$;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_modeles_type_produit ON parametres_modeles(id_type_produit);
CREATE INDEX IF NOT EXISTS idx_modeles_tissage ON parametres_modeles(id_tissage);

-- ============================================================================
-- 2. IMPORT DES MODÈLES
-- ============================================================================
-- 
-- Structure attendue pour chaque modèle :
-- - code_modele : Code unique du modèle (ex: AR, BAL, BA, etc.)
-- - libelle : Nom du modèle (ex: ARTHUR, BALI, BASQUE, etc.)
-- - description : Description complète (ex: "Fouta Modèle ARTHUR")
-- - id_type_produit : ID du type de produit (référence vers parametres_types_produits)
-- - id_tissage : ID du type de tissage (référence vers parametres_tissages)
-- - actif : true/false
--
-- NOTE: Les données seront ajoutées ci-dessous après validation avec l'utilisateur
-- ============================================================================

-- Exemple de structure d'insertion (à remplacer par les vraies données) :
/*
INSERT INTO parametres_modeles (code_modele, libelle, description, id_type_produit, id_tissage, actif)
SELECT 
    m.code_modele,
    m.libelle,
    m.description,
    tp.id as id_type_produit,
    t.id as id_tissage,
    m.actif
FROM (VALUES
    -- Format: (code_modele, libelle, description, code_type_produit, code_tissage, actif)
    ('AR', 'ARTHUR', 'Fouta Modèle ARTHUR', 'FOU', 'PL', true),
    ('BAL', 'BALI', 'Fouta Modèle BALI', 'FOU', 'PL', true)
    -- ... autres modèles
) AS m(code_modele, libelle, description, code_type_produit, code_tissage, actif)
LEFT JOIN parametres_types_produits tp ON tp.code = m.code_type_produit
LEFT JOIN parametres_tissages t ON t.code = m.code_tissage
ON CONFLICT (code_modele) DO UPDATE SET
    libelle = EXCLUDED.libelle,
    description = EXCLUDED.description,
    id_type_produit = EXCLUDED.id_type_produit,
    id_tissage = EXCLUDED.id_tissage,
    actif = EXCLUDED.actif;
*/

-- ============================================================================
-- 3. VÉRIFICATION
-- ============================================================================

DO $$
DECLARE
    v_count_modeles INTEGER;
    v_count_avec_type_produit INTEGER;
    v_count_avec_tissage INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count_modeles FROM parametres_modeles;
    SELECT COUNT(*) INTO v_count_avec_type_produit 
    FROM parametres_modeles 
    WHERE id_type_produit IS NOT NULL;
    SELECT COUNT(*) INTO v_count_avec_tissage 
    FROM parametres_modeles 
    WHERE id_tissage IS NOT NULL;
    
    RAISE NOTICE '✅ Total modèles: %', v_count_modeles;
    RAISE NOTICE '✅ Modèles avec type produit: %', v_count_avec_type_produit;
    RAISE NOTICE '✅ Modèles avec type tissage: %', v_count_avec_tissage;
END $$;

COMMIT;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
-- 
-- PROCHAINES ÉTAPES:
-- 1. Examiner les données avec l'utilisateur
-- 2. Générer les INSERT avec les bonnes relations
-- 3. Exécuter le script final
-- ============================================================================

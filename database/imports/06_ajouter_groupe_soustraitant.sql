-- ============================================================================
-- AJOUT DU GROUPE SOUSTRAITANT
-- ============================================================================
-- Script pour ajouter le groupe "Soustraitant" à la table groupes
-- ============================================================================

BEGIN;

-- Ajouter le groupe Soustraitant
INSERT INTO groupes (code_groupe, libelle, description, actif) VALUES
('SOU', 'Soustraitant', 'Groupe des soustraitants', true)
ON CONFLICT (code_groupe) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  description = EXCLUDED.description,
  actif = EXCLUDED.actif,
  date_modification = CURRENT_TIMESTAMP;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    v_groupes INTEGER;
    rec RECORD;
BEGIN
    SELECT COUNT(*) INTO v_groupes FROM groupes WHERE actif = true;
    RAISE NOTICE 'Groupes actifs: %', v_groupes;
    
    -- Afficher tous les groupes
    RAISE NOTICE 'Groupes disponibles:';
    FOR rec IN SELECT code_groupe, libelle FROM groupes WHERE actif = true ORDER BY code_groupe
    LOOP
        RAISE NOTICE '  - %: %', rec.code_groupe, rec.libelle;
    END LOOP;
END $$;

COMMIT;

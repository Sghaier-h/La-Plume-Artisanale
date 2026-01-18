-- ============================================================================
-- AJOUT DES CHAMPS created_by, updated_by DANS LES TABLES PRINCIPALES
-- ============================================================================
-- Ce script ajoute les colonnes created_by et updated_by dans toutes les 
-- tables principales du système pour la traçabilité complète.
-- ============================================================================

-- Fonction pour vérifier si une colonne existe
CREATE OR REPLACE FUNCTION column_exists(p_table_name TEXT, p_column_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
        AND c.table_name = p_table_name
        AND c.column_name = p_column_name
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MODULE VENTES (certaines tables ont déjà created_by, on complète)
-- ============================================================================

-- DEVIS : Ajouter updated_by si manquant
DO $$
BEGIN
    IF NOT column_exists('devis', 'updated_by') THEN
        ALTER TABLE devis ADD COLUMN updated_by INTEGER;
    END IF;
END $$;

-- BONS DE LIVRAISON : Ajouter updated_by si manquant
DO $$
BEGIN
    IF NOT column_exists('bons_livraison', 'updated_by') THEN
        ALTER TABLE bons_livraison ADD COLUMN updated_by INTEGER;
    END IF;
END $$;

-- FACTURES : Ajouter updated_by si manquant
DO $$
BEGIN
    IF NOT column_exists('factures', 'updated_by') THEN
        ALTER TABLE factures ADD COLUMN updated_by INTEGER;
    END IF;
END $$;

-- AVOIRS : Ajouter updated_by si manquant
DO $$
BEGIN
    IF NOT column_exists('avoirs', 'updated_by') THEN
        ALTER TABLE avoirs ADD COLUMN updated_by INTEGER;
    END IF;
END $$;

-- BONS RETOUR : Ajouter updated_by si manquant
DO $$
BEGIN
    IF NOT column_exists('bons_retour', 'updated_by') THEN
        ALTER TABLE bons_retour ADD COLUMN updated_by INTEGER;
    END IF;
END $$;

-- ============================================================================
-- MODULE CLIENTS ET FOURNISSEURS
-- ============================================================================

-- CLIENTS
DO $$
BEGIN
    IF NOT column_exists('clients', 'created_by') THEN
        ALTER TABLE clients ADD COLUMN created_by INTEGER;
    END IF;
    IF NOT column_exists('clients', 'updated_by') THEN
        ALTER TABLE clients ADD COLUMN updated_by INTEGER;
    END IF;
END $$;

-- FOURNISSEURS
DO $$
BEGIN
    IF NOT column_exists('fournisseurs', 'created_by') THEN
        ALTER TABLE fournisseurs ADD COLUMN created_by INTEGER;
    END IF;
    IF NOT column_exists('fournisseurs', 'updated_by') THEN
        ALTER TABLE fournisseurs ADD COLUMN updated_by INTEGER;
    END IF;
END $$;

-- ============================================================================
-- MODULE PRODUCTION
-- ============================================================================

-- ORDRES DE FABRICATION
DO $$
BEGIN
    IF NOT column_exists('ordres_fabrication', 'created_by') THEN
        ALTER TABLE ordres_fabrication ADD COLUMN created_by INTEGER;
    END IF;
    IF NOT column_exists('ordres_fabrication', 'updated_by') THEN
        ALTER TABLE ordres_fabrication ADD COLUMN updated_by INTEGER;
    END IF;
END $$;

-- SUIVI FABRICATION
DO $$
BEGIN
    IF NOT column_exists('suivi_fabrication', 'created_by') THEN
        ALTER TABLE suivi_fabrication ADD COLUMN created_by INTEGER;
    END IF;
    IF NOT column_exists('suivi_fabrication', 'updated_by') THEN
        ALTER TABLE suivi_fabrication ADD COLUMN updated_by INTEGER;
    END IF;
END $$;

-- COMMANDES
DO $$
BEGIN
    IF NOT column_exists('commandes', 'created_by') THEN
        ALTER TABLE commandes ADD COLUMN created_by INTEGER;
    END IF;
    IF NOT column_exists('commandes', 'updated_by') THEN
        ALTER TABLE commandes ADD COLUMN updated_by INTEGER;
    END IF;
END $$;

-- ============================================================================
-- MODULE STOCK
-- ============================================================================

-- ARTICLES CATALOGUE
DO $$
BEGIN
    IF NOT column_exists('articles_catalogue', 'created_by') THEN
        ALTER TABLE articles_catalogue ADD COLUMN created_by INTEGER;
    END IF;
    IF NOT column_exists('articles_catalogue', 'updated_by') THEN
        ALTER TABLE articles_catalogue ADD COLUMN updated_by INTEGER;
    END IF;
END $$;

-- MATIERES PREMIERES
DO $$
BEGIN
    IF NOT column_exists('matieres_premieres', 'created_by') THEN
        ALTER TABLE matieres_premieres ADD COLUMN created_by INTEGER;
    END IF;
    IF NOT column_exists('matieres_premieres', 'updated_by') THEN
        ALTER TABLE matieres_premieres ADD COLUMN updated_by INTEGER;
    END IF;
END $$;

-- MACHINES
DO $$
BEGIN
    IF NOT column_exists('machines', 'created_by') THEN
        ALTER TABLE machines ADD COLUMN created_by INTEGER;
    END IF;
    IF NOT column_exists('machines', 'updated_by') THEN
        ALTER TABLE machines ADD COLUMN updated_by INTEGER;
    END IF;
END $$;

-- ============================================================================
-- MODULE SOUS-TRAITANCE
-- ============================================================================

-- SOUS_TRAITANTS
DO $$
BEGIN
    IF NOT column_exists('sous_traitants', 'created_by') THEN
        ALTER TABLE sous_traitants ADD COLUMN created_by INTEGER;
    END IF;
    IF NOT column_exists('sous_traitants', 'updated_by') THEN
        ALTER TABLE sous_traitants ADD COLUMN updated_by INTEGER;
    END IF;
END $$;

-- MOUVEMENTS_SOUS_TRAITANCE
DO $$
BEGIN
    IF NOT column_exists('mouvements_sous_traitance', 'created_by') THEN
        ALTER TABLE mouvements_sous_traitance ADD COLUMN created_by INTEGER;
    END IF;
    IF NOT column_exists('mouvements_sous_traitance', 'updated_by') THEN
        ALTER TABLE mouvements_sous_traitance ADD COLUMN updated_by INTEGER;
    END IF;
END $$;

-- ============================================================================
-- MODULE QUALITE
-- ============================================================================

-- QUALITE_AVANCEE (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'qualite_avancee') THEN
        IF NOT column_exists('qualite_avancee', 'created_by') THEN
            ALTER TABLE qualite_avancee ADD COLUMN created_by INTEGER;
        END IF;
        IF NOT column_exists('qualite_avancee', 'updated_by') THEN
            ALTER TABLE qualite_avancee ADD COLUMN updated_by INTEGER;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- COMMENTAIRES POUR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN clients.created_by IS 'ID de l''utilisateur ayant créé l''enregistrement';
COMMENT ON COLUMN clients.updated_by IS 'ID de l''utilisateur ayant modifié l''enregistrement';
COMMENT ON COLUMN fournisseurs.created_by IS 'ID de l''utilisateur ayant créé l''enregistrement';
COMMENT ON COLUMN fournisseurs.updated_by IS 'ID de l''utilisateur ayant modifié l''enregistrement';
COMMENT ON COLUMN ordres_fabrication.created_by IS 'ID de l''utilisateur ayant créé l''enregistrement';
COMMENT ON COLUMN ordres_fabrication.updated_by IS 'ID de l''utilisateur ayant modifié l''enregistrement';
COMMENT ON COLUMN suivi_fabrication.created_by IS 'ID de l''utilisateur ayant créé l''enregistrement';
COMMENT ON COLUMN suivi_fabrication.updated_by IS 'ID de l''utilisateur ayant modifié l''enregistrement';
COMMENT ON COLUMN commandes.created_by IS 'ID de l''utilisateur ayant créé l''enregistrement';
COMMENT ON COLUMN commandes.updated_by IS 'ID de l''utilisateur ayant modifié l''enregistrement';
COMMENT ON COLUMN articles_catalogue.created_by IS 'ID de l''utilisateur ayant créé l''enregistrement';
COMMENT ON COLUMN articles_catalogue.updated_by IS 'ID de l''utilisateur ayant modifié l''enregistrement';
COMMENT ON COLUMN matieres_premieres.created_by IS 'ID de l''utilisateur ayant créé l''enregistrement';
COMMENT ON COLUMN matieres_premieres.updated_by IS 'ID de l''utilisateur ayant modifié l''enregistrement';
COMMENT ON COLUMN machines.created_by IS 'ID de l''utilisateur ayant créé l''enregistrement';
COMMENT ON COLUMN machines.updated_by IS 'ID de l''utilisateur ayant modifié l''enregistrement';
COMMENT ON COLUMN sous_traitants.created_by IS 'ID de l''utilisateur ayant créé l''enregistrement';
COMMENT ON COLUMN sous_traitants.updated_by IS 'ID de l''utilisateur ayant modifié l''enregistrement';
COMMENT ON COLUMN mouvements_sous_traitance.created_by IS 'ID de l''utilisateur ayant créé l''enregistrement';
COMMENT ON COLUMN mouvements_sous_traitance.updated_by IS 'ID de l''utilisateur ayant modifié l''enregistrement';
COMMENT ON COLUMN devis.updated_by IS 'ID de l''utilisateur ayant modifié l''enregistrement';
COMMENT ON COLUMN bons_livraison.updated_by IS 'ID de l''utilisateur ayant modifié l''enregistrement';
COMMENT ON COLUMN factures.updated_by IS 'ID de l''utilisateur ayant modifié l''enregistrement';
COMMENT ON COLUMN avoirs.updated_by IS 'ID de l''utilisateur ayant modifié l''enregistrement';
COMMENT ON COLUMN bons_retour.updated_by IS 'ID de l''utilisateur ayant modifié l''enregistrement';

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

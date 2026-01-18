-- ============================================================================
-- AJOUT DES CHAMPS created_by, updated_by À TOUTES LES TABLES
-- ============================================================================
-- Ce script ajoute les colonnes created_by et updated_by dans TOUTES les
-- tables de la base de données (sauf les tables système et spéciales).
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

-- Fonction pour ajouter created_by et updated_by à une table
CREATE OR REPLACE FUNCTION add_audit_columns_to_table(p_table_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Ajouter created_by si manquant
    IF NOT column_exists(p_table_name, 'created_by') THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN created_by INTEGER', p_table_name);
        RAISE NOTICE 'Ajouté created_by à la table %', p_table_name;
    END IF;
    
    -- Ajouter updated_by si manquant
    IF NOT column_exists(p_table_name, 'updated_by') THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN updated_by INTEGER', p_table_name);
        RAISE NOTICE 'Ajouté updated_by à la table %', p_table_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Liste des tables à EXCLURE (tables système, vues, etc.)
-- Ces tables n'ont pas besoin de traçage utilisateur
DO $$
DECLARE
    table_record RECORD;
    excluded_tables TEXT[] := ARRAY[
        'audit_log',              -- Table d'audit elle-même
        'pg_stat_statements',     -- Statistiques PostgreSQL
        'spatial_ref_sys',        -- Système spatial (si PostGIS)
        'geometry_columns',       -- Système spatial (si PostGIS)
        'geography_columns'       -- Système spatial (si PostGIS)
    ];
    should_exclude BOOLEAN;
BEGIN
    -- Parcourir toutes les tables de la base
    FOR table_record IN 
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        should_exclude := FALSE;
        
        -- Vérifier si la table doit être exclue
        FOR i IN 1..array_length(excluded_tables, 1) LOOP
            IF table_record.table_name = excluded_tables[i] THEN
                should_exclude := TRUE;
                EXIT;
            END IF;
        END LOOP;
        
        -- Ignorer les tables qui commencent par pg_ (tables système PostgreSQL)
        IF table_record.table_name LIKE 'pg_%' THEN
            should_exclude := TRUE;
        END IF;
        
        -- Ajouter les colonnes si la table n'est pas exclue
        IF NOT should_exclude THEN
            PERFORM add_audit_columns_to_table(table_record.table_name);
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Traitement terminé pour toutes les tables';
END $$;

-- Ajouter les commentaires pour documentation
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          AND table_name NOT LIKE 'pg_%'
        ORDER BY table_name
    LOOP
        -- Commentaire sur created_by
        IF column_exists(table_record.table_name, 'created_by') THEN
            BEGIN
                EXECUTE format(
                    'COMMENT ON COLUMN %I.created_by IS %L',
                    table_record.table_name,
                    'ID de l''utilisateur ayant créé l''enregistrement'
                );
            EXCEPTION WHEN OTHERS THEN
                -- Ignorer les erreurs de commentaire
                NULL;
            END;
        END IF;
        
        -- Commentaire sur updated_by
        IF column_exists(table_record.table_name, 'updated_by') THEN
            BEGIN
                EXECUTE format(
                    'COMMENT ON COLUMN %I.updated_by IS %L',
                    table_record.table_name,
                    'ID de l''utilisateur ayant modifié l''enregistrement'
                );
            EXCEPTION WHEN OTHERS THEN
                -- Ignorer les erreurs de commentaire
                NULL;
            END;
        END IF;
    END LOOP;
END $$;

-- Afficher un résumé
DO $$
DECLARE
    total_tables INTEGER;
    tables_with_both INTEGER;
BEGIN
    -- Compter le total de tables traitées
    SELECT COUNT(DISTINCT table_name) INTO total_tables
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name IN ('created_by', 'updated_by');
    
    -- Compter les tables avec les deux colonnes
    SELECT COUNT(*) INTO tables_with_both
    FROM (
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name IN ('created_by', 'updated_by')
        GROUP BY table_name
        HAVING COUNT(*) = 2
    ) t;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Résumé de l''ajout des champs de traçage:';
    RAISE NOTICE '  Tables totales avec champs audit: %', total_tables;
    RAISE NOTICE '  Tables avec created_by ET updated_by: %', tables_with_both;
    RAISE NOTICE '========================================';
END $$;

-- Nettoyer les fonctions temporaires (optionnel - on peut les garder pour réutilisation)
-- DROP FUNCTION IF EXISTS add_audit_columns_to_table(TEXT);
-- DROP FUNCTION IF EXISTS column_exists(TEXT, TEXT);

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================

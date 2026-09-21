-- Script SQL pour verifier la base existante et les tables
-- A executer dans pgAdmin Query Tool

-- ============================================================
-- 1. INFORMATIONS SUR LA BASE DE DONNEES
-- ============================================================
SELECT 
    current_database() as base_actuelle,
    current_user as utilisateur_actuel,
    version() as version_postgresql;

-- ============================================================
-- 2. LISTER TOUTES LES TABLES
-- ============================================================
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
ORDER BY table_schema, table_name;

-- ============================================================
-- 3. TABLES REQUISES POUR LES MODULES ODOO
-- ============================================================
-- Verifier si les tables requises existent

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'utilisateurs') 
        THEN '✅ EXISTE' 
        ELSE '❌ MANQUANTE' 
    END as utilisateurs,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') 
        THEN '✅ EXISTE' 
        ELSE '❌ MANQUANTE' 
    END as clients,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commandes_clients') 
        THEN '✅ EXISTE' 
        ELSE '❌ MANQUANTE' 
    END as commandes_clients,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lignes_commande') 
        THEN '✅ EXISTE' 
        ELSE '❌ MANQUANTE' 
    END as lignes_commande,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles_catalogue') 
        THEN '✅ EXISTE' 
        ELSE '❌ MANQUANTE' 
    END as articles_catalogue,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories_articles') 
        THEN '✅ EXISTE' 
        ELSE '❌ MANQUANTE' 
    END as categories_articles,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'entrepots') 
        THEN '✅ EXISTE' 
        ELSE '❌ MANQUANTE' 
    END as entrepots,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'livraisons') 
        THEN '✅ EXISTE' 
        ELSE '❌ MANQUANTE' 
    END as livraisons,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ordres_fabrication') 
        THEN '✅ EXISTE' 
        ELSE '❌ MANQUANTE' 
    END as ordres_fabrication,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'factures_clients') 
        THEN '✅ EXISTE' 
        ELSE '❌ MANQUANTE' 
    END as factures_clients,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commandes_fournisseurs') 
        THEN '✅ EXISTE' 
        ELSE '❌ MANQUANTE' 
    END as commandes_fournisseurs;

-- ============================================================
-- 4. STRUCTURE DES TABLES EXISTANTES (exemple pour clients)
-- ============================================================
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'clients'
ORDER BY ordinal_position;

-- ============================================================
-- 5. COMPTER LES ENREGISTREMENTS PAR TABLE
-- ============================================================
-- Utiliser une fonction pour eviter les erreurs si la table n'existe pas
DO $$
DECLARE
    table_count INTEGER;
    tbl_name TEXT;
BEGIN
    -- Table utilisateurs
    tbl_name := 'utilisateurs';
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = tbl_name) THEN
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl_name) INTO table_count;
        RAISE NOTICE 'utilisateurs: % enregistrements', table_count;
    ELSE
        RAISE NOTICE 'utilisateurs: TABLE N''EXISTE PAS';
    END IF;

    -- Table clients
    tbl_name := 'clients';
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = tbl_name) THEN
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl_name) INTO table_count;
        RAISE NOTICE 'clients: % enregistrements', table_count;
    ELSE
        RAISE NOTICE 'clients: TABLE N''EXISTE PAS';
    END IF;

    -- Table commandes_clients
    tbl_name := 'commandes_clients';
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = tbl_name) THEN
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl_name) INTO table_count;
        RAISE NOTICE 'commandes_clients: % enregistrements', table_count;
    ELSE
        RAISE NOTICE 'commandes_clients: TABLE N''EXISTE PAS';
    END IF;

    -- Table lignes_commande
    tbl_name := 'lignes_commande';
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = tbl_name) THEN
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl_name) INTO table_count;
        RAISE NOTICE 'lignes_commande: % enregistrements', table_count;
    ELSE
        RAISE NOTICE 'lignes_commande: TABLE N''EXISTE PAS';
    END IF;

    -- Table articles_catalogue
    tbl_name := 'articles_catalogue';
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = tbl_name) THEN
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl_name) INTO table_count;
        RAISE NOTICE 'articles_catalogue: % enregistrements', table_count;
    ELSE
        RAISE NOTICE 'articles_catalogue: TABLE N''EXISTE PAS';
    END IF;

    -- Table categories_articles
    tbl_name := 'categories_articles';
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = tbl_name) THEN
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl_name) INTO table_count;
        RAISE NOTICE 'categories_articles: % enregistrements', table_count;
    ELSE
        RAISE NOTICE 'categories_articles: TABLE N''EXISTE PAS';
    END IF;

    -- Table entrepots
    tbl_name := 'entrepots';
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = tbl_name) THEN
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl_name) INTO table_count;
        RAISE NOTICE 'entrepots: % enregistrements', table_count;
    ELSE
        RAISE NOTICE 'entrepots: TABLE N''EXISTE PAS';
    END IF;

    -- Table livraisons
    tbl_name := 'livraisons';
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = tbl_name) THEN
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl_name) INTO table_count;
        RAISE NOTICE 'livraisons: % enregistrements', table_count;
    ELSE
        RAISE NOTICE 'livraisons: TABLE N''EXISTE PAS';
    END IF;

    -- Table ordres_fabrication
    tbl_name := 'ordres_fabrication';
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = tbl_name) THEN
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl_name) INTO table_count;
        RAISE NOTICE 'ordres_fabrication: % enregistrements', table_count;
    ELSE
        RAISE NOTICE 'ordres_fabrication: TABLE N''EXISTE PAS';
    END IF;

    -- Table factures_clients
    tbl_name := 'factures_clients';
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = tbl_name) THEN
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl_name) INTO table_count;
        RAISE NOTICE 'factures_clients: % enregistrements', table_count;
    ELSE
        RAISE NOTICE 'factures_clients: TABLE N''EXISTE PAS';
    END IF;

    -- Table commandes_fournisseurs
    tbl_name := 'commandes_fournisseurs';
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = tbl_name) THEN
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl_name) INTO table_count;
        RAISE NOTICE 'commandes_fournisseurs: % enregistrements', table_count;
    ELSE
        RAISE NOTICE 'commandes_fournisseurs: TABLE N''EXISTE PAS';
    END IF;
END $$;

-- ============================================================
-- 6. VERIFIER LES CONTRAINTES ET RELATIONS
-- ============================================================
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, kcu.column_name;

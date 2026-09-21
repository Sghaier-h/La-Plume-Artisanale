-- Script pour analyser les relations existantes et adapter les tables Odoo
-- Execute dans pgAdmin Query Tool

-- ============================================================
-- 1. ANALYSER LES RELATIONS EXISTANTES
-- ============================================================
SELECT
    tc.table_name as table_source,
    kcu.column_name as colonne_fk,
    ccu.table_name as table_cible,
    ccu.column_name as colonne_pk
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('commandes_clients', 'lignes_commande', 'factures_clients', 
                        'ordres_fabrication', 'livraisons', 'commandes_fournisseurs',
                        'clients', 'utilisateurs', 'articles_catalogue', 
                        'categories_articles', 'entrepots')
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================
-- 2. VERIFIER SI LES TABLES EXISTANTES SONT COMPATIBLES
-- ============================================================
-- Verifier si 'commandes' existe (table existante vs 'commandes_clients')
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commandes') 
        THEN 'EXISTE: commandes (table existante)'
        ELSE 'N''EXISTE PAS'
    END as status_commandes,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commandes_clients') 
        THEN 'EXISTE: commandes_clients (table Odoo)'
        ELSE 'N''EXISTE PAS'
    END as status_commandes_clients;

-- Verifier si 'factures' existe (table existante vs 'factures_clients')
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'factures') 
        THEN 'EXISTE: factures (table existante)'
        ELSE 'N''EXISTE PAS'
    END as status_factures,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'factures_clients') 
        THEN 'EXISTE: factures_clients (table Odoo)'
        ELSE 'N''EXISTE PAS'
    END as status_factures_clients;

-- ============================================================
-- 3. CREER LES RELATIONS MANQUANTES POUR COMMANDES_CLIENTS
-- ============================================================
-- Verifier si la relation vers commandes existe
DO $$
BEGIN
    -- Relation vers table 'commandes' existante (si existe)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commandes')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commandes_clients')
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'fk_commandes_clients_commandes'
       ) THEN
        -- Creer une colonne de liaison si elle n'existe pas
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'commandes_clients' 
            AND column_name = 'id_commande_existante'
        ) THEN
            ALTER TABLE commandes_clients 
            ADD COLUMN id_commande_existante INTEGER;
            RAISE NOTICE 'Colonne id_commande_existante ajoutee a commandes_clients';
        END IF;
        
        -- Creer la relation
        ALTER TABLE commandes_clients
        ADD CONSTRAINT fk_commandes_clients_commandes
        FOREIGN KEY (id_commande_existante) 
        REFERENCES commandes(id_commande);
        RAISE NOTICE 'Relation vers commandes creee';
    END IF;
END $$;

-- ============================================================
-- 4. ADAPTER LIGNES_COMMANDE POUR LES DEUX TABLES
-- ============================================================
-- Verifier si lignes_commande doit pointer vers commandes ou commandes_clients
DO $$
BEGIN
    -- Si 'articles_commande' existe (table existante), creer relation
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles_commande')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lignes_commande')
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'fk_lignes_commande_articles_commande'
       ) THEN
        -- Ajouter colonne de liaison
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'lignes_commande' 
            AND column_name = 'id_article_commande'
        ) THEN
            ALTER TABLE lignes_commande 
            ADD COLUMN id_article_commande INTEGER;
            RAISE NOTICE 'Colonne id_article_commande ajoutee a lignes_commande';
        END IF;
        
        -- Creer la relation
        ALTER TABLE lignes_commande
        ADD CONSTRAINT fk_lignes_commande_articles_commande
        FOREIGN KEY (id_article_commande) 
        REFERENCES articles_commande(id_article_commande);
        RAISE NOTICE 'Relation vers articles_commande creee';
    END IF;
END $$;

-- ============================================================
-- 5. ADAPTER FACTURES_CLIENTS POUR LES DEUX TABLES
-- ============================================================
-- Relation vers factures existante
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'factures')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'factures_clients')
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'fk_factures_clients_factures'
       ) THEN
        -- Ajouter colonne de liaison
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'factures_clients' 
            AND column_name = 'id_facture_existante'
        ) THEN
            ALTER TABLE factures_clients 
            ADD COLUMN id_facture_existante INTEGER;
            RAISE NOTICE 'Colonne id_facture_existante ajoutee a factures_clients';
        END IF;
        
        -- Creer la relation
        ALTER TABLE factures_clients
        ADD CONSTRAINT fk_factures_clients_factures
        FOREIGN KEY (id_facture_existante) 
        REFERENCES factures(id_facture);
        RAISE NOTICE 'Relation vers factures creee';
    END IF;
END $$;

-- ============================================================
-- 6. VERIFIER LES RELATIONS ORDRES_FABRICATION
-- ============================================================
-- La table ordres_fabrication existe deja, verifier les relations
DO $$
BEGIN
    -- Relation vers articles_commande si existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles_commande')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ordres_fabrication')
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'fk_ordres_fabrication_articles_commande'
       )
       AND EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'ordres_fabrication' 
           AND column_name = 'id_article_commande'
       ) THEN
        ALTER TABLE ordres_fabrication
        ADD CONSTRAINT fk_ordres_fabrication_articles_commande
        FOREIGN KEY (id_article_commande) 
        REFERENCES articles_commande(id_article_commande);
        RAISE NOTICE 'Relation ordres_fabrication -> articles_commande creee';
    END IF;
END $$;

-- ============================================================
-- 7. RAPPORT FINAL DES RELATIONS
-- ============================================================
SELECT 
    'RELATIONS CREEES/MODIFIEES' as rapport,
    COUNT(*) as nombre_relations
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
  AND table_schema = 'public'
  AND table_name IN ('commandes_clients', 'lignes_commande', 'factures_clients', 
                     'ordres_fabrication', 'livraisons', 'commandes_fournisseurs');

-- ============================================================
-- 8. AFFICHER LES NOUVELLES RELATIONS
-- ============================================================
SELECT
    'NOUVELLES RELATIONS' as type,
    tc.table_name as table_source,
    kcu.column_name as colonne_fk,
    ccu.table_name as table_cible,
    ccu.column_name as colonne_pk
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND (
    tc.constraint_name LIKE 'fk_%_%_%'  -- Nouvelles relations creees
    OR kcu.column_name LIKE '%_existante'
    OR kcu.column_name LIKE '%_article_commande'
  )
ORDER BY tc.table_name, kcu.column_name;

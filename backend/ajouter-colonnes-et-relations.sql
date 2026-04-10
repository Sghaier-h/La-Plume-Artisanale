-- Script pour ajouter les colonnes de liaison et creer les relations
-- Execute dans pgAdmin Query Tool

-- ============================================================
-- ETAPE 1: AJOUTER LES COLONNES DE LIAISON
-- ============================================================
DO $$
BEGIN
    -- Colonne id_commande_existante dans commandes_clients
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commandes_clients')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commandes')
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'commandes_clients' 
           AND column_name = 'id_commande_existante'
       ) THEN
        ALTER TABLE commandes_clients 
        ADD COLUMN id_commande_existante INTEGER;
        RAISE NOTICE 'Colonne id_commande_existante ajoutee a commandes_clients';
    ELSE
        RAISE NOTICE 'Colonne id_commande_existante deja presente ou table commandes inexistante';
    END IF;

    -- Colonne id_article_commande dans lignes_commande
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lignes_commande')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles_commande')
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'lignes_commande' 
           AND column_name = 'id_article_commande'
       ) THEN
        ALTER TABLE lignes_commande 
        ADD COLUMN id_article_commande INTEGER;
        RAISE NOTICE 'Colonne id_article_commande ajoutee a lignes_commande';
    ELSE
        RAISE NOTICE 'Colonne id_article_commande deja presente ou table articles_commande inexistante';
    END IF;

    -- Colonne id_facture_existante dans factures_clients
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'factures_clients')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'factures')
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'factures_clients' 
           AND column_name = 'id_facture_existante'
       ) THEN
        ALTER TABLE factures_clients 
        ADD COLUMN id_facture_existante INTEGER;
        RAISE NOTICE 'Colonne id_facture_existante ajoutee a factures_clients';
    ELSE
        RAISE NOTICE 'Colonne id_facture_existante deja presente ou table factures inexistante';
    END IF;

    -- Colonne id_article_commande dans ordres_fabrication
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ordres_fabrication')
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles_commande')
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'ordres_fabrication' 
           AND column_name = 'id_article_commande'
       ) THEN
        ALTER TABLE ordres_fabrication 
        ADD COLUMN id_article_commande INTEGER;
        RAISE NOTICE 'Colonne id_article_commande ajoutee a ordres_fabrication';
    ELSE
        RAISE NOTICE 'Colonne id_article_commande deja presente dans ordres_fabrication ou table articles_commande inexistante';
    END IF;
END $$;

-- ============================================================
-- ETAPE 2: CREER LES CONTRAINTES DE CLES ETRANGERES
-- ============================================================
DO $$
BEGIN
    -- Relation commandes_clients -> commandes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commandes')
       AND EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'commandes_clients' 
           AND column_name = 'id_commande_existante'
       )
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'fk_commandes_clients_commandes'
       ) THEN
        ALTER TABLE commandes_clients
        ADD CONSTRAINT fk_commandes_clients_commandes
        FOREIGN KEY (id_commande_existante) 
        REFERENCES commandes(id_commande);
        RAISE NOTICE 'Relation fk_commandes_clients_commandes creee';
    ELSE
        RAISE NOTICE 'Relation fk_commandes_clients_commandes deja presente ou impossible a creer';
    END IF;

    -- Relation lignes_commande -> articles_commande
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles_commande')
       AND EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'lignes_commande' 
           AND column_name = 'id_article_commande'
       )
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'fk_lignes_commande_articles_commande'
       ) THEN
        ALTER TABLE lignes_commande
        ADD CONSTRAINT fk_lignes_commande_articles_commande
        FOREIGN KEY (id_article_commande) 
        REFERENCES articles_commande(id_article_commande);
        RAISE NOTICE 'Relation fk_lignes_commande_articles_commande creee';
    ELSE
        RAISE NOTICE 'Relation fk_lignes_commande_articles_commande deja presente ou impossible a creer';
    END IF;

    -- Relation factures_clients -> factures
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'factures')
       AND EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'factures_clients' 
           AND column_name = 'id_facture_existante'
       )
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'fk_factures_clients_factures'
       ) THEN
        ALTER TABLE factures_clients
        ADD CONSTRAINT fk_factures_clients_factures
        FOREIGN KEY (id_facture_existante) 
        REFERENCES factures(id_facture);
        RAISE NOTICE 'Relation fk_factures_clients_factures creee';
    ELSE
        RAISE NOTICE 'Relation fk_factures_clients_factures deja presente ou impossible a creer';
    END IF;

    -- Relation ordres_fabrication -> articles_commande
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles_commande')
       AND EXISTS (
           SELECT 1 FROM information_schema.columns 
           WHERE table_name = 'ordres_fabrication' 
           AND column_name = 'id_article_commande'
       )
       AND NOT EXISTS (
           SELECT 1 FROM information_schema.table_constraints 
           WHERE constraint_name = 'fk_ordres_fabrication_articles_commande'
       ) THEN
        ALTER TABLE ordres_fabrication
        ADD CONSTRAINT fk_ordres_fabrication_articles_commande
        FOREIGN KEY (id_article_commande) 
        REFERENCES articles_commande(id_article_commande);
        RAISE NOTICE 'Relation fk_ordres_fabrication_articles_commande creee';
    ELSE
        RAISE NOTICE 'Relation fk_ordres_fabrication_articles_commande deja presente ou impossible a creer';
    END IF;
END $$;

-- ============================================================
-- RAPPORT FINAL
-- ============================================================
SELECT 
    'COLONNES DE LIAISON' as type,
    table_name,
    column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name IN ('id_commande_existante', 'id_facture_existante', 'id_article_commande')
ORDER BY table_name, column_name;

SELECT 
    'RELATIONS CREEES' as type,
    tc.table_name,
    tc.constraint_name,
    kcu.column_name as colonne_fk,
    ccu.table_name as table_cible
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.constraint_name LIKE 'fk_%_%_%'
ORDER BY tc.table_name, tc.constraint_name;

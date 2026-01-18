-- ============================================================================
-- VÉRIFICATION DES CHAMPS created_by ET updated_by
-- ============================================================================
-- Ce script vérifie que tous les champs created_by et updated_by ont été
-- correctement ajoutés aux tables principales.
-- ============================================================================

-- Liste complète des tables qui devraient avoir created_by et updated_by
SELECT 
    'created_by' as champ,
    table_name,
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name IS NOT NULL THEN '✅ Présent'
        ELSE '❌ Manquant'
    END as statut
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN (
    'clients',
    'fournisseurs',
    'devis',
    'bons_livraison',
    'factures',
    'avoirs',
    'bons_retour',
    'ordres_fabrication',
    'suivi_fabrication',
    'commandes',
    'articles_catalogue',
    'matieres_premieres',
    'machines',
    'sous_traitants',
    'mouvements_sous_traitance',
    'qualite_avancee'
  )
  AND column_name = 'created_by'

UNION ALL

SELECT 
    'updated_by' as champ,
    table_name,
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name IS NOT NULL THEN '✅ Présent'
        ELSE '❌ Manquant'
    END as statut
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN (
    'clients',
    'fournisseurs',
    'devis',
    'bons_livraison',
    'factures',
    'avoirs',
    'bons_retour',
    'ordres_fabrication',
    'suivi_fabrication',
    'commandes',
    'articles_catalogue',
    'matieres_premieres',
    'machines',
    'sous_traitants',
    'mouvements_sous_traitance',
    'qualite_avancee'
  )
  AND column_name = 'updated_by'

ORDER BY champ, table_name;

-- Résumé par table
SELECT 
    table_name,
    COUNT(CASE WHEN column_name = 'created_by' THEN 1 END) as a_created_by,
    COUNT(CASE WHEN column_name = 'updated_by' THEN 1 END) as a_updated_by,
    CASE 
        WHEN COUNT(CASE WHEN column_name = 'created_by' THEN 1 END) = 1 
         AND COUNT(CASE WHEN column_name = 'updated_by' THEN 1 END) = 1 
        THEN '✅ Complet'
        ELSE '⚠️  Incomplet'
    END as statut_final
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN (
    'clients',
    'fournisseurs',
    'devis',
    'bons_livraison',
    'factures',
    'avoirs',
    'bons_retour',
    'ordres_fabrication',
    'suivi_fabrication',
    'commandes',
    'articles_catalogue',
    'matieres_premieres',
    'machines',
    'sous_traitants',
    'mouvements_sous_traitance',
    'qualite_avancee'
  )
  AND column_name IN ('created_by', 'updated_by')
GROUP BY table_name
ORDER BY statut_final, table_name;

-- Vérifier les tables qui n'existent pas
SELECT 
    '⚠️  Table inexistante' as statut,
    table_name
FROM (
    VALUES 
        ('clients'),
        ('fournisseurs'),
        ('devis'),
        ('bons_livraison'),
        ('factures'),
        ('avoirs'),
        ('bons_retour'),
        ('ordres_fabrication'),
        ('suivi_fabrication'),
        ('commandes'),
        ('articles_catalogue'),
        ('matieres_premieres'),
        ('machines'),
        ('sous_traitants'),
        ('mouvements_sous_traitance'),
        ('qualite_avancee')
) AS expected_tables(table_name)
WHERE NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = expected_tables.table_name
)
ORDER BY table_name;

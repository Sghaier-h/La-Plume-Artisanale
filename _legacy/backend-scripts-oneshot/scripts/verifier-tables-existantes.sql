-- Script SQL pour vérifier quelles tables des contrôleurs génériques existent
-- Exécutez ce script dans votre client PostgreSQL

-- Liste de toutes les tables attendues
WITH tables_attendues AS (
  SELECT unnest(ARRAY[
    'mobile', 'email', 'settings', 'multisociete', 'whatsapp', 'social_auth', 'ai',
    'warehouse', 'accounting_tunisia', 'payroll_tunisia', 'pos', 'excel_import',
    'audit', 'utilisateurs', 'pointage', 'database', 'migration', 'webhooks',
    'ecommerce', 'communication', 'reports', 'couts', 'qualite_avance',
    'planification_gantt', 'maintenance', 'produits', 'messages', 'notifications',
    'taches', 'documents', 'qualite_avancee', 'tracabilite_lots',
    'stock_multi_entrepots', 'planning_dragdrop', 'selecteurs_machines',
    'articles_catalogue', 'modeles', 'parametres_catalogue', 'suivi_fabrication',
    'matieres_premieres', 'parametrage', 'planning', 'production', 'dashboard',
    'soustraitants', 'of', 'machines', 'bons_retour', 'bons_livraison', 'avoirs', 'search'
  ]) AS table_name
)
SELECT 
  ta.table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ta.table_name
    ) THEN '✅ Existe'
    ELSE '❌ Manquante'
  END AS statut,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ta.table_name
    ) THEN (
      SELECT COUNT(*)::text
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = ta.table_name
    )
    ELSE '0'
  END AS nombre_colonnes
FROM tables_attendues ta
ORDER BY 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ta.table_name
    ) THEN 0
    ELSE 1
  END,
  ta.table_name;

-- Résumé
SELECT 
  COUNT(*) FILTER (WHERE EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = table_list.table_name
  )) AS tables_existantes,
  COUNT(*) FILTER (WHERE NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = table_list.table_name
  )) AS tables_manquantes,
  COUNT(*) AS total
FROM (
  SELECT unnest(ARRAY[
    'mobile', 'email', 'settings', 'multisociete', 'whatsapp', 'social_auth', 'ai',
    'warehouse', 'accounting_tunisia', 'payroll_tunisia', 'pos', 'excel_import',
    'audit', 'utilisateurs', 'pointage', 'database', 'migration', 'webhooks',
    'ecommerce', 'communication', 'reports', 'couts', 'qualite_avance',
    'planification_gantt', 'maintenance', 'produits', 'messages', 'notifications',
    'taches', 'documents', 'qualite_avancee', 'tracabilite_lots',
    'stock_multi_entrepots', 'planning_dragdrop', 'selecteurs_machines',
    'articles_catalogue', 'modeles', 'parametres_catalogue', 'suivi_fabrication',
    'matieres_premieres', 'parametrage', 'planning', 'production', 'dashboard',
    'soustraitants', 'of', 'machines', 'bons_retour', 'bons_livraison', 'avoirs', 'search'
  ]) AS table_name
) AS table_list;

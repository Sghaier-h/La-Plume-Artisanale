-- Vos 67 tables organisées par fonction
SELECT 
    CASE 
        WHEN table_name LIKE 'demandes_%' THEN '📋 1. FLUX DEMANDES'
        WHEN table_name LIKE '%2eme_choix%' THEN '🔄 2. TRAÇABILITÉ 2ÈME CHOIX'
        WHEN table_name LIKE 'stock_%' THEN '📦 3. GESTION STOCKS'
        WHEN table_name IN ('commandes', 'articles_commande', 'clients', 'fournisseurs') THEN '🏢 4. COMMERCIAL'
        WHEN table_name LIKE 'suivi_%' THEN '📊 5. SUIVI PRODUCTION'
        WHEN table_name LIKE 'ordres_%' OR table_name IN ('machines', 'ensouples', 'ensouples_attributions') THEN '⚙️ 6. PRODUCTION'
        WHEN table_name LIKE '%mp%' OR table_name LIKE 'matieres_%' THEN '🧵 7. MATIÈRES PREMIÈRES'
        WHEN table_name IN ('utilisateurs', 'roles', 'utilisateurs_roles', 'equipe_fabrication') THEN '👥 8. UTILISATEURS & SÉCURITÉ'
        WHEN table_name LIKE 'alertes_%' OR table_name LIKE 'types_%' THEN '🚨 9. ALERTES & MONITORING'
        WHEN table_name LIKE 'logs_%' OR table_name LIKE 'historique_%' THEN '📝 10. LOGS & HISTORIQUE'
        ELSE '⚙️ 11. AUTRES'
    END as categorie,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as nb_colonnes
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY categorie, table_name;
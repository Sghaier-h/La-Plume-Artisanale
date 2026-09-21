-- ============================================================================
-- VÉRIFICATION DE LA MIGRATION DES CLIENTS
-- ============================================================================
-- Script pour vérifier que la migration s'est bien passée
-- ============================================================================

-- 1. Vérifier les catégories créées
SELECT 'Catégories clients:' as info;
SELECT code_categorie, libelle, actif FROM categories_clients ORDER BY code_categorie;

-- 2. Vérifier les types commerciaux créés
SELECT 'Types commerciaux:' as info;
SELECT code_type, libelle, actif FROM types_commerciaux ORDER BY code_type;

-- 3. Compter les clients par type
SELECT 'Répartition clients/prospects:' as info;
SELECT 
    type_client,
    COUNT(*) as nombre,
    COUNT(CASE WHEN actif = true THEN 1 END) as actifs,
    COUNT(CASE WHEN actif = false THEN 1 END) as inactifs
FROM clients
GROUP BY type_client
ORDER BY type_client;

-- 4. Vérifier les adresses migrées
SELECT 'Adresses migrées:' as info;
SELECT 
    type_adresse,
    COUNT(*) as nombre,
    COUNT(CASE WHEN principale = true THEN 1 END) as principales,
    COUNT(CASE WHEN actif = true THEN 1 END) as actives
FROM adresses_client
GROUP BY type_adresse
ORDER BY type_adresse;

-- 5. Vérifier les contacts migrés
SELECT 'Contacts migrés:' as info;
SELECT 
    COUNT(*) as total_contacts,
    COUNT(CASE WHEN contact_principal = true THEN 1 END) as contacts_principaux,
    COUNT(CASE WHEN actif = true THEN 1 END) as actifs
FROM contacts_client;

-- 6. Clients avec leurs catégories
SELECT 'Clients avec catégories:' as info;
SELECT 
    c.code_client,
    c.raison_sociale,
    c.type_client,
    cat.libelle as categorie,
    c.devise,
    c.actif
FROM clients c
LEFT JOIN categories_clients cat ON c.id_categorie = cat.id_categorie
ORDER BY c.code_client
LIMIT 10;

-- 7. Clients avec adresses de facturation
SELECT 'Clients avec adresses de facturation:' as info;
SELECT 
    c.code_client,
    c.raison_sociale,
    a.ville,
    a.pays,
    a.principale
FROM clients c
INNER JOIN adresses_client a ON c.id_client = a.id_client
WHERE a.type_adresse = 'FACTURATION' AND a.actif = true
ORDER BY c.code_client
LIMIT 10;

-- 8. Clients avec contacts
SELECT 'Clients avec contacts:' as info;
SELECT 
    c.code_client,
    c.raison_sociale,
    co.nom,
    co.prenom,
    co.fonction,
    co.email,
    co.contact_principal
FROM clients c
INNER JOIN contacts_client co ON c.id_client = co.id_client
WHERE co.actif = true
ORDER BY c.code_client, co.contact_principal DESC
LIMIT 10;

-- 9. Vérifier les fonctions créées
SELECT 'Fonctions créées:' as info;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('mettre_a_jour_type_client', 'determiner_devise_par_pays', 
                     'verifier_adresse_facturation_principale', 'verifier_contact_principal_unique')
ORDER BY routine_name;

-- 10. Vérifier les triggers créés
SELECT 'Triggers créés:' as info;
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN ('trigger_mettre_a_jour_type_client', 
                     'trigger_verifier_adresse_facturation_principale',
                     'trigger_verifier_contact_principal_unique')
ORDER BY trigger_name;

-- 11. Test de la fonction determiner_devise_par_pays
SELECT 'Test devise par pays:' as info;
SELECT 
    'Tunisie' as pays,
    determiner_devise_par_pays('Tunisie') as devise
UNION ALL
SELECT 
    'France' as pays,
    determiner_devise_par_pays('France') as devise
UNION ALL
SELECT 
    'Allemagne' as pays,
    determiner_devise_par_pays('Allemagne') as devise
UNION ALL
SELECT 
    'USA' as pays,
    determiner_devise_par_pays('USA') as devise;

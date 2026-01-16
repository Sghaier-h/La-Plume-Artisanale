-- ============================================================================
-- SCRIPT DE PARAMÉTRAGE INITIAL - ERP La Plume Artisanale
-- ============================================================================
-- Ce script permet de configurer rapidement les éléments essentiels
-- Exécutez ce script après avoir exécuté les scripts d'initialisation
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. PARAMÈTRES SYSTÈME
-- ═══════════════════════════════════════════════════════════════════════════

-- Mettre à jour les paramètres système essentiels
UPDATE parametres_systeme 
SET valeur = '1.0.0', date_modification = CURRENT_TIMESTAMP 
WHERE cle = 'version_systeme';

UPDATE parametres_systeme 
SET valeur = '500', date_modification = CURRENT_TIMESTAMP 
WHERE cle = 'alerte_metrage_ensouple';

UPDATE parametres_systeme 
SET valeur = '7', date_modification = CURRENT_TIMESTAMP 
WHERE cle = 'delai_livraison_standard';

UPDATE parametres_systeme 
SET valeur = '90', date_modification = CURRENT_TIMESTAMP 
WHERE cle = 'taux_rendement_cible';

-- Ajouter le nom de l'entreprise
INSERT INTO parametres_systeme (cle, valeur, description, type_donnee)
VALUES ('nom_entreprise', 'La Plume Artisanale', 'Nom de l''entreprise', 'string')
ON CONFLICT (cle) DO UPDATE 
SET valeur = EXCLUDED.valeur, date_modification = CURRENT_TIMESTAMP;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. MACHINES (Exemples)
-- ═══════════════════════════════════════════════════════════════════════════

-- Ajouter des machines si elles n'existent pas
INSERT INTO machines (code_machine, designation, id_type_machine, largeur_utile, vitesse_nominale, statut, actif)
SELECT 
    'MET001',
    'Métier à tisser 1',
    (SELECT id_type_machine FROM types_machines WHERE code_type = 'METIER' LIMIT 1),
    150,
    500,
    'disponible',
    true
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE code_machine = 'MET001');

INSERT INTO machines (code_machine, designation, id_type_machine, largeur_utile, vitesse_nominale, statut, actif)
SELECT 
    'MET002',
    'Métier à tisser 2',
    (SELECT id_type_machine FROM types_machines WHERE code_type = 'METIER' LIMIT 1),
    150,
    500,
    'disponible',
    true
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE code_machine = 'MET002');

INSERT INTO machines (code_machine, designation, id_type_machine, largeur_utile, vitesse_nominale, statut, actif)
SELECT 
    'JET001',
    'Métier Jet d''eau 1',
    (SELECT id_type_machine FROM types_machines WHERE code_type = 'JET_EAU' LIMIT 1),
    180,
    600,
    'disponible',
    true
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE code_machine = 'JET001');

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. FOURNISSEURS (Exemples)
-- ═══════════════════════════════════════════════════════════════════════════

-- Ajouter un fournisseur exemple
INSERT INTO fournisseurs (
    code_fournisseur,
    raison_sociale,
    adresse,
    code_postal,
    ville,
    pays,
    telephone,
    email,
    contact_principal,
    delai_livraison_moyen,
    conditions_paiement,
    devise,
    actif
)
SELECT 
    'FOUR001',
    'Fournisseur Textile SARL',
    '456 Avenue Fournisseur',
    '2000',
    'Sfax',
    'Tunisie',
    '+216 74 987 654',
    'contact@fournisseur-textile.tn',
    'M. Fournisseur',
    7,
    '30 jours',
    'TND',
    true
WHERE NOT EXISTS (SELECT 1 FROM fournisseurs WHERE code_fournisseur = 'FOUR001');

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. MATIÈRES PREMIÈRES (Exemples)
-- ═══════════════════════════════════════════════════════════════════════════

-- Ajouter des matières premières exemple
INSERT INTO matieres_premieres (
    code_mp,
    designation,
    id_type_mp,
    id_fournisseur,
    titre_numerateur,
    titre_denominateur,
    unite_titre,
    couleur,
    prix_unitaire,
    unite_achat,
    stock_minimum,
    stock_alerte,
    delai_approvisionnement,
    actif
)
SELECT 
    'FIL-COT-001',
    'Fil Coton 100% - Ne 30/1',
    (SELECT id_type_mp FROM types_mp WHERE code_type = 'FIL_COTON' LIMIT 1),
    (SELECT id_fournisseur FROM fournisseurs WHERE code_fournisseur = 'FOUR001' LIMIT 1),
    30,
    1,
    'Ne',
    'Blanc',
    15.50,
    'kg',
    100,
    150,
    7,
    true
WHERE NOT EXISTS (SELECT 1 FROM matieres_premieres WHERE code_mp = 'FIL-COT-001');

INSERT INTO matieres_premieres (
    code_mp,
    designation,
    id_type_mp,
    id_fournisseur,
    titre_numerateur,
    titre_denominateur,
    unite_titre,
    couleur,
    prix_unitaire,
    unite_achat,
    stock_minimum,
    stock_alerte,
    delai_approvisionnement,
    actif
)
SELECT 
    'FIL-POLY-001',
    'Fil Polyester - Ne 50/1',
    (SELECT id_type_mp FROM types_mp WHERE code_type = 'FIL_POLY' LIMIT 1),
    (SELECT id_fournisseur FROM fournisseurs WHERE code_fournisseur = 'FOUR001' LIMIT 1),
    50,
    1,
    'Ne',
    'Blanc',
    12.00,
    'kg',
    80,
    120,
    5,
    true
WHERE NOT EXISTS (SELECT 1 FROM matieres_premieres WHERE code_mp = 'FIL-POLY-001');

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. STOCKS INITIAUX (Exemples)
-- ═══════════════════════════════════════════════════════════════════════════

-- Ajouter des stocks initiaux
INSERT INTO stock_mp (id_mp, quantite_disponible, quantite_reservee, quantite_en_transit, emplacement, statut, date_entree)
SELECT 
    (SELECT id_mp FROM matieres_premieres WHERE code_mp = 'FIL-COT-001' LIMIT 1),
    500,
    0,
    0,
    'Zone A - Rack 1',
    'disponible',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM stock_mp 
    WHERE id_mp = (SELECT id_mp FROM matieres_premieres WHERE code_mp = 'FIL-COT-001' LIMIT 1)
);

INSERT INTO stock_mp (id_mp, quantite_disponible, quantite_reservee, quantite_en_transit, emplacement, statut, date_entree)
SELECT 
    (SELECT id_mp FROM matieres_premieres WHERE code_mp = 'FIL-POLY-001' LIMIT 1),
    300,
    0,
    0,
    'Zone A - Rack 2',
    'disponible',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM stock_mp 
    WHERE id_mp = (SELECT id_mp FROM matieres_premieres WHERE code_mp = 'FIL-POLY-001' LIMIT 1)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. CLIENTS (Exemples)
-- ═══════════════════════════════════════════════════════════════════════════

-- Ajouter un client exemple
INSERT INTO clients (
    code_client,
    raison_sociale,
    adresse,
    code_postal,
    ville,
    pays,
    telephone,
    email,
    contact_principal,
    conditions_paiement,
    devise,
    actif
)
SELECT 
    'CLI001',
    'Client Exemple SARL',
    '123 Rue Exemple',
    '1000',
    'Tunis',
    'Tunisie',
    '+216 71 123 456',
    'contact@client-exemple.tn',
    'M. Exemple',
    '30 jours',
    'TND',
    true
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE code_client = 'CLI001');

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. TYPES D'ARTICLES (Exemples)
-- ═══════════════════════════════════════════════════════════════════════════

-- Ajouter un type d'article si nécessaire
INSERT INTO types_articles (code_type, libelle, description, actif)
VALUES ('FOUTA', 'Fouta', 'Fouta traditionnelle', true)
ON CONFLICT (code_type) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. ARTICLES CATALOGUE (Exemples)
-- ═══════════════════════════════════════════════════════════════════════════

-- Ajouter des articles au catalogue
INSERT INTO articles_catalogue (
    code_article,
    designation,
    id_type_article,
    specification,
    unite_vente,
    prix_unitaire_base,
    temps_production_standard,
    actif
)
SELECT 
    'FOUTA-001',
    'Fouta Traditionnelle 120x180',
    (SELECT id_type_article FROM types_articles WHERE code_type = 'FOUTA' LIMIT 1),
    'Fouta en coton 100%, dimensions 120x180 cm',
    'mètre',
    25.00,
    2.5,
    true
WHERE NOT EXISTS (SELECT 1 FROM articles_catalogue WHERE code_article = 'FOUTA-001');

INSERT INTO articles_catalogue (
    code_article,
    designation,
    id_type_article,
    specification,
    unite_vente,
    prix_unitaire_base,
    temps_production_standard,
    actif
)
SELECT 
    'FOUTA-002',
    'Fouta Traditionnelle 100x150',
    (SELECT id_type_article FROM types_articles WHERE code_type = 'FOUTA' LIMIT 1),
    'Fouta en coton 100%, dimensions 100x150 cm',
    'mètre',
    20.00,
    2.0,
    true
WHERE NOT EXISTS (SELECT 1 FROM articles_catalogue WHERE code_article = 'FOUTA-002');

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. SELECTEURS (Exemples)
-- ═══════════════════════════════════════════════════════════════════════════

-- Ajouter des selecteurs standards
INSERT INTO selecteurs (code_selecteur, description, actif)
VALUES 
    ('SEL1', 'Selecteur 1', true),
    ('SEL2', 'Selecteur 2', true),
    ('SEL3', 'Selecteur 3', true),
    ('SEL4', 'Selecteur 4', true)
ON CONFLICT (code_selecteur) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 10. RÉSUMÉ DE LA CONFIGURATION
-- ═══════════════════════════════════════════════════════════════════════════

-- Afficher un résumé
SELECT 
    '✅ Paramètres système' as element,
    COUNT(*)::text as nombre
FROM parametres_systeme
UNION ALL
SELECT 
    '✅ Machines actives',
    COUNT(*)::text
FROM machines
WHERE actif = true
UNION ALL
SELECT 
    '✅ Matières premières actives',
    COUNT(*)::text
FROM matieres_premieres
WHERE actif = true
UNION ALL
SELECT 
    '✅ Clients actifs',
    COUNT(*)::text
FROM clients
WHERE actif = true
UNION ALL
SELECT 
    '✅ Fournisseurs actifs',
    COUNT(*)::text
FROM fournisseurs
WHERE actif = true
UNION ALL
SELECT 
    '✅ Articles catalogue actifs',
    COUNT(*)::text
FROM articles_catalogue
WHERE actif = true
UNION ALL
SELECT 
    '✅ Utilisateurs actifs',
    COUNT(*)::text
FROM utilisateurs
WHERE actif = true
UNION ALL
SELECT 
    '✅ Selecteurs actifs',
    COUNT(*)::text
FROM selecteurs
WHERE actif = true;

-- Log
INSERT INTO logs_systeme (type_action, module, description, niveau_severite)
VALUES ('CONFIG', 'PARAMETRAGE', 'Paramétrage initial exécuté', 'INFO');

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ PARAMÉTRAGE INITIAL TERMINÉ
-- ═══════════════════════════════════════════════════════════════════════════
-- Vous pouvez maintenant utiliser l'application avec ces données de base
-- N'oubliez pas de personnaliser selon vos besoins réels
-- ═══════════════════════════════════════════════════════════════════════════


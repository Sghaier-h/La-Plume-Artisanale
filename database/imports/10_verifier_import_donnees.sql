-- ============================================================================
-- VÉRIFICATION DE L'IMPORT DES DONNÉES
-- ============================================================================
-- Script pour vérifier que toutes les données ont bien été importées
-- Généré le: 2026-01-22
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. VÉRIFICATION DES ATTRIBUTS (Paramètres Catalogue)
-- ============================================================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES ATTRIBUTS ===';
    
    -- Types de Produits
    SELECT COUNT(*) INTO v_count FROM parametres_types_produits;
    RAISE NOTICE 'Types de Produits: %', v_count;
    
    -- Types de Tissages
    SELECT COUNT(*) INTO v_count FROM parametres_tissages;
    RAISE NOTICE 'Types de Tissages: %', v_count;
    
    -- Dimensions
    SELECT COUNT(*) INTO v_count FROM parametres_dimensions;
    RAISE NOTICE 'Dimensions: %', v_count;
    
    -- Types de Finitions
    SELECT COUNT(*) INTO v_count FROM parametres_finitions;
    RAISE NOTICE 'Types de Finitions: %', v_count;
    
    -- Nombre de Couleurs
    SELECT COUNT(*) INTO v_count FROM parametres_nombre_couleurs;
    RAISE NOTICE 'Nombre de Couleurs: %', v_count;
    
    -- Couleurs
    SELECT COUNT(*) INTO v_count FROM parametres_couleurs;
    RAISE NOTICE 'Couleurs: %', v_count;
    
    -- Types de Personnalisation
    SELECT COUNT(*) INTO v_count FROM parametres_types_personnalisation;
    RAISE NOTICE 'Types de Personnalisation: %', v_count;
END $$;

-- ============================================================================
-- 2. VÉRIFICATION DES MODÈLES
-- ============================================================================

DO $$
DECLARE
    v_count INTEGER;
    v_avec_relations INTEGER;
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES MODÈLES ===';
    
    SELECT COUNT(*) INTO v_count FROM parametres_modeles;
    RAISE NOTICE 'Total Modèles: %', v_count;
    
    SELECT COUNT(*) INTO v_avec_relations 
    FROM parametres_modeles 
    WHERE id_type_produit IS NOT NULL OR id_tissage IS NOT NULL;
    RAISE NOTICE 'Modèles avec relations (Type Produit ou Tissage): %', v_avec_relations;
    
    SELECT COUNT(*) INTO v_count FROM parametres_modeles WHERE actif = true;
    RAISE NOTICE 'Modèles actifs: %', v_count;
END $$;

-- ============================================================================
-- 3. VÉRIFICATION DES ARTICLES
-- ============================================================================

DO $$
DECLARE
    v_count INTEGER;
    v_catalogue INTEGER;
    v_avec_modele INTEGER;
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES ARTICLES ===';
    
    SELECT COUNT(*) INTO v_count FROM articles_catalogue;
    RAISE NOTICE 'Total Articles: %', v_count;
    
    SELECT COUNT(*) INTO v_catalogue 
    FROM articles_catalogue 
    WHERE dans_catalogue_produit = true;
    RAISE NOTICE 'Articles dans le catalogue: %', v_catalogue;
    
    SELECT COUNT(*) INTO v_avec_modele 
    FROM articles_catalogue 
    WHERE id_modele IS NOT NULL;
    RAISE NOTICE 'Articles avec modèle associé: %', v_avec_modele;
    
    SELECT COUNT(*) INTO v_count FROM articles_catalogue WHERE actif = true;
    RAISE NOTICE 'Articles actifs: %', v_count;
END $$;

-- ============================================================================
-- 4. VÉRIFICATION DES CLIENTS
-- ============================================================================

DO $$
DECLARE
    v_count INTEGER;
    v_clients INTEGER;
    v_prospects INTEGER;
    v_avec_adresses INTEGER;
    v_avec_contacts INTEGER;
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES CLIENTS ===';
    
    SELECT COUNT(*) INTO v_count FROM clients;
    RAISE NOTICE 'Total Clients: %', v_count;
    
    SELECT COUNT(*) INTO v_clients FROM clients WHERE type_client = 'CLIENT';
    RAISE NOTICE 'Clients (ayant commandé): %', v_clients;
    
    SELECT COUNT(*) INTO v_prospects FROM clients WHERE type_client = 'PROSPECT';
    RAISE NOTICE 'Prospects (n''ayant pas encore commandé): %', v_prospects;
    
    SELECT COUNT(DISTINCT id_client) INTO v_avec_adresses FROM adresses_client;
    RAISE NOTICE 'Clients avec adresses: %', v_avec_adresses;
    
    SELECT COUNT(DISTINCT id_client) INTO v_avec_contacts FROM contacts_client;
    RAISE NOTICE 'Clients avec contacts: %', v_avec_contacts;
    
    SELECT COUNT(*) INTO v_count FROM clients WHERE actif = true;
    RAISE NOTICE 'Clients actifs: %', v_count;
END $$;

-- ============================================================================
-- 5. VÉRIFICATION DES COMMANDES
-- ============================================================================

DO $$
DECLARE
    v_count INTEGER;
    v_lignes INTEGER;
    v_avec_personnalisation INTEGER;
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES COMMANDES ===';
    
    SELECT COUNT(*) INTO v_count FROM commandes;
    RAISE NOTICE 'Total Commandes: %', v_count;
    
    SELECT COUNT(*) INTO v_lignes FROM articles_commande;
    RAISE NOTICE 'Total Lignes de Commande: %', v_lignes;
    
    SELECT COUNT(*) INTO v_avec_personnalisation 
    FROM articles_commande 
    WHERE personnalisation = true;
    RAISE NOTICE 'Lignes avec personnalisation: %', v_avec_personnalisation;
    
    SELECT COUNT(*) INTO v_count FROM commandes WHERE statut != 'Annuler';
    RAISE NOTICE 'Commandes actives (non annulées): %', v_count;
END $$;

-- ============================================================================
-- 6. VÉRIFICATION DES UTILISATEURS
-- ============================================================================

DO $$
DECLARE
    v_count INTEGER;
    v_avec_groupes INTEGER;
    v_avec_dashboards INTEGER;
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES UTILISATEURS ===';
    
    SELECT COUNT(*) INTO v_count FROM utilisateurs;
    RAISE NOTICE 'Total Utilisateurs: %', v_count;
    
    SELECT COUNT(*) INTO v_avec_groupes 
    FROM utilisateurs 
    WHERE id_groupe IS NOT NULL;
    RAISE NOTICE 'Utilisateurs avec groupe: %', v_avec_groupes;
    
    SELECT COUNT(DISTINCT id_utilisateur) INTO v_avec_dashboards 
    FROM utilisateurs_dashboards;
    RAISE NOTICE 'Utilisateurs avec dashboards: %', v_avec_dashboards;
    
    SELECT COUNT(*) INTO v_count FROM utilisateurs WHERE actif = true;
    RAISE NOTICE 'Utilisateurs actifs: %', v_count;
END $$;

-- ============================================================================
-- 7. VÉRIFICATION DES GROUPES
-- ============================================================================

DO $$
DECLARE
    v_count INTEGER;
    rec RECORD;
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES GROUPES ===';
    
    SELECT COUNT(*) INTO v_count FROM groupes;
    RAISE NOTICE 'Total Groupes: %', v_count;
    
    -- Afficher les groupes
    FOR rec IN SELECT code_groupe, libelle FROM groupes ORDER BY code_groupe
    LOOP
        RAISE NOTICE '  - % : %', rec.code_groupe, rec.libelle;
    END LOOP;
END $$;

-- ============================================================================
-- 8. RÉSUMÉ GÉNÉRAL
-- ============================================================================

DO $$
DECLARE
    v_attributs INTEGER;
    v_modeles INTEGER;
    v_articles INTEGER;
    v_clients INTEGER;
    v_commandes INTEGER;
    v_utilisateurs INTEGER;
BEGIN
    RAISE NOTICE '=== RÉSUMÉ GÉNÉRAL ===';
    
    SELECT COUNT(*) INTO v_attributs FROM parametres_types_produits;
    SELECT COUNT(*) INTO v_modeles FROM parametres_modeles;
    SELECT COUNT(*) INTO v_articles FROM articles_catalogue;
    SELECT COUNT(*) INTO v_clients FROM clients;
    SELECT COUNT(*) INTO v_commandes FROM commandes;
    SELECT COUNT(*) INTO v_utilisateurs FROM utilisateurs;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 STATISTIQUES GLOBALES:';
    RAISE NOTICE '  - Attributs (Types Produits): %', v_attributs;
    RAISE NOTICE '  - Modèles: %', v_modeles;
    RAISE NOTICE '  - Articles: %', v_articles;
    RAISE NOTICE '  - Clients: %', v_clients;
    RAISE NOTICE '  - Commandes: %', v_commandes;
    RAISE NOTICE '  - Utilisateurs: %', v_utilisateurs;
    RAISE NOTICE '';
    
    IF v_modeles > 0 AND v_articles > 0 AND v_clients > 0 AND v_commandes > 0 THEN
        RAISE NOTICE '✅ IMPORT COMPLET - Toutes les données principales sont présentes';
    ELSIF v_modeles = 0 OR v_articles = 0 THEN
        RAISE NOTICE '⚠️  ATTENTION - Certaines données principales manquent';
        RAISE NOTICE '   Vérifiez les scripts d''import pour les modèles et articles';
    ELSE
        RAISE NOTICE '⚠️  ATTENTION - Données partiellement importées';
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- FIN DU SCRIPT DE VÉRIFICATION
-- ============================================================================

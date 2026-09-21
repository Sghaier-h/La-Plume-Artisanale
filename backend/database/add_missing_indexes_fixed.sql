-- ============================================================================
-- SCRIPT : Ajout d'Index Manquants pour Optimisation Performance (CORRIGÉ)
-- ============================================================================
-- 
-- Ce script ajoute des index sur les colonnes fréquemment recherchées,
-- filtrées, triées ou utilisées dans des JOIN pour améliorer les performances.
--
-- CORRECTION : Vérification de l'existence des colonnes avant création d'index
--
-- Exécution : 
--   - Via pgAdmin : Ouvrir le fichier et exécuter
--   - Via psql : psql -U user -d database -f add_missing_indexes_fixed.sql
--
-- ============================================================================

-- ============================================================================
-- INDEX POUR RECHERCHES TEXTUELLES (LIKE/ILIKE)
-- ============================================================================

-- Articles et catalogue
CREATE INDEX IF NOT EXISTS idx_articles_code ON articles_catalogue(code_article);
CREATE INDEX IF NOT EXISTS idx_articles_designation ON articles_catalogue(designation);
CREATE INDEX IF NOT EXISTS idx_articles_code_lower ON articles_catalogue(LOWER(code_article));
CREATE INDEX IF NOT EXISTS idx_articles_designation_lower ON articles_catalogue(LOWER(designation));

-- Clients
CREATE INDEX IF NOT EXISTS idx_clients_code ON clients(code_client);
CREATE INDEX IF NOT EXISTS idx_clients_raison_sociale ON clients(raison_sociale);
CREATE INDEX IF NOT EXISTS idx_clients_code_lower ON clients(LOWER(code_client));
CREATE INDEX IF NOT EXISTS idx_clients_raison_sociale_lower ON clients(LOWER(raison_sociale));

-- Fournisseurs
CREATE INDEX IF NOT EXISTS idx_fournisseurs_code ON fournisseurs(code_fournisseur);
CREATE INDEX IF NOT EXISTS idx_fournisseurs_raison_sociale ON fournisseurs(raison_sociale);

-- Machines
CREATE INDEX IF NOT EXISTS idx_machines_numero ON machines(numero_machine);

-- ============================================================================
-- INDEX POUR FILTRES PAR STATUT
-- ============================================================================

-- Commandes
CREATE INDEX IF NOT EXISTS idx_commandes_statut ON commandes(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_statut_date ON commandes(statut, date_commande);

-- Devis
CREATE INDEX IF NOT EXISTS idx_devis_statut ON devis(statut);
CREATE INDEX IF NOT EXISTS idx_devis_statut_date ON devis(statut, date_devis);

-- Factures
CREATE INDEX IF NOT EXISTS idx_factures_statut ON factures(statut);
CREATE INDEX IF NOT EXISTS idx_factures_statut_date ON factures(statut, date_facture);

-- Ordres de fabrication
CREATE INDEX IF NOT EXISTS idx_of_statut ON ordres_fabrication(statut);
CREATE INDEX IF NOT EXISTS idx_of_statut_date ON ordres_fabrication(statut, date_creation_of);
CREATE INDEX IF NOT EXISTS idx_of_priorite ON ordres_fabrication(priorite);

-- Bons de livraison
CREATE INDEX IF NOT EXISTS idx_bl_statut ON bons_livraison(statut);
CREATE INDEX IF NOT EXISTS idx_bl_statut_date ON bons_livraison(statut, date_livraison);

-- Avoirs
CREATE INDEX IF NOT EXISTS idx_avoirs_statut ON avoirs(statut);

-- Bons retour
CREATE INDEX IF NOT EXISTS idx_br_statut ON bons_retour(statut);

-- Articles
CREATE INDEX IF NOT EXISTS idx_articles_actif ON articles_catalogue(actif);

-- Machines
CREATE INDEX IF NOT EXISTS idx_machines_statut ON machines(statut);
CREATE INDEX IF NOT EXISTS idx_machines_actif ON machines(actif);

-- ============================================================================
-- INDEX POUR FILTRES PAR DATE
-- ============================================================================

-- Commandes
CREATE INDEX IF NOT EXISTS idx_commandes_date_commande ON commandes(date_commande);
CREATE INDEX IF NOT EXISTS idx_commandes_date_livraison_prevue ON commandes(date_livraison_prevue);

-- Devis
CREATE INDEX IF NOT EXISTS idx_devis_date_devis ON devis(date_devis);
CREATE INDEX IF NOT EXISTS idx_devis_date_validite ON devis(date_validite);

-- Factures
CREATE INDEX IF NOT EXISTS idx_factures_date_facture ON factures(date_facture);
CREATE INDEX IF NOT EXISTS idx_factures_date_echeance ON factures(date_echeance);

-- OF
CREATE INDEX IF NOT EXISTS idx_of_date_debut_prevue ON ordres_fabrication(date_debut_prevue);
CREATE INDEX IF NOT EXISTS idx_of_date_fin_prevue ON ordres_fabrication(date_fin_prevue);
CREATE INDEX IF NOT EXISTS idx_of_date_debut_reelle ON ordres_fabrication(date_debut_reelle);
CREATE INDEX IF NOT EXISTS idx_of_date_fin_reelle ON ordres_fabrication(date_fin_reelle);

-- ============================================================================
-- INDEX POUR JOINS (Foreign Keys) - Avec vérification des colonnes
-- ============================================================================

-- Lignes commandes
CREATE INDEX IF NOT EXISTS idx_articles_commande_commande ON articles_commande(id_commande);
CREATE INDEX IF NOT EXISTS idx_articles_commande_article ON articles_commande(id_article);

-- Lignes devis
CREATE INDEX IF NOT EXISTS idx_lignes_devis_devis ON lignes_devis(id_devis);
CREATE INDEX IF NOT EXISTS idx_lignes_devis_article ON lignes_devis(id_article);

-- Lignes factures
CREATE INDEX IF NOT EXISTS idx_lignes_facture_facture ON lignes_facture(id_facture);
CREATE INDEX IF NOT EXISTS idx_lignes_facture_article ON lignes_facture(id_article);

-- OF
CREATE INDEX IF NOT EXISTS idx_of_article_commande ON ordres_fabrication(id_article_commande);
CREATE INDEX IF NOT EXISTS idx_of_article ON ordres_fabrication(id_article);

-- Commandes -> Clients
CREATE INDEX IF NOT EXISTS idx_commandes_client ON commandes(id_client);

-- Devis -> Clients
CREATE INDEX IF NOT EXISTS idx_devis_client ON devis(id_client);

-- Factures -> Clients
CREATE INDEX IF NOT EXISTS idx_factures_client ON factures(id_client);

-- Factures -> Commandes
CREATE INDEX IF NOT EXISTS idx_factures_commande ON factures(id_commande);

-- Factures -> BL (vérifier si colonne existe - CORRECTION)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'factures' 
        AND column_name = 'id_bl'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_factures_bl ON factures(id_bl);
        RAISE NOTICE '✅ Index idx_factures_bl créé';
    ELSE
        RAISE NOTICE '⚠️ Colonne id_bl n''existe pas dans factures - index non créé';
    END IF;
END $$;

-- BL -> Commandes
CREATE INDEX IF NOT EXISTS idx_bl_commande ON bons_livraison(id_commande);

-- BL -> Clients
CREATE INDEX IF NOT EXISTS idx_bl_client ON bons_livraison(id_client);

-- ============================================================================
-- INDEX POUR TRAÇABILITÉ (created_by, updated_by) - Avec vérification
-- ============================================================================

-- Index composites pour recherches par utilisateur et date (avec vérification)
DO $$
BEGIN
    -- Commandes
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'commandes' 
        AND column_name = 'created_by'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_commandes_created_by_date ON commandes(created_by, date_commande) WHERE created_by IS NOT NULL;
    END IF;

    -- Devis
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'devis' 
        AND column_name = 'created_by'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_devis_created_by_date ON devis(created_by, date_devis) WHERE created_by IS NOT NULL;
    END IF;

    -- OF
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'ordres_fabrication' 
        AND column_name = 'created_by'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_of_created_by_date ON ordres_fabrication(created_by, date_creation_of) WHERE created_by IS NOT NULL;
    END IF;

    -- Factures
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'factures' 
        AND column_name = 'created_by'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_factures_created_by_date ON factures(created_by, date_facture) WHERE created_by IS NOT NULL;
    END IF;
END $$;

-- ============================================================================
-- INDEX POUR TRIES FRÉQUENTS
-- ============================================================================

-- Commandes par date et montant
CREATE INDEX IF NOT EXISTS idx_commandes_date_montant ON commandes(date_commande DESC, montant_total DESC);

-- OF par priorité et date
CREATE INDEX IF NOT EXISTS idx_of_priorite_date ON ordres_fabrication(priorite DESC, date_creation_of DESC);

-- Articles par ordre d'affichage
CREATE INDEX IF NOT EXISTS idx_articles_ordre_affichage ON articles_catalogue(ordre_affichage, actif);

-- ============================================================================
-- INDEX POUR RECHERCHES AVANCÉES (Composites)
-- ============================================================================

-- Recherche articles par type et actif
CREATE INDEX IF NOT EXISTS idx_articles_type_actif ON articles_catalogue(id_type_article, actif) WHERE actif = true;

-- Recherche commandes par client et statut
CREATE INDEX IF NOT EXISTS idx_commandes_client_statut ON commandes(id_client, statut);

-- Recherche OF par article et statut
CREATE INDEX IF NOT EXISTS idx_of_article_statut ON ordres_fabrication(id_article, statut);

-- ============================================================================
-- INDEX POUR STOCK
-- ============================================================================

-- Stock matières premières (avec vérification table)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'stock_matières_premières'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_stock_mp_matiere ON stock_matières_premières(id_matiere_premiere);
        CREATE INDEX IF NOT EXISTS idx_stock_mp_statut ON stock_matières_premières(statut);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'stock_produits_finis'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_stock_pf_article ON stock_produits_finis(id_article);
        CREATE INDEX IF NOT EXISTS idx_stock_pf_statut ON stock_produits_finis(statut);
    END IF;
END $$;

-- ============================================================================
-- INDEX POUR SUIVI FABRICATION
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_suivi_fabrication_of ON suivi_fabrication(id_of);
CREATE INDEX IF NOT EXISTS idx_suivi_fabrication_machine ON suivi_fabrication(id_machine);
CREATE INDEX IF NOT EXISTS idx_suivi_fabrication_dates ON suivi_fabrication(date_debut, date_fin);

-- ============================================================================
-- INDEX POUR SOUS-TRAITANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_soustraitants_code ON sous_traitants(code_soustraitant);
CREATE INDEX IF NOT EXISTS idx_mouvements_st_of ON mouvements_sous_traitance(id_of);
CREATE INDEX IF NOT EXISTS idx_mouvements_st_soustraitant ON mouvements_sous_traitance(id_soustraitant);
CREATE INDEX IF NOT EXISTS idx_mouvements_st_date ON mouvements_sous_traitance(date_sortie);

-- ============================================================================
-- INDEX POUR QUALITÉ (avec vérification tables)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'non_conformites'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_non_conformites_of ON non_conformites(id_of);
        CREATE INDEX IF NOT EXISTS idx_non_conformites_statut ON non_conformites(statut);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'alertes_actives'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_alertes_actives_type ON alertes_actives(type_alerte);
        CREATE INDEX IF NOT EXISTS idx_alertes_actives_statut ON alertes_actives(statut);
    END IF;
END $$;

-- ============================================================================
-- INDEX POUR AUDIT ET LOGS (avec vérification tables)
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'audit_log'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_log_date ON audit_log(created_at);
        CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
        CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'logs_systeme'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_logs_systeme_user ON logs_systeme(id_utilisateur);
        CREATE INDEX IF NOT EXISTS idx_logs_systeme_date ON logs_systeme(date_action);
        CREATE INDEX IF NOT EXISTS idx_logs_systeme_module ON logs_systeme(module);
    END IF;
END $$;

-- ============================================================================
-- RÉSUMÉ
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Index créés avec succès pour optimisation performance';
    RAISE NOTICE '📊 Index créés pour :';
    RAISE NOTICE '   - Recherches textuelles (LIKE/ILIKE)';
    RAISE NOTICE '   - Filtres par statut et date';
    RAISE NOTICE '   - Joins (Foreign Keys)';
    RAISE NOTICE '   - Traçabilité (created_by/updated_by)';
    RAISE NOTICE '   - Tries fréquents';
    RAISE NOTICE '   - Recherches avancées (composites)';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ Les index existants ont été ignorés (normal avec IF NOT EXISTS)';
    RAISE NOTICE '⚠️ Les colonnes/tables inexistantes ont été ignorées automatiquement';
END $$;

-- ============================================================================
-- SCRIPT DE CRÉATION DE DONNÉES DE TEST
-- ============================================================================
-- Ce script crée des données de test complètes pour tous les modules
-- Utilisation: psql -U postgres -d la_plume_artisanale -f insert_donnees_test.sql
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. UTILISATEURS DE TEST
-- ============================================================================
-- Note: Structure corrigée - la table utilisateurs utilise:
-- - nom_utilisateur (pas nom/prenom)
-- - mot_de_passe_hash (pas mot_de_passe)
-- - Les rôles via utilisateurs_roles

DO $$
DECLARE
  v_admin_id INTEGER;
  v_chef_prod_id INTEGER;
  v_operateur_id INTEGER;
  v_commercial_id INTEGER;
  v_admin_role_id INTEGER;
  v_chef_prod_role_id INTEGER;
  v_operateur_role_id INTEGER;
  v_commercial_role_id INTEGER;
BEGIN
  -- Insérer ou mettre à jour les utilisateurs
  -- Utiliser une approche qui gère les conflits sur email ET nom_utilisateur
  
  -- Pour chaque utilisateur, insérer ou mettre à jour
  -- Insérer admin - ignorer si existe déjà par nom_utilisateur
  INSERT INTO utilisateurs (nom_utilisateur, email, mot_de_passe_hash, actif) VALUES
  ('admin', 'admin@laplume.tn', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8u8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', true)
  ON CONFLICT (nom_utilisateur) DO NOTHING;
  
  -- Mettre à jour si l'utilisateur existe déjà (par email ou nom_utilisateur)
  UPDATE utilisateurs SET
    email = 'admin@laplume.tn',
    mot_de_passe_hash = '$2b$10$rQ8K8K8K8K8K8K8K8K8K8u8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    actif = true
  WHERE nom_utilisateur = 'admin' OR email = 'admin@laplume.tn';
  
  -- Si l'utilisateur existe par nom_utilisateur mais pas par email, le mettre à jour
  -- Ne pas modifier nom_utilisateur si déjà existant (pour éviter les conflits)
  
  INSERT INTO utilisateurs (nom_utilisateur, email, mot_de_passe_hash, actif) VALUES
  ('jean.dupont', 'jean.dupont@laplume.tn', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8u8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', true)
  ON CONFLICT (nom_utilisateur) DO NOTHING;
  
  UPDATE utilisateurs SET
    email = 'jean.dupont@laplume.tn',
    mot_de_passe_hash = '$2b$10$rQ8K8K8K8K8K8K8K8K8K8u8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    actif = true
  WHERE nom_utilisateur = 'jean.dupont' OR email = 'jean.dupont@laplume.tn';
  
  
  INSERT INTO utilisateurs (nom_utilisateur, email, mot_de_passe_hash, actif) VALUES
  ('marie.martin', 'marie.martin@laplume.tn', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8u8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', true)
  ON CONFLICT (nom_utilisateur) DO NOTHING;
  
  UPDATE utilisateurs SET
    email = 'marie.martin@laplume.tn',
    mot_de_passe_hash = '$2b$10$rQ8K8K8K8K8K8K8K8K8K8u8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    actif = true
  WHERE nom_utilisateur = 'marie.martin' OR email = 'marie.martin@laplume.tn';
  
  
  INSERT INTO utilisateurs (nom_utilisateur, email, mot_de_passe_hash, actif) VALUES
  ('pierre.bernard', 'pierre.bernard@laplume.tn', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8u8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', true)
  ON CONFLICT (nom_utilisateur) DO NOTHING;
  
  UPDATE utilisateurs SET
    email = 'pierre.bernard@laplume.tn',
    mot_de_passe_hash = '$2b$10$rQ8K8K8K8K8K8K8K8K8K8u8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K',
    actif = true
  WHERE nom_utilisateur = 'pierre.bernard' OR email = 'pierre.bernard@laplume.tn';
  

  -- Récupérer les IDs des utilisateurs
  SELECT id_utilisateur INTO v_admin_id FROM utilisateurs WHERE email = 'admin@laplume.tn';
  SELECT id_utilisateur INTO v_chef_prod_id FROM utilisateurs WHERE email = 'jean.dupont@laplume.tn';
  SELECT id_utilisateur INTO v_operateur_id FROM utilisateurs WHERE email = 'marie.martin@laplume.tn';
  SELECT id_utilisateur INTO v_commercial_id FROM utilisateurs WHERE email = 'pierre.bernard@laplume.tn';

  -- Récupérer les IDs des rôles (si la table roles existe)
  SELECT id_role INTO v_admin_role_id FROM roles WHERE code_role = 'ADMIN' LIMIT 1;
  SELECT id_role INTO v_chef_prod_role_id FROM roles WHERE code_role = 'CHEF_PROD' LIMIT 1;
  SELECT id_role INTO v_operateur_role_id FROM roles WHERE code_role = 'OPERATEUR' LIMIT 1;
  SELECT id_role INTO v_commercial_role_id FROM roles WHERE code_role = 'COMMERCIAL' LIMIT 1;

  -- Assigner les rôles (si les rôles existent)
  IF v_admin_id IS NOT NULL AND v_admin_role_id IS NOT NULL THEN
    INSERT INTO utilisateurs_roles (id_utilisateur, id_role)
    VALUES (v_admin_id, v_admin_role_id)
    ON CONFLICT (id_utilisateur, id_role) DO NOTHING;
  END IF;

  IF v_chef_prod_id IS NOT NULL AND v_chef_prod_role_id IS NOT NULL THEN
    INSERT INTO utilisateurs_roles (id_utilisateur, id_role)
    VALUES (v_chef_prod_id, v_chef_prod_role_id)
    ON CONFLICT (id_utilisateur, id_role) DO NOTHING;
  END IF;

  IF v_operateur_id IS NOT NULL AND v_operateur_role_id IS NOT NULL THEN
    INSERT INTO utilisateurs_roles (id_utilisateur, id_role)
    VALUES (v_operateur_id, v_operateur_role_id)
    ON CONFLICT (id_utilisateur, id_role) DO NOTHING;
  END IF;

  IF v_commercial_id IS NOT NULL AND v_commercial_role_id IS NOT NULL THEN
    INSERT INTO utilisateurs_roles (id_utilisateur, id_role)
    VALUES (v_commercial_id, v_commercial_role_id)
    ON CONFLICT (id_utilisateur, id_role) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- 2. CLIENTS DE TEST
-- ============================================================================
-- Structure: code_client, raison_sociale, adresse, code_postal, ville, pays, telephone, email, actif
INSERT INTO clients (code_client, raison_sociale, email, telephone, adresse, ville, code_postal, pays, actif) VALUES
('CLI-001', 'Boutique Tunis Centre', 'contact@tuniscentre.tn', '+216 71 123 456', 'Avenue Habib Bourguiba', 'Tunis', '1000', 'Tunisie', true),
('CLI-002', 'Magasin Sfax', 'info@magasinsfax.tn', '+216 74 234 567', 'Route de la Soukra', 'Sfax', '3000', 'Tunisie', true),
('CLI-003', 'Showroom Hammamet', 'showroom@hammamet.tn', '+216 72 345 678', 'Zone Touristique', 'Hammamet', '8050', 'Tunisie', true),
('CLI-004', 'Boutique Djerba', 'boutique@djerba.tn', '+216 75 456 789', 'Zone Hôtelière', 'Djerba', '4116', 'Tunisie', true),
('CLI-005', 'Client Export France', 'export@france.tn', '+33 1 23 45 67 89', '123 Rue de Paris', 'Paris', '75001', 'France', true)
ON CONFLICT (code_client) DO UPDATE SET
  raison_sociale = EXCLUDED.raison_sociale,
  email = EXCLUDED.email,
  telephone = EXCLUDED.telephone,
  adresse = EXCLUDED.adresse,
  ville = EXCLUDED.ville,
  code_postal = EXCLUDED.code_postal,
  pays = EXCLUDED.pays,
  actif = EXCLUDED.actif;

-- ============================================================================
-- 3. MACHINES DE TEST
-- ============================================================================
INSERT INTO machines (numero_machine, designation, type_machine, capacite_heure, etat, actif) VALUES
('MACH-001', 'Métier à tisser automatique 1', 'TISSAGE', 8.0, 'OPERATIONNELLE', true),
('MACH-002', 'Métier à tisser automatique 2', 'TISSAGE', 8.0, 'OPERATIONNELLE', true),
('MACH-003', 'Machine à coudre industrielle', 'COUTURE', 6.0, 'OPERATIONNELLE', true),
('MACH-004', 'Machine de finition', 'FINITION', 4.0, 'EN_MAINTENANCE', true),
('MACH-005', 'Machine d''emballage', 'EMBALLAGE', 5.0, 'OPERATIONNELLE', true)
ON CONFLICT (numero_machine) DO UPDATE SET
  designation = EXCLUDED.designation,
  type_machine = EXCLUDED.type_machine,
  etat = EXCLUDED.etat,
  actif = EXCLUDED.actif;

-- ============================================================================
-- 4. MATIÈRES PREMIÈRES DE TEST
-- ============================================================================
INSERT INTO matieres_premieres (code_mp, designation, unite, stock_actuel, stock_minimum, prix_unitaire, fournisseur_principal, actif) VALUES
('MP-001', 'Fil de coton blanc', 'KG', 500.0, 100.0, 15.50, 'Fournisseur Textile Tunis', true),
('MP-002', 'Fil de coton coloré', 'KG', 300.0, 50.0, 18.75, 'Fournisseur Textile Tunis', true),
('MP-003', 'Fil de lin', 'KG', 200.0, 50.0, 25.00, 'Fournisseur Lin Méditerranée', true),
('MP-004', 'Fil de bambou', 'KG', 150.0, 30.0, 22.50, 'Fournisseur Éco Textile', true),
('MP-005', 'Fil métallique (lurex)', 'KG', 50.0, 10.0, 45.00, 'Fournisseur Textile Premium', true)
ON CONFLICT (code_mp) DO UPDATE SET
  designation = EXCLUDED.designation,
  stock_actuel = EXCLUDED.stock_actuel,
  prix_unitaire = EXCLUDED.prix_unitaire,
  actif = EXCLUDED.actif;

-- ============================================================================
-- 5. ARTICLES DE TEST (si les paramètres existent)
-- ============================================================================
-- Récupérer les IDs des paramètres
DO $$
DECLARE
  v_id_modele INTEGER;
  v_id_dimension INTEGER;
  v_id_finition INTEGER;
  v_id_tissage INTEGER;
  v_id_type_produit INTEGER;
  v_id_nb_couleurs INTEGER;
BEGIN
  -- Récupérer les IDs
  SELECT id INTO v_id_modele FROM parametres_modeles WHERE code_modele = 'AR' LIMIT 1;
  SELECT id INTO v_id_dimension FROM parametres_dimensions WHERE code = '1020' LIMIT 1;
  SELECT id INTO v_id_finition FROM parametres_finitions WHERE code = 'FR' LIMIT 1;
  SELECT id INTO v_id_tissage FROM parametres_tissages WHERE code = 'PL' LIMIT 1;
  SELECT id INTO v_id_type_produit FROM parametres_types_produits WHERE code = 'FOU' LIMIT 1;
  SELECT id INTO v_id_nb_couleurs FROM parametres_nombre_couleurs WHERE code = 'B' LIMIT 1;

  -- Insérer des articles de test
  INSERT INTO articles_catalogue (
    code_article,
    designation,
    ref_commerciale,
    ref_fabrication,
    id_modele,
    id_type_produit,
    id_dimension,
    id_finition,
    id_tissage,
    id_nombre_couleurs,
    nb_couleurs,
    prix_revient,
    prix_unitaire_base,
    unite_vente,
    actif
  ) VALUES
  ('AR-1020-B-FR-001', 'Fouta ARTHUR 100/200 CM 2 Couleurs Frange', 'AR1020-B02-01', 'AR1020-B-02-01', 
   v_id_modele, v_id_type_produit, v_id_dimension, v_id_finition, v_id_tissage, v_id_nb_couleurs, 2, 7.50, 9.75, 'pièce', true),
  ('AR-1020-B-FR-002', 'Fouta ARTHUR 100/200 CM 2 Couleurs Frange Variante', 'AR1020-B02-02', 'AR1020-B-02-02',
   v_id_modele, v_id_type_produit, v_id_dimension, v_id_finition, v_id_tissage, v_id_nb_couleurs, 2, 7.50, 9.75, 'pièce', true),
  ('AR-1626-B-FR-001', 'Fouta ARTHUR 160/260 CM 2 Couleurs Frange', 'AR1626-B02-01', 'AR1626-B-02-01',
   v_id_modele, v_id_type_produit, 
   (SELECT id FROM parametres_dimensions WHERE code = '1626' LIMIT 1),
   v_id_finition, v_id_tissage, v_id_nb_couleurs, 2, 9.75, 12.675, 'pièce', true)
  ON CONFLICT (code_article) DO UPDATE SET
    designation = EXCLUDED.designation,
    prix_revient = EXCLUDED.prix_revient,
    prix_unitaire_base = EXCLUDED.prix_unitaire_base,
    actif = EXCLUDED.actif;
END $$;

-- ============================================================================
-- 6. COMMANDES DE TEST
-- ============================================================================
DO $$
DECLARE
  v_client_id INTEGER;
  v_article_id INTEGER;
  v_commande_id INTEGER;
BEGIN
  -- Récupérer un client
  SELECT id_client INTO v_client_id FROM clients WHERE email = 'contact@tuniscentre.tn' LIMIT 1;
  -- Récupérer un article
  SELECT id_article INTO v_article_id FROM articles_catalogue WHERE code_article = 'AR-1020-B-FR-001' LIMIT 1;

  IF v_client_id IS NOT NULL AND v_article_id IS NOT NULL THEN
    -- Créer une commande
    INSERT INTO commandes (
      numero_commande,
      id_client,
      date_commande,
      date_livraison_prevue,
      statut,
      montant_total,
      observations
    ) VALUES (
      'CMD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
      v_client_id,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '15 days',
      'validee',
      195.00,
      'Commande de test - Foutas ARTHUR'
    ) RETURNING id_commande INTO v_commande_id;

    -- Ajouter des lignes de commande
    IF v_commande_id IS NOT NULL THEN
      INSERT INTO lignes_commande (
        id_commande,
        id_article,
        quantite,
        prix_unitaire,
        montant_ligne
      ) VALUES
      (v_commande_id, v_article_id, 10, 9.75, 97.50),
      (v_commande_id, v_article_id, 10, 9.75, 97.50);
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 7. ORDRES DE FABRICATION DE TEST
-- ============================================================================
DO $$
DECLARE
  v_article_id INTEGER;
  v_commande_id INTEGER;
  v_machine_id INTEGER;
  v_of_id INTEGER;
BEGIN
  -- Récupérer les IDs
  SELECT id_article INTO v_article_id FROM articles_catalogue WHERE code_article = 'AR-1020-B-FR-001' LIMIT 1;
  SELECT id_commande INTO v_commande_id FROM commandes ORDER BY id_commande DESC LIMIT 1;
  SELECT id_machine INTO v_machine_id FROM machines WHERE numero_machine = 'MACH-001' LIMIT 1;

  IF v_article_id IS NOT NULL THEN
    -- Créer un OF
    INSERT INTO ordres_fabrication (
      numero_of,
      id_commande,
      id_article,
      quantite_a_produire,
      date_debut_prevue,
      date_fin_prevue,
      statut,
      priorite,
      id_machine
    ) VALUES (
      'OF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
      v_commande_id,
      v_article_id,
      20,
      CURRENT_DATE + INTERVAL '1 day',
      CURRENT_DATE + INTERVAL '5 days',
      'en_attente',
      'normale',
      v_machine_id
    ) RETURNING id_of INTO v_of_id;

    -- Créer un OF en cours
    IF v_of_id IS NOT NULL THEN
      INSERT INTO ordres_fabrication (
        numero_of,
        id_commande,
        id_article,
        quantite_a_produire,
        quantite_produite,
        date_debut_prevue,
        date_debut_reelle,
        date_fin_prevue,
        statut,
        priorite,
        id_machine
      ) VALUES (
        'OF-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-002',
        v_commande_id,
        v_article_id,
        15,
        8,
        CURRENT_DATE - INTERVAL '2 days',
        CURRENT_DATE - INTERVAL '2 days',
        CURRENT_DATE + INTERVAL '3 days',
        'en_cours',
        'haute',
        v_machine_id
      );
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 8. SUIVIS DE FABRICATION DE TEST
-- ============================================================================
DO $$
DECLARE
  v_of_id INTEGER;
  v_machine_id INTEGER;
  v_operateur_id INTEGER;
BEGIN
  -- Récupérer les IDs
  SELECT id_of INTO v_of_id FROM ordres_fabrication WHERE statut = 'en_cours' ORDER BY id_of DESC LIMIT 1;
  SELECT id_machine INTO v_machine_id FROM machines WHERE numero_machine = 'MACH-001' LIMIT 1;
  SELECT id_utilisateur INTO v_operateur_id FROM utilisateurs WHERE email = 'marie.martin@laplume.tn' LIMIT 1;

  IF v_of_id IS NOT NULL AND v_machine_id IS NOT NULL THEN
    INSERT INTO suivi_fabrication (
      numero_suivi,
      id_of,
      id_machine,
      id_operateur,
      quantite_prevue,
      quantite_produite,
      quantite_bonne,
      quantite_rebut,
      date_debut,
      statut,
      observations
    ) VALUES (
      'SUIVI-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
      v_of_id,
      v_machine_id,
      v_operateur_id,
      15,
      8,
      7,
      1,
      CURRENT_DATE - INTERVAL '2 days',
      'EN_COURS',
      'Suivi de test - Production en cours'
    );
  END IF;
END $$;

-- ============================================================================
-- 9. MOUVEMENTS DE STOCK DE TEST
-- ============================================================================
DO $$
DECLARE
  v_article_id INTEGER;
  v_mp_id INTEGER;
BEGIN
  -- Récupérer les IDs
  SELECT id_article INTO v_article_id FROM articles_catalogue WHERE code_article = 'AR-1020-B-FR-001' LIMIT 1;
  SELECT id_mp INTO v_mp_id FROM matieres_premieres WHERE code_mp = 'MP-001' LIMIT 1;

  -- Mouvement entrée produits finis
  IF v_article_id IS NOT NULL THEN
    INSERT INTO mouvements_stock (
      type_mouvement,
      id_article,
      quantite,
      date_mouvement,
      motif,
      id_utilisateur
    ) VALUES (
      'ENTREE',
      v_article_id,
      50,
      CURRENT_DATE - INTERVAL '5 days',
      'Réception production - Test',
      (SELECT id_utilisateur FROM utilisateurs WHERE email = 'jean.dupont@laplume.tn' LIMIT 1)
    );
  END IF;

  -- Mouvement sortie matières premières
  IF v_mp_id IS NOT NULL THEN
    INSERT INTO mouvements_stock (
      type_mouvement,
      id_matiere_premiere,
      quantite,
      date_mouvement,
      motif,
      id_utilisateur
    ) VALUES (
      'SORTIE',
      v_mp_id,
      25.5,
      CURRENT_DATE - INTERVAL '3 days',
      'Consommation production - Test',
      (SELECT id_utilisateur FROM utilisateurs WHERE email = 'jean.dupont@laplume.tn' LIMIT 1)
    );
  END IF;
END $$;

-- ============================================================================
-- 10. INVENTAIRES DE TEST
-- ============================================================================
DO $$
DECLARE
  v_article_id INTEGER;
  v_inventaire_id INTEGER;
BEGIN
  SELECT id_article INTO v_article_id FROM articles_catalogue WHERE code_article = 'AR-1020-B-FR-001' LIMIT 1;

  IF v_article_id IS NOT NULL THEN
    INSERT INTO inventaires (
      numero_inventaire,
      date_inventaire,
      type_inventaire,
      statut,
      observations
    ) VALUES (
      'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
      CURRENT_DATE - INTERVAL '1 day',
      'COMPLET',
      'EN_ATTENTE',
      'Inventaire de test'
    ) RETURNING id_inventaire INTO v_inventaire_id;

    IF v_inventaire_id IS NOT NULL THEN
      INSERT INTO lignes_inventaire (
        id_inventaire,
        id_article,
        quantite_theorique,
        quantite_reelle,
        ecart
      ) VALUES (
        v_inventaire_id,
        v_article_id,
        50,
        48,
        -2
      );
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 11. ENTREPÔTS DE TEST
-- ============================================================================
INSERT INTO entrepots (
  code_entrepot,
  designation,
  adresse,
  ville,
  responsable,
  actif
) VALUES
('ENT-001', 'Entrepôt Principal', 'Zone Industrielle', 'Tunis', 'Jean Dupont', true),
('ENT-002', 'Showroom', 'Avenue Habib Bourguiba', 'Tunis', 'Marie Martin', true),
('ENT-003', 'Réserve', 'Zone Industrielle', 'Tunis', 'Pierre Bernard', true)
ON CONFLICT (code_entrepot) DO UPDATE SET
  designation = EXCLUDED.designation,
  actif = EXCLUDED.actif;

-- ============================================================================
-- 12. FOURNITURES DE TEST
-- ============================================================================
INSERT INTO fournitures (
  code_fourniture,
  designation,
  unite,
  stock_actuel,
  stock_minimum,
  prix_unitaire,
  fournisseur,
  actif
) VALUES
('FOUR-001', 'Étiquettes produits', 'unité', 5000, 1000, 0.05, 'Fournisseur Emballage', true),
('FOUR-002', 'Sacs en papier', 'unité', 2000, 500, 0.15, 'Fournisseur Emballage', true),
('FOUR-003', 'Rubans de finition', 'mètre', 500, 100, 0.25, 'Fournisseur Accessoires', true),
('FOUR-004', 'Fils de couture', 'bobine', 200, 50, 2.50, 'Fournisseur Textile', true)
ON CONFLICT (code_fourniture) DO UPDATE SET
  designation = EXCLUDED.designation,
  stock_actuel = EXCLUDED.stock_actuel,
  actif = EXCLUDED.actif;

-- ============================================================================
-- 13. CONTRÔLES QUALITÉ DE TEST
-- ============================================================================
DO $$
DECLARE
  v_of_id INTEGER;
  v_article_id INTEGER;
BEGIN
  SELECT id_of INTO v_of_id FROM ordres_fabrication WHERE statut = 'en_cours' ORDER BY id_of DESC LIMIT 1;
  SELECT id_article INTO v_article_id FROM articles_catalogue WHERE code_article = 'AR-1020-B-FR-001' LIMIT 1;

  IF v_of_id IS NOT NULL AND v_article_id IS NOT NULL THEN
    INSERT INTO controles_qualite (
      id_of,
      id_article,
      type_controle,
      date_controle,
      statut,
      observations
    ) VALUES
    (v_of_id, v_article_id, 'CONTROLE_FINAL', CURRENT_DATE, 'EN_ATTENTE', 'Contrôle qualité de test'),
    (v_of_id, v_article_id, 'CONTROLE_INTERMEDIAIRE', CURRENT_DATE - INTERVAL '1 day', 'VALIDE', 'Contrôle intermédiaire réussi');
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- MESSAGE DE CONFIRMATION
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Données de test créées avec succès !';
  RAISE NOTICE '   - Utilisateurs: 4';
  RAISE NOTICE '   - Clients: 5';
  RAISE NOTICE '   - Machines: 5';
  RAISE NOTICE '   - Matières premières: 5';
  RAISE NOTICE '   - Articles: 3';
  RAISE NOTICE '   - Commandes: 1';
  RAISE NOTICE '   - Ordres de fabrication: 2';
  RAISE NOTICE '   - Suivis de fabrication: 1';
  RAISE NOTICE '   - Mouvements de stock: 2';
  RAISE NOTICE '   - Inventaires: 1';
  RAISE NOTICE '   - Entrepôts: 3';
  RAISE NOTICE '   - Fournitures: 4';
  RAISE NOTICE '   - Contrôles qualité: 2';
END $$;

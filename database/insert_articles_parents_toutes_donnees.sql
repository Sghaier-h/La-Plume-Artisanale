-- ============================================================================
-- INSERTION COMPLÈTE DES MODÈLES D'ARTICLES PARENTS
-- ============================================================================
-- Ce script insère TOUS les articles parents depuis les données du catalogue
-- Il nécessite que les fonctions soient créées via insert_modeles_articles_parents.sql
-- ============================================================================

-- Vérifier que les fonctions existent
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'insert_article_parent') THEN
    RAISE EXCEPTION 'Les fonctions doivent être créées d''abord. Exécutez insert_modeles_articles_parents.sql';
  END IF;
END $$;

-- ============================================================================
-- INSERTION DE TOUS LES ARTICLES PARENTS
-- Format: SELECT insert_article_parent(modele, code_modele, type_produit, code_dim, tissage, code_tissage, nb_couleurs, code_nb_couleurs, finition, code_finition, composition, prix_revient, prix_vente);
-- ============================================================================

-- ARTICLES ARTHUR (AR)
SELECT insert_article_parent('ARTHUR', 'AR', 'Fouta', '1020', 'Tissage Plat', 'PL', '2 Couleurs', 'B', 'Frange', 'FR', 1, '7,500', '9,750');
SELECT insert_article_parent('ARTHUR', 'AR', 'Fouta', '1626', 'Tissage Plat', 'PL', '2 Couleurs', 'B', 'Frange', 'FR', 1, '9,750', '12,675');
SELECT insert_article_parent('ARTHUR', 'AR', 'Fouta', '2020', 'Tissage Plat', 'PL', '2 Couleurs', 'B', 'Frange', 'FR', 1, '12,000', '15,600');
SELECT insert_article_parent('ARTHUR', 'AR', 'Fouta', '2030', 'Tissage Plat', 'PL', '2 Couleurs', 'B', 'Frange', 'FR', 1, '16,000', '20,800');
SELECT insert_article_parent('ARTHUR', 'AR', 'Fouta', '2426', 'Tissage Plat', 'PL', '2 Couleurs', 'B', 'Frange', 'FR', 1, '18,000', '23,400');
SELECT insert_article_parent('ARTHUR', 'AR', 'Jeté', '0103', 'Tissage Plat', 'PL', '2 Couleurs', 'B', 'Frange Court', 'Fcourt', 2, '2,500', '3,250');
SELECT insert_article_parent('ARTHUR', 'AR', 'Coussin Sac', '2020', 'Tissage Plat', 'PL', 'Uni', 'U', 'Couture', 'Cou', 4, '45,000', '58,500');
SELECT insert_article_parent('ARTHUR', 'AR', 'Echarpe', '0720', 'Tissage Plat', 'PL', 'Uni', 'U', 'Frange', 'FR', 1, '6,000', '7,800');
SELECT insert_article_parent('ARTHUR', 'AR', 'Poncho', '1824', 'Tissage Plat', 'PL', 'Uni', 'U', 'Couture', 'Cou', 1, '30,000', '39,000');
SELECT insert_article_parent('ARTHUR', 'AR', 'Housse de Coussin', '0919', 'Tissage Plat', 'PL', 'Uni', 'U', 'Couture', 'Cou', 1, '40,000', '52,000');
SELECT insert_article_parent('ARTHUR', 'AR', 'Sac de Plage', '0507', 'Tissage Plat', 'PL', 'Uni', 'U', 'Couture', 'Cou', 4, '52,000', '67,600');
SELECT insert_article_parent('ARTHUR', 'AR', 'Serviette', '0406', 'Tissage Plat', 'PL', 'Uni', 'U', 'Frange', 'FR', 1, '22,000', '28,600');
SELECT insert_article_parent('ARTHUR', 'AR', 'Tote Bag', '0507', 'Tissage Plat', 'PL', 'Uni', 'U', 'Couture', 'Cou', 4, '5,000', '6,500');

-- Note: Ajouter ici toutes les autres lignes de votre fichier Excel
-- Pour chaque ligne de votre table, utilisez le format suivant:
-- SELECT insert_article_parent('MODÈLE', 'CODE_MOD', 'TYPE', 'CODE_DIM', 'TISSAGE', 'CODE_TISS', 'NB_COULEURS', 'CODE_NB', 'FINITION', 'CODE_FIN', COMPOSITION, 'PRIX_REV', 'PRIX_VENTE');

-- Exemples de variantes pour d'autres modèles (à compléter avec vos données):
-- ARTICLES IBIZA (IB)
-- SELECT insert_article_parent('IBIZA', 'IB', 'Fouta', '1020', 'Tissage Jacquard', 'JA', '3 Couleurs', 'T', 'Frange', 'FR', 1, '8,000', '10,400');
-- SELECT insert_article_parent('IBIZA', 'IB', 'Fouta', '1626', 'Tissage Jacquard', 'JA', '3 Couleurs', 'T', 'Frange', 'FR', 1, '10,500', '13,650');

-- ARTICLES BALI (BAL)
-- SELECT insert_article_parent('BALI', 'BAL', 'Fouta', '1020', 'Tissage Plat', 'PL', 'Uni', 'U', 'Frange', 'FR', 1, '7,000', '9,100');

-- ARTICLES BERBER (BE)
-- SELECT insert_article_parent('BERBER', 'BE', 'Fouta', '1020', 'Tissage Mixte', 'MIX', '2 Couleurs', 'B', 'Frange Croisé', 'Fcroisé', 1, '8,500', '11,050');

-- ARTICLES MARINIERE (MA)
-- SELECT insert_article_parent('MARINIERE', 'MA', 'Fouta', '1020', 'Tissage Plat', 'PL', '4 Couleurs', 'Q', 'Ourlet 4 Face', 'Our4', 1, '9,000', '11,700');

-- ARTICLES NATTE (NAT)
-- SELECT insert_article_parent('NATTE', 'NAT', 'Fouta', '1020', 'Tissage Nid d''Abeille', 'ND', 'Uni', 'U', 'Frange', 'FR', 1, '7,500', '9,750');

-- ARTICLES AZUL (AZU)
-- SELECT insert_article_parent('AZUL', 'AZU', 'Fouta', '1020', 'Tissage Plat', 'PL', 'Uni', 'U', 'Frange', 'FR', 1, '7,000', '9,100');

-- ARTICLES ARTISANAT (ANA)
-- SELECT insert_article_parent('ARTISANAT', 'ANA', 'Fouta', '1020', 'Tissage Jacquard', 'JA', '5 Couleurs', 'C', 'Frange', 'FR', 1, '10,000', '13,000');

-- ARTICLES VIOLET (VIO)
-- SELECT insert_article_parent('VIOLET', 'VIO', 'Fouta', '1020', 'Tissage Plat', 'PL', 'Uni', 'U', 'Frange', 'FR', 1, '7,500', '9,750');

-- Message de confirmation
DO $$
DECLARE
  v_total INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total FROM articles_catalogue WHERE id_modele IS NOT NULL;
  RAISE NOTICE '✅ Insertion des modèles d''articles parents terminée';
  RAISE NOTICE '   - Total d''articles dans la base: %', v_total;
END $$;

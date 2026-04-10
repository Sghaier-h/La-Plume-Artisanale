-- ============================================================================
-- INSERTION DES MODÈLES D'ARTICLES PARENTS
-- ============================================================================
-- Script pour insérer les articles parents avec leurs combinaisons d'attributs
-- Code article généré automatiquement : CODE_MODELE-CODE_DIM-CODE_TISSAGE-CODE_NB_COULEURS-CODE_FINITION
-- ============================================================================

-- D'abord, insérer les modèles manquants dans parametres_modeles
INSERT INTO parametres_modeles (code_modele, libelle, description, actif) VALUES
('AR', 'ARTHUR', 'Modèle Arthur', true),
('ANA', 'ARTISANAT', 'Modèle Artisanat', true),
('AZU', 'AZUL', 'Modèle Azul', true),
('BAL', 'BALI', 'Modèle Bali', true),
('BE', 'BERBER', 'Modèle Berber', true),
('IB', 'IBIZA', 'Modèle Ibiza', true),
('MA', 'MARINIERE', 'Modèle Marinière', true),
('NAT', 'NATTE', 'Modèle Natte', true),
('VIO', 'VIOLET', 'Modèle Violet', true)
ON CONFLICT (code_modele) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  description = EXCLUDED.description,
  actif = EXCLUDED.actif;

-- Fonction pour convertir prix avec virgule (format français)
CREATE OR REPLACE FUNCTION parse_prix(prix_text TEXT) RETURNS DECIMAL(10,2) AS $$
BEGIN
  IF prix_text IS NULL OR prix_text = '' THEN
    RETURN NULL;
  END IF;
  -- Remplacer virgule par point et supprimer espaces
  RETURN CAST(REPLACE(REPLACE(prix_text, ',', ''), ' ', '') AS DECIMAL(10,2));
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer un code article
CREATE OR REPLACE FUNCTION generer_code_article(
  code_modele TEXT,
  code_dim TEXT,
  code_tissage TEXT,
  code_nb_couleurs TEXT,
  code_finition TEXT
) RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(COALESCE(code_modele, '') || '-' || 
               COALESCE(code_dim, '') || '-' || 
               COALESCE(code_tissage, '') || '-' || 
               COALESCE(code_nb_couleurs, '') || '-' || 
               COALESCE(code_finition, ''));
END;
$$ LANGUAGE plpgsql;

-- Fonction pour insérer ou mettre à jour un article parent
CREATE OR REPLACE FUNCTION insert_article_parent(
  p_modele TEXT,
  p_code_modele TEXT,
  p_type_produit TEXT,
  p_code_dim TEXT,
  p_tissage TEXT,
  p_code_tissage TEXT,
  p_nb_couleurs TEXT,
  p_code_nb_couleurs TEXT,
  p_finition TEXT,
  p_code_finition TEXT,
  p_composition INTEGER,
  p_prix_revient TEXT,
  p_prix_vente TEXT
) RETURNS INTEGER AS $$
DECLARE
  v_id_modele INTEGER;
  v_id_type_produit INTEGER;
  v_id_dimension INTEGER;
  v_id_tissage INTEGER;
  v_id_nb_couleurs INTEGER;
  v_id_finition INTEGER;
  v_code_article TEXT;
  v_designation TEXT;
  v_id_article INTEGER;
  v_prix_rev DECIMAL(10,2);
  v_prix_vent DECIMAL(10,2);
BEGIN
  -- Récupérer les IDs des paramètres
  SELECT id INTO v_id_modele FROM parametres_modeles WHERE code_modele = p_code_modele;
  SELECT id INTO v_id_type_produit FROM parametres_types_produits WHERE libelle ILIKE '%' || p_type_produit || '%' LIMIT 1;
  SELECT id INTO v_id_dimension FROM parametres_dimensions WHERE code = p_code_dim;
  SELECT id INTO v_id_tissage FROM parametres_tissages WHERE code = p_code_tissage;
  SELECT id INTO v_id_nb_couleurs FROM parametres_nombre_couleurs WHERE code = p_code_nb_couleurs;
  SELECT id INTO v_id_finition FROM parametres_finitions WHERE code = p_code_finition;
  
  -- Générer le code article
  v_code_article := generer_code_article(p_code_modele, p_code_dim, p_code_tissage, p_code_nb_couleurs, p_code_finition);
  
  -- Générer la désignation
  v_designation := COALESCE(p_modele, '') || ' - ' || 
                   COALESCE(p_type_produit, '') || ' - ' ||
                   COALESCE(p_tissage, '') || ' - ' ||
                   COALESCE(p_nb_couleurs, '');
  
  -- Convertir les prix
  v_prix_rev := parse_prix(p_prix_revient);
  v_prix_vent := parse_prix(p_prix_vente);
  
  -- Vérifier si l'article existe déjà
  SELECT id_article INTO v_id_article 
  FROM articles_catalogue 
  WHERE code_article = v_code_article;
  
  IF v_id_article IS NOT NULL THEN
    -- Mise à jour
    UPDATE articles_catalogue SET
      designation = v_designation,
      id_modele = v_id_modele,
      id_type_produit = v_id_type_produit,
      id_dimension = v_id_dimension,
      id_tissage = v_id_tissage,
      id_nombre_couleurs = v_id_nb_couleurs,
      id_finition = v_id_finition,
      nb_couleurs = (SELECT nombre FROM parametres_nombre_couleurs WHERE id = v_id_nb_couleurs),
      prix_revient = v_prix_rev,
      prix_unitaire_base = v_prix_vent,
      date_modification = NOW()
    WHERE id_article = v_id_article;
    
    RETURN v_id_article;
  ELSE
    -- Insertion
    INSERT INTO articles_catalogue (
      code_article,
      designation,
      id_modele,
      id_type_produit,
      id_dimension,
      id_tissage,
      id_nombre_couleurs,
      id_finition,
      nb_couleurs,
      prix_revient,
      prix_unitaire_base,
      unite_vente,
      actif
    ) VALUES (
      v_code_article,
      v_designation,
      v_id_modele,
      v_id_type_produit,
      v_id_dimension,
      v_id_tissage,
      v_id_nb_couleurs,
      v_id_finition,
      (SELECT nombre FROM parametres_nombre_couleurs WHERE id = v_id_nb_couleurs),
      v_prix_rev,
      v_prix_vent,
      'pièce',
      true
    ) RETURNING id_article INTO v_id_article;
    
    RETURN v_id_article;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de l''insertion: %, Code: %', SQLERRM, v_code_article;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INSERTION DES ARTICLES PARENTS
-- ============================================================================
-- Exemple de données - À compléter avec toutes les lignes de votre Excel
-- Format: insert_article_parent(modele, code_modele, type_produit, code_dim, tissage, code_tissage, nb_couleurs, code_nb_couleurs, finition, code_finition, composition, prix_revient, prix_vente)

-- Exemple pour le premier article de l'image
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

-- Ajouter ici toutes les autres lignes de votre Excel suivant le même format
-- ...

-- Nettoyer les fonctions temporaires si nécessaire (optionnel)
-- DROP FUNCTION IF EXISTS parse_prix(TEXT);
-- DROP FUNCTION IF EXISTS generer_code_article(TEXT, TEXT, TEXT, TEXT, TEXT);
-- DROP FUNCTION IF EXISTS insert_article_parent(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, TEXT);

-- Message de confirmation
DO $$
DECLARE
  v_total INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total FROM articles_catalogue WHERE id_modele IS NOT NULL;
  RAISE NOTICE '✅ Insertion des modèles d''articles parents terminée';
  RAISE NOTICE '   - Total d''articles créés/mis à jour: %', v_total;
END $$;

-- ============================================================================
-- Migration : Commande → Stock/OF workflow
-- Ajoute colonnes de suivi stock/fabrication sur articles_commande
-- ============================================================================

ALTER TABLE articles_commande
  ADD COLUMN IF NOT EXISTS quantite_prise_stock NUMERIC(12,3) DEFAULT 0;

ALTER TABLE articles_commande
  ADD COLUMN IF NOT EXISTS quantite_fabriquee NUMERIC(12,3) DEFAULT 0;

ALTER TABLE articles_commande
  ADD COLUMN IF NOT EXISTS statut_ligne VARCHAR(32) DEFAULT 'a_traiter';

-- Index pour requêtes de réservation stock
CREATE INDEX IF NOT EXISTS idx_articles_commande_statut_ligne
  ON articles_commande (statut_ligne);

CREATE INDEX IF NOT EXISTS idx_articles_commande_id_article_qte_stock
  ON articles_commande (id_article)
  WHERE quantite_prise_stock > 0;

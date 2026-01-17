-- ============================================================================
-- Création de la table lignes_bl si elle n'existe pas
-- ============================================================================
-- Cette table est nécessaire pour les lignes des bons de livraison
-- ============================================================================

CREATE TABLE IF NOT EXISTS lignes_bl (
    id_ligne SERIAL PRIMARY KEY,
    id_bl INTEGER NOT NULL REFERENCES bons_livraison(id_bl) ON DELETE CASCADE,
    id_ligne_commande INTEGER REFERENCES articles_commande(id_article_commande),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    designation VARCHAR(200) NOT NULL,
    quantite_livree NUMERIC(10,3) NOT NULL,
    prix_unitaire_ht NUMERIC(10,2) NOT NULL,
    taux_tva NUMERIC(5,2) DEFAULT 20,
    montant_ht NUMERIC(12,2) NOT NULL,
    montant_tva NUMERIC(12,2) NOT NULL,
    montant_ttc NUMERIC(12,2) NOT NULL,
    numero_lot VARCHAR(100),
    date_peremption DATE,
    ordre INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_lignes_bl_bl ON lignes_bl(id_bl);
CREATE INDEX IF NOT EXISTS idx_lignes_bl_article ON lignes_bl(id_article);
CREATE INDEX IF NOT EXISTS idx_lignes_bl_commande ON lignes_bl(id_ligne_commande);

COMMENT ON TABLE lignes_bl IS 'Lignes des bons de livraison';

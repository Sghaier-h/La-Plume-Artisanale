-- ============================================================================
-- TABLE POUR GESTION DES CATÉGORIES DE PRODUITS
-- ============================================================================
-- Structure hiérarchique pour catégories et sous-catégories
-- ============================================================================

-- Table des catégories de produits
CREATE TABLE IF NOT EXISTS product_category (
    id SERIAL PRIMARY KEY,
    
    -- Informations de base
    name VARCHAR(255) NOT NULL,
    complete_name VARCHAR(255), -- Nom complet avec parents (ex: "All / Saleable / Tissu")
    description TEXT,
    
    -- Hiérarchie
    parent_id INTEGER REFERENCES product_category(id) ON DELETE CASCADE,
    child_id INTEGER, -- Pour navigation rapide
    
    -- Configuration
    sequence INTEGER DEFAULT 0, -- Ordre d'affichage
    active BOOLEAN DEFAULT TRUE,
    
    -- Propriétés
    property_account_income_categ_id INTEGER, -- Compte de revenus
    property_account_expense_categ_id INTEGER, -- Compte de dépenses
    property_cost_method VARCHAR(50) DEFAULT 'standard', -- standard, fifo, average
    property_valuation VARCHAR(50) DEFAULT 'manual_periodic', -- manual_periodic, real_time
    property_stock_account_input_categ_id INTEGER,
    property_stock_account_output_categ_id INTEGER,
    property_stock_valuation_account_id INTEGER,
    
    -- Métadonnées
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_uid INTEGER,
    write_uid INTEGER
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_product_category_parent ON product_category(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_category_active ON product_category(active);
CREATE INDEX IF NOT EXISTS idx_product_category_sequence ON product_category(sequence);

-- Fonction pour mettre à jour complete_name automatiquement
CREATE OR REPLACE FUNCTION update_product_category_complete_name()
RETURNS TRIGGER AS $$
DECLARE
    parent_path TEXT;
    current_name TEXT;
BEGIN
    -- Construire le nom complet avec tous les parents
    WITH RECURSIVE category_tree AS (
        -- Catégorie de base
        SELECT id, name, parent_id, name as full_path
        FROM product_category
        WHERE id = NEW.id
        
        UNION ALL
        
        -- Parents récursifs
        SELECT pc.id, pc.name, pc.parent_id, 
               pc.name || ' / ' || ct.full_path
        FROM product_category pc
        INNER JOIN category_tree ct ON pc.id = ct.parent_id
        WHERE ct.parent_id IS NOT NULL
    )
    SELECT full_path INTO parent_path
    FROM category_tree
    WHERE parent_id IS NULL
    LIMIT 1;
    
    -- Si pas de parent, utiliser juste le nom
    IF parent_path IS NULL THEN
        NEW.complete_name := NEW.name;
    ELSE
        NEW.complete_name := parent_path;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour complete_name
CREATE TRIGGER trigger_update_product_category_complete_name
    BEFORE INSERT OR UPDATE ON product_category
    FOR EACH ROW
    EXECUTE FUNCTION update_product_category_complete_name();

-- Fonction pour mettre à jour write_date
CREATE OR REPLACE FUNCTION update_product_category_write_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.write_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_category_write_date
    BEFORE UPDATE ON product_category
    FOR EACH ROW
    EXECUTE FUNCTION update_product_category_write_date();

-- Données initiales - Catégories principales
INSERT INTO product_category (name, parent_id, sequence, active) VALUES
('All', NULL, 1, TRUE),
('Saleable', 1, 2, TRUE),
('Consumable', 1, 3, TRUE),
('Service', 1, 4, TRUE),
('Tissu', 2, 5, TRUE),
('Fouta', 5, 6, TRUE),
('Coussin', 5, 7, TRUE),
('Tapis', 5, 8, TRUE),
('Accessoires', 5, 9, TRUE)
ON CONFLICT DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Table product_category créée avec succès!';
    RAISE NOTICE '✅ Catégories initiales insérées!';
END $$;

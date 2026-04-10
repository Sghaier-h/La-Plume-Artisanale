-- ============================================================================
-- MODULE ENTREPÔT COMPLET - INSPIRÉ D'ODOO
-- ============================================================================
-- Gestion complète des entrepôts, emplacements, mouvements et produits
-- Structure hiérarchique, routes logistiques, règles de réapprovisionnement
-- ============================================================================

-- Table : stock_warehouse (Entrepôts)
CREATE TABLE IF NOT EXISTS stock_warehouse (
    id_warehouse SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    
    -- Emplacements principaux
    view_location_id INTEGER, -- Emplacement racine (sera référencé après création)
    lot_stock_id INTEGER, -- Emplacement stock
    wh_input_stock_loc_id INTEGER, -- Emplacement réception
    wh_output_stock_loc_id INTEGER, -- Emplacement expédition
    wh_qc_stock_loc_id INTEGER, -- Emplacement contrôle qualité
    
    -- Configuration
    active BOOLEAN DEFAULT TRUE,
    company_id INTEGER REFERENCES societes(id_societe),
    
    -- Informations
    address_id INTEGER, -- Adresse
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Métadonnées
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_uid INTEGER,
    write_uid INTEGER
);

-- Table : stock_location (Emplacements hiérarchiques)
CREATE TABLE IF NOT EXISTS stock_location (
    id_location SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    complete_name VARCHAR(500), -- Nom complet avec chemin hiérarchique
    location_id INTEGER REFERENCES stock_location(id_location), -- Parent
    usage VARCHAR(30) NOT NULL DEFAULT 'internal',
    -- Types: supplier, customer, internal, inventory, production, transit, view
    active BOOLEAN DEFAULT TRUE,
    
    -- Configuration
    scrap_location BOOLEAN DEFAULT FALSE, -- Emplacement de rebut
    return_location BOOLEAN DEFAULT FALSE, -- Emplacement de retour
    posx INTEGER, -- Position X (pour organisation visuelle)
    posy INTEGER, -- Position Y
    posz INTEGER, -- Position Z
    
    -- Informations
    barcode VARCHAR(255), -- Code-barres de l'emplacement
    warehouse_id INTEGER REFERENCES stock_warehouse(id_warehouse),
    company_id INTEGER REFERENCES societes(id_societe),
    
    -- Restrictions
    removal_strategy_id INTEGER, -- Stratégie d'enlèvement (FIFO, LIFO, FEFO)
    putaway_strategy_id INTEGER, -- Stratégie de rangement
    
    -- Métadonnées
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_uid INTEGER,
    write_uid INTEGER
);

-- Fonction pour générer complete_name hiérarchique
CREATE OR REPLACE FUNCTION update_location_complete_name()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.location_id IS NULL THEN
        NEW.complete_name := NEW.name;
    ELSE
        SELECT complete_name INTO NEW.complete_name
        FROM stock_location
        WHERE id_location = NEW.location_id;
        NEW.complete_name := NEW.complete_name || ' / ' || NEW.name;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location_complete_name
BEFORE INSERT OR UPDATE ON stock_location
FOR EACH ROW
EXECUTE FUNCTION update_location_complete_name();

-- Table : stock_quant (Quantités par produit/emplacement)
CREATE TABLE IF NOT EXISTS stock_quant (
    id_quant SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES produits(id_produit),
    location_id INTEGER NOT NULL REFERENCES stock_location(id_location),
    lot_id INTEGER, -- Numéro de lot (si traçabilité)
    package_id INTEGER, -- Colis (si utilisé)
    
    -- Quantités
    quantity NUMERIC(15,3) NOT NULL DEFAULT 0, -- Quantité disponible
    reserved_quantity NUMERIC(15,3) DEFAULT 0, -- Quantité réservée
    in_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date d'entrée
    
    -- Company
    company_id INTEGER REFERENCES societes(id_societe),
    
    -- Unicité produit/emplacement/lot
    UNIQUE(product_id, location_id, lot_id, package_id)
);

-- Table : stock_move (Mouvements de stock)
CREATE TABLE IF NOT EXISTS stock_move (
    id_move SERIAL PRIMARY KEY,
    name VARCHAR(255), -- Nom du mouvement
    sequence INTEGER DEFAULT 0,
    
    -- Produit
    product_id INTEGER NOT NULL REFERENCES produits(id_produit),
    product_uom_id INTEGER, -- Unité de mesure
    
    -- Emplacements
    location_id INTEGER NOT NULL REFERENCES stock_location(id_location), -- Source
    location_dest_id INTEGER NOT NULL REFERENCES stock_location(id_location), -- Destination
    
    -- Quantités
    product_uom_qty NUMERIC(15,3) NOT NULL DEFAULT 0, -- Quantité demandée
    quantity_done NUMERIC(15,3) DEFAULT 0, -- Quantité réalisée
    reserved_availability NUMERIC(15,3) DEFAULT 0, -- Quantité réservée
    
    -- État
    state VARCHAR(30) DEFAULT 'draft',
    -- States: draft, waiting, assigned, done, cancel
    
    -- Dates
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date prévue
    date_deadline TIMESTAMP, -- Date limite
    
    -- Origine
    origin VARCHAR(255), -- Référence d'origine (commande, transfert, etc.)
    reference VARCHAR(255), -- Référence
    
    -- Priorité
    priority VARCHAR(10) DEFAULT '1', -- 0=normal, 1=normal, 2=urgent, 3=très urgent
    
    -- Type de mouvement
    picking_id INTEGER, -- Réception/Livraison associée
    procurement_id INTEGER, -- Règle de réapprovisionnement
    rule_id INTEGER, -- Règle de route
    
    -- Lot/Série
    lot_id INTEGER,
    lot_name VARCHAR(255),
    
    -- Company
    company_id INTEGER REFERENCES societes(id_societe),
    
    -- Métadonnées
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_uid INTEGER,
    write_uid INTEGER
);

-- Table : stock_picking (Réceptions/Livraisons)
CREATE TABLE IF NOT EXISTS stock_picking (
    id_picking SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- Nom/Numéro
    
    -- Type
    picking_type_id INTEGER, -- Type d'opération
    move_type VARCHAR(20) DEFAULT 'direct',
    -- Types: direct (1 étape), one (2 étapes), three (3 étapes)
    
    -- État
    state VARCHAR(30) DEFAULT 'draft',
    -- States: draft, waiting, confirmed, assigned, done, cancel
    
    -- Emplacements
    location_id INTEGER REFERENCES stock_location(id_location), -- Source
    location_dest_id INTEGER REFERENCES stock_location(id_location), -- Destination
    
    -- Partenaire
    partner_id INTEGER, -- Client/Fournisseur
    
    -- Dates
    scheduled_date TIMESTAMP,
    date_done TIMESTAMP, -- Date de validation
    
    -- Origine
    origin VARCHAR(255), -- Référence d'origine
    note TEXT, -- Notes
    
    -- Mouvements
    move_ids INTEGER[], -- IDs des mouvements associés
    
    -- Priorité
    priority VARCHAR(10) DEFAULT '1',
    
    -- Company
    company_id INTEGER REFERENCES societes(id_societe),
    
    -- Métadonnées
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_uid INTEGER,
    write_uid INTEGER,
    
    UNIQUE(name)
);

-- Table : stock_picking_type (Types d'opérations)
CREATE TABLE IF NOT EXISTS stock_picking_type (
    id_picking_type SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(30) NOT NULL,
    -- Codes: incoming (Réception), outgoing (Livraison), internal (Transfert interne)
    sequence INTEGER DEFAULT 0,
    
    -- Emplacements par défaut
    default_location_src_id INTEGER REFERENCES stock_location(id_location),
    default_location_dest_id INTEGER REFERENCES stock_location(id_location),
    
    -- Warehouse
    warehouse_id INTEGER REFERENCES stock_warehouse(id_warehouse),
    
    -- Configuration
    show_reserved BOOLEAN DEFAULT TRUE, -- Afficher quantités réservées
    show_operations BOOLEAN DEFAULT TRUE, -- Afficher opérations détaillées
    use_create_lots BOOLEAN DEFAULT FALSE, -- Permettre création de lots
    use_existing_lots BOOLEAN DEFAULT TRUE, -- Permettre lots existants
    show_entire_packs BOOLEAN DEFAULT FALSE, -- Afficher colis entiers
    
    -- Type de mouvement
    move_type VARCHAR(20) DEFAULT 'direct',
    -- direct: 1 étape (Réception -> Stock)
    -- one: 2 étapes (Réception -> Colisage -> Stock)
    -- three: 3 étapes (Prélèvement -> Colisage -> Expédition)
    
    -- Active
    active BOOLEAN DEFAULT TRUE,
    company_id INTEGER REFERENCES societes(id_societe),
    
    -- Métadonnées
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : stock_picking_move_rel (Relation picking/mouvements)
CREATE TABLE IF NOT EXISTS stock_picking_move_rel (
    picking_id INTEGER REFERENCES stock_picking(id_picking) ON DELETE CASCADE,
    move_id INTEGER REFERENCES stock_move(id_move) ON DELETE CASCADE,
    PRIMARY KEY (picking_id, move_id)
);

-- Table : stock_route (Routes logistiques)
CREATE TABLE IF NOT EXISTS stock_route (
    id_route SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sequence INTEGER DEFAULT 0,
    
    -- Type
    product_selectable BOOLEAN DEFAULT TRUE, -- Sélectionnable sur produits
    product_categ_selectable BOOLEAN DEFAULT FALSE, -- Sélectionnable sur catégories
    
    -- Active
    active BOOLEAN DEFAULT TRUE,
    company_id INTEGER REFERENCES societes(id_societe),
    
    -- Métadonnées
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : stock_rule (Règles de réapprovisionnement)
CREATE TABLE IF NOT EXISTS stock_rule (
    id_rule SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    route_id INTEGER REFERENCES stock_route(id_route),
    sequence INTEGER DEFAULT 0,
    
    -- Type d'action
    action VARCHAR(30) NOT NULL,
    -- Actions: pull, push, pull_push, buy, manufacture
    
    -- Emplacements
    location_src_id INTEGER REFERENCES stock_location(id_location),
    location_id INTEGER REFERENCES stock_location(id_location), -- Destination
    
    -- Produits
    product_id INTEGER REFERENCES produits(id_produit),
    product_category_id INTEGER REFERENCES product_category(id),
    
    -- Configuration
    auto BOOLEAN DEFAULT TRUE, -- Automatique
    propagate_warehouse_id INTEGER REFERENCES stock_warehouse(id_warehouse),
    
    -- Seuils
    warehouse_id INTEGER REFERENCES stock_warehouse(id_warehouse),
    
    -- Active
    active BOOLEAN DEFAULT TRUE,
    company_id INTEGER REFERENCES societes(id_societe),
    
    -- Métadonnées
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : stock_removal (Stratégies d'enlèvement)
CREATE TABLE IF NOT EXISTS stock_removal (
    id_removal SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    method VARCHAR(30) NOT NULL,
    -- Methods: fifo (First In First Out), lifo (Last In First Out), 
    -- fefo (First Expired First Out), closest (Le plus proche)
    active BOOLEAN DEFAULT TRUE
);

-- Table : stock_putaway (Stratégies de rangement)
CREATE TABLE IF NOT EXISTS stock_putaway (
    id_putaway SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    method VARCHAR(30) NOT NULL,
    -- Methods: fixed, product (par produit), category (par catégorie)
    active BOOLEAN DEFAULT TRUE
);

-- Extension de la table produits pour routes
ALTER TABLE produits ADD COLUMN IF NOT EXISTS route_ids INTEGER[]; -- Routes logistiques

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_stock_warehouse_code ON stock_warehouse(code);
CREATE INDEX IF NOT EXISTS idx_stock_warehouse_company ON stock_warehouse(company_id);
CREATE INDEX IF NOT EXISTS idx_stock_location_parent ON stock_location(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_location_usage ON stock_location(usage);
CREATE INDEX IF NOT EXISTS idx_stock_location_warehouse ON stock_location(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_quant_product ON stock_quant(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_quant_location ON stock_quant(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_quant_product_location ON stock_quant(product_id, location_id);
CREATE INDEX IF NOT EXISTS idx_stock_move_product ON stock_move(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_move_location ON stock_move(location_id, location_dest_id);
CREATE INDEX IF NOT EXISTS idx_stock_move_state ON stock_move(state);
CREATE INDEX IF NOT EXISTS idx_stock_move_picking ON stock_move(picking_id);
CREATE INDEX IF NOT EXISTS idx_stock_picking_state ON stock_picking(state);
CREATE INDEX IF NOT EXISTS idx_stock_picking_partner ON stock_picking(partner_id);
CREATE INDEX IF NOT EXISTS idx_stock_picking_type_code ON stock_picking_type(code);
CREATE INDEX IF NOT EXISTS idx_stock_rule_route ON stock_rule(route_id);
CREATE INDEX IF NOT EXISTS idx_stock_rule_product ON stock_rule(product_id);

-- Données initiales - Stratégies d'enlèvement
INSERT INTO stock_removal (name, method, active) VALUES
('FIFO - Premier entré, premier sorti', 'fifo', TRUE),
('LIFO - Dernier entré, premier sorti', 'lifo', TRUE),
('FEFO - Première expiration, premier sorti', 'fefo', TRUE),
('Le plus proche', 'closest', TRUE)
ON CONFLICT DO NOTHING;

-- Données initiales - Stratégies de rangement
INSERT INTO stock_putaway (name, method, active) VALUES
('Fixe', 'fixed', TRUE),
('Par produit', 'product', TRUE),
('Par catégorie', 'category', TRUE)
ON CONFLICT DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Module Entrepôt Complet créé avec succès!';
    RAISE NOTICE '✅ Structure hiérarchique des emplacements configurée!';
    RAISE NOTICE '✅ Gestion des mouvements et réceptions/livraisons activée!';
    RAISE NOTICE '✅ Routes logistiques et règles de réapprovisionnement configurées!';
END $$;

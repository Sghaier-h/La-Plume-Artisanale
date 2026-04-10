-- =====================================================
-- SCHÉMA BASE DE DONNÉES - MODULE COMMERCIAL
-- Système Multi-Tarif, Multi-Devise et Gestion Clients
-- =====================================================

-- Table des devises
CREATE TABLE IF NOT EXISTS res_currency (
    id_currency SERIAL PRIMARY KEY,
    name VARCHAR(3) NOT NULL UNIQUE, -- EUR, USD, TND, etc.
    symbol VARCHAR(10) NOT NULL, -- €, $, DT, etc.
    full_name VARCHAR(255), -- Euro, Dollar US, Dinar Tunisien
    position VARCHAR(20) DEFAULT 'after', -- 'before' ou 'after'
    active BOOLEAN DEFAULT TRUE,
    decimal_places INTEGER DEFAULT 2,
    create_uid INTEGER,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_uid INTEGER,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des taux de change
CREATE TABLE IF NOT EXISTS res_currency_rate (
    id_rate SERIAL PRIMARY KEY,
    currency_id INTEGER NOT NULL REFERENCES res_currency(id_currency) ON DELETE CASCADE,
    name DATE NOT NULL, -- Date du taux
    rate DECIMAL(18, 6) NOT NULL DEFAULT 1.0, -- Taux par rapport à la devise de base
    company_id INTEGER REFERENCES societes(id_societe) ON DELETE SET NULL,
    active BOOLEAN DEFAULT TRUE,
    create_uid INTEGER,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_uid INTEGER,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(currency_id, name, company_id)
);

-- Table des tarifs (price lists)
CREATE TABLE IF NOT EXISTS product_pricelist (
    id_pricelist SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    active BOOLEAN DEFAULT TRUE,
    currency_id INTEGER NOT NULL REFERENCES res_currency(id_currency),
    company_id INTEGER REFERENCES societes(id_societe) ON DELETE SET NULL,
    type VARCHAR(20) DEFAULT 'sale', -- 'sale' ou 'purchase'
    is_default BOOLEAN DEFAULT FALSE,
    valid_from DATE,
    valid_to DATE,
    sequence INTEGER DEFAULT 0,
    create_uid INTEGER,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_uid INTEGER,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des règles de tarifs (pricelist items)
CREATE TABLE IF NOT EXISTS product_pricelist_item (
    id_item SERIAL PRIMARY KEY,
    pricelist_id INTEGER NOT NULL REFERENCES product_pricelist(id_pricelist) ON DELETE CASCADE,
    product_id INTEGER, -- Référence vers produit/article
    product_tmpl_id INTEGER, -- Référence vers template produit
    categ_id INTEGER, -- Catégorie de produit
    min_quantity DECIMAL(18, 2) DEFAULT 0, -- Quantité minimum
    fixed_price DECIMAL(18, 2), -- Prix fixe
    percent_price DECIMAL(5, 2), -- Pourcentage de réduction
    base VARCHAR(20) DEFAULT 'list_price', -- 'list_price', 'standard_price', 'pricelist'
    date_start DATE,
    date_end DATE,
    compute_price VARCHAR(20) DEFAULT 'fixed', -- 'fixed', 'percentage', 'formula'
    sequence INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    create_uid INTEGER,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_uid INTEGER,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des partenaires (clients/fournisseurs) - Extension
CREATE TABLE IF NOT EXISTS res_partner (
    id_partner SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ref VARCHAR(50) UNIQUE, -- Référence client
    is_company BOOLEAN DEFAULT FALSE,
    parent_id INTEGER REFERENCES res_partner(id_partner) ON DELETE SET NULL,
    company_id INTEGER REFERENCES societes(id_societe) ON DELETE SET NULL,
    -- Informations commerciales
    customer_rank INTEGER DEFAULT 0, -- Classement client (0 = non client)
    supplier_rank INTEGER DEFAULT 0, -- Classement fournisseur
    pricelist_id INTEGER REFERENCES product_pricelist(id_pricelist), -- Tarif par défaut
    property_payment_term_id INTEGER, -- Terme de paiement
    -- Informations financières
    credit_limit DECIMAL(18, 2) DEFAULT 0,
    currency_id INTEGER REFERENCES res_currency(id_currency),
    -- Informations de contact
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    street VARCHAR(255),
    street2 VARCHAR(255),
    city VARCHAR(100),
    state_id INTEGER,
    zip VARCHAR(20),
    country_id INTEGER,
    website VARCHAR(255),
    -- Statut
    active BOOLEAN DEFAULT TRUE,
    customer BOOLEAN DEFAULT FALSE,
    supplier BOOLEAN DEFAULT FALSE,
    create_uid INTEGER,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_uid INTEGER,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des comptes clients (account receivable)
CREATE TABLE IF NOT EXISTS account_move_line (
    id_move_line SERIAL PRIMARY KEY,
    move_id INTEGER NOT NULL, -- Référence vers account_move
    name VARCHAR(255), -- Libellé
    partner_id INTEGER REFERENCES res_partner(id_partner) ON DELETE SET NULL,
    account_id INTEGER NOT NULL, -- Compte comptable
    debit DECIMAL(18, 2) DEFAULT 0,
    credit DECIMAL(18, 2) DEFAULT 0,
    balance DECIMAL(18, 2) DEFAULT 0,
    currency_id INTEGER REFERENCES res_currency(id_currency),
    amount_currency DECIMAL(18, 2) DEFAULT 0, -- Montant en devise étrangère
    date DATE NOT NULL,
    date_maturity DATE, -- Date d'échéance
    reconciled BOOLEAN DEFAULT FALSE,
    full_reconcile_id INTEGER,
    create_uid INTEGER,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_uid INTEGER,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour suivre le chiffre d'affaires par client
CREATE TABLE IF NOT EXISTS sale_report (
    id_report SERIAL PRIMARY KEY,
    partner_id INTEGER REFERENCES res_partner(id_partner) ON DELETE CASCADE,
    company_id INTEGER REFERENCES societes(id_societe) ON DELETE SET NULL,
    product_id INTEGER, -- Produit vendu
    date DATE NOT NULL,
    -- Montants
    price_subtotal DECIMAL(18, 2) DEFAULT 0, -- HT
    price_total DECIMAL(18, 2) DEFAULT 0, -- TTC
    currency_id INTEGER REFERENCES res_currency(id_currency),
    -- Informations
    quantity DECIMAL(18, 2) DEFAULT 0,
    product_uom VARCHAR(50), -- Unité de mesure
    state VARCHAR(50), -- 'draft', 'sent', 'sale', 'done', 'cancel'
    invoice_status VARCHAR(50), -- 'upselling', 'invoiced', 'to invoice', 'no'
    -- Relations
    order_id INTEGER, -- Référence commande
    invoice_id INTEGER, -- Référence facture
    pricelist_id INTEGER REFERENCES product_pricelist(id_pricelist),
    create_uid INTEGER,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_uid INTEGER,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_currency_rate_date ON res_currency_rate(currency_id, name DESC);
CREATE INDEX IF NOT EXISTS idx_pricelist_item_product ON product_pricelist_item(product_id, pricelist_id);
CREATE INDEX IF NOT EXISTS idx_partner_customer ON res_partner(customer, customer_rank DESC);
CREATE INDEX IF NOT EXISTS idx_move_line_partner ON account_move_line(partner_id, date);
CREATE INDEX IF NOT EXISTS idx_move_line_account ON account_move_line(account_id, date);
CREATE INDEX IF NOT EXISTS idx_sale_report_partner ON sale_report(partner_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sale_report_date ON sale_report(date DESC, company_id);

-- Données initiales - Devises principales
INSERT INTO res_currency (name, symbol, full_name, position, active, decimal_places) VALUES
    ('TND', 'DT', 'Dinar Tunisien', 'after', TRUE, 3),
    ('EUR', '€', 'Euro', 'after', TRUE, 2),
    ('USD', '$', 'Dollar US', 'before', TRUE, 2),
    ('GBP', '£', 'Livre Sterling', 'before', TRUE, 2),
    ('CNY', '¥', 'Yuan Chinois', 'before', TRUE, 2)
ON CONFLICT (name) DO NOTHING;

-- Données initiales - Taux de change (exemple pour TND = devise de base)
INSERT INTO res_currency_rate (currency_id, name, rate) 
SELECT id_currency, CURRENT_DATE, 
    CASE 
        WHEN name = 'TND' THEN 1.0
        WHEN name = 'EUR' THEN 0.30
        WHEN name = 'USD' THEN 0.32
        WHEN name = 'GBP' THEN 0.26
        WHEN name = 'CNY' THEN 2.30
        ELSE 1.0
    END
FROM res_currency
WHERE active = TRUE
ON CONFLICT (currency_id, name) DO UPDATE SET rate = EXCLUDED.rate;

-- Données initiales - Tarif par défaut
INSERT INTO product_pricelist (name, code, currency_id, is_default, type, active) 
SELECT 'Tarif Public', 'PUBLIC', id_currency, TRUE, 'sale', TRUE
FROM res_currency WHERE name = 'TND'
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE res_currency IS 'Devises supportées';
COMMENT ON TABLE res_currency_rate IS 'Historique des taux de change';
COMMENT ON TABLE product_pricelist IS 'Listes de tarifs (pricelists)';
COMMENT ON TABLE product_pricelist_item IS 'Règles de tarification';
COMMENT ON TABLE res_partner IS 'Partenaire (clients et fournisseurs)';
COMMENT ON TABLE account_move_line IS 'Lignes comptables (écritures)';
COMMENT ON TABLE sale_report IS 'Rapport de ventes pour analyse CA';

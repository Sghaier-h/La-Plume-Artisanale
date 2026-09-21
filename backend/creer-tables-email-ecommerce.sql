-- Script SQL pour créer les tables nécessaires pour le module Email et E-commerce améliorés

-- Table pour les logs d'emails
CREATE TABLE IF NOT EXISTS mail_log (
    id SERIAL PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'sent',
    error TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mail_log_recipient ON mail_log(recipient);
CREATE INDEX IF NOT EXISTS idx_mail_log_status ON mail_log(status);
CREATE INDEX IF NOT EXISTS idx_mail_log_created_at ON mail_log(created_at);

-- Table pour les paramètres de configuration
CREATE TABLE IF NOT EXISTS ir_config_parameter (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    create_date TIMESTAMP DEFAULT NOW(),
    write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ir_config_parameter_key ON ir_config_parameter(key);

-- Table pour les sites web (website)
CREATE TABLE IF NOT EXISTS website (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    company_id INTEGER,
    default_lang_id INTEGER,
    active BOOLEAN DEFAULT TRUE,
    create_date TIMESTAMP DEFAULT NOW(),
    write_date TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_company_id ON website(company_id);
CREATE INDEX IF NOT EXISTS idx_website_active ON website(active);

-- Table pour les sociétés (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS res_company (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    street VARCHAR(255),
    street2 VARCHAR(255),
    zip VARCHAR(20),
    city VARCHAR(255),
    country_id INTEGER,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    vat VARCHAR(50),
    company_registry VARCHAR(50),
    logo BYTEA,
    create_date TIMESTAMP DEFAULT NOW(),
    write_date TIMESTAMP DEFAULT NOW()
);

-- Table pour les catégories de produits (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS product_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER,
    create_date TIMESTAMP DEFAULT NOW(),
    write_date TIMESTAMP DEFAULT NOW()
);

-- Ajouter les colonnes pour l'e-commerce dans product_template si elles n'existent pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'product_template' AND column_name = 'website_published') THEN
        ALTER TABLE product_template ADD COLUMN website_published BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'product_template' AND column_name = 'website_sequence') THEN
        ALTER TABLE product_template ADD COLUMN website_sequence INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'product_template' AND column_name = 'description_sale') THEN
        ALTER TABLE product_template ADD COLUMN description_sale TEXT;
    END IF;
END $$;

-- Ajouter la colonne website_id dans sale_order si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sale_order' AND column_name = 'website_id') THEN
        ALTER TABLE sale_order ADD COLUMN website_id INTEGER;
    END IF;
END $$;

-- Insérer quelques paramètres par défaut
INSERT INTO ir_config_parameter (key, value, create_date, write_date)
VALUES 
    ('email.email_from', 'noreply@laplumeartisanale.com', NOW(), NOW()),
    ('email.smtp_host', 'smtp.gmail.com', NOW(), NOW()),
    ('email.smtp_port', '587', NOW(), NOW()),
    ('email.smtp_ssl', 'false', NOW(), NOW()),
    ('whatsapp.whatsapp_enabled', 'false', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Tables créées avec succès pour le module Email et E-commerce';
END $$;

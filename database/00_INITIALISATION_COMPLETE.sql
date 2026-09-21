-- ============================================================
-- SCRIPT D'INITIALISATION COMPLÈTE DU SYSTÈME ERP LA PLUME
-- ============================================================
-- Ce script crée toutes les tables nécessaires pour le système
-- À exécuter en premier avant tous les autres scripts
-- ============================================================

-- Table des paramètres système (CRITIQUE - doit exister en premier)
CREATE TABLE IF NOT EXISTS parametres_systeme (
    id SERIAL PRIMARY KEY,
    cle VARCHAR(255) UNIQUE NOT NULL,
    valeur TEXT,
    description TEXT,
    type_donnee VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_uid INTEGER,
    write_uid INTEGER
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_parametres_cle ON parametres_systeme(cle);
CREATE INDEX IF NOT EXISTS idx_parametres_type ON parametres_systeme(type_donnee);

-- Insérer quelques paramètres système de base
INSERT INTO parametres_systeme (cle, valeur, type_donnee, description) VALUES
    ('system_name', 'ERP La Plume Artisanale', 'string', 'Nom du système'),
    ('language', 'fr', 'string', 'Langue par défaut'),
    ('timezone', 'Africa/Tunis', 'string', 'Fuseau horaire'),
    ('date_format', 'DD/MM/YYYY', 'string', 'Format de date'),
    ('time_format', '24h', 'string', 'Format d''heure'),
    ('cache_enabled', 'true', 'boolean', 'Activer le cache'),
    ('cache_ttl', '60', 'number', 'Durée de vie du cache en minutes'),
    ('max_upload_size', '10', 'number', 'Taille max d''upload en MB'),
    ('password_min_length', '8', 'number', 'Longueur minimale du mot de passe'),
    ('session_timeout', '60', 'number', 'Timeout de session en minutes'),
    ('api_rate_limit', '100', 'number', 'Limite de requêtes API par minute')
ON CONFLICT (cle) DO NOTHING;

-- Table des utilisateurs (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS res_users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) DEFAULT 'USER',
    active BOOLEAN DEFAULT TRUE,
    dashboards_attribues TEXT[], -- Tableau de IDs de dashboards
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_uid INTEGER,
    write_uid INTEGER
);

-- Table des sociétés (multi-société)
CREATE TABLE IF NOT EXISTS societes (
    id_societe SERIAL PRIMARY KEY,
    code_societe VARCHAR(50) UNIQUE NOT NULL,
    raison_sociale VARCHAR(255) NOT NULL,
    nom_commercial VARCHAR(255),
    forme_juridique VARCHAR(50),
    siret VARCHAR(50),
    tva_intracom VARCHAR(50),
    rcs VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    website VARCHAR(255),
    street TEXT,
    street2 TEXT,
    zip VARCHAR(20),
    city VARCHAR(100),
    country VARCHAR(2) DEFAULT 'TN',
    logo_url TEXT,
    photo_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_uid INTEGER,
    write_uid INTEGER
);

-- Table des établissements
CREATE TABLE IF NOT EXISTS etablissements (
    id_etablissement SERIAL PRIMARY KEY,
    id_societe INTEGER REFERENCES societes(id_societe) ON DELETE CASCADE,
    code_etablissement VARCHAR(50) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(20),
    telephone VARCHAR(50),
    email VARCHAR(255),
    responsable VARCHAR(255),
    type_etablissement VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    write_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_societe, code_etablissement)
);

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Tables de base initialisées avec succès!';
    RAISE NOTICE '✅ Paramètres système de base insérés!';
    RAISE NOTICE '⚠️  Continuez avec les autres scripts SQL dans l''ordre:';
    RAISE NOTICE '   1. 01_base_et_securite.sql';
    RAISE NOTICE '   2. 02_production_et_qualite.sql';
    RAISE NOTICE '   3. ... (autres scripts selon vos besoins)';
END $$;

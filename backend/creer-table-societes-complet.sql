-- Script SQL pour créer la table sociétés avec tous les détails
-- Logo, photo, contact comptable, informations fiscales, etc.

CREATE TABLE IF NOT EXISTS societes (
    id_societe SERIAL PRIMARY KEY,
    code_societe VARCHAR(20) UNIQUE NOT NULL,
    raison_sociale VARCHAR(255) NOT NULL,
    nom_commercial VARCHAR(255),
    forme_juridique VARCHAR(50),
    siret VARCHAR(20),
    siren VARCHAR(20),
    rcs VARCHAR(50),
    rcs_ville VARCHAR(100),
    tva_intracommunautaire VARCHAR(50),
    
    -- Logo et photo
    logo_path VARCHAR(500),
    photo_path VARCHAR(500),
    
    -- Adresse siège social
    adresse_siege TEXT,
    code_postal_siege VARCHAR(10),
    ville_siege VARCHAR(100),
    pays_siege VARCHAR(100) DEFAULT 'France',
    telephone_siege VARCHAR(20),
    fax_siege VARCHAR(20),
    email_siege VARCHAR(255),
    site_web VARCHAR(255),
    
    -- Contact comptable
    comptable_nom VARCHAR(255),
    comptable_prenom VARCHAR(255),
    comptable_societe VARCHAR(255),
    comptable_email VARCHAR(255),
    comptable_telephone VARCHAR(20),
    comptable_adresse TEXT,
    comptable_code_postal VARCHAR(10),
    comptable_ville VARCHAR(100),
    
    -- Informations bancaires
    banque_nom VARCHAR(255),
    banque_code_guichet VARCHAR(10),
    banque_numero_compte VARCHAR(50),
    banque_cle_rib VARCHAR(5),
    banque_iban VARCHAR(50),
    banque_bic VARCHAR(20),
    
    -- Informations fiscales
    regime_fiscal VARCHAR(100),
    periode_fiscale VARCHAR(50),
    date_creation_societe DATE,
    date_debut_exercice DATE,
    date_fin_exercice DATE,
    capital_social DECIMAL(15, 2),
    devise_capital VARCHAR(10) DEFAULT 'EUR',
    
    -- Statut et activité
    activite_principale VARCHAR(255),
    activite_secondaire TEXT,
    secteur_activite VARCHAR(100),
    nombre_salaries INTEGER,
    
    -- Multi-société
    societe_mere_id INTEGER REFERENCES societes(id_societe),
    est_societe_mere BOOLEAN DEFAULT FALSE,
    
    -- Paramètres système
    devise_principale VARCHAR(10) DEFAULT 'EUR',
    langue_principale VARCHAR(10) DEFAULT 'fr_FR',
    fuseau_horaire VARCHAR(50) DEFAULT 'Europe/Paris',
    
    -- Actif/inactif
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cree_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    modifie_par INTEGER REFERENCES utilisateurs(id_utilisateur)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_societes_code ON societes(code_societe);
CREATE INDEX IF NOT EXISTS idx_societes_siret ON societes(siret);
CREATE INDEX IF NOT EXISTS idx_societes_actif ON societes(actif);
CREATE INDEX IF NOT EXISTS idx_societes_mere ON societes(societe_mere_id);

-- Trigger pour mettre à jour date_modification
CREATE OR REPLACE FUNCTION update_societes_modified_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_societes_modified_date
    BEFORE UPDATE ON societes
    FOR EACH ROW
    EXECUTE FUNCTION update_societes_modified_date();

-- Table pour les établissements (si multi-établissement)
CREATE TABLE IF NOT EXISTS etablissements (
    id_etablissement SERIAL PRIMARY KEY,
    code_etablissement VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(255) NOT NULL,
    id_societe INTEGER NOT NULL REFERENCES societes(id_societe) ON DELETE CASCADE,
    type_etablissement VARCHAR(50), -- 'siège', 'succursale', 'usine', 'entrepot', etc.
    
    -- Adresse
    adresse TEXT,
    code_postal VARCHAR(10),
    ville VARCHAR(100),
    pays VARCHAR(100) DEFAULT 'France',
    telephone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(255),
    
    -- Responsable
    responsable_nom VARCHAR(255),
    responsable_prenom VARCHAR(255),
    responsable_email VARCHAR(255),
    responsable_telephone VARCHAR(20),
    
    -- Paramètres
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_etablissements_societe ON etablissements(id_societe);
CREATE INDEX IF NOT EXISTS idx_etablissements_code ON etablissements(code_etablissement);

COMMENT ON TABLE societes IS 'Table des sociétés avec tous les détails (logo, contact comptable, informations fiscales, etc.)';
COMMENT ON TABLE etablissements IS 'Table des établissements pour multi-établissement';

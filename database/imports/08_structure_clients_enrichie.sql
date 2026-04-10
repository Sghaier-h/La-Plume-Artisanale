-- ============================================================================
-- STRUCTURE ENRICHIE POUR LES CLIENTS
-- ============================================================================
-- Ajout des tables et colonnes pour gérer :
-- - Client/Prospect
-- - Adresses multiples (facturation, livraison)
-- - Contacts multiples
-- - Catégories (Professionnel/Particulier, Local/Export)
-- - Attribution commercial
-- - Devise selon pays
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. TABLE DES CATÉGORIES DE CLIENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories_clients (
    id_categorie SERIAL PRIMARY KEY,
    code_categorie VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer les catégories de base
INSERT INTO categories_clients (code_categorie, libelle, description) VALUES
('PROF_LOCAL', 'Professionnel Local', 'Client professionnel en Tunisie'),
('PROF_EXPORT', 'Professionnel Export', 'Client professionnel à l''étranger'),
('PART_LOCAL', 'Particulier Local', 'Client particulier en Tunisie'),
('PART_EXPORT', 'Particulier Export', 'Client particulier à l''étranger')
ON CONFLICT (code_categorie) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  description = EXCLUDED.description;

-- ============================================================================
-- 2. TABLE DES TYPES DE COMMERCIAUX
-- ============================================================================

CREATE TABLE IF NOT EXISTS types_commerciaux (
    id_type_commercial SERIAL PRIMARY KEY,
    code_type VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer les types de commerciaux
INSERT INTO types_commerciaux (code_type, libelle, description) VALUES
('COMMERCIAL', 'Commercial', 'Client géré par un commercial'),
('ECOMMERCE', 'E-commerce', 'Client provenant de l''e-commerce'),
('PARTENAIRE', 'Partenaire', 'Client partenaire'),
('AUTRE', 'Autre', 'Autre source')
ON CONFLICT (code_type) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  description = EXCLUDED.description;

-- ============================================================================
-- 3. MODIFIER LA TABLE CLIENTS
-- ============================================================================

-- Ajouter les nouvelles colonnes à la table clients
DO $$
BEGIN
    -- Type client (Client/Prospect)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'type_client') THEN
        ALTER TABLE clients ADD COLUMN type_client VARCHAR(20) DEFAULT 'PROSPECT';
        RAISE NOTICE 'Colonne type_client ajoutée';
    END IF;

    -- Catégorie client
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'id_categorie') THEN
        ALTER TABLE clients ADD COLUMN id_categorie INTEGER REFERENCES categories_clients(id_categorie);
        RAISE NOTICE 'Colonne id_categorie ajoutée';
    END IF;

    -- Commercial
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'id_commercial') THEN
        ALTER TABLE clients ADD COLUMN id_commercial INTEGER REFERENCES utilisateurs(id_utilisateur);
        RAISE NOTICE 'Colonne id_commercial ajoutée';
    END IF;

    -- Type commercial
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'id_type_commercial') THEN
        ALTER TABLE clients ADD COLUMN id_type_commercial INTEGER REFERENCES types_commerciaux(id_type_commercial);
        RAISE NOTICE 'Colonne id_type_commercial ajoutée';
    END IF;

    -- Civilité (pour particuliers)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'civilite') THEN
        ALTER TABLE clients ADD COLUMN civilite VARCHAR(20);
        RAISE NOTICE 'Colonne civilite ajoutée';
    END IF;

    -- SIREN/SIRET (pour professionnels)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'siren_siret') THEN
        ALTER TABLE clients ADD COLUMN siren_siret VARCHAR(50);
        RAISE NOTICE 'Colonne siren_siret ajoutée';
    END IF;

    -- N° TVA intracommunautaire
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'numero_tva') THEN
        ALTER TABLE clients ADD COLUMN numero_tva VARCHAR(50);
        RAISE NOTICE 'Colonne numero_tva ajoutée';
    END IF;

    -- Site web
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'site_web') THEN
        ALTER TABLE clients ADD COLUMN site_web VARCHAR(255);
        RAISE NOTICE 'Colonne site_web ajoutée';
    END IF;

    -- Raison de désactivation
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'raison_desactivation') THEN
        ALTER TABLE clients ADD COLUMN raison_desactivation TEXT;
        RAISE NOTICE 'Colonne raison_desactivation ajoutée';
    END IF;

    -- Date de désactivation
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'date_desactivation') THEN
        ALTER TABLE clients ADD COLUMN date_desactivation TIMESTAMP;
        RAISE NOTICE 'Colonne date_desactivation ajoutée';
    END IF;

    -- Supprimer les anciennes colonnes qui seront remplacées par les tables adresses et contacts
    -- On garde adresse, code_postal, ville, pays pour compatibilité mais elles seront remplacées par adresses_client
    -- On garde telephone, email, contact_principal pour compatibilité mais elles seront remplacées par contacts_client
END $$;

-- ============================================================================
-- 4. TABLE DES ADRESSES CLIENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS adresses_client (
    id_adresse SERIAL PRIMARY KEY,
    id_client INTEGER NOT NULL REFERENCES clients(id_client) ON DELETE CASCADE,
    type_adresse VARCHAR(20) NOT NULL CHECK (type_adresse IN ('FACTURATION', 'LIVRAISON', 'AUTRE')),
    civilite VARCHAR(20),
    nom_adresse VARCHAR(200), -- Nom pour cette adresse (ex: "Intérieur et Objet")
    adresse_ligne1 VARCHAR(255),
    adresse_ligne2 VARCHAR(255),
    adresse_ligne3 VARCHAR(255),
    adresse_ligne4 VARCHAR(255),
    code_postal VARCHAR(20),
    ville VARCHAR(100),
    departement VARCHAR(100),
    pays VARCHAR(100) NOT NULL DEFAULT 'Tunisie',
    site_web VARCHAR(255),
    principale BOOLEAN DEFAULT false, -- Adresse principale de ce type
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_adresses_client_id_client ON adresses_client(id_client);
CREATE INDEX IF NOT EXISTS idx_adresses_client_type ON adresses_client(type_adresse);
CREATE INDEX IF NOT EXISTS idx_adresses_client_principale ON adresses_client(id_client, type_adresse, principale) WHERE principale = true;

-- ============================================================================
-- 5. TABLE DES CONTACTS CLIENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS contacts_client (
    id_contact SERIAL PRIMARY KEY,
    id_client INTEGER NOT NULL REFERENCES clients(id_client) ON DELETE CASCADE,
    id_adresse INTEGER REFERENCES adresses_client(id_adresse), -- Adresse associée au contact
    civilite VARCHAR(20),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    fonction VARCHAR(100),
    service_bureau VARCHAR(100),
    email VARCHAR(150),
    telephone_fixe VARCHAR(20),
    telephone_portable VARCHAR(20),
    fax VARCHAR(20),
    contact_principal BOOLEAN DEFAULT false,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_contacts_client_id_client ON contacts_client(id_client);
CREATE INDEX IF NOT EXISTS idx_contacts_client_principal ON contacts_client(id_client, contact_principal) WHERE contact_principal = true;

-- ============================================================================
-- 6. FONCTION POUR DÉTERMINER AUTOMATIQUEMENT LE TYPE CLIENT (CLIENT/PROSPECT)
-- ============================================================================

CREATE OR REPLACE FUNCTION mettre_a_jour_type_client()
RETURNS TRIGGER AS $$
BEGIN
    -- Si le client a au moins une commande, c'est un CLIENT, sinon PROSPECT
    IF EXISTS (
        SELECT 1 FROM commandes 
        WHERE id_client = NEW.id_client 
        AND statut != 'annulee'
    ) THEN
        UPDATE clients 
        SET type_client = 'CLIENT' 
        WHERE id_client = NEW.id_client;
    ELSE
        UPDATE clients 
        SET type_client = 'PROSPECT' 
        WHERE id_client = NEW.id_client;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le type client lors de la création/modification d'une commande
DROP TRIGGER IF EXISTS trigger_mettre_a_jour_type_client ON commandes;
CREATE TRIGGER trigger_mettre_a_jour_type_client
    AFTER INSERT OR UPDATE OR DELETE ON commandes
    FOR EACH ROW
    EXECUTE FUNCTION mettre_a_jour_type_client();

-- ============================================================================
-- 7. FONCTION POUR DÉTERMINER LA DEVISE SELON LE PAYS
-- ============================================================================

CREATE OR REPLACE FUNCTION determiner_devise_par_pays(p_pays VARCHAR(100))
RETURNS VARCHAR(10) AS $$
BEGIN
    -- Tunisie → TND
    IF p_pays ILIKE '%Tunisie%' OR p_pays ILIKE '%Tunisia%' THEN
        RETURN 'TND';
    -- Europe → EUR
    ELSIF p_pays IN (
        'France', 'Allemagne', 'Italie', 'Espagne', 'Belgique', 'Pays-Bas', 
        'Luxembourg', 'Autriche', 'Portugal', 'Grèce', 'Finlande', 'Irlande',
        'Danemark', 'Suède', 'Pologne', 'République tchèque', 'Roumanie',
        'Hongrie', 'Bulgarie', 'Croatie', 'Slovaquie', 'Slovénie', 'Estonie',
        'Lettonie', 'Lituanie', 'Malte', 'Chypre'
    ) OR p_pays ILIKE '%Europe%' THEN
        RETURN 'EUR';
    -- Reste du monde → USD
    ELSE
        RETURN 'USD';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. MIGRATION DES DONNÉES EXISTANTES
-- ============================================================================

-- Créer une adresse de facturation pour chaque client existant
INSERT INTO adresses_client (
    id_client, type_adresse, nom_adresse, adresse_ligne1, 
    code_postal, ville, pays, principale
)
SELECT 
    id_client,
    'FACTURATION',
    raison_sociale,
    adresse,
    code_postal,
    ville,
    COALESCE(pays, 'Tunisie'),
    true
FROM clients
WHERE NOT EXISTS (
    SELECT 1 FROM adresses_client 
    WHERE adresses_client.id_client = clients.id_client 
    AND type_adresse = 'FACTURATION'
);

-- Créer un contact principal pour chaque client existant (si email ou telephone existe)
INSERT INTO contacts_client (
    id_client, nom, prenom, email, telephone_fixe, contact_principal
)
SELECT 
    id_client,
    COALESCE(contact_principal, raison_sociale),
    NULL,
    email,
    telephone,
    true
FROM clients
WHERE (email IS NOT NULL OR telephone IS NOT NULL)
AND NOT EXISTS (
    SELECT 1 FROM contacts_client 
    WHERE contacts_client.id_client = clients.id_client 
    AND contact_principal = true
);

-- Mettre à jour le type_client pour les clients existants
UPDATE clients 
SET type_client = CASE 
    WHEN EXISTS (
        SELECT 1 FROM commandes 
        WHERE commandes.id_client = clients.id_client 
        AND statut != 'annulee'
    ) THEN 'CLIENT'
    ELSE 'PROSPECT'
END
WHERE type_client IS NULL;

-- Mettre à jour la devise selon le pays
UPDATE clients c
SET devise = determiner_devise_par_pays(
    COALESCE(
        (SELECT pays FROM adresses_client 
         WHERE id_client = c.id_client 
         AND type_adresse = 'FACTURATION' 
         AND principale = true 
         LIMIT 1),
        c.pays,
        'Tunisie'
    )
)
WHERE devise IS NULL OR devise = 'TND';

-- ============================================================================
-- 9. CONTRAINTES ET VÉRIFICATIONS
-- ============================================================================

-- S'assurer qu'il y a au moins une adresse de facturation principale par client
CREATE OR REPLACE FUNCTION verifier_adresse_facturation_principale()
RETURNS TRIGGER AS $$
BEGIN
    -- Si on désactive la seule adresse de facturation principale, créer une erreur
    IF OLD.principale = true AND OLD.type_adresse = 'FACTURATION' AND NEW.actif = false THEN
        IF NOT EXISTS (
            SELECT 1 FROM adresses_client 
            WHERE id_client = NEW.id_client 
            AND type_adresse = 'FACTURATION' 
            AND principale = true 
            AND actif = true
            AND id_adresse != NEW.id_adresse
        ) THEN
            RAISE EXCEPTION 'Impossible de désactiver la seule adresse de facturation principale';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_verifier_adresse_facturation_principale ON adresses_client;
CREATE TRIGGER trigger_verifier_adresse_facturation_principale
    BEFORE UPDATE ON adresses_client
    FOR EACH ROW
    EXECUTE FUNCTION verifier_adresse_facturation_principale();

-- S'assurer qu'il n'y a qu'un seul contact principal par client
CREATE OR REPLACE FUNCTION verifier_contact_principal_unique()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.contact_principal = true THEN
        -- Désactiver les autres contacts principaux
        UPDATE contacts_client 
        SET contact_principal = false 
        WHERE id_client = NEW.id_client 
        AND id_contact != NEW.id_contact
        AND contact_principal = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_verifier_contact_principal_unique ON contacts_client;
CREATE TRIGGER trigger_verifier_contact_principal_unique
    BEFORE INSERT OR UPDATE ON contacts_client
    FOR EACH ROW
    EXECUTE FUNCTION verifier_contact_principal_unique();

COMMIT;

-- ============================================================================
-- NOTICES
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Structure enrichie pour les clients créée avec succès';
    RAISE NOTICE '✅ Tables créées: categories_clients, types_commerciaux, adresses_client, contacts_client';
    RAISE NOTICE '✅ Colonnes ajoutées à clients: type_client, id_categorie, id_commercial, id_type_commercial, etc.';
    RAISE NOTICE '✅ Fonctions créées: mettre_a_jour_type_client(), determiner_devise_par_pays()';
    RAISE NOTICE '✅ Triggers créés pour la gestion automatique du type client et des contraintes';
END $$;

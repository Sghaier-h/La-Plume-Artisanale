-- ============================================================================
-- MISE A JOUR DE LA STRUCTURE DES UTILISATEURS ET GROUPES
-- ============================================================================
-- Script pour ajouter les colonnes nécessaires aux tables utilisateurs
-- et créer la table groupes
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. CREATION DE LA TABLE GROUPES
-- ============================================================================

CREATE TABLE IF NOT EXISTS groupes (
    id_groupe SERIAL PRIMARY KEY,
    code_groupe VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer les groupes (Fabrication, Atelier, Commercial, Soustraitant)
INSERT INTO groupes (code_groupe, libelle, description, actif) VALUES
('FAB', 'Fabrication', 'Groupe des employés de fabrication', true),
('ATL', 'Atelier', 'Groupe des employés d''atelier', true),
('COM', 'Commercial', 'Groupe des employés commerciaux', true),
('SOU', 'Soustraitant', 'Groupe des soustraitants', true)
ON CONFLICT (code_groupe) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  description = EXCLUDED.description,
  actif = EXCLUDED.actif,
  date_modification = CURRENT_TIMESTAMP;

-- ============================================================================
-- 2. MISE A JOUR DE LA TABLE UTILISATEURS
-- ============================================================================

DO $$
BEGIN
    -- Ajouter colonne photo_emoji si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'utilisateurs' AND column_name = 'photo_emoji'
    ) THEN
        ALTER TABLE utilisateurs ADD COLUMN photo_emoji VARCHAR(10);
        RAISE NOTICE 'Colonne photo_emoji ajoutee a utilisateurs';
    END IF;

    -- Ajouter colonne photo_url si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'utilisateurs' AND column_name = 'photo_url'
    ) THEN
        ALTER TABLE utilisateurs ADD COLUMN photo_url VARCHAR(500);
        RAISE NOTICE 'Colonne photo_url ajoutee a utilisateurs';
    END IF;

    -- Ajouter colonne id_groupe si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'utilisateurs' AND column_name = 'id_groupe'
    ) THEN
        ALTER TABLE utilisateurs ADD COLUMN id_groupe INTEGER REFERENCES groupes(id_groupe);
        RAISE NOTICE 'Colonne id_groupe ajoutee a utilisateurs';
    END IF;

    -- Ajouter colonnes prenom et nom si elles n'existent pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'utilisateurs' AND column_name = 'prenom'
    ) THEN
        ALTER TABLE utilisateurs ADD COLUMN prenom VARCHAR(100);
        RAISE NOTICE 'Colonne prenom ajoutee a utilisateurs';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'utilisateurs' AND column_name = 'nom'
    ) THEN
        ALTER TABLE utilisateurs ADD COLUMN nom VARCHAR(100);
        RAISE NOTICE 'Colonne nom ajoutee a utilisateurs';
    END IF;

    -- Ajouter colonne numero_employe si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'utilisateurs' AND column_name = 'numero_employe'
    ) THEN
        ALTER TABLE utilisateurs ADD COLUMN numero_employe VARCHAR(20);
        RAISE NOTICE 'Colonne numero_employe ajoutee a utilisateurs';
    END IF;
END $$;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_utilisateurs_groupe ON utilisateurs(id_groupe);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_email ON utilisateurs(email);

-- ============================================================================
-- 3. MISE A JOUR DE HAMDI SGHAIER EN ADMIN
-- ============================================================================

-- Mettre à jour Hamdi Sghaier (HS HAMDI SGHAIER) en Admin
-- Note: Le mot de passe sera hashé par le backend lors de la connexion
UPDATE utilisateurs 
SET 
    email = 'responsable@laplume-artisanale.tn',
    prenom = 'HAMDI',
    nom = 'SGHAIER',
    photo_emoji = '👨‍💼',
    actif = true
WHERE 
    (nom_utilisateur ILIKE '%sghaier%' OR nom_utilisateur ILIKE '%hamdi%')
    OR (email ILIKE '%hamdi%' OR email ILIKE '%sghaier%')
    OR (prenom ILIKE '%hamdi%' AND nom ILIKE '%sghaier%');

-- Si l'utilisateur n'existe pas, le créer
INSERT INTO utilisateurs (nom_utilisateur, email, prenom, nom, mot_de_passe_hash, photo_emoji, actif)
SELECT 
    'HS HAMDI SGHAIER',
    'responsable@laplume-artisanale.tn',
    'HAMDI',
    'SGHAIER',
    -- Le mot de passe sera hashé par le backend, on met un placeholder
    '$2b$10$placeholder_hash_will_be_updated_by_backend',
    '👨‍💼',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM utilisateurs 
    WHERE email = 'responsable@laplume-artisanale.tn'
);

-- Attribuer le rôle ADMIN (via utilisateurs_roles si la table existe)
DO $$
DECLARE
    v_user_id INTEGER;
    v_role_id INTEGER;
BEGIN
    -- Récupérer l'ID de l'utilisateur
    SELECT id_utilisateur INTO v_user_id 
    FROM utilisateurs 
    WHERE email = 'responsable@laplume-artisanale.tn';
    
    -- Récupérer l'ID du rôle ADMIN
    SELECT id_role INTO v_role_id 
    FROM roles 
    WHERE code_role = 'ADMIN' OR nom_role ILIKE '%admin%'
    LIMIT 1;
    
    -- Si le rôle existe, l'attribuer
    IF v_user_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        INSERT INTO utilisateurs_roles (id_utilisateur, id_role)
        VALUES (v_user_id, v_role_id)
        ON CONFLICT (id_utilisateur, id_role) DO NOTHING;
        
        RAISE NOTICE 'Role ADMIN attribue a Hamdi Sghaier';
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    v_groupes INTEGER;
    v_cols_utilisateurs INTEGER;
    v_admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_groupes FROM groupes;
    SELECT COUNT(*) INTO v_cols_utilisateurs 
    FROM information_schema.columns 
    WHERE table_name = 'utilisateurs' 
    AND column_name IN ('photo_emoji', 'photo_url', 'id_groupe', 'prenom', 'nom', 'numero_employe');
    
    SELECT COUNT(*) INTO v_admin_count 
    FROM utilisateurs 
    WHERE email = 'responsable@laplume-artisanale.tn';
    
    RAISE NOTICE 'Groupes crees: %', v_groupes;
    RAISE NOTICE 'Colonnes ajoutees a utilisateurs: %', v_cols_utilisateurs;
    RAISE NOTICE 'Utilisateur admin trouve: %', v_admin_count;
END $$;

COMMIT;

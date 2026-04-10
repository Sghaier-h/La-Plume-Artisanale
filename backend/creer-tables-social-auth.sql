-- Script SQL pour ajouter les colonnes nécessaires pour l'authentification sociale

-- Ajouter les colonnes pour les réseaux sociaux dans la table utilisateurs
DO $$ 
BEGIN
    -- Colonne pour le provider social (google, facebook, linkedin, twitter)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'utilisateurs' AND column_name = 'social_provider') THEN
        ALTER TABLE utilisateurs ADD COLUMN social_provider VARCHAR(50);
    END IF;

    -- Colonne pour l'ID social
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'utilisateurs' AND column_name = 'social_id') THEN
        ALTER TABLE utilisateurs ADD COLUMN social_id VARCHAR(255);
    END IF;

    -- Colonne pour l'image de profil social
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'utilisateurs' AND column_name = 'social_picture') THEN
        ALTER TABLE utilisateurs ADD COLUMN social_picture TEXT;
    END IF;

    -- Index pour améliorer les performances
    CREATE INDEX IF NOT EXISTS idx_utilisateurs_social_provider ON utilisateurs(social_provider);
    CREATE INDEX IF NOT EXISTS idx_utilisateurs_social_id ON utilisateurs(social_id);
END $$;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Colonnes d''authentification sociale ajoutées avec succès';
END $$;

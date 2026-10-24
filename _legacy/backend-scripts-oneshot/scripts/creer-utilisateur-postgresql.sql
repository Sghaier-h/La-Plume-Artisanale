-- Script SQL pour créer l'utilisateur et la base de données PostgreSQL
-- Exécutez ce script en tant qu'administrateur PostgreSQL (utilisateur postgres)

-- 1. Créer l'utilisateur (si n'existe pas)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'Aviateur') THEN
        CREATE USER "Aviateur" WITH PASSWORD 'Allbyfouta007';
        RAISE NOTICE 'Utilisateur "Aviateur" créé';
    ELSE
        RAISE NOTICE 'Utilisateur "Aviateur" existe déjà';
    END IF;
END
$$;

-- 2. Mettre à jour le mot de passe (au cas où)
ALTER USER "Aviateur" WITH PASSWORD 'Allbyfouta007';

-- 3. Créer la base de données (si n'existe pas)
SELECT 'CREATE DATABASE "ERP_La_Plume"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ERP_La_Plume')\gexec

-- 4. Attribuer les permissions
ALTER DATABASE "ERP_La_Plume" OWNER TO "Aviateur";
GRANT ALL PRIVILEGES ON DATABASE "ERP_La_Plume" TO "Aviateur";

-- 5. Se connecter à la base de données et donner les permissions sur le schéma
\c "ERP_La_Plume"

-- 6. Permissions sur le schéma public
GRANT ALL ON SCHEMA public TO "Aviateur";
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO "Aviateur";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "Aviateur";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "Aviateur";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "Aviateur";

-- 7. Afficher un message de confirmation
SELECT 'Configuration terminée avec succès !' AS message;

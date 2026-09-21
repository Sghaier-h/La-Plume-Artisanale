-- ============================================================================
-- CREATION DE LA TABLE UTILISATEURS_DASHBOARDS
-- ============================================================================
-- Script pour créer la table de liaison entre utilisateurs et dashboards
-- ============================================================================

BEGIN;

-- Créer la table utilisateurs_dashboards si elle n'existe pas
CREATE TABLE IF NOT EXISTS utilisateurs_dashboards (
    id_utilisateur_dashboard SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    code_dashboard VARCHAR(100) NOT NULL,
    date_attribution TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attribue_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    UNIQUE(id_utilisateur, code_dashboard)
);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_utilisateurs_dashboards_utilisateur 
ON utilisateurs_dashboards(id_utilisateur);

CREATE INDEX IF NOT EXISTS idx_utilisateurs_dashboards_dashboard 
ON utilisateurs_dashboards(code_dashboard);

-- Ajouter colonne email à equipe_fabrication si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'equipe_fabrication' AND column_name = 'email'
    ) THEN
        ALTER TABLE equipe_fabrication ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Colonne email ajoutee a equipe_fabrication';
    END IF;
END $$;

COMMIT;

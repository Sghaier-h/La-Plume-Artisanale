-- ============================================
-- CRÉER LA TABLE EQUIPE SI ELLE N'EXISTE PAS
-- ============================================

-- Vérifier et créer la table equipe si elle n'existe pas
CREATE TABLE IF NOT EXISTS equipe (
    id SERIAL PRIMARY KEY,
    matricule VARCHAR(20) UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    fonction VARCHAR(100),
    departement VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(150),
    date_embauche DATE,
    niveau_qualification VARCHAR(50),
    habilitations TEXT,
    taux_horaire DECIMAL(10,2),
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Créer un index sur l'email pour les recherches
CREATE INDEX IF NOT EXISTS idx_equipe_email ON equipe(email);

-- Commentaire pour documentation
COMMENT ON TABLE equipe IS 'Table des membres de l''équipe';

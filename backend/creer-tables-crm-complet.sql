-- Script SQL pour créer toutes les tables nécessaires au CRM complet
-- Suivi de l'opportunité à la conclusion

-- Table pour les étapes du pipeline CRM
CREATE TABLE IF NOT EXISTS crm_stage (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ordre INTEGER DEFAULT 0,
    probabilite DECIMAL(5,2) DEFAULT 0.00,
    id_team INTEGER,
    fold BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT NOW(),
    date_modification TIMESTAMP DEFAULT NOW()
);

-- Table pour les équipes de vente CRM
CREATE TABLE IF NOT EXISTS crm_team (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ordre INTEGER DEFAULT 0,
    id_chef INTEGER,
    active BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT NOW(),
    date_modification TIMESTAMP DEFAULT NOW()
);

-- Table pour les opportunités CRM
CREATE TABLE IF NOT EXISTS crm_opportunity (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    id_partner INTEGER REFERENCES clients(id_client),
    id_lead INTEGER REFERENCES crm_leads(id),
    id_stage INTEGER REFERENCES crm_stage(id),
    id_team INTEGER REFERENCES crm_team(id),
    id_utilisateur INTEGER REFERENCES utilisateurs(id_utilisateur),
    probabilite DECIMAL(5,2) DEFAULT 0.00,
    revenu_attendu DECIMAL(12,2) DEFAULT 0.00,
    date_prevue DATE,
    date_ouverture TIMESTAMP,
    date_fermeture TIMESTAMP,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    state VARCHAR(50) DEFAULT 'new',
    id_devise INTEGER,
    date_creation TIMESTAMP DEFAULT NOW(),
    date_modification TIMESTAMP DEFAULT NOW()
);

-- Table pour les activités CRM
CREATE TABLE IF NOT EXISTS crm_activity (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type_activite VARCHAR(50) NOT NULL, -- call, meeting, email, task, note, whatsapp
    id_opportunite INTEGER REFERENCES crm_opportunity(id),
    id_partner INTEGER REFERENCES clients(id_client),
    id_utilisateur INTEGER REFERENCES utilisateurs(id_utilisateur),
    id_team INTEGER REFERENCES crm_team(id),
    date_activite TIMESTAMP NOT NULL,
    duree DECIMAL(5,2), -- Durée en heures
    summary TEXT,
    description TEXT,
    done BOOLEAN DEFAULT FALSE,
    state VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, done, cancelled
    date_creation TIMESTAMP DEFAULT NOW(),
    date_modification TIMESTAMP DEFAULT NOW()
);

-- Insérer les étapes du pipeline par défaut
INSERT INTO crm_stage (name, ordre, probabilite, active) VALUES
    ('Nouvelle', 1, 0, true),
    ('Qualifiée', 2, 25, true),
    ('Proposition', 3, 50, true),
    ('Négociation', 4, 75, true),
    ('Gagnée', 5, 100, true),
    ('Perdue', 6, 0, true)
ON CONFLICT DO NOTHING;

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_crm_opportunity_partner ON crm_opportunity(id_partner);
CREATE INDEX IF NOT EXISTS idx_crm_opportunity_stage ON crm_opportunity(id_stage);
CREATE INDEX IF NOT EXISTS idx_crm_opportunity_user ON crm_opportunity(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_crm_opportunity_state ON crm_opportunity(state);
CREATE INDEX IF NOT EXISTS idx_crm_opportunity_active ON crm_opportunity(active);

CREATE INDEX IF NOT EXISTS idx_crm_activity_opportunity ON crm_activity(id_opportunite);
CREATE INDEX IF NOT EXISTS idx_crm_activity_partner ON crm_activity(id_partner);
CREATE INDEX IF NOT EXISTS idx_crm_activity_user ON crm_activity(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_crm_activity_date ON crm_activity(date_activite);
CREATE INDEX IF NOT EXISTS idx_crm_activity_done ON crm_activity(done);

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Tables CRM créées avec succès avec suivi complet opportunité -> conclusion';
END $$;

-- ============================================================================
-- TABLES POUR STOCK MULTI-ENTREPÔTS
-- ============================================================================

-- Entrepôts
CREATE TABLE IF NOT EXISTS entrepots (
    id_entrepot SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'stockage', -- stockage, production
    adresse TEXT,
    responsable VARCHAR(200),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock par entrepôt
CREATE TABLE IF NOT EXISTS stock_entrepots (
    id_stock SERIAL PRIMARY KEY,
    id_mp INTEGER NOT NULL REFERENCES matieres_premieres(id_mp),
    id_entrepot INTEGER NOT NULL REFERENCES entrepots(id_entrepot),
    quantite_disponible DECIMAL(10,3) DEFAULT 0,
    quantite_reservee DECIMAL(10,3) DEFAULT 0,
    date_derniere_entree TIMESTAMP,
    date_derniere_sortie TIMESTAMP,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_mp, id_entrepot)
);

-- Transferts entre entrepôts
CREATE TABLE IF NOT EXISTS transferts_entrepots (
    id_transfert SERIAL PRIMARY KEY,
    numero_transfert VARCHAR(50) UNIQUE NOT NULL,
    id_mp INTEGER NOT NULL REFERENCES matieres_premieres(id_mp),
    id_entrepot_source INTEGER NOT NULL REFERENCES entrepots(id_entrepot),
    id_entrepot_destination INTEGER NOT NULL REFERENCES entrepots(id_entrepot),
    quantite DECIMAL(10,3) NOT NULL,
    raison TEXT,
    statut VARCHAR(50) DEFAULT 'en_attente', -- en_attente, valide, refuse, en_cours, termine
    date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_validation TIMESTAMP,
    valide_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    execute_par INTEGER REFERENCES equipe_fabrication(id_operateur),
    date_execution TIMESTAMP,
    observations TEXT
);

-- Index
CREATE INDEX IF NOT EXISTS idx_stock_entrepot_mp ON stock_entrepots(id_mp);
CREATE INDEX IF NOT EXISTS idx_stock_entrepot_entrepot ON stock_entrepots(id_entrepot);
CREATE INDEX IF NOT EXISTS idx_transferts_statut ON transferts_entrepots(statut);

-- Données initiales - Entrepôts
INSERT INTO entrepots (code, libelle, type, actif) VALUES
('E1', 'Entrepôt 1', 'stockage', true),
('E2', 'Entrepôt 2', 'stockage', true),
('E3', 'Entrepôt 3', 'stockage', true),
('USINE', 'Usine', 'production', true),
('FAB', 'Fabrication', 'production', true)
ON CONFLICT (code) DO NOTHING;

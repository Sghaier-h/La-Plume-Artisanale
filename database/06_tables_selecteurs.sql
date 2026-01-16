-- ============================================================================
-- TABLES POUR CONFIGURATION SÉLECTEURS MACHINES ET OF
-- ============================================================================

-- Configuration sélecteurs par machine
CREATE TABLE IF NOT EXISTS config_selecteurs_machines (
    id_config SERIAL PRIMARY KEY,
    id_machine INTEGER NOT NULL REFERENCES machines(id_machine) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 1 AND position <= 8),
    id_mp INTEGER REFERENCES matieres_premieres(id_mp),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_machine, position)
);

-- Configuration sélecteurs par OF
CREATE TABLE IF NOT EXISTS config_of_selecteurs (
    id_config SERIAL PRIMARY KEY,
    id_of INTEGER NOT NULL REFERENCES ordres_fabrication(id_of) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position >= 1 AND position <= 8),
    id_mp INTEGER NOT NULL REFERENCES matieres_premieres(id_mp),
    quantite_kg DECIMAL(10,3) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_of, position)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_config_selecteurs_machine ON config_selecteurs_machines(id_machine);
CREATE INDEX IF NOT EXISTS idx_config_selecteurs_of ON config_of_selecteurs(id_of);

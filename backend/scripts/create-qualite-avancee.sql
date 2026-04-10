-- Script SQL pour créer la table qualite_avancee
-- Table manquante détectée

CREATE TABLE IF NOT EXISTS qualite_avancee (
  id_qualite SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Vérification
SELECT 'Table qualite_avancee créée avec succès' AS status;

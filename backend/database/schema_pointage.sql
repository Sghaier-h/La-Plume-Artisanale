-- ============================================
-- SCHÉMA BASE DE DONNÉES - POINTAGE TIMEMOTO
-- ============================================

-- Table pour stocker les données de pointage synchronisées depuis TimeMoto
CREATE TABLE IF NOT EXISTS pointage (
    id SERIAL PRIMARY KEY,
    timemoto_id VARCHAR(255) UNIQUE, -- ID de la présence dans TimeMoto
    user_id INTEGER NOT NULL REFERENCES equipe(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIMESTAMP, -- Heure d'arrivée
    check_out TIMESTAMP, -- Heure de départ
    heures_travaillees DECIMAL(5,2) DEFAULT 0, -- Heures travaillées (ex: 8.5)
    present BOOLEAN DEFAULT true, -- Présent ou absent
    retard_minutes INTEGER DEFAULT 0, -- Minutes de retard
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, date) -- Un seul pointage par utilisateur et par jour
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_pointage_user_id ON pointage(user_id);
CREATE INDEX IF NOT EXISTS idx_pointage_date ON pointage(date);
CREATE INDEX IF NOT EXISTS idx_pointage_timemoto_id ON pointage(timemoto_id);
CREATE INDEX IF NOT EXISTS idx_pointage_user_date ON pointage(user_id, date);

-- Table de résumé mensuel (optionnel, pour optimiser les requêtes)
CREATE TABLE IF NOT EXISTS pointage_resume (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES equipe(id) ON DELETE CASCADE,
    mois VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    total_heures DECIMAL(6,2) DEFAULT 0,
    total_jours_presents INTEGER DEFAULT 0,
    total_jours_absents INTEGER DEFAULT 0,
    total_retards INTEGER DEFAULT 0, -- Nombre de retards
    total_minutes_retard INTEGER DEFAULT 0, -- Total minutes de retard
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, mois)
);

CREATE INDEX IF NOT EXISTS idx_pointage_resume_user_mois ON pointage_resume(user_id, mois);

-- Ajouter la colonne timemoto_user_id à la table equipe si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'equipe' AND column_name = 'timemoto_user_id'
    ) THEN
        ALTER TABLE equipe ADD COLUMN timemoto_user_id VARCHAR(255);
        CREATE INDEX IF NOT EXISTS idx_equipe_timemoto_user_id ON equipe(timemoto_user_id);
    END IF;
END $$;

-- Ajouter la colonne temps_travaille_mois à la table equipe si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'equipe' AND column_name = 'temps_travaille_mois'
    ) THEN
        ALTER TABLE equipe ADD COLUMN temps_travaille_mois DECIMAL(6,2) DEFAULT 0;
    END IF;
END $$;

-- Fonction pour recalculer automatiquement le résumé mensuel
CREATE OR REPLACE FUNCTION recalculer_resume_mois()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO pointage_resume (user_id, mois, total_heures, total_jours_presents, total_jours_absents, total_retards, total_minutes_retard, updated_at)
    SELECT 
        NEW.user_id,
        TO_CHAR(NEW.date, 'YYYY-MM'),
        COALESCE(SUM(heures_travaillees), 0),
        COUNT(*) FILTER (WHERE present = true),
        COUNT(*) FILTER (WHERE present = false),
        COUNT(*) FILTER (WHERE retard_minutes > 0),
        COALESCE(SUM(retard_minutes), 0)
    FROM pointage
    WHERE user_id = NEW.user_id 
      AND TO_CHAR(date, 'YYYY-MM') = TO_CHAR(NEW.date, 'YYYY-MM')
    ON CONFLICT (user_id, mois) 
    DO UPDATE SET
        total_heures = EXCLUDED.total_heures,
        total_jours_presents = EXCLUDED.total_jours_presents,
        total_jours_absents = EXCLUDED.total_jours_absents,
        total_retards = EXCLUDED.total_retards,
        total_minutes_retard = EXCLUDED.total_minutes_retard,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour recalculer automatiquement le résumé
DROP TRIGGER IF EXISTS trigger_recalculer_resume_mois ON pointage;
CREATE TRIGGER trigger_recalculer_resume_mois
    AFTER INSERT OR UPDATE OR DELETE ON pointage
    FOR EACH ROW
    EXECUTE FUNCTION recalculer_resume_mois();

-- Vue pour faciliter les requêtes de pointage
CREATE OR REPLACE VIEW v_pointage_detail AS
SELECT 
    p.id,
    p.timemoto_id,
    p.user_id,
    e.nom,
    e.prenom,
    e.fonction,
    e.email,
    p.date,
    p.check_in,
    p.check_out,
    p.heures_travaillees,
    p.present,
    p.retard_minutes,
    CASE 
        WHEN p.retard_minutes > 0 THEN true 
        ELSE false 
    END as a_retard,
    p.created_at,
    p.updated_at
FROM pointage p
JOIN equipe e ON p.user_id = e.id;

-- Commentaires pour documentation
COMMENT ON TABLE pointage IS 'Données de pointage synchronisées depuis TimeMoto';
COMMENT ON TABLE pointage_resume IS 'Résumé mensuel des pointages par utilisateur';
COMMENT ON COLUMN pointage.timemoto_id IS 'ID unique de la présence dans TimeMoto';
COMMENT ON COLUMN pointage.heures_travaillees IS 'Nombre d''heures travaillées (décimal, ex: 8.5)';
COMMENT ON COLUMN pointage.retard_minutes IS 'Nombre de minutes de retard';

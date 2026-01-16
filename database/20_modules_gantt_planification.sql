-- ============================================================================
-- MODULE GANTT & PLANIFICATION AVANCÉE
-- ============================================================================

-- Table : projets
CREATE TABLE IF NOT EXISTS projets (
    id_projet SERIAL PRIMARY KEY,
    code_projet VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Dates
    date_debut_prevue DATE NOT NULL,
    date_fin_prevue DATE NOT NULL,
    date_debut_reelle DATE,
    date_fin_reelle DATE,
    
    -- Durée
    duree_prevue_jours INTEGER,
    duree_reelle_jours INTEGER,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'PLANIFIE',
    -- Statuts: PLANIFIE, EN_COURS, EN_RETARD, TERMINE, ANNULE
    
    -- Priorité
    priorite INTEGER DEFAULT 2, -- 1=Urgent, 2=Normal, 3=Faible
    
    -- Chef de projet
    id_chef_projet INTEGER REFERENCES utilisateurs(id_utilisateur),
    
    -- Budget
    budget_prevue NUMERIC(12,2) DEFAULT 0,
    budget_reel NUMERIC(12,2) DEFAULT 0,
    
    -- Progression
    progression_pourcentage NUMERIC(5,2) DEFAULT 0,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : taches_projet
CREATE TABLE IF NOT EXISTS taches_projet (
    id_tache SERIAL PRIMARY KEY,
    id_projet INTEGER NOT NULL REFERENCES projets(id_projet) ON DELETE CASCADE,
    
    -- Informations
    code_tache VARCHAR(50),
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Dates
    date_debut_prevue DATE NOT NULL,
    date_fin_prevue DATE NOT NULL,
    date_debut_reelle DATE,
    date_fin_reelle DATE,
    
    -- Durée
    duree_prevue_jours NUMERIC(10,2),
    duree_reelle_jours NUMERIC(10,2),
    duree_prevue_heures NUMERIC(10,2),
    duree_reelle_heures NUMERIC(10,2),
    
    -- Dépendances
    taches_precedentes INTEGER[], -- IDs tâches précédentes
    taches_suivantes INTEGER[], -- IDs tâches suivantes
    
    -- Ressources
    id_ressource INTEGER, -- ID machine, opérateur, etc.
    type_ressource VARCHAR(30), -- MACHINE, OPERATEUR, SOUS_TRAITANT
    charge_ressource NUMERIC(5,2) DEFAULT 100, -- Pourcentage
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'A_FAIRE',
    -- Statuts: A_FAIRE, EN_COURS, EN_PAUSE, TERMINEE, BLOQUEE
    
    -- Progression
    progression_pourcentage NUMERIC(5,2) DEFAULT 0,
    
    -- Priorité
    priorite INTEGER DEFAULT 2,
    
    -- Jalons
    est_jalon BOOLEAN DEFAULT FALSE,
    
    -- Métadonnées
    ordre INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : planification_automatique
CREATE TABLE IF NOT EXISTS planification_automatique (
    id_planification SERIAL PRIMARY KEY,
    code_planification VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    
    -- Type
    type_planification VARCHAR(30) NOT NULL,
    -- Types: OF, PROJET, MAINTENANCE, RESSOURCE
    
    -- Paramètres
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    mode_planification VARCHAR(30) DEFAULT 'AUTOMATIQUE',
    -- Modes: AUTOMATIQUE, MANUEL, HYBRIDE
    
    -- Contraintes
    respecter_capacite BOOLEAN DEFAULT TRUE,
    respecter_delais BOOLEAN DEFAULT TRUE,
    optimiser_ressources BOOLEAN DEFAULT TRUE,
    
    -- Résultat
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    -- Statuts: EN_ATTENTE, EN_COURS, TERMINEE, ERREUR
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    executed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : capacite_ressources
CREATE TABLE IF NOT EXISTS capacite_ressources (
    id_capacite SERIAL PRIMARY KEY,
    
    -- Ressource
    id_ressource INTEGER NOT NULL,
    type_ressource VARCHAR(30) NOT NULL,
    -- Types: MACHINE, OPERATEUR, ENTREPOT, POSTE_TRAVAIL
    
    -- Période
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    
    -- Capacité
    capacite_totale_heures NUMERIC(10,2) NOT NULL,
    capacite_utilisee_heures NUMERIC(10,2) DEFAULT 0,
    capacite_disponible_heures NUMERIC(10,2) GENERATED ALWAYS AS (capacite_totale_heures - capacite_utilisee_heures) STORED,
    taux_utilisation NUMERIC(5,2) GENERATED ALWAYS AS ((capacite_utilisee_heures / NULLIF(capacite_totale_heures, 0)) * 100) STORED,
    
    -- Contraintes
    indisponibilites JSONB, -- [{date_debut, date_fin, motif}]
    
    UNIQUE(id_ressource, type_ressource, date_debut, date_fin)
);

-- Table : affectations_planification
CREATE TABLE IF NOT EXISTS affectations_planification (
    id_affectation SERIAL PRIMARY KEY,
    id_planification INTEGER NOT NULL REFERENCES planification_automatique(id_planification),
    
    -- Tâche/OF
    id_tache INTEGER REFERENCES taches_projet(id_tache),
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    
    -- Ressource
    id_ressource INTEGER NOT NULL,
    type_ressource VARCHAR(30) NOT NULL,
    
    -- Dates
    date_debut_prevue TIMESTAMP NOT NULL,
    date_fin_prevue TIMESTAMP NOT NULL,
    date_debut_reelle TIMESTAMP,
    date_fin_reelle TIMESTAMP,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'PLANIFIEE',
    -- Statuts: PLANIFIEE, EN_COURS, TERMINEE, ANNULEE
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : conflits_planification
CREATE TABLE IF NOT EXISTS conflits_planification (
    id_conflit SERIAL PRIMARY KEY,
    id_planification INTEGER REFERENCES planification_automatique(id_planification),
    
    -- Type conflit
    type_conflit VARCHAR(30) NOT NULL,
    -- Types: SURCHARGE_RESSOURCE, CHEVAUCHEMENT, DELAI_IMPOSSIBLE, CAPACITE_INSUFFISANTE
    
    -- Ressource concernée
    id_ressource INTEGER NOT NULL,
    type_ressource VARCHAR(30) NOT NULL,
    
    -- Description
    description TEXT NOT NULL,
    severite INTEGER DEFAULT 2, -- 1=Critique, 2=Important, 3=Mineur
    
    -- Résolution
    resolu BOOLEAN DEFAULT FALSE,
    solution_appliquee TEXT,
    resolved_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    resolved_at TIMESTAMP,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_projets_statut ON projets(statut);
CREATE INDEX IF NOT EXISTS idx_projets_dates ON projets(date_debut_prevue, date_fin_prevue);
CREATE INDEX IF NOT EXISTS idx_taches_projet ON taches_projet(id_projet);
CREATE INDEX IF NOT EXISTS idx_taches_dates ON taches_projet(date_debut_prevue, date_fin_prevue);
CREATE INDEX IF NOT EXISTS idx_taches_statut ON taches_projet(statut);
CREATE INDEX IF NOT EXISTS idx_planification_type ON planification_automatique(type_planification);
CREATE INDEX IF NOT EXISTS idx_planification_statut ON planification_automatique(statut);
CREATE INDEX IF NOT EXISTS idx_capacite_ressource ON capacite_ressources(id_ressource, type_ressource);
CREATE INDEX IF NOT EXISTS idx_capacite_dates ON capacite_ressources(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_affectations_planification ON affectations_planification(id_planification);
CREATE INDEX IF NOT EXISTS idx_affectations_ressource ON affectations_planification(id_ressource, type_ressource);
CREATE INDEX IF NOT EXISTS idx_affectations_dates ON affectations_planification(date_debut_prevue, date_fin_prevue);
CREATE INDEX IF NOT EXISTS idx_conflits_planification ON conflits_planification(id_planification);
CREATE INDEX IF NOT EXISTS idx_conflits_resolu ON conflits_planification(resolu);

-- Fonction pour calculer progression projet
CREATE OR REPLACE FUNCTION calculer_progression_projet(id_projet_param INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    progression NUMERIC(5,2);
BEGIN
    SELECT COALESCE(AVG(progression_pourcentage), 0)
    INTO progression
    FROM taches_projet
    WHERE id_projet = id_projet_param;
    
    UPDATE projets
    SET progression_pourcentage = progression
    WHERE id_projet = id_projet_param;
    
    RETURN progression;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour progression projet
CREATE OR REPLACE FUNCTION update_progression_projet()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculer_progression_projet(NEW.id_projet);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_progression_projet
AFTER INSERT OR UPDATE ON taches_projet
FOR EACH ROW
EXECUTE FUNCTION update_progression_projet();

-- Triggers
CREATE TRIGGER trigger_projets_updated_at BEFORE UPDATE ON projets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_taches_projet_updated_at BEFORE UPDATE ON taches_projet
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_planification_updated_at BEFORE UPDATE ON planification_automatique
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_affectations_updated_at BEFORE UPDATE ON affectations_planification
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

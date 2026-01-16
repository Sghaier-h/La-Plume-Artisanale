-- ============================================================================
-- MODULE PLANIFICATION GANTT - DIAGRAMME DE GANTT, RESSOURCES, OPTIMISATION
-- ============================================================================

-- Table : projets
CREATE TABLE IF NOT EXISTS projets (
    id_projet SERIAL PRIMARY KEY,
    code_projet VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Dates
    date_debut_prevue DATE,
    date_fin_prevue DATE,
    date_debut_reelle DATE,
    date_fin_reelle DATE,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'PLANIFIE',
    -- Statuts: PLANIFIE, EN_COURS, EN_RETARD, TERMINE, ANNULE
    
    -- Priorité
    priorite INTEGER DEFAULT 2, -- 1=Urgent, 2=Normale, 3=Faible
    
    -- Responsable
    id_responsable INTEGER REFERENCES utilisateurs(id_utilisateur),
    
    -- Budget
    budget_prevue NUMERIC(12,2) DEFAULT 0,
    budget_reel NUMERIC(12,2) DEFAULT 0,
    
    -- Progression
    progression_pourcentage NUMERIC(5,2) DEFAULT 0,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : taches_planification
CREATE TABLE IF NOT EXISTS taches_planification (
    id_tache SERIAL PRIMARY KEY,
    id_projet INTEGER REFERENCES projets(id_projet),
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    
    -- Identification
    code_tache VARCHAR(50),
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Dates planifiées
    date_debut_prevue DATE NOT NULL,
    date_fin_prevue DATE NOT NULL,
    duree_prevue_jours NUMERIC(10,2),
    duree_prevue_heures NUMERIC(10,2),
    
    -- Dates réelles
    date_debut_reelle DATE,
    date_fin_reelle DATE,
    duree_reelle_jours NUMERIC(10,2),
    duree_reelle_heures NUMERIC(10,2),
    
    -- Ressources
    id_machine INTEGER REFERENCES machines(id_machine),
    id_operateur INTEGER REFERENCES utilisateurs(id_utilisateur),
    equipe INTEGER[], -- IDs utilisateurs
    
    -- Dépendances
    taches_precedentes INTEGER[], -- IDs tâches précédentes
    taches_suivantes INTEGER[], -- IDs tâches suivantes
    
    -- Type tâche
    type_tache VARCHAR(30),
    -- Types: PREPARATION, FABRICATION, CONTROLE, FINITION, LIVRAISON
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'PLANIFIEE',
    -- Statuts: PLANIFIEE, EN_ATTENTE, EN_COURS, TERMINEE, BLOQUEE, ANNULEE
    
    -- Progression
    progression_pourcentage NUMERIC(5,2) DEFAULT 0,
    
    -- Priorité
    priorite INTEGER DEFAULT 2,
    
    -- Coûts
    cout_prevue NUMERIC(10,2) DEFAULT 0,
    cout_reel NUMERIC(10,2) DEFAULT 0,
    
    -- Gantt
    niveau_wbs INTEGER DEFAULT 1, -- Niveau dans la structure
    parent_tache INTEGER REFERENCES taches_planification(id_tache),
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : ressources_planification
CREATE TABLE IF NOT EXISTS ressources_planification (
    id_ressource SERIAL PRIMARY KEY,
    type_ressource VARCHAR(30) NOT NULL,
    -- Types: MACHINE, OPERATEUR, EQUIPEMENT, MATIERE
    
    -- Référence
    id_machine INTEGER REFERENCES machines(id_machine),
    id_utilisateur INTEGER REFERENCES utilisateurs(id_utilisateur),
    id_equipement INTEGER, -- Table équipements si existe
    
    -- Capacité
    capacite_max_heures_jour NUMERIC(10,2) DEFAULT 8,
    capacite_max_heures_semaine NUMERIC(10,2) DEFAULT 40,
    
    -- Disponibilité
    jours_travail INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Lundi, 7=Dimanche
    heures_debut TIME DEFAULT '08:00',
    heures_fin TIME DEFAULT '17:00',
    
    -- Coût
    cout_horaire NUMERIC(10,2) DEFAULT 0,
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Contrainte : Une ressource doit avoir au moins une référence
    CONSTRAINT check_ressource_reference CHECK (
        id_machine IS NOT NULL OR 
        id_utilisateur IS NOT NULL OR 
        id_equipement IS NOT NULL
    )
);

-- Table : affectations_ressources
CREATE TABLE IF NOT EXISTS affectations_ressources (
    id_affectation SERIAL PRIMARY KEY,
    id_tache INTEGER NOT NULL REFERENCES taches_planification(id_tache) ON DELETE CASCADE,
    id_ressource INTEGER NOT NULL REFERENCES ressources_planification(id_ressource),
    
    -- Dates
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    heures_prevues NUMERIC(10,2) NOT NULL,
    heures_reelles NUMERIC(10,2) DEFAULT 0,
    
    -- Charge
    charge_pourcentage NUMERIC(5,2) DEFAULT 100, -- 100% = temps plein
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'PLANIFIEE',
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(id_tache, id_ressource, date_debut)
);

-- Table : contraintes_planification
CREATE TABLE IF NOT EXISTS contraintes_planification (
    id_contrainte SERIAL PRIMARY KEY,
    id_tache INTEGER NOT NULL REFERENCES taches_planification(id_tache) ON DELETE CASCADE,
    
    -- Type contrainte
    type_contrainte VARCHAR(30) NOT NULL,
    -- Types: DEBUT_APRES, FIN_AVANT, DEBUT_A, FIN_A, DEBUT_APRES_DEBUT, FIN_AVANT_FIN
    
    -- Référence
    id_tache_reference INTEGER REFERENCES taches_planification(id_tache),
    date_contrainte DATE,
    
    -- Marge
    marge_jours INTEGER DEFAULT 0, -- Marge avant/après
    
    -- Priorité contrainte
    priorite INTEGER DEFAULT 2,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : optimisations_planification
CREATE TABLE IF NOT EXISTS optimisations_planification (
    id_optimisation SERIAL PRIMARY KEY,
    id_projet INTEGER REFERENCES projets(id_projet),
    
    -- Type optimisation
    type_optimisation VARCHAR(30) NOT NULL,
    -- Types: DUREE_MINIMALE, COUT_MINIMAL, RESSOURCES_OPTIMALES, CHARGE_EQUILIBREE
    
    -- Paramètres
    parametres JSONB,
    
    -- Résultats
    duree_avant_jours NUMERIC(10,2),
    duree_apres_jours NUMERIC(10,2),
    cout_avant NUMERIC(12,2),
    cout_apres NUMERIC(12,2),
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'CALCULEE',
    -- Statuts: CALCULEE, APPLIQUEE, ANNULEE
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : vues_gantt
CREATE TABLE IF NOT EXISTS vues_gantt (
    id_vue SERIAL PRIMARY KEY,
    nom_vue VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Filtres
    filtres JSONB, -- {projets: [], machines: [], statuts: []}
    
    -- Configuration
    date_debut_vue DATE,
    date_fin_vue DATE,
    echelle VARCHAR(20) DEFAULT 'JOUR',
    -- Échelles: HEURE, JOUR, SEMAINE, MOIS
    
    -- Affichage
    afficher_ressources BOOLEAN DEFAULT TRUE,
    afficher_couts BOOLEAN DEFAULT TRUE,
    afficher_progression BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_taches_projet ON taches_planification(id_projet);
CREATE INDEX IF NOT EXISTS idx_taches_of ON taches_planification(id_of);
CREATE INDEX IF NOT EXISTS idx_taches_dates ON taches_planification(date_debut_prevue, date_fin_prevue);
CREATE INDEX IF NOT EXISTS idx_taches_statut ON taches_planification(statut);
CREATE INDEX IF NOT EXISTS idx_taches_parent ON taches_planification(parent_tache);
CREATE INDEX IF NOT EXISTS idx_affectations_tache ON affectations_ressources(id_tache);
CREATE INDEX IF NOT EXISTS idx_affectations_ressource ON affectations_ressources(id_ressource);
CREATE INDEX IF NOT EXISTS idx_affectations_dates ON affectations_ressources(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_contraintes_tache ON contraintes_planification(id_tache);
CREATE INDEX IF NOT EXISTS idx_ressources_machine ON ressources_planification(id_machine);
CREATE INDEX IF NOT EXISTS idx_ressources_utilisateur ON ressources_planification(id_utilisateur);

-- Fonction pour calculer dates critiques (chemin critique)
CREATE OR REPLACE FUNCTION calculer_chemin_critique(id_projet_param INTEGER)
RETURNS TABLE (
    id_tache INTEGER,
    date_debut_au_plus_tot DATE,
    date_fin_au_plus_tot DATE,
    date_debut_au_plus_tard DATE,
    date_fin_au_plus_tard DATE,
    marge_totale INTEGER,
    est_critique BOOLEAN
) AS $$
BEGIN
    -- Algorithme PERT/CPM simplifié
    -- TODO: Implémenter calcul complet du chemin critique
    RETURN QUERY
    SELECT 
        t.id_tache,
        t.date_debut_prevue,
        t.date_fin_prevue,
        t.date_debut_prevue,
        t.date_fin_prevue,
        0,
        FALSE
    FROM taches_planification t
    WHERE t.id_projet = id_projet_param;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour optimiser planification
CREATE OR REPLACE FUNCTION optimiser_planification(
    id_projet_param INTEGER,
    type_optimisation_param VARCHAR
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- TODO: Implémenter algorithmes d'optimisation
    -- - Lissage des ressources
    -- - Compression du temps
    -- - Équilibrage de charge
    result := jsonb_build_object(
        'success', true,
        'message', 'Optimisation calculée',
        'duree_avant', 0,
        'duree_apres', 0
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_taches_updated_at BEFORE UPDATE ON taches_planification
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_projets_updated_at BEFORE UPDATE ON projets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_ressources_updated_at BEFORE UPDATE ON ressources_planification
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_affectations_updated_at BEFORE UPDATE ON affectations_ressources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_vues_gantt_updated_at BEFORE UPDATE ON vues_gantt
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- MODULE COÛTS - THÉORIQUE VS RÉEL, ANALYSE, BUDGET
-- ============================================================================

-- Table : budgets
CREATE TABLE IF NOT EXISTS budgets (
    id_budget SERIAL PRIMARY KEY,
    code_budget VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    
    -- Référence
    id_projet INTEGER REFERENCES projets(id_projet),
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    
    -- Période
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    
    -- Budget total
    budget_total NUMERIC(12,2) NOT NULL,
    budget_utilise NUMERIC(12,2) DEFAULT 0,
    budget_restant NUMERIC(12,2),
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'APPROUVE',
    -- Statuts: BROUILLON, EN_ATTENTE, APPROUVE, CLOTURE
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    approved_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : lignes_budget
CREATE TABLE IF NOT EXISTS lignes_budget (
    id_ligne SERIAL PRIMARY KEY,
    id_budget INTEGER NOT NULL REFERENCES budgets(id_budget) ON DELETE CASCADE,
    
    -- Type coût
    type_cout VARCHAR(30) NOT NULL,
    -- Types: MAIN_D_OEUVRE, MATIERES_PREMIERES, MACHINE, FRAIS_GENERAUX, AUTRE
    
    -- Référence
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    id_matiere INTEGER REFERENCES matieres_premieres(id_mp),
    id_machine INTEGER REFERENCES machines(id_machine),
    
    -- Montants
    montant_prevue NUMERIC(12,2) NOT NULL,
    montant_reel NUMERIC(12,2) DEFAULT 0,
    ecart NUMERIC(12,2) DEFAULT 0,
    ecart_pourcentage NUMERIC(5,2) DEFAULT 0,
    
    -- Quantités
    quantite_prevue NUMERIC(10,3),
    quantite_reelle NUMERIC(10,3) DEFAULT 0,
    
    -- Prix unitaires
    prix_unitaire_prevue NUMERIC(10,2),
    prix_unitaire_reel NUMERIC(10,2),
    
    -- Métadonnées
    ordre INTEGER DEFAULT 0,
    notes TEXT
);

-- Table : couts_theoriques
CREATE TABLE IF NOT EXISTS couts_theoriques (
    id_cout SERIAL PRIMARY KEY,
    
    -- Référence
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    
    -- Type coût
    type_cout VARCHAR(30) NOT NULL,
    
    -- Calcul théorique
    quantite_theorique NUMERIC(10,3) NOT NULL,
    prix_unitaire_theorique NUMERIC(10,2) NOT NULL,
    montant_theorique NUMERIC(12,2) NOT NULL,
    
    -- Base de calcul
    source_calcul VARCHAR(100), -- Nomenclature, fiche technique, etc.
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : couts_reels
CREATE TABLE IF NOT EXISTS couts_reels (
    id_cout SERIAL PRIMARY KEY,
    
    -- Référence
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_tache INTEGER REFERENCES taches_planification(id_tache),
    
    -- Type coût
    type_cout VARCHAR(30) NOT NULL,
    
    -- Coût réel
    quantite_reelle NUMERIC(10,3) NOT NULL,
    prix_unitaire_reel NUMERIC(10,2) NOT NULL,
    montant_reel NUMERIC(12,2) NOT NULL,
    
    -- Source
    id_mouvement_stock INTEGER REFERENCES mouvements_stock(id_mouvement),
    id_intervention INTEGER REFERENCES interventions_maintenance(id_intervention),
    id_paiement INTEGER, -- Paiement fournisseur, etc.
    
    -- Date
    date_cout DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : analyses_ecarts
CREATE TABLE IF NOT EXISTS analyses_ecarts (
    id_analyse SERIAL PRIMARY KEY,
    
    -- Référence
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_budget INTEGER REFERENCES budgets(id_budget),
    
    -- Écarts
    ecart_total NUMERIC(12,2) NOT NULL,
    ecart_pourcentage NUMERIC(5,2) NOT NULL,
    
    -- Détail par type
    ecart_main_oeuvre NUMERIC(12,2) DEFAULT 0,
    ecart_matieres NUMERIC(12,2) DEFAULT 0,
    ecart_machines NUMERIC(12,2) DEFAULT 0,
    ecart_frais_generaux NUMERIC(12,2) DEFAULT 0,
    
    -- Causes
    causes_ecart TEXT,
    actions_correctives TEXT,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : centres_analyse
CREATE TABLE IF NOT EXISTS centres_analyse (
    id_centre SERIAL PRIMARY KEY,
    code_centre VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    
    -- Type
    type_centre VARCHAR(30),
    -- Types: ATELIER, MACHINE, PRODUIT, CLIENT, PROJET
    
    -- Référence
    id_machine INTEGER REFERENCES machines(id_machine),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    
    -- Coûts
    cout_fixe NUMERIC(12,2) DEFAULT 0,
    cout_variable NUMERIC(12,2) DEFAULT 0,
    cout_total NUMERIC(12,2) DEFAULT 0,
    
    -- Unité
    unite_oeuvre VARCHAR(50), -- Heure machine, heure main d'œuvre, etc.
    nombre_unites NUMERIC(10,2) DEFAULT 0,
    cout_unite NUMERIC(10,2) DEFAULT 0,
    
    -- Période
    periode_debut DATE,
    periode_fin DATE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : imputations_couts
CREATE TABLE IF NOT EXISTS imputations_couts (
    id_imputation SERIAL PRIMARY KEY,
    
    -- Référence coût
    id_cout_reel INTEGER REFERENCES couts_reels(id_cout),
    id_centre_analyse INTEGER REFERENCES centres_analyse(id_centre),
    
    -- Référence destination
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    
    -- Montant
    montant_impute NUMERIC(12,2) NOT NULL,
    
    -- Base imputation
    base_imputation VARCHAR(50), -- Heures, quantités, etc.
    valeur_base NUMERIC(10,2),
    
    -- Date
    date_imputation DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_budgets_projet ON budgets(id_projet);
CREATE INDEX IF NOT EXISTS idx_budgets_of ON budgets(id_of);
CREATE INDEX IF NOT EXISTS idx_budgets_periode ON budgets(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_lignes_budget ON lignes_budget(id_budget);
CREATE INDEX IF NOT EXISTS idx_couts_theoriques_of ON couts_theoriques(id_of);
CREATE INDEX IF NOT EXISTS idx_couts_theoriques_article ON couts_theoriques(id_article);
CREATE INDEX IF NOT EXISTS idx_couts_reels_of ON couts_reels(id_of);
CREATE INDEX IF NOT EXISTS idx_couts_reels_date ON couts_reels(date_cout);
CREATE INDEX IF NOT EXISTS idx_analyses_ecarts_of ON analyses_ecarts(id_of);
CREATE INDEX IF NOT EXISTS idx_centres_analyse_machine ON centres_analyse(id_machine);
CREATE INDEX IF NOT EXISTS idx_imputations_cout ON imputations_couts(id_cout_reel);
CREATE INDEX IF NOT EXISTS idx_imputations_of ON imputations_couts(id_of);

-- Fonction pour calculer coût théorique OF
CREATE OR REPLACE FUNCTION calculer_cout_theorique_of(id_of_param INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    cout_total NUMERIC(12,2) := 0;
BEGIN
    -- Coût matières premières (depuis nomenclature)
    SELECT COALESCE(SUM(ns.quantite_kg * mp.prix_unitaire), 0)
    INTO cout_total
    FROM nomenclature_selecteurs ns
    JOIN matieres_premieres mp ON ns.id_mp = mp.id_mp
    JOIN ordres_fabrication of ON ns.id_article = of.id_article
    WHERE of.id_of = id_of_param;
    
    -- Coût main d'œuvre (depuis temps standard)
    -- TODO: Ajouter calcul main d'œuvre
    
    -- Coût machine (depuis temps machine)
    -- TODO: Ajouter calcul coût machine
    
    RETURN cout_total;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer coût réel OF
CREATE OR REPLACE FUNCTION calculer_cout_reel_of(id_of_param INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    cout_total NUMERIC(12,2) := 0;
BEGIN
    SELECT COALESCE(SUM(montant_reel), 0)
    INTO cout_total
    FROM couts_reels
    WHERE id_of = id_of_param;
    
    RETURN cout_total;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour analyser écarts
CREATE OR REPLACE FUNCTION analyser_ecarts_of(id_of_param INTEGER)
RETURNS JSONB AS $$
DECLARE
    cout_theorique NUMERIC(12,2);
    cout_reel NUMERIC(12,2);
    ecart NUMERIC(12,2);
    ecart_pourcentage NUMERIC(5,2);
    result JSONB;
BEGIN
    cout_theorique := calculer_cout_theorique_of(id_of_param);
    cout_reel := calculer_cout_reel_of(id_of_param);
    ecart := cout_reel - cout_theorique;
    ecart_pourcentage := CASE 
        WHEN cout_theorique > 0 THEN (ecart / cout_theorique) * 100
        ELSE 0
    END;
    
    result := jsonb_build_object(
        'id_of', id_of_param,
        'cout_theorique', cout_theorique,
        'cout_reel', cout_reel,
        'ecart', ecart,
        'ecart_pourcentage', ecart_pourcentage
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_couts_theoriques_updated_at BEFORE UPDATE ON couts_theoriques
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_centres_analyse_updated_at BEFORE UPDATE ON centres_analyse
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger pour mettre à jour budget utilisé
CREATE OR REPLACE FUNCTION update_budget_utilise()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE budgets
    SET budget_utilise = (
        SELECT COALESCE(SUM(montant_reel), 0)
        FROM lignes_budget
        WHERE id_budget = NEW.id_budget
    ),
    budget_restant = budget_total - budget_utilise,
    updated_at = CURRENT_TIMESTAMP
    WHERE id_budget = NEW.id_budget;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_budget_utilise
AFTER INSERT OR UPDATE ON lignes_budget
FOR EACH ROW
EXECUTE FUNCTION update_budget_utilise();

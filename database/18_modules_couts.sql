-- ============================================================================
-- MODULE COÛTS - THÉORIQUE VS RÉEL, ANALYSE, BUDGET
-- ============================================================================

-- Table : couts_of_theoriques
CREATE TABLE IF NOT EXISTS couts_of_theoriques (
    id_cout_theorique SERIAL PRIMARY KEY,
    id_of INTEGER NOT NULL REFERENCES ordres_fabrication(id_of),
    
    -- Coûts matières premières
    cout_mp_theorique NUMERIC(12,2) DEFAULT 0,
    cout_mp_reel NUMERIC(12,2) DEFAULT 0,
    ecart_mp NUMERIC(12,2) DEFAULT 0,
    
    -- Coûts main d'œuvre
    cout_mo_theorique NUMERIC(12,2) DEFAULT 0,
    cout_mo_reel NUMERIC(12,2) DEFAULT 0,
    heures_mo_theoriques NUMERIC(10,2) DEFAULT 0,
    heures_mo_reelles NUMERIC(10,2) DEFAULT 0,
    ecart_mo NUMERIC(12,2) DEFAULT 0,
    
    -- Coûts machines
    cout_machine_theorique NUMERIC(12,2) DEFAULT 0,
    cout_machine_reel NUMERIC(12,2) DEFAULT 0,
    heures_machine_theoriques NUMERIC(10,2) DEFAULT 0,
    heures_machine_reelles NUMERIC(10,2) DEFAULT 0,
    ecart_machine NUMERIC(12,2) DEFAULT 0,
    
    -- Coûts indirects
    cout_indirect_theorique NUMERIC(12,2) DEFAULT 0,
    cout_indirect_reel NUMERIC(12,2) DEFAULT 0,
    ecart_indirect NUMERIC(12,2) DEFAULT 0,
    
    -- Total
    cout_total_theorique NUMERIC(12,2) DEFAULT 0,
    cout_total_reel NUMERIC(12,2) DEFAULT 0,
    ecart_total NUMERIC(12,2) DEFAULT 0,
    taux_ecart NUMERIC(5,2) DEFAULT 0, -- Pourcentage
    
    -- Coût unitaire
    cout_unitaire_theorique NUMERIC(10,2) DEFAULT 0,
    cout_unitaire_reel NUMERIC(10,2) DEFAULT 0,
    
    -- Métadonnées
    date_calcul TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(id_of)
);

-- Table : couts_operation_theoriques
CREATE TABLE IF NOT EXISTS couts_operation_theoriques (
    id_cout_operation SERIAL PRIMARY KEY,
    id_of INTEGER NOT NULL REFERENCES ordres_fabrication(id_of),
    id_operation INTEGER, -- Référence opération dans routage
    numero_operation INTEGER,
    libelle_operation VARCHAR(200),
    
    -- Machine
    id_machine INTEGER REFERENCES machines(id_machine),
    
    -- Temps
    temps_preparation_theorique NUMERIC(10,2) DEFAULT 0, -- Minutes
    temps_execution_theorique NUMERIC(10,2) DEFAULT 0, -- Minutes
    temps_total_theorique NUMERIC(10,2) DEFAULT 0, -- Minutes
    
    temps_preparation_reel NUMERIC(10,2) DEFAULT 0,
    temps_execution_reel NUMERIC(10,2) DEFAULT 0,
    temps_total_reel NUMERIC(10,2) DEFAULT 0,
    
    -- Coûts
    cout_operation_theorique NUMERIC(12,2) DEFAULT 0,
    cout_operation_reel NUMERIC(12,2) DEFAULT 0,
    ecart_operation NUMERIC(12,2) DEFAULT 0,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : couts_matiere_premiere
CREATE TABLE IF NOT EXISTS couts_matiere_premiere (
    id_cout_mp SERIAL PRIMARY KEY,
    id_of INTEGER NOT NULL REFERENCES ordres_fabrication(id_of),
    id_mp INTEGER NOT NULL REFERENCES matieres_premieres(id_mp),
    
    -- Quantités
    quantite_theorique NUMERIC(10,3) DEFAULT 0,
    quantite_reelle NUMERIC(10,3) DEFAULT 0,
    ecart_quantite NUMERIC(10,3) DEFAULT 0,
    
    -- Coûts
    prix_unitaire_theorique NUMERIC(10,2) DEFAULT 0,
    prix_unitaire_reel NUMERIC(10,2) DEFAULT 0,
    cout_total_theorique NUMERIC(12,2) DEFAULT 0,
    cout_total_reel NUMERIC(12,2) DEFAULT 0,
    ecart_cout NUMERIC(12,2) DEFAULT 0,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : tarifs_horaires
CREATE TABLE IF NOT EXISTS tarifs_horaires (
    id_tarif SERIAL PRIMARY KEY,
    code_tarif VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    
    -- Type
    type_tarif VARCHAR(30) NOT NULL,
    -- Types: MAIN_OEUVRE, MACHINE, SOUS_TRAITANCE
    
    -- Référence
    id_operateur INTEGER REFERENCES equipe_fabrication(id_operateur),
    id_machine INTEGER REFERENCES machines(id_machine),
    id_soustraitant INTEGER REFERENCES soustraitants(id_soustraitant),
    
    -- Tarifs
    tarif_horaire NUMERIC(10,2) NOT NULL,
    tarif_minute NUMERIC(10,4) NOT NULL, -- Calculé automatiquement
    
    -- Dates
    date_debut DATE NOT NULL,
    date_fin DATE,
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : budgets_production
CREATE TABLE IF NOT EXISTS budgets_production (
    id_budget SERIAL PRIMARY KEY,
    code_budget VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    
    -- Période
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    
    -- Budgets
    budget_mp NUMERIC(12,2) DEFAULT 0,
    budget_mo NUMERIC(12,2) DEFAULT 0,
    budget_machines NUMERIC(12,2) DEFAULT 0,
    budget_indirects NUMERIC(12,2) DEFAULT 0,
    budget_total NUMERIC(12,2) DEFAULT 0,
    
    -- Réalisé
    realise_mp NUMERIC(12,2) DEFAULT 0,
    realise_mo NUMERIC(12,2) DEFAULT 0,
    realise_machines NUMERIC(12,2) DEFAULT 0,
    realise_indirects NUMERIC(12,2) DEFAULT 0,
    realise_total NUMERIC(12,2) DEFAULT 0,
    
    -- Écarts
    ecart_mp NUMERIC(12,2) DEFAULT 0,
    ecart_mo NUMERIC(12,2) DEFAULT 0,
    ecart_machines NUMERIC(12,2) DEFAULT 0,
    ecart_indirects NUMERIC(12,2) DEFAULT 0,
    ecart_total NUMERIC(12,2) DEFAULT 0,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    -- Statuts: BROUILLON, VALIDE, EN_COURS, CLOTURE
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : analyse_ecarts
CREATE TABLE IF NOT EXISTS analyse_ecarts (
    id_analyse SERIAL PRIMARY KEY,
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_budget INTEGER REFERENCES budgets_production(id_budget),
    
    -- Type analyse
    type_ecart VARCHAR(30) NOT NULL,
    -- Types: MATIERE_PREMIERE, MAIN_OEUVRE, MACHINE, INDIRECT, GLOBAL
    
    -- Écart
    montant_ecart NUMERIC(12,2) NOT NULL,
    taux_ecart NUMERIC(5,2) NOT NULL, -- Pourcentage
    
    -- Causes
    cause_principale VARCHAR(200),
    causes_detaillees TEXT,
    
    -- Actions correctives
    actions_correctives TEXT,
    responsable_action INTEGER REFERENCES utilisateurs(id_utilisateur),
    date_action_prevue DATE,
    date_action_reelle DATE,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'IDENTIFIE',
    -- Statuts: IDENTIFIE, EN_ANALYSE, ACTION_EN_COURS, RESOLU
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_couts_of_theoriques_of ON couts_of_theoriques(id_of);
CREATE INDEX IF NOT EXISTS idx_couts_operation_of ON couts_operation_theoriques(id_of);
CREATE INDEX IF NOT EXISTS idx_couts_mp_of ON couts_matiere_premiere(id_of);
CREATE INDEX IF NOT EXISTS idx_tarifs_type ON tarifs_horaires(type_tarif);
CREATE INDEX IF NOT EXISTS idx_tarifs_actif ON tarifs_horaires(actif);
CREATE INDEX IF NOT EXISTS idx_budgets_periode ON budgets_production(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_budgets_statut ON budgets_production(statut);
CREATE INDEX IF NOT EXISTS idx_analyse_ecarts_of ON analyse_ecarts(id_of);
CREATE INDEX IF NOT EXISTS idx_analyse_ecarts_statut ON analyse_ecarts(statut);

-- Fonction pour calculer coût théorique OF
CREATE OR REPLACE FUNCTION calculer_cout_theorique_of(id_of_param INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    cout_total NUMERIC(12,2) := 0;
    cout_mp NUMERIC(12,2) := 0;
    cout_mo NUMERIC(12,2) := 0;
    cout_machine NUMERIC(12,2) := 0;
BEGIN
    -- Coût MP théorique
    SELECT COALESCE(SUM(quantite * prix_unitaire), 0)
    INTO cout_mp
    FROM nomenclature_mp nm
    JOIN matieres_premieres mp ON nm.id_mp = mp.id_mp
    WHERE nm.id_of = id_of_param;
    
    -- Coût MO théorique (à calculer selon temps opérations)
    -- Coût Machine théorique (à calculer selon temps machine)
    
    cout_total := cout_mp + cout_mo + cout_machine;
    
    RETURN cout_total;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour coûts OF
CREATE OR REPLACE FUNCTION update_couts_of()
RETURNS TRIGGER AS $$
DECLARE
    cout_theorique NUMERIC(12,2);
    cout_reel NUMERIC(12,2);
BEGIN
    -- Calculer coûts théoriques et réels
    -- Mettre à jour table couts_of_theoriques
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_couts_of_updated_at BEFORE UPDATE ON couts_of_theoriques
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_tarifs_updated_at BEFORE UPDATE ON tarifs_horaires
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_budgets_updated_at BEFORE UPDATE ON budgets_production
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_analyse_ecarts_updated_at BEFORE UPDATE ON analyse_ecarts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

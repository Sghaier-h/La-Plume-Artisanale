-- ============================================================================
-- MODULE MAINTENANCE - PRÉVENTIVE, CORRECTIVE, PIÈCES DÉTACHÉES
-- ============================================================================

-- Table : types_maintenance
CREATE TABLE IF NOT EXISTS types_maintenance (
    id_type SERIAL PRIMARY KEY,
    code_type VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    duree_standard_minutes INTEGER,
    frequence_jours INTEGER, -- Pour préventive
    actif BOOLEAN DEFAULT TRUE
);

-- Table : interventions_maintenance
CREATE TABLE IF NOT EXISTS interventions_maintenance (
    id_intervention SERIAL PRIMARY KEY,
    numero_intervention VARCHAR(50) UNIQUE NOT NULL,
    id_machine INTEGER NOT NULL REFERENCES machines(id_machine),
    id_type_maintenance INTEGER REFERENCES types_maintenance(id_type),
    
    -- Type intervention
    type_intervention VARCHAR(30) NOT NULL,
    -- Types: PREVENTIVE, CORRECTIVE, URGENTE, AMELIORATION, AUDIT
    
    -- Dates
    date_planification DATE,
    date_debut TIMESTAMP,
    date_fin TIMESTAMP,
    duree_reelle_minutes INTEGER,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'PLANIFIEE',
    -- Statuts: PLANIFIEE, EN_COURS, TERMINEE, ANNULEE, REPORTEE
    
    -- Personnel
    id_intervenant INTEGER REFERENCES utilisateurs(id_utilisateur),
    equipe_intervention INTEGER[], -- IDs utilisateurs
    
    -- Description
    description_probleme TEXT,
    travaux_realises TEXT,
    observations TEXT,
    recommandations TEXT,
    
    -- Coûts
    cout_main_oeuvre NUMERIC(10,2) DEFAULT 0,
    cout_pieces_detachees NUMERIC(10,2) DEFAULT 0,
    cout_total NUMERIC(10,2) DEFAULT 0,
    
    -- Pièces détachées utilisées
    pieces_utilisees JSONB, -- [{id_piece, quantite, prix_unitaire}]
    
    -- Impact production
    arret_production BOOLEAN DEFAULT FALSE,
    duree_arret_minutes INTEGER DEFAULT 0,
    impact_production TEXT,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : pieces_detachees
CREATE TABLE IF NOT EXISTS pieces_detachees (
    id_piece SERIAL PRIMARY KEY,
    code_piece VARCHAR(50) UNIQUE NOT NULL,
    designation VARCHAR(200) NOT NULL,
    reference_fournisseur VARCHAR(100),
    id_fournisseur INTEGER REFERENCES fournisseurs(id_fournisseur),
    
    -- Caractéristiques
    type_piece VARCHAR(50),
    -- Types: MECANIQUE, ELECTRIQUE, ELECTRONIQUE, HYDRAULIQUE, PNEUMATIQUE, AUTRE
    marque VARCHAR(100),
    modele VARCHAR(100),
    
    -- Compatibilité
    machines_compatibles INTEGER[], -- IDs machines
    duree_vie_heures INTEGER, -- Durée de vie en heures
    duree_vie_mois INTEGER, -- Durée de vie en mois
    
    -- Stock
    stock_disponible INTEGER DEFAULT 0,
    stock_minimum INTEGER DEFAULT 0,
    stock_maximum INTEGER DEFAULT 0,
    unite VARCHAR(20) DEFAULT 'unité',
    
    -- Prix
    prix_achat NUMERIC(10,2),
    prix_vente NUMERIC(10,2),
    dernier_prix_achat NUMERIC(10,2),
    
    -- Informations
    emplacement VARCHAR(100),
    notes TEXT,
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : planification_maintenance
CREATE TABLE IF NOT EXISTS planification_maintenance (
    id_planification SERIAL PRIMARY KEY,
    id_machine INTEGER NOT NULL REFERENCES machines(id_machine),
    id_type_maintenance INTEGER NOT NULL REFERENCES types_maintenance(id_type),
    
    -- Fréquence
    type_frequence VARCHAR(30) NOT NULL,
    -- Types: CALENDRIER, HEURES_UTILISATION, PRODUCTION, CONDITIONNELLE
    frequence_valeur INTEGER, -- Jours, heures, ou quantité
    unite_frequence VARCHAR(20), -- jours, heures, pieces
    
    -- Prochaine intervention
    date_prochaine DATE,
    heures_prochaines INTEGER, -- Heures d'utilisation machine
    production_prochaine NUMERIC(10,2), -- Quantité produite
    
    -- Dernière intervention
    date_derniere DATE,
    heures_dernieres INTEGER,
    production_derniere NUMERIC(10,2),
    
    -- Statut
    actif BOOLEAN DEFAULT TRUE,
    en_retard BOOLEAN DEFAULT FALSE,
    jours_retard INTEGER DEFAULT 0,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(id_machine, id_type_maintenance)
);

-- Table : historique_maintenance
CREATE TABLE IF NOT EXISTS historique_maintenance (
    id_historique SERIAL PRIMARY KEY,
    id_machine INTEGER NOT NULL REFERENCES machines(id_machine),
    id_intervention INTEGER REFERENCES interventions_maintenance(id_intervention),
    
    -- Dates
    date_intervention DATE NOT NULL,
    
    -- Type
    type_intervention VARCHAR(30) NOT NULL,
    libelle_intervention VARCHAR(200),
    
    -- Coûts
    cout_total NUMERIC(10,2) DEFAULT 0,
    
    -- Durée
    duree_minutes INTEGER,
    
    -- Impact
    arret_production BOOLEAN DEFAULT FALSE,
    duree_arret_minutes INTEGER DEFAULT 0,
    
    -- Notes
    observations TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : alertes_maintenance
CREATE TABLE IF NOT EXISTS alertes_maintenance (
    id_alerte SERIAL PRIMARY KEY,
    id_machine INTEGER NOT NULL REFERENCES machines(id_machine),
    id_planification INTEGER REFERENCES planification_maintenance(id_planification),
    
    -- Type alerte
    type_alerte VARCHAR(30) NOT NULL,
    -- Types: PREVENTIVE_DUE, PREVENTIVE_RETARD, PIECE_USURE, ANOMALIE, URGENTE
    
    -- Priorité
    priorite INTEGER DEFAULT 2, -- 1=Urgent, 2=Normale, 3=Faible
    
    -- Message
    message TEXT NOT NULL,
    date_alerte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Statut
    lue BOOLEAN DEFAULT FALSE,
    traitee BOOLEAN DEFAULT FALSE,
    date_traitement TIMESTAMP,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_interventions_machine ON interventions_maintenance(id_machine);
CREATE INDEX IF NOT EXISTS idx_interventions_type ON interventions_maintenance(type_intervention);
CREATE INDEX IF NOT EXISTS idx_interventions_statut ON interventions_maintenance(statut);
CREATE INDEX IF NOT EXISTS idx_interventions_date ON interventions_maintenance(date_planification);
CREATE INDEX IF NOT EXISTS idx_pieces_fournisseur ON pieces_detachees(id_fournisseur);
CREATE INDEX IF NOT EXISTS idx_pieces_stock ON pieces_detachees(stock_disponible);
CREATE INDEX IF NOT EXISTS idx_planification_machine ON planification_maintenance(id_machine);
CREATE INDEX IF NOT EXISTS idx_planification_actif ON planification_maintenance(actif);
CREATE INDEX IF NOT EXISTS idx_planification_retard ON planification_maintenance(en_retard);
CREATE INDEX IF NOT EXISTS idx_historique_machine ON historique_maintenance(id_machine);
CREATE INDEX IF NOT EXISTS idx_historique_date ON historique_maintenance(date_intervention);
CREATE INDEX IF NOT EXISTS idx_alertes_machine ON alertes_maintenance(id_machine);
CREATE INDEX IF NOT EXISTS idx_alertes_lue ON alertes_maintenance(lue, traitee);

-- Fonction pour générer numéro intervention
CREATE OR REPLACE FUNCTION generer_numero_intervention()
RETURNS VARCHAR(50) AS $$
DECLARE
    numero VARCHAR(50);
    annee VARCHAR(4);
    compteur INTEGER;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_intervention FROM '\d+$') AS INTEGER)), 0) + 1
    INTO compteur
    FROM interventions_maintenance
    WHERE numero_intervention LIKE 'INT-' || annee || '-%';
    numero := 'INT-' || annee || '-' || LPAD(compteur::TEXT, 6, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer prochaine maintenance
CREATE OR REPLACE FUNCTION calculer_prochaine_maintenance()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour date prochaine maintenance après intervention
    IF NEW.statut = 'TERMINEE' AND OLD.statut != 'TERMINEE' THEN
        UPDATE planification_maintenance
        SET date_derniere = CURRENT_DATE,
            date_prochaine = CURRENT_DATE + (SELECT frequence_jours FROM types_maintenance WHERE id_type = NEW.id_type_maintenance),
            heures_dernieres = (SELECT heures_utilisation FROM machines WHERE id_machine = NEW.id_machine),
            updated_at = CURRENT_TIMESTAMP
        WHERE id_machine = NEW.id_machine
        AND id_type_maintenance = NEW.id_type_maintenance;
        
        -- Créer entrée historique
        INSERT INTO historique_maintenance (
            id_machine, id_intervention, date_intervention,
            type_intervention, libelle_intervention,
            cout_total, duree_minutes, arret_production, duree_arret_minutes
        ) VALUES (
            NEW.id_machine, NEW.id_intervention, CURRENT_DATE,
            NEW.type_intervention, 'Intervention ' || NEW.numero_intervention,
            NEW.cout_total, NEW.duree_reelle_minutes,
            NEW.arret_production, NEW.duree_arret_minutes
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer prochaine maintenance
CREATE TRIGGER trigger_calculer_prochaine_maintenance
AFTER UPDATE ON interventions_maintenance
FOR EACH ROW
EXECUTE FUNCTION calculer_prochaine_maintenance();

-- Fonction pour vérifier alertes maintenance
CREATE OR REPLACE FUNCTION verifier_alertes_maintenance()
RETURNS VOID AS $$
BEGIN
    -- Alertes maintenance préventive due
    INSERT INTO alertes_maintenance (id_machine, id_planification, type_alerte, priorite, message)
    SELECT 
        p.id_machine,
        p.id_planification,
        'PREVENTIVE_DUE',
        CASE 
            WHEN p.date_prochaine < CURRENT_DATE THEN 1
            WHEN p.date_prochaine <= CURRENT_DATE + INTERVAL '7 days' THEN 2
            ELSE 3
        END,
        'Maintenance préventive due pour machine ' || m.numero_machine || ' - ' || t.libelle
    FROM planification_maintenance p
    JOIN machines m ON p.id_machine = m.id_machine
    JOIN types_maintenance t ON p.id_type_maintenance = t.id_type
    WHERE p.actif = TRUE
    AND p.date_prochaine <= CURRENT_DATE + INTERVAL '7 days'
    AND NOT EXISTS (
        SELECT 1 FROM alertes_maintenance a
        WHERE a.id_planification = p.id_planification
        AND a.type_alerte = 'PREVENTIVE_DUE'
        AND a.traitee = FALSE
    );
    
    -- Alertes stock pièces détachées
    INSERT INTO alertes_maintenance (id_machine, type_alerte, priorite, message)
    SELECT 
        m.id_machine,
        'PIECE_USURE',
        2,
        'Stock faible pour pièce ' || p.designation || ' (Stock: ' || p.stock_disponible || ', Min: ' || p.stock_minimum || ')'
    FROM pieces_detachees p
    CROSS JOIN machines m
    WHERE p.stock_disponible <= p.stock_minimum
    AND p.actif = TRUE
    AND m.id_machine = ANY(p.machines_compatibles)
    AND NOT EXISTS (
        SELECT 1 FROM alertes_maintenance a
        WHERE a.id_machine = m.id_machine
        AND a.type_alerte = 'PIECE_USURE'
        AND a.message LIKE '%' || p.designation || '%'
        AND a.traitee = FALSE
    );
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_interventions_updated_at BEFORE UPDATE ON interventions_maintenance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_pieces_updated_at BEFORE UPDATE ON pieces_detachees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_planification_updated_at BEFORE UPDATE ON planification_maintenance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Données initiales : Types maintenance standards
INSERT INTO types_maintenance (code_type, libelle, description, duree_standard_minutes, frequence_jours, actif) VALUES
('MAINT_QUOTIDIENNE', 'Maintenance Quotidienne', 'Nettoyage, vérifications quotidiennes', 30, 1, TRUE),
('MAINT_HEBDOMADAIRE', 'Maintenance Hebdomadaire', 'Vérifications approfondies hebdomadaires', 120, 7, TRUE),
('MAINT_MENSUELLE', 'Maintenance Mensuelle', 'Révision mensuelle complète', 480, 30, TRUE),
('MAINT_TRIMESTRIELLE', 'Maintenance Trimestrielle', 'Révision trimestrielle majeure', 1440, 90, TRUE),
('MAINT_ANNUELLE', 'Maintenance Annuelle', 'Révision annuelle complète', 2880, 365, TRUE),
('MAINT_CORRECTIVE', 'Maintenance Corrective', 'Réparation en cas de panne', 0, 0, TRUE)

ON CONFLICT (code_type) DO NOTHING;

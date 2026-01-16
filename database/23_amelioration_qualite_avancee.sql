-- ============================================================================
-- AMÉLIORATION MODULE QUALITÉ AVANCÉE
-- ============================================================================

-- Table : non_conformites (si n'existe pas)
CREATE TABLE IF NOT EXISTS non_conformites (
    id_nc SERIAL PRIMARY KEY,
    numero_nc VARCHAR(50) UNIQUE NOT NULL,
    
    -- Source
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_lot INTEGER REFERENCES lots(id_lot),
    id_reception INTEGER REFERENCES receptions(id_reception),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    
    -- Type
    type_nc VARCHAR(30) NOT NULL,
    -- Types: PRODUIT, MATIERE_PREMIERE, PROCESSUS, FOURNISSEUR, AUTRE
    
    -- Gravité
    gravite VARCHAR(20) NOT NULL,
    -- Gravités: CRITIQUE, MAJEURE, MINEURE
    
    -- Description
    description TEXT NOT NULL,
    cause_racine TEXT,
    
    -- Quantité
    quantite_nc INTEGER DEFAULT 1,
    quantite_affectee INTEGER DEFAULT 0,
    
    -- Dates
    date_detection DATE NOT NULL DEFAULT CURRENT_DATE,
    date_resolution DATE,
    delai_resolution_jours INTEGER,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'OUVERTE',
    -- Statuts: OUVERTE, EN_ANALYSE, ACTION_EN_COURS, RESOLUE, CLOTUREE
    
    -- Responsable
    id_responsable INTEGER REFERENCES utilisateurs(id_utilisateur),
    id_detecteur INTEGER REFERENCES utilisateurs(id_utilisateur),
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : actions_correctives
CREATE TABLE IF NOT EXISTS actions_correctives (
    id_action SERIAL PRIMARY KEY,
    id_nc INTEGER NOT NULL REFERENCES non_conformites(id_nc),
    
    -- Type action
    type_action VARCHAR(30) NOT NULL,
    -- Types: CORRECTIVE, PREVENTIVE, AMELIORATION
    
    -- Description
    description TEXT NOT NULL,
    actions_prevues TEXT,
    
    -- Responsable
    id_responsable INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur),
    
    -- Dates
    date_debut_prevue DATE,
    date_fin_prevue DATE,
    date_debut_reelle DATE,
    date_fin_reelle DATE,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'PLANIFIEE',
    -- Statuts: PLANIFIEE, EN_COURS, TERMINEE, ANNULEE
    
    -- Efficacité
    efficacite_verifiee BOOLEAN DEFAULT FALSE,
    efficacite_commentaire TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : controles_qualite_avances
CREATE TABLE IF NOT EXISTS controles_qualite_avances (
    id_controle SERIAL PRIMARY KEY,
    numero_controle VARCHAR(50) UNIQUE NOT NULL,
    
    -- Référence
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_lot INTEGER REFERENCES lots(id_lot),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    
    -- Type contrôle
    type_controle VARCHAR(30) NOT NULL,
    -- Types: RECEPTION, PRODUCTION, FINAL, AUDIT
    
    -- Méthode
    methode_controle VARCHAR(50),
    -- Méthodes: VISUELLE, MESURE, TEST, ECHANTILLONNAGE
    
    -- Critères
    criteres_acceptation JSONB,
    -- {critere1: {valeur_min, valeur_max, unite}, ...}
    
    -- Résultats
    resultats JSONB,
    -- {critere1: {valeur_mesuree, conforme}, ...}
    
    -- Décision
    decision VARCHAR(30) NOT NULL,
    -- Décisions: CONFORME, NON_CONFORME, CONDITIONNEL
    
    -- Quantités
    quantite_controlee INTEGER,
    quantite_conforme INTEGER DEFAULT 0,
    quantite_non_conforme INTEGER DEFAULT 0,
    
    -- Contrôleur
    id_controleur INTEGER REFERENCES utilisateurs(id_utilisateur),
    
    -- Dates
    date_controle DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : certificats_qualite
CREATE TABLE IF NOT EXISTS certificats_qualite (
    id_certificat SERIAL PRIMARY KEY,
    numero_certificat VARCHAR(50) UNIQUE NOT NULL,
    
    -- Référence
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_lot INTEGER REFERENCES lots(id_lot),
    id_commande INTEGER REFERENCES commandes_clients(id_commande),
    
    -- Type
    type_certificat VARCHAR(30) NOT NULL,
    -- Types: CONFORMITE, ANALYSE, TRACEABILITE, AUTRE
    
    -- Normes
    normes_applicables TEXT[],
    -- Ex: ISO 9001, ISO 14001, etc.
    
    -- Contenu
    contenu_certificat TEXT,
    resultats_tests JSONB,
    
    -- Dates
    date_emission DATE NOT NULL DEFAULT CURRENT_DATE,
    date_validite DATE,
    
    -- Émetteur
    id_emetteur INTEGER REFERENCES utilisateurs(id_utilisateur),
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'VALIDE',
    -- Statuts: VALIDE, EXPIRE, ANNULE
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : indicateurs_qualite
CREATE TABLE IF NOT EXISTS indicateurs_qualite (
    id_indicateur SERIAL PRIMARY KEY,
    code_indicateur VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    
    -- Type
    type_indicateur VARCHAR(30) NOT NULL,
    -- Types: TAUX_NC, TAUX_RETOUR, SATISFACTION_CLIENT, DELAI_RESOLUTION
    
    -- Calcul
    formule_calcul TEXT,
    unite VARCHAR(20),
    
    -- Cible
    valeur_cible NUMERIC(10,2),
    valeur_seuil_alerte NUMERIC(10,2),
    
    -- Période
    periode_calcul VARCHAR(20) DEFAULT 'MENSUEL',
    -- Périodes: QUOTIDIEN, HEBDOMADAIRE, MENSUEL, TRIMESTRIEL, ANNUEL
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : valeurs_indicateurs
CREATE TABLE IF NOT EXISTS valeurs_indicateurs (
    id_valeur SERIAL PRIMARY KEY,
    id_indicateur INTEGER NOT NULL REFERENCES indicateurs_qualite(id_indicateur),
    
    -- Période
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    
    -- Valeur
    valeur NUMERIC(10,2) NOT NULL,
    
    -- Métadonnées
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_nc_of ON non_conformites(id_of);
CREATE INDEX IF NOT EXISTS idx_nc_statut ON non_conformites(statut);
CREATE INDEX IF NOT EXISTS idx_nc_gravite ON non_conformites(gravite);
CREATE INDEX IF NOT EXISTS idx_actions_nc ON actions_correctives(id_nc);
CREATE INDEX IF NOT EXISTS idx_actions_statut ON actions_correctives(statut);
CREATE INDEX IF NOT EXISTS idx_controles_of ON controles_qualite_avances(id_of);
CREATE INDEX IF NOT EXISTS idx_controles_decision ON controles_qualite_avances(decision);
CREATE INDEX IF NOT EXISTS idx_certificats_of ON certificats_qualite(id_of);
CREATE INDEX IF NOT EXISTS idx_certificats_statut ON certificats_qualite(statut);
CREATE INDEX IF NOT EXISTS idx_indicateurs_type ON indicateurs_qualite(type_indicateur);
CREATE INDEX IF NOT EXISTS idx_valeurs_indicateur ON valeurs_indicateurs(id_indicateur);
CREATE INDEX IF NOT EXISTS idx_valeurs_periode ON valeurs_indicateurs(date_debut, date_fin);

-- Fonction pour générer numéro NC
CREATE OR REPLACE FUNCTION generer_numero_nc()
RETURNS VARCHAR(50) AS $$
DECLARE
    numero VARCHAR(50);
    annee VARCHAR(4);
    compteur INTEGER;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_nc FROM '\d+$') AS INTEGER)), 0) + 1
    INTO compteur
    FROM non_conformites
    WHERE numero_nc LIKE 'NC-' || annee || '-%';
    numero := 'NC-' || annee || '-' || LPAD(compteur::TEXT, 6, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer indicateur qualité
CREATE OR REPLACE FUNCTION calculer_indicateur_qualite(
    p_id_indicateur INTEGER,
    p_date_debut DATE,
    p_date_fin DATE
)
RETURNS NUMERIC AS $$
DECLARE
    v_valeur NUMERIC(10,2);
    v_type VARCHAR(30);
BEGIN
    SELECT type_indicateur INTO v_type
    FROM indicateurs_qualite
    WHERE id_indicateur = p_id_indicateur;
    
    -- Calcul selon type
    CASE v_type
        WHEN 'TAUX_NC' THEN
            -- Calculer taux de non-conformité
            SELECT COALESCE(
                (COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM ordres_fabrication WHERE date_creation BETWEEN p_date_debut AND p_date_fin), 0)) * 100,
                0
            )
            INTO v_valeur
            FROM non_conformites
            WHERE date_detection BETWEEN p_date_debut AND p_date_fin;
        
        WHEN 'TAUX_RETOUR' THEN
            -- Calculer taux de retour
            -- À implémenter selon besoins
            v_valeur := 0;
        
        ELSE
            v_valeur := 0;
    END CASE;
    
    -- Enregistrer valeur
    INSERT INTO valeurs_indicateurs (id_indicateur, date_debut, date_fin, valeur)
    VALUES (p_id_indicateur, p_date_debut, p_date_fin, v_valeur)
    ON CONFLICT DO NOTHING;
    
    RETURN v_valeur;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_nc_updated_at BEFORE UPDATE ON non_conformites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_actions_updated_at BEFORE UPDATE ON actions_correctives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_controles_updated_at BEFORE UPDATE ON controles_qualite_avances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_certificats_updated_at BEFORE UPDATE ON certificats_qualite
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_indicateurs_updated_at BEFORE UPDATE ON indicateurs_qualite
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Données initiales : Indicateurs qualité standards
INSERT INTO indicateurs_qualite (code_indicateur, libelle, type_indicateur, unite, valeur_cible, valeur_seuil_alerte, periode_calcul, actif) VALUES
('TAUX_NC', 'Taux de Non-Conformité', 'TAUX_NC', '%', 2.0, 5.0, 'MENSUEL', TRUE),
('TAUX_RETOUR', 'Taux de Retour Client', 'TAUX_RETOUR', '%', 1.0, 3.0, 'MENSUEL', TRUE),
('DELAI_RESOLUTION_NC', 'Délai Moyen Résolution NC', 'DELAI_RESOLUTION', 'jours', 7, 14, 'MENSUEL', TRUE),
('TAUX_CONFORMITE', 'Taux de Conformité', 'TAUX_CONFORMITE', '%', 98.0, 95.0, 'MENSUEL', TRUE)

ON CONFLICT (code_indicateur) DO NOTHING;

-- ============================================================================
-- MODULE CONTRÔLE QUALITÉ AVANCÉ - DIAGRAMMES, STATISTIQUES, CAP
-- ============================================================================

-- Table : normes_qualite
CREATE TABLE IF NOT EXISTS normes_qualite (
    id_norme SERIAL PRIMARY KEY,
    code_norme VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Type norme
    type_norme VARCHAR(30),
    -- Types: ISO, INTERNE, CLIENT, REGLEMENTAIRE
    
    -- Référence
    reference_externe VARCHAR(100),
    version VARCHAR(20),
    date_application DATE,
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : criteres_qualite
CREATE TABLE IF NOT EXISTS criteres_qualite (
    id_critere SERIAL PRIMARY KEY,
    id_norme INTEGER REFERENCES normes_qualite(id_norme),
    code_critere VARCHAR(50) NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    
    -- Type critère
    type_critere VARCHAR(30) NOT NULL,
    -- Types: MESURE, VISUEL, FONCTIONNEL, DIMENSIONNEL, AUTRE
    
    -- Valeurs
    valeur_cible NUMERIC(10,3),
    tolerance_plus NUMERIC(10,3),
    tolerance_moins NUMERIC(10,3),
    unite VARCHAR(20),
    
    -- Méthode
    methode_controle TEXT,
    equipement_controle VARCHAR(200),
    
    -- Fréquence
    frequence_controle VARCHAR(30) DEFAULT 'SYSTEMATIQUE',
    -- Fréquences: SYSTEMATIQUE, ECHANTILLONNAGE, ALEATOIRE
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    ordre INTEGER DEFAULT 0,
    
    UNIQUE(id_norme, code_critere)
);

-- Table : controles_qualite
CREATE TABLE IF NOT EXISTS controles_qualite (
    id_controle SERIAL PRIMARY KEY,
    numero_controle VARCHAR(50) UNIQUE NOT NULL,
    
    -- Référence
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    id_lot VARCHAR(50), -- Référence lot
    
    -- Type contrôle
    type_controle VARCHAR(30) NOT NULL,
    -- Types: RECEPTION, PRODUCTION, FINAL, RETOUR, AUDIT
    
    -- Dates
    date_controle DATE NOT NULL DEFAULT CURRENT_DATE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Contrôleur
    id_controleur INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur),
    
    -- Résultat global
    resultat_global VARCHAR(30) DEFAULT 'EN_ATTENTE',
    -- Résultats: CONFORME, NON_CONFORME, CONFORME_AVEC_RESERVE, EN_ATTENTE
    
    -- Statistiques
    nb_criteres_total INTEGER DEFAULT 0,
    nb_criteres_conformes INTEGER DEFAULT 0,
    nb_criteres_non_conformes INTEGER DEFAULT 0,
    taux_conformite NUMERIC(5,2) DEFAULT 0,
    
    -- Décision
    decision VARCHAR(30),
    -- Décisions: ACCEPTE, REFUSE, RETRAITEMENT, TRIAGE
    
    -- Informations
    observations TEXT,
    photos JSONB, -- URLs photos
    documents JSONB, -- URLs documents
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : lignes_controle_qualite
CREATE TABLE IF NOT EXISTS lignes_controle_qualite (
    id_ligne SERIAL PRIMARY KEY,
    id_controle INTEGER NOT NULL REFERENCES controles_qualite(id_controle) ON DELETE CASCADE,
    id_critere INTEGER REFERENCES criteres_qualite(id_critere),
    
    -- Mesure
    valeur_mesuree NUMERIC(10,3),
    unite VARCHAR(20),
    
    -- Résultat
    conforme BOOLEAN,
    ecart NUMERIC(10,3), -- Écart par rapport à la cible
    
    -- Évaluation
    note INTEGER, -- 0-100
    commentaire TEXT,
    
    -- Photos
    photos JSONB,
    
    ordre INTEGER DEFAULT 0
);

-- Table : non_conformites
CREATE TABLE IF NOT EXISTS non_conformites (
    id_nc SERIAL PRIMARY KEY,
    numero_nc VARCHAR(50) UNIQUE NOT NULL,
    
    -- Référence
    id_controle INTEGER REFERENCES controles_qualite(id_controle),
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    id_lot VARCHAR(50),
    
    -- Description
    description TEXT NOT NULL,
    gravite VARCHAR(30) DEFAULT 'MOYENNE',
    -- Gravités: MINEURE, MOYENNE, MAJEURE, CRITIQUE
    
    -- Cause
    cause_racine TEXT,
    type_cause VARCHAR(50),
    -- Types: MATIERE, MACHINE, METHODE, MAIN_D_OEUVRE, ENVIRONNEMENT
    
    -- Action corrective
    action_corrective TEXT,
    responsable_action INTEGER REFERENCES utilisateurs(id_utilisateur),
    date_action_prevue DATE,
    date_action_reelle DATE,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'OUVERTE',
    -- Statuts: OUVERTE, EN_COURS, FERMEE, ANNULEE
    
    -- Suivi
    date_ouverture DATE DEFAULT CURRENT_DATE,
    date_fermeture DATE,
    duree_traitement_jours INTEGER,
    
    -- Coût
    cout_nc NUMERIC(10,2) DEFAULT 0,
    -- Coût: rebut, retraitement, temps perdu
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : actions_correctives
CREATE TABLE IF NOT EXISTS actions_correctives (
    id_action SERIAL PRIMARY KEY,
    id_nc INTEGER REFERENCES non_conformites(id_nc),
    numero_action VARCHAR(50) UNIQUE NOT NULL,
    
    -- Description
    description TEXT NOT NULL,
    type_action VARCHAR(30) NOT NULL,
    -- Types: CORRECTIVE, PREVENTIVE, AMELIORATION
    
    -- Responsable
    responsable INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur),
    
    -- Dates
    date_prevue DATE NOT NULL,
    date_reelle DATE,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'PLANIFIEE',
    -- Statuts: PLANIFIEE, EN_COURS, TERMINEE, ANNULEE
    
    -- Résultat
    resultat TEXT,
    efficacite VARCHAR(30),
    -- Efficacités: EFFICACE, PARTIELLEMENT_EFFICACE, INEFFICACE
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : statistiques_qualite
CREATE TABLE IF NOT EXISTS statistiques_qualite (
    id_statistique SERIAL PRIMARY KEY,
    
    -- Période
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    type_periode VARCHAR(20) DEFAULT 'MENSUEL',
    -- Types: QUOTIDIEN, HEBDOMADAIRE, MENSUEL, TRIMESTRIEL, ANNUEL
    
    -- Référence
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    id_machine INTEGER REFERENCES machines(id_machine),
    id_controleur INTEGER REFERENCES utilisateurs(id_utilisateur),
    
    -- Indicateurs
    nb_controles_total INTEGER DEFAULT 0,
    nb_conformes INTEGER DEFAULT 0,
    nb_non_conformes INTEGER DEFAULT 0,
    taux_conformite NUMERIC(5,2) DEFAULT 0,
    
    -- Non-conformités
    nb_nc_total INTEGER DEFAULT 0,
    nb_nc_mineures INTEGER DEFAULT 0,
    nb_nc_moyennes INTEGER DEFAULT 0,
    nb_nc_majeures INTEGER DEFAULT 0,
    nb_nc_critiques INTEGER DEFAULT 0,
    
    -- Coûts
    cout_total_nc NUMERIC(12,2) DEFAULT 0,
    
    -- Délais
    duree_moyenne_controle_minutes NUMERIC(10,2) DEFAULT 0,
    duree_moyenne_traitement_nc_jours NUMERIC(10,2) DEFAULT 0,
    
    -- Calculé
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : diagrammes_qualite
CREATE TABLE IF NOT EXISTS diagrammes_qualite (
    id_diagramme SERIAL PRIMARY KEY,
    type_diagramme VARCHAR(30) NOT NULL,
    -- Types: PARETO, CAUSE_EFFET, HISTOGRAMME, CONTROLE, DISPERSION
    
    -- Référence
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    id_machine INTEGER REFERENCES machines(id_machine),
    periode_debut DATE,
    periode_fin DATE,
    
    -- Données
    donnees JSONB NOT NULL, -- Données du diagramme
    configuration JSONB, -- Configuration affichage
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_controles_of ON controles_qualite(id_of);
CREATE INDEX IF NOT EXISTS idx_controles_article ON controles_qualite(id_article);
CREATE INDEX IF NOT EXISTS idx_controles_date ON controles_qualite(date_controle);
CREATE INDEX IF NOT EXISTS idx_controles_resultat ON controles_qualite(resultat_global);
CREATE INDEX IF NOT EXISTS idx_lignes_controle ON lignes_controle_qualite(id_controle);
CREATE INDEX IF NOT EXISTS idx_nc_controle ON non_conformites(id_controle);
CREATE INDEX IF NOT EXISTS idx_nc_statut ON non_conformites(statut);
CREATE INDEX IF NOT EXISTS idx_nc_gravite ON non_conformites(gravite);
CREATE INDEX IF NOT EXISTS idx_actions_nc ON actions_correctives(id_nc);
CREATE INDEX IF NOT EXISTS idx_actions_statut ON actions_correctives(statut);
CREATE INDEX IF NOT EXISTS idx_statistiques_periode ON statistiques_qualite(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_statistiques_article ON statistiques_qualite(id_article);

-- Fonction pour générer numéro contrôle
CREATE OR REPLACE FUNCTION generer_numero_controle()
RETURNS VARCHAR(50) AS $$
DECLARE
    numero VARCHAR(50);
    annee VARCHAR(4);
    compteur INTEGER;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_controle FROM '\d+$') AS INTEGER)), 0) + 1
    INTO compteur
    FROM controles_qualite
    WHERE numero_controle LIKE 'CTL-' || annee || '-%';
    numero := 'CTL-' || annee || '-' || LPAD(compteur::TEXT, 6, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

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

-- Fonction pour calculer statistiques qualité
CREATE OR REPLACE FUNCTION calculer_statistiques_qualite(
    date_debut_param DATE,
    date_fin_param DATE,
    id_article_param INTEGER DEFAULT NULL,
    id_machine_param INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    stats RECORD;
BEGIN
    -- Calculer statistiques
    INSERT INTO statistiques_qualite (
        date_debut, date_fin, type_periode,
        id_article, id_machine,
        nb_controles_total, nb_conformes, nb_non_conformes,
        taux_conformite, nb_nc_total, cout_total_nc
    )
    SELECT 
        date_debut_param,
        date_fin_param,
        'PERSONNALISE',
        id_article_param,
        id_machine_param,
        COUNT(*),
        COUNT(*) FILTER (WHERE resultat_global = 'CONFORME'),
        COUNT(*) FILTER (WHERE resultat_global = 'NON_CONFORME'),
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE resultat_global = 'CONFORME')::NUMERIC / COUNT(*)::NUMERIC) * 100
            ELSE 0
        END,
        (SELECT COUNT(*) FROM non_conformites nc
         WHERE nc.date_ouverture BETWEEN date_debut_param AND date_fin_param
         AND (id_article_param IS NULL OR nc.id_of IN (SELECT id_of FROM ordres_fabrication WHERE id_article = id_article_param))),
        COALESCE(SUM(cout_nc), 0)
    FROM controles_qualite
    WHERE date_controle BETWEEN date_debut_param AND date_fin_param
    AND (id_article_param IS NULL OR id_article = id_article_param)
    AND (id_machine_param IS NULL OR id_of IN (
        SELECT id_of FROM ordres_fabrication 
        WHERE id_machine = id_machine_param
    ))
    GROUP BY id_article_param, id_machine_param;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_controles_updated_at BEFORE UPDATE ON controles_qualite
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_nc_updated_at BEFORE UPDATE ON non_conformites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_actions_updated_at BEFORE UPDATE ON actions_correctives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Données initiales : Normes standards
INSERT INTO normes_qualite (code_norme, libelle, type_norme, actif) VALUES
('ISO_9001', 'ISO 9001 - Management de la qualité', 'ISO', TRUE),
('ISO_14001', 'ISO 14001 - Management environnemental', 'ISO', TRUE),
('OHSAS_18001', 'OHSAS 18001 - Santé et sécurité', 'ISO', TRUE),
('NORM_INTERNE', 'Normes Qualité Internes', 'INTERNE', TRUE)

ON CONFLICT (code_norme) DO NOTHING;

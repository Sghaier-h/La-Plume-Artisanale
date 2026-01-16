-- ============================================================================
-- MODULE MULTI-SOCIÉTÉ - GESTION PLUSIEURS ENTREPRISES
-- ============================================================================

-- Table : societes
CREATE TABLE IF NOT EXISTS societes (
    id_societe SERIAL PRIMARY KEY,
    code_societe VARCHAR(50) UNIQUE NOT NULL,
    raison_sociale VARCHAR(200) NOT NULL,
    nom_commercial VARCHAR(200),
    
    -- Informations légales
    forme_juridique VARCHAR(50), -- SARL, SA, EURL, etc.
    capital_social NUMERIC(12,2),
    siret VARCHAR(20),
    siren VARCHAR(20),
    rcs VARCHAR(50),
    tva_intracommunautaire VARCHAR(50),
    code_ape VARCHAR(10),
    
    -- Adresse siège
    adresse_siege TEXT,
    code_postal_siege VARCHAR(20),
    ville_siege VARCHAR(100),
    pays_siege VARCHAR(100) DEFAULT 'Tunisie',
    
    -- Coordonnées
    telephone VARCHAR(50),
    email VARCHAR(200),
    site_web VARCHAR(200),
    
    -- Logo
    logo_url VARCHAR(500),
    
    -- Configuration
    devise VARCHAR(10) DEFAULT 'TND',
    langue VARCHAR(10) DEFAULT 'fr',
    fuseau_horaire VARCHAR(50) DEFAULT 'Africa/Tunis',
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : etablissements
CREATE TABLE IF NOT EXISTS etablissements (
    id_etablissement SERIAL PRIMARY KEY,
    id_societe INTEGER NOT NULL REFERENCES societes(id_societe) ON DELETE CASCADE,
    
    code_etablissement VARCHAR(50) NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    
    -- Type
    type_etablissement VARCHAR(30),
    -- Types: SIEGE, USINE, ENTREPOT, BUREAU, MAGASIN, AUTRE
    
    -- Adresse
    adresse TEXT,
    code_postal VARCHAR(20),
    ville VARCHAR(100),
    pays VARCHAR(100) DEFAULT 'Tunisie',
    
    -- Coordonnées
    telephone VARCHAR(50),
    email VARCHAR(200),
    
    -- Responsable
    id_responsable INTEGER REFERENCES utilisateurs(id_utilisateur),
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(id_societe, code_etablissement)
);

-- Table : utilisateurs_societes
CREATE TABLE IF NOT EXISTS utilisateurs_societes (
    id_utilisateur_societe SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    id_societe INTEGER NOT NULL REFERENCES societes(id_societe) ON DELETE CASCADE,
    
    -- Rôle dans cette société
    role_societe VARCHAR(50), -- ADMIN, GESTIONNAIRE, LECTEUR
    
    -- Société par défaut
    societe_par_defaut BOOLEAN DEFAULT FALSE,
    
    -- Dates
    date_affectation DATE DEFAULT CURRENT_DATE,
    date_fin DATE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(id_utilisateur, id_societe)
);

-- Table : parametres_societe
CREATE TABLE IF NOT EXISTS parametres_societe (
    id_parametre SERIAL PRIMARY KEY,
    id_societe INTEGER NOT NULL REFERENCES societes(id_societe) ON DELETE CASCADE,
    
    -- Clé et valeur
    cle_parametre VARCHAR(100) NOT NULL,
    valeur_parametre TEXT,
    type_valeur VARCHAR(20) DEFAULT 'TEXT',
    -- Types: TEXT, NUMBER, BOOLEAN, JSON, DATE
    
    -- Description
    description TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(id_societe, cle_parametre)
);

-- Table : transferts_inter_societes
CREATE TABLE IF NOT EXISTS transferts_inter_societes (
    id_transfert SERIAL PRIMARY KEY,
    numero_transfert VARCHAR(50) UNIQUE NOT NULL,
    
    -- Sociétés
    id_societe_origine INTEGER NOT NULL REFERENCES societes(id_societe),
    id_societe_destination INTEGER NOT NULL REFERENCES societes(id_societe),
    
    -- Type transfert
    type_transfert VARCHAR(30) NOT NULL,
    -- Types: STOCK, COMMANDE, FACTURE, PRODUCTION, AUTRE
    
    -- Référence
    id_reference INTEGER, -- ID du document source
    type_reference VARCHAR(50),
    
    -- Montant
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    
    -- Dates
    date_transfert DATE NOT NULL DEFAULT CURRENT_DATE,
    date_validation DATE,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    -- Statuts: EN_ATTENTE, VALIDE, REFUSE, ANNULE
    
    -- Informations
    motif TEXT,
    notes TEXT,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : consolidations
CREATE TABLE IF NOT EXISTS consolidations (
    id_consolidation SERIAL PRIMARY KEY,
    code_consolidation VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    
    -- Période
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    
    -- Type consolidation
    type_consolidation VARCHAR(30) NOT NULL,
    -- Types: COMPTABILITE, VENTES, ACHATS, STOCK, PRODUCTION
    
    -- Sociétés incluses
    societes_incluses INTEGER[], -- IDs sociétés
    
    -- Résultats
    resultats JSONB, -- Données consolidées
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'CALCULEE',
    -- Statuts: CALCULEE, VALIDEE, EXPORTEE
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_etablissements_societe ON etablissements(id_societe);
CREATE INDEX IF NOT EXISTS idx_etablissements_actif ON etablissements(actif);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_societes_user ON utilisateurs_societes(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_societes_societe ON utilisateurs_societes(id_societe);
CREATE INDEX IF NOT EXISTS idx_parametres_societe ON parametres_societe(id_societe);
CREATE INDEX IF NOT EXISTS idx_transferts_origine ON transferts_inter_societes(id_societe_origine);
CREATE INDEX IF NOT EXISTS idx_transferts_destination ON transferts_inter_societes(id_societe_destination);
CREATE INDEX IF NOT EXISTS idx_transferts_statut ON transferts_inter_societes(statut);
CREATE INDEX IF NOT EXISTS idx_consolidations_periode ON consolidations(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_consolidations_type ON consolidations(type_consolidation);

-- Fonction pour générer numéro transfert
CREATE OR REPLACE FUNCTION generer_numero_transfert()
RETURNS VARCHAR(50) AS $$
DECLARE
    numero VARCHAR(50);
    annee VARCHAR(4);
    compteur INTEGER;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_transfert FROM '\d+$') AS INTEGER)), 0) + 1
    INTO compteur
    FROM transferts_inter_societes
    WHERE numero_transfert LIKE 'TRF-' || annee || '-%';
    numero := 'TRF-' || annee || '-' || LPAD(compteur::TEXT, 6, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour filtrer par société
CREATE OR REPLACE FUNCTION filtrer_par_societe(
    table_name TEXT,
    id_societe_param INTEGER,
    id_colonne_societe TEXT DEFAULT 'id_societe'
)
RETURNS TEXT AS $$
BEGIN
    -- Retourne une clause WHERE pour filtrer par société
    RETURN format('WHERE %I = %s', id_colonne_societe, id_societe_param);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_societes_updated_at BEFORE UPDATE ON societes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_etablissements_updated_at BEFORE UPDATE ON etablissements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_parametres_societe_updated_at BEFORE UPDATE ON parametres_societe
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_transferts_updated_at BEFORE UPDATE ON transferts_inter_societes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_consolidations_updated_at BEFORE UPDATE ON consolidations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Données initiales : Société par défaut
INSERT INTO societes (code_societe, raison_sociale, actif) VALUES
('SOC001', 'La Plume Artisanale', TRUE)

ON CONFLICT (code_societe) DO NOTHING;

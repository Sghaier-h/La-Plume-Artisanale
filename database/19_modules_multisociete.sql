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
    forme_juridique VARCHAR(50),
    capital_social NUMERIC(12,2),
    numero_siret VARCHAR(20),
    numero_tva VARCHAR(50),
    code_ape VARCHAR(10),
    rcs VARCHAR(50),
    
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
    
    -- Devise
    devise_principale VARCHAR(10) DEFAULT 'TND',
    
    -- Paramètres
    fuseau_horaire VARCHAR(50) DEFAULT 'Africa/Tunis',
    langue VARCHAR(10) DEFAULT 'fr',
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    societe_principale BOOLEAN DEFAULT FALSE, -- Une seule société principale
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : utilisateurs_societes (Many-to-Many)
CREATE TABLE IF NOT EXISTS utilisateurs_societes (
    id_utilisateur_societe SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    id_societe INTEGER NOT NULL REFERENCES societes(id_societe) ON DELETE CASCADE,
    
    -- Rôle dans cette société
    role_societe VARCHAR(50) DEFAULT 'UTILISATEUR',
    -- Rôles: ADMINISTRATEUR, DIRECTEUR, MANAGER, UTILISATEUR
    
    -- Accès
    acces_complet BOOLEAN DEFAULT FALSE,
    date_attribution TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(id_utilisateur, id_societe)
);

-- Table : parametres_societe
CREATE TABLE IF NOT EXISTS parametres_societe (
    id_parametre SERIAL PRIMARY KEY,
    id_societe INTEGER NOT NULL REFERENCES societes(id_societe) ON DELETE CASCADE,
    
    -- Clé et valeur
    cle_parametre VARCHAR(100) NOT NULL,
    valeur_parametre TEXT,
    type_parametre VARCHAR(30) DEFAULT 'TEXT',
    -- Types: TEXT, NUMBER, BOOLEAN, JSON, DATE
    
    -- Description
    description TEXT,
    
    -- Catégorie
    categorie VARCHAR(50),
    -- Catégories: COMPTABILITE, FACTURATION, STOCK, PRODUCTION, etc.
    
    UNIQUE(id_societe, cle_parametre)
);

-- Table : inter_societes_transactions
CREATE TABLE IF NOT EXISTS inter_societes_transactions (
    id_transaction SERIAL PRIMARY KEY,
    numero_transaction VARCHAR(50) UNIQUE NOT NULL,
    
    -- Sociétés
    id_societe_origine INTEGER NOT NULL REFERENCES societes(id_societe),
    id_societe_destination INTEGER NOT NULL REFERENCES societes(id_societe),
    
    -- Type transaction
    type_transaction VARCHAR(30) NOT NULL,
    -- Types: VENTE, ACHAT, TRANSFERT_STOCK, PRET, AUTRE
    
    -- Référence document
    id_document_origine INTEGER,
    type_document VARCHAR(50),
    numero_document VARCHAR(100),
    
    -- Montant
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) DEFAULT 0,
    
    -- Dates
    date_transaction DATE NOT NULL DEFAULT CURRENT_DATE,
    date_echeance DATE,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    -- Statuts: EN_ATTENTE, VALIDEE, COMPTABILISEE, ANNULEE
    
    -- Informations
    description TEXT,
    notes TEXT,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : consolidation_comptable
CREATE TABLE IF NOT EXISTS consolidation_comptable (
    id_consolidation SERIAL PRIMARY KEY,
    code_consolidation VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    
    -- Période
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    
    -- Sociétés incluses
    societes_incluses INTEGER[], -- IDs sociétés
    
    -- Totaux consolidés
    ca_consolide NUMERIC(15,2) DEFAULT 0,
    charges_consolidees NUMERIC(15,2) DEFAULT 0,
    resultat_consolide NUMERIC(15,2) DEFAULT 0,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'BROUILLON',
    -- Statuts: BROUILLON, EN_COURS, VALIDE, CLOTURE
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajouter colonne id_societe aux tables principales
-- (À faire avec ALTER TABLE pour chaque table concernée)

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_societes_actif ON societes(actif);
CREATE INDEX IF NOT EXISTS idx_societes_principale ON societes(societe_principale);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_societes_user ON utilisateurs_societes(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_societes_societe ON utilisateurs_societes(id_societe);
CREATE INDEX IF NOT EXISTS idx_parametres_societe ON parametres_societe(id_societe);
CREATE INDEX IF NOT EXISTS idx_transactions_origine ON inter_societes_transactions(id_societe_origine);
CREATE INDEX IF NOT EXISTS idx_transactions_destination ON inter_societes_transactions(id_societe_destination);
CREATE INDEX IF NOT EXISTS idx_transactions_statut ON inter_societes_transactions(statut);
CREATE INDEX IF NOT EXISTS idx_consolidation_periode ON consolidation_comptable(date_debut, date_fin);

-- Fonction pour générer numéro transaction inter-sociétés
CREATE OR REPLACE FUNCTION generer_numero_transaction_inter()
RETURNS VARCHAR(50) AS $$
DECLARE
    numero VARCHAR(50);
    annee VARCHAR(4);
    compteur INTEGER;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_transaction FROM '\d+$') AS INTEGER)), 0) + 1
    INTO compteur
    FROM inter_societes_transactions
    WHERE numero_transaction LIKE 'INT-' || annee || '-%';
    numero := 'INT-' || annee || '-' || LPAD(compteur::TEXT, 6, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Contrainte : Une seule société principale
CREATE UNIQUE INDEX idx_societe_principale_unique 
ON societes(societe_principale) 
WHERE societe_principale = TRUE;

-- Triggers
CREATE TRIGGER trigger_societes_updated_at BEFORE UPDATE ON societes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_transactions_updated_at BEFORE UPDATE ON inter_societes_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_consolidation_updated_at BEFORE UPDATE ON consolidation_comptable
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Données initiales : Société par défaut
INSERT INTO societes (code_societe, raison_sociale, nom_commercial, societe_principale, actif) VALUES
('SOC001', 'La Plume Artisanale', 'La Plume Artisanale', TRUE, TRUE)
ON CONFLICT (code_societe) DO NOTHING;

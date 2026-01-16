-- ============================================================================
-- MODULE CRM - OPPORTUNITÉS, CONTACTS, ACTIVITÉS
-- ============================================================================

-- Table : contacts (si n'existe pas)
CREATE TABLE IF NOT EXISTS contacts (
    id_contact SERIAL PRIMARY KEY,
    id_client INTEGER REFERENCES clients(id_client),
    id_fournisseur INTEGER REFERENCES fournisseurs(id_fournisseur),
    
    -- Informations
    civilite VARCHAR(10), -- M., Mme, Mlle
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100),
    fonction VARCHAR(100),
    service VARCHAR(100),
    
    -- Coordonnées
    email VARCHAR(200),
    telephone VARCHAR(50),
    mobile VARCHAR(50),
    fax VARCHAR(50),
    
    -- Adresse
    adresse TEXT,
    code_postal VARCHAR(20),
    ville VARCHAR(100),
    pays VARCHAR(100) DEFAULT 'Tunisie',
    
    -- Commercial
    id_commercial INTEGER REFERENCES utilisateurs(id_utilisateur),
    
    -- Préférences
    langue VARCHAR(10) DEFAULT 'fr',
    timezone VARCHAR(50),
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : opportunites
CREATE TABLE IF NOT EXISTS opportunites (
    id_opportunite SERIAL PRIMARY KEY,
    numero_opportunite VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    
    -- Client
    id_client INTEGER REFERENCES clients(id_client),
    id_contact INTEGER REFERENCES contacts(id_contact),
    
    -- Commercial
    id_commercial INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur),
    
    -- Pipeline
    etape VARCHAR(50) DEFAULT 'NOUVEAU',
    -- Étapes: NOUVEAU, QUALIFICATION, PROPOSITION, NEGOCIATION, CLOTURE_GAGNEE, CLOTURE_PERDUE
    
    -- Valeurs
    montant_estime NUMERIC(12,2) DEFAULT 0,
    probabilite INTEGER DEFAULT 0, -- 0-100%
    date_cloture_prevue DATE,
    date_cloture_reelle DATE,
    
    -- Source
    source_opportunite VARCHAR(50),
    -- Sources: APPEL_ENTREE, EMAIL, SITE_WEB, RESEAUX_SOCIAUX, RECOMMANDATION, AUTRE
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'ACTIVE',
    -- Statuts: ACTIVE, GAGNEE, PERDUE, ANNULEE
    motif_perte VARCHAR(200),
    
    -- Informations
    description TEXT,
    notes TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : activites_crm
CREATE TABLE IF NOT EXISTS activites_crm (
    id_activite SERIAL PRIMARY KEY,
    type_activite VARCHAR(30) NOT NULL,
    -- Types: APPEL, EMAIL, REUNION, TACHE, NOTE, RDV
    
    -- Références
    id_opportunite INTEGER REFERENCES opportunites(id_opportunite),
    id_client INTEGER REFERENCES clients(id_client),
    id_contact INTEGER REFERENCES contacts(id_contact),
    
    -- Participants
    id_createur INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur),
    participants INTEGER[], -- IDs utilisateurs
    
    -- Dates
    date_debut TIMESTAMP,
    date_fin TIMESTAMP,
    duree_minutes INTEGER,
    
    -- Sujet et contenu
    sujet VARCHAR(200),
    description TEXT,
    resultat TEXT,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'PLANIFIEE',
    -- Statuts: PLANIFIEE, EN_COURS, TERMINEE, ANNULEE
    
    -- Rappel
    rappel_actif BOOLEAN DEFAULT FALSE,
    rappel_avant_minutes INTEGER,
    rappel_envoye BOOLEAN DEFAULT FALSE,
    
    -- Localisation (pour réunions)
    lieu VARCHAR(200),
    adresse TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : campagnes
CREATE TABLE IF NOT EXISTS campagnes (
    id_campagne SERIAL PRIMARY KEY,
    nom_campagne VARCHAR(200) NOT NULL,
    type_campagne VARCHAR(30) NOT NULL,
    -- Types: EMAIL, TELEPHONE, SALON, PUBLICITE, RESEAUX_SOCIAUX, AUTRE
    
    -- Dates
    date_debut DATE,
    date_fin DATE,
    budget_estime NUMERIC(12,2) DEFAULT 0,
    budget_reel NUMERIC(12,2) DEFAULT 0,
    
    -- Objectifs
    objectif_nb_contacts INTEGER,
    objectif_nb_opportunites INTEGER,
    objectif_ca NUMERIC(12,2),
    
    -- Résultats
    nb_contacts_atteints INTEGER DEFAULT 0,
    nb_opportunites_creees INTEGER DEFAULT 0,
    ca_genere NUMERIC(12,2) DEFAULT 0,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'PLANIFIEE',
    -- Statuts: PLANIFIEE, EN_COURS, TERMINEE, ANNULEE
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : participants_campagne
CREATE TABLE IF NOT EXISTS participants_campagne (
    id_participant SERIAL PRIMARY KEY,
    id_campagne INTEGER NOT NULL REFERENCES campagnes(id_campagne) ON DELETE CASCADE,
    id_client INTEGER REFERENCES clients(id_client),
    id_contact INTEGER REFERENCES contacts(id_contact),
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    -- Statuts: EN_ATTENTE, CONTACTE, INTERESSE, NON_INTERESSE, INJOIGNABLE
    
    -- Résultats
    date_contact TIMESTAMP,
    commentaire TEXT,
    
    -- Opportunité créée
    id_opportunite INTEGER REFERENCES opportunites(id_opportunite),
    
    UNIQUE(id_campagne, COALESCE(id_client, 0), COALESCE(id_contact, 0))
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_contacts_client ON contacts(id_client);
CREATE INDEX IF NOT EXISTS idx_contacts_fournisseur ON contacts(id_fournisseur);
CREATE INDEX IF NOT EXISTS idx_contacts_commercial ON contacts(id_commercial);
CREATE INDEX IF NOT EXISTS idx_opportunites_client ON opportunites(id_client);
CREATE INDEX IF NOT EXISTS idx_opportunites_commercial ON opportunites(id_commercial);
CREATE INDEX IF NOT EXISTS idx_opportunites_etape ON opportunites(etape);
CREATE INDEX IF NOT EXISTS idx_opportunites_statut ON opportunites(statut);
CREATE INDEX IF NOT EXISTS idx_activites_opportunite ON activites_crm(id_opportunite);
CREATE INDEX IF NOT EXISTS idx_activites_client ON activites_crm(id_client);
CREATE INDEX IF NOT EXISTS idx_activites_date ON activites_crm(date_debut);
CREATE INDEX IF NOT EXISTS idx_campagnes_statut ON campagnes(statut);
CREATE INDEX IF NOT EXISTS idx_participants_campagne ON participants_campagne(id_campagne);

-- Fonction pour générer numéro opportunité
CREATE OR REPLACE FUNCTION generer_numero_opportunite()
RETURNS VARCHAR(50) AS $$
DECLARE
    numero VARCHAR(50);
    annee VARCHAR(4);
    compteur INTEGER;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_opportunite FROM '\d+$') AS INTEGER)), 0) + 1
    INTO compteur
    FROM opportunites
    WHERE numero_opportunite LIKE 'OPP-' || annee || '-%';
    numero := 'OPP-' || annee || '-' || LPAD(compteur::TEXT, 6, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_opportunites_updated_at BEFORE UPDATE ON opportunites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_activites_updated_at BEFORE UPDATE ON activites_crm
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_campagnes_updated_at BEFORE UPDATE ON campagnes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

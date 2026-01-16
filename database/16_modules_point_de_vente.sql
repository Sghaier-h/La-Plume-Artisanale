-- ============================================================================
-- MODULE POINT DE VENTE - CAISSE, SESSIONS, VENTES
-- ============================================================================

-- Table : caisses
CREATE TABLE IF NOT EXISTS caisses (
    id_caisse SERIAL PRIMARY KEY,
    code_caisse VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    id_entrepot INTEGER REFERENCES entrepots(id_entrepot),
    
    -- Configuration
    montant_fond_de_caisse NUMERIC(10,2) DEFAULT 0,
    devise VARCHAR(10) DEFAULT 'TND',
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    en_session BOOLEAN DEFAULT FALSE,
    
    -- Informations
    localisation VARCHAR(200),
    notes TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : sessions_caisse
CREATE TABLE IF NOT EXISTS sessions_caisse (
    id_session SERIAL PRIMARY KEY,
    id_caisse INTEGER NOT NULL REFERENCES caisses(id_caisse),
    id_caissier INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur),
    
    -- Dates
    date_ouverture TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_fermeture TIMESTAMP,
    
    -- Fonds
    fond_de_caisse_ouverture NUMERIC(10,2) NOT NULL,
    fond_de_caisse_fermeture NUMERIC(10,2),
    total_encaissements NUMERIC(12,2) DEFAULT 0,
    total_remboursements NUMERIC(12,2) DEFAULT 0,
    
    -- Totaux par mode paiement
    total_especes NUMERIC(12,2) DEFAULT 0,
    total_cheques NUMERIC(12,2) DEFAULT 0,
    total_cb NUMERIC(12,2) DEFAULT 0,
    total_virement NUMERIC(12,2) DEFAULT 0,
    total_autres NUMERIC(12,2) DEFAULT 0,
    
    -- Écarts
    ecart_theorique NUMERIC(10,2) DEFAULT 0,
    ecart_reel NUMERIC(10,2) DEFAULT 0,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'OUVERTE',
    -- Statuts: OUVERTE, FERMEE, VERIFIEE
    
    -- Informations
    notes_ouverture TEXT,
    notes_fermeture TEXT,
    
    -- Métadonnées
    validated_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    validated_at TIMESTAMP
);

-- Table : ventes_caisse
CREATE TABLE IF NOT EXISTS ventes_caisse (
    id_vente SERIAL PRIMARY KEY,
    id_session INTEGER NOT NULL REFERENCES sessions_caisse(id_session),
    numero_ticket VARCHAR(50) UNIQUE NOT NULL,
    id_client INTEGER REFERENCES clients(id_client),
    
    -- Dates
    date_vente TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Totaux
    montant_ht NUMERIC(12,2) DEFAULT 0,
    montant_tva NUMERIC(12,2) DEFAULT 0,
    montant_ttc NUMERIC(12,2) NOT NULL,
    remise_globale NUMERIC(5,2) DEFAULT 0,
    montant_remise NUMERIC(12,2) DEFAULT 0,
    
    -- Paiement
    montant_recu NUMERIC(12,2),
    montant_rendu NUMERIC(12,2),
    mode_paiement VARCHAR(30) NOT NULL,
    -- Modes: ESPECES, CB, CHEQUE, AUTRE
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'VALIDEE',
    -- Statuts: BROUILLON, VALIDEE, ANNULEE, REMBOURSEE
    
    -- Informations
    notes TEXT,
    numero_carte VARCHAR(50), -- Pour CB
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : lignes_vente_caisse
CREATE TABLE IF NOT EXISTS lignes_vente_caisse (
    id_ligne SERIAL PRIMARY KEY,
    id_vente INTEGER NOT NULL REFERENCES ventes_caisse(id_vente) ON DELETE CASCADE,
    id_article INTEGER REFERENCES articles_catalogue(id_article),
    designation VARCHAR(200) NOT NULL,
    
    -- Quantités et prix
    quantite NUMERIC(10,3) NOT NULL,
    prix_unitaire_ht NUMERIC(10,2) NOT NULL,
    taux_tva NUMERIC(5,2) DEFAULT 20,
    remise NUMERIC(5,2) DEFAULT 0,
    
    -- Totaux
    montant_ht NUMERIC(12,2) NOT NULL,
    montant_tva NUMERIC(12,2) NOT NULL,
    montant_ttc NUMERIC(12,2) NOT NULL,
    
    ordre INTEGER DEFAULT 0
);

-- Table : remboursements_caisse
CREATE TABLE IF NOT EXISTS remboursements_caisse (
    id_remboursement SERIAL PRIMARY KEY,
    id_session INTEGER NOT NULL REFERENCES sessions_caisse(id_session),
    id_vente_origine INTEGER REFERENCES ventes_caisse(id_vente),
    numero_remboursement VARCHAR(50) UNIQUE NOT NULL,
    
    -- Dates
    date_remboursement TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Montants
    montant_rembourse NUMERIC(12,2) NOT NULL,
    mode_remboursement VARCHAR(30) NOT NULL,
    -- Modes: ESPECES, CB, CHEQUE, CREDIT
    
    -- Motif
    motif TEXT NOT NULL,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'EFFECTUE',
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_caisses_entrepot ON caisses(id_entrepot);
CREATE INDEX IF NOT EXISTS idx_caisses_actif ON caisses(actif);
CREATE INDEX IF NOT EXISTS idx_sessions_caisse ON sessions_caisse(id_caisse);
CREATE INDEX IF NOT EXISTS idx_sessions_caissier ON sessions_caisse(id_caissier);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions_caisse(date_ouverture);
CREATE INDEX IF NOT EXISTS idx_sessions_statut ON sessions_caisse(statut);
CREATE INDEX IF NOT EXISTS idx_ventes_session ON ventes_caisse(id_session);
CREATE INDEX IF NOT EXISTS idx_ventes_client ON ventes_caisse(id_client);
CREATE INDEX IF NOT EXISTS idx_ventes_date ON ventes_caisse(date_vente);
CREATE INDEX IF NOT EXISTS idx_lignes_vente ON lignes_vente_caisse(id_vente);
CREATE INDEX IF NOT EXISTS idx_remboursements_session ON remboursements_caisse(id_session);
CREATE INDEX IF NOT EXISTS idx_remboursements_vente ON remboursements_caisse(id_vente_origine);

-- Fonction pour générer numéro ticket
CREATE OR REPLACE FUNCTION generer_numero_ticket(id_caisse_param INTEGER)
RETURNS VARCHAR(50) AS $$
DECLARE
    numero VARCHAR(50);
    code_caisse VARCHAR(50);
    annee VARCHAR(4);
    jour VARCHAR(3); -- Jour de l'année (001-366)
    compteur INTEGER;
BEGIN
    -- Récupérer code caisse
    SELECT code_caisse INTO code_caisse FROM caisses WHERE id_caisse = id_caisse_param;
    
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    jour := TO_CHAR(CURRENT_DATE, 'DDD');
    
    -- Compter tickets du jour pour cette caisse
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_ticket FROM '\d+$') AS INTEGER)), 0) + 1
    INTO compteur
    FROM ventes_caisse v
    JOIN sessions_caisse s ON v.id_session = s.id_session
    WHERE s.id_caisse = id_caisse_param
    AND DATE(v.date_vente) = CURRENT_DATE;
    
    numero := COALESCE(code_caisse, 'CAISSE') || '-' || annee || jour || '-' || LPAD(compteur::TEXT, 6, '0');
    RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer total session
CREATE OR REPLACE FUNCTION calculer_total_session(id_session_param INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    total NUMERIC(12,2);
BEGIN
    SELECT COALESCE(SUM(montant_ttc), 0)
    INTO total
    FROM ventes_caisse
    WHERE id_session = id_session_param
    AND statut = 'VALIDEE';
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_caisses_updated_at BEFORE UPDATE ON caisses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger pour mettre à jour total session après vente
CREATE OR REPLACE FUNCTION update_total_session()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sessions_caisse
    SET total_encaissements = calculer_total_session(NEW.id_session),
        updated_at = CURRENT_TIMESTAMP
    WHERE id_session = NEW.id_session;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_total_session
AFTER INSERT OR UPDATE ON ventes_caisse
FOR EACH ROW
WHEN (NEW.statut = 'VALIDEE')
EXECUTE FUNCTION update_total_session();

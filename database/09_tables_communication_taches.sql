-- ============================================================================
-- TABLES POUR COMMUNICATION ET ATTRIBUTION DES TÂCHES
-- ============================================================================

-- Extension table users
ALTER TABLE utilisateurs 
ADD COLUMN IF NOT EXISTS poste_travail VARCHAR(50),
ADD COLUMN IF NOT EXISTS machine_assignee VARCHAR(20),
ADD COLUMN IF NOT EXISTS device_token TEXT;

-- Table Tâches
CREATE TABLE IF NOT EXISTS taches (
    id_tache SERIAL PRIMARY KEY,
    
    -- Référence
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    type_tache VARCHAR(50) NOT NULL,
    -- Types: PREPARATION_MP, TISSAGE, COUPE, CONTROLE_QUALITE, FINITION, EXPEDITION
    
    -- Attribution
    assigne_a INTEGER REFERENCES utilisateurs(id_utilisateur),
    assigne_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    id_machine INTEGER REFERENCES machines(id_machine),
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    -- Statuts: EN_ATTENTE, ASSIGNEE, EN_COURS, EN_PAUSE, TERMINEE, ANNULEE
    
    -- Priorité
    priorite INTEGER DEFAULT 2,
    -- 1=Très urgente, 2=Urgente, 3=Normale, 4=Basse
    
    -- Dates
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_assignation TIMESTAMP,
    date_debut TIMESTAMP,
    date_fin TIMESTAMP,
    date_limite TIMESTAMP,
    
    -- Détails
    instructions TEXT,
    quantite_demandee INTEGER,
    quantite_realisee INTEGER DEFAULT 0,
    
    -- Dépendances
    tache_precedente_id INTEGER REFERENCES taches(id_tache),
    notifier_suivant BOOLEAN DEFAULT TRUE,
    
    -- Méta
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id_notification SERIAL PRIMARY KEY,
    
    -- Destinataire
    id_user INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur),
    
    -- Contenu
    type_notification VARCHAR(50) NOT NULL,
    -- Types: NOUVELLE_TACHE, TACHE_URGENTE, TACHE_TERMINEE_PRECEDENT, 
    --        RAPPEL_DELAI, ALERTE_RETARD, MESSAGE_RESPONSABLE
    
    titre VARCHAR(200) NOT NULL,
    message TEXT,
    
    -- Référence
    id_tache INTEGER REFERENCES taches(id_tache),
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    
    -- État
    lue BOOLEAN DEFAULT FALSE,
    date_lecture TIMESTAMP,
    
    -- Priorité affichage
    priorite INTEGER DEFAULT 2,
    
    -- Méta
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Messages Postes
CREATE TABLE IF NOT EXISTS messages_postes (
    id_message SERIAL PRIMARY KEY,
    
    -- Émetteur
    expediteur_id INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur),
    
    -- Destinataire (peut être user ou poste)
    destinataire_id INTEGER REFERENCES utilisateurs(id_utilisateur),
    destinataire_poste VARCHAR(50), -- Si message à tout un poste
    
    -- Contenu
    sujet VARCHAR(200),
    message TEXT NOT NULL,
    
    -- Référence optionnelle
    id_of INTEGER REFERENCES ordres_fabrication(id_of),
    
    -- État
    lu BOOLEAN DEFAULT FALSE,
    date_lecture TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_taches_assigne ON taches(assigne_a);
CREATE INDEX IF NOT EXISTS idx_taches_of ON taches(id_of);
CREATE INDEX IF NOT EXISTS idx_taches_statut ON taches(statut);
CREATE INDEX IF NOT EXISTS idx_taches_type ON taches(type_tache);
CREATE INDEX IF NOT EXISTS idx_taches_machine ON taches(id_machine);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(id_user, lue);
CREATE INDEX IF NOT EXISTS idx_notifications_tache ON notifications(id_tache);
CREATE INDEX IF NOT EXISTS idx_messages_destinataire ON messages_postes(destinataire_id, lu);
CREATE INDEX IF NOT EXISTS idx_messages_poste ON messages_postes(destinataire_poste, lu);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_taches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_taches_updated_at
    BEFORE UPDATE ON taches
    FOR EACH ROW
    EXECUTE FUNCTION update_taches_updated_at();

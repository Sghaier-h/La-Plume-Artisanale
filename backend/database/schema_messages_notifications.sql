-- ============================================================================
-- SYSTÈME DE MESSAGES ET NOTIFICATIONS INTERNES - COMMUNICATION OPÉRATEURS
-- ============================================================================

-- Table : messages_postes - Messages entre opérateurs/postes de travail
CREATE TABLE IF NOT EXISTS messages_postes (
    id_message SERIAL PRIMARY KEY,
    
    -- Expéditeur et destinataire
    expediteur_id INTEGER REFERENCES utilisateurs(id_utilisateur),
    destinataire_id INTEGER REFERENCES utilisateurs(id_utilisateur),
    destinataire_poste VARCHAR(50), -- Poste de travail (TISSEUR, MAGASINIER, etc.)
    
    -- Contenu du message
    sujet VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Lien optionnel avec un OF
    id_of INTEGER, -- Peut être lié à un ordre de fabrication
    
    -- Priorité et statut
    urgent BOOLEAN DEFAULT FALSE,
    lu BOOLEAN DEFAULT FALSE,
    date_lecture TIMESTAMP,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_expediteur ON messages_postes(expediteur_id);
CREATE INDEX IF NOT EXISTS idx_messages_destinataire ON messages_postes(destinataire_id);
CREATE INDEX IF NOT EXISTS idx_messages_poste ON messages_postes(destinataire_poste);
CREATE INDEX IF NOT EXISTS idx_messages_lu ON messages_postes(lu);
CREATE INDEX IF NOT EXISTS idx_messages_urgent ON messages_postes(urgent);
CREATE INDEX IF NOT EXISTS idx_messages_of ON messages_postes(id_of);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages_postes(created_at DESC);

COMMENT ON TABLE messages_postes IS 'Messages internes entre opérateurs et postes de travail';
COMMENT ON COLUMN messages_postes.destinataire_poste IS 'Poste de travail destinataire: TISSEUR, MAGASINIER, COUPEUR, MECANICIEN, CHEF_ATELIER, CHEF_PRODUCTION, etc.';
COMMENT ON COLUMN messages_postes.urgent IS 'Indicateur de message urgent nécessitant une attention immédiate';

-- Table : notifications - Notifications système pour les utilisateurs
CREATE TABLE IF NOT EXISTS notifications (
    id_notification SERIAL PRIMARY KEY,
    
    -- Destinataire
    id_user INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    
    -- Type de notification
    type_notification VARCHAR(50) NOT NULL,
    -- Types: NOUVELLE_TACHE, ALERTE_STOCK, RETARD_OF, MAINTENANCE, QUALITE, etc.
    
    -- Contenu
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Lien optionnel vers une entité (OF, article, machine, etc.)
    id_entite INTEGER, -- ID de l'entité concernée
    type_entite VARCHAR(50), -- Type d'entité: OF, ARTICLE, MACHINE, etc.
    
    -- Priorité et statut
    priorite INTEGER DEFAULT 3, -- 1=URGENT, 2=IMPORTANT, 3=NORMAL
    lue BOOLEAN DEFAULT FALSE,
    date_lecture TIMESTAMP,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_url VARCHAR(255), -- URL vers la page concernée (optionnel)
    
    -- Index pour performances
    INDEX idx_notifications_user (id_user),
    INDEX idx_notifications_lue (lue),
    INDEX idx_notifications_priorite (priorite),
    INDEX idx_notifications_created (created_at DESC),
    INDEX idx_notifications_user_lue (id_user, lue)
);

-- Corriger la syntaxe PostgreSQL pour les index
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(id_user);
CREATE INDEX IF NOT EXISTS idx_notifications_lue ON notifications(lue);
CREATE INDEX IF NOT EXISTS idx_notifications_priorite ON notifications(priorite);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_lue ON notifications(id_user, lue);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type_notification);

COMMENT ON TABLE notifications IS 'Notifications système pour informer les utilisateurs d''événements importants';
COMMENT ON COLUMN notifications.priorite IS 'Priorité: 1=URGENT, 2=IMPORTANT, 3=NORMAL';
COMMENT ON COLUMN notifications.type_notification IS 'Type: NOUVELLE_TACHE, ALERTE_STOCK, RETARD_OF, MAINTENANCE, QUALITE, etc.';

-- Table : alertes - Alertes système automatiques
CREATE TABLE IF NOT EXISTS alertes (
    id_alerte SERIAL PRIMARY KEY,
    
    -- Type d'alerte
    type_alerte VARCHAR(50) NOT NULL,
    -- Types: STOCK_CRITIQUE, RETARD_OF, MACHINE_PANNE, QUALITE_NON_CONFORME, etc.
    
    -- Contenu
    titre VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Lien vers l'entité concernée
    id_entite INTEGER,
    type_entite VARCHAR(50),
    
    -- Destinataires
    destinataires_roles VARCHAR(50)[], -- Rôles concernés
    destinataires_posts VARCHAR(50)[], -- Postes de travail concernés
    destinataire_id INTEGER REFERENCES utilisateurs(id_utilisateur), -- Destinataire spécifique
    
    -- Priorité et statut
    priorite INTEGER DEFAULT 2, -- 1=CRITIQUE, 2=IMPORTANT, 3=NORMAL
    active BOOLEAN DEFAULT TRUE,
    date_resolution TIMESTAMP,
    resolue_par INTEGER REFERENCES utilisateurs(id_utilisateur),
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alertes_type ON alertes(type_alerte);
CREATE INDEX IF NOT EXISTS idx_alertes_active ON alertes(active);
CREATE INDEX IF NOT EXISTS idx_alertes_priorite ON alertes(priorite);
CREATE INDEX IF NOT EXISTS idx_alertes_created ON alertes(created_at DESC);

COMMENT ON TABLE alertes IS 'Alertes système automatiques pour événements critiques';
COMMENT ON COLUMN alertes.priorite IS 'Priorité: 1=CRITIQUE, 2=IMPORTANT, 3=NORMAL';
COMMENT ON COLUMN alertes.active IS 'Indique si l''alerte est toujours active';

-- Fonction pour créer automatiquement une notification depuis une alerte
CREATE OR REPLACE FUNCTION creer_notification_depuis_alerte()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer une notification pour chaque destinataire
    IF NEW.destinataire_id IS NOT NULL THEN
        INSERT INTO notifications (id_user, type_notification, titre, message, priorite, id_entite, type_entite)
        VALUES (NEW.destinataire_id, 'ALERTE', NEW.titre, NEW.message, NEW.priorite, NEW.id_entite, NEW.type_entite);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer automatiquement des notifications depuis les alertes
DROP TRIGGER IF EXISTS trigger_creer_notification_alerte ON alertes;
CREATE TRIGGER trigger_creer_notification_alerte
AFTER INSERT ON alertes
FOR EACH ROW
WHEN (NEW.destinataire_id IS NOT NULL)
EXECUTE FUNCTION creer_notification_depuis_alerte();

-- Vue pour les messages avec informations utilisateur
CREATE OR REPLACE VIEW v_messages_postes AS
SELECT 
    m.*,
    u_exp.nom as expediteur_nom,
    u_exp.prenom as expediteur_prenom,
    u_exp.email as expediteur_email,
    u_dest.nom as destinataire_nom,
    u_dest.prenom as destinataire_prenom,
    of.numero_of
FROM messages_postes m
LEFT JOIN utilisateurs u_exp ON m.expediteur_id = u_exp.id_utilisateur
LEFT JOIN utilisateurs u_dest ON m.destinataire_id = u_dest.id_utilisateur
LEFT JOIN of ON m.id_of = of.id_of;

COMMENT ON VIEW v_messages_postes IS 'Vue enrichie des messages avec informations utilisateurs et OF';

-- Vue pour les notifications urgentes
CREATE OR REPLACE VIEW v_notifications_urgentes AS
SELECT *
FROM notifications
WHERE priorite = 1 AND lue = FALSE
ORDER BY created_at DESC;

COMMENT ON VIEW v_notifications_urgentes IS 'Vue des notifications urgentes non lues';

-- Vue pour les alertes actives
CREATE OR REPLACE VIEW v_alertes_actives AS
SELECT 
    a.*,
    u_res.nom as resolue_par_nom
FROM alertes a
LEFT JOIN utilisateurs u_res ON a.resolue_par = u_res.id_utilisateur
WHERE a.active = TRUE
ORDER BY a.priorite ASC, a.created_at DESC;

COMMENT ON VIEW v_alertes_actives IS 'Vue des alertes actives triées par priorité';

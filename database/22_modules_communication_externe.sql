-- ============================================================================
-- MODULE COMMUNICATION EXTERNE - WHATSAPP, EMAIL, SMS, NOTIFICATIONS
-- ============================================================================

-- Table : canaux_communication
CREATE TABLE IF NOT EXISTS canaux_communication (
    id_canal SERIAL PRIMARY KEY,
    code_canal VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    type_canal VARCHAR(30) NOT NULL,
    -- Types: WHATSAPP, EMAIL, SMS, TELEGRAM, SLACK, AUTRE
    
    -- Configuration
    configuration JSONB NOT NULL, -- API keys, tokens, endpoints
    -- Exemple: {"api_key": "...", "api_url": "...", "phone_number": "..."}
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    test_mode BOOLEAN DEFAULT FALSE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : messages_externes
CREATE TABLE IF NOT EXISTS messages_externes (
    id_message SERIAL PRIMARY KEY,
    id_canal INTEGER NOT NULL REFERENCES canaux_communication(id_canal),
    
    -- Destinataire
    destinataire VARCHAR(200) NOT NULL, -- Numéro, email, etc.
    type_destinataire VARCHAR(30),
    -- Types: CLIENT, FOURNISSEUR, CONTACT, NUMERO, EMAIL
    
    -- Référence
    id_client INTEGER REFERENCES clients(id_client),
    id_fournisseur INTEGER REFERENCES fournisseurs(id_fournisseur),
    id_contact INTEGER REFERENCES contacts(id_contact),
    
    -- Contenu
    type_message VARCHAR(30) NOT NULL,
    -- Types: DEVIS, FACTURE, RAPPEL, NOTIFICATION, ALERTE, AUTRE
    
    -- Référence document
    id_document INTEGER, -- ID devis, facture, etc.
    type_document VARCHAR(50),
    
    -- Message
    sujet VARCHAR(200),
    message_text TEXT,
    message_html TEXT,
    
    -- Pièces jointes
    pieces_jointes JSONB, -- URLs ou IDs fichiers
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    -- Statuts: EN_ATTENTE, ENVOYE, DELIVRE, LU, ERREUR, ANNULE
    
    -- Résultats
    date_envoi TIMESTAMP,
    date_delivrance TIMESTAMP,
    date_lecture TIMESTAMP,
    erreur_message TEXT,
    id_message_externe VARCHAR(100), -- ID retourné par l'API
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : templates_messages
CREATE TABLE IF NOT EXISTS templates_messages (
    id_template SERIAL PRIMARY KEY,
    code_template VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    
    -- Canal
    id_canal INTEGER REFERENCES canaux_communication(id_canal),
    type_canal VARCHAR(30),
    
    -- Type message
    type_message VARCHAR(30) NOT NULL,
    
    -- Contenu
    sujet_template TEXT,
    message_template TEXT NOT NULL,
    message_html_template TEXT,
    
    -- Variables
    variables_disponibles JSONB, -- Liste des variables disponibles
    -- Exemple: ["{nom_client}", "{montant}", "{date_echeance}"]
    
    -- Langue
    langue VARCHAR(10) DEFAULT 'fr',
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : conversations
CREATE TABLE IF NOT EXISTS conversations (
    id_conversation SERIAL PRIMARY KEY,
    id_canal INTEGER NOT NULL REFERENCES canaux_communication(id_canal),
    
    -- Participants
    numero_whatsapp VARCHAR(50),
    email VARCHAR(200),
    id_client INTEGER REFERENCES clients(id_client),
    id_contact INTEGER REFERENCES contacts(id_contact),
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'ACTIVE',
    -- Statuts: ACTIVE, FERMEE, ARCHIVEE
    
    -- Dernier message
    date_dernier_message TIMESTAMP,
    dernier_message_preview TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : messages_conversation
CREATE TABLE IF NOT EXISTS messages_conversation (
    id_message SERIAL PRIMARY KEY,
    id_conversation INTEGER NOT NULL REFERENCES conversations(id_conversation) ON DELETE CASCADE,
    
    -- Direction
    direction VARCHAR(10) NOT NULL,
    -- Directions: ENVOYE, RECU
    
    -- Contenu
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'TEXT',
    -- Types: TEXT, IMAGE, DOCUMENT, AUDIO, VIDEO, LOCATION
    
    -- Pièces jointes
    pieces_jointes JSONB,
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'ENVOYE',
    -- Statuts: ENVOYE, DELIVRE, LU, ERREUR
    
    -- Dates
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_delivrance TIMESTAMP,
    date_lecture TIMESTAMP,
    
    -- ID externe
    id_message_externe VARCHAR(100),
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : webhooks_communication
CREATE TABLE IF NOT EXISTS webhooks_communication (
    id_webhook SERIAL PRIMARY KEY,
    id_canal INTEGER NOT NULL REFERENCES canaux_communication(id_canal),
    
    -- URL
    url_webhook VARCHAR(500) NOT NULL,
    secret_token VARCHAR(255),
    
    -- Événements
    evenements JSONB, -- Liste événements à écouter
    -- Exemple: ["message.received", "message.delivered", "message.read"]
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : logs_communication
CREATE TABLE IF NOT EXISTS logs_communication (
    id_log SERIAL PRIMARY KEY,
    id_canal INTEGER REFERENCES canaux_communication(id_canal),
    id_message INTEGER REFERENCES messages_externes(id_message),
    
    -- Type action
    type_action VARCHAR(50) NOT NULL,
    -- Actions: ENVOI, RECEPTION, ERREUR, WEBHOOK, AUTRE
    
    -- Détails
    details JSONB,
    message_erreur TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_messages_canal ON messages_externes(id_canal);
CREATE INDEX IF NOT EXISTS idx_messages_statut ON messages_externes(statut);
CREATE INDEX IF NOT EXISTS idx_messages_date_envoi ON messages_externes(date_envoi);
CREATE INDEX IF NOT EXISTS idx_messages_client ON messages_externes(id_client);
CREATE INDEX IF NOT EXISTS idx_templates_canal ON templates_messages(id_canal);
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates_messages(type_message);
CREATE INDEX IF NOT EXISTS idx_conversations_canal ON conversations(id_canal);
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(id_client);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages_conversation(id_conversation);
CREATE INDEX IF NOT EXISTS idx_messages_conv_date ON messages_conversation(date_envoi);
CREATE INDEX IF NOT EXISTS idx_webhooks_canal ON webhooks_communication(id_canal);
CREATE INDEX IF NOT EXISTS idx_logs_canal ON logs_communication(id_canal);
CREATE INDEX IF NOT EXISTS idx_logs_date ON logs_communication(created_at);

-- Fonction pour envoyer message WhatsApp
CREATE OR REPLACE FUNCTION envoyer_message_whatsapp(
    destinataire_param VARCHAR,
    message_text_param TEXT,
    id_document_param INTEGER DEFAULT NULL,
    type_document_param VARCHAR DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    id_canal_whatsapp INTEGER;
    id_message_creer INTEGER;
BEGIN
    -- Trouver canal WhatsApp actif
    SELECT id_canal INTO id_canal_whatsapp
    FROM canaux_communication
    WHERE type_canal = 'WHATSAPP' AND actif = TRUE
    LIMIT 1;
    
    IF id_canal_whatsapp IS NULL THEN
        RAISE EXCEPTION 'Aucun canal WhatsApp actif trouvé';
    END IF;
    
    -- Créer message
    INSERT INTO messages_externes (
        id_canal, destinataire, type_message,
        message_text, id_document, type_document,
        statut
    ) VALUES (
        id_canal_whatsapp, destinataire_param, 'NOTIFICATION',
        message_text_param, id_document_param, type_document_param,
        'EN_ATTENTE'
    ) RETURNING id_message INTO id_message_creer;
    
    -- TODO: Appel API WhatsApp (Twilio, WhatsApp Business API, etc.)
    
    RETURN id_message_creer;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour traiter webhook
CREATE OR REPLACE FUNCTION traiter_webhook_communication(
    id_canal_param INTEGER,
    donnees_webhook JSONB
)
RETURNS VOID AS $$
BEGIN
    -- Traiter les données reçues du webhook
    -- Créer messages reçus, mettre à jour statuts, etc.
    
    -- Exemple: Mettre à jour statut message
    IF donnees_webhook->>'event' = 'message.delivered' THEN
        UPDATE messages_externes
        SET statut = 'DELIVRE',
            date_delivrance = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id_message_externe = donnees_webhook->>'message_id';
    END IF;
    
    -- Logger
    INSERT INTO logs_communication (id_canal, type_action, details)
    VALUES (id_canal_param, 'WEBHOOK', donnees_webhook);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_canaux_updated_at BEFORE UPDATE ON canaux_communication
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_messages_updated_at BEFORE UPDATE ON messages_externes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_templates_updated_at BEFORE UPDATE ON templates_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_webhooks_updated_at BEFORE UPDATE ON webhooks_communication
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Données initiales : Canaux standards
INSERT INTO canaux_communication (code_canal, libelle, type_canal, configuration, actif) VALUES
('WHATSAPP_TWILIO', 'WhatsApp via Twilio', 'WHATSAPP', '{"provider": "twilio", "test_mode": true}', TRUE),
('EMAIL_SMTP', 'Email SMTP', 'EMAIL', '{"provider": "smtp", "host": "smtp.gmail.com", "port": 587}', TRUE),
('SMS_TWILIO', 'SMS via Twilio', 'SMS', '{"provider": "twilio", "test_mode": true}', TRUE)

ON CONFLICT (code_canal) DO NOTHING;

-- Templates messages standards
INSERT INTO templates_messages (code_template, libelle, type_canal, type_message, message_template, variables_disponibles, actif) VALUES
('DEVIS_WHATSAPP', 'Envoi Devis WhatsApp', 'WHATSAPP', 'DEVIS', 
 'Bonjour {nom_client}, votre devis {numero_devis} d''un montant de {montant_ttc} TND est prêt. Consultez-le ici: {lien_devis}',
 '["nom_client", "numero_devis", "montant_ttc", "lien_devis"]', TRUE),
('FACTURE_WHATSAPP', 'Envoi Facture WhatsApp', 'WHATSAPP', 'FACTURE',
 'Bonjour {nom_client}, votre facture {numero_facture} d''un montant de {montant_ttc} TND est disponible. Échéance: {date_echeance}',
 '["nom_client", "numero_facture", "montant_ttc", "date_echeance"]', TRUE),
('RAPPEL_PAIEMENT', 'Rappel Paiement', 'WHATSAPP', 'RAPPEL',
 'Bonjour {nom_client}, rappel: votre facture {numero_facture} d''un montant de {montant_restant} TND est due depuis le {date_echeance}.',
 '["nom_client", "numero_facture", "montant_restant", "date_echeance"]', TRUE)

ON CONFLICT (code_template) DO NOTHING;

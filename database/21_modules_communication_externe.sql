-- ============================================================================
-- MODULE COMMUNICATION EXTERNE - WHATSAPP, EMAIL, SMS
-- ============================================================================

-- Table : canaux_communication
CREATE TABLE IF NOT EXISTS canaux_communication (
    id_canal SERIAL PRIMARY KEY,
    code_canal VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    type_canal VARCHAR(30) NOT NULL,
    -- Types: WHATSAPP, EMAIL, SMS, TELEPHONE, AUTRE
    
    -- Configuration
    configuration JSONB NOT NULL, -- Configuration spécifique au canal
    -- Exemple WhatsApp: {api_key, api_secret, numero, webhook_url}
    -- Exemple Email: {smtp_host, smtp_port, username, password, from_email}
    -- Exemple SMS: {api_provider, api_key, sender_id}
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    test_mode BOOLEAN DEFAULT FALSE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : messages_communication
CREATE TABLE IF NOT EXISTS messages_communication (
    id_message SERIAL PRIMARY KEY,
    id_canal INTEGER NOT NULL REFERENCES canaux_communication(id_canal),
    
    -- Destinataire
    destinataire_type VARCHAR(30) NOT NULL,
    -- Types: CLIENT, FOURNISSEUR, CONTACT, UTILISATEUR
    id_destinataire INTEGER,
    numero_telephone VARCHAR(50),
    email VARCHAR(200),
    
    -- Contenu
    type_message VARCHAR(30) NOT NULL,
    -- Types: TEXTE, TEMPLATE, DOCUMENT, NOTIFICATION
    sujet VARCHAR(200),
    contenu TEXT NOT NULL,
    template_id VARCHAR(100), -- Pour templates WhatsApp
    
    -- Documents
    pieces_jointes TEXT[], -- URLs fichiers
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'EN_ATTENTE',
    -- Statuts: EN_ATTENTE, ENVOYE, DELIVRE, LU, ERREUR
    
    -- Référence document
    id_document INTEGER,
    type_document VARCHAR(50),
    -- Types: DEVIS, FACTURE, COMMANDE, OF, etc.
    
    -- Dates
    date_envoi_prevue TIMESTAMP,
    date_envoi_reelle TIMESTAMP,
    date_lecture TIMESTAMP,
    
    -- Résultat
    resultat_envoi JSONB, -- Réponse API, erreurs, etc.
    erreur_message TEXT,
    
    -- Métadonnées
    created_by INTEGER REFERENCES utilisateurs(id_utilisateur),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : templates_communication
CREATE TABLE IF NOT EXISTS templates_communication (
    id_template SERIAL PRIMARY KEY,
    code_template VARCHAR(50) UNIQUE NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    id_canal INTEGER NOT NULL REFERENCES canaux_communication(id_canal),
    
    -- Type
    type_template VARCHAR(30) NOT NULL,
    -- Types: DEVIS, FACTURE, COMMANDE, RAPPEL, NOTIFICATION, AUTRE
    
    -- Contenu
    sujet_template VARCHAR(200),
    contenu_template TEXT NOT NULL,
    variables_template TEXT[], -- Liste variables disponibles: {nom_client}, {montant}, etc.
    
    -- Langue
    langue VARCHAR(10) DEFAULT 'fr',
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    approuve BOOLEAN DEFAULT FALSE, -- Pour WhatsApp Business API
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : conversations
CREATE TABLE IF NOT EXISTS conversations (
    id_conversation SERIAL PRIMARY KEY,
    id_canal INTEGER NOT NULL REFERENCES canaux_communication(id_canal),
    
    -- Participants
    id_contact INTEGER REFERENCES contacts(id_contact),
    id_client INTEGER REFERENCES clients(id_client),
    id_fournisseur INTEGER REFERENCES fournisseurs(id_fournisseur),
    numero_telephone VARCHAR(50),
    email VARCHAR(200),
    
    -- Statut
    statut VARCHAR(30) DEFAULT 'OUVERTE',
    -- Statuts: OUVERTE, EN_ATTENTE, FERMEE, ARCHIVEE
    
    -- Métadonnées
    date_dernier_message TIMESTAMP,
    nombre_messages INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : messages_conversation
CREATE TABLE IF NOT EXISTS messages_conversation (
    id_message_conv SERIAL PRIMARY KEY,
    id_conversation INTEGER NOT NULL REFERENCES conversations(id_conversation) ON DELETE CASCADE,
    
    -- Direction
    direction VARCHAR(10) NOT NULL,
    -- Directions: ENVOYE, RECU
    
    -- Contenu
    contenu TEXT NOT NULL,
    type_contenu VARCHAR(30) DEFAULT 'TEXTE',
    -- Types: TEXTE, IMAGE, DOCUMENT, AUDIO, VIDEO
    
    -- Fichiers
    fichier_url VARCHAR(500),
    fichier_nom VARCHAR(200),
    
    -- Statut
    lu BOOLEAN DEFAULT FALSE,
    date_lecture TIMESTAMP,
    
    -- Dates
    date_message TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
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
    evenements TEXT[], -- Liste événements à écouter
    
    -- État
    actif BOOLEAN DEFAULT TRUE,
    dernier_appel TIMESTAMP,
    nombre_appels INTEGER DEFAULT 0,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table : logs_communication
CREATE TABLE IF NOT EXISTS logs_communication (
    id_log SERIAL PRIMARY KEY,
    id_canal INTEGER REFERENCES canaux_communication(id_canal),
    id_message INTEGER REFERENCES messages_communication(id_message),
    
    -- Type action
    type_action VARCHAR(50) NOT NULL,
    -- Types: ENVOI, RECEPTION, ERREUR, WEBHOOK, etc.
    
    -- Détails
    details JSONB,
    message_erreur TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_canaux_type ON canaux_communication(type_canal);
CREATE INDEX IF NOT EXISTS idx_canaux_actif ON canaux_communication(actif);
CREATE INDEX IF NOT EXISTS idx_messages_canal ON messages_communication(id_canal);
CREATE INDEX IF NOT EXISTS idx_messages_statut ON messages_communication(statut);
CREATE INDEX IF NOT EXISTS idx_messages_destinataire ON messages_communication(destinataire_type, id_destinataire);
CREATE INDEX IF NOT EXISTS idx_messages_date ON messages_communication(date_envoi_prevue);
CREATE INDEX IF NOT EXISTS idx_templates_canal ON templates_communication(id_canal);
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates_communication(type_template);
CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(id_contact);
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(id_client);
CREATE INDEX IF NOT EXISTS idx_conversations_statut ON conversations(statut);
CREATE INDEX IF NOT EXISTS idx_messages_conv_conversation ON messages_conversation(id_conversation);
CREATE INDEX IF NOT EXISTS idx_messages_conv_date ON messages_conversation(date_message);
CREATE INDEX IF NOT EXISTS idx_webhooks_canal ON webhooks_communication(id_canal);
CREATE INDEX IF NOT EXISTS idx_logs_canal ON logs_communication(id_canal);
CREATE INDEX IF NOT EXISTS idx_logs_date ON logs_communication(created_at);

-- Fonction pour envoyer message (à implémenter dans backend)
CREATE OR REPLACE FUNCTION envoyer_message_communication(
    p_id_canal INTEGER,
    p_destinataire_type VARCHAR,
    p_id_destinataire INTEGER,
    p_contenu TEXT,
    p_type_message VARCHAR DEFAULT 'TEXTE'
)
RETURNS INTEGER AS $$
DECLARE
    v_id_message INTEGER;
BEGIN
    -- Créer message
    INSERT INTO messages_communication (
        id_canal, destinataire_type, id_destinataire,
        contenu, type_message, statut
    ) VALUES (
        p_id_canal, p_destinataire_type, p_id_destinataire,
        p_contenu, p_type_message, 'EN_ATTENTE'
    ) RETURNING id_message INTO v_id_message;
    
    -- L'envoi réel sera fait par le backend via API
    
    RETURN v_id_message;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_canaux_updated_at BEFORE UPDATE ON canaux_communication
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_messages_updated_at BEFORE UPDATE ON messages_communication
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_templates_updated_at BEFORE UPDATE ON templates_communication
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_webhooks_updated_at BEFORE UPDATE ON webhooks_communication
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Données initiales : Canaux par défaut
INSERT INTO canaux_communication (code_canal, libelle, type_canal, configuration, actif) VALUES
('EMAIL_SMTP', 'Email SMTP', 'EMAIL', 
 '{"smtp_host": "smtp.gmail.com", "smtp_port": 587, "secure": false}', 
 TRUE),
('WHATSAPP_API', 'WhatsApp Business API', 'WHATSAPP',
 '{"api_url": "https://api.whatsapp.com", "test_mode": true}',
 TRUE),
('SMS_TWILIO', 'SMS Twilio', 'SMS',
 '{"api_provider": "twilio", "test_mode": true}',
 TRUE)

ON CONFLICT (code_canal) DO NOTHING;

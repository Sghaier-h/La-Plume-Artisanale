-- Table pour gérer les devices mobiles
CREATE TABLE IF NOT EXISTS devices_mobile (
    id_device SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    device_info TEXT,
    device_type VARCHAR(50), -- 'android', 'ios'
    app_version VARCHAR(20),
    os_version VARCHAR(50),
    date_connexion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_derniere_activite TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actif BOOLEAN DEFAULT true,
    UNIQUE(id_utilisateur, device_id)
);

CREATE INDEX idx_devices_utilisateur ON devices_mobile(id_utilisateur);
CREATE INDEX idx_devices_device_id ON devices_mobile(device_id);

-- Table pour synchronisation hors ligne
CREATE TABLE IF NOT EXISTS sync_queue (
    id_sync SERIAL PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL REFERENCES utilisateurs(id_utilisateur),
    device_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    data_json TEXT NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_sync TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'pending',
    erreur TEXT,
    FOREIGN KEY (id_utilisateur, device_id) REFERENCES devices_mobile(id_utilisateur, device_id)
);

CREATE INDEX idx_sync_queue_pending ON sync_queue(statut, date_creation) WHERE statut = 'pending';
CREATE INDEX idx_sync_queue_user_device ON sync_queue(id_utilisateur, device_id);


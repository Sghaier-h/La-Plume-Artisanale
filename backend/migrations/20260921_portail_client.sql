-- Portail Client — champs auth + table demandes
ALTER TABLE clients ADD COLUMN IF NOT EXISTS portail_password_hash VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS portail_activated BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS portail_last_login TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS portail_reset_token VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS portail_reset_expires TIMESTAMP;

CREATE TABLE IF NOT EXISTS portail_demandes (
  id_demande SERIAL PRIMARY KEY,
  id_client INTEGER REFERENCES clients(id_client) ON DELETE CASCADE,
  type_demande VARCHAR(64),
  sujet VARCHAR(255),
  message TEXT,
  id_commande INTEGER,
  id_facture INTEGER,
  statut VARCHAR(32) DEFAULT 'nouvelle',
  date_demande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_reponse TIMESTAMP,
  reponse TEXT,
  traite_par INTEGER
);

CREATE INDEX IF NOT EXISTS idx_portail_demandes_client ON portail_demandes(id_client, statut);

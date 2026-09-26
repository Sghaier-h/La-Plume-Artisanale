-- ─────────────────────────────────────────────────────────────────
-- Messaging schema — La Plume Artisanale
-- Adds real columns to the previously-scaffolded messages/notifications tables.
-- Safe to re-run (uses IF NOT EXISTS / IF EXISTS).
-- ─────────────────────────────────────────────────────────────────

-- MESSAGES ---------------------------------------------------------
ALTER TABLE messages ADD COLUMN IF NOT EXISTS id_expediteur       INTEGER REFERENCES utilisateurs(id_utilisateur) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS id_destinataire     INTEGER REFERENCES utilisateurs(id_utilisateur) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS destinataire_poste  VARCHAR(64);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sujet               VARCHAR(255);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS contenu             TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS urgent              BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS id_of               INTEGER;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS date_envoi          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS date_lecture        TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS lu                  BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_messages_destinataire     ON messages(id_destinataire, lu);
CREATE INDEX IF NOT EXISTS idx_messages_expediteur       ON messages(id_expediteur);
CREATE INDEX IF NOT EXISTS idx_messages_conversation     ON messages(id_expediteur, id_destinataire, date_envoi DESC);
CREATE INDEX IF NOT EXISTS idx_messages_date_envoi       ON messages(date_envoi DESC);

-- NOTIFICATIONS ----------------------------------------------------
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS id_destinataire  INTEGER REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type             VARCHAR(64);      -- e.g. 'message', 'commande', 'stock_alerte'
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS titre            VARCHAR(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS contenu          TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS lien             VARCHAR(255);     -- URL cible (ex: /messages/12)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS urgent           BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS lu               BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS date_creation    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS date_lecture     TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_notifications_destinataire ON notifications(id_destinataire, lu, date_creation DESC);

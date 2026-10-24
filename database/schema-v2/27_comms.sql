-- =====================================================================
-- Schéma v2 — Communications (§11, §12)
-- Messagerie inter-postes, notifications, WhatsApp, Email
-- =====================================================================

CREATE TABLE IF NOT EXISTS messages_interposts (
    id_message          BIGSERIAL PRIMARY KEY,
    type_message        VARCHAR(40) NOT NULL,            -- ex: tissage_restant_500m, alerte_qualite, info
    categorie           VARCHAR(30) NOT NULL,            -- info | alerte | instruction | question
    poste_source        VARCHAR(40) NOT NULL,            -- planification | tissage | teinture | colisage | etc.
    poste_destination   VARCHAR(40) NOT NULL,
    id_expediteur       BIGINT,                          -- utilisateur
    id_destinataire     BIGINT,                          -- destinataire nommé optionnel
    entite_type         VARCHAR(30),                     -- of | commande | article...
    entite_id           BIGINT,
    sujet               VARCHAR(255),
    contenu             TEXT NOT NULL,
    priorite            SMALLINT DEFAULT 3,
    statut              VARCHAR(20) NOT NULL DEFAULT 'envoye', -- envoye | lu | traite | archive
    lu_a                TIMESTAMPTZ,
    traite_a            TIMESTAMPTZ,
    reponse             TEXT,
    id_utilisateur_traitement BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_msg_dest_statut ON messages_interposts(poste_destination, statut);
CREATE INDEX IF NOT EXISTS idx_msg_entite ON messages_interposts(entite_type, entite_id);

CREATE TABLE IF NOT EXISTS notifications (
    id_notification     BIGSERIAL PRIMARY KEY,
    id_utilisateur      BIGINT NOT NULL,
    type_notif          VARCHAR(40) NOT NULL,
    titre               VARCHAR(255) NOT NULL,
    message             TEXT,
    priorite            VARCHAR(20) DEFAULT 'normale',   -- basse | normale | haute | critique
    canal               VARCHAR(20) DEFAULT 'in_app',    -- in_app | email | whatsapp | push
    lien_url            VARCHAR(500),
    entite_type         VARCHAR(30),
    entite_id           BIGINT,
    lu                  BOOLEAN NOT NULL DEFAULT FALSE,
    lu_a                TIMESTAMPTZ,
    envoye              BOOLEAN NOT NULL DEFAULT FALSE,
    envoye_a            TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_user_lu ON notifications(id_utilisateur, lu);
CREATE INDEX IF NOT EXISTS idx_notif_created ON notifications(created_at DESC);

CREATE TABLE IF NOT EXISTS templates_comms (
    id_template         BIGSERIAL PRIMARY KEY,
    code                VARCHAR(60) NOT NULL UNIQUE,
    canal               VARCHAR(20) NOT NULL,            -- email | whatsapp | sms
    langue              CHAR(2) DEFAULT 'fr',
    sujet               VARCHAR(255),
    contenu             TEXT NOT NULL,
    variables           JSONB,
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    id_utilisateur      BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_envois (
    id_envoi            BIGSERIAL PRIMARY KEY,
    telephone_destinataire VARCHAR(40) NOT NULL,
    id_utilisateur      BIGINT,
    id_template         BIGINT REFERENCES templates_comms(id_template),
    contenu             TEXT NOT NULL,
    variables_json      JSONB,
    fichier_url         TEXT,
    statut              VARCHAR(20) DEFAULT 'en_attente', -- en_attente | envoye | livre | lu | echec
    provider            VARCHAR(30) DEFAULT 'meta_cloud', -- meta_cloud | twilio | wa_business
    reference_provider  VARCHAR(120),
    erreur              TEXT,
    entite_type         VARCHAR(30),
    entite_id           BIGINT,
    date_envoi          TIMESTAMPTZ,
    date_livraison      TIMESTAMPTZ,
    date_lecture        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wa_statut ON whatsapp_envois(statut);

CREATE TABLE IF NOT EXISTS emails_envois (
    id_envoi            BIGSERIAL PRIMARY KEY,
    email_destinataire  VARCHAR(255) NOT NULL,
    cc                  TEXT,
    bcc                 TEXT,
    id_utilisateur      BIGINT,
    id_template         BIGINT REFERENCES templates_comms(id_template),
    sujet               VARCHAR(255) NOT NULL,
    contenu_html        TEXT,
    contenu_texte       TEXT,
    pieces_jointes      JSONB,                            -- [{"nom":"...","url":"..."}]
    statut              VARCHAR(20) DEFAULT 'en_attente', -- en_attente | envoye | echec | bounce
    provider            VARCHAR(30) DEFAULT 'smtp',
    reference_provider  VARCHAR(120),
    erreur              TEXT,
    entite_type         VARCHAR(30),
    entite_id           BIGINT,
    date_envoi          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_statut ON emails_envois(statut);

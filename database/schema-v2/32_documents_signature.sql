-- =====================================================================
-- SCHEMA V2 — DOCUMENTS SIGNATURE ÉLECTRONIQUE (§14bis.7 domain.md)
-- Fichier : 32_documents_signature.sql
-- Cible : PostgreSQL 15
-- Contrat : docs/domain.md §14bis.7 (Envoi documents par lien signature style Odoo)
--           + Art. 453 bis Code des Obligations et des Contrats Tunisie
-- Idempotent : CREATE TABLE IF NOT EXISTS
-- Prérequis : 15_ventes_devis_cmd.sql, 16_ventes_bl_fa.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- Liens de signature envoyés (JWT + HMAC)
-- Un lien = une URL courte envoyée par email/SMS avec token signé
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents_signature_links (
    id_lien                  SERIAL PRIMARY KEY,
    numero_lien              VARCHAR(30) NOT NULL UNIQUE,
    type_document            VARCHAR(20) NOT NULL
                              CHECK (type_document IN ('devis','commande','bl','facture','avoir','contrat','bon_retour','sous_traitance')),
    id_document              INT NOT NULL,
    id_compte                INT,
    email_destinataire       VARCHAR(255) NOT NULL,
    telephone_destinataire   VARCHAR(30),
    nom_destinataire         VARCHAR(200),
    code_court               VARCHAR(12)  NOT NULL UNIQUE,
    jwt_token                TEXT NOT NULL,
    hmac_hash                VARCHAR(128) NOT NULL,
    canal_envoi              VARCHAR(20) NOT NULL DEFAULT 'email'
                              CHECK (canal_envoi IN ('email','sms','whatsapp','copy_link','portail')),
    pdf_url                  VARCHAR(500) NOT NULL,
    pdf_hash_sha256          VARCHAR(64) NOT NULL,
    statut                   VARCHAR(20) NOT NULL DEFAULT 'envoye'
                              CHECK (statut IN ('brouillon','envoye','vu','signe','refuse','expire','annule')),
    envoye_par               INT NOT NULL,
    date_envoi               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_expiration          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    date_1ere_visite         TIMESTAMPTZ,
    date_signature           TIMESTAMPTZ,
    date_refus               TIMESTAMPTZ,
    motif_refus              TEXT,
    nb_relances              INT NOT NULL DEFAULT 0,
    date_derniere_relance    TIMESTAMPTZ,
    ip_signataire            INET,
    user_agent_signataire    TEXT,
    signature_type           VARCHAR(20)
                              CHECK (signature_type IN ('electronique_simple','electronique_avancee','cliquable','biometrique','otp_sms')),
    signature_image_url      VARCHAR(500),
    signature_certificat_url VARCHAR(500),
    otp_code_hash            VARCHAR(128),
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sign_doc         ON documents_signature_links(type_document, id_document);
CREATE INDEX IF NOT EXISTS idx_sign_compte      ON documents_signature_links(id_compte);
CREATE INDEX IF NOT EXISTS idx_sign_code        ON documents_signature_links(code_court);
CREATE INDEX IF NOT EXISTS idx_sign_email       ON documents_signature_links(email_destinataire);
CREATE INDEX IF NOT EXISTS idx_sign_statut      ON documents_signature_links(statut);
CREATE INDEX IF NOT EXISTS idx_sign_expiration  ON documents_signature_links(date_expiration);

-- ---------------------------------------------------------------------
-- Événements audit signature (traçabilité complète)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS signatures_evenements (
    id_evenement             BIGSERIAL PRIMARY KEY,
    id_lien                  INT NOT NULL REFERENCES documents_signature_links(id_lien) ON DELETE CASCADE,
    type_evenement           VARCHAR(30) NOT NULL
                              CHECK (type_evenement IN (
                                'lien_genere','email_envoye','sms_envoye','whatsapp_envoye',
                                'lien_ouvert','pdf_telecharge','pdf_visualise',
                                'otp_demande','otp_envoye','otp_valide','otp_echec',
                                'signature_debut','signature_validee','signature_refusee',
                                'relance_envoyee','lien_expire','lien_annule',
                                'hmac_invalide','jwt_expire','tentative_falsification'
                              )),
    ip                       INET,
    user_agent               TEXT,
    fingerprint_navigateur   VARCHAR(200),
    payload_json             JSONB,
    date_evenement           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sig_evt_lien  ON signatures_evenements(id_lien);
CREATE INDEX IF NOT EXISTS idx_sig_evt_type  ON signatures_evenements(type_evenement);
CREATE INDEX IF NOT EXISTS idx_sig_evt_date  ON signatures_evenements(date_evenement DESC);

-- ---------------------------------------------------------------------
-- Documents signés archivés (avec preuve légale)
-- Un document signé = un PDF final avec cachet numérique inaltérable
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS signatures_valides (
    id_signature             SERIAL PRIMARY KEY,
    id_lien                  INT NOT NULL REFERENCES documents_signature_links(id_lien) ON DELETE RESTRICT,
    type_document            VARCHAR(20) NOT NULL,
    id_document              INT NOT NULL,
    pdf_original_url         VARCHAR(500) NOT NULL,
    pdf_signe_url            VARCHAR(500) NOT NULL,
    pdf_original_sha256      VARCHAR(64) NOT NULL,
    pdf_signe_sha256         VARCHAR(64) NOT NULL,
    signataire_nom           VARCHAR(200) NOT NULL,
    signataire_email         VARCHAR(255) NOT NULL,
    signataire_ip            INET NOT NULL,
    signataire_user_agent    TEXT,
    date_signature           TIMESTAMPTZ NOT NULL,
    signature_type           VARCHAR(30) NOT NULL,
    horodatage_serveur       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    certificat_serveur_hash  VARCHAR(128),
    conformite_art453bis     BOOLEAN NOT NULL DEFAULT TRUE,
    duree_conservation_ans   INT NOT NULL DEFAULT 10,
    date_conservation_fin    DATE GENERATED ALWAYS AS ((date_signature + INTERVAL '10 years')::DATE) STORED,
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_lien)
);
CREATE INDEX IF NOT EXISTS idx_sigval_doc      ON signatures_valides(type_document, id_document);
CREATE INDEX IF NOT EXISTS idx_sigval_email    ON signatures_valides(signataire_email);
CREATE INDEX IF NOT EXISTS idx_sigval_date     ON signatures_valides(date_signature);
CREATE INDEX IF NOT EXISTS idx_sigval_conserv  ON signatures_valides(date_conservation_fin);

-- ---------------------------------------------------------------------
-- Templates d'emails de signature
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS signature_templates (
    id_template              SERIAL PRIMARY KEY,
    code                     VARCHAR(50) NOT NULL UNIQUE,
    type_document            VARCHAR(20) NOT NULL,
    canal                    VARCHAR(20) NOT NULL,
    sujet                    VARCHAR(255),
    corps_html               TEXT,
    corps_texte              TEXT,
    langue                   VARCHAR(5) NOT NULL DEFAULT 'fr',
    variables_disponibles    JSONB,
    actif                    BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_modification        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sig_template_doc  ON signature_templates(type_document);
CREATE INDEX IF NOT EXISTS idx_sig_template_canal ON signature_templates(canal);

-- =====================================================================
-- SCHEMA V2 — PHOTOS JUSTIFICATIVES "BOÎTE À TRIER" (§14quater.4 · Phase E3)
-- Fichier : 40_photos_boite_tri.sql
-- Cible   : PostgreSQL 15
-- Contrat : flux photos reçues via Teams / WhatsApp / Email (webhooks HMAC-signés)
--           stockées dans documents_archive (dédup SHA-256) et listées dans
--           photos_boite_tri jusqu'à rattachement à une pièce comptable
--           (dépense espèces, facture fournisseur, apport gérant, paiement).
--
-- Idempotent : CREATE TABLE / INDEX / TRIGGER / FUNCTION IF NOT EXISTS
-- Prérequis : 01_core.sql (users) + 37_documents_archive.sql (documents_archive)
-- =====================================================================

CREATE TABLE IF NOT EXISTS photos_boite_tri (
    id_photo                 BIGSERIAL PRIMARY KEY,
    id_document_archive      BIGINT NOT NULL
                              REFERENCES documents_archive(id_document) ON DELETE CASCADE,

    -- Source de réception
    source                   VARCHAR(20) NOT NULL
                              CHECK (source IN ('teams','whatsapp','email','upload_direct')),
    expediteur_identifiant   VARCHAR(255),           -- user@teams, +216xxxxxx, from@email, user_id
    expediteur_nom           VARCHAR(255),           -- nom lisible éventuel
    expediteur_message       TEXT,                   -- caption / corps email / commentaire Teams

    -- Métadonnées de réception
    date_reception           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Workflow de tri
    statut                   VARCHAR(20) NOT NULL DEFAULT 'non_traite'
                              CHECK (statut IN ('non_traite','en_cours','rattache','ignore')),

    -- Rattachement vers pièce comptable
    rattache_a_type          VARCHAR(30)
                              CHECK (rattache_a_type IS NULL OR rattache_a_type IN (
                                'depense_espece','facture_fournisseur',
                                'apport_gerant','paiement'
                              )),
    rattache_a_id            BIGINT,
    rattache_par             BIGINT,                 -- user qui a fait l'action
    rattache_at              TIMESTAMPTZ,
    notes_rattachement       TEXT,

    -- Métadonnées libres (payload original, headers, exif, ocr brut, etc.)
    metadata                 JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Audit
    cree_par                 BIGINT,
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modifie_par              BIGINT,
    date_modification        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pbt_source      ON photos_boite_tri(source);
CREATE INDEX IF NOT EXISTS idx_pbt_statut      ON photos_boite_tri(statut);
CREATE INDEX IF NOT EXISTS idx_pbt_reception   ON photos_boite_tri(date_reception DESC);
CREATE INDEX IF NOT EXISTS idx_pbt_source_statut_date
                                               ON photos_boite_tri(source, statut, date_reception DESC);
CREATE INDEX IF NOT EXISTS idx_pbt_expediteur  ON photos_boite_tri(expediteur_identifiant);
CREATE INDEX IF NOT EXISTS idx_pbt_rattache    ON photos_boite_tri(rattache_a_type, rattache_a_id);
CREATE INDEX IF NOT EXISTS idx_pbt_document    ON photos_boite_tri(id_document_archive);
CREATE INDEX IF NOT EXISTS idx_pbt_metadata    ON photos_boite_tri USING GIN(metadata);

-- ---------------------------------------------------------------------
-- Trigger : horodatage de modification
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_pbt_touch_modification() RETURNS TRIGGER AS $$
BEGIN
  NEW.date_modification := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pbt_touch ON photos_boite_tri;
CREATE TRIGGER trg_pbt_touch
  BEFORE UPDATE ON photos_boite_tri
  FOR EACH ROW EXECUTE FUNCTION fn_pbt_touch_modification();

-- ---------------------------------------------------------------------
-- Trigger : notification realtime à l'INSERT (consommable via LISTEN)
--
-- Les clients SQL peuvent faire `LISTEN photo_recue` et le backend
-- peut relayer en Server-Sent Events / WebSocket pour un badge temps-réel
-- sans polling.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_pbt_notify_insert() RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'photo_recue',
    json_build_object(
      'id_photo', NEW.id_photo,
      'source',   NEW.source,
      'expediteur', NEW.expediteur_identifiant,
      'date_reception', NEW.date_reception
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pbt_notify ON photos_boite_tri;
CREATE TRIGGER trg_pbt_notify
  AFTER INSERT ON photos_boite_tri
  FOR EACH ROW EXECUTE FUNCTION fn_pbt_notify_insert();

-- ---------------------------------------------------------------------
-- Vue de confort pour la boîte à trier (jointure document + photo)
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_photos_boite_tri AS
SELECT
    p.id_photo,
    p.source,
    p.expediteur_identifiant,
    p.expediteur_nom,
    p.expediteur_message,
    p.date_reception,
    p.statut,
    p.rattache_a_type,
    p.rattache_a_id,
    p.rattache_par,
    p.rattache_at,
    p.notes_rattachement,
    p.metadata,
    p.date_creation,
    d.id_document       AS id_document_archive,
    d.code_document,
    d.titre             AS document_titre,
    d.filename_original,
    d.mimetype,
    d.taille_octets,
    d.checksum_sha256,
    d.path_relatif,
    d.date_document
FROM photos_boite_tri p
JOIN documents_archive d ON d.id_document = p.id_document_archive;

COMMENT ON TABLE photos_boite_tri IS
  '§14quater.4 — Photos justificatives reçues via Teams/WhatsApp/Email ou upload direct, '
  'en attente de rattachement à une pièce comptable (dépense espèces, facture fournisseur, '
  'apport gérant, paiement).';

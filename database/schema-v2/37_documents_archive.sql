-- =====================================================================
-- SCHEMA V2 — ARCHIVE CENTRALE DE DOCUMENTS (§14quater · Phase A)
-- Fichier : 37_documents_archive.sql
-- Cible   : PostgreSQL 15
-- Contrat : archive polymorphique partagée entre tous les modules
--           (comptabilité, RH, sous-traitance, achats, ventes, douane...)
--           avec OCR, déduplication, versionnage et full-text search.
-- Idempotent : CREATE TABLE / INDEX IF NOT EXISTS
-- Prérequis : 01_core.sql (users)
-- =====================================================================

CREATE TABLE IF NOT EXISTS documents_archive (
    id_document              BIGSERIAL PRIMARY KEY,
    code_document            VARCHAR(50) UNIQUE,                -- DOC-{YYYY}-{SEQ:6}
    titre                    VARCHAR(200) NOT NULL,
    description              TEXT,
    type_document            VARCHAR(40) NOT NULL
                              CHECK (type_document IN (
                                'facture_recue','facture_emise','recu_caisse','rib',
                                'contrat','bulletin_paie','attestation','bon_sortie_st',
                                'bon_retour_st','scan_cheque','photo_piece','releve_bancaire',
                                'declaration_tva','avoir','bon_commande','permit_douane',
                                'declaration_import','certificat_origine',
                                'facture_fournisseur_etranger','autre'
                              )),
    categorie                VARCHAR(50),                       -- libre, taggable
    tags                     TEXT[],
    langue                   CHAR(2) DEFAULT 'fr',
    filename_original        VARCHAR(255) NOT NULL,
    filename_stored          VARCHAR(255) NOT NULL UNIQUE,      -- UUID-based
    mimetype                 VARCHAR(100),
    taille_octets            BIGINT,
    checksum_sha256          VARCHAR(64),                       -- déduplication
    storage_backend          VARCHAR(20) NOT NULL DEFAULT 'local'
                              CHECK (storage_backend IN ('local','s3','onedrive','sharepoint')),
    path_relatif             VARCHAR(500) NOT NULL,
    signature_tactile_svg    TEXT,                              -- signature apposée (canvas SVG)
    ocr_text                 TEXT,
    ocr_lang                 CHAR(2),
    texte_recherche          tsvector,
    version                  INT NOT NULL DEFAULT 1,
    id_version_precedente    BIGINT REFERENCES documents_archive(id_document),
    date_document            DATE,                              -- date métier
    periode_fiscale          VARCHAR(10),                       -- YYYY-MM
    id_societe               BIGINT,
    statut                   VARCHAR(20) NOT NULL DEFAULT 'valide'
                              CHECK (statut IN ('brouillon','valide','archive','obsolete','supprime')),
    confidentialite          VARCHAR(20) NOT NULL DEFAULT 'interne'
                              CHECK (confidentialite IN ('public','interne','confidentiel','restreint')),
    date_destruction_prevue  DATE,                              -- RGPD / archivage légal
    cree_par                 BIGINT,
    date_creation            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modifie_par              BIGINT,
    date_modification        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_recherche ON documents_archive USING GIN(texte_recherche);
CREATE INDEX IF NOT EXISTS idx_doc_tags      ON documents_archive USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_doc_type      ON documents_archive(type_document);
CREATE INDEX IF NOT EXISTS idx_doc_periode   ON documents_archive(periode_fiscale);
CREATE INDEX IF NOT EXISTS idx_doc_societe   ON documents_archive(id_societe);
CREATE INDEX IF NOT EXISTS idx_doc_checksum  ON documents_archive(checksum_sha256);
CREATE INDEX IF NOT EXISTS idx_doc_date_doc  ON documents_archive(date_document);

-- Mise à jour du tsvector + horodatage
CREATE OR REPLACE FUNCTION fn_doc_tsvector_refresh() RETURNS TRIGGER AS $$
BEGIN
  NEW.texte_recherche :=
      setweight(to_tsvector('simple', coalesce(NEW.titre,'')), 'A') ||
      setweight(to_tsvector('simple', coalesce(NEW.description,'')), 'B') ||
      setweight(to_tsvector('simple', coalesce(NEW.ocr_text,'')), 'C') ||
      setweight(to_tsvector('simple', coalesce(array_to_string(NEW.tags, ' '), '')), 'B');
  NEW.date_modification := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_doc_tsvector ON documents_archive;
CREATE TRIGGER trg_doc_tsvector
  BEFORE INSERT OR UPDATE OF titre, description, ocr_text, tags
  ON documents_archive
  FOR EACH ROW EXECUTE FUNCTION fn_doc_tsvector_refresh();

-- ---------------------------------------------------------------------
-- Table de liaison polymorphique
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents_liaisons (
    id_liaison      BIGSERIAL PRIMARY KEY,
    id_document     BIGINT NOT NULL REFERENCES documents_archive(id_document) ON DELETE CASCADE,
    entite_type     VARCHAR(50) NOT NULL,
    entite_id       BIGINT NOT NULL,
    role_liaison    VARCHAR(50),                                 -- 'justificatif','piece_source','preuve','contrat','annexe'
    date_liaison    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cree_par        BIGINT,
    UNIQUE (id_document, entite_type, entite_id, role_liaison)
);
CREATE INDEX IF NOT EXISTS idx_doc_liaison_entite ON documents_liaisons(entite_type, entite_id);
CREATE INDEX IF NOT EXISTS idx_doc_liaison_doc    ON documents_liaisons(id_document);

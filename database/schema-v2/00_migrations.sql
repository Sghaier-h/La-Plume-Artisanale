-- =====================================================================
-- 00_migrations.sql
-- Table de tracking des migrations SQL (schema-v2 + seeds-v2).
-- Ce fichier DOIT etre execute en tout premier avant tous les autres.
-- Le script backend/src/database/migrate.js s'assure de le faire.
-- =====================================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
  id                SERIAL PRIMARY KEY,
  filename          VARCHAR(255) NOT NULL UNIQUE,
  checksum_sha256   VARCHAR(64)  NOT NULL,
  applied_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  applied_by        VARCHAR(100),
  duration_ms       INT,
  success           BOOLEAN      NOT NULL DEFAULT TRUE,
  rollback_sql      TEXT,
  error_message     TEXT
);

CREATE INDEX IF NOT EXISTS idx_migrations_applied_at
  ON schema_migrations(applied_at DESC);

COMMENT ON TABLE schema_migrations IS
  'Journal des migrations SQL appliquees. Une ligne = un fichier .sql applique avec succes ou en echec. checksum_sha256 detecte les modifications retroactives.';

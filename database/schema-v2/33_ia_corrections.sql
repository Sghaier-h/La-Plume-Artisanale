-- =====================================================================
-- Schéma v2 — IA & Corrections validées (§14bis.6bis)
-- Extension de 26_ia_agents.sql :
--   1. Colonne `sql_correction_proposee` ajoutée à agents_findings
--   2. Table `agents_ia_corrections_appliquees` — audit rollback 24h
-- =====================================================================

ALTER TABLE agents_findings
    ADD COLUMN IF NOT EXISTS sql_correction_proposee TEXT;

CREATE TABLE IF NOT EXISTS agents_ia_corrections_appliquees (
    id_correction              BIGSERIAL PRIMARY KEY,
    id_finding                 BIGINT NOT NULL REFERENCES agents_findings(id_finding),
    sql_execute                TEXT NOT NULL,
    sql_rollback               TEXT,
    snapshot_avant             JSONB,
    snapshot_apres             JSONB,
    id_utilisateur_validation  BIGINT NOT NULL,
    date_application           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Fenêtre de rollback "1 clic" : 24 h après application (§14bis.6bis.2)
    date_rollback_limite       TIMESTAMPTZ GENERATED ALWAYS AS (date_application + INTERVAL '24 hours') STORED,
    rollback_effectue          BOOLEAN NOT NULL DEFAULT FALSE,
    date_rollback              TIMESTAMPTZ,
    id_utilisateur_rollback    BIGINT,
    raison_rollback            TEXT
);

CREATE INDEX IF NOT EXISTS idx_ia_corr_finding  ON agents_ia_corrections_appliquees(id_finding);
CREATE INDEX IF NOT EXISTS idx_ia_corr_user     ON agents_ia_corrections_appliquees(id_utilisateur_validation);
CREATE INDEX IF NOT EXISTS idx_ia_corr_limite   ON agents_ia_corrections_appliquees(date_rollback_limite)
  WHERE rollback_effectue = FALSE;

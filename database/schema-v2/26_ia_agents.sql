-- =====================================================================
-- Schéma v2 — IA & Agents autonomes (§11ter)
-- 10 agents seed : Stock, Production, Qualité, Finance, Commercial,
-- Fournisseurs, RH + 3 rapports (Quotidien, Hebdo, Mensuel)
-- =====================================================================

CREATE TABLE IF NOT EXISTS agents_config (
    id_agent            BIGSERIAL PRIMARY KEY,
    code                VARCHAR(40) NOT NULL UNIQUE,     -- ex: STOCK_MONITOR, RAPPORT_QUOTIDIEN
    nom                 VARCHAR(120) NOT NULL,
    categorie           VARCHAR(30) NOT NULL,            -- stock | production | qualite | finance | commercial | fournisseurs | rh | rapport
    description         TEXT,
    llm_provider        VARCHAR(20) DEFAULT 'claude',    -- claude | openai
    llm_model           VARCHAR(60) DEFAULT 'claude-opus-4',
    budget_tokens       INT DEFAULT 200000,
    cron_schedule       VARCHAR(40),                      -- ex: '0 6 * * *'
    actif               BOOLEAN NOT NULL DEFAULT TRUE,
    lecture_seule       BOOLEAN NOT NULL DEFAULT TRUE,
    canaux_notification JSONB,                            -- ex: ["email","whatsapp","in_app"]
    parametres          JSONB,                            -- config libre (seuils, filtres...)
    id_prompt_actif     BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agents_prompts (
    id_prompt           BIGSERIAL PRIMARY KEY,
    id_agent            BIGINT NOT NULL REFERENCES agents_config(id_agent) ON DELETE CASCADE,
    version             VARCHAR(20) NOT NULL,
    contenu             TEXT NOT NULL,
    variables           JSONB,                            -- placeholders attendus
    actif               BOOLEAN NOT NULL DEFAULT FALSE,
    id_utilisateur      BIGINT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(id_agent, version)
);

CREATE TABLE IF NOT EXISTS agents_runs (
    id_run              BIGSERIAL PRIMARY KEY,
    id_agent            BIGINT NOT NULL REFERENCES agents_config(id_agent),
    id_prompt           BIGINT REFERENCES agents_prompts(id_prompt),
    demarre_a           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    termine_a           TIMESTAMPTZ,
    duree_ms            INT,
    statut              VARCHAR(20) NOT NULL DEFAULT 'en_cours', -- en_cours | succes | echec | timeout | annule
    tokens_input        INT DEFAULT 0,
    tokens_output       INT DEFAULT 0,
    cout_usd            NUMERIC(10,4) DEFAULT 0,
    contexte_json       JSONB,                            -- payload envoyé
    reponse_brute       TEXT,
    erreur              TEXT,
    trigger_type        VARCHAR(20) DEFAULT 'cron',       -- cron | manuel | webhook
    id_utilisateur      BIGINT
);
CREATE INDEX IF NOT EXISTS idx_runs_agent ON agents_runs(id_agent);
CREATE INDEX IF NOT EXISTS idx_runs_statut ON agents_runs(statut);
CREATE INDEX IF NOT EXISTS idx_runs_demarre ON agents_runs(demarre_a);

CREATE TABLE IF NOT EXISTS agents_findings (
    id_finding          BIGSERIAL PRIMARY KEY,
    id_run              BIGINT NOT NULL REFERENCES agents_runs(id_run) ON DELETE CASCADE,
    id_agent            BIGINT NOT NULL REFERENCES agents_config(id_agent),
    severite            VARCHAR(20) NOT NULL,            -- info | warning | critique | alerte
    categorie           VARCHAR(60),
    titre               VARCHAR(255) NOT NULL,
    description         TEXT,
    entite_type         VARCHAR(60),                     -- article | of | facture | employe...
    entite_id           BIGINT,
    donnees_json        JSONB,
    action_suggeree     TEXT,
    statut              VARCHAR(20) DEFAULT 'nouveau',   -- nouveau | vu | traite | ignore
    id_utilisateur_traitement BIGINT,
    date_traitement     TIMESTAMPTZ,
    notes_traitement    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_findings_agent  ON agents_findings(id_agent);
CREATE INDEX IF NOT EXISTS idx_findings_severite ON agents_findings(severite);
CREATE INDEX IF NOT EXISTS idx_findings_statut ON agents_findings(statut);

ALTER TABLE agents_config
    DROP CONSTRAINT IF EXISTS fk_agents_config_prompt,
    ADD  CONSTRAINT fk_agents_config_prompt FOREIGN KEY (id_prompt_actif) REFERENCES agents_prompts(id_prompt) ON DELETE SET NULL;

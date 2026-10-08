-- ─────────────────────────────────────────────────────────────────
-- Recrutement — Timeline + entretiens + enrichissements candidats
-- Safe to re-run (IF NOT EXISTS).
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hr_recruitment_timeline (
  id_event SERIAL PRIMARY KEY,
  id_applicant INTEGER REFERENCES hr_applicants(id_applicant) ON DELETE CASCADE,
  event_type VARCHAR(32),  -- 'stage_change'|'note'|'interview'|'call'|'email'|'hire'|'reject'
  from_stage INTEGER,
  to_stage INTEGER,
  interview_date TIMESTAMP,
  interview_type VARCHAR(32),  -- 'phone'|'onsite'|'video'
  interviewer VARCHAR(255),
  notes TEXT,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recruitment_timeline_applicant
  ON hr_recruitment_timeline(id_applicant, created_at DESC);

-- Ajout colonnes hr_applicants
ALTER TABLE hr_applicants ADD COLUMN IF NOT EXISTS source_candidature VARCHAR(64);
ALTER TABLE hr_applicants ADD COLUMN IF NOT EXISTS niveau_etudes VARCHAR(128);
ALTER TABLE hr_applicants ADD COLUMN IF NOT EXISTS experience_annees INTEGER;
ALTER TABLE hr_applicants ADD COLUMN IF NOT EXISTS pretention_salariale NUMERIC(12,3);
ALTER TABLE hr_applicants ADD COLUMN IF NOT EXISTS disponibilite VARCHAR(64);
ALTER TABLE hr_applicants ADD COLUMN IF NOT EXISTS score_evaluation INTEGER;

-- =============================================================================
-- 03_cessions.sql — Cessions intra-groupe LP → CAPSCOR (§14quater.3)
-- 2 cessions calculées à partir des dossiers 1 & 3 ci-dessus.
-- Idempotent via ON CONFLICT (cle_unique).
-- =============================================================================

INSERT INTO cessions_intragroupe (
  cle_unique, numero_cession, id_dossier_import,
  id_societe_cedante, id_societe_cessionnaire,
  poids_kg, cout_cession_dt, marge_pct, statut,
  date_calcul, notes
)
SELECT
  'CES-IMP00001-LP-CAPSCOR',
  'CES-2026-00001',
  d.id_dossier,
  1,   -- LP
  2,   -- CAPSCOR
  1200.000,
  14250.000,
  5.000,
  'calculee',
  '2026-10-01 10:00:00+00',
  'Cession 50% du lot fil coton 24/1 à CAPSCOR · marge 5%'
FROM dossiers_import d WHERE d.numero_dossier = 'IMP-2026-00001'
ON CONFLICT (cle_unique) DO UPDATE SET
  cout_cession_dt = EXCLUDED.cout_cession_dt,
  statut          = EXCLUDED.statut;

INSERT INTO cessions_intragroupe (
  cle_unique, numero_cession, id_dossier_import,
  id_societe_cedante, id_societe_cessionnaire,
  poids_kg, cout_cession_dt, marge_pct, statut,
  date_calcul, notes
)
SELECT
  'CES-IMP00003-LP-CAPSCOR',
  'CES-2026-00002',
  d.id_dossier,
  1,
  2,
  60.000,
  3800.000,
  3.000,
  'facturee',
  '2026-10-16 09:30:00+00',
  'Cession fûts colorants réactifs (red+blue) · facture CAPSCOR émise'
FROM dossiers_import d WHERE d.numero_dossier = 'IMP-2026-00003'
ON CONFLICT (cle_unique) DO UPDATE SET
  cout_cession_dt = EXCLUDED.cout_cession_dt,
  statut          = EXCLUDED.statut;

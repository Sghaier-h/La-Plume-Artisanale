-- =============================================================================
-- 05_compensations.sql — Compensations croisées (§14quater.4)
-- 2 compensations typiques :
--   (1) CNSS Najwa 4764 DT compensée par avance employée précédente
--   (2) Compensation croisée client/fournisseur groupe
-- Chaque compensation = exactement 1 ligne débit + 1 ligne crédit, balance=0.
-- =============================================================================

-- Compensation #1 : CNSS Najwa (règlement par absorption avance employée)
INSERT INTO compensations_croisees (
  numero_compensation, date_compensation, libelle, montant_total, statut, notes
) VALUES
  ('COMP-2026-00001', '2026-10-10',
   'Compensation CNSS Najwa 4764 DT ↔ avance employée',
   4764.000, 'validee',
   'Trimestre CNSS T3-2026 réglé par absorption de l''avance personnelle de Najwa (versée 2026-08).')
ON CONFLICT (numero_compensation) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  statut  = EXCLUDED.statut,
  updated_at = NOW();

INSERT INTO compensations_lignes (
  id_compensation, sens, id_tiers, type_tiers, nom_tiers, libelle, montant
)
SELECT c.id_compensation, 'debit', NULL, 'autre',  'CNSS Tunis',           'CNSS T3-2026 à régler',               4764.000
FROM compensations_croisees c WHERE c.numero_compensation = 'COMP-2026-00001'
ON CONFLICT DO NOTHING;

INSERT INTO compensations_lignes (
  id_compensation, sens, id_tiers, type_tiers, nom_tiers, libelle, montant
)
SELECT c.id_compensation, 'credit', NULL, 'employe', 'Najwa B. (gérante)', 'Absorption avance personnelle du 2026-08-15', 4764.000
FROM compensations_croisees c WHERE c.numero_compensation = 'COMP-2026-00001'
ON CONFLICT DO NOTHING;

-- Compensation #2 : fournisseur Jacquard Como ↔ créance CAPSCOR
INSERT INTO compensations_croisees (
  numero_compensation, date_compensation, libelle, montant_total, statut, notes
) VALUES
  ('COMP-2026-00002', '2026-10-18',
   'Compensation facture Jacquard Como ↔ créance CAPSCOR',
   3600.000, 'validee',
   'Règlement du solde fournisseur Como par imputation sur la créance CAPSCOR issue de la cession CES-2026-00002.')
ON CONFLICT (numero_compensation) DO UPDATE SET
  libelle = EXCLUDED.libelle,
  statut  = EXCLUDED.statut,
  updated_at = NOW();

INSERT INTO compensations_lignes (
  id_compensation, sens, id_tiers, type_tiers, nom_tiers, libelle, montant
)
SELECT c.id_compensation, 'debit',  NULL, 'fournisseur', 'Jacquard Textile Como SRL', 'Solde facture 2026-18-FR',      3600.000
FROM compensations_croisees c WHERE c.numero_compensation = 'COMP-2026-00002'
ON CONFLICT DO NOTHING;

INSERT INTO compensations_lignes (
  id_compensation, sens, id_tiers, type_tiers, nom_tiers, libelle, montant
)
SELECT c.id_compensation, 'credit', NULL, 'client',      'CAPSCOR',                    'Créance cession CES-2026-00002', 3600.000
FROM compensations_croisees c WHERE c.numero_compensation = 'COMP-2026-00002'
ON CONFLICT DO NOTHING;

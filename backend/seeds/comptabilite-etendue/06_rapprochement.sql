-- =============================================================================
-- 06_rapprochement.sql — Import démo rapprochement bancaire BIAT
-- 1 import + 10 lignes à matcher (encaissements clients, décaissements compta,
-- virements internes). Idempotent via DELETE+INSERT sur fichier_source dédié.
-- =============================================================================

DELETE FROM rapprochement_bancaire_lignes
 WHERE id_import_bq IN (
   SELECT id_import_bq FROM rapprochement_bancaire_imports
    WHERE fichier_source = 'BIAT-RELEVE-2026-10-DEMO.csv'
 );
DELETE FROM rapprochement_bancaire_imports
 WHERE fichier_source = 'BIAT-RELEVE-2026-10-DEMO.csv';

WITH ins AS (
  INSERT INTO rapprochement_bancaire_imports (
    id_compte_bancaire, fichier_source, format, nb_lignes_total, nb_lignes_rapprochees, notes
  ) VALUES (
    1, 'BIAT-RELEVE-2026-10-DEMO.csv', 'csv', 10, 3,
    'Relevé démo BIAT octobre 2026 · compte courant atelier'
  ) RETURNING id_import_bq
)
INSERT INTO rapprochement_bancaire_lignes (
  id_import_bq, date_valeur, libelle_bq, montant_debit, montant_credit,
  reference_bq, matching_statut, score_matching
)
SELECT ins.id_import_bq, v.d::DATE, v.lib, v.deb, v.cred, v.ref, v.st, v.score FROM ins, (VALUES
  ('2026-10-02', 'VIR SEPA HOTEL MARINA DJERBA FACTURE 2026-245',             0.000, 8400.000, 'VIR24510',   'rapproche',   97.50),
  ('2026-10-05', 'REMISE CHQ CLIENT 002451 LOT 10/26',                        0.000, 4200.000, 'CHQ002451',  'rapproche',   95.00),
  ('2026-10-07', 'VIREMENT COMPTE A COMPTE EPARGNE',                     12000.000,    0.000, 'VIR-INT-07', 'rapproche',   99.00),
  ('2026-10-10', 'PRELEVEMENT CNSS T3 2026',                              4764.000,    0.000, 'CNSS-T3',    'suggere',     82.00),
  ('2026-10-12', 'VIR SEPA RESIDENCE HAMMAMET BEACH FACTURE 2026-301',        0.000, 6200.000, 'VIR24602',   'suggere',     88.00),
  ('2026-10-14', 'FRAIS BANCAIRES OCTOBRE',                                 85.400,    0.000, 'FB-10/26',   'non_matche',   0.00),
  ('2026-10-16', 'ACHAT CB DYSTAR DEUTSCHLAND 2850.00 EUR',                9810.000,    0.000, 'CB-DYSTAR',  'non_matche',   0.00),
  ('2026-10-18', 'REMISE ESPECES AGENCE KSAR HELLAL',                         0.000, 3800.000, 'ESP-18',     'non_matche',   0.00),
  ('2026-10-20', 'VIR SORTANT STEG FACTURE 09/26',                          312.600,    0.000, 'STEG-09',    'non_matche',   0.00),
  ('2026-10-22', 'REMISE CHQ CLIENT 002452 LOT 10/26',                        0.000, 1800.000, 'CHQ002452',  'non_matche',   0.00)
) AS v(d, lib, deb, cred, ref, st, score);

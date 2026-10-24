-- =============================================================================
-- 02_dossiers_import.sql — 3 dossiers démo (§14quater.2)
-- Imports typiques La Plume : coton Chine (fil), jacquard Italie (tissu),
-- colorant Allemagne (chimique). Lignes & frais détaillés.
-- Idempotent via ON CONFLICT (numero_dossier).
-- =============================================================================

INSERT INTO dossiers_import (
  numero_dossier, date_ouverture, pays_origine, fournisseur_etranger,
  nb_colis, poids_total_kg, incoterm, devise_etrangere, taux_change,
  cout_total_dt, statut, numero_declaration_douane, date_dedouanement, notes
) VALUES
  ('IMP-2026-00001', '2026-09-05', 'Chine',      'Shandong Cotton Mills Co. Ltd',
   48, 2400.000, 'CIF', 'USD', 3.120000,
   28500.000, 'arrive', 'TN-DED-2026-09412', '2026-09-28',
   'Fil coton 24/1 écru · ballots de 50 kg · lot #SCM-2609'),
  ('IMP-2026-00002', '2026-09-18', 'Italie',     'Jacquard Textile Como SRL',
   12, 420.000, 'FOB', 'EUR', 3.420000,
   16200.000, 'en_douane', NULL, NULL,
   'Tissu jacquard 180g/m² · 4 coloris · lot #JTC-26-18'),
  ('IMP-2026-00003', '2026-10-02', 'Allemagne',  'Dystar Colours Deutschland GmbH',
   6, 180.000, 'DAP', 'EUR', 3.420000,
   9800.000, 'liquide', 'TN-DED-2026-10114', '2026-10-14',
   'Colorants réactifs 5 teintes · fûts 30 kg · lot #DYS-26-10')
ON CONFLICT (numero_dossier) DO UPDATE SET
  statut = EXCLUDED.statut,
  cout_total_dt = EXCLUDED.cout_total_dt,
  updated_at = NOW();

-- Lignes dossier #1 (coton Chine)
WITH d AS (SELECT id_dossier FROM dossiers_import WHERE numero_dossier = 'IMP-2026-00001')
INSERT INTO dossiers_import_lignes (id_dossier, description_marchandise, quantite, unite, poids_kg, prix_unitaire_devise, montant_devise, cout_prorata_kg)
SELECT d.id_dossier, v.descr, v.qte, 'kg', v.poids, v.pu, v.montant, v.cpk FROM d, (VALUES
  ('Fil coton 24/1 écru - ballots 50 kg', 1200.000, 1200.000, 2.800000, 3360.000, 11.875),
  ('Fil coton 30/1 écru - ballots 50 kg',  800.000,  800.000, 3.200000, 2560.000, 11.875),
  ('Fil coton 40/1 écru - ballots 25 kg',  400.000,  400.000, 3.600000, 1440.000, 11.875)
) AS v(descr, qte, poids, pu, montant, cpk)
ON CONFLICT DO NOTHING;

-- Frais dossier #1
WITH d AS (SELECT id_dossier FROM dossiers_import WHERE numero_dossier = 'IMP-2026-00001')
INSERT INTO dossiers_import_frais (id_dossier, type_frais, libelle, montant_dt, repartition_prorata, date_frais)
SELECT d.id_dossier, v.tf, v.lib, v.m, v.prorata, v.dt FROM d, (VALUES
  ('fret',            'Transport maritime Qingdao → Radès', 3800.000, TRUE,  '2026-09-20'::DATE),
  ('assurance',       'Assurance cargo CIF',                 520.000, TRUE,  '2026-09-20'::DATE),
  ('douane',          'Droits de douane 15% + TVA',        4200.000, TRUE,  '2026-09-28'::DATE),
  ('transport_local', 'Transit Radès → atelier KH',          480.000, TRUE,  '2026-09-29'::DATE),
  ('manutention',     'Déchargement + stockage BO',          180.000, FALSE, '2026-09-29'::DATE)
) AS v(tf, lib, m, prorata, dt)
ON CONFLICT DO NOTHING;

-- Lignes dossier #2 (jacquard Italie)
WITH d AS (SELECT id_dossier FROM dossiers_import WHERE numero_dossier = 'IMP-2026-00002')
INSERT INTO dossiers_import_lignes (id_dossier, description_marchandise, quantite, unite, poids_kg, prix_unitaire_devise, montant_devise, cout_prorata_kg)
SELECT d.id_dossier, v.descr, v.qte, 'ml', v.poids, v.pu, v.montant, v.cpk FROM d, (VALUES
  ('Jacquard 180g/m² - coloris terracotta',  600.000, 108.000, 4.800000, 2880.000, 38.571),
  ('Jacquard 180g/m² - coloris sauge',       500.000,  90.000, 4.800000, 2400.000, 38.571),
  ('Jacquard 180g/m² - coloris indigo',      700.000, 126.000, 4.800000, 3360.000, 38.571),
  ('Jacquard 180g/m² - coloris or',          540.000,  97.000, 4.800000, 2592.000, 38.571)
) AS v(descr, qte, poids, pu, montant, cpk)
ON CONFLICT DO NOTHING;

-- Frais dossier #2
WITH d AS (SELECT id_dossier FROM dossiers_import WHERE numero_dossier = 'IMP-2026-00002')
INSERT INTO dossiers_import_frais (id_dossier, type_frais, libelle, montant_dt, repartition_prorata, date_frais)
SELECT d.id_dossier, v.tf, v.lib, v.m, v.prorata, v.dt FROM d, (VALUES
  ('fret',            'Camionnage Milan → La Goulette',   1900.000, TRUE,  '2026-09-25'::DATE),
  ('assurance',       'Assurance FOB upgrade',              180.000, TRUE,  '2026-09-25'::DATE),
  ('douane',          'DD 20% + TVA (en cours liquidation)', 2200.000, TRUE,  '2026-10-05'::DATE),
  ('commission',      'Commission transitaire',             260.000, FALSE, '2026-10-05'::DATE)
) AS v(tf, lib, m, prorata, dt)
ON CONFLICT DO NOTHING;

-- Lignes dossier #3 (colorant Allemagne)
WITH d AS (SELECT id_dossier FROM dossiers_import WHERE numero_dossier = 'IMP-2026-00003')
INSERT INTO dossiers_import_lignes (id_dossier, description_marchandise, quantite, unite, poids_kg, prix_unitaire_devise, montant_devise, cout_prorata_kg)
SELECT d.id_dossier, v.descr, v.qte, 'kg', v.poids, v.pu, v.montant, v.cpk FROM d, (VALUES
  ('Dystar Reactive Red - fût 30 kg',   60.000, 60.000, 14.200000,  852.000, 54.444),
  ('Dystar Reactive Blue - fût 30 kg',  30.000, 30.000, 14.800000,  444.000, 54.444),
  ('Dystar Reactive Yellow - fût 30 kg', 30.000, 30.000, 15.400000,  462.000, 54.444),
  ('Dystar Reactive Black - fût 30 kg', 30.000, 30.000, 13.600000,  408.000, 54.444),
  ('Dystar Reactive Green - fût 30 kg', 30.000, 30.000, 16.000000,  480.000, 54.444)
) AS v(descr, qte, poids, pu, montant, cpk)
ON CONFLICT DO NOTHING;

-- Frais dossier #3
WITH d AS (SELECT id_dossier FROM dossiers_import WHERE numero_dossier = 'IMP-2026-00003')
INSERT INTO dossiers_import_frais (id_dossier, type_frais, libelle, montant_dt, repartition_prorata, date_frais)
SELECT d.id_dossier, v.tf, v.lib, v.m, v.prorata, v.dt FROM d, (VALUES
  ('fret',            'Transport routier Hambourg → KH',  1600.000, TRUE,  '2026-10-10'::DATE),
  ('douane',          'DD 8% + TVA liquidés',             1200.000, TRUE,  '2026-10-14'::DATE),
  ('taxe',            'Taxe environnement chimiques',       280.000, TRUE,  '2026-10-14'::DATE),
  ('manutention',     'Transfert laboratoire',               120.000, FALSE, '2026-10-14'::DATE)
) AS v(tf, lib, m, prorata, dt)
ON CONFLICT DO NOTHING;

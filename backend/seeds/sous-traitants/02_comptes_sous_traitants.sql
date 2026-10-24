-- =====================================================================
-- Seed 02 — Comptes courants sous-traitants (soldes initiaux réalistes)
-- Soldes alignés sur « Compte Sous-Traitant 2024-2025.xlsx » (anonymisés).
-- date_reset_solde = 01/10/2025 pour les frange (§14quater.9 "ancien compte").
-- Idempotent.
-- =====================================================================

INSERT INTO comptes_sous_traitants
    (id_soustraitant, solde_initial, solde_courant, devise,
     date_dernier_mouvement, date_reset_solde, inactif, notes)
SELECT st.id_soustraitant, v.solde_init, v.solde_cur, 'TND',
       v.derniere_date::timestamptz, v.date_reset, FALSE, v.notes
FROM (VALUES
    ('ST-OURD-001',       23634.000,  6634.000,  '2025-04-26', NULL::date,            'Ourdissage Chokri — reste à payer après versements 2024-2025.'),
    ('ST-NOUA-001',        4280.000,   890.000,  '2026-09-30', NULL::date,            'Nouage Salem Mehdi — paiement hebdo ESP.'),
    ('ST-TEIN-SOBOLUX',    8220.000,  2050.000,  '2026-10-05', NULL::date,            'Teinture Sobolux — facturation Kg.'),
    ('ST-COUT-ADEL',      51095.700,  4287.567,  '2025-09-19', NULL::date,            'Couture Adel Chakroun — gros compte 2023-2025.'),
    ('ST-COUT-NEJI',        560.000,     0.000,  '2025-11-13', NULL::date,            'Couture Neji — soldes faibles.'),
    ('ST-BROD-NAJWA',     12440.000,  3220.000,  '2026-09-15', NULL::date,            'Broderie Najwa — réglages 2025.'),
    ('ST-PERS-MOSE',      31800.000, 15600.000,  '2026-08-30', NULL::date,            'Personnalisation Mose — grosse facturation sérigraphie.'),
    ('ST-FRAN-BAHRI',      1120.000,   220.000,  '2026-10-10', DATE '2025-10-01',     'Frange Lotfi Bahri — compte réinitialisé 01/10/2025.'),
    ('ST-FRAN-LEYLA',      1540.000,   425.000,  '2026-10-15', DATE '2025-10-01',     'Frange Leyla Khlifa — compte réinitialisé 01/10/2025.'),
    ('ST-FRAN-HATEM',       980.000,   198.000,  '2026-10-07', DATE '2025-10-01',     'Frange Hatem Ben Abid — compte réinitialisé 01/10/2025.'),
    ('ST-FRAN-ALI',        1225.000,   825.000,  '2026-02-19', DATE '2025-10-01',     'Frange Ali Sassi — anomalies retours tardifs à régulariser.'),
    ('ST-FRAN-SAMIRA',      890.000,    96.000,  '2026-02-20', DATE '2025-10-01',     'Frange Samira — réglages ESP.'),
    ('ST-FINI-DIMATEX',   48200.000, 12800.000,  '2026-09-25', NULL::date,            'Finition Dimatex — 90j fin de mois.'),
    ('ST-PERS-ALI-TH',    58849.600, -2583.335,  '2026-06-15', NULL::date,            'Personnalisation Ali Thabet — avance paiements.'),
    ('ST-COUT-BENTAISSA', 28442.100,     0.000,  '2025-08-09', NULL::date,            'Couture Bent Aissa — soldé fin 2025.')
) AS v(code, solde_init, solde_cur, derniere_date, date_reset, notes)
JOIN sous_traitants st ON st.code = v.code
ON CONFLICT (id_soustraitant) DO UPDATE SET
    solde_initial = EXCLUDED.solde_initial,
    solde_courant = EXCLUDED.solde_courant,
    date_dernier_mouvement = EXCLUDED.date_dernier_mouvement,
    date_reset_solde = EXCLUDED.date_reset_solde,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- =============================================================================
-- 03_ajustements.sql — Ajustements comptes RH démo
--
-- Codes auto AJ-{NOM}-{YYYY}-{NN} (nom en MAJUSCULES, pattern contrat §11bis).
-- Idempotent via DELETE WHERE motif LIKE '[DEMO]%'.
-- =============================================================================

DELETE FROM ajustements_comptes_rh WHERE motif LIKE '[DEMO]%';

INSERT INTO ajustements_comptes_rh (
  code_ajustement, id_employe, date_ajustement, montant,
  motif, type_ajustement, ancienne_valeur, nouvelle_valeur,
  cree_par, valide_par, date_validation, statut_validation
)
SELECT v.code_ajustement, e.id_employe, v.date_ajustement, v.montant,
       v.motif, v.type_ajustement, v.ancienne_valeur, v.nouvelle_valeur,
       v.cree_par, v.valide_par, v.date_validation, v.statut_validation
FROM (
  VALUES
    -- 1. Reset à zéro fin septembre (contrat §11bis.3 — exemple SALEM)
    ('AJ-SALEM-2026-07', 'EMP-001', '2026-09-30'::date, 320.500::numeric,
     '[DEMO] Reset à zéro fin septembre 2026 (RH mensuel)',
     'reset_zero', 320.500::numeric, 0.000::numeric,
     15::bigint, 1::bigint, '2026-09-30 18:00:00+00'::timestamptz, 'validee'),

    -- 2. Correction solde Amdouni (compensation CNSS + IRPP cumulée)
    ('AJ-AMDOUNI-2026-04', 'EMP-002', '2026-10-15'::date, 4764.133::numeric,
     '[DEMO] Correction solde CNSS+IRPP cumul 2024-2026 (régularisation gérant)',
     'correction_solde', 0.000::numeric, 4764.133::numeric,
     15::bigint, NULL::bigint, NULL::timestamptz, 'en_attente'),

    -- 3. Régularisation Oueslati (débit remboursement avance)
    ('AJ-OUESLATI-2026-02', 'EMP-011', '2026-10-20'::date, -120.000::numeric,
     '[DEMO] Régularisation remboursement avance partielle non prélevée en octobre',
     'regularisation', 0.000::numeric, -120.000::numeric,
     15::bigint, 1::bigint, '2026-10-20 17:30:00+00'::timestamptz, 'validee')
) AS v(code_ajustement, matricule, date_ajustement, montant,
       motif, type_ajustement, ancienne_valeur, nouvelle_valeur,
       cree_par, valide_par, date_validation, statut_validation)
JOIN employes e ON e.matricule = v.matricule;

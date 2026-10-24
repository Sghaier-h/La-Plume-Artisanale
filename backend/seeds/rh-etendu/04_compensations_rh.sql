-- =============================================================================
-- 04_compensations_rh.sql — Compensations CNSS / IRPP / acompte privé
--
-- Exemple contrat : Najwa Amdouni 4764.133 DT (CNSS cumul 2024-2026).
-- =============================================================================

DELETE FROM compensations_rh WHERE motif LIKE '[DEMO]%';

INSERT INTO compensations_rh (
  id_employe, date_compensation, type_compensation,
  montant_a_compenser, source, statut, motif, cree_par
)
SELECT e.id_employe, v.date_compensation, v.type_compensation,
       v.montant_a_compenser, v.source, v.statut, v.motif, v.cree_par
FROM (
  VALUES
    -- 1. Compensation CNSS salariée Amdouni (exemple contrat 4764.133)
    ('EMP-002', '2026-10-15'::date, 'cnss_salarie',
     4764.133::numeric, 'caisse_compensation', 'en_attente',
     '[DEMO] CNSS salariée cumul 2024-2026 — régularisation gérant', 15::bigint),

    -- 2. CNSS employeur sur le même employé
    ('EMP-002', '2026-10-15'::date, 'cnss_employeur',
     8597.820::numeric, 'caisse_compensation', 'en_attente',
     '[DEMO] CNSS employeur cumul 2024-2026 — régularisation gérant', 15::bigint),

    -- 3. IRPP Khemiri
    ('EMP-004', '2026-09-30'::date, 'impot_irpp',
     185.400::numeric, 'salaire', 'appliquee',
     '[DEMO] IRPP septembre 2026 compensé sur salaire', 15::bigint),

    -- 4. Acompte privé Trabelsi
    ('EMP-005', '2026-10-05'::date, 'acompte_prive',
     80.000::numeric, 'salaire', 'appliquee',
     '[DEMO] Acompte privé (gérant → employé) compensé sur salaire', 15::bigint),

    -- 5. Avance remboursement Jebali
    ('EMP-007', '2026-10-05'::date, 'avance_remboursement',
     240.000::numeric, 'salaire', 'appliquee',
     '[DEMO] 2e mensualité de 3 — remboursement avance 1200 DT', 15::bigint)
) AS v(matricule, date_compensation, type_compensation,
       montant_a_compenser, source, statut, motif, cree_par)
JOIN employes e ON e.matricule = v.matricule;

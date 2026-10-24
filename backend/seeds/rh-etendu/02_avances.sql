-- =============================================================================
-- 02_avances.sql — 8 avances démo (demandées, approuvées, payées, remboursements)
--
-- Les montants sont basés sur « SUIVIS SALAIRE.xlsx ». Idempotent via
-- DELETE+INSERT ciblé par (id_employe + date_demande + motif).
-- =============================================================================

-- Nettoyage ciblé (idempotence)
DELETE FROM avances_salaires
 WHERE motif LIKE '[DEMO]%';

INSERT INTO avances_salaires (
  id_employe, date_demande, montant_demande, motif,
  date_approbation, approuve_par,
  statut, date_paiement, modalite_remboursement, solde_restant_avance
)
SELECT e.id_employe, v.*
FROM (
  VALUES
    -- 1. Avance en attente (demande)
    ('EMP-003','2026-10-20'::date, 500.000, '[DEMO] Frais médicaux urgents',
     NULL::date, NULL::bigint, 'demande', NULL::date, NULL::varchar, 0::numeric),

    -- 2. Avance approuvée mais pas encore payée
    ('EMP-005','2026-10-18'::date, 300.000, '[DEMO] Rentrée scolaire enfants',
     '2026-10-19'::date, 15::bigint, 'approuvee', NULL::date, 'prochain_salaire', 300.000),

    -- 3. Avance payée (en cours de remboursement)
    ('EMP-007','2026-09-05'::date, 1200.000, '[DEMO] Réparation voiture',
     '2026-09-06'::date, 15::bigint, 'payee', '2026-09-07'::date, 'mensualites_3', 480.000),

    -- 4. Avance payée (prochain salaire)
    ('EMP-011','2026-10-10'::date, 400.000, '[DEMO] Achat fournitures scolaires',
     '2026-10-10'::date, 15::bigint, 'payee', '2026-10-11'::date, 'prochain_salaire', 400.000),

    -- 5. Avance remboursée totalement
    ('EMP-004','2026-07-01'::date, 600.000, '[DEMO] Déplacement familial',
     '2026-07-02'::date, 15::bigint, 'remboursee_total', '2026-07-03'::date, 'mensualites_2', 0.000),

    -- 6. Avance remboursée partiellement
    ('EMP-009','2026-08-15'::date, 900.000, '[DEMO] Mariage',
     '2026-08-16'::date, 15::bigint, 'remboursee_partiel', '2026-08-17'::date, 'mensualites_6', 150.000),

    -- 7. Avance refusée
    ('EMP-010','2026-10-12'::date, 2000.000, '[DEMO] Achat véhicule',
     '2026-10-13'::date, 15::bigint, 'refusee', NULL::date, NULL::varchar, 0.000),

    -- 8. Avance en attente (petite somme)
    ('EMP-006','2026-10-22'::date, 150.000, '[DEMO] Avance exceptionnelle',
     NULL::date, NULL::bigint, 'demande', NULL::date, NULL::varchar, 0::numeric)
) AS v(matricule, date_demande, montant_demande, motif,
       date_approbation, approuve_par, statut, date_paiement,
       modalite_remboursement, solde_restant_avance)
JOIN employes e ON e.matricule = v.matricule;

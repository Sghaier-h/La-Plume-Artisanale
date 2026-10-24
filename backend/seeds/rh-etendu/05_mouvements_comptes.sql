-- =============================================================================
-- 05_mouvements_comptes.sql — Historique de mouvements variés
--
-- Idempotence : DELETE WHERE libelle LIKE '[DEMO]%'.
-- =============================================================================

DELETE FROM comptes_employes_mouvements WHERE libelle LIKE '[DEMO]%';

INSERT INTO comptes_employes_mouvements (
  id_employe, date_mouvement, type_mvt, sens, montant, libelle, solde_apres, cree_par
)
SELECT e.id_employe, v.date_mouvement, v.type_mvt, v.sens, v.montant,
       v.libelle, v.solde_apres, v.cree_par
FROM (
  VALUES
    -- EMP-001 Salem (reset zéro)
    ('EMP-001','2026-09-25 09:00:00+00'::timestamptz,'salaire',    'C', 850.000, '[DEMO] Bulletin septembre 2026', 850.000, 15::bigint),
    ('EMP-001','2026-09-28 10:00:00+00'::timestamptz,'prime',      'C', 120.500, '[DEMO] Prime rendement §11bis.7bis', 970.500, 15::bigint),
    ('EMP-001','2026-09-30 18:00:00+00'::timestamptz,'ajustement', 'D', 970.500, '[DEMO] Reset à zéro fin septembre (AJ-SALEM-2026-07)', 0.000, 1::bigint),

    -- EMP-002 Amdouni (compensation CNSS en attente)
    ('EMP-002','2026-10-15 11:00:00+00'::timestamptz,'ajustement', 'C', 4764.133, '[DEMO] Correction solde CNSS 2024-2026 (en attente validation)', 4764.133, 15::bigint),

    -- EMP-003 Ben Ali (solde négatif après avance)
    ('EMP-003','2026-10-01 08:00:00+00'::timestamptz,'salaire',    'C', 920.000, '[DEMO] Bulletin septembre 2026', 920.000, 15::bigint),
    ('EMP-003','2026-10-10 14:00:00+00'::timestamptz,'avance',     'D', 1170.000, '[DEMO] Avance exceptionnelle', -250.000, 15::bigint),

    -- EMP-005 Trabelsi (petit solde créditeur)
    ('EMP-005','2026-10-05 09:00:00+00'::timestamptz,'salaire',    'C', 780.000, '[DEMO] Bulletin septembre 2026', 780.000, 15::bigint),
    ('EMP-005','2026-10-05 09:05:00+00'::timestamptz,'compensation','D',  80.000, '[DEMO] Acompte privé compensé', 700.000, 15::bigint),
    ('EMP-005','2026-10-05 09:10:00+00'::timestamptz,'retenue',    'D', 579.500, '[DEMO] Prélèvement salaire net viré', 120.500, 15::bigint),

    -- EMP-007 Jebali (solde négatif remboursement avance)
    ('EMP-007','2026-09-07 12:00:00+00'::timestamptz,'avance',     'D', 1200.000, '[DEMO] Avance réparation voiture', -1200.000, 15::bigint),
    ('EMP-007','2026-09-30 09:00:00+00'::timestamptz,'remboursement_avance','C',360.000,'[DEMO] 1ère mensualité remboursement avance',-840.000, 15::bigint),
    ('EMP-007','2026-10-30 09:00:00+00'::timestamptz,'remboursement_avance','C',360.000,'[DEMO] 2e mensualité remboursement avance',-480.000, 15::bigint),

    -- EMP-009 Mejri (solde positif à verser)
    ('EMP-009','2026-10-01 09:00:00+00'::timestamptz,'salaire',    'C', 1050.000, '[DEMO] Bulletin septembre 2026', 1050.000, 15::bigint),
    ('EMP-009','2026-10-05 10:00:00+00'::timestamptz,'retenue',    'D', 200.000, '[DEMO] Retenue CNSS employé', 850.000, 15::bigint),

    -- EMP-011 Oueslati (solde négatif avance partiel)
    ('EMP-011','2026-10-11 08:00:00+00'::timestamptz,'avance',     'D', 400.000, '[DEMO] Avance fournitures scolaires', -400.000, 15::bigint),
    ('EMP-011','2026-10-20 17:30:00+00'::timestamptz,'ajustement', 'C', 280.000, '[DEMO] Régularisation partielle (AJ-OUESLATI-2026-02)', -120.000, 1::bigint)
) AS v(matricule, date_mouvement, type_mvt, sens, montant, libelle, solde_apres, cree_par)
JOIN employes e ON e.matricule = v.matricule;

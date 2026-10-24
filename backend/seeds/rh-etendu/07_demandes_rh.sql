-- =============================================================================
-- 07_demandes_rh.sql — Demandes RH démo (tablette "Mes demandes")
-- =============================================================================

DELETE FROM demandes_rh WHERE objet LIKE '[DEMO]%';

INSERT INTO demandes_rh (
  id_employe, type_demande, objet, description,
  montant_demande, date_debut_conge, date_fin_conge,
  statut, date_demande
)
SELECT e.id_employe, v.type_demande, v.objet, v.description,
       v.montant_demande, v.date_debut_conge, v.date_fin_conge,
       v.statut, v.date_demande
FROM (
  VALUES
    ('EMP-003','avance',             '[DEMO] Avance frais médicaux',    'Frais médicaux urgents enfant',    500.000::numeric, NULL::date, NULL::date,'demande', '2026-10-20 10:15:00+00'::timestamptz),
    ('EMP-005','conge',              '[DEMO] Congé rentrée scolaire',   'Rentrée scolaire 2026-2027',         NULL::numeric, '2026-09-14'::date, '2026-09-16'::date,'approuvee','2026-09-05 09:00:00+00'::timestamptz),
    ('EMP-007','attestation_travail','[DEMO] Attestation banque',       'Pour demande de prêt bancaire',      NULL::numeric, NULL::date, NULL::date,'cloturee', '2026-09-20 11:00:00+00'::timestamptz),
    ('EMP-009','probleme_machine',   '[DEMO] Problème machine T-04',    'Métier à tisser arrête régulièrement — bruit anormal', NULL::numeric, NULL::date, NULL::date,'en_cours', '2026-10-18 14:30:00+00'::timestamptz),
    ('EMP-010','bulletin',           '[DEMO] Bulletin septembre',       'Je souhaite récupérer mon bulletin de paie',  NULL::numeric, NULL::date, NULL::date,'cloturee', '2026-10-05 08:00:00+00'::timestamptz),
    ('EMP-011','probleme_rh',        '[DEMO] Question remboursement avance','Comprendre les mensualités',  NULL::numeric, NULL::date, NULL::date,'en_cours','2026-10-19 16:00:00+00'::timestamptz),
    ('EMP-012','autre',              '[DEMO] Demande transfert banque', 'Je souhaite changer mon RIB pour BIAT', NULL::numeric, NULL::date, NULL::date,'demande', '2026-10-22 09:30:00+00'::timestamptz)
) AS v(matricule, type_demande, objet, description,
       montant_demande, date_debut_conge, date_fin_conge, statut, date_demande)
JOIN employes e ON e.matricule = v.matricule;

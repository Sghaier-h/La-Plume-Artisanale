-- =====================================================================
-- Seed 05 — Mouvements comptes ST (créances, paiements, compensations)
-- Alimente `comptes_sous_traitants_mouvements` ET déclenche le trigger
-- `trg_cst_update_solde` → `solde_courant` recalculé automatiquement.
-- Idempotent : purge d'abord les mouvements seed, puis ré-insère.
-- =====================================================================

-- Purge sécurisée des seeds précédents (uniquement libellés commençant par [SEED])
DELETE FROM comptes_sous_traitants_mouvements WHERE libelle LIKE '[SEED]%';

-- Pour chaque compte, on remet d'abord le solde_courant au solde_initial
-- (sinon la ré-exécution du seed cumule les créances/paiements). Les
-- mouvements historiques insérés recalculent ensuite via trigger.
UPDATE comptes_sous_traitants SET solde_courant = solde_initial;

INSERT INTO comptes_sous_traitants_mouvements
    (id_compte_st, date_mouvement, type_mvt, montant, libelle, reference_externe)
SELECT cst.id_compte_st, v.date::timestamptz, v.type::cst_type_mvt_enum,
       v.montant, '[SEED] ' || v.libelle, v.reference
FROM (VALUES
    -- Chokri Haddad
    ('ST-OURD-001',       '2024-08-16', 'paiement',   -10000.000, 'Paiement ESP Chokri',           'ESP-240816'),
    ('ST-OURD-001',       '2024-10-03', 'paiement',    -2000.000, 'Paiement ESP Chokri',           'ESP-241003'),
    ('ST-OURD-001',       '2025-04-26', 'paiement',    -5000.000, 'Paiement ESP Chokri',           'ESP-250426'),

    -- Salem Mehdi
    ('ST-NOUA-001',       '2026-07-15', 'creance',       180.000, 'Nouage 12 ensouples',           'TR-N001'),
    ('ST-NOUA-001',       '2026-08-20', 'paiement',     -200.000, 'Paiement ESP hebdo',            'ESP-260820'),

    -- Sobolux
    ('ST-TEIN-SOBOLUX',   '2026-05-12', 'creance',       708.000, 'Teinture Kaki + Cèdre',         'FA-SOB-021'),
    ('ST-TEIN-SOBOLUX',   '2026-07-14', 'paiement',    -2000.000, 'VIR BIAT Sobolux',              'VIR-260714'),

    -- Adel Chakroun
    ('ST-COUT-ADEL',      '2023-07-04', 'paiement',    -3000.000, 'Paiement ESP Adel',             'ESP-230704'),
    ('ST-COUT-ADEL',      '2023-10-14', 'paiement',    -5000.000, 'Paiement ESP Adel',             'ESP-231014'),
    ('ST-COUT-ADEL',      '2024-04-05', 'paiement',     -144.000, 'CARTE CA Adel',                 'CA-240405'),
    ('ST-COUT-ADEL',      '2024-05-25', 'paiement',    -2000.000, 'Paiement ESP Adel',             'ESP-240525'),
    ('ST-COUT-ADEL',      '2024-09-25', 'paiement',    -8000.000, 'Paiement ESP Adel',             'ESP-240925'),
    ('ST-COUT-ADEL',      '2025-07-07', 'paiement',    -6000.000, 'Paiement ESP Adel',             'ESP-250707'),
    ('ST-COUT-ADEL',      '2025-08-30', 'compensation',-4764.133, 'Compensation CHARGE Adel',      'CHG-250830'),
    ('ST-COUT-ADEL',      '2025-09-19', 'paiement',    -8000.000, 'Paiement ESP Adel',             'ESP-250919'),

    -- Neji
    ('ST-COUT-NEJI',      '2025-04-18', 'creance',         70.000, 'Lot avril',                     'TR-NEJI-04'),
    ('ST-COUT-NEJI',      '2025-05-28', 'paiement',       -60.000, 'ESP mensuel',                   'ESP-250528'),

    -- Najwa Amdouni
    ('ST-BROD-NAJWA',     '2025-10-16', 'paiement',    -8604.000, 'Vir Facture 19/2025',           'VIR-251016'),
    ('ST-BROD-NAJWA',     '2026-06-15', 'paiement',    -6633.975, 'CHEQUE CLIENT',                 'CHQ-260615'),

    -- Mose
    ('ST-PERS-MOSE',      '2025-09-12', 'paiement',   -27880.000, 'VIR STB EUR Mose',              'VIR-250912'),
    ('ST-PERS-MOSE',      '2025-09-22', 'ajustement',  -7627.428, 'BILAN 2024',                    'BIL-250922'),
    ('ST-PERS-MOSE',      '2026-02-24', 'creance',    13104.000, 'Chaine 1008 kg',                 'TR-MOSE-02'),

    -- Franges (compte réinitialisé 01/10/2025)
    ('ST-FRAN-ALI',       '2026-01-01', 'creance',       1548.150, 'Dû de 2025',                    'INIT-2025'),
    ('ST-FRAN-ALI',       '2026-02-19', 'paiement',     -1400.000, 'ESP Ali Sassi',                 'ESP-260219'),

    ('ST-FRAN-SAMIRA',    '2026-01-01', 'creance',         73.000, 'Dû de 2025',                    'INIT-2025'),
    ('ST-FRAN-SAMIRA',    '2026-02-07', 'paiement',      -700.000, 'ESP Samira',                    'ESP-260207'),
    ('ST-FRAN-SAMIRA',    '2026-02-20', 'paiement',      -896.000, 'ESP Samira',                    'ESP-260220'),

    ('ST-FRAN-LEYLA',     '2026-01-01', 'creance',        115.000, 'Dû de 2025',                    'INIT-2025'),
    ('ST-FRAN-LEYLA',     '2026-02-20', 'paiement',     -1314.000, 'ESP Leyla Khlifa',              'ESP-260220'),

    ('ST-FRAN-HATEM',     '2026-02-26', 'paiement',      -203.000, 'ESP Hatem Ben Abid',            'ESP-260226'),

    -- Dimatex
    ('ST-FINI-DIMATEX',   '2026-07-30', 'creance',       1080.000, 'Lavage finition grosse série', 'TR-DIM-07'),
    ('ST-FINI-DIMATEX',   '2026-09-15', 'paiement',    -15000.000, 'VIR BIAT Dimatex',              'VIR-260915'),

    -- Ali Thabet
    ('ST-PERS-ALI-TH',    '2024-04-16', 'paiement',    -5000.000, 'ESP Ali Thabet',                'ESP-240416'),
    ('ST-PERS-ALI-TH',    '2024-07-24', 'paiement',   -16750.000, 'VIR REV Ali Thabet',            'VIR-240724'),
    ('ST-PERS-ALI-TH',    '2025-10-16', 'paiement',    -8604.000, 'VIR Facture 19/2025',           'VIR-251016'),
    ('ST-PERS-ALI-TH',    '2025-10-22', 'paiement',     -350.000, 'WESTERN 101',                   'WST-251022'),
    ('ST-PERS-ALI-TH',    '2026-06-15', 'paiement',    -6633.975, 'CHEQUE CLIENT',                 'CHQ-260615'),
    ('ST-PERS-ALI-TH',    '2026-06-15', 'paiement',    -4534.960, 'CHEQUE CLIENT',                 'CHQ2-260615'),

    -- Bent Aissa
    ('ST-COUT-BENTAISSA', '2025-05-23', 'paiement',    -1000.000, 'ESP Bent Aissa',                'ESP-250523'),
    ('ST-COUT-BENTAISSA', '2025-05-26', 'paiement',    -4400.000, 'VIR BIAT',                      'VIR-250526'),
    ('ST-COUT-BENTAISSA', '2025-06-17', 'paiement',    -5000.000, 'VIR BIAT',                      'VIR-250617'),
    ('ST-COUT-BENTAISSA', '2025-07-18', 'paiement',    -1800.000, 'VIR BIAT',                      'VIR-250718'),
    ('ST-COUT-BENTAISSA', '2025-08-09', 'paiement',    -1592.100, 'VIR BIAT final',                'VIR-250809')
) AS v(code, date, type, montant, libelle, reference)
JOIN sous_traitants st ON st.code = v.code
JOIN comptes_sous_traitants cst ON cst.id_soustraitant = st.id_soustraitant;

-- =====================================================================
-- Anomalies seed (jeu de 10 pour démo)
-- =====================================================================
DELETE FROM anomalies_sous_traitant WHERE description LIKE '[SEED]%';

INSERT INTO anomalies_sous_traitant
    (id_soustraitant, gravite, type_anomalie, description, numero_suivi,
     date_anomalie, qte_sortie, qte_retour, detaille, proposition, resolu)
SELECT st.id_soustraitant, v.gravite::st_anomalie_gravite_enum, v.type_ano,
       '[SEED] ' || v.description, v.numero_suivi,
       (NOW() - (v.jours_offset || ' days')::interval), v.qte_sortie, v.qte_retour,
       v.detaille, v.proposition, v.resolu
FROM (VALUES
    ('ST-FRAN-ALI',     'a_corriger', 'N° encore chez Ali Sassi',       'Lot oublié chez Ali Sassi',       'OF270050-47', 2,  5, 0, 'Sorti le 22/10/2026 jamais retourné', 'Vérifier qui a le lot ; compter l''inventaire', FALSE),
    ('ST-FRAN-ALI',     'a_corriger', 'N° encore chez Ali Sassi',       'Lot oublié 48',                   'OF270050-48', 2,  5, 0, 'Idem lot 47', 'Vérifier inventaire physique', FALSE),
    ('ST-FRAN-SAMIRA',  'a_corriger', 'Plusieurs sorties du même n°',   'Doublon de sortie n°47',          'OF270050-47', 2,  5, 5, 'Sortie dupliquée dans scan', 'Annuler la seconde sortie', FALSE),
    ('ST-FRAN-LEYLA',   'corrige_auto','Ligne en double (même scan)',  'Ligne scan dédupliquée auto',     'OF270008-23', 17, 5, 5, 'Scan répété 2x à la seconde', 'Déjà corrigé par le système', TRUE),
    ('ST-FRAN-HATEM',   'info',        'Retour non scanné',              'Lot retrouvé emballé — ajouté',  'OF270060-12', 10, 5, 5, 'Lot physiquement présent mais pas scanné au retour', 'Ajout manuel retour', TRUE),
    ('ST-FRAN-BAHRI',   'critique',    'Retour sans sortie',             'Retour sans sortie correspondante','OF270066-01', 3,  0, 10,'Pièce retournée sans trace de sortie — anomalie majeure','Vérifier historique sorties manuelles', FALSE),
    ('ST-TEIN-SOBOLUX', 'a_corriger',  'Qté retour inférieure attendu',  'Teinture — 2 Kg manquants',       'BSST-00003',  12, 60, 42, '60Kg envoyés, 42 reçus - 18 Kg manquants','Demander explication Sobolux', FALSE),
    ('ST-COUT-ADEL',    'info',        'Qté 2eme choix élevée',          'Taux 2ème choix 6% ourlet',       'OF-NATXLR',   30, 240, 226, '14 pièces 2eme choix sur 240 (5,8%)', 'Dans la zone surveillance 5-7%', FALSE),
    ('ST-FRAN-ALI',     'a_corriger',  'Retour tardif',                  'Retour +10j après date prévue',   'BSST-00006',  20, 120, 100, '20 pièces manquantes au retour tardif','Dialogue + compensation', FALSE),
    ('ST-FINI-DIMATEX', 'info',        'Délai dépassé',                  'Délai 15j dépassé de 3j',         'OF240469',    100, 132, 132,'Finition rendue tardivement', 'Dialogue partenaire', TRUE)
) AS v(code, gravite, type_ano, description, numero_suivi, jours_offset, qte_sortie, qte_retour, detaille, proposition, resolu)
JOIN sous_traitants st ON st.code = v.code;

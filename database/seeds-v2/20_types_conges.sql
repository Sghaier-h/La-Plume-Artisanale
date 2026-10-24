-- Seed — Types de congés Tunisie (Code du Travail tunisien)
INSERT INTO types_conges (code, libelle, remunere, duree_max_jours, justificatif_requis) VALUES
    ('ANNUEL',    'Congé annuel payé',          TRUE,  30,  FALSE),
    ('MALADIE',   'Congé maladie',              TRUE,  180, TRUE),  -- certificat médical
    ('MATERNITE', 'Congé maternité',            TRUE,  30,  TRUE),  -- 30 j Tunisie
    ('PATERNITE', 'Congé paternité',            TRUE,  2,   TRUE),
    ('DEUIL',     'Congé de deuil',             TRUE,  3,   TRUE),
    ('MARIAGE',   'Congé exceptionnel mariage', TRUE,  3,   TRUE),
    ('NAISSANCE', 'Congé exceptionnel naissance',TRUE, 2,   TRUE),
    ('SANS_SOLDE','Congé sans solde',           FALSE, NULL,FALSE),
    ('FORMATION', 'Congé formation',            TRUE,  30,  TRUE),
    ('PELERINAGE','Congé pèlerinage (hajj)',    FALSE, 30,  TRUE)
ON CONFLICT (code) DO NOTHING;

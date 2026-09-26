-- Seed — Journaux comptables standards
INSERT INTO journaux_comptables (code, intitule, type_journal, compte_contrepartie) VALUES
    ('VE', 'Journal des ventes',          'ventes',  '411'),
    ('AC', 'Journal des achats',          'achats',  '401'),
    ('BQ', 'Journal de banque',           'banque',  '53'),
    ('CA', 'Journal de caisse',           'caisse',  '54'),
    ('OD', 'Journal des opérations diverses', 'od',  NULL)
ON CONFLICT (code) DO NOTHING;

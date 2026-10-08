-- Seed — Taux TVA Tunisie
INSERT INTO tva_taux (code, taux_pct, libelle, compte_collectee, compte_deductible, est_defaut, actif) VALUES
    ('TVA19', 19.00, 'TVA taux standard 19%',         '4367', '4366', TRUE,  TRUE),
    ('TVA13', 13.00, 'TVA taux intermédiaire 13%',    '4367', '4366', FALSE, TRUE),
    ('TVA7',   7.00, 'TVA taux réduit 7%',            '4367', '4366', FALSE, TRUE),
    ('TVA0',   0.00, 'TVA 0% - Export/Exonéré',       '4367', '4366', FALSE, TRUE)
ON CONFLICT (code) DO NOTHING;

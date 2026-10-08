-- Seeds — Sélecteurs S01..S08 + Lettres UBTQCS (§5.5)

INSERT INTO variantes_selecteurs (code, numero, libelle, role, valeurs_possibles) VALUES
    ('S01', 1, 'Chaîne — fil principal',            'chaine',   '[]'::jsonb),
    ('S02', 2, 'Trame 1 — couleur base',            'trame',    '[]'::jsonb),
    ('S03', 3, 'Trame 2 — nuance / rayure',         'trame',    '[]'::jsonb),
    ('S04', 4, 'Trame 3 — couleur additionnelle',   'trame',    '[]'::jsonb),
    ('S05', 5, 'Trame 4 — couleur additionnelle',   'trame',    '[]'::jsonb),
    ('S06', 6, 'Trame 5 — couleur additionnelle',   'trame',    '[]'::jsonb),
    ('S07', 7, 'Fourniture / finition',             'fourniture','[]'::jsonb),
    ('S08', 8, 'Emballage / étiquette',             'emballage','[]'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- Lettres UBTQCS (+SP, H) : correspondance nombre de couleurs
-- U=1 (Uni, absent dans la ref), B=2, T=3, Q=4, C=5, S=6, SP=7, H=8
INSERT INTO lettres_couleurs (lettre, nombre_couleurs, libelle, absent_dans_ref, ordre_affichage) VALUES
    ('U',  1, 'Uni',        TRUE,  1),
    ('B',  2, 'Bicolore',   FALSE, 2),
    ('T',  3, 'Tricolore',  FALSE, 3),
    ('Q',  4, 'Quadri',     FALSE, 4),
    ('C',  5, 'Cinq',       FALSE, 5),
    ('S',  6, 'Six',        FALSE, 6),
    ('SP', 7, 'Sept',       FALSE, 7),
    ('H',  8, 'Huit',       FALSE, 8)
ON CONFLICT (lettre) DO NOTHING;

-- Seeds — Familles de pièces de rechange (§6.1 domain.md)
-- Utilise la table familles_articles comme référentiel commun (parent = PIECE_RECHANGE)

WITH parent AS (
    SELECT id_famille FROM familles_articles WHERE code = 'PIECE_RECHANGE'
)
INSERT INTO familles_articles (code, libelle, description, id_famille_parent, ordre_affichage, actif)
SELECT v.code, v.libelle, v.description, parent.id_famille, v.ordre, TRUE
FROM parent, (VALUES
    ('PR_PEIGNES',      'Peignes',              'Peignes de métiers à tisser',        1),
    ('PR_LISSES',       'Lisses',               'Lisses métalliques',                 2),
    ('PR_COURROIES',    'Courroies',            'Courroies de transmission',          3),
    ('PR_CAMES',        'Cames',                'Cames mécaniques',                   4),
    ('PR_ROULEMENTS',   'Roulements',           'Roulements à billes / rouleaux',     5),
    ('PR_NAVETTES',     'Navettes',             'Navettes tissage',                   6),
    ('PR_CARTES_ELEC',  'Cartes électroniques', 'Cartes électroniques Dornier',       7),
    ('PR_MOTEURS',      'Moteurs',              'Moteurs et servomoteurs',            8),
    ('PR_CAPTEURS',     'Capteurs',             'Capteurs / détecteurs',              9),
    ('PR_HYDRAULIQUE',  'Hydraulique',          'Vérins, joints hydrauliques',       10),
    ('PR_PNEUMATIQUE',  'Pneumatique',          'Vérins, valves pneumatiques',       11),
    ('PR_ELECTRIQUE',   'Électrique',           'Câbles, contacteurs, disjoncteurs', 12)
) AS v(code, libelle, description, ordre)
ON CONFLICT (code) DO NOTHING;

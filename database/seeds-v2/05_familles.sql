-- Seeds — Familles articles (§5 domain.md)
INSERT INTO familles_articles (code, libelle, description, ordre_affichage, actif) VALUES
    ('FOUTA_PLAGE',   'Fouta Plage',         'Foutas destinées à la plage',              10, TRUE),
    ('FOUTA_HAMMAM',  'Fouta Hammam',        'Foutas traditionnelles hammam',            20, TRUE),
    ('SERVIETTE',     'Serviette',           'Serviettes éponge et coton',               30, TRUE),
    ('TAPIS',         'Tapis',               'Tapis tissés',                             40, TRUE),
    ('COUSSIN',       'Coussin',             'Coussins déco',                            50, TRUE),
    ('PONCHO',        'Poncho',              'Ponchos et capes',                         60, TRUE),
    ('ECHARPE',       'Écharpe',             'Écharpes et étoles',                       70, TRUE),
    ('SAC',           'Sac',                 'Sacs et pochettes',                        80, TRUE),
    ('PACK',          'Pack',                'Assortiments (Pack Chic, Pack Voyage…)',   90, TRUE),
    ('JETE',          'Jeté',                'Jetés de lit / canapé',                   100, TRUE),
    ('NAPPE',         'Nappe',               'Nappes et chemins de table',              110, TRUE),
    ('MP_FIL',        'MP - Fil',            'Matière première fil coton/polyester',    200, TRUE),
    ('MP_AUTRE',      'MP - Autres',         'Autres matières premières',               210, TRUE),
    ('EMBALLAGE',     'Emballage',           'Cartons, sachets, étiquettes',            300, TRUE),
    ('FOURNITURE',    'Fourniture atelier',  'Aiguilles, huile, ciseaux, navettes',     310, TRUE),
    ('PIECE_RECHANGE','Pièce rechange',      'Pièces machines',                         320, TRUE)
ON CONFLICT (code) DO NOTHING;

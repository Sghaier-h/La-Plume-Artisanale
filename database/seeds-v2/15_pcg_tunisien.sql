-- =====================================================================
-- Seed — Plan Comptable Général Tunisie (extrait usuel)
-- Classes 1 à 7, comptes principaux + comptes usuels ERP textile
-- =====================================================================

INSERT INTO plan_comptable_tunisien (numero_compte, intitule, classe, nature, compte_parent, est_collectif, lettrable) VALUES
-- Classe 1 : Capitaux propres et passifs non courants
('1',    'CAPITAUX PROPRES ET PASSIFS NON COURANTS', 1, 'passif',  NULL, FALSE, FALSE),
('101',  'Capital social',                            1, 'passif',  '1',   FALSE, FALSE),
('106',  'Réserves',                                  1, 'passif',  '1',   FALSE, FALSE),
('12',   'Résultat de l''exercice',                   1, 'passif',  '1',   FALSE, FALSE),
('16',   'Emprunts et dettes assimilées',             1, 'passif',  '1',   FALSE, FALSE),

-- Classe 2 : Actifs non courants
('2',    'ACTIFS NON COURANTS',                        2, 'actif',   NULL, FALSE, FALSE),
('21',   'Immobilisations corporelles',                2, 'actif',   '2',   FALSE, FALSE),
('213',  'Constructions',                              2, 'actif',   '21',  FALSE, FALSE),
('215',  'Matériel industriel',                        2, 'actif',   '21',  FALSE, FALSE),
('218',  'Autres immobilisations corporelles',         2, 'actif',   '21',  FALSE, FALSE),
('28',   'Amortissements des immobilisations',         2, 'actif',   '2',   FALSE, FALSE),

-- Classe 3 : Stocks
('3',    'STOCKS',                                     3, 'actif',   NULL, FALSE, FALSE),
('31',   'Matières premières',                         3, 'actif',   '3',   FALSE, FALSE),
('33',   'En-cours de production',                     3, 'actif',   '3',   FALSE, FALSE),
('35',   'Produits finis',                             3, 'actif',   '3',   FALSE, FALSE),
('37',   'Marchandises',                               3, 'actif',   '3',   FALSE, FALSE),

-- Classe 4 : Comptes de tiers
('4',    'TIERS',                                      4, 'mixte',   NULL, FALSE, FALSE),
('401',  'Fournisseurs',                               4, 'passif',  '4',   TRUE,  TRUE),
('4011', 'Fournisseurs - Achats de biens et services', 4, 'passif',  '401', TRUE,  TRUE),
('403',  'Fournisseurs - Effets à payer',              4, 'passif',  '4',   TRUE,  TRUE),
('409',  'Fournisseurs débiteurs',                     4, 'actif',   '4',   TRUE,  TRUE),
('411',  'Clients',                                    4, 'actif',   '4',   TRUE,  TRUE),
('413',  'Clients - Effets à recevoir',                4, 'actif',   '4',   TRUE,  TRUE),
('416',  'Clients douteux ou litigieux',               4, 'actif',   '4',   TRUE,  TRUE),
('419',  'Clients créditeurs',                         4, 'passif',  '4',   TRUE,  TRUE),
('421',  'Personnel - Rémunérations dues',             4, 'passif',  '4',   FALSE, TRUE),
('425',  'Personnel - Avances et acomptes',            4, 'actif',   '4',   FALSE, TRUE),
('43',   'Sécurité sociale et autres organismes',      4, 'passif',  '4',   FALSE, FALSE),
('4311', 'CNSS - Part salariale',                       4, 'passif',  '43',  FALSE, FALSE),
('4312', 'CNSS - Part patronale',                       4, 'passif',  '43',  FALSE, FALSE),
('44',   'État et collectivités publiques',            4, 'passif',  '4',   FALSE, FALSE),
('4361', 'IRPP - Retenues à la source',                 4, 'passif',  '44',  FALSE, FALSE),
('4366', 'TVA déductible',                              4, 'actif',   '44',  FALSE, FALSE),
('4367', 'TVA collectée',                               4, 'passif',  '44',  FALSE, FALSE),
('4368', 'TVA à décaisser',                             4, 'passif',  '44',  FALSE, FALSE),
('4457', 'Droits de timbre',                            4, 'passif',  '44',  FALSE, FALSE),
('4458', 'CSS - Contribution Sociale Solidaire',        4, 'passif',  '44',  FALSE, FALSE),

-- Classe 5 : Comptes financiers
('5',    'COMPTES FINANCIERS',                         5, 'actif',   NULL, FALSE, FALSE),
('53',   'Banques',                                    5, 'actif',   '5',   FALSE, TRUE),
('54',   'Caisse',                                     5, 'actif',   '5',   FALSE, TRUE),

-- Classe 6 : Charges
('6',    'CHARGES',                                    6, 'charge',  NULL, FALSE, FALSE),
('601',  'Achats de matières premières',               6, 'charge',  '6',   FALSE, FALSE),
('607',  'Achats de marchandises',                     6, 'charge',  '6',   FALSE, FALSE),
('61',   'Services extérieurs',                        6, 'charge',  '6',   FALSE, FALSE),
('613',  'Locations',                                  6, 'charge',  '61',  FALSE, FALSE),
('616',  'Primes d''assurances',                       6, 'charge',  '61',  FALSE, FALSE),
('62',   'Autres services extérieurs',                 6, 'charge',  '6',   FALSE, FALSE),
('622',  'Rémunérations d''intermédiaires et honoraires',6,'charge', '62',  FALSE, FALSE),
('626',  'Frais postaux et télécommunications',        6, 'charge',  '62',  FALSE, FALSE),
('641',  'Rémunérations du personnel',                 6, 'charge',  '6',   FALSE, FALSE),
('645',  'Charges de sécurité sociale et prévoyance',  6, 'charge',  '6',   FALSE, FALSE),
('66',   'Charges financières',                        6, 'charge',  '6',   FALSE, FALSE),
('68',   'Dotations aux amortissements et provisions', 6, 'charge',  '6',   FALSE, FALSE),

-- Classe 7 : Produits
('7',    'PRODUITS',                                   7, 'produit', NULL, FALSE, FALSE),
('70',   'Ventes de produits fabriqués et services',   7, 'produit', '7',   FALSE, FALSE),
('701',  'Ventes de produits finis',                   7, 'produit', '70',  FALSE, FALSE),
('707',  'Ventes de marchandises',                     7, 'produit', '70',  FALSE, FALSE),
('708',  'Produits des activités annexes',             7, 'produit', '70',  FALSE, FALSE),
('76',   'Produits financiers',                        7, 'produit', '7',   FALSE, FALSE),
('78',   'Reprises sur amortissements et provisions',  7, 'produit', '7',   FALSE, FALSE)
ON CONFLICT (numero_compte) DO NOTHING;

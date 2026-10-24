-- =====================================================================
-- Seed 01 — Sous-traitants réalistes Tunisie (Phase B §14quater.3)
-- Données inspirées de « Compte Sous-Traitant 2024-2025.xlsx » +
--     « Détails Sous Traitance 2026.xlsx » (coordonnées sous-traitant).
-- Montants adaptés pour démo (anonymisation partielle).
-- Idempotent via ON CONFLICT (code) DO UPDATE.
-- =====================================================================

INSERT INTO sous_traitants
    (code, raison_sociale, contact_nom, contact_telephone, adresse, ville, pays,
     specialites, type_activite, activites_secondaires,
     tarif_unitaire, unite_facturation, delai_moyen_jours, qualite_moyenne_pct,
     note_qualite, date_debut_relation, siret_matricule_fiscal,
     conditions_paiement, identification, actif, notes)
VALUES
  ('ST-OURD-001', 'Chokri Haddad',          'Chokri Haddad',    '98300210', 'Zone atelier Monastir',   'Monastir',  'Tunisie',
   ARRAY['ourdissage'], 'ourdissage', ARRAY[]::TEXT[],
   220.000, 'piece', 7, 94.00, 4.5, DATE '2023-12-31', 'MF-7845321A/P/M/000',
   '30 jours fin de mois · ESP + VIR BIAT', 'ChokriHaddad', TRUE,
   'Ourdissage COTON 2/50 — ensouple 5000 m. Tarifs 200-275 TND selon métrage.'),

  ('ST-NOUA-001', 'Salem Mehdi',            'Salem Mehdi',      '97111288', 'Sayada',                  'Sayada',    'Tunisie',
   ARRAY['nouage'], 'nouage', ARRAY[]::TEXT[],
   15.000, 'piece', 2, 96.50, 4.8, DATE '2024-01-15', 'CIN-04221789',
   'Comptant ESP hebdomadaire', 'SalemMehdi', TRUE,
   'Nouage ensouples sur machines M23xx. Spécialiste coton + lin.'),

  ('ST-TEIN-SOBOLUX', 'Sobolux',            'Mehdi Sobolux',    '71441551', 'Zone industrielle Sousse','Sousse',    'Tunisie',
   ARRAY['teinture'], 'teinture', ARRAY['finition'],
   8.500, 'kg', 10, 92.00, 4.3, DATE '2024-04-01', 'MF-3312445B/A/M/000',
   '60 jours fin de mois · VIR BIAT', 'Sobolux', TRUE,
   'Teinture fil coton 100%. Teintes réalisées : taupe, marine, kaki, cèdre, beige, marron, bleu délavé.'),

  ('ST-COUT-ADEL', 'Adel Chakroun',         'Adel Chakroun',    '29596798', 'Monastir',                'Monastir',   'Tunisie',
   ARRAY['couture', 'frange'], 'couture', ARRAY['frange'],
   1.500, 'piece', 3, 95.00, 4.6, DATE '2023-07-04', 'CIN-05887432',
   '30 jours fin de mois · ESP + CARTE CA + CHARGE', 'AdelChakroun', TRUE,
   'Couture + ourlet. Tarifs 0,45 à 1,50 TND/pce selon modèle (NATHC, NATXLR, NATXXXL).'),

  ('ST-COUT-NEJI', 'Neji Sghaier',          'Neji Sghaier',     '98224477', 'Ksibet El-Médiouni',      'Ksibet El-Médiouni', 'Tunisie',
   ARRAY['couture'], 'couture', ARRAY[]::TEXT[],
   10.000, 'piece', 5, 90.00, 4.1, DATE '2024-12-11', 'CIN-07445109',
   'ESP mensuel', 'NejiSghaier', TRUE,
   'Couture produits spéciaux FOUTA. 3 à 13 pcs/mois petites séries.'),

  ('ST-BROD-NAJWA', 'Najwa Amdouni',         'Najwa Amdouni',   '94567321', 'Moknine',                 'Moknine',    'Tunisie',
   ARRAY['broderie'], 'broderie', ARRAY['personnalisation'],
   3.800, 'piece', 4, 93.00, 4.4, DATE '2024-02-22', 'CIN-02114786',
   '30 jours · VIR REV + CHEQUE CLIENT', 'NajwaAmdouni', TRUE,
   'Broderie motifs clients (ILE DE RE, LA ROCHELLE, APV, PLAYA BAGGIA). Tarifs 0,6-6 TND.'),

  ('ST-PERS-MOSE', 'Ste Mose de Commerce',  'Mohamed Mose',     '71334887', 'Sfax',                    'Sfax',       'Tunisie',
   ARRAY['personnalisation'], 'personnalisation', ARRAY['broderie'],
   4.200, 'piece', 7, 91.00, 4.2, DATE '2024-03-15', 'MF-5584421C/P/S/000',
   '45 jours · VIR STB', 'MoseCommerce', TRUE,
   'Personnalisation sérigraphie + étiquetage. Grosses séries 500+ pcs.'),

  ('ST-FRAN-BAHRI', 'Lotfi Bahri',          'Lotfi Bahri',      '99950042', 'Banen',                   'Banen',      'Tunisie',
   ARRAY['frange'], 'frange', ARRAY[]::TEXT[],
   0.800, 'piece', 2, 94.50, 4.5, DATE '2025-01-10', 'CIN-01998223',
   'ESP hebdo', 'BahriLotfi', TRUE,
   'Franges manuelles. Réseau Banen. 100-300 pcs/semaine.'),

  ('ST-FRAN-LEYLA', 'Leyla Khlifa',         'Leyla Khlifa',     '97578234', 'Ksibet El-Médiouni',      'Ksibet El-Médiouni', 'Tunisie',
   ARRAY['frange'], 'frange', ARRAY[]::TEXT[],
   0.750, 'piece', 2, 95.80, 4.7, DATE '2025-01-15', 'CIN-08773441',
   'ESP hebdo', 'LeylaKhlifa', TRUE,
   'Franges rapide + qualité. Peu d''anomalies.'),

  ('ST-FRAN-HATEM', 'Hatem Ben Abid',       'Hatem Ben Abid',   '94323230', 'Sayada',                  'Sayada',     'Tunisie',
   ARRAY['frange'], 'frange', ARRAY[]::TEXT[],
   0.800, 'piece', 3, 91.50, 4.2, DATE '2025-02-01', 'CIN-06112558',
   'ESP hebdo', 'HatemBenAbid', TRUE,
   'Magasinier ST délégué Sayada — réseau franges BANEN/SAYADA.'),

  ('ST-FRAN-ALI', 'Ali Sassi',              'Ali Sassi',        '55411096', 'Monastir',                'Monastir',   'Tunisie',
   ARRAY['frange'], 'frange', ARRAY[]::TEXT[],
   0.800, 'piece', 2, 92.70, 4.3, DATE '2024-11-20', 'CIN-04338921',
   'ESP hebdo', 'AliSassi', TRUE,
   'Franges — attention anomalies régulières retours tardifs.'),

  ('ST-FRAN-SAMIRA', 'Samira',              'Samira',           '95988429', 'Monastir',                'Monastir',   'Tunisie',
   ARRAY['frange'], 'frange', ARRAY[]::TEXT[],
   0.750, 'piece', 2, 96.00, 4.6, DATE '2024-12-01', 'CIN-02556887',
   'ESP hebdo', 'Samira', TRUE,
   'Franges fiable, retours ponctuels.'),

  ('ST-FINI-DIMATEX', 'Dimatex',            'Resp. Dimatex',    '71556200', 'Sousse',                  'Sousse',     'Tunisie',
   ARRAY['finition'], 'finition', ARRAY['teinture'],
   6.000, 'metre', 15, 89.00, 4.0, DATE '2023-12-30', 'MF-8842311D/P/S/000',
   '90 jours · VIR BIAT', 'Dimatex', TRUE,
   'Finition apprêt + lavage grosses séries. Partenaire historique.'),

  ('ST-PERS-ALI-TH', 'Ali Thabet',          'Ali Thabet',       '96887553', 'Monastir',                'Monastir',   'Tunisie',
   ARRAY['personnalisation'], 'personnalisation', ARRAY['broderie'],
   2.500, 'piece', 6, 93.50, 4.4, DATE '2024-02-22', 'CIN-03998771',
   '30 jours · VIR REV + WESTERN 101', 'AliThabet', TRUE,
   'Personnalisation + broderie fine. Marques Demain Nous Appartient, Les Galets, Saint Cyprien.'),

  ('ST-COUT-BENTAISSA', 'Bent Aissa',       'Bent Aissa',       '98224136', 'Monastir',                'Monastir',   'Tunisie',
   ARRAY['couture'], 'couture', ARRAY[]::TEXT[],
   1.200, 'piece', 4, 94.80, 4.5, DATE '2025-05-24', 'CIN-07226447',
   '30 jours · ESP + VIR BIAT', 'BentAissa', TRUE,
   'Couture FOUTA SAC + FOUTA EPONGE grosses séries 2000+ pcs.')

ON CONFLICT (code) DO UPDATE SET
    raison_sociale        = EXCLUDED.raison_sociale,
    contact_telephone     = EXCLUDED.contact_telephone,
    adresse               = EXCLUDED.adresse,
    ville                 = EXCLUDED.ville,
    type_activite         = EXCLUDED.type_activite,
    activites_secondaires = EXCLUDED.activites_secondaires,
    tarif_unitaire        = EXCLUDED.tarif_unitaire,
    unite_facturation     = EXCLUDED.unite_facturation,
    delai_moyen_jours     = EXCLUDED.delai_moyen_jours,
    qualite_moyenne_pct   = EXCLUDED.qualite_moyenne_pct,
    date_debut_relation   = EXCLUDED.date_debut_relation,
    siret_matricule_fiscal= EXCLUDED.siret_matricule_fiscal,
    conditions_paiement   = EXCLUDED.conditions_paiement,
    identification        = EXCLUDED.identification,
    notes                 = EXCLUDED.notes,
    updated_at            = NOW();

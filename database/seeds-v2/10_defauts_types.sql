-- Nomenclature défauts (§7.9)
INSERT INTO defauts_types (code, libelle, categorie, severite_defaut, description, action_recommandee) VALUES
('CASSE_FIL_CHAINE',  'Casse fil chaîne',        'fil',         'majeur',   'Rupture d''un fil de chaîne pendant tissage', 'Arrêter métier, renouer, reprendre'),
('CASSE_FIL_TRAME',   'Casse fil trame',         'fil',         'mineur',   'Rupture fil de trame',                          'Renouer trame'),
('TENSION_IRREG',     'Tension irrégulière',     'tissage',     'majeur',   'Chaîne ou trame mal tendue — bandes visibles', 'Régler tension'),
('TACHE_HUILE',       'Tache d''huile',          'tissage',     'majeur',   'Contamination huile machine',                   'Détacher / classer 2e choix'),
('TROU_LISIERE',      'Trou lisière',            'tissage',     'majeur',   'Trou en bord de tissu',                         'Retouche ou 2e choix'),
('DECOLORATION',      'Décoloration',            'colorimetrie','majeur',   'Nuance non conforme référence',                 'Contrôle colorimétrique lot'),
('BOURRE',            'Bourre / grumeau',        'matiere',     'mineur',   'Nœud ou grumeau visible sur tissu',             'Ébourrer si possible'),
('BARRURE',           'Barrure',                 'tissage',     'majeur',   'Différence densité duites → bande visible',     'Analyse machine'),
('LAIZE_HORS_TOL',    'Laize hors tolérance',    'dimension',   'critique', 'Largeur tissu hors tolérance',                  'Rebut'),
('LONGUEUR_HORS_TOL', 'Longueur hors tolérance', 'dimension',   'critique', 'Longueur pièce coupée hors tolérance',          'Ajuster / rebut'),
('FRANGE_DEFECTUEUSE','Frange défectueuse',      'finition',    'majeur',   'Frange mal formée ou irrégulière',              'Retouche frange'),
('OURLET_IRREGULIER', 'Ourlet irrégulier',       'finition',    'mineur',   'Ourlet non conforme',                           'Retouche ourlet'),
('COUTURE_IRREG',     'Couture irrégulière',     'finition',    'mineur',   'Défaut couture assemblage',                     'Recoudre'),
('TROU_TISSAGE',      'Trou tissage',            'tissage',     'critique', 'Trou dans le corps du tissu',                   'Rebut ou 2e choix'),
('AUTRE',             'Autre défaut',            'autre',       'mineur',   'Défaut non catégorisé',                         'À qualifier')
ON CONFLICT (code) DO NOTHING;

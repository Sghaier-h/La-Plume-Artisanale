-- Motifs de perte de lead (§15 · ParamCrm)
INSERT INTO crm_motifs_perte (code, libelle, ordre) VALUES
  ('PRIX_ELEVE',       'Prix jugé trop élevé',                 1),
  ('DELAI_TROP_LONG',  'Délai de livraison incompatible',       2),
  ('CONCURRENT',       'A choisi un concurrent',                3),
  ('BUDGET_ANNULE',    'Budget annulé côté client',             4),
  ('PAS_BESOIN',       'Besoin non confirmé / prématuré',       5),
  ('NO_REPLY',         'Sans réponse après 3 relances',         6),
  ('QUALITE_INSUFF',   'Perception qualité insuffisante',       7),
  ('SPEC_TECHNIQUE',   'Spécifications techniques non tenues',  8),
  ('LOCALISATION',     'Zone de livraison non couverte',        9)
ON CONFLICT (code) DO NOTHING;

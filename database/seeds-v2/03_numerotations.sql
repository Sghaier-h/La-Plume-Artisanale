-- =============================================================================
-- 03_numerotations.sql — Seed 15+ codes documents (§16bis.2)
-- =============================================================================

WITH s AS (SELECT id_societe FROM parametres_societe WHERE code_societe = 'LP')
INSERT INTO parametres_numerotation (
  id_societe, code_document, prefixe, format_annee, format_mois, separateur,
  longueur_sequence, sequence_courante, reset_sequence, template, visible_menu_params
)
SELECT s.id_societe, x.code_document, x.prefixe, x.format_annee, x.format_mois, x.separateur,
       x.longueur_sequence, 0, x.reset_sequence, x.template, TRUE
FROM s, (VALUES
  -- code, prefixe, annee,   mois,    sep, longueur, reset,      template
  ('OF',  'OF',   'aucune','aucun', '',  6, 'jamais',  '{prefixe}{seq:6}'),
  ('CA',  'CA',   'aucune','aucun', '',  4, 'jamais',  '{prefixe}{seq:4}'),
  ('DEV', 'DV-',  'AAAA',  'MM',    '',  4, 'mensuel', '{prefixe}{AAAA}{MM}{seq:4}'),
  ('CMD', 'CMD-', 'AAAA',  'aucun', '',  5, 'annuel',  '{prefixe}{AAAA}{seq:5}'),
  ('BL',  'BL-',  'AAAA',  'MM',    '',  4, 'mensuel', '{prefixe}{AAAA}{MM}{seq:4}'),
  ('FA',  'FA-',  'AAAA',  'MM',    '',  5, 'mensuel', '{prefixe}{AAAA}{MM}{seq:5}'),
  ('AVO', 'AV-',  'AAAA',  'MM',    '',  4, 'mensuel', '{prefixe}{AAAA}{MM}{seq:4}'),
  ('BC',  'BC-',  'AAAA',  'aucun', '',  4, 'annuel',  '{prefixe}{AAAA}{seq:4}'),
  ('REC', 'REC-', 'AAAA',  'MM',    '',  3, 'mensuel', '{prefixe}{AAAA}{MM}{seq:3}'),
  ('PAL', 'PAL',  'AA',    'aucun', '-', 3, 'annuel',  '{prefixe}{AA}{sep}{seq:3}'),
  ('ECR', '',     'AAAA',  'aucun', '-', 5, 'annuel',  '{JOURNAL}{sep}{AAAA}{seq:5}'),
  ('CLI', 'CL',   'aucune','aucun', '',  4, 'jamais',  '{prefixe}{seq:4}'),
  ('FOU', 'FO',   'aucune','aucun', '',  4, 'jamais',  '{prefixe}{seq:4}'),
  ('ART', 'AR',   'aucune','aucun', '',  4, 'jamais',  '{prefixe}{seq:4}'),
  ('BSST','BSST-','AAAA',  'aucun', '-', 5, 'annuel',  '{prefixe}{AAAA}{sep}{seq:5}'),
  ('BRST','BRST-','AAAA',  'aucun', '-', 5, 'annuel',  '{prefixe}{AAAA}{sep}{seq:5}')
) AS x(code_document, prefixe, format_annee, format_mois, separateur, longueur_sequence, reset_sequence, template)
ON CONFLICT (id_societe, code_document) DO NOTHING;

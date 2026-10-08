-- Catégories clients (§15 · ParamCrm)
INSERT INTO crm_categories_clients (code, libelle, couleur, ordre) VALUES
  ('VIP',        'VIP · gros compte',      '#C8663D', 1),
  ('EXPORT_UE',  'Export Union européenne','#3B4E68', 2),
  ('B2B',        'B2B classique',          '#4A6C5B', 3),
  ('HOTEL',      'Hôtellerie & Resort',    '#D6A756', 4),
  ('REVENDEUR',  'Revendeur / boutique',   '#8A6412', 5),
  ('E_COMMERCE', 'E-commerce partenaire',  '#B84A4A', 6),
  ('PARTICULIER','Particulier direct',     '#7A6E63', 7)
ON CONFLICT (code) DO NOTHING;

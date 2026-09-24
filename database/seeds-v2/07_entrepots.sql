-- Seeds — 6 entrepôts par défaut (§6.2 domain.md)
INSERT INTO entrepots (code, libelle, type, permet_vente, actif) VALUES
    ('USINE',         'Usine — MP + Semi-finis',       'usine',                FALSE, TRUE),
    ('E1',            'Entrepôt E1 — Produits Finis',  'entrepot_principal',   TRUE,  TRUE),
    ('E2',            'Entrepôt E2 — PF Export',       'entrepot_secondaire',  FALSE, TRUE),
    ('SHOWROOM',      'Showroom',                      'showroom',             TRUE,  TRUE),
    ('ST_DIMATEX',    'Sous-traitant Dimatex',         'sous_traitant',        FALSE, TRUE),
    ('ATELIER_PREP',  'Atelier Préparation',           'atelier_preparation',  FALSE, TRUE)
ON CONFLICT (code) DO NOTHING;

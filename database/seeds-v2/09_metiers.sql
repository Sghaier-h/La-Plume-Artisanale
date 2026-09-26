-- 8 métiers types (§7.4)
INSERT INTO metiers (code_machine, libelle, type_ratiere, nb_couleurs_selecteur, laize_machine_cm, vitesse_max_duite_min, unite_compteur, etat, actif) VALUES
('M2301', 'Métier 2301 — Ratière R16',      'R16',         6, 220.00, 320, 'metres', 'en_service', TRUE),
('M2302', 'Métier 2302 — Ratière R16',      'R16',         6, 220.00, 320, 'metres', 'en_service', TRUE),
('M2303', 'Métier 2303 — Dornier haute vit.','Dornier',    8, 260.00, 480, 'metres', 'en_service', TRUE),
('M2304', 'Métier 2304 — Ratière R20',      'R20',         8, 240.00, 380, 'metres', 'en_service', TRUE),
('M2305', 'Métier 2305 — Staubli 2666',     'Staubli_2666',8, 240.00, 400, 'metres', 'en_service', TRUE),
('M2306', 'Métier 2306 — Bonas Jacquard',   'Bonas',       8, 220.00, 260, 'metres', 'en_service', TRUE),
('M2307', 'Métier 2307 — Ratière R16',      'R16',         6, 200.00, 320, 'pieces', 'en_service', TRUE),
('M2308', 'Métier 2308 — Grosse',           'Grosse',      6, 220.00, 280, 'metres', 'en_maintenance', TRUE)
ON CONFLICT (code_machine) DO NOTHING;

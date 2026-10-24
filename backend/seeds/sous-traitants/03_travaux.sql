-- =====================================================================
-- Seed 03 — 50 travaux ST variés sur les 6 derniers mois (statuts mixtes)
-- Dates relatives à now() pour rester "6 derniers mois" après chaque run.
-- Idempotent via WHERE NOT EXISTS clé (id_soustraitant, date_debut, type_activite, quantite).
-- =====================================================================

INSERT INTO travaux_sous_traitants
    (id_soustraitant, type_activite, id_of_lie, date_debut, date_fin, quantite,
     unite, tarif_applique, montant, statut, notes)
SELECT st.id_soustraitant, v.type_activite::st_type_activite_enum,
       NULL, (NOW() - (v.jours_offset || ' days')::interval)::date,
       CASE WHEN v.jours_duree IS NULL THEN NULL
            ELSE (NOW() - ((v.jours_offset - v.jours_duree) || ' days')::interval)::date END,
       v.quantite, v.unite::st_unite_facturation_enum,
       v.tarif, v.quantite * v.tarif, v.statut::st_travail_statut_enum, v.notes
FROM (VALUES
    -- Chokri Haddad — ourdissage
    ('ST-OURD-001', 'ourdissage', 180, 5,    5000, 'piece',   220.000, 'paye',    'Ensouple COTON 2/50 — 5000 m'),
    ('ST-OURD-001', 'ourdissage', 150, 4,    5000, 'piece',   250.000, 'paye',    'Ensouple COTON 2/50 laize 215'),
    ('ST-OURD-001', 'ourdissage', 90,  5,    5000, 'piece',   275.000, 'valide',  'Ensouple COTON 2/50 — en attente paiement'),
    ('ST-OURD-001', 'ourdissage', 45,  5,    5500, 'piece',   250.000, 'valide',  'Ensouple spécial laize 208'),
    ('ST-OURD-001', 'ourdissage', 10,  NULL, 5000, 'piece',   200.000, 'en_cours','Ensouple en cours — M2305'),

    -- Salem Mehdi — nouage
    ('ST-NOUA-001', 'nouage',     175, 2,     12, 'piece',    15.000, 'paye',    'Nouage 12 ensouples'),
    ('ST-NOUA-001', 'nouage',     120, 2,      8, 'piece',    15.000, 'paye',    'Nouage 8 ensouples'),
    ('ST-NOUA-001', 'nouage',      60, 2,     14, 'piece',    15.000, 'valide',  'Nouage M23xx'),
    ('ST-NOUA-001', 'nouage',      25, NULL,   6, 'piece',    15.000, 'en_cours','Nouage en cours'),

    -- Sobolux — teinture (kg)
    ('ST-TEIN-SOBOLUX', 'teinture', 170, 10,  40, 'kg',        7.700, 'paye',    'Taupe'),
    ('ST-TEIN-SOBOLUX', 'teinture', 150, 10,  40, 'kg',        9.240, 'paye',    'Marine'),
    ('ST-TEIN-SOBOLUX', 'teinture', 140, 10,  60, 'kg',        8.500, 'valide',  'Kaki + Cèdre'),
    ('ST-TEIN-SOBOLUX', 'teinture', 110, 10,  60, 'kg',        8.500, 'valide',  'Beige + Marron'),
    ('ST-TEIN-SOBOLUX', 'teinture',  70, NULL, 60, 'kg',        8.500, 'en_cours','Bleu délavé 12 — en cours'),

    -- Adel Chakroun — couture + ourlet
    ('ST-COUT-ADEL', 'couture',   160, 3,   160, 'piece',     1.500, 'paye',    'Ourlet NATXXXL-T04-02-04'),
    ('ST-COUT-ADEL', 'couture',   155, 3,    90, 'piece',     1.500, 'paye',    'Ourlet NATXXXL-T10-06-10'),
    ('ST-COUT-ADEL', 'couture',   140, 3,    98, 'piece',     1.350, 'paye',    'Ourlet NATXLR-T07-04-07'),
    ('ST-COUT-ADEL', 'couture',   130, 3,   180, 'piece',     0.450, 'paye',    'Ourlet NATHC-T01-01-01'),
    ('ST-COUT-ADEL', 'couture',    80, 3,   120, 'piece',     1.500, 'valide',  'Ourlet NATXXXL-T07-04-07'),
    ('ST-COUT-ADEL', 'couture',    30, NULL, 95, 'piece',     1.500, 'en_cours','Ourlet en cours'),

    -- Neji Sghaier — couture
    ('ST-COUT-NEJI', 'couture',   155, 2,     13, 'piece',    10.000, 'paye',    'Petit lot décembre'),
    ('ST-COUT-NEJI', 'couture',   120, 2,      3, 'piece',    10.000, 'paye',    'Lot janvier'),
    ('ST-COUT-NEJI', 'couture',    90, 2,      7, 'piece',    10.000, 'paye',    'Lot avril'),
    ('ST-COUT-NEJI', 'couture',    60, 2,      6, 'piece',    10.000, 'paye',    'Lot mai'),
    ('ST-COUT-NEJI', 'couture',    15, NULL,   5, 'piece',    10.000, 'en_cours','Lot courant'),

    -- Najwa Amdouni — broderie
    ('ST-BROD-NAJWA', 'broderie', 170, 4,   700, 'piece',     1.800, 'paye',    'Broderie DEMAIN NOUS APPARTIENT'),
    ('ST-BROD-NAJWA', 'broderie', 150, 4,   200, 'piece',     4.000, 'paye',    'Broderie LES GALETS ND LILI'),
    ('ST-BROD-NAJWA', 'broderie', 120, 4,   250, 'piece',     4.000, 'valide',  'Broderie PLAYA BAGGIA ND UNI'),
    ('ST-BROD-NAJWA', 'broderie',  60, 4,   240, 'piece',     0.600, 'valide',  'Broderie ILE DE RE IBIZA'),
    ('ST-BROD-NAJWA', 'broderie',  20, NULL, 100, 'piece',    6.000, 'en_cours','Broderie PACK LONDON LES GALETS'),

    -- Ste Mose de Commerce — personnalisation
    ('ST-PERS-MOSE', 'personnalisation', 170, 6,   800, 'piece',     6.000, 'paye',    'DES1020-ND'),
    ('ST-PERS-MOSE', 'personnalisation', 150, 6,  3060, 'piece',     6.000, 'paye',    'DES1020-PLAT'),
    ('ST-PERS-MOSE', 'personnalisation', 130, 6,   390, 'piece',    13.500, 'valide',  'DES2020-PLAT'),
    ('ST-PERS-MOSE', 'personnalisation', 110, 6,   320, 'piece',    16.500, 'valide',  'DES2030-PLAT'),
    ('ST-PERS-MOSE', 'personnalisation',  40, NULL,1650, 'piece',    6.000, 'en_cours','DES1020-ND courant'),

    -- Lotfi Bahri — frange
    ('ST-FRAN-BAHRI', 'frange', 90,  2,   220, 'piece',     0.800, 'paye',    'Franges FOUTA sac'),
    ('ST-FRAN-BAHRI', 'frange', 60,  2,   180, 'piece',     0.800, 'paye',    'Franges IB1020'),
    ('ST-FRAN-BAHRI', 'frange', 20,  2,   150, 'piece',     0.800, 'valide',  'Franges AR1020'),

    -- Leyla Khlifa — frange
    ('ST-FRAN-LEYLA', 'frange', 85,  2,   280, 'piece',     0.750, 'paye',    'Franges SACFEPMA0919'),
    ('ST-FRAN-LEYLA', 'frange', 55,  2,   240, 'piece',     0.750, 'paye',    'Franges OF270008'),
    ('ST-FRAN-LEYLA', 'frange', 12,  NULL, 190, 'piece',    0.750, 'en_cours','Franges courant'),

    -- Hatem Ben Abid — frange
    ('ST-FRAN-HATEM', 'frange', 70,  3,   140, 'piece',     0.800, 'paye',    'Franges IB1020-B'),
    ('ST-FRAN-HATEM', 'frange', 25,  3,   160, 'piece',     0.800, 'valide',  'Franges destockage'),

    -- Ali Sassi — frange (avec refus)
    ('ST-FRAN-ALI', 'frange',   80, 2,    200, 'piece',     0.800, 'paye',    'Franges IB1020'),
    ('ST-FRAN-ALI', 'frange',   40, 2,    120, 'piece',     0.800, 'refuse',  'Retour tardif + qté manquante — compensation'),
    ('ST-FRAN-ALI', 'frange',   15, NULL, 90,  'piece',     0.800, 'en_cours','Franges courant — surveiller'),

    -- Samira — frange
    ('ST-FRAN-SAMIRA', 'frange', 75,  2, 230, 'piece',      0.750, 'paye',    'Franges OF270050'),
    ('ST-FRAN-SAMIRA', 'frange', 45,  2, 170, 'piece',      0.750, 'paye',    'Franges OF270060'),

    -- Dimatex — finition
    ('ST-FINI-DIMATEX', 'finition', 165, 15,  180, 'metre',     6.000, 'paye',    'Lavage finition grosse série'),
    ('ST-FINI-DIMATEX', 'finition', 100, 15,  132, 'metre',     6.000, 'valide',  'Apprêt + lavage OF240469'),

    -- Ali Thabet — personnalisation
    ('ST-PERS-ALI-TH', 'personnalisation', 150, 6,  489, 'piece',    3.800, 'paye',    'APV ARTHUR'),
    ('ST-PERS-ALI-TH', 'personnalisation', 100, 6,   97, 'piece',    1.800, 'paye',    'plage les caraibes'),
    ('ST-PERS-ALI-TH', 'personnalisation',  40, NULL, 56, 'piece',   0.700, 'en_cours','RANGELEY IBIZA en cours'),

    -- Bent Aissa — couture (gros volumes)
    ('ST-COUT-BENTAISSA', 'couture', 150, 4,  2273, 'piece',  1.200, 'paye',    'FOUTA SAC CM-FT0023'),
    ('ST-COUT-BENTAISSA', 'couture', 120, 4,  1000, 'piece',  1.200, 'paye',    'FOUTA SAC CM-FT0030')
) AS v(code, type_activite, jours_offset, jours_duree, quantite, unite, tarif, statut, notes)
JOIN sous_traitants st ON st.code = v.code
WHERE NOT EXISTS (
    SELECT 1 FROM travaux_sous_traitants t
    WHERE t.id_soustraitant = st.id_soustraitant
      AND t.type_activite = v.type_activite::st_type_activite_enum
      AND t.quantite = v.quantite
      AND t.notes = v.notes
);

-- =============================================================================
-- 04_depenses_especes.sql — Dépenses courantes espèces (§9.9 + §14quater)
-- 15 dépenses démo du mois courant (oct 2026). Catégories typiques atelier TN :
--   pourboire, café ouvriers, dépannage, consommable, petit entretien,
--   transport, carburant, parking, timbres, péage, communication, autre
-- =============================================================================

INSERT INTO depenses_courantes_espece (
  id_caisse, date_depense, categorie, libelle, montant, beneficiaire, comptabilisee, notes
)
SELECT c.id_caisse, v.d::DATE, v.cat, v.lib, v.m, v.benef, FALSE, v.n
FROM caisses c, (VALUES
  ('2026-10-02', 'cafe_ouvriers', 'Café + sucre réfectoire semaine 40',  28.500, 'Épicerie Ben Ali',       'Facture perdue · reçu sommaire'),
  ('2026-10-03', 'depannage',     'Dépannage moteur ourdissage #3',      145.000, 'Atelier mécanique Ali',  'Pièce + MO · 2h'),
  ('2026-10-04', 'consommable',   'Papier emballage x 20 ramettes',       72.000, 'Papeterie Al Hilal',    NULL),
  ('2026-10-05', 'transport',     'Taxi livraison urgente Sousse',        35.000, 'Taxi 456',              NULL),
  ('2026-10-06', 'pourboire',     'Pourboire déchargement camion ciment', 20.000, 'Équipe manutention',    NULL),
  ('2026-10-07', 'carburant',     'Carburant camionnette VW atelier',     80.000, 'Agil Ksar Hellal',     NULL),
  ('2026-10-09', 'petit_entretien','Fourniture plomberie WC atelier',     38.750, 'Quincaillerie Trabelsi', 'Robinet + joint'),
  ('2026-10-10', 'communication', 'Recharge mobile équipe commerciale',   40.000, 'Ooredoo',               '4 numéros x 10 DT'),
  ('2026-10-13', 'cafe_ouvriers', 'Thé + biscuits soirée inventaire',     22.000, 'Épicerie Ben Ali',      NULL),
  ('2026-10-14', 'consommable',   'Enveloppes A4 x 2 boîtes',             15.000, 'Papeterie Al Hilal',    NULL),
  ('2026-10-15', 'depannage',     'Dépannage climatiseur bureau compta',  220.000, 'Froid Mahdia',          'Signature apposée (>50 DT)'),
  ('2026-10-17', 'parking',       'Parking Tunis mission notaire',         12.000, 'Parking Centre-ville',  NULL),
  ('2026-10-19', 'timbres',       'Timbres fiscaux dossier douane',        45.000, 'Receveur finances',     NULL),
  ('2026-10-21', 'autre',         'Fleurs funérailles famille ouvrier',    60.000, 'Fleuriste Hammamet',    'Condoléances'),
  ('2026-10-22', 'peage',         'Péage autoroute Tunis-Sousse x3',       21.000, 'Tunisie Autoroutes',    NULL)
) AS v(d, cat, lib, m, benef, n)
WHERE c.code = 'CAISSE-PRINCIPALE'
ON CONFLICT DO NOTHING;

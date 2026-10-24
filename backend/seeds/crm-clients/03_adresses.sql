-- =============================================================================
-- 03_adresses.sql — ~30 adresses multi-comptes (§3.3)
-- Idempotence : nettoyage des libellés démo puis réinsertion.
-- =============================================================================

DELETE FROM adresses_client
 WHERE libelle IN ('Siège','Entrepôt','Boutique','Villa','Résidence','Spa','Riad','Showroom','Magasin');

WITH c AS (
  SELECT id_client, code_client FROM comptes
   WHERE code_client BETWEEN 'CLI-2026-0001' AND 'CLI-2026-0020'
)
INSERT INTO adresses_client (
  id_client, libelle, type_facturation, type_livraison, type_siege,
  rue, complement, code_postal, ville, region, pays,
  contact_livraison_nom, contact_livraison_telephone,
  est_defaut_facturation, est_defaut_livraison
)
SELECT c.id_client, x.libelle, x.tf, x.tl, x.ts,
       x.rue, x.complement, x.cp, x.ville, x.region, x.pays,
       x.cont_nom, x.cont_tel, x.def_fac, x.def_liv
FROM c JOIN (VALUES
  -- Marina Djerba : siège + entrepôt
  ('CLI-2026-0001','Siège',      TRUE, FALSE,TRUE, 'Route Touristique Zone Sidi Mahrez',NULL,'4116','Djerba Midoun','Médenine','TN','Sonia Ben Hamida','+21624118442',TRUE,FALSE),
  ('CLI-2026-0001','Entrepôt',   FALSE,TRUE, FALSE,'Zone Industrielle Houmt Souk',NULL,'4180','Houmt Souk','Médenine','TN','Habib Trabelsi','+21671224100',FALSE,TRUE),
  -- Résidence Hammamet
  ('CLI-2026-0002','Résidence',  TRUE, TRUE, TRUE, 'Avenue Habib Bourguiba','Résidence 250 clés','8050','Hammamet Nord','Nabeul','TN','Amel Louati','+21671224891',TRUE,TRUE),
  -- Corail Mahdia
  ('CLI-2026-0003','Siège',      TRUE, TRUE, TRUE, 'Corniche de Mahdia',NULL,'5100','Mahdia','Mahdia','TN','Fatma Ayadi','+21679118442',TRUE,TRUE),
  -- Cotton Plus : usine + magasin
  ('CLI-2026-0004','Siège',      TRUE, FALSE,TRUE, 'Zone Industrielle El Menzah',NULL,'2010','Ariana','Ariana','TN','Rania Ben Salem','+21671448221',TRUE,FALSE),
  ('CLI-2026-0004','Entrepôt',   FALSE,TRUE, FALSE,'Zone Industrielle Charguia II','Bâtiment C','2035','Tunis Carthage','Tunis','TN','Mounir Ouali','+21671448222',FALSE,TRUE),
  -- Menzah
  ('CLI-2026-0005','Boutique',   TRUE, TRUE, TRUE, '12 Rue Ibn Khaldoun',NULL,'1004','El Menzah 6','Tunis','TN','Amine Sfar','+21698445220',TRUE,TRUE),
  -- Souk Sfax
  ('CLI-2026-0006','Magasin',    TRUE, TRUE, TRUE, 'Souk El Djemaa','Local 42','3000','Sfax','Sfax','TN','Leila Zouari','+21674220118',TRUE,TRUE),
  -- Medina Kairouan
  ('CLI-2026-0007','Boutique',   TRUE, TRUE, TRUE, 'Rue de la Grande Mosquée',NULL,'3100','Kairouan','Kairouan','TN','Youssef Mansour','+21622448990',TRUE,TRUE),
  -- Boutique Artisan Tunis
  ('CLI-2026-0008','Showroom',   TRUE, TRUE, TRUE, '5 Rue Alain Savary','Bureau 3','1002','Tunis Belvédère','Tunis','TN','Nadia Trabelsi','+21627990118',TRUE,TRUE),
  -- Riad Sfax
  ('CLI-2026-0009','Riad',       TRUE, TRUE, TRUE, '18 Rue de la Kasbah',NULL,'3000','Sfax Médina','Sfax','TN','Ines Riahi','+21674115220',TRUE,TRUE),
  -- Cocoon Spa
  ('CLI-2026-0010','Spa',        TRUE, FALSE,TRUE, 'Complexe El Kantaoui','Bloc B','4090','Port El Kantaoui','Sousse','TN','Slim Ghariani','+21673118442',TRUE,FALSE),
  ('CLI-2026-0010','Entrepôt',   FALSE,TRUE, FALSE,'Zone Industrielle Sidi Abdelhamid',NULL,'4001','Sousse','Sousse','TN','Dalel Marzouki','+21673118443',FALSE,TRUE),
  -- Leads / prospects
  ('CLI-2026-0011','Siège',      TRUE, TRUE, TRUE, 'Route de Gabès Km 4',NULL,'3002','Sfax','Sfax','TN','Nizar Chebbi','+21674228900',TRUE,TRUE),
  ('CLI-2026-0012','Villa',      TRUE, TRUE, TRUE, 'Route Sidi Jmour',NULL,'4180','Djerba','Médenine','TN','Bilel Hamdi','+21675220118',TRUE,TRUE),
  -- Maison Blanche Paris
  ('CLI-2026-0013','Boutique',   TRUE, TRUE, TRUE, '48 Avenue Georges V',NULL,'75008','Paris','Île-de-France','FR','Claire Dupont','+33142889900',TRUE,TRUE),
  ('CLI-2026-0013','Entrepôt',   FALSE,TRUE, FALSE,'12 Rue de la Roquette','Bâtiment B','75011','Paris','Île-de-France','FR','Pierre Martin','+33142889901',FALSE,FALSE),
  -- Hôtel Provence
  ('CLI-2026-0014','Siège',      TRUE, FALSE,TRUE, '25 Boulevard du Prado',NULL,'13008','Marseille','PACA','FR','Antoine Lefèvre','+33491229900',TRUE,FALSE),
  ('CLI-2026-0014','Entrepôt',   FALSE,TRUE, FALSE,'Zone Fret Aéroport Marignane',NULL,'13700','Marignane','PACA','FR','Camille Rousseau','+33491229901',FALSE,TRUE),
  -- Provence Lyon
  ('CLI-2026-0015','Boutique',   TRUE, TRUE, TRUE, '52 Rue de la République',NULL,'69002','Lyon','ARA','FR','Sophie Bernard','+33472445500',TRUE,TRUE),
  -- Berlin
  ('CLI-2026-0016','Siège',      TRUE, FALSE,TRUE, 'Friedrichstraße 88',NULL,'10117','Berlin','Berlin','DE','Klaus Schneider','+493033445500',TRUE,FALSE),
  ('CLI-2026-0016','Entrepôt',   FALSE,TRUE, FALSE,'Alt-Moabit 91','Halle 4','10559','Berlin','Berlin','DE','Anna Meier','+493033445501',FALSE,TRUE),
  -- Munich
  ('CLI-2026-0017','Spa',        TRUE, TRUE, TRUE, 'Maximilianstraße 34',NULL,'80539','München','Bayern','DE','Julia Fischer','+498922334455',TRUE,TRUE),
  -- Particuliers
  ('CLI-2026-0018','Siège',      TRUE, TRUE, TRUE, '12 Rue Ibn Khaldoun','Appt 4','1004','El Menzah 6','Tunis','TN','Amine Sfar','+21698445220',TRUE,TRUE),
  ('CLI-2026-0019','Siège',      TRUE, TRUE, TRUE, '5 Rue Alain Savary','Appt 8','1002','Tunis','Tunis','TN','Nadia Trabelsi','+21627990118',TRUE,TRUE),
  ('CLI-2026-0020','Siège',      TRUE, TRUE, TRUE, 'Ancienne Adresse',NULL,'3000','Sfax','Sfax','TN',NULL,NULL,TRUE,TRUE)
) AS x(code_client, libelle, tf, tl, ts, rue, complement, cp, ville, region, pays, cont_nom, cont_tel, def_fac, def_liv)
  ON c.code_client = x.code_client;

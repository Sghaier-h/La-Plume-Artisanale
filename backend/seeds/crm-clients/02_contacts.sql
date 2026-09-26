-- =============================================================================
-- 02_contacts.sql — ~40 contacts B2B rattachés aux comptes (§3.2)
-- Idempotence : suppression préalable des contacts existants pour ces comptes
-- seed (identifiés par email démo se terminant en '.demo.tn' / '.demo.fr' /
-- '.demo.de') pour permettre les ré-exécutions sans doublons.
-- =============================================================================

DELETE FROM contacts
 WHERE email LIKE '%.demo.tn' OR email LIKE '%.demo.fr' OR email LIKE '%.demo.de';

WITH c AS (
  SELECT id_client, code_client FROM comptes
   WHERE code_client BETWEEN 'CLI-2026-0001' AND 'CLI-2026-0020'
)
INSERT INTO contacts (id_client, role, civilite, nom, prenom, fonction, email, telephone, whatsapp, est_principal)
SELECT c.id_client, x.role, x.civilite, x.nom, x.prenom, x.fonction, x.email, x.telephone, x.whatsapp, x.est_principal
FROM c JOIN (VALUES
  ('CLI-2026-0001','responsable','Mme','Ben Hamida','Sonia','Directrice Achats','sonia.benhamida@marina.demo.tn','+21624118442','+21624118442',TRUE),
  ('CLI-2026-0001','comptabilite','M','Trabelsi','Habib','Responsable comptable','habib.t@marina.demo.tn','+21671224100',NULL,FALSE),
  ('CLI-2026-0002','responsable','M','Karray','Mehdi','Chef de projet linge','m.karray@residence-hb.demo.tn','+21671224890','+21671224890',TRUE),
  ('CLI-2026-0002','technique','Mme','Louati','Amel','Gouvernante générale','a.louati@residence-hb.demo.tn','+21671224891',NULL,FALSE),
  ('CLI-2026-0003','responsable','Mme','Ayadi','Fatma','Directrice marketing','f.ayadi@corail.demo.tn','+21679118442','+21679118442',TRUE),
  ('CLI-2026-0003','acheteur','M','Zaidi','Slim','Acheteur linge','s.zaidi@corail.demo.tn','+21679118443',NULL,FALSE),
  ('CLI-2026-0004','responsable','M','Ferchichi','Karim','Directeur Général','k.ferchichi@cottonplus.demo.tn','+21671448220','+21671448220',TRUE),
  ('CLI-2026-0004','acheteur','Mme','Ben Salem','Rania','Chef achats','r.bensalem@cottonplus.demo.tn','+21671448221','+21671448221',FALSE),
  ('CLI-2026-0004','technique','M','Ouali','Mounir','Responsable qualité','m.ouali@cottonplus.demo.tn','+21671448222',NULL,FALSE),
  ('CLI-2026-0005','responsable','M','Sfar','Amine','Gérant','amine.sfar@menzah.demo.tn','+21698445220','+21698445220',TRUE),
  ('CLI-2026-0005','commercial_client','Mme','Sfar','Leila','Assistante commerciale','l.sfar@menzah.demo.tn','+21698445221',NULL,FALSE),
  ('CLI-2026-0006','responsable','Mme','Zouari','Leila','Assistante commerciale','l.zouari@souk-sfax.demo.tn','+21674220118','+21674220118',TRUE),
  ('CLI-2026-0006','comptabilite','M','Mansour','Youssef','Comptable','y.mansour@souk-sfax.demo.tn','+21674220119',NULL,FALSE),
  ('CLI-2026-0007','responsable','M','Mansour','Youssef','Responsable magasin','y.mansour@medina-shop.demo.tn','+21622448990',NULL,TRUE),
  ('CLI-2026-0008','responsable','Mme','Trabelsi','Nadia','Responsable e-commerce','nadia.trabelsi@artisan-tn.demo.tn','+21627990118','+21627990118',TRUE),
  ('CLI-2026-0008','technique','M','Ben Amor','Karim','Développeur web','k.benamor@artisan-tn.demo.tn','+21627990119',NULL,FALSE),
  ('CLI-2026-0009','responsable','Mme','Riahi','Ines','Propriétaire','ines.riahi@riad-eldjazira.demo.tn','+21674115220','+21674115220',TRUE),
  ('CLI-2026-0010','responsable','M','Ghariani','Slim','Directeur Spa','s.ghariani@cocoon-spa.demo.tn','+21673118442','+21673118442',TRUE),
  ('CLI-2026-0010','acheteur','Mme','Marzouki','Dalel','Chef achats bien-être','d.marzouki@cocoon-spa.demo.tn','+21673118443',NULL,FALSE),
  ('CLI-2026-0011','responsable','M','Chebbi','Nizar','Directeur commercial','n.chebbi@textile-sfax.demo.tn','+21674228900',NULL,TRUE),
  ('CLI-2026-0012','responsable','M','Hamdi','Bilel','Régisseur villa','b.hamdi@byzantine.demo.tn','+21675220118','+21675220118',TRUE),
  ('CLI-2026-0013','responsable','Mme','Dupont','Claire','Directrice achats','claire.dupont@maison-blanche.demo.fr','+33142889900',NULL,TRUE),
  ('CLI-2026-0013','comptabilite','M','Martin','Pierre','Comptable','p.martin@maison-blanche.demo.fr','+33142889901',NULL,FALSE),
  ('CLI-2026-0014','responsable','M','Lefèvre','Antoine','Directeur achats groupe','a.lefevre@hotel-provence.demo.fr','+33491229900',NULL,TRUE),
  ('CLI-2026-0014','acheteur','Mme','Rousseau','Camille','Acheteuse linge','c.rousseau@hotel-provence.demo.fr','+33491229901',NULL,FALSE),
  ('CLI-2026-0015','responsable','Mme','Bernard','Sophie','Gérante','sophie.bernard@provence-lyon.demo.fr','+33472445500',NULL,TRUE),
  ('CLI-2026-0016','responsable','M','Schneider','Klaus','Einkaufsleiter','klaus.schneider@berliner-tex.demo.de','+493033445500',NULL,TRUE),
  ('CLI-2026-0016','comptabilite','Mme','Meier','Anna','Buchhaltung','a.meier@berliner-tex.demo.de','+493033445501',NULL,FALSE),
  ('CLI-2026-0017','responsable','Mme','Fischer','Julia','Spa-Direktorin','julia.fischer@wellness-mn.demo.de','+498922334455',NULL,TRUE),
  ('CLI-2026-0018','responsable','M','Sfar','Amine','','amine.sfar@perso.demo.tn','+21698445220','+21698445220',TRUE),
  ('CLI-2026-0019','responsable','Mme','Trabelsi','Nadia','','nadia.trabelsi@perso.demo.tn','+21627990118','+21627990118',TRUE),
  ('CLI-2026-0020','autre','M','Ancien','Contact','Ex-gérant','ancien@cactus.demo.tn',NULL,NULL,TRUE)
) AS x(code_client, role, civilite, nom, prenom, fonction, email, telephone, whatsapp, est_principal)
  ON c.code_client = x.code_client;

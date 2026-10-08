-- =============================================================================
-- 05_interactions.sql — ~50 interactions CRM démo (§3.5)
-- Idempotence : DELETE des sujets démo puis INSERT.
-- =============================================================================

DELETE FROM interactions_crm WHERE sujet LIKE 'DEMO ·%';

WITH c AS (
  SELECT id_client, code_client FROM comptes
   WHERE code_client BETWEEN 'CLI-2026-0001' AND 'CLI-2026-0020'
)
INSERT INTO interactions_crm (
  id_client, type, sujet, contenu, direction, date_interaction, suivi_date, suivi_effectue
)
SELECT c.id_client, x.type, x.sujet, x.contenu, x.direction,
       NOW() - (x.days_ago * INTERVAL '1 day' + x.hours_ago * INTERVAL '1 hour'),
       CASE WHEN x.suivi_delta IS NULL THEN NULL
            ELSE NOW() + (x.suivi_delta * INTERVAL '1 day') END,
       x.suivi_effectue
FROM c JOIN (VALUES
  -- Marina Djerba
  ('CLI-2026-0001','appel_sortant','DEMO · Confirmation commande draps housse',
    'Confirmation commande 400 draps housse + relance devis peignoirs waffle terracotta.',
    'sortant',0,2,3::int,FALSE),
  ('CLI-2026-0001','email_envoye','DEMO · Devis peignoirs',
    'Envoi devis n° DEV-2026-0087 - 320 peignoirs waffle 450g/m².','sortant',1,0,NULL,TRUE),
  ('CLI-2026-0001','whatsapp','DEMO · Suivi livraison',
    'Client demande précision date de livraison lot 3.','entrant',3,4,NULL,TRUE),
  ('CLI-2026-0001','rdv','DEMO · Visite site rénovation',
    'RDV Zone Sidi Mahrez pour prise de mesures salles de bain.','sortant',15,0,NULL,TRUE),

  -- Résidence Hammamet
  ('CLI-2026-0002','appel_entrant','DEMO · Retard livraison',
    'Client insatisfait retard livraison BL-2026-0044 - engagement livraison samedi.',
    'entrant',1,0,1,TRUE),
  ('CLI-2026-0002','email_envoye','DEMO · Excuses retard',
    'Envoi email courtoisie avec avoir 5%.','sortant',1,2,NULL,TRUE),

  -- Corail Mahdia
  ('CLI-2026-0003','email_recu','DEMO · Demande complément',
    'Client demande complément 200 serviettes 70x140 pour extension.','entrant',5,0,3,FALSE),
  ('CLI-2026-0003','appel_sortant','DEMO · Négociation prix volume',
    'Négociation grille tarifaire 2026 - accord remise 8% sur volume >5000pcs.','sortant',12,0,NULL,TRUE),

  -- Cotton Plus
  ('CLI-2026-0004','rdv','DEMO · Rencontre showroom La Marsa',
    'Présentation gamme fouta 100% coton égyptien - intérêt pour signature.','sortant',9,0,NULL,TRUE),
  ('CLI-2026-0004','email_envoye','DEMO · Contrat cadre 2026',
    'Envoi projet contrat cadre 8000 pcs/an avec conditions préférentielles.','sortant',22,0,NULL,TRUE),
  ('CLI-2026-0004','note','DEMO · Signature contrat',
    'Signature contrat cadre 2026 confirmée - 8000 pièces/an.','interne',22,0,NULL,TRUE),
  ('CLI-2026-0004','appel_sortant','DEMO · Point trimestriel Q1',
    'Point Q1 2026 - 2100 pcs livrées, cadence conforme.','sortant',30,0,NULL,TRUE),

  -- Boutique El Menzah
  ('CLI-2026-0005','note','DEMO · Relance facture',
    'Note interne: relancer sur la facture VE-2026-0128 (retard 21j).','interne',2,0,2,FALSE),
  ('CLI-2026-0005','email_envoye','DEMO · Relance impayé',
    'Relance amiable niveau 1 sur facture VE-2026-0128.','sortant',7,0,NULL,TRUE),

  -- Souk Sfax
  ('CLI-2026-0006','rdv','DEMO · Visite comptoir Souk',
    'Visite marché Souk El Djemaa - négociation prix marché.','sortant',6,0,NULL,TRUE),
  ('CLI-2026-0006','whatsapp','DEMO · Commande urgente',
    'Commande WhatsApp urgente 80 pcs pour weekend.','entrant',10,0,NULL,TRUE),

  -- Medina Kairouan
  ('CLI-2026-0007','appel_entrant','DEMO · Réclamation qualité coloris',
    'Client insatisfait qualité coloris terracotta lot mars.','entrant',11,0,4,FALSE),
  ('CLI-2026-0007','email_envoye','DEMO · Envoi échantillons',
    'Envoi échantillons corrigés terracotta lot production avril.','sortant',13,0,NULL,TRUE),

  -- Boutique Artisan Tunis
  ('CLI-2026-0008','email_envoye','DEMO · Envoi mockups Ramadan',
    'Envoi mockups packaging Ramadan + tarif remise volume.','sortant',0,5,2,FALSE),
  ('CLI-2026-0008','appel_sortant','DEMO · Suivi devis',
    'Suivi devis packaging - client réfléchit couleur pastel.','sortant',3,0,NULL,TRUE),

  -- Riad Sfax
  ('CLI-2026-0009','rdv','DEMO · Visite Riad Sfax',
    'Visite Riad Médina Sfax pour prise de mesures 12 chambres.','sortant',18,0,NULL,TRUE),
  ('CLI-2026-0009','email_envoye','DEMO · Devis fouta personnalisée',
    'Devis 500 pcs fouta personnalisée broderie logo Riad.','sortant',20,0,10,FALSE),

  -- Cocoon Spa
  ('CLI-2026-0010','email_envoye','DEMO · Devis peignoirs sur-mesure',
    'Devis 200 peignoirs sur-mesure coton bio GOTS.','sortant',4,0,5,FALSE),
  ('CLI-2026-0010','whatsapp','DEMO · Demande échantillons',
    'Client demande 3 échantillons coloris blanc/écru/sable.','entrant',6,0,NULL,TRUE),
  ('CLI-2026-0010','appel_sortant','DEMO · Point commande',
    'Point commande sur-mesure - accord démarrage production.','sortant',8,0,NULL,TRUE),

  -- Textile Sfax
  ('CLI-2026-0011','appel_entrant','DEMO · Prise de contact',
    'Contact initial - découverte activité et catalogue.','entrant',35,0,NULL,TRUE),

  -- Byzantine Djerba
  ('CLI-2026-0012','email_recu','DEMO · Demande via formulaire',
    'Demande formulaire web - projet villa privée haut de gamme.','entrant',40,0,15,FALSE),

  -- Maison Blanche Paris
  ('CLI-2026-0013','email_envoye','DEMO · Envoi catalogue 2026',
    'Envoi catalogue 2026 + tarifs export UE.','sortant',3,0,NULL,TRUE),
  ('CLI-2026-0013','rdv','DEMO · Salon TexFair Paris',
    'Rencontre TexFair Paris - visite stand et démo produits.','sortant',25,0,NULL,TRUE),
  ('CLI-2026-0013','appel_sortant','DEMO · Point commande mensuelle',
    'Point mensuel avril - commande stable 320 pcs.','sortant',15,0,NULL,TRUE),

  -- Hotel Provence (prospect)
  ('CLI-2026-0014','email_envoye','DEMO · Proposition contrat 2027',
    'Envoi proposition contrat cadre 12 hôtels 2027.','sortant',7,0,20,FALSE),
  ('CLI-2026-0014','rdv','DEMO · Visite Marseille',
    'Visite direction achats Marseille - présentation gamme.','sortant',18,0,NULL,TRUE),

  -- Provence Lyon
  ('CLI-2026-0015','whatsapp','DEMO · Commande express',
    'Commande express 60 pcs pour événement Fête des Lumières.','entrant',12,0,NULL,TRUE),
  ('CLI-2026-0015','email_envoye','DEMO · Facture proforma',
    'Envoi proforma commande express.','sortant',12,2,NULL,TRUE),

  -- Berliner
  ('CLI-2026-0016','email_envoye','DEMO · Catalogue pastel 2026',
    'Envoi catalogue gamme pastel spécial marché DACH.','sortant',10,0,NULL,TRUE),
  ('CLI-2026-0016','appel_sortant','DEMO · Négociation container',
    'Négociation prix container 40 pieds - remise 3% acceptée.','sortant',20,0,NULL,TRUE),

  -- Munich Wellness
  ('CLI-2026-0017','email_recu','DEMO · Demande certification GOTS',
    'Client demande documentation certification GOTS pour peignoirs.','entrant',5,0,3,FALSE),
  ('CLI-2026-0017','email_envoye','DEMO · Envoi certificats',
    'Envoi certificats GOTS + OEKO-TEX Standard 100.','sortant',6,0,NULL,TRUE),

  -- Particuliers
  ('CLI-2026-0018','whatsapp','DEMO · Commande trousseau',
    'Commande trousseau mariage - 40 pièces linge maison.','entrant',20,0,NULL,TRUE),
  ('CLI-2026-0018','appel_sortant','DEMO · Confirmation livraison',
    'Confirmation livraison trousseau semaine prochaine.','sortant',18,0,NULL,TRUE),

  ('CLI-2026-0019','email_envoye','DEMO · Devis e-commerce',
    'Devis pour projet e-commerce personnalisé.','sortant',8,0,7,FALSE),

  -- Multi-interactions supplémentaires
  ('CLI-2026-0001','email_envoye','DEMO · Newsletter Ramadan',
    'Envoi newsletter Ramadan avec offre partenaires hôteliers.','sortant',7,0,NULL,TRUE),
  ('CLI-2026-0002','note','DEMO · Enquête satisfaction',
    'Note interne: envoyer enquête satisfaction post-livraison.','interne',5,0,NULL,TRUE),
  ('CLI-2026-0003','whatsapp','DEMO · Confirmation dates',
    'Confirmation dates livraison échelonnée été 2026.','sortant',18,0,NULL,TRUE),
  ('CLI-2026-0004','email_recu','DEMO · Retour QA',
    'Retour qualité positif - 0 défaut lot avril.','entrant',5,0,NULL,TRUE),
  ('CLI-2026-0005','appel_entrant','DEMO · Question conditions paiement',
    'Client demande extension délai paiement 60→90j.','entrant',14,0,7,FALSE),
  ('CLI-2026-0006','note','DEMO · Update commercial',
    'Update commercial: mise à jour grille tarifaire souk.','interne',9,0,NULL,TRUE),
  ('CLI-2026-0008','whatsapp','DEMO · Photos mockups',
    'Envoi photos mockups packaging via WhatsApp.','sortant',2,3,NULL,TRUE),
  ('CLI-2026-0010','rdv','DEMO · Visite Spa Kantaoui',
    'Visite Spa El Kantaoui pour audit besoins linge.','sortant',15,0,NULL,TRUE),
  ('CLI-2026-0013','email_envoye','DEMO · Newsletter export',
    'Newsletter mensuelle export UE - nouveautés 2026.','sortant',28,0,NULL,TRUE)
) AS x(code_client, type, sujet, contenu, direction, days_ago, hours_ago, suivi_delta, suivi_effectue)
  ON c.code_client = x.code_client;

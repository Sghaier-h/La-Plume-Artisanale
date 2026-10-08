-- =============================================================================
-- 04_leads.sql — 15 leads démo réalistes (§3.4)
-- Idempotence : DELETE des emails démo puis INSERT.
-- =============================================================================

DELETE FROM leads WHERE email LIKE '%.lead.demo.tn' OR email LIKE '%.lead.demo.fr' OR email LIKE '%.lead.demo.de';

INSERT INTO leads (canal, source_detail, nom_prospect, email, telephone, societe, message,
                   statut, motif_perte, date_capture, date_conversion) VALUES
  ('formulaire_web','laplume-artisanale.tn/contact', 'Amira Louati',
   'amira.louati@boutique-carthage.lead.demo.tn','+21622110033','Boutique Carthage Nord',
   'Recherche fournisseur régulier pour fouta + peignoir. Volume estimé 200 pcs/mois.',
   'nouveau',NULL, NOW() - INTERVAL '2 days', NULL),

  ('pub_facebook','Ads : Ramadan 2026 · vidéo peignoir', 'Slim Riahi',
   'slim.riahi@sfax-textiles.lead.demo.tn','+21674556677','SFAX Textiles Groupement',
   'Intéressé par une visite showroom La Marsa · disponible fin de mois.',
   'en_traitement',NULL, NOW() - INTERVAL '5 days', NULL),

  ('email_recu','info@ · demande devis', 'Hela Ben Ammar',
   'h.benammar@spa-hammamet.lead.demo.tn','+21671448700','Spa Hammamet Yasmine',
   'Demande devis 300 peignoirs waffle + 500 draps bain terracotta.',
   'en_traitement',NULL, NOW() - INTERVAL '8 days', NULL),

  ('salon','TexFair 2026 · stand B14', 'Karim Bouzid',
   'k.bouzid@marina-monastir.lead.demo.tn','+21673880011','Marina Monastir Resort',
   'Rencontre TexFair · souhaite catalogue 2026 + prix indicatifs volume.',
   'converti',NULL, NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 days'),

  ('whatsapp','WhatsApp Business · +216 71 xxx xxx', 'Sami Kacem',
   's.kacem@boutique-nabeul.lead.demo.tn','+21672550088','Boutique Nabeul Centre',
   'Contact WhatsApp · demande présentation gamme fouta Jacquard.',
   'nouveau',NULL, NOW() - INTERVAL '1 day', NULL),

  ('telegram','Telegram @laplume_artisanale', 'Ines Chatti',
   'ines.chatti@tunis-souks.lead.demo.tn','+21625448800','Tunis Souks Cooperative',
   'Coopérative artisanale · souhaite référencer nos produits.',
   'en_traitement',NULL, NOW() - INTERVAL '12 days', NULL),

  ('telephone','Appel entrant · standard', 'Rafik Bouzid',
   'r.bouzid@grand-hotel.lead.demo.tn','+21671220099','Grand Hôtel Tunis',
   'Rénovation totale 320 chambres 2027 · budget textile 180kTND.',
   'nouveau',NULL, NOW() - INTERVAL '3 days', NULL),

  ('referral','Recommandé par Groupe Cotton Plus', 'Fadia Ghariani',
   'f.ghariani@boutique-sousse.lead.demo.tn','+21673118800','Boutique Sousse Riviera',
   'Recommandation directe · veut ouvrir compte fournisseur.',
   'converti',NULL, NOW() - INTERVAL '30 days', NOW() - INTERVAL '15 days'),

  ('pub_google','Google Ads · "fournisseur fouta Tunisie"', 'Sébastien Marchand',
   's.marchand@atelier-paris.lead.demo.fr','+33142667788','Atelier Paris Textile',
   'Grossiste Paris cherche partenaire Tunisie pour ligne 2027.',
   'en_traitement',NULL, NOW() - INTERVAL '10 days', NULL),

  ('salon','Salon Hôtellerie Djerba 2026', 'Mohamed Nasri',
   'm.nasri@djerba-palace.lead.demo.tn','+21675990022','Djerba Palace Beach Resort',
   'Nouveau resort 480 chambres · ouverture Mars 2027.',
   'perdu','PRIX_ELEVE', NOW() - INTERVAL '45 days', NULL),

  ('formulaire_web','laplume-artisanale.tn/devis', 'Julie Rousseau',
   'j.rousseau@boutique-marseille.lead.demo.fr','+33491445566','Boutique Marseille Centre',
   'Boutique linge maison · devis échantillon 20 pièces.',
   'perdu','DELAI_TROP_LONG', NOW() - INTERVAL '60 days', NULL),

  ('pub_facebook','Ads : Été 2026 · carrousel fouta plage', 'Tarek Zoghlami',
   't.zoghlami@plage-club.lead.demo.tn','+21671770099','Beach Club Yasmine',
   'Club de plage · besoin 400 fouta grand format juin 2026.',
   'perdu','CONCURRENT', NOW() - INTERVAL '70 days', NULL),

  ('email_recu','contact@ · demande partenariat', 'Andreas Weber',
   'a.weber@wellness-hamburg.lead.demo.de','+494033445599','Wellness Center Hamburg',
   'Centre wellness · intéressé peignoirs coton bio certifié GOTS.',
   'nouveau',NULL, NOW() - INTERVAL '4 days', NULL),

  ('telephone','Appel via +216 74 xxx xxx', 'Nada Trabelsi',
   'n.trabelsi@spa-mahdia.lead.demo.tn','+21673448800','Thalasso Spa Mahdia',
   'Thalasso 5* · besoin renouvellement complet linge été 2026.',
   'en_traitement',NULL, NOW() - INTERVAL '6 days', NULL),

  ('referral','Recommandé par Hotel Marina Djerba', 'Farid Guellouz',
   'f.guellouz@djerba-boutique.lead.demo.tn','+21675220099','Djerba Boutique Hotel',
   'Boutique hôtel 45 chambres · commande complète pour 2026.',
   'nouveau',NULL, NOW() - INTERVAL '2 days', NULL);

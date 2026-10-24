-- =============================================================================
-- 10_opportunites.sql — 15 opportunités démo (§8)
-- Idempotent via ON CONFLICT (numero_opportunite) DO NOTHING.
-- =============================================================================

-- Certaines colonnes FK peuvent ne pas être satisfiables sur la base v2 pure.
-- On insère avec id_commercial=1 (utilisateur admin par défaut).

INSERT INTO opportunites (numero_opportunite, libelle, id_client, id_commercial,
  etape, montant_estime, probabilite, date_cloture_prevue,
  source_opportunite, statut, description) VALUES
  ('OPP-2026-0001','Contrat cadre linge éponge 2026 · Marina Djerba',
   (SELECT id_client FROM comptes WHERE code_client='CLI-2026-0001'), 1,
   'NEGOCIATION', 42000, 70, '2026-11-15','RECOMMANDATION','ACTIVE',
   'Contrat cadre 4 200 pièces linge de bain sur 12 mois'),

  ('OPP-2026-0002','Rénovation textile 250 chambres · Résidence Hammamet',
   (SELECT id_client FROM comptes WHERE code_client='CLI-2026-0002'), 1,
   'PROPOSITION', 68000, 55, '2026-12-20','APPEL_ENTREE','ACTIVE',
   'Devis complet linge + peignoirs + draps housse'),

  ('OPP-2026-0003','Été 2026 · Corail Mahdia',
   (SELECT id_client FROM comptes WHERE code_client='CLI-2026-0003'), 1,
   'QUALIFICATION', 22000, 40, '2026-10-30','SITE_WEB','ACTIVE',
   'Renouvellement gamme peignoirs waffle terracotta'),

  ('OPP-2026-0004','Contrat cadre 2026 · Groupe Cotton Plus',
   (SELECT id_client FROM comptes WHERE code_client='CLI-2026-0004'), 1,
   'CLOTURE_GAGNEE', 180000, 100, '2026-02-01','RECOMMANDATION','GAGNEE',
   'Contrat 8 000 pcs/an signé le 22 janvier 2026'),

  ('OPP-2026-0005','Extension Boutique Menzah 6 · Rentrée',
   (SELECT id_client FROM comptes WHERE code_client='CLI-2026-0005'), 1,
   'NOUVEAU', 12500, 20, '2026-11-30','RESEAUX_SOCIAUX','ACTIVE',
   'Nouvel espace 30 m² à approvisionner'),

  ('OPP-2026-0006','Souk Sfax · commande hiver',
   (SELECT id_client FROM comptes WHERE code_client='CLI-2026-0006'), 1,
   'QUALIFICATION', 8200, 45, '2026-10-15','SITE_WEB','ACTIVE',
   'Réassort collection automne-hiver'),

  ('OPP-2026-0007','Kairouan Medina · lot spécial',
   (SELECT id_client FROM comptes WHERE code_client='CLI-2026-0007'), 1,
   'CLOTURE_PERDUE', 6800, 0, '2026-06-30','EMAIL','PERDUE',
   'Perte suite retard livraison précédent - client mécontent'),

  ('OPP-2026-0008','Packaging Ramadan 2026 · Artisan Tunis',
   (SELECT id_client FROM comptes WHERE code_client='CLI-2026-0008'), 1,
   'PROPOSITION', 15400, 60, '2026-10-15','RESEAUX_SOCIAUX','ACTIVE',
   'Packaging saisonnier + tarif remise volume'),

  ('OPP-2026-0009','Riad Sfax · fouta personnalisée',
   (SELECT id_client FROM comptes WHERE code_client='CLI-2026-0009'), 1,
   'PROPOSITION', 9800, 55, '2026-11-05','SITE_WEB','ACTIVE',
   '500 pcs fouta personnalisée broderie logo Riad'),

  ('OPP-2026-0010','Cocoon Spa Kantaoui · peignoirs GOTS',
   (SELECT id_client FROM comptes WHERE code_client='CLI-2026-0010'), 1,
   'NEGOCIATION', 18600, 75, '2026-10-25','RECOMMANDATION','ACTIVE',
   '200 peignoirs sur-mesure coton bio certifié GOTS'),

  ('OPP-2026-0011','Maison Blanche Paris · Q4',
   (SELECT id_client FROM comptes WHERE code_client='CLI-2026-0013'), 1,
   'CLOTURE_GAGNEE', 24500, 100, '2026-09-30','APPEL_ENTREE','GAGNEE',
   'Réassort trimestriel Q4 · signé 15 septembre'),

  ('OPP-2026-0012','Contrat 12 hôtels · Groupe Hôtelier Provence',
   (SELECT id_client FROM comptes WHERE code_client='CLI-2026-0014'), 1,
   'PROPOSITION', 240000, 45, '2027-01-15','RECOMMANDATION','ACTIVE',
   'Négociation contrat cadre 2027 pour 12 hôtels'),

  ('OPP-2026-0013','Provence Lyon · Fête des Lumières',
   (SELECT id_client FROM comptes WHERE code_client='CLI-2026-0015'), 1,
   'CLOTURE_GAGNEE', 3800, 100, '2026-11-30','SITE_WEB','GAGNEE',
   'Commande express pour événement décembre'),

  ('OPP-2026-0014','Container 40 pieds · Berliner Textilhandel',
   (SELECT id_client FROM comptes WHERE code_client='CLI-2026-0016'), 1,
   'NEGOCIATION', 96000, 65, '2026-12-15','SITE_WEB','ACTIVE',
   'Container mixte gamme pastel · négociation prix acceptée'),

  ('OPP-2026-0015','Munich Wellness · peignoirs bio',
   (SELECT id_client FROM comptes WHERE code_client='CLI-2026-0017'), 1,
   'QUALIFICATION', 22400, 40, '2026-12-01','SITE_WEB','ACTIVE',
   'Devis 150 peignoirs coton bio GOTS + OEKO-TEX')
ON CONFLICT (numero_opportunite) DO NOTHING;

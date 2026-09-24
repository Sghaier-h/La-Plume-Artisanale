-- =============================================================================
-- 02_societe.sql — Seed société "La Plume Artisanale" + adresse siège + RIB
-- =============================================================================

INSERT INTO parametres_societe (
  code_societe, raison_sociale, forme_juridique, capital_social, devise_capital,
  matricule_fiscal, code_tva, rc,
  site_web, email_contact, telephone_contact, whatsapp_contact
) VALUES (
  'LP',
  'La Plume Artisanale',
  'SARL',
  100000.000,
  'TND',
  'MF-A-CHANGER',
  'CODE-TVA-A-CHANGER',
  'RC-A-CHANGER',
  'https://fabrication.laplume-artisanale.tn',
  'contact@laplume-artisanale.tn',
  '+21600000000',
  '+21600000000'
)
ON CONFLICT (code_societe) DO NOTHING;

INSERT INTO societe_adresses (
  id_societe, type_adresse, libelle, rue, code_postal, ville, region, pays, est_principale
)
SELECT id_societe, 'siege_social', 'Siège social',
       'Zone artisanale — à renseigner', '3000', 'Sfax', 'Sfax', 'TN', TRUE
FROM parametres_societe WHERE code_societe = 'LP'
ON CONFLICT DO NOTHING;

INSERT INTO societe_bancaires (
  id_societe, libelle, banque, agence, rib, iban, bic, devise, est_defaut, actif
)
SELECT id_societe, 'Compte principal', 'BIAT', 'Sfax Centre',
       '08000000000000000000', 'TN5908000000000000000000', 'BIATTNTT', 'TND', TRUE, TRUE
FROM parametres_societe WHERE code_societe = 'LP'
ON CONFLICT DO NOTHING;

-- Sources de leads (§15 · ParamCrm)
INSERT INTO crm_sources_leads (code, libelle, ordre) VALUES
  ('SITE_WEB',       'Site web laplume-artisanale.tn', 1),
  ('SALON_TEXFAIR',  'Salon TexFair Tunis',            2),
  ('RECOMMANDATION', 'Recommandation client',          3),
  ('INSTAGRAM',      'Instagram organique',            4),
  ('FACEBOOK_ADS',   'Facebook Ads',                   5),
  ('GOOGLE_ADS',     'Google Ads',                     6),
  ('CALL_ENTRANT',   'Appel entrant',                  7),
  ('WHATSAPP_BIZ',   'WhatsApp Business',              8),
  ('TELEGRAM',       'Telegram',                       9),
  ('SALON_HOTELLERIE','Salon Hôtellerie Djerba',       10),
  ('IMPORT_CSV',     'Import CSV manuel',              11)
ON CONFLICT (code) DO NOTHING;

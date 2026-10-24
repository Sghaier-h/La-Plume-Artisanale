-- =============================================================================
-- 01_caisses.sql — Caisses La Plume Artisanale (§14quater.1)
--
-- Jeu démo réaliste pour atelier Tunisie :
--   • Caisse principale (siège Ksar Hellal)
--   • Caisse showroom (Hammamet)
--   • Caisse chèques clients (encaissement différé)
--   • Caisse compensation (opérations croisées sans flux cash)
--   • Caisse apport gérant (avances personnelles)
--
-- + routage par défaut : espèce → principale, chèque → chèques clients,
-- virement → compensation (banque), traite → chèques clients,
-- compensation → compensation.
-- =============================================================================

INSERT INTO caisses (code, libelle, type_caisse, ordre, solde_initial, solde_theorique, actif, compte_compta)
VALUES
  ('CAISSE-PRINCIPALE', 'Caisse principale (Ksar Hellal)', 'principale',       10, 2500.000, 2500.000, TRUE, '54'),
  ('CAISSE-SHOWROOM',   'Caisse showroom (Hammamet)',      'showroom',          20,  800.000,  800.000, TRUE, '54'),
  ('CAISSE-CHEQUES',    'Caisse chèques clients',          'cheques_clients',   30,    0.000,    0.000, TRUE, '511'),
  ('CAISSE-COMP',       'Caisse compensation croisée',     'compensation',      40,    0.000,    0.000, TRUE, '471'),
  ('CAISSE-APPORT',     'Caisse apport gérant',            'apport_gerant',     50,    0.000,    0.000, TRUE, '455')
ON CONFLICT (code) DO UPDATE SET
  libelle         = EXCLUDED.libelle,
  type_caisse     = EXCLUDED.type_caisse,
  ordre           = EXCLUDED.ordre,
  updated_at      = NOW();

-- Routage mode de paiement → caisse par défaut
INSERT INTO routage_caisse_par_mode (mode_paiement, id_caisse_default, libelle, actif)
SELECT 'espece',       c.id_caisse, 'Espèces → caisse principale',     TRUE FROM caisses c WHERE c.code = 'CAISSE-PRINCIPALE'
ON CONFLICT (mode_paiement) DO UPDATE SET id_caisse_default = EXCLUDED.id_caisse_default, updated_at = NOW();
INSERT INTO routage_caisse_par_mode (mode_paiement, id_caisse_default, libelle, actif)
SELECT 'cheque',       c.id_caisse, 'Chèques → caisse chèques clients', TRUE FROM caisses c WHERE c.code = 'CAISSE-CHEQUES'
ON CONFLICT (mode_paiement) DO UPDATE SET id_caisse_default = EXCLUDED.id_caisse_default, updated_at = NOW();
INSERT INTO routage_caisse_par_mode (mode_paiement, id_caisse_default, libelle, actif)
SELECT 'virement',     c.id_caisse, 'Virements → compensation',         TRUE FROM caisses c WHERE c.code = 'CAISSE-COMP'
ON CONFLICT (mode_paiement) DO UPDATE SET id_caisse_default = EXCLUDED.id_caisse_default, updated_at = NOW();
INSERT INTO routage_caisse_par_mode (mode_paiement, id_caisse_default, libelle, actif)
SELECT 'cb',           c.id_caisse, 'CB → compensation',                TRUE FROM caisses c WHERE c.code = 'CAISSE-COMP'
ON CONFLICT (mode_paiement) DO UPDATE SET id_caisse_default = EXCLUDED.id_caisse_default, updated_at = NOW();
INSERT INTO routage_caisse_par_mode (mode_paiement, id_caisse_default, libelle, actif)
SELECT 'traite',       c.id_caisse, 'Traites → chèques clients',        TRUE FROM caisses c WHERE c.code = 'CAISSE-CHEQUES'
ON CONFLICT (mode_paiement) DO UPDATE SET id_caisse_default = EXCLUDED.id_caisse_default, updated_at = NOW();
INSERT INTO routage_caisse_par_mode (mode_paiement, id_caisse_default, libelle, actif)
SELECT 'compensation', c.id_caisse, 'Compensation croisée',             TRUE FROM caisses c WHERE c.code = 'CAISSE-COMP'
ON CONFLICT (mode_paiement) DO UPDATE SET id_caisse_default = EXCLUDED.id_caisse_default, updated_at = NOW();
INSERT INTO routage_caisse_par_mode (mode_paiement, id_caisse_default, libelle, actif)
SELECT 'mobile_money', c.id_caisse, 'D17/Flouci → principale',          TRUE FROM caisses c WHERE c.code = 'CAISSE-PRINCIPALE'
ON CONFLICT (mode_paiement) DO UPDATE SET id_caisse_default = EXCLUDED.id_caisse_default, updated_at = NOW();

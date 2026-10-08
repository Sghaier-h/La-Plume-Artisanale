-- =============================================================================
-- 01_roles.sql — Seed rôles + permissions granulaires
-- Contrat v2.2 — §2.4 + §2bis.8
-- =============================================================================

INSERT INTO roles (code, libelle, description, systeme, ordre_affichage) VALUES
  ('ADMIN',            'Administrateur',                 'Accès complet — création/validation factures, avoirs, écritures, clôtures', TRUE, 1),
  ('DIRECTION',        'Direction',                      'Lecture globale, dashboards, validations exceptionnelles',                     TRUE, 2),
  ('COMMERCIAL',       'Commercial',                     'Gère ses comptes clients, devis, commandes, BL',                               TRUE, 3),
  ('ATELIER_CHEF',     'Chef d''atelier',                'Pilotage terrain d''un atelier physique, planification OF',                    TRUE, 4),
  ('ATELIER_OPERATEUR','Opérateur atelier',              'Tisseur / coupeur / ourdisseur — pointage tablette',                           TRUE, 5),
  ('COMPTABLE',        'Comptable',                      'Écritures, TVA, rapprochement bancaire, bilan',                                TRUE, 6),
  ('RH',               'Responsable RH',                 'Employés, contrats, congés, paie, formations',                                 TRUE, 7),
  ('MAGASINIER',       'Magasinier',                     'Réceptions, sorties, transferts, inventaires (tous entrepôts)',                TRUE, 8)
ON CONFLICT (code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Catalogue permissions granulaires <domaine>:<action>[:<scope>]
-- -----------------------------------------------------------------------------
INSERT INTO permissions (code, domaine, action, scope, libelle) VALUES
  -- Utilisateurs
  ('user:consulter',            'user',      'consulter',  NULL, 'Consulter les utilisateurs'),
  ('user:creer',                'user',      'creer',      NULL, 'Créer un utilisateur'),
  ('user:modifier',             'user',      'modifier',   NULL, 'Modifier un utilisateur'),
  ('user:supprimer',            'user',      'supprimer',  NULL, 'Supprimer un utilisateur'),
  ('user:reset_mfa',            'user',      'reset_mfa',  NULL, 'Réinitialiser la MFA d''un utilisateur'),
  ('user:verrouiller',          'user',      'verrouiller',NULL, 'Verrouiller / déverrouiller un compte'),
  ('user:impersonate',          'user',      'impersonate',NULL, 'Se connecter en tant que (audit)'),

  -- Rôles et permissions
  ('role:consulter',            'role',      'consulter',  NULL, 'Consulter les rôles'),
  ('role:gerer',                'role',      'gerer',      NULL, 'Créer/modifier/supprimer des rôles'),
  ('permission:attribuer',      'permission','attribuer',  NULL, 'Attribuer des permissions à un utilisateur'),

  -- Paramètres société
  ('parametres_societe:consulter','parametres_societe','consulter',NULL,'Consulter les paramètres société'),
  ('parametres_societe:modifier', 'parametres_societe','modifier', NULL,'Modifier les paramètres société'),

  -- Numérotation
  ('numerotation:consulter',    'numerotation','consulter',NULL, 'Consulter les paramètres numérotation'),
  ('numerotation:modifier',     'numerotation','modifier', NULL, 'Modifier une numérotation'),
  ('numerotation:reset',        'numerotation','reset',    NULL, 'Réinitialiser une séquence'),
  ('numerotation:generer',      'numerotation','generer',  NULL, 'Générer un prochain numéro'),

  -- CRM comptes
  ('client:consulter',          'client',    'consulter',  NULL,   'Consulter les comptes'),
  ('client:consulter:soi',      'client',    'consulter',  'soi',  'Consulter uniquement ses comptes'),
  ('client:creer',              'client',    'creer',      NULL,   'Créer un compte'),
  ('client:modifier',           'client',    'modifier',   NULL,   'Modifier un compte'),
  ('client:supprimer',          'client',    'supprimer',  NULL,   'Supprimer un compte'),
  ('client:reassigner',         'client',    'reassigner', NULL,   'Réassigner le commercial d''un compte'),
  ('client:archiver',           'client',    'archiver',   NULL,   'Archiver un compte'),
  ('client:rgpd',               'client',    'rgpd',       NULL,   'Droit à l''oubli / export RGPD'),

  -- CRM contacts / adresses / bancaires
  ('contact:gerer',             'contact',   'gerer',      NULL, 'Gérer les contacts d''un compte'),
  ('adresse_client:gerer',      'adresse_client','gerer',  NULL, 'Gérer les adresses d''un compte'),
  ('bancaire_client:gerer',     'bancaire_client','gerer', NULL, 'Gérer les comptes bancaires d''un client'),

  -- Historique
  ('historique_commercial:consulter','historique_commercial','consulter',NULL,'Consulter l''historique commercial'),
  ('historique_commercial:ajouter',  'historique_commercial','ajouter',  NULL,'Ajouter une interaction'),

  -- Tarification
  ('tarif:consulter',           'tarif',     'consulter',  NULL, 'Consulter les grilles tarifaires'),
  ('tarif:creer',               'tarif',     'creer',      NULL, 'Créer une grille tarifaire'),
  ('tarif:modifier',            'tarif',     'modifier',   NULL, 'Modifier une grille tarifaire'),
  ('tarif:supprimer',           'tarif',     'supprimer',  NULL, 'Supprimer une grille tarifaire'),
  ('tarif:appliquer',           'tarif',     'appliquer',  NULL, 'Appliquer une grille à un compte'),
  ('remise:gerer',              'remise',    'gerer',      NULL, 'Gérer les remises client'),
  ('condition_paiement:gerer',  'condition_paiement','gerer',NULL,'Gérer les conditions de paiement')
ON CONFLICT (code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Attribution par rôle
-- -----------------------------------------------------------------------------

-- ADMIN → toutes les permissions
INSERT INTO role_permissions (id_role, id_permission)
SELECT r.id_role, p.id_permission
FROM roles r CROSS JOIN permissions p
WHERE r.code = 'ADMIN'
ON CONFLICT DO NOTHING;

-- DIRECTION → lecture partout + tarifs + numérotation consult
INSERT INTO role_permissions (id_role, id_permission)
SELECT r.id_role, p.id_permission
FROM roles r, permissions p
WHERE r.code = 'DIRECTION'
  AND p.code IN (
    'user:consulter','role:consulter',
    'parametres_societe:consulter','numerotation:consulter',
    'client:consulter','contact:gerer','adresse_client:gerer','bancaire_client:gerer',
    'historique_commercial:consulter','historique_commercial:ajouter',
    'tarif:consulter','remise:gerer','condition_paiement:gerer'
  )
ON CONFLICT DO NOTHING;

-- COMMERCIAL → CRUD ses comptes uniquement + tarifs consult + historique
INSERT INTO role_permissions (id_role, id_permission)
SELECT r.id_role, p.id_permission
FROM roles r, permissions p
WHERE r.code = 'COMMERCIAL'
  AND p.code IN (
    'client:consulter:soi','client:creer','client:modifier','client:archiver',
    'contact:gerer','adresse_client:gerer','bancaire_client:gerer',
    'historique_commercial:consulter','historique_commercial:ajouter',
    'tarif:consulter','tarif:appliquer',
    'numerotation:generer'
  )
ON CONFLICT DO NOTHING;

-- COMPTABLE → lecture clients + tarifs + numérotation
INSERT INTO role_permissions (id_role, id_permission)
SELECT r.id_role, p.id_permission
FROM roles r, permissions p
WHERE r.code = 'COMPTABLE'
  AND p.code IN (
    'client:consulter','tarif:consulter','condition_paiement:gerer',
    'parametres_societe:consulter','numerotation:consulter','numerotation:generer'
  )
ON CONFLICT DO NOTHING;

-- RH → gère utilisateurs (hors ADMIN) + paramètres société consult
INSERT INTO role_permissions (id_role, id_permission)
SELECT r.id_role, p.id_permission
FROM roles r, permissions p
WHERE r.code = 'RH'
  AND p.code IN (
    'user:consulter','user:creer','user:modifier','user:verrouiller',
    'parametres_societe:consulter'
  )
ON CONFLICT DO NOTHING;

-- ATELIER_CHEF / ATELIER_OPERATEUR / MAGASINIER → périmètre limité Domaine A
INSERT INTO role_permissions (id_role, id_permission)
SELECT r.id_role, p.id_permission
FROM roles r, permissions p
WHERE r.code IN ('ATELIER_CHEF','ATELIER_OPERATEUR','MAGASINIER')
  AND p.code IN ('client:consulter','tarif:consulter','numerotation:generer')
ON CONFLICT DO NOTHING;

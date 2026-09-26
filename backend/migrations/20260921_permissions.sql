-- ============================================================
-- Migration : Permissions & RBAC (20260921)
-- ============================================================

CREATE TABLE IF NOT EXISTS permissions (
  id_permission SERIAL PRIMARY KEY,
  code VARCHAR(64) UNIQUE,
  libelle VARCHAR(255),
  module VARCHAR(64),
  description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id_role INTEGER,
  id_permission INTEGER,
  PRIMARY KEY (id_role, id_permission)
);

-- Seed permissions par module
INSERT INTO permissions (code, libelle, module, description) VALUES
  ('clients.read',     'Voir clients',        'clients',    'Consulter la liste des clients'),
  ('clients.write',    'Modifier clients',    'clients',    'Créer/modifier/supprimer'),
  ('commandes.read',   'Voir commandes',      'commandes',  ''),
  ('commandes.write',  'Modifier commandes',  'commandes',  ''),
  ('commandes.valider','Valider commandes',   'commandes',  ''),
  ('of.read',          'Voir OF',             'production', ''),
  ('of.write',         'Modifier OF',         'production', ''),
  ('of.lancer',        'Lancer OF',           'production', ''),
  ('stock.read',       'Voir stock',          'stock',      ''),
  ('stock.write',      'Modifier stock',      'stock',      ''),
  ('factures.read',    'Voir factures',       'finance',    ''),
  ('factures.write',   'Créer factures',      'finance',    ''),
  ('rh.read',          'Voir RH',             'rh',         ''),
  ('rh.write',         'Modifier RH',         'rh',         ''),
  ('rh.pointage',      'Gérer pointage',      'rh',         ''),
  ('parametrage.write','Paramétrer ERP',      'admin',      ''),
  ('utilisateurs.write','Gérer utilisateurs', 'admin',      ''),
  ('admin.all',        'Admin complet',       'admin',      'Toutes permissions')
ON CONFLICT (code) DO NOTHING;

-- Attribution par défaut par rôle
-- ADMIN → tout
INSERT INTO role_permissions (id_role, id_permission)
  SELECT r.id_role, p.id_permission FROM roles r, permissions p
  WHERE r.code_role = 'ADMIN'
ON CONFLICT DO NOTHING;

-- CHEF_PROD → OF/stock/read+write
INSERT INTO role_permissions (id_role, id_permission)
  SELECT r.id_role, p.id_permission FROM roles r, permissions p
  WHERE r.code_role IN ('CHEF_PROD','CHEF_PRODUCTION')
    AND p.code IN ('of.read','of.write','of.lancer','stock.read','commandes.read','clients.read')
ON CONFLICT DO NOTHING;

-- COMMERCIAL → clients/commandes/devis/factures
INSERT INTO role_permissions (id_role, id_permission)
  SELECT r.id_role, p.id_permission FROM roles r, permissions p
  WHERE r.code_role = 'COMMERCIAL'
    AND p.code IN ('clients.read','clients.write','commandes.read','commandes.write','factures.read','factures.write')
ON CONFLICT DO NOTHING;

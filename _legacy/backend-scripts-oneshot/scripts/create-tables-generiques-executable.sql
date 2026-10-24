-- Script SQL généré automatiquement pour créer les tables des contrôleurs génériques
-- Base de données: ERP_La_Plume
-- Date: 2026-01-28T19:58:27.917Z

-- Note: Ce script crée les tables avec une structure de base standard
-- Vous pouvez adapter les colonnes selon vos besoins métier spécifiques

-- Table: mobile (contrôleur: mobile)
CREATE TABLE IF NOT EXISTS mobile (
  id_mobile SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: email (contrôleur: email)
CREATE TABLE IF NOT EXISTS email (
  id_email SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: settings (contrôleur: settings)
CREATE TABLE IF NOT EXISTS settings (
  id_settings SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: multisociete (contrôleur: multisociete)
CREATE TABLE IF NOT EXISTS multisociete (
  id_multisociete SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: whatsapp (contrôleur: whatsapp)
CREATE TABLE IF NOT EXISTS whatsapp (
  id_whatsapp SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: social_auth (contrôleur: social-auth)
CREATE TABLE IF NOT EXISTS social_auth (
  id_social SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: ai (contrôleur: ai)
CREATE TABLE IF NOT EXISTS ai (
  id_ai SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: warehouse (contrôleur: warehouse)
CREATE TABLE IF NOT EXISTS warehouse (
  id_warehouse SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: accounting_tunisia (contrôleur: accounting-tunisia)
CREATE TABLE IF NOT EXISTS accounting_tunisia (
  id_accounting SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: payroll_tunisia (contrôleur: payroll-tunisia)
CREATE TABLE IF NOT EXISTS payroll_tunisia (
  id_payroll SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: pos (contrôleur: pos)
CREATE TABLE IF NOT EXISTS pos (
  id_pos SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: excel_import (contrôleur: excel-import)
CREATE TABLE IF NOT EXISTS excel_import (
  id_excel SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: audit (contrôleur: audit)
CREATE TABLE IF NOT EXISTS audit (
  id_audit SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: utilisateurs (contrôleur: utilisateurs)
CREATE TABLE IF NOT EXISTS utilisateurs (
  id_utilisateurs SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: pointage (contrôleur: pointage)
CREATE TABLE IF NOT EXISTS pointage (
  id_pointage SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: database (contrôleur: database)
CREATE TABLE IF NOT EXISTS database (
  id_database SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: migration (contrôleur: migration)
CREATE TABLE IF NOT EXISTS migration (
  id_migration SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: webhooks (contrôleur: webhooks)
CREATE TABLE IF NOT EXISTS webhooks (
  id_webhooks SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: ecommerce (contrôleur: ecommerce)
CREATE TABLE IF NOT EXISTS ecommerce (
  id_ecommerce SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: communication (contrôleur: communication)
CREATE TABLE IF NOT EXISTS communication (
  id_communication SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: reports (contrôleur: reports)
CREATE TABLE IF NOT EXISTS reports (
  id_reports SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: couts (contrôleur: couts)
CREATE TABLE IF NOT EXISTS couts (
  id_couts SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: qualite_avance (contrôleur: qualite-avance)
CREATE TABLE IF NOT EXISTS qualite_avance (
  id_qualite SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: planification_gantt (contrôleur: planification-gantt)
CREATE TABLE IF NOT EXISTS planification_gantt (
  id_planification SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: maintenance (contrôleur: maintenance)
CREATE TABLE IF NOT EXISTS maintenance (
  id_maintenance SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: produits (contrôleur: produits)
CREATE TABLE IF NOT EXISTS produits (
  id_produits SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: messages (contrôleur: messages)
CREATE TABLE IF NOT EXISTS messages (
  id_messages SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: notifications (contrôleur: notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id_notifications SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: taches (contrôleur: taches)
CREATE TABLE IF NOT EXISTS taches (
  id_taches SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: documents (contrôleur: documents)
CREATE TABLE IF NOT EXISTS documents (
  id_documents SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: qualite_avancee (contrôleur: qualite-avancee)
CREATE TABLE IF NOT EXISTS qualite_avancee (
  id_qualite SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: tracabilite_lots (contrôleur: tracabilite-lots)
CREATE TABLE IF NOT EXISTS tracabilite_lots (
  id_tracabilite SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: stock_multi_entrepots (contrôleur: stock-multi-entrepots)
CREATE TABLE IF NOT EXISTS stock_multi_entrepots (
  id_stock SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: planning_dragdrop (contrôleur: planning-dragdrop)
CREATE TABLE IF NOT EXISTS planning_dragdrop (
  id_planning SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: selecteurs_machines (contrôleur: selecteurs-machines)
CREATE TABLE IF NOT EXISTS selecteurs_machines (
  id_selecteurs SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: articles_catalogue (contrôleur: articles-catalogue)
CREATE TABLE IF NOT EXISTS articles_catalogue (
  id_articles SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: modeles (contrôleur: modeles)
CREATE TABLE IF NOT EXISTS modeles (
  id_modeles SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: parametres_catalogue (contrôleur: parametres-catalogue)
CREATE TABLE IF NOT EXISTS parametres_catalogue (
  id_parametres SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: suivi_fabrication (contrôleur: suivi-fabrication)
CREATE TABLE IF NOT EXISTS suivi_fabrication (
  id_suivi SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: matieres_premieres (contrôleur: matieres-premieres)
CREATE TABLE IF NOT EXISTS matieres_premieres (
  id_matieres SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: parametrage (contrôleur: parametrage)
CREATE TABLE IF NOT EXISTS parametrage (
  id_parametrage SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: planning (contrôleur: planning)
CREATE TABLE IF NOT EXISTS planning (
  id_planning SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: production (contrôleur: production)
CREATE TABLE IF NOT EXISTS production (
  id_production SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: dashboard (contrôleur: dashboard)
CREATE TABLE IF NOT EXISTS dashboard (
  id_dashboard SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: soustraitants (contrôleur: soustraitants)
CREATE TABLE IF NOT EXISTS soustraitants (
  id_soustraitants SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: of (contrôleur: of)
CREATE TABLE IF NOT EXISTS of (
  id_of SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: machines (contrôleur: machines)
CREATE TABLE IF NOT EXISTS machines (
  id_machines SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: bons_retour (contrôleur: bons-retour)
CREATE TABLE IF NOT EXISTS bons_retour (
  id_bons SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: bons_livraison (contrôleur: bons-livraison)
CREATE TABLE IF NOT EXISTS bons_livraison (
  id_bons SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: avoirs (contrôleur: avoirs)
CREATE TABLE IF NOT EXISTS avoirs (
  id_avoirs SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Table: search (contrôleur: search)
CREATE TABLE IF NOT EXISTS search (
  id_search SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);

-- Fin du script
-- Total: 51 tables créées

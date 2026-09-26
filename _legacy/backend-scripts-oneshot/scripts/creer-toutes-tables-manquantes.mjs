/**
 * Script pour créer toutes les tables manquantes identifiées dans le diagnostic
 */

import { pool } from '../src/utils/db.js';

const tablesToCreate = [
  // Tables de base
  {
    name: 'societes',
    sql: `
      CREATE TABLE IF NOT EXISTS societes (
        id_societe SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        raison_sociale VARCHAR(255),
        adresse TEXT,
        code_postal VARCHAR(20),
        ville VARCHAR(100),
        pays VARCHAR(100),
        telephone VARCHAR(20),
        email VARCHAR(150),
        siren_siret VARCHAR(50),
        numero_tva VARCHAR(50),
        actif BOOLEAN DEFAULT true,
        date_creation TIMESTAMP DEFAULT NOW(),
        date_modification TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'commercial',
    sql: `
      CREATE TABLE IF NOT EXISTS commercial (
        id_commercial SERIAL PRIMARY KEY,
        nom VARCHAR(255),
        description TEXT,
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  // Tables account
  {
    name: 'account_move_lines',
    sql: `
      CREATE TABLE IF NOT EXISTS account_move_lines (
        id SERIAL PRIMARY KEY,
        move_id INTEGER,
        account_id INTEGER,
        product_id INTEGER,
        name TEXT,
        quantity NUMERIC(10,2),
        price_unit NUMERIC(10,2),
        debit NUMERIC(12,2),
        credit NUMERIC(12,2),
        balance NUMERIC(12,2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'account_taxs',
    sql: `
      CREATE TABLE IF NOT EXISTS account_taxs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        amount NUMERIC(5,2),
        type_tax VARCHAR(50),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'account_accounts',
    sql: `
      CREATE TABLE IF NOT EXISTS account_accounts (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE,
        name VARCHAR(255),
        type VARCHAR(50),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'account_journals',
    sql: `
      CREATE TABLE IF NOT EXISTS account_journals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        code VARCHAR(50) UNIQUE,
        type VARCHAR(50),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'account_reconciliations',
    sql: `
      CREATE TABLE IF NOT EXISTS account_reconciliations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        date_reconciliation DATE,
        state VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  // Tables HR
  {
    name: 'hr_departments',
    sql: `
      CREATE TABLE IF NOT EXISTS hr_departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'hr_leaves',
    sql: `
      CREATE TABLE IF NOT EXISTS hr_leaves (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER,
        date_start DATE,
        date_end DATE,
        type_leave VARCHAR(50),
        state VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'hr_expenses',
    sql: `
      CREATE TABLE IF NOT EXISTS hr_expenses (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER,
        date_expense DATE,
        amount NUMERIC(10,2),
        description TEXT,
        state VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  // Tables product
  {
    name: 'product_variants',
    sql: `
      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,
        product_tmpl_id INTEGER,
        name VARCHAR(255),
        default_code VARCHAR(100),
        barcode VARCHAR(100),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'product_categorys',
    sql: `
      CREATE TABLE IF NOT EXISTS product_categorys (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        parent_id INTEGER,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'uoms',
    sql: `
      CREATE TABLE IF NOT EXISTS uoms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        category VARCHAR(50),
        factor NUMERIC(10,2) DEFAULT 1,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  // Tables sale
  {
    name: 'sale_order_lines',
    sql: `
      CREATE TABLE IF NOT EXISTS sale_order_lines (
        id SERIAL PRIMARY KEY,
        order_id INTEGER,
        product_id INTEGER,
        name TEXT,
        quantity NUMERIC(10,2),
        price_unit NUMERIC(10,2),
        price_subtotal NUMERIC(12,2),
        discount NUMERIC(5,2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  // Tables purchase
  {
    name: 'purchase_order_lines',
    sql: `
      CREATE TABLE IF NOT EXISTS purchase_order_lines (
        id SERIAL PRIMARY KEY,
        order_id INTEGER,
        product_id INTEGER,
        name TEXT,
        quantity NUMERIC(10,2),
        price_unit NUMERIC(10,2),
        price_subtotal NUMERIC(12,2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'receptions_fournisseurs',
    sql: `
      CREATE TABLE IF NOT EXISTS receptions_fournisseurs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        purchase_id INTEGER,
        date_reception DATE,
        state VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  // Tables CRM
  {
    name: 'crm_campaigns',
    sql: `
      CREATE TABLE IF NOT EXISTS crm_campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        type_campaign VARCHAR(50),
        date_start DATE,
        date_end DATE,
        budget NUMERIC(12,2),
        state VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  // Tables project
  {
    name: 'project_tasks',
    sql: `
      CREATE TABLE IF NOT EXISTS project_tasks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        project_id INTEGER,
        user_id INTEGER,
        date_start DATE,
        date_end DATE,
        state VARCHAR(50) DEFAULT 'todo',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  // Tables inventory
  {
    name: 'inventory',
    sql: `
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        location_id INTEGER,
        date_inventory DATE,
        state VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  // Tables MRP (déjà créées dans creer-tables-manquantes-prefixes.mjs mais vérifions)
  {
    name: 'mrp_work_centers',
    sql: `
      CREATE TABLE IF NOT EXISTS mrp_work_centers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        code VARCHAR(50),
        capacity NUMERIC(10,2),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'mrp_work_orders',
    sql: `
      CREATE TABLE IF NOT EXISTS mrp_work_orders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        production_id INTEGER,
        workcenter_id INTEGER,
        date_start TIMESTAMP,
        date_finish TIMESTAMP,
        state VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'mrp_routings',
    sql: `
      CREATE TABLE IF NOT EXISTS mrp_routings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        product_id INTEGER,
        version VARCHAR(50),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  }
];

async function createTables() {
  console.log('🔧 Création des tables manquantes\n');
  console.log('='.repeat(80));

  let created = 0;
  let errors = 0;

  for (const table of tablesToCreate) {
    try {
      await pool.query(table.sql);
      console.log(`✅ Table créée/vérifiée: ${table.name}`);
      created++;
    } catch (error) {
      console.log(`❌ Erreur création ${table.name}: ${error.message}`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Tables créées/vérifiées: ${created}`);
  if (errors > 0) {
    console.log(`❌ Erreurs: ${errors}`);
  }
  console.log('='.repeat(80));
  
  await pool.end();
}

createTables().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

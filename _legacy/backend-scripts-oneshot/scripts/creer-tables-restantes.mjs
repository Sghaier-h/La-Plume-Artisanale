/**
 * Script pour créer les tables restantes manquantes
 */

import { pool } from '../src/utils/db.js';

const tablesToCreate = [
  {
    name: 'listes_prix',
    sql: `
      CREATE TABLE IF NOT EXISTS listes_prix (
        id_liste_prix SERIAL PRIMARY KEY,
        name VARCHAR(255),
        code VARCHAR(50) UNIQUE,
        active BOOLEAN DEFAULT true,
        currency_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'product_pricelist_items',
    sql: `
      CREATE TABLE IF NOT EXISTS product_pricelist_items (
        id SERIAL PRIMARY KEY,
        pricelist_id INTEGER,
        product_id INTEGER,
        min_quantity NUMERIC(10,2) DEFAULT 1,
        price NUMERIC(10,2),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'suivi_fabrication',
    sql: `
      CREATE TABLE IF NOT EXISTS suivi_fabrication (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        description TEXT,
        id_of INTEGER,
        date_suivi DATE,
        statut VARCHAR(50) DEFAULT 'draft',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'demandes_achat',
    sql: `
      CREATE TABLE IF NOT EXISTS demandes_achat (
        id SERIAL PRIMARY KEY,
        numero_demande VARCHAR(50) UNIQUE,
        id_service INTEGER,
        date_besoin DATE,
        montant_estime NUMERIC(12,2),
        motif TEXT,
        priorite VARCHAR(50),
        statut VARCHAR(50) DEFAULT 'draft',
        notes TEXT,
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
  console.log('🔧 Création des tables restantes\n');
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

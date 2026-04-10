/**
 * Script pour corriger automatiquement les erreurs identifiées dans les tests
 */

import { pool } from '../src/utils/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, '..');

// Couleurs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Tables à créer
const tablesToCreate = [
  {
    name: 'quality_points',
    sql: `
      CREATE TABLE IF NOT EXISTS quality_points (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'quality_alerts',
    sql: `
      CREATE TABLE IF NOT EXISTS quality_alerts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'inventory_adjustments',
    sql: `
      CREATE TABLE IF NOT EXISTS inventory_adjustments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'caisses',
    sql: `
      CREATE TABLE IF NOT EXISTS caisses (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'sessions_caisse',
    sql: `
      CREATE TABLE IF NOT EXISTS sessions_caisse (
        id SERIAL PRIMARY KEY,
        id_caisse INTEGER,
        date_ouverture TIMESTAMP DEFAULT NOW(),
        date_fermeture TIMESTAMP,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'ventes_caisse',
    sql: `
      CREATE TABLE IF NOT EXISTS ventes_caisse (
        id SERIAL PRIMARY KEY,
        id_session INTEGER,
        id_caisse INTEGER,
        montant_total NUMERIC(12,2),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'articles_references',
    sql: `
      CREATE TABLE IF NOT EXISTS articles_references (
        id SERIAL PRIMARY KEY,
        reference VARCHAR(255),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'types_produits',
    sql: `
      CREATE TABLE IF NOT EXISTS types_produits (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  {
    name: 'lots_mp',
    sql: `
      CREATE TABLE IF NOT EXISTS lots_mp (
        id SERIAL PRIMARY KEY,
        numero_lot VARCHAR(255),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  }
];

// Corrections de contrôleurs
const controllerFixes = [
  {
    file: 'modules/suivi-fabrication/controllers/suivi-fabrication.controller.js',
    fixes: [
      { pattern: /m\.code_machine/g, replacement: 'm.id_machine' }
    ]
  },
  {
    file: 'modules/taches/controllers/taches.controller.js',
    fixes: [
      { pattern: /t\.id_of/g, replacement: 'of.id_of' }
    ]
  },
  {
    file: 'src/controllers/articles-catalogue.controller.js',
    fixes: [
      { pattern: /a\.nb_couleurs/g, replacement: 'a.id_couleur' }
    ]
  },
  {
    file: 'src/controllers/soustraitants.controller.js',
    fixes: [
      { pattern: /capacite_production/g, replacement: '' },
      { pattern: /,\s*,/g, replacement: ',' } // Nettoyer les virgules doubles
    ]
  }
];

async function createTables() {
  log('\n🔧 Création des tables manquantes...', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let created = 0;
  let errors = 0;
  
  for (const table of tablesToCreate) {
    try {
      await pool.query(table.sql);
      log(`✅ Table créée/vérifiée: ${table.name}`, 'green');
      created++;
    } catch (error) {
      log(`❌ Erreur création ${table.name}: ${error.message}`, 'red');
      errors++;
    }
  }
  
  log(`\n✅ Tables créées/vérifiées: ${created}`, 'green');
  if (errors > 0) {
    log(`❌ Erreurs: ${errors}`, 'red');
  }
}

function fixControllers() {
  log('\n🔧 Correction des contrôleurs...', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let fixed = 0;
  
  for (const fix of controllerFixes) {
    const filePath = path.join(backendDir, fix.file);
    
    if (!fs.existsSync(filePath)) {
      log(`⚠️  Fichier non trouvé: ${fix.file}`, 'yellow');
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const { pattern, replacement } of fix.fixes) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      log(`✅ Corrigé: ${fix.file}`, 'green');
      fixed++;
    }
  }
  
  log(`\n✅ Contrôleurs corrigés: ${fixed}`, 'green');
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION AUTOMATIQUE DES ERREURS', 'cyan');
  log('='.repeat(80), 'cyan');
  
  try {
    // Créer les tables
    await createTables();
    
    // Corriger les contrôleurs
    fixControllers();
    
    log('\n' + '='.repeat(80), 'cyan');
    log('✅ Corrections terminées', 'green');
    log('='.repeat(80), 'cyan');
    log('\n⚠️  ACTION REQUISE:', 'yellow');
    log('   1. Redémarrer le serveur (Ctrl+C puis npm start)', 'white');
    log('   2. Réexécuter les tests: node scripts/test-automatique.mjs', 'white');
    log('\n');
    
  } catch (error) {
    log(`\n❌ Erreur fatale: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

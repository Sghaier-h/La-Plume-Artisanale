/**
 * Script pour corriger les problèmes restants dans les modules non fonctionnels
 */

import { pool } from '../src/utils/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, '..');

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

// Corrections spécifiques pour les modules non fonctionnels
const specificFixes = [
  {
    file: 'modules/ecommerce/controllers/ecommerce_product.controller.js',
    fixes: [
      { 
        pattern: /a\.id_categorie does not exist/g, 
        replacement: 'pc.id_categorie',
        context: 'SELECT',
        description: 'Corriger la référence à id_categorie dans la requête SELECT'
      }
    ]
  }
];

// Ajouter colonnes "description" manquantes
async function addDescriptionColumns() {
  log('\n🔧 Ajout de colonnes "description" aux tables...', 'cyan');
  log('='.repeat(80), 'cyan');
  
  const tablesNeedingDescription = [
    'stock_lots',
    'crm_campaigns',
    'project_tasks',
    'mrp_work_centers',
    'mrp_work_orders',
    'mrp_routings'
  ];
  
  let added = 0;
  
  for (const table of tablesNeedingDescription) {
    try {
      const checkQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = 'description'
      `;
      const checkResult = await pool.query(checkQuery, [table]);
      
      if (checkResult.rows.length === 0) {
        const alterQuery = `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS description TEXT`;
        await pool.query(alterQuery);
        log(`✅ Colonne ajoutée: ${table}.description`, 'green');
        added++;
      } else {
        log(`⚠️  Colonne existe déjà: ${table}.description`, 'yellow');
      }
    } catch (error) {
      log(`❌ Erreur ${table}: ${error.message}`, 'red');
    }
  }
  
  log(`\n✅ Colonnes description ajoutées: ${added}`, 'green');
}

// Vérifier que les tables POS existent et sont accessibles
async function verifyPOSTables() {
  log('\n🔧 Vérification des tables POS...', 'cyan');
  log('='.repeat(80), 'cyan');
  
  const posTables = ['caisses', 'sessions_caisse', 'ventes_caisse'];
  
  for (const table of posTables) {
    try {
      const checkQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `;
      const result = await pool.query(checkQuery, [table]);
      
      if (result.rows[0].exists) {
        // Vérifier les colonnes
        const columnsQuery = `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1
        `;
        const columns = await pool.query(columnsQuery, [table]);
        log(`✅ Table ${table}: ${columns.rows.length} colonnes`, 'green');
      } else {
        log(`❌ Table ${table} n'existe pas`, 'red');
      }
    } catch (error) {
      log(`❌ Erreur vérification ${table}: ${error.message}`, 'red');
    }
  }
}

// Fonction principale
async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION DES PROBLÈMES RESTANTS', 'cyan');
  log('='.repeat(80), 'cyan');
  
  try {
    // 1. Ajouter colonnes "description"
    await addDescriptionColumns();
    
    // 2. Vérifier tables POS
    await verifyPOSTables();
    
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

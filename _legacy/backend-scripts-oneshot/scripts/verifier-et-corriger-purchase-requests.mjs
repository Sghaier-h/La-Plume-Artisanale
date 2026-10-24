/**
 * Script pour vérifier et corriger purchase-requests
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

async function checkTable() {
  log('\n🔧 Vérification de demandes_achat', 'cyan');
  
  try {
    // Vérifier si la table existe
    const check = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'demandes_achat'
      ORDER BY ordinal_position
    `);
    
    if (check.rows.length > 0) {
      log(`✅ Table demandes_achat existe (${check.rows.length} colonnes)`, 'green');
      const cols = check.rows.map(r => r.column_name);
      log(`   Colonnes: ${cols.join(', ')}`, 'yellow');
      
      // Vérifier les colonnes de date
      const dateCols = cols.filter(c => c.includes('date') || c.includes('created') || c.includes('updated'));
      log(`   Colonnes date: ${dateCols.join(', ')}`, 'yellow');
      
      return { exists: true, columns: cols, dateColumns: dateCols };
    } else {
      log('❌ Table demandes_achat n\'existe pas', 'red');
      return { exists: false, columns: [], dateColumns: [] };
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    return { exists: false, columns: [], dateColumns: [] };
  }
}

async function fixController() {
  log('\n🔧 Correction du contrôleur purchase-requests', 'cyan');
  
  const filePath = path.join(backendDir, 'modules/purchase-requests/controllers/purchase-requests.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Vérifier l'ORDER BY
  if (content.includes('ORDER BY COALESCE(created_at, date_creation, id)')) {
    // Remplacer par date_creation si created_at n'existe pas
    content = content.replace(
      /ORDER BY COALESCE\(created_at, date_creation, id\)/g,
      'ORDER BY COALESCE(date_creation, created_at, id)'
    );
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    log('✅ Contrôleur corrigé', 'green');
  } else {
    log('⚠️  Aucun changement nécessaire', 'yellow');
  }
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 VÉRIFICATION ET CORRECTION purchase-requests', 'cyan');
  log('='.repeat(80), 'cyan');
  
  try {
    const tableInfo = await checkTable();
    await fixController();
    
    log('\n' + '='.repeat(80), 'cyan');
    log('✅ Vérification terminée', 'green');
    log('='.repeat(80), 'cyan');
    
  } catch (error) {
    log(`\n❌ Erreur fatale: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

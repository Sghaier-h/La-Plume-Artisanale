/**
 * Script pour corriger les colonnes dans purchase-requests
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

async function verifierColonnes(tableName) {
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    return result.rows.map(r => r.column_name);
  } catch (error) {
    return [];
  }
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION COLONNES purchase-requests', 'cyan');
  log('='.repeat(80), 'cyan');
  
  const filePath = path.join(backendDir, 'modules/purchase-requests/controllers/purchase-requests.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Vérifier colonnes lignes_demande_achat
  const colsLignes = await verifierColonnes('lignes_demande_achat');
  log(`\nColonnes lignes_demande_achat: ${colsLignes.join(', ')}`, 'yellow');
  
  // Corriger id_product → id_article
  if (colsLignes.includes('id_article') && content.includes('id_product')) {
    content = content.replace(/id_product/g, 'id_article');
    modified = true;
    log('  ✅ id_product → id_article', 'green');
  }
  
  // Corriger quantity → quantite
  if (colsLignes.includes('quantite') && content.includes('quantity')) {
    content = content.replace(/quantity/g, 'quantite');
    modified = true;
    log('  ✅ quantity → quantite', 'green');
  }
  
  // Corriger price_unit → prix_unitaire
  if (colsLignes.includes('prix_unitaire') && content.includes('price_unit')) {
    content = content.replace(/price_unit/g, 'prix_unitaire');
    modified = true;
    log('  ✅ price_unit → prix_unitaire', 'green');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    log('\n✅ Fichier corrigé', 'green');
  } else {
    log('\n✅ Fichier déjà correct', 'green');
  }
  
  log('\n');
}

main().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await pool.end();
});

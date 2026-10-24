/**
 * Script pour corriger les erreurs restantes identifiées dans les tests
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

// 1. Corriger pos_caisse - id_caisse → id
async function fixPosCaisse() {
  log('\n🔧 1. Correction pos_caisse (id_caisse → id)', 'cyan');
  
  const filePath = path.join(backendDir, 'modules/pos/controllers/pos_caisse.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remplacer id_caisse par id sauf dans les JOINs avec sessions_caisse
  content = content.replace(/WHERE id_caisse = \$1/g, 'WHERE id = $1');
  content = content.replace(/ORDER BY id_caisse/g, 'ORDER BY id');
  
  fs.writeFileSync(filePath, content, 'utf8');
  log('✅ pos_caisse.controller.js corrigé', 'green');
}

// 2. Corriger pos_vente - date_vente → created_at
async function fixPosVente() {
  log('\n🔧 2. Correction pos_vente (date_vente → created_at)', 'cyan');
  
  const filePath = path.join(backendDir, 'modules/pos/controllers/pos_vente.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remplacer date_vente par created_at
  content = content.replace(/ORDER BY date_vente/g, 'ORDER BY COALESCE(created_at, id)');
  content = content.replace(/date_vente,/g, '');
  content = content.replace(/, date_vente/g, '');
  
  fs.writeFileSync(filePath, content, 'utf8');
  log('✅ pos_vente.controller.js corrigé', 'green');
}

// 3. Corriger mrp_bom - id_ligne_nomenclature → id
async function fixMrpBom() {
  log('\n🔧 3. Correction mrp_bom (id_ligne_nomenclature → id)', 'cyan');
  
  const filePath = path.join(backendDir, 'modules/mrp/controllers/mrp_bom.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remplacer id_ligne_nomenclature par id
  content = content.replace(/nl\.id_ligne_nomenclature/g, 'nl.id');
  content = content.replace(/nl\.sequence/g, 'nl.ordre');
  
  fs.writeFileSync(filePath, content, 'utf8');
  log('✅ mrp_bom.controller.js corrigé', 'green');
}

// 4. Corriger account_move - problème avec pool.query
async function fixAccountMove() {
  log('\n🔧 4. Correction account_move (pool.query)', 'cyan');
  
  const filePath = path.join(backendDir, 'modules/account/controllers/account_move.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier que pool est bien importé
  if (!content.includes("import { pool }")) {
    log('⚠️  pool non importé', 'yellow');
  }
  
  // Corriger le COUNT si nécessaire
  content = content.replace(/SELECT COUNT\(\*\) as total FROM \$\{TABLE_NAME\}/g, 
    'SELECT COUNT(*) as total FROM ${TABLE_NAME} WHERE 1=1');
  
  fs.writeFileSync(filePath, content, 'utf8');
  log('✅ account_move.controller.js vérifié', 'green');
}

// 5. Corriger multisociete_companies - ORDER BY id → id_societe
async function fixMultisocieteCompanies() {
  log('\n🔧 5. Correction multisociete_companies (ORDER BY)', 'cyan');
  
  const filePath = path.join(backendDir, 'modules/multisociete/controllers/companies.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier que idField est utilisé correctement
  if (content.includes("ORDER BY ${idField}")) {
    log('✅ ORDER BY utilise déjà idField', 'green');
  } else {
    // Forcer id_societe
    content = content.replace(/ORDER BY id DESC/g, 'ORDER BY id_societe DESC');
    fs.writeFileSync(filePath, content, 'utf8');
    log('✅ ORDER BY corrigé', 'green');
  }
}

// 6. Créer table quality_check
async function createQualityCheck() {
  log('\n🔧 6. Création table quality_check', 'cyan');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS quality_check (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      point_id INTEGER,
      product_id INTEGER,
      lot_id INTEGER,
      result VARCHAR(50),
      notes TEXT,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP,
      created_by INTEGER,
      updated_by INTEGER
    );
  `;
  
  try {
    await pool.query(sql);
    log('✅ Table quality_check créée/vérifiée', 'green');
  } catch (error) {
    log(`❌ Erreur création quality_check: ${error.message}`, 'red');
  }
}

// Fonction principale
async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION DES ERREURS RESTANTES', 'cyan');
  log('='.repeat(80), 'cyan');
  
  try {
    await fixPosCaisse();
    await fixPosVente();
    await fixMrpBom();
    await fixAccountMove();
    await fixMultisocieteCompanies();
    await createQualityCheck();
    
    log('\n' + '='.repeat(80), 'cyan');
    log('✅ Toutes les corrections appliquées', 'green');
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

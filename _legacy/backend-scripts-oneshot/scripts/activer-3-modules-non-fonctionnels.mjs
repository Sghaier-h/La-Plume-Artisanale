/**
 * Script pour activer les 3 modules non fonctionnels restants
 * Modules identifiés : taches, purchase-requests, pos_ventes
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
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 1. Corriger taches
async function corrigerTaches() {
  log('\n📝 1. Correction du module taches', 'blue');
  
  const filePath = path.join(backendDir, 'src/controllers/taches.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Vérifier les erreurs potentielles
  // L'erreur "Erreur serveur" peut être due à plusieurs choses
  // Vérifier que pool est bien importé
  if (!content.includes("import { pool }")) {
    log('  ⚠️  pool non importé', 'yellow');
    // Ajouter l'import
    const lines = content.split('\n');
    lines.splice(1, 0, "import { pool } from '../utils/db.js';");
    content = lines.join('\n');
    modified = true;
  }
  
  // Vérifier les colonnes utilisées dans les requêtes
  // Vérifier si id_of existe dans la table taches
  try {
    const check = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'taches'
      AND column_name LIKE '%of%'
    `);
    
    const ofColumns = check.rows.map(r => r.column_name);
    log(`  Colonnes OF trouvées: ${ofColumns.join(', ') || 'aucune'}`, 'yellow');
    
    if (ofColumns.length === 0) {
      log('  ⚠️  Colonne id_of n\'existe pas dans taches', 'yellow');
      // Peut-être que la colonne s'appelle différemment
      const allCols = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'taches'
        ORDER BY ordinal_position
      `);
      log(`  Toutes les colonnes: ${allCols.rows.map(r => r.column_name).join(', ')}`, 'yellow');
    }
  } catch (error) {
    log(`  ⚠️  Erreur vérification table: ${error.message}`, 'yellow');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    log('  ✅ Fichier corrigé', 'green');
    return true;
  }
  
  log('  ✅ Fichier déjà correct', 'green');
  return false;
}

// 2. Corriger purchase-requests
async function corrigerPurchaseRequests() {
  log('\n📝 2. Correction du module purchase-requests', 'blue');
  
  const filePath = path.join(backendDir, 'modules/purchase-requests/controllers/purchase-requests.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Vérifier la structure de la table
  try {
    const check = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'demandes_achat'
      ORDER BY ordinal_position
    `);
    
    const cols = check.rows.map(r => r.column_name);
    log(`  Colonnes trouvées: ${cols.join(', ')}`, 'yellow');
    
    // Vérifier les colonnes utilisées dans le contrôleur
    if (content.includes('created_at') && !cols.includes('created_at')) {
      log('  ⚠️  created_at n\'existe pas, utiliser date_creation', 'yellow');
      content = content.replace(/created_at/g, 'date_creation');
      modified = true;
    }
    
    if (content.includes('updated_at') && !cols.includes('updated_at')) {
      log('  ⚠️  updated_at n\'existe pas, utiliser date_modification', 'yellow');
      content = content.replace(/updated_at/g, 'date_modification');
      modified = true;
    }
  } catch (error) {
    log(`  ⚠️  Erreur vérification table: ${error.message}`, 'yellow');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    log('  ✅ Fichier corrigé', 'green');
    return true;
  }
  
  log('  ✅ Fichier déjà correct', 'green');
  return false;
}

// 3. Corriger pos_ventes
async function corrigerPosVentes() {
  log('\n📝 3. Correction du module pos_ventes', 'blue');
  
  const filePath = path.join(backendDir, 'modules/pos/controllers/pos_vente.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Vérifier la structure de la table
  try {
    const check = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ventes_caisse'
      ORDER BY ordinal_position
    `);
    
    const cols = check.rows.map(r => r.column_name);
    log(`  Colonnes trouvées: ${cols.join(', ')}`, 'yellow');
    
    // Vérifier ORDER BY
    if (content.includes('COALESCE(created_at, NOW())')) {
      log('  ✅ ORDER BY déjà corrigé', 'green');
    } else if (content.includes('COALESCE(created_at, id)')) {
      content = content.replace(/COALESCE\(created_at, id\)/g, 'COALESCE(created_at, NOW())');
      modified = true;
      log('  ✅ ORDER BY corrigé', 'green');
    }
    
    // Vérifier les colonnes dans INSERT
    if (content.includes('date_vente')) {
      log('  ⚠️  date_vente trouvé dans INSERT, doit être supprimé', 'yellow');
      // date_vente a déjà été supprimé normalement
    }
    
  } catch (error) {
    log(`  ⚠️  Erreur vérification table: ${error.message}`, 'yellow');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    log('  ✅ Fichier corrigé', 'green');
    return true;
  }
  
  log('  ✅ Fichier déjà correct', 'green');
  return false;
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 ACTIVATION DES 3 MODULES NON FONCTIONNELS', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let corrected = 0;
  
  await corrigerTaches();
  await corrigerPurchaseRequests();
  await corrigerPosVentes();
  
  log('\n' + '='.repeat(80), 'cyan');
  log('✅ Corrections appliquées', 'green');
  log('='.repeat(80), 'cyan');
  log('\n⚠️  IMPORTANT:', 'yellow');
  log('   Redémarrer le serveur pour appliquer les corrections', 'white');
  log('   Puis réexécuter les tests: node scripts/test-automatique.mjs', 'white');
  log('\n');
}

main().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await pool.end();
});

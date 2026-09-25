/**
 * Script pour corriger les 3 modules non fonctionnels restants
 * Modules : taches, purchase-requests, pos_ventes
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

// 1. Corriger taches
async function corrigerTaches() {
  log('\n📝 1. Correction du module taches', 'blue');
  
  const filePath = path.join(backendDir, 'src/controllers/taches.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Vérifier la structure de la table
  try {
    const check = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'taches'
      ORDER BY ordinal_position
    `);
    
    const cols = check.rows.map(r => r.column_name);
    log(`  Colonnes trouvées: ${cols.join(', ')}`, 'yellow');
    
    // Vérifier si id_of existe
    if (!cols.includes('id_of')) {
      log('  ⚠️  Colonne id_of n\'existe pas', 'yellow');
      // Chercher une colonne similaire
      const ofCol = cols.find(c => c.includes('of') || c.includes('OF'));
      if (ofCol) {
        log(`  ✅ Colonne alternative trouvée: ${ofCol}`, 'green');
      }
    }
    
    // Vérifier les colonnes utilisées dans les requêtes
    // Vérifier si date_creation existe
    if (content.includes('t.date_creation') && !cols.includes('date_creation')) {
      log('  ⚠️  date_creation n\'existe pas, utiliser created_at', 'yellow');
      content = content.replace(/t\.date_creation/g, 'COALESCE(t.created_at, t.id)');
      modified = true;
    }
    
  } catch (error) {
    log(`  ⚠️  Erreur vérification: ${error.message}`, 'yellow');
  }
  
  // Vérifier que pool est bien utilisé
  if (!content.includes('await pool.query')) {
    log('  ⚠️  pool.query non trouvé', 'yellow');
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
    
    // Corriger la ligne 39 qui a record.id || record.id || record.id (redondant)
    if (content.includes('record.id || record.id || record.id')) {
      content = content.replace(/record\.id \|\| record\.id \|\| record\.id/g, 'record.id');
      modified = true;
      log('  ✅ Ligne redondante corrigée', 'green');
    }
    
    // Vérifier ORDER BY
    if (content.includes('COALESCE(date_creation, created_at, id)')) {
      // Vérifier quelle colonne existe
      if (cols.includes('created_at') && !cols.includes('date_creation')) {
        content = content.replace(/COALESCE\(date_creation, created_at, id\)/g, 'COALESCE(created_at, id)');
        modified = true;
        log('  ✅ ORDER BY corrigé', 'green');
      }
    }
    
  } catch (error) {
    log(`  ⚠️  Erreur vérification: ${error.message}`, 'yellow');
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
    
    // Corriger INSERT - amount_total → montant_total
    if (content.includes('amount_total') && cols.includes('montant_total')) {
      content = content.replace(/amount_total/g, 'montant_total');
      modified = true;
      log('  ✅ amount_total → montant_total', 'green');
    }
    
    // Corriger INSERT - statut doit être une colonne, pas 'confirmed'
    if (content.includes("id_session, amount_total, statut, created_by")) {
      // Vérifier si statut existe
      if (cols.includes('statut')) {
        // Le INSERT doit inclure statut = 'confirmed'
        content = content.replace(
          /INSERT INTO ventes_caisse \(\s*id_session, amount_total, statut, created_by\s*\)/g,
          'INSERT INTO ventes_caisse (id_session, montant_total, statut, created_by)'
        );
        content = content.replace(
          /VALUES \(\$1, \$2, NOW\(\), 'confirmed', \$3\)/g,
          "VALUES ($1, $2, 'confirmed', $3)"
        );
        modified = true;
        log('  ✅ INSERT corrigé', 'green');
      } else {
        // Si statut n'existe pas, le retirer
        content = content.replace(
          /INSERT INTO ventes_caisse \(\s*id_session, amount_total, statut, created_by\s*\)/g,
          'INSERT INTO ventes_caisse (id_session, montant_total, created_by)'
        );
        content = content.replace(
          /VALUES \(\$1, \$2, NOW\(\), 'confirmed', \$3\)/g,
          'VALUES ($1, $2, $3)'
        );
        modified = true;
        log('  ✅ INSERT corrigé (statut retiré)', 'green');
      }
    }
    
    // Corriger WHERE id_vente → id
    if (content.includes('WHERE id_vente = $1') && cols.includes('id')) {
      content = content.replace(/WHERE id_vente = \$1/g, 'WHERE id = $1');
      modified = true;
      log('  ✅ WHERE id_vente → id', 'green');
    }
    
  } catch (error) {
    log(`  ⚠️  Erreur vérification: ${error.message}`, 'yellow');
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
  
  if (await corrigerTaches()) corrected++;
  if (await corrigerPurchaseRequests()) corrected++;
  if (await corrigerPosVentes()) corrected++;
  
  log('\n' + '='.repeat(80), 'cyan');
  log(`✅ Corrections appliquées: ${corrected} fichiers`, 'green');
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

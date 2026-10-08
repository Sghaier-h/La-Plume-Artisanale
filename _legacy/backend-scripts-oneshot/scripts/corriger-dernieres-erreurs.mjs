/**
 * Script pour corriger les dernières erreurs identifiées
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

// Vérifier la structure de sessions_caisse
async function checkSessionsCaisse() {
  log('\n🔧 Vérification sessions_caisse', 'cyan');
  
  try {
    const check = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sessions_caisse'
      ORDER BY ordinal_position
    `);
    
    if (check.rows.length > 0) {
      const cols = check.rows.map(r => r.column_name);
      log(`✅ Table sessions_caisse: ${cols.join(', ')}`, 'green');
      
      // Vérifier si id_caisse existe
      if (cols.includes('id_caisse')) {
        log('✅ Colonne id_caisse existe dans sessions_caisse', 'green');
      } else {
        log('⚠️  Colonne id_caisse n\'existe pas dans sessions_caisse', 'yellow');
        const idCol = cols.find(c => c.includes('id') && c !== 'id');
        log(`   Colonne ID alternative: ${idCol || 'id'}`, 'yellow');
      }
    } else {
      log('❌ Table sessions_caisse n\'existe pas', 'red');
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
  }
}

// Corriger soustraitants - delai_moyen_jours
async function fixSoustraitants() {
  log('\n🔧 Correction soustraitants (delai_moyen_jours)', 'cyan');
  
  const filePath = path.join(backendDir, 'src/controllers/soustraitants.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier si delai_moyen_jours est utilisé
  if (content.includes('delai_moyen_jours')) {
    // Remplacer par une colonne existante ou supprimer
    content = content.replace(/delai_moyen_jours/g, 'COALESCE(delai_moyen_jours, 0)');
    fs.writeFileSync(filePath, content, 'utf8');
    log('✅ soustraitants.controller.js corrigé', 'green');
  } else {
    log('⚠️  delai_moyen_jours non trouvé', 'yellow');
  }
}

// Corriger purchase-requests - record.id_demande
async function fixPurchaseRequests() {
  log('\n🔧 Correction purchase-requests (record.id_demande)', 'cyan');
  
  const filePath = path.join(backendDir, 'modules/purchase-requests/controllers/purchase-requests.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier la structure de la table
  const check = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'demandes_achat'
    AND column_name LIKE '%id%'
  `);
  
  const idCols = check.rows.map(r => r.column_name);
  log(`   Colonnes ID trouvées: ${idCols.join(', ')}`, 'yellow');
  
  // Utiliser id ou id_demande selon ce qui existe
  const idField = idCols.includes('id_demande') ? 'id_demande' : 'id';
  
  if (content.includes('record.id_demande')) {
    content = content.replace(/record\.id_demande/g, `record.${idField} || record.id`);
    fs.writeFileSync(filePath, content, 'utf8');
    log(`✅ purchase-requests.controller.js corrigé (utilise ${idField})`, 'green');
  }
}

// Corriger multisociete_companies - ORDER BY id
async function fixMultisocieteCompaniesOrderBy() {
  log('\n🔧 Correction multisociete_companies (ORDER BY)', 'cyan');
  
  const filePath = path.join(backendDir, 'modules/multisociete/controllers/companies.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier que ORDER BY utilise bien idField
  if (content.includes("ORDER BY ${idField}")) {
    // Vérifier que idField est bien id_societe
    if (content.includes("const idField = getIdField('res.company') || 'id_societe';")) {
      // Forcer id_societe
      content = content.replace(
        /const idField = getIdField\('res\.company'\) \|\| 'id_societe';/g,
        "const idField = 'id_societe'; // Forcé pour societes"
      );
      fs.writeFileSync(filePath, content, 'utf8');
      log('✅ ORDER BY forcé à id_societe', 'green');
    } else {
      log('✅ ORDER BY déjà correct', 'green');
    }
  }
}

// Fonction principale
async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION DES DERNIÈRES ERREURS', 'cyan');
  log('='.repeat(80), 'cyan');
  
  try {
    await checkSessionsCaisse();
    await fixSoustraitants();
    await fixPurchaseRequests();
    await fixMultisocieteCompaniesOrderBy();
    
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

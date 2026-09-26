/**
 * Script pour corriger les dernières erreurs identifiées
 */

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

// Corriger pos_vente ORDER BY
async function corrigerPosVente() {
  const filePath = path.join(backendDir, 'modules/pos/controllers/pos_vente.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Corriger ORDER BY si nécessaire
  if (content.includes('COALESCE(created_at::text, id::text)')) {
    content = content.replace(
      /COALESCE\(created_at::text, id::text\)/g,
      'COALESCE(created_at, NOW())'
    );
    fs.writeFileSync(filePath, content, 'utf8');
    log('  ✅ ORDER BY corrigé dans pos_vente', 'green');
    return true;
  } else if (content.includes('COALESCE(created_at, id)')) {
    content = content.replace(
      /COALESCE\(created_at, id\)/g,
      'COALESCE(created_at, NOW())'
    );
    fs.writeFileSync(filePath, content, 'utf8');
    log('  ✅ ORDER BY corrigé dans pos_vente', 'green');
    return true;
  }
  
  log('  ✅ ORDER BY déjà correct', 'green');
  return false;
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION DES DERNIÈRES ERREURS', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let corrected = 0;
  
  log('\n📝 pos_vente.controller.js:', 'blue');
  if (await corrigerPosVente()) {
    corrected++;
  }
  
  log('\n' + '='.repeat(80), 'cyan');
  log(`✅ Corrections appliquées: ${corrected}`, 'green');
  log('='.repeat(80), 'cyan');
  log('\n✅ Toutes les corrections sont terminées !', 'green');
  log('\n⚠️  ACTION REQUISE:', 'yellow');
  log('   Redémarrer le serveur pour appliquer toutes les corrections', 'white');
  log('\n');
}

main().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

/**
 * Script final complet pour corriger tous les problèmes identifiés
 */

import { pool } from '../src/utils/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

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

// Corrections spécifiques par fichier
const specificFixes = [
  {
    file: 'modules/purchase/controllers/purchase_reception.controller.js',
    description: 'Corriger id_reception → id pour receptions_fournisseurs',
    fixes: [
      { pattern: /receptions_fournisseurs.*WHERE id_reception/g, replacement: 'receptions_fournisseurs WHERE id' },
      { pattern: /reception\.id_reception/g, replacement: 'reception.id' },
      { pattern: /WHERE id_reception = \$/g, replacement: 'WHERE id = $' }
    ]
  }
];

// Fonction pour corriger un fichier
function fixFile(filePath, fixes) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const { pattern, replacement } of fixes) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Fonction principale
async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION FINALE COMPLÈTE', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let fixed = 0;
  
  for (const fix of specificFixes) {
    const filePath = path.join(backendDir, fix.file);
    log(`\n🔧 Correction: ${fix.file}`, 'cyan');
    log(`   ${fix.description}`, 'yellow');
    
    if (fixFile(filePath, fix.fixes)) {
      log(`   ✅ Corrigé`, 'green');
      fixed++;
    } else {
      log(`   ⚠️  Aucun changement nécessaire`, 'yellow');
    }
  }
  
  log('\n' + '='.repeat(80), 'cyan');
  log(`✅ Corrections appliquées: ${fixed}`, 'green');
  log('='.repeat(80), 'cyan');
  log('\n⚠️  ACTION REQUISE:', 'yellow');
  log('   1. Redémarrer le serveur (Ctrl+C puis npm start)', 'white');
  log('   2. Réexécuter les tests: node scripts/test-automatique.mjs', 'white');
  log('\n');
  
  await pool.end();
}

main().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

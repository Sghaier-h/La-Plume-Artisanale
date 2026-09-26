/**
 * Script pour corriger les modules avec erreurs 500
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/utils/db.js';

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

// Corrections pour les modules 500
const corrections500 = [
  {
    name: 'taches',
    file: 'src/controllers/taches.controller.js',
    fixes: [
      {
        pattern: /t\.id_of/g,
        replacement: 'of.id_of',
        description: 't.id_of → of.id_of (JOIN)'
      }
    ]
  },
  {
    name: 'soustraitants',
    file: 'src/controllers/soustraitants.controller.js',
    fixes: [
      {
        pattern: /delai_moyen_jours(?!\s*COALESCE)/g,
        replacement: 'COALESCE(delai_moyen_jours, 0)',
        description: 'Protection delai_moyen_jours avec COALESCE'
      }
    ]
  },
  {
    name: 'pos_session',
    file: 'modules/pos/controllers/pos_session.controller.js',
    fixes: [
      {
        pattern: /req\.params\.id.*sessions/g,
        replacement: 'req.params.id',
        description: 'Correction paramètre route sessions'
      }
    ]
  },
  {
    name: 'multisociete_companies',
    file: 'modules/multisociete/controllers/companies.controller.js',
    fixes: [
      {
        pattern: /ORDER BY id DESC/g,
        replacement: 'ORDER BY id_societe DESC',
        description: 'ORDER BY id → id_societe'
      },
      {
        pattern: /WHERE id = \$1/g,
        replacement: 'WHERE id_societe = $1',
        description: 'WHERE id → id_societe'
      }
    ]
  },
];

async function applyFixes(correction) {
  const filePath = path.join(backendDir, correction.file);
  
  if (!fs.existsSync(filePath)) {
    log(`  ⚠️  Fichier non trouvé: ${correction.file}`, 'yellow');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  for (const fix of correction.fixes) {
    if (fix.pattern.test(content)) {
      content = content.replace(fix.pattern, fix.replacement);
      modified = true;
      log(`    ✅ ${fix.description}`, 'green');
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    log(`  ✅ Fichier corrigé: ${correction.file}`, 'green');
    return true;
  } else {
    log(`  ⚠️  Aucune modification nécessaire: ${correction.file}`, 'yellow');
    return false;
  }
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION DES MODULES 500 (ERREURS SERVEUR)', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let corrected = 0;
  let skipped = 0;
  
  for (const correction of corrections500) {
    log(`\n📝 ${correction.name}:`, 'blue');
    const result = await applyFixes(correction);
    if (result) {
      corrected++;
    } else {
      skipped++;
    }
  }
  
  log('\n' + '='.repeat(80), 'cyan');
  log(`✅ Corrections appliquées: ${corrected} fichiers`, 'green');
  log(`⚠️  Fichiers ignorés: ${skipped} fichiers`, 'yellow');
  log('='.repeat(80), 'cyan');
  log('\n⚠️  ACTION REQUISE:', 'yellow');
  log('   1. Redémarrer le serveur (Ctrl+C puis npm start)', 'white');
  log('   2. Réexécuter les tests: node scripts/test-automatique.mjs', 'white');
  log('\n');
}

main().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await pool.end();
});

/**
 * Script pour corriger les erreurs restantes identifiées dans les tests
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

// Corrections à appliquer
const corrections = [
  {
    name: 'mrp_bom - id_ligne_nomenclature',
    file: 'modules/mrp/controllers/mrp_bom.controller.js',
    fixes: [
      {
        pattern: /nl\.id_ligne_nomenclature/g,
        replacement: 'nl.id',
        description: 'Remplacer nl.id_ligne_nomenclature par nl.id'
      }
    ]
  },
  {
    name: 'account_move - pool.query undefined',
    file: 'modules/account/controllers/account_move.controller.js',
    fixes: [
      {
        pattern: /import.*pool.*from/g,
        check: (content) => content.includes("import { pool }"),
        description: 'Vérifier que pool est importé'
      }
    ]
  },
  {
    name: 'pos_caisse - id_caisse',
    file: 'modules/pos/controllers/pos_caisse.controller.js',
    fixes: [
      {
        pattern: /ORDER BY id_caisse/g,
        replacement: 'ORDER BY id',
        description: 'ORDER BY id_caisse → id'
      },
      {
        pattern: /WHERE id_caisse = \$1/g,
        replacement: 'WHERE id = $1',
        description: 'WHERE id_caisse → id (sauf dans sessions_caisse)'
      }
    ]
  },
  {
    name: 'pos_vente - date_vente',
    file: 'modules/pos/controllers/pos_vente.controller.js',
    fixes: [
      {
        pattern: /ORDER BY date_vente/g,
        replacement: 'ORDER BY COALESCE(created_at, id)',
        description: 'ORDER BY date_vente → created_at'
      },
      {
        pattern: /date_vente,/g,
        replacement: '',
        description: 'Supprimer date_vente des INSERT'
      }
    ]
  },
  {
    name: 'taches - t.id_of',
    file: 'src/controllers/taches.controller.js',
    fixes: [
      {
        pattern: /WHERE.*t\.id_of/g,
        replacement: (match) => match.replace('t.id_of', 'of.id_of'),
        description: 'WHERE t.id_of → of.id_of'
      }
    ]
  },
  {
    name: 'multisociete_companies - ORDER BY id',
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
    if (fix.check) {
      // Vérification seulement
      if (!fix.check(content)) {
        log(`    ⚠️  ${fix.description} - Non trouvé`, 'yellow');
      } else {
        log(`    ✅ ${fix.description} - OK`, 'green');
      }
    } else if (fix.pattern.test(content)) {
      // Remplacement
      if (typeof fix.replacement === 'function') {
        content = content.replace(fix.pattern, fix.replacement);
      } else {
        content = content.replace(fix.pattern, fix.replacement);
      }
      modified = true;
      log(`    ✅ ${fix.description}`, 'green');
    } else {
      log(`    ⚠️  ${fix.description} - Déjà corrigé ou non trouvé`, 'yellow');
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    log(`  ✅ Fichier corrigé: ${correction.file}`, 'green');
    return true;
  }
  
  return false;
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION DES ERREURS RESTANTES', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let corrected = 0;
  
  for (const correction of corrections) {
    log(`\n📝 ${correction.name}:`, 'blue');
    const result = await applyFixes(correction);
    if (result) {
      corrected++;
    }
  }
  
  log('\n' + '='.repeat(80), 'cyan');
  log(`✅ Corrections appliquées: ${corrected} fichiers`, 'green');
  log('='.repeat(80), 'cyan');
  log('\n⚠️  IMPORTANT:', 'yellow');
  log('   Le serveur DOIT être redémarré pour que les corrections prennent effet !', 'white');
  log('   1. Arrêter le serveur (Ctrl+C)', 'white');
  log('   2. Redémarrer: npm start', 'white');
  log('   3. Réexécuter les tests: node scripts/test-automatique.mjs', 'white');
  log('\n');
}

main().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

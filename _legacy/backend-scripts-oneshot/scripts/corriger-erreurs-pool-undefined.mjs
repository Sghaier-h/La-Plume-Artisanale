/**
 * Script pour corriger l'erreur "Cannot read properties of undefined (reading 'query')"
 * Problème : pool n'est pas importé dans les nouvelles fonctions ajoutées
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

// Fichiers à corriger
const fichiersACorriger = [
  'modules/product/controllers/product_template.controller.js',
  'modules/sale/controllers/sale_order.controller.js',
  'modules/purchase/controllers/purchase_order.controller.js',
  'modules/account/controllers/account_move.controller.js',
  'modules/hr/controllers/hr_employee_new.controller.js',
  'modules/crm/controllers/crm_lead.controller.js',
  'modules/project/controllers/project_project_new.controller.js',
  'modules/mrp/controllers/mrp_production.controller.js',
  'modules/stock/controllers/stock_picking.controller.js',
];

async function corrigerFichier(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`  ⚠️  Fichier non trouvé: ${filePath}`, 'yellow');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Vérifier si pool est importé
  if (!content.includes("import { pool }")) {
    log(`  ⚠️  pool non importé - ajout de l'import`, 'yellow');
    // Ajouter l'import après les autres imports
    const importRegex = /(import.*from.*['"]\.\.\/.*['"];)/;
    if (importRegex.test(content)) {
      content = content.replace(
        importRegex,
        `$1\nimport { pool } from '../../../src/utils/db.js';`
      );
      modified = true;
    } else {
      // Ajouter au début après les commentaires
      const lines = content.split('\n');
      let insertIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import')) {
          insertIndex = i + 1;
          break;
        }
      }
      lines.splice(insertIndex, 0, "import { pool } from '../../../src/utils/db.js';");
      content = lines.join('\n');
      modified = true;
    }
  }
  
  // Vérifier si sendSuccess, sendError, handleError sont importés
  if (!content.includes("import { sendError") && content.includes("sendError")) {
    log(`  ⚠️  sendError non importé - ajout de l'import`, 'yellow');
    if (content.includes("import { pool }")) {
      content = content.replace(
        /import { pool } from.*db\.js['"];/,
        `import { pool } from '../../../src/utils/db.js';\nimport { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';`
      );
      modified = true;
    }
  }
  
  // Vérifier si getUserId est importé
  if (!content.includes("import { getUserId") && content.includes("getUserId")) {
    log(`  ⚠️  getUserId non importé - ajout de l'import`, 'yellow');
    if (content.includes("import { sendError")) {
      content = content.replace(
        /import { sendError, sendSuccess, handleError } from.*error\.helper\.js['"];/,
        `import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';\nimport { getUserId } from '../../../src/utils/audit.helper.js';`
      );
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    log(`  ✅ Fichier corrigé: ${filePath}`, 'green');
    return true;
  }
  
  return false;
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION ERREUR "pool.query undefined"', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let corrected = 0;
  
  for (const file of fichiersACorriger) {
    const filePath = path.join(backendDir, file);
    log(`\n📝 ${file}:`, 'blue');
    const result = await corrigerFichier(filePath);
    if (result) {
      corrected++;
    } else {
      log(`  ✅ Déjà correct`, 'green');
    }
  }
  
  log('\n' + '='.repeat(80), 'cyan');
  log(`✅ Fichiers corrigés: ${corrected}`, 'green');
  log('='.repeat(80), 'cyan');
  log('\n⚠️  IMPORTANT:', 'yellow');
  log('   Redémarrer le serveur pour appliquer les corrections', 'white');
  log('\n');
}

main().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

/**
 * Script pour vérifier et améliorer les modules selon les principes ERP/GPAO
 * 
 * Principes ERP/GPAO à vérifier :
 * 1. Workflow et états (draft -> confirmed -> done -> cancelled)
 * 2. Relations entre modules (OF -> BOM -> Stock -> Vente)
 * 3. Validations et contraintes métier
 * 4. Traçabilité et historique
 * 5. Gestion des stocks (réception -> stock -> livraison)
 * 6. Planification de production (OF -> Planning -> Machines)
 * 7. Gestion des coûts (coût matière + coût main d'œuvre + coût machine)
 * 8. Gestion qualité (contrôles qualité, non-conformités)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Principes ERP/GPAO à vérifier par module
const erpPrinciples = {
  'sale': {
    workflow: ['draft', 'sent', 'sale', 'done', 'cancel'],
    relations: ['partner', 'product', 'stock_picking', 'account_move'],
    validations: ['partner_required', 'lines_required', 'amount_positive']
  },
  'purchase': {
    workflow: ['draft', 'sent', 'to approve', 'purchase', 'done', 'cancel'],
    relations: ['partner', 'product', 'reception', 'account_move'],
    validations: ['partner_required', 'lines_required', 'amount_positive']
  },
  'mrp': {
    workflow: ['draft', 'confirmed', 'progress', 'done', 'cancel'],
    relations: ['bom', 'stock', 'machine', 'quality_check'],
    validations: ['bom_required', 'stock_available', 'machine_available']
  },
  'stock': {
    workflow: ['draft', 'assigned', 'done', 'cancel'],
    relations: ['product', 'location', 'picking', 'move'],
    validations: ['product_required', 'location_required', 'quantity_positive']
  },
  'account': {
    workflow: ['draft', 'posted', 'reconciled', 'cancel'],
    relations: ['partner', 'journal', 'move_line'],
    validations: ['balanced', 'journal_required', 'date_required']
  }
};

console.log('🔍 Vérification des principes ERP/GPAO...\n');

// Analyser chaque module
const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`📦 ${modules.length} modules trouvés\n`);

for (const moduleName of modules) {
  const modulePath = path.join(modulesPath, moduleName);
  const controllerPath = path.join(modulePath, 'controllers');
  
  if (!fs.existsSync(controllerPath)) {
    continue;
  }
  
  const controllers = fs.readdirSync(controllerPath)
    .filter(file => file.endsWith('.controller.js'));
  
  console.log(`\n📋 Module: ${moduleName}`);
  console.log(`   Contrôleurs: ${controllers.length}`);
  
  for (const controllerFile of controllers) {
    const controllerPathFull = path.join(controllerPath, controllerFile);
    const content = fs.readFileSync(controllerPathFull, 'utf8');
    
    // Vérifier les principes
    const hasWorkflow = /state|statut|workflow/i.test(content);
    const hasRelations = /JOIN|LEFT JOIN|INNER JOIN/i.test(content);
    const hasValidations = /required|validation|check/i.test(content);
    const hasAudit = /created_at|updated_at|user_id/i.test(content);
    
    console.log(`   - ${controllerFile}:`);
    console.log(`     ✓ Workflow: ${hasWorkflow ? '✅' : '❌'}`);
    console.log(`     ✓ Relations: ${hasRelations ? '✅' : '❌'}`);
    console.log(`     ✓ Validations: ${hasValidations ? '✅' : '❌'}`);
    console.log(`     ✓ Audit: ${hasAudit ? '✅' : '❌'}`);
  }
}

console.log('\n✅ Vérification terminée');

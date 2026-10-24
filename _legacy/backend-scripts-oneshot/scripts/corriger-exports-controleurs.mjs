/**
 * Script pour corriger les noms d'exports des contrôleurs
 * Les routes attendent des noms en camelCase avec majuscules (getProductTemplate)
 * mais les contrôleurs exportent en camelCase sans majuscules (getProducttemplate)
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
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Mapping des corrections nécessaires
const corrections = [
  {
    file: 'modules/product/controllers/product_template.controller.js',
    mappings: [
      { old: 'getProducttemplate', new: 'getProductTemplates' },
      { old: 'getProducttemplateById', new: 'getProductTemplate' },
      { old: 'createProducttemplate', new: 'createProductTemplate' },
      { old: 'updateProducttemplate', new: 'updateProductTemplate' },
      { old: 'deleteProducttemplate', new: 'deleteProductTemplate' },
    ]
  },
  {
    file: 'modules/sale/controllers/sale_order.controller.js',
    mappings: [
      { old: 'getSaleorder', new: 'getSaleOrders' },
      { old: 'getSaleorderById', new: 'getSaleOrder' },
      { old: 'createSaleorder', new: 'createSaleOrder' },
      { old: 'updateSaleorder', new: 'updateSaleOrder' },
      { old: 'deleteSaleorder', new: 'deleteSaleOrder' },
      { old: 'confirmSaleorder', new: 'confirmSaleOrder' },
      { old: 'cancelSaleorder', new: 'cancelSaleOrder' },
    ]
  },
  {
    file: 'modules/purchase/controllers/purchase_order.controller.js',
    mappings: [
      { old: 'getPurchaseorder', new: 'getPurchaseOrders' },
      { old: 'getPurchaseorderById', new: 'getPurchaseOrder' },
      { old: 'createPurchaseorder', new: 'createPurchaseOrder' },
      { old: 'updatePurchaseorder', new: 'updatePurchaseOrder' },
      { old: 'deletePurchaseorder', new: 'deletePurchaseOrder' },
      { old: 'confirmPurchaseorder', new: 'confirmPurchaseOrder' },
      { old: 'cancelPurchaseorder', new: 'cancelPurchaseOrder' },
    ]
  },
  {
    file: 'modules/hr/controllers/hr_employee.controller.js',
    mappings: [
      { old: 'getHremployee', new: 'getHREmployees' },
      { old: 'getHremployeeById', new: 'getHREmployee' },
      { old: 'createHremployee', new: 'createHREmployee' },
      { old: 'updateHremployee', new: 'updateHREmployee' },
      { old: 'deleteHremployee', new: 'deleteHREmployee' },
    ]
  },
  {
    file: 'modules/hr/controllers/hr_recruitment.controller.js',
    mappings: [
      { old: 'getHrrecruitment', new: 'getHrRecruitments' },
      { old: 'getHrrecruitmentById', new: 'getHrRecruitment' },
      { old: 'createHrrecruitment', new: 'createHrRecruitment' },
      { old: 'updateHrrecruitment', new: 'updateHrRecruitment' },
      { old: 'deleteHrrecruitment', new: 'deleteHrRecruitment' },
    ]
  },
  {
    file: 'modules/hr/controllers/hr_payslip.controller.js',
    mappings: [
      { old: 'getHrpayslip', new: 'getHrPayslips' },
      { old: 'getHrpayslipById', new: 'getHrPayslip' },
      { old: 'createHrpayslip', new: 'createHrPayslip' },
      { old: 'updateHrpayslip', new: 'updateHrPayslip' },
      { old: 'deleteHrpayslip', new: 'deleteHrPayslip' },
    ]
  },
  {
    file: 'modules/crm/controllers/crm_lead.controller.js',
    mappings: [
      { old: 'getCrmlead', new: 'getCrmLeads' },
      { old: 'getCrmleadById', new: 'getCrmLead' },
      { old: 'createCrmlead', new: 'createCrmLead' },
      { old: 'updateCrmlead', new: 'updateCrmLead' },
      { old: 'deleteCrmlead', new: 'deleteCrmLead' },
      { old: 'convertToOpportunity', new: 'convertToOpportunity' }, // Déjà correct
    ]
  },
  {
    file: 'modules/project/controllers/project_project.controller.js',
    mappings: [
      { old: 'getProjectproject', new: 'getProjects' },
      { old: 'getProjectprojectById', new: 'getProject' },
      { old: 'createProjectproject', new: 'createProject' },
      { old: 'updateProjectproject', new: 'updateProject' },
      { old: 'deleteProjectproject', new: 'deleteProject' },
    ]
  },
  {
    file: 'modules/mrp/controllers/mrp_production.controller.js',
    mappings: [
      { old: 'getMrpproduction', new: 'getMrpProductions' },
      { old: 'getMrpproductionById', new: 'getMrpProduction' },
      { old: 'createMrpproduction', new: 'createMrpProduction' },
      { old: 'updateMrpproduction', new: 'updateMrpProduction' },
      { old: 'deleteMrpproduction', new: 'deleteMrpProduction' },
      { old: 'confirmMrpproduction', new: 'confirmMrpProduction' },
    ]
  },
  {
    file: 'modules/stock/controllers/stock_picking.controller.js',
    mappings: [
      { old: 'getStockpicking', new: 'getStockPickings' },
      { old: 'getStockpickingById', new: 'getStockPicking' },
      { old: 'createStockpicking', new: 'createStockPicking' },
      { old: 'updateStockpicking', new: 'updateStockPicking' },
      { old: 'deleteStockpicking', new: 'deleteStockPicking' },
      { old: 'assignStockpicking', new: 'assignStockPicking' },
    ]
  },
];

async function correctFile(correction) {
  const filePath = path.join(backendDir, correction.file);
  
  if (!fs.existsSync(filePath)) {
    log(`  ⚠️  Fichier non trouvé: ${correction.file}`, 'yellow');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  for (const mapping of correction.mappings) {
    // Remplacer dans les exports
    const exportRegex = new RegExp(`export\\s+(const|async function)\\s+${mapping.old}\\b`, 'g');
    if (exportRegex.test(content)) {
      content = content.replace(exportRegex, `export $1 ${mapping.new}`);
      modified = true;
      log(`    ✅ ${mapping.old} → ${mapping.new}`, 'green');
    }
    
    // Remplacer dans les définitions de fonctions
    const funcRegex = new RegExp(`(const|async function)\\s+${mapping.old}\\s*=`, 'g');
    if (funcRegex.test(content)) {
      content = content.replace(funcRegex, `$1 ${mapping.new} =`);
      modified = true;
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
  log('🔧 CORRECTION DES EXPORTS DES CONTRÔLEURS', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let corrected = 0;
  let skipped = 0;
  
  for (const correction of corrections) {
    log(`\n📝 ${correction.file}:`, 'blue');
    const result = await correctFile(correction);
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
});

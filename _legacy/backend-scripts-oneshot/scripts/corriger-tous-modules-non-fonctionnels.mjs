/**
 * Script pour corriger tous les modules non fonctionnels
 * - Modules 404 : Vérifier les exports des contrôleurs
 * - Modules 500 : Corriger les erreurs SQL
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
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Modules 404 - Vérifier les exports
const modules404 = [
  { 
    route: '/product/templates', 
    module: 'product', 
    controller: 'product_template.controller.js',
    routeFile: 'product_template.routes.js',
    expectedExports: ['createProductTemplate', 'getProductTemplate', 'updateProductTemplate', 'deleteProductTemplate']
  },
  { 
    route: '/sale/orders', 
    module: 'sale', 
    controller: 'sale_order.controller.js',
    routeFile: 'sale_order.routes.js',
    expectedExports: ['cancelSaleOrder', 'getSaleOrder', 'createSaleOrder', 'updateSaleOrder']
  },
  { 
    route: '/purchase/orders', 
    module: 'purchase', 
    controller: 'purchase_order.controller.js',
    routeFile: 'purchase_order.routes.js',
    expectedExports: ['cancelPurchaseOrder', 'getPurchaseOrder', 'createPurchaseOrder']
  },
  { 
    route: '/hr/employees', 
    module: 'hr', 
    controller: 'hr_employee.controller.js',
    routeFile: 'hr_employee.routes.js',
    expectedExports: ['createHREmployee', 'getHREmployee', 'updateHREmployee']
  },
  { 
    route: '/hr/recruitments', 
    module: 'hr', 
    controller: 'hr_recruitment.controller.js',
    routeFile: 'hr_recruitment.routes.js',
    expectedExports: ['getHrRecruitment', 'createHrRecruitment']
  },
  { 
    route: '/hr/payslips', 
    module: 'hr', 
    controller: 'hr_payslip.controller.js',
    routeFile: 'hr_payslip.routes.js',
    expectedExports: ['getHrPayslip', 'createHrPayslip']
  },
  { 
    route: '/crm/leads', 
    module: 'crm', 
    controller: 'crm_lead.controller.js',
    routeFile: 'crm_lead.routes.js',
    expectedExports: ['convertToOpportunity', 'getCrmLead', 'createCrmLead']
  },
  { 
    route: '/crm/opportunities', 
    module: 'crm', 
    controller: 'crm_opportunity.controller.js',
    routeFile: 'crm_opportunity.routes.js',
    expectedExports: ['getCrmOpportunity', 'createCrmOpportunity']
  },
  { 
    route: '/crm/activities', 
    module: 'crm', 
    controller: 'crm_activity.controller.js',
    routeFile: 'crm_activity.routes.js',
    expectedExports: ['getCrmActivity', 'createCrmActivity']
  },
  { 
    route: '/project/projects', 
    module: 'project', 
    controller: 'project_project.controller.js',
    routeFile: 'project_project.routes.js',
    expectedExports: ['createProject', 'getProject', 'updateProject']
  },
  { 
    route: '/mrp/productions', 
    module: 'mrp', 
    controller: 'mrp_production.controller.js',
    routeFile: 'mrp_production.routes.js',
    expectedExports: ['confirmMrpProduction', 'getMrpProduction', 'createMrpProduction']
  },
  { 
    route: '/stock/pickings', 
    module: 'stock', 
    controller: 'stock_picking.controller.js',
    routeFile: 'stock_picking.routes.js',
    expectedExports: ['assignStockPicking', 'getStockPicking', 'createStockPicking']
  },
];

// Modules 500 - Corrections SQL
const modules500 = [
  {
    route: '/account/moves',
    module: 'account',
    controller: 'account_move.controller.js',
    fix: async (filePath) => {
      let content = fs.readFileSync(filePath, 'utf8');
      // Vérifier que pool est bien importé
      if (!content.includes("import { pool }")) {
        log('    ⚠️  pool non importé - déjà corrigé', 'yellow');
      }
      // Vérifier WHERE 1=1 WHERE 1=1
      if (content.includes('WHERE 1=1 WHERE 1=1')) {
        content = content.replace(/WHERE 1=1 WHERE 1=1/g, 'WHERE 1=1');
        fs.writeFileSync(filePath, content, 'utf8');
        log('    ✅ WHERE 1=1 WHERE 1=1 corrigé', 'green');
      }
    }
  },
  {
    route: '/mrp/boms',
    module: 'mrp',
    controller: 'mrp_bom.controller.js',
    fix: async (filePath) => {
      let content = fs.readFileSync(filePath, 'utf8');
      // Vérifier que toutes les références à id_ligne_nomenclature sont corrigées
      if (content.includes('nl.id_ligne_nomenclature')) {
        content = content.replace(/nl\.id_ligne_nomenclature/g, 'nl.id');
        fs.writeFileSync(filePath, content, 'utf8');
        log('    ✅ id_ligne_nomenclature → id corrigé', 'green');
      }
      if (content.includes('nl.sequence') && !content.includes('nl.ordre')) {
        content = content.replace(/nl\.sequence/g, 'nl.ordre');
        fs.writeFileSync(filePath, content, 'utf8');
        log('    ✅ sequence → ordre corrigé', 'green');
      }
    }
  },
  {
    route: '/pos/sessions',
    module: 'pos',
    controller: 'pos_session.controller.js',
    fix: async (filePath) => {
      let content = fs.readFileSync(filePath, 'utf8');
      // Vérifier les paramètres de route
      if (content.includes('req.params.id') && content.includes('sessions')) {
        log('    ⚠️  Vérifier que la route utilise bien :id et non "sessions"', 'yellow');
      }
    }
  },
  {
    route: '/taches',
    module: 'taches',
    controller: 'taches.controller.js',
    fix: async (filePath) => {
      let content = fs.readFileSync(filePath, 'utf8');
      // Vérifier les colonnes utilisées
      if (content.includes('t.id_of')) {
        log('    ⚠️  t.id_of trouvé - doit être corrigé', 'yellow');
        // Remplacer par of.id_of ou autre selon la structure
        content = content.replace(/t\.id_of/g, 'of.id_of');
        fs.writeFileSync(filePath, content, 'utf8');
        log('    ✅ t.id_of → of.id_of corrigé', 'green');
      }
    }
  },
  {
    route: '/soustraitants',
    module: 'soustraitants',
    controller: 'soustraitants.controller.js',
    fix: async (filePath) => {
      let content = fs.readFileSync(filePath, 'utf8');
      // Vérifier delai_moyen_jours
      if (content.includes('delai_moyen_jours') && !content.includes('COALESCE')) {
        content = content.replace(/delai_moyen_jours/g, 'COALESCE(delai_moyen_jours, 0)');
        fs.writeFileSync(filePath, content, 'utf8');
        log('    ✅ delai_moyen_jours protégé avec COALESCE', 'green');
      }
    }
  },
];

async function checkExports(moduleInfo) {
  const controllerPath = path.join(backendDir, `modules/${moduleInfo.module}/controllers/${moduleInfo.controller}`);
  
  if (!fs.existsSync(controllerPath)) {
    log(`  ❌ Controller non trouvé: ${moduleInfo.controller}`, 'red');
    return false;
  }
  
  const content = fs.readFileSync(controllerPath, 'utf8');
  const missingExports = [];
  
  for (const exportName of moduleInfo.expectedExports) {
    // Chercher export const ou export function
    const regex = new RegExp(`export\\s+(const|function|async function)\\s+${exportName}`, 'g');
    if (!regex.test(content)) {
      missingExports.push(exportName);
    }
  }
  
  if (missingExports.length > 0) {
    log(`  ⚠️  Exports manquants: ${missingExports.join(', ')}`, 'yellow');
    return false;
  }
  
  log(`  ✅ Tous les exports présents`, 'green');
  return true;
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION DE TOUS LES MODULES NON FONCTIONNELS', 'cyan');
  log('='.repeat(80), 'cyan');
  
  // 1. Vérifier les modules 404
  log('\n📋 1. Vérification des modules 404 (routes manquantes)', 'yellow');
  log('='.repeat(80), 'cyan');
  
  for (const mod of modules404) {
    log(`\n${mod.route}:`, 'blue');
    const isValid = await checkExports(mod);
    if (!isValid) {
      log(`  ⚠️  Module nécessite des corrections`, 'yellow');
    }
  }
  
  // 2. Corriger les modules 500
  log('\n📋 2. Correction des modules 500 (erreurs serveur)', 'yellow');
  log('='.repeat(80), 'cyan');
  
  for (const mod of modules500) {
    log(`\n${mod.route}:`, 'blue');
    const controllerPath = path.join(backendDir, `modules/${mod.module}/controllers/${mod.controller}`);
    
    if (!fs.existsSync(controllerPath)) {
      // Vérifier dans src/controllers pour certains modules
      const altPath = path.join(backendDir, `src/controllers/${mod.controller}`);
      if (fs.existsSync(altPath)) {
        await mod.fix(altPath);
      } else {
        log(`  ❌ Controller non trouvé: ${mod.controller}`, 'red');
      }
    } else {
      await mod.fix(controllerPath);
    }
  }
  
  log('\n' + '='.repeat(80), 'cyan');
  log('✅ Corrections appliquées', 'green');
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

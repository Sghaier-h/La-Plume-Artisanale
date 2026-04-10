/**
 * Script pour analyser et corriger tous les modules non fonctionnels
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
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Modules avec erreurs 404 (routes manquantes)
const modules404 = [
  { route: '/product/templates', module: 'product', controller: 'product_template.controller.js', routeFile: 'product_template.routes.js' },
  { route: '/sale/orders', module: 'sale', controller: 'sale_order.controller.js', routeFile: 'sale_order.routes.js' },
  { route: '/purchase/orders', module: 'purchase', controller: 'purchase_order.controller.js', routeFile: 'purchase_order.routes.js' },
  { route: '/hr/employees', module: 'hr', controller: 'hr_employee.controller.js', routeFile: 'hr_employee.routes.js' },
  { route: '/hr/recruitments', module: 'hr', controller: 'hr_recruitment.controller.js', routeFile: 'hr_recruitment.routes.js' },
  { route: '/hr/payslips', module: 'hr', controller: 'hr_payslip.controller.js', routeFile: 'hr_payslip.routes.js' },
  { route: '/crm/leads', module: 'crm', controller: 'crm_lead.controller.js', routeFile: 'crm_lead.routes.js' },
  { route: '/crm/opportunities', module: 'crm', controller: 'crm_opportunity.controller.js', routeFile: 'crm_opportunity.routes.js' },
  { route: '/crm/activities', module: 'crm', controller: 'crm_activity.controller.js', routeFile: 'crm_activity.routes.js' },
  { route: '/project/projects', module: 'project', controller: 'project_project.controller.js', routeFile: 'project_project.routes.js' },
  { route: '/mrp/productions', module: 'mrp', controller: 'mrp_production.controller.js', routeFile: 'mrp_production.routes.js' },
  { route: '/stock/pickings', module: 'stock', controller: 'stock_picking.controller.js', routeFile: 'stock_picking.routes.js' },
];

// Modules avec erreurs 500 (serveur)
const modules500 = [
  { route: '/account/moves', module: 'account', controller: 'account_move.controller.js', issue: 'pool.query undefined' },
  { route: '/purchase-requests', module: 'purchase-requests', controller: 'purchase-requests.controller.js', issue: 'Erreur serveur' },
  { route: '/mrp/boms', module: 'mrp', controller: 'mrp_bom.controller.js', issue: 'column nl.id_ligne_nomenclature' },
  { route: '/quality/checks', module: 'quality', controller: 'quality_check.controller.js', issue: 'table quality_check' },
  { route: '/pos/caisses', module: 'pos', controller: 'pos_caisse.controller.js', issue: 'column id_caisse' },
  { route: '/pos/sessions', module: 'pos', controller: 'pos_session.controller.js', issue: 'invalid input syntax' },
  { route: '/pos/ventes', module: 'pos', controller: 'pos_vente.controller.js', issue: 'column date_vente' },
  { route: '/taches', module: 'taches', controller: 'taches.controller.js', issue: 'Erreur serveur' },
  { route: '/soustraitants', module: 'soustraitants', controller: 'soustraitants.controller.js', issue: 'Erreur serveur' },
  { route: '/multisociete/companies', module: 'multisociete', controller: 'companies.controller.js', issue: 'column id' },
];

async function checkRouteFiles() {
  log('\n' + '='.repeat(80), 'cyan');
  log('📋 ANALYSE DES MODULES NON FONCTIONNELS', 'cyan');
  log('='.repeat(80), 'cyan');
  
  log('\n🔍 Modules avec erreurs 404 (routes manquantes):', 'yellow');
  for (const mod of modules404) {
    const routePath = path.join(backendDir, `modules/${mod.module}/routes/${mod.routeFile}`);
    const controllerPath = path.join(backendDir, `modules/${mod.module}/controllers/${mod.controller}`);
    
    const routeExists = fs.existsSync(routePath);
    const controllerExists = fs.existsSync(controllerPath);
    
    log(`\n  ${mod.route}:`, 'blue');
    log(`    Route: ${routeExists ? '✅' : '❌'} ${mod.routeFile}`, routeExists ? 'green' : 'red');
    log(`    Controller: ${controllerExists ? '✅' : '❌'} ${mod.controller}`, controllerExists ? 'green' : 'red');
    
    if (!routeExists && controllerExists) {
      log(`    ⚠️  Route manquante mais controller existe`, 'yellow');
    }
  }
  
  log('\n🔍 Modules avec erreurs 500 (serveur):', 'yellow');
  for (const mod of modules500) {
    const controllerPath = path.join(backendDir, `modules/${mod.module}/controllers/${mod.controller}`);
    const exists = fs.existsSync(controllerPath);
    
    log(`\n  ${mod.route}:`, 'blue');
    log(`    Controller: ${exists ? '✅' : '❌'} ${mod.controller}`, exists ? 'green' : 'red');
    log(`    Problème: ${mod.issue}`, 'yellow');
  }
}

async function checkTables() {
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 VÉRIFICATION DES TABLES', 'cyan');
  log('='.repeat(80), 'cyan');
  
  const tablesToCheck = [
    'quality_check',
    'lignes_nomenclature',
    'sessions_caisse',
    'ventes_caisse',
    'caisses',
    'demandes_achat',
    'factures',
  ];
  
  for (const tableName of tablesToCheck) {
    try {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        );
      `, [tableName]);
      
      const exists = result.rows[0].exists;
      log(`  ${tableName}: ${exists ? '✅' : '❌'}`, exists ? 'green' : 'red');
      
      if (exists) {
        // Vérifier les colonnes
        const cols = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);
        
        const colNames = cols.rows.map(r => r.column_name).join(', ');
        log(`    Colonnes: ${colNames}`, 'white');
      }
    } catch (error) {
      log(`  ${tableName}: ❌ Erreur - ${error.message}`, 'red');
    }
  }
}

async function main() {
  try {
    await checkRouteFiles();
    await checkTables();
    
    log('\n' + '='.repeat(80), 'cyan');
    log('✅ Analyse terminée', 'green');
    log('='.repeat(80), 'cyan');
    log('\n📝 Prochaines étapes:', 'yellow');
    log('   1. Créer les routes manquantes pour les modules 404', 'white');
    log('   2. Corriger les erreurs SQL dans les modules 500', 'white');
    log('   3. Créer les tables manquantes', 'white');
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

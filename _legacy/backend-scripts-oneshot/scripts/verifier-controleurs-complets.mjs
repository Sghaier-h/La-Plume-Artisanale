/**
 * Script pour vérifier quels contrôleurs sont complets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendModulesPath = path.join(__dirname, '../modules');

const controllersToCheck = [
  'purchase-requests/controllers/purchase-requests.controller.js',
  'commercial/controllers/commercial.controller.js',
  'product/controllers/product_pricelist.controller.js',
  'multisociete/controllers/companies.controller.js',
  'purchase/controllers/purchase_reception.controller.js',
  'account/controllers/account_reconciliation.controller.js',
  'crm/controllers/crm_campaign.controller.js',
  'pos/controllers/pos_caisse.controller.js',
  'pos/controllers/pos_session.controller.js',
  'pos/controllers/pos_vente.controller.js',
  'ecommerce/controllers/ecommerce_product.controller.js',
  'ecommerce/controllers/ecommerce_order.controller.js',
  'ecommerce/controllers/ecommerce_settings.controller.js'
];

console.log('🔍 Vérification des contrôleurs backend...\n');

const incomplete = [];
const complete = [];

for (const controllerPath of controllersToCheck) {
  const fullPath = path.join(backendModulesPath, controllerPath);
  
  if (!fs.existsSync(fullPath)) {
    incomplete.push({ path: controllerPath, reason: 'fichier_manquant' });
    continue;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Vérifier les patterns "Non implémenté" ou "TODO"
    const hasNotImplemented = /Non implémenté|501|TODO.*Implémenter/i.test(content);
    
    if (hasNotImplemented) {
      incomplete.push({ path: controllerPath, reason: 'fonctionnalites_manquantes' });
    } else {
      complete.push(controllerPath);
    }
  } catch (error) {
    incomplete.push({ path: controllerPath, reason: `erreur: ${error.message}` });
  }
}

console.log(`✅ Contrôleurs complets: ${complete.length}`);
complete.forEach(c => console.log(`   - ${c}`));

if (incomplete.length > 0) {
  console.log(`\n⚠️  Contrôleurs incomplets: ${incomplete.length}`);
  incomplete.forEach(c => console.log(`   - ${c.path} (${c.reason})`));
} else {
  console.log(`\n✅ Tous les contrôleurs sont complets!`);
}

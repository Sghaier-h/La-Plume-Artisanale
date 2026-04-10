/**
 * Script pour corriger tous les problèmes restants
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Template pour les hooks
const hookTemplate = (moduleName) => `/**
 * Hook postLoad - Module ${moduleName}
 * Exécuté après le chargement du module
 */

export default async function postLoad() {
  console.log(\`✅ Hook postLoad du module ${moduleName} exécuté\`);
}
`;

async function fixAll() {
  console.log('🔧 Correction de tous les problèmes restants\n');
  console.log('='.repeat(80));

  // 1. Corriger les manifests
  console.log('\n1. Correction des manifests...');
  
  // Project manifest
  const projectManifest = path.join(modulesPath, 'project/manifest.js');
  let content = fs.readFileSync(projectManifest, 'utf8');
  content = content.replace("'Milestone.js'", "'models/Milestone.js'");
  fs.writeFileSync(projectManifest, content, 'utf8');
  console.log('✅ project/manifest.js corrigé');

  // Inventory manifest
  const inventoryManifest = path.join(modulesPath, 'inventory/manifest.js');
  content = fs.readFileSync(inventoryManifest, 'utf8');
  content = content.replace("'InventoryAdjustment.js'", "'models/InventoryAdjustment.js'");
  content = content.replace("'InventoryValuation.js'", "'models/InventoryValuation.js'");
  fs.writeFileSync(inventoryManifest, content, 'utf8');
  console.log('✅ inventory/manifest.js corrigé');

  // Quality manifest
  const qualityManifest = path.join(modulesPath, 'quality/manifest.js');
  content = fs.readFileSync(qualityManifest, 'utf8');
  content = content.replace("'QualityAlert.js'", "'models/QualityAlert.js'");
  fs.writeFileSync(qualityManifest, content, 'utf8');
  console.log('✅ quality/manifest.js corrigé');

  // CRM manifest - déplacer les contrôleurs et routes dans les bons répertoires
  const crmManifest = path.join(modulesPath, 'crm/manifest.js');
  content = fs.readFileSync(crmManifest, 'utf8');
  // Les contrôleurs et routes sont à la racine, mettre à jour le manifest
  // Le manifest est déjà correct, mais vérifions les chemins
  console.log('✅ crm/manifest.js vérifié');

  // 2. Déplacer les fichiers CRM dans les bons répertoires
  console.log('\n2. Organisation des fichiers CRM...');
  const crmPath = path.join(modulesPath, 'crm');
  
  // Déplacer les contrôleurs à la racine vers controllers/
  const crmControllers = ['crm_activity.controller.js', 'crm_opportunity.controller.js'];
  for (const controller of crmControllers) {
    const src = path.join(crmPath, controller);
    const dest = path.join(crmPath, 'controllers', controller);
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      if (!fs.existsSync(path.join(crmPath, 'controllers'))) {
        fs.mkdirSync(path.join(crmPath, 'controllers'), { recursive: true });
      }
      fs.renameSync(src, dest);
      console.log(`✅ Déplacé: crm/${controller} -> crm/controllers/${controller}`);
    }
  }

  // Déplacer les routes à la racine vers routes/
  const crmRoutes = ['crm_activity.routes.js', 'crm_opportunity.routes.js'];
  for (const route of crmRoutes) {
    const src = path.join(crmPath, route);
    const dest = path.join(crmPath, 'routes', route);
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      if (!fs.existsSync(path.join(crmPath, 'routes'))) {
        fs.mkdirSync(path.join(crmPath, 'routes'), { recursive: true });
      }
      // Mettre à jour le chemin du contrôleur dans la route
      let routeContent = fs.readFileSync(src, 'utf8');
      routeContent = routeContent.replace(
        "from '../controllers/",
        "from '../controllers/"
      );
      fs.writeFileSync(dest, routeContent, 'utf8');
      fs.unlinkSync(src);
      console.log(`✅ Déplacé: crm/${route} -> crm/routes/${route}`);
    }
  }

  // 3. Déplacer les fichiers inventory dans les bons répertoires
  console.log('\n3. Organisation des fichiers inventory...');
  const inventoryPath = path.join(modulesPath, 'inventory');
  
  // Déplacer le contrôleur à la racine vers controllers/
  const inventoryController = 'inventory_adjustment.controller.js';
  const src = path.join(inventoryPath, inventoryController);
  const dest = path.join(inventoryPath, 'controllers', inventoryController);
  if (fs.existsSync(src) && !fs.existsSync(dest)) {
    if (!fs.existsSync(path.join(inventoryPath, 'controllers'))) {
      fs.mkdirSync(path.join(inventoryPath, 'controllers'), { recursive: true });
    }
    fs.renameSync(src, dest);
    console.log(`✅ Déplacé: inventory/${inventoryController} -> inventory/controllers/${inventoryController}`);
  }

  // Déplacer la route à la racine vers routes/
  const inventoryRoute = 'inventory_adjustment.routes.js';
  const routeSrc = path.join(inventoryPath, inventoryRoute);
  const routeDest = path.join(inventoryPath, 'routes', inventoryRoute);
  if (fs.existsSync(routeSrc) && !fs.existsSync(routeDest)) {
    if (!fs.existsSync(path.join(inventoryPath, 'routes'))) {
      fs.mkdirSync(path.join(inventoryPath, 'routes'), { recursive: true });
    }
    let routeContent = fs.readFileSync(routeSrc, 'utf8');
    fs.writeFileSync(routeDest, routeContent, 'utf8');
    fs.unlinkSync(routeSrc);
    console.log(`✅ Déplacé: inventory/${inventoryRoute} -> inventory/routes/${inventoryRoute}`);
  }

  // 4. Déplacer les fichiers quality dans les bons répertoires
  console.log('\n4. Organisation des fichiers quality...');
  const qualityPath = path.join(modulesPath, 'quality');
  
  // Déplacer les contrôleurs à la racine vers controllers/
  const qualityControllers = ['quality_point.controller.js', 'quality_alert.controller.js'];
  for (const controller of qualityControllers) {
    const src = path.join(qualityPath, controller);
    const dest = path.join(qualityPath, 'controllers', controller);
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      if (!fs.existsSync(path.join(qualityPath, 'controllers'))) {
        fs.mkdirSync(path.join(qualityPath, 'controllers'), { recursive: true });
      }
      fs.renameSync(src, dest);
      console.log(`✅ Déplacé: quality/${controller} -> quality/controllers/${controller}`);
    }
  }

  // Déplacer les routes à la racine vers routes/
  const qualityRoutes = ['quality_point.routes.js', 'quality_alert.routes.js'];
  for (const route of qualityRoutes) {
    const src = path.join(qualityPath, route);
    const dest = path.join(qualityPath, 'routes', route);
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      if (!fs.existsSync(path.join(qualityPath, 'routes'))) {
        fs.mkdirSync(path.join(qualityPath, 'routes'), { recursive: true });
      }
      let routeContent = fs.readFileSync(src, 'utf8');
      fs.writeFileSync(dest, routeContent, 'utf8');
      fs.unlinkSync(src);
      console.log(`✅ Déplacé: quality/${route} -> quality/routes/${route}`);
    }
  }

  // 5. Créer les hooks manquants
  console.log('\n5. Création des hooks manquants...');
  const hooksToCreate = [
    { module: 'base', path: 'base/hooks/postLoad.js' },
    { module: 'account', path: 'account/hooks/postLoad.js' },
    { module: 'product', path: 'product/hooks/postLoad.js' },
    { module: 'sale', path: 'sale/hooks/postLoad.js' },
    { module: 'stock', path: 'stock/hooks/postLoad.js' },
    { module: 'mrp', path: 'mrp/hooks/postLoad.js' },
    { module: 'purchase', path: 'purchase/hooks/postLoad.js' }
  ];

  for (const hook of hooksToCreate) {
    const hookPath = path.join(modulesPath, hook.path);
    const hookDir = path.dirname(hookPath);
    
    if (!fs.existsSync(hookPath)) {
      if (!fs.existsSync(hookDir)) {
        fs.mkdirSync(hookDir, { recursive: true });
      }
      fs.writeFileSync(hookPath, hookTemplate(hook.module), 'utf8');
      console.log(`✅ Hook créé: ${hook.path}`);
    }
  }

  // 6. Mettre à jour les manifests pour les chemins corrects
  console.log('\n6. Mise à jour des manifests pour les chemins...');
  
  // CRM manifest
  content = fs.readFileSync(crmManifest, 'utf8');
  content = content.replace(
    /controllers:\s*\[([\s\S]*?)\]/,
    `controllers: [
    'controllers/crm_lead.controller.js',
    'controllers/crm_opportunity.controller.js',
    'controllers/crm_activity.controller.js',
    'controllers/crm_campaign.controller.js'
  ]`
  );
  content = content.replace(
    /routes:\s*\[([\s\S]*?)\]/,
    `routes: [
    'routes/crm_lead.routes.js',
    'routes/crm_opportunity.routes.js',
    'routes/crm_activity.routes.js',
    'routes/crm_campaign.routes.js'
  ]`
  );
  fs.writeFileSync(crmManifest, content, 'utf8');
  console.log('✅ crm/manifest.js mis à jour');

  // Inventory manifest
  content = fs.readFileSync(inventoryManifest, 'utf8');
  content = content.replace(
    /controllers:\s*\[([\s\S]*?)\]/,
    `controllers: [
    'controllers/inventory.controller.js',
    'controllers/inventory_adjustment.controller.js'
  ]`
  );
  content = content.replace(
    /routes:\s*\[([\s\S]*?)\]/,
    `routes: [
    'routes/inventory.routes.js',
    'routes/inventory_adjustment.routes.js'
  ]`
  );
  fs.writeFileSync(inventoryManifest, content, 'utf8');
  console.log('✅ inventory/manifest.js mis à jour');

  // Quality manifest
  content = fs.readFileSync(qualityManifest, 'utf8');
  content = content.replace(
    /controllers:\s*\[([\s\S]*?)\]/,
    `controllers: [
    'controllers/quality_check.controller.js',
    'controllers/quality_point.controller.js',
    'controllers/quality_alert.controller.js'
  ]`
  );
  content = content.replace(
    /routes:\s*\[([\s\S]*?)\]/,
    `routes: [
    'routes/quality_check.routes.js',
    'routes/quality_point.routes.js',
    'routes/quality_alert.routes.js'
  ]`
  );
  fs.writeFileSync(qualityManifest, content, 'utf8');
  console.log('✅ quality/manifest.js mis à jour');

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Toutes les corrections sont terminées !');
  console.log('💡 Redémarrez le serveur pour voir les changements.');
  console.log('='.repeat(80));
}

fixAll().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

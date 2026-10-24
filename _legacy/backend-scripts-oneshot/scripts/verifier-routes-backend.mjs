/**
 * Script pour vérifier les routes backend et les comparer avec les services frontend
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendServicesPath = path.join(__dirname, '../../frontend/src/services/api.ts');
const backendModulesPath = path.join(__dirname, '../modules');

// Services frontend à vérifier
const servicesToCheck = {
  pricelistsService: {
    routes: [
      'GET /product/pricelists',
      'GET /product/pricelists/:id',
      'POST /product/pricelists',
      'PUT /product/pricelists/:id',
      'DELETE /product/pricelists/:id',
      'GET /product/pricelists/:id/items',
      'POST /product/pricelists/:id/items',
      'PUT /product/pricelists/:id/items/:itemId',
      'DELETE /product/pricelists/:id/items/:itemId'
    ],
    backendModule: 'commercial',
    expectedPath: '/commercial'
  },
  companiesService: {
    routes: [
      'GET /companies',
      'GET /companies/:id',
      'POST /companies',
      'PUT /companies/:id',
      'DELETE /companies/:id'
    ],
    backendModule: 'multisociete',
    expectedPath: '/multisociete'
  },
  purchaseRequestsService: {
    routes: [
      'GET /purchase-requests',
      'GET /purchase-requests/:id',
      'POST /purchase-requests',
      'PUT /purchase-requests/:id',
      'DELETE /purchase-requests/:id',
      'POST /purchase-requests/:id/validate',
      'POST /purchase-requests/:id/reject',
      'GET /purchase-requests/:id/lignes',
      'POST /purchase-requests/:id/lignes',
      'PUT /purchase-requests/:id/lignes/:lineId',
      'DELETE /purchase-requests/:id/lignes/:lineId'
    ],
    backendModule: 'purchase-requests',
    expectedPath: '/purchase-requests'
  },
  purchaseReceptionsService: {
    routes: [
      'GET /purchase/receptions',
      'GET /purchase/receptions/:id',
      'POST /purchase/receptions',
      'POST /purchase/receptions/from-order',
      'PUT /purchase/receptions/:id',
      'DELETE /purchase/receptions/:id',
      'POST /purchase/receptions/:id/validate'
    ],
    backendModule: 'purchase',
    expectedPath: '/purchase/receptions'
  },
  bankReconciliationService: {
    routes: [
      'GET /account/reconciliations',
      'GET /account/reconciliations/:id',
      'POST /account/reconciliations',
      'PUT /account/reconciliations/:id',
      'DELETE /account/reconciliations/:id',
      'POST /account/reconciliations/:id/validate',
      'POST /account/reconciliations/:id/auto-match',
      'GET /account/reconciliations/:id/unmatched-lines',
      'POST /account/reconciliations/:id/match'
    ],
    backendModule: 'account',
    expectedPath: '/account/reconciliations'
  },
  crmCampaignsService: {
    routes: [
      'GET /crm/campaigns',
      'GET /crm/campaigns/:id',
      'POST /crm/campaigns',
      'PUT /crm/campaigns/:id',
      'DELETE /crm/campaigns/:id',
      'POST /crm/campaigns/:id/start',
      'POST /crm/campaigns/:id/pause',
      'POST /crm/campaigns/:id/stop',
      'GET /crm/campaigns/:id/stats'
    ],
    backendModule: 'crm',
    expectedPath: '/crm/campaigns'
  },
  posService: {
    routes: [
      'GET /pos/caisses',
      'GET /pos/caisses/:id',
      'POST /pos/sessions/ouvrir',
      'POST /pos/sessions/:id/fermer',
      'POST /pos/ventes',
      'GET /pos/ventes',
      'GET /pos/ventes/:id'
    ],
    backendModule: 'pos',
    expectedPath: '/pos'
  },
  ecommerceProductsService: {
    routes: [
      'GET /ecommerce/products',
      'GET /ecommerce/products/:id',
      'POST /ecommerce/products',
      'PUT /ecommerce/products/:id',
      'DELETE /ecommerce/products/:id'
    ],
    backendModule: 'ecommerce',
    expectedPath: '/ecommerce/products'
  },
  ecommerceOrdersService: {
    routes: [
      'GET /ecommerce/orders',
      'GET /ecommerce/orders/:id',
      'PUT /ecommerce/orders/:id',
      'POST /ecommerce/orders/:id/confirm',
      'POST /ecommerce/orders/:id/cancel'
    ],
    backendModule: 'ecommerce',
    expectedPath: '/ecommerce/orders'
  },
  ecommerceSettingsService: {
    routes: [
      'GET /ecommerce/settings',
      'PUT /ecommerce/settings'
    ],
    backendModule: 'ecommerce',
    expectedPath: '/ecommerce/settings'
  }
};

function checkRouteFile(modulePath, routeFileName) {
  const routePath = path.join(modulePath, 'routes', routeFileName);
  if (!fs.existsSync(routePath)) {
    return { exists: false, routes: [] };
  }

  try {
    const content = fs.readFileSync(routePath, 'utf8');
    const routes = [];
    
    // Extraire les routes
    const routePattern = /router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/gi;
    let match;
    while ((match = routePattern.exec(content)) !== null) {
      routes.push({
        method: match[1].toUpperCase(),
        path: match[2]
      });
    }
    
    return { exists: true, routes, content };
  } catch (error) {
    return { exists: true, routes: [], error: error.message };
  }
}

console.log('🔍 Vérification des routes backend...\n');

const missingRoutes = [];
const incorrectRoutes = [];

for (const [serviceName, serviceInfo] of Object.entries(servicesToCheck)) {
  const modulePath = path.join(backendModulesPath, serviceInfo.backendModule);
  
  if (!fs.existsSync(modulePath)) {
    missingRoutes.push({
      service: serviceName,
      module: serviceInfo.backendModule,
      status: 'module_manquant',
      expectedRoutes: serviceInfo.routes
    });
    continue;
  }

  // Chercher les fichiers de routes
  const routesDir = path.join(modulePath, 'routes');
  if (!fs.existsSync(routesDir)) {
    missingRoutes.push({
      service: serviceName,
      module: serviceInfo.backendModule,
      status: 'routes_dir_manquant',
      expectedRoutes: serviceInfo.routes
    });
    continue;
  }

  const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.routes.js'));
  
  if (routeFiles.length === 0) {
    missingRoutes.push({
      service: serviceName,
      module: serviceInfo.backendModule,
      status: 'aucune_route',
      expectedRoutes: serviceInfo.routes
    });
    continue;
  }

  // Vérifier chaque fichier de route
  const foundRoutes = [];
  for (const routeFile of routeFiles) {
    const routeInfo = checkRouteFile(modulePath, routeFile);
    if (routeInfo.exists && routeInfo.routes.length > 0) {
      foundRoutes.push(...routeInfo.routes.map(r => ({
        ...r,
        file: routeFile
      })));
    }
  }

  // Comparer avec les routes attendues
  const expectedRoutes = serviceInfo.routes.map(r => {
    const [method, path] = r.split(' ');
    return { method, path };
  });

  const missing = expectedRoutes.filter(expected => {
    return !foundRoutes.some(found => {
      // Normaliser les chemins pour la comparaison
      const foundPath = found.path.replace(/\/:id/g, '/:id').replace(/\/:itemId/g, '/:itemId').replace(/\/:lineId/g, '/:lineId');
      const expectedPath = expected.path.replace(/\/:id/g, '/:id').replace(/\/:itemId/g, '/:itemId').replace(/\/:lineId/g, '/:lineId');
      
      return found.method === expected.method && 
             (foundPath === expectedPath || 
              foundPath.replace(/^\/api\//, '') === expectedPath.replace(/^\/api\//, ''));
    });
  });

  if (missing.length > 0) {
    incorrectRoutes.push({
      service: serviceName,
      module: serviceInfo.backendModule,
      expectedPath: serviceInfo.expectedPath,
      missingRoutes: missing,
      foundRoutes: foundRoutes.slice(0, 5) // Limiter l'affichage
    });
  }
}

console.log('\n📊 Résultats de la vérification:\n');

if (missingRoutes.length > 0) {
  console.log('❌ Modules ou routes manquants:');
  missingRoutes.forEach(item => {
    console.log(`   - ${item.service} (${item.module}): ${item.status}`);
    if (item.expectedRoutes) {
      console.log(`     Routes attendues: ${item.expectedRoutes.length}`);
      item.expectedRoutes.slice(0, 3).forEach(r => console.log(`       • ${r}`));
    }
  });
  console.log();
}

if (incorrectRoutes.length > 0) {
  console.log('⚠️  Routes incomplètes ou incorrectes:');
  incorrectRoutes.forEach(item => {
    console.log(`   - ${item.service} (${item.module}):`);
    console.log(`     Chemin attendu: ${item.expectedPath}`);
    console.log(`     Routes manquantes: ${item.missingRoutes.length}`);
    item.missingRoutes.slice(0, 3).forEach(r => {
      console.log(`       • ${r.method} ${r.path}`);
    });
    if (item.foundRoutes.length > 0) {
      console.log(`     Routes trouvées: ${item.foundRoutes.length}`);
      item.foundRoutes.slice(0, 3).forEach(r => {
        console.log(`       • ${r.method} ${r.path} (${r.file})`);
      });
    }
  });
  console.log();
}

if (missingRoutes.length === 0 && incorrectRoutes.length === 0) {
  console.log('✅ Toutes les routes correspondent aux services!\n');
} else {
  console.log(`\n📝 Actions recommandées:`);
  console.log(`   - Créer ${missingRoutes.length} module(s) ou route(s) manquant(s)`);
  console.log(`   - Compléter ${incorrectRoutes.length} route(s) incomplète(s)`);
}

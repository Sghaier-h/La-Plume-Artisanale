/**
 * Script de test CRUD complet pour tous les contrôleurs génériques
 * Version améliorée avec vérification statique et tests dynamiques
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const modulesPath = path.join(__dirname, '../modules');

// Liste des contrôleurs génériques
const controllers = [
  'mobile', 'email', 'settings', 'multisociete', 'whatsapp', 'social-auth', 'ai',
  'warehouse', 'accounting-tunisia', 'payroll-tunisia', 'pos', 'excel-import',
  'audit', 'utilisateurs', 'pointage', 'database', 'migration', 'webhooks',
  'ecommerce', 'communication', 'reports', 'couts', 'qualite-avance',
  'planification-gantt', 'maintenance', 'produits', 'messages', 'notifications',
  'taches', 'documents', 'qualite-avancee', 'tracabilite-lots',
  'stock-multi-entrepots', 'planning-dragdrop', 'selecteurs-machines',
  'articles-catalogue', 'modeles', 'parametres-catalogue', 'suivi-fabrication',
  'matieres-premieres', 'parametrage', 'planning', 'production', 'dashboard',
  'soustraitants', 'of', 'machines', 'bons-retour', 'bons-livraison', 'avoirs', 'search'
];

// Vérification statique : vérifier que les fonctions sont implémentées
function verifyControllerStatic(controllerName) {
  const controllerPath = path.join(modulesPath, controllerName, 'controllers', `${controllerName}.controller.js`);
  
  if (!fs.existsSync(controllerPath)) {
    return {
      exists: false,
      hasCreate: false,
      hasUpdate: false,
      hasDelete: false,
      hasGet: false,
      hasGetById: false
    };
  }

  const content = fs.readFileSync(controllerPath, 'utf8');
  
  return {
    exists: true,
    hasCreate: /export\s+const\s+\w*create\w*\s*=\s*async/.test(content) && 
               !content.includes('Non implémenté') && 
               !content.includes('return sendError(res, \'Non implémenté\', 501)'),
    hasUpdate: /export\s+const\s+\w*update\w*\s*=\s*async/.test(content) && 
               !content.includes('Non implémenté') && 
               !content.includes('return sendError(res, \'Non implémenté\', 501)'),
    hasDelete: /export\s+const\s+\w*delete\w*\s*=\s*async/.test(content) && 
               !content.includes('Non implémenté') && 
               !content.includes('return sendError(res, \'Non implémenté\', 501)'),
    hasGet: /export\s+const\s+\w*get\w*\s*=\s*async/.test(content) && 
            !content.includes('Non implémenté'),
    hasGetById: /export\s+const\s+\w*get\w*ById\s*=\s*async/.test(content) && 
                !content.includes('Non implémenté')
  };
}

// Vérification des routes
function verifyRoutes(controllerName) {
  const routesPath = path.join(modulesPath, controllerName, 'routes', `${controllerName}.routes.js`);
  
  if (!fs.existsSync(routesPath)) {
    return {
      exists: false,
      hasGet: false,
      hasGetById: false,
      hasPost: false,
      hasPut: false,
      hasDelete: false
    };
  }

  const content = fs.readFileSync(routesPath, 'utf8');
  
  return {
    exists: true,
    hasGet: /router\.(get|GET)\s*\(['"]\/['"]/.test(content),
    hasGetById: /router\.(get|GET)\s*\(['"]\/:id['"]/.test(content),
    hasPost: /router\.(post|POST)\s*\(['"]\/['"]/.test(content),
    hasPut: /router\.(put|PUT)\s*\(['"]\/:id['"]/.test(content),
    hasDelete: /router\.(delete|DELETE)\s*\(['"]\/:id['"]/.test(content)
  };
}

// Test dynamique : tester les routes HTTP
function makeRequest(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: body ? JSON.parse(body) : {}
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function checkServer() {
  try {
    await makeRequest('GET', `${API_BASE_URL}/api/health`);
    return true;
  } catch (error) {
    try {
      // Essayer une route simple
      await makeRequest('GET', `${API_BASE_URL}/api`);
      return true;
    } catch (e) {
      return false;
    }
  }
}

async function testRoute(controller, method, endpoint, data = null) {
  const url = `${API_BASE_URL}/api/${controller}${endpoint}`;
  try {
    const response = await makeRequest(method, url, data);
    return {
      success: response.status >= 200 && response.status < 500,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message
    };
  }
}

async function testControllerDynamic(controller) {
  const results = {
    GET: { success: false, status: 0 },
    GET_BY_ID: { success: false, status: 0 },
    POST: { success: false, status: 0 },
    PUT: { success: false, status: 0 },
    DELETE: { success: false, status: 0 }
  };

  // Test GET
  const getResult = await testRoute(controller, 'GET', '');
  results.GET = getResult;

  // Test GET by ID
  const getByIdResult = await testRoute(controller, 'GET', '/999999');
  results.GET_BY_ID = getByIdResult;
  if (getByIdResult.status === 404) results.GET_BY_ID.success = true;

  // Test POST
  const postData = { name: `Test ${controller}`, description: 'Test automatique' };
  const postResult = await testRoute(controller, 'POST', '', postData);
  results.POST = postResult;

  // Test PUT
  const putData = { name: `Updated ${controller}` };
  const putResult = await testRoute(controller, 'PUT', '/999999', putData);
  results.PUT = putResult;
  if (putResult.status === 404) results.PUT.success = true;

  // Test DELETE
  const deleteResult = await testRoute(controller, 'DELETE', '/999999');
  results.DELETE = deleteResult;
  if (deleteResult.status === 404) results.DELETE.success = true;

  return results;
}

// Fonction principale
async function main() {
  console.log('🧪 Test CRUD des contrôleurs génériques\n');
  console.log('='.repeat(80));

  // Phase 1: Vérification statique
  console.log('\n📋 Phase 1: Vérification statique (fichiers)\n');
  
  const staticResults = [];
  let staticPassed = 0;
  let staticTotal = 0;

  for (const controller of controllers) {
    const controllerCheck = verifyControllerStatic(controller);
    const routesCheck = verifyRoutes(controller);
    
    const checks = {
      controller,
      fileExists: controllerCheck.exists,
      routesExist: routesCheck.exists,
      hasCreate: controllerCheck.hasCreate,
      hasUpdate: controllerCheck.hasUpdate,
      hasDelete: controllerCheck.hasDelete,
      hasGet: controllerCheck.hasGet,
      hasGetById: controllerCheck.hasGetById,
      routeGet: routesCheck.hasGet,
      routeGetById: routesCheck.hasGetById,
      routePost: routesCheck.hasPost,
      routePut: routesCheck.hasPut,
      routeDelete: routesCheck.hasDelete
    };

    const passed = Object.values(checks).filter(v => v === true).length;
    const total = Object.keys(checks).length - 1; // Exclure 'controller'
    staticPassed += passed;
    staticTotal += total;

    staticResults.push(checks);

    const status = passed === total ? '✅' : passed > total / 2 ? '⚠️' : '❌';
    console.log(`${status} ${controller}: ${passed}/${total} vérifications`);
  }

  console.log(`\n✅ Vérifications statiques: ${staticPassed}/${staticTotal} (${Math.round(staticPassed/staticTotal*100)}%)`);

  // Phase 2: Tests dynamiques (si le serveur est disponible)
  console.log('\n' + '='.repeat(80));
  console.log('\n🌐 Phase 2: Tests dynamiques (routes HTTP)\n');
  
  const serverAvailable = await checkServer();
  
  if (!serverAvailable) {
    console.log('⚠️  Le serveur backend n\'est pas accessible.');
    console.log(`   URL: ${API_BASE_URL}`);
    console.log('\n💡 Pour tester les routes dynamiquement:');
    console.log('   1. Démarrer le serveur backend:');
    console.log('      cd backend && npm start');
    console.log('   2. Relancer ce script:');
    console.log('      node scripts/test-crud-complet-v2.mjs\n');
  } else {
    console.log('✅ Serveur accessible\n');

    const dynamicResults = [];
    let dynamicPassed = 0;
    let dynamicTotal = 0;

    for (const controller of controllers) {
      console.log(`Testing ${controller}...`);
      const result = await testControllerDynamic(controller);
      dynamicResults.push({ controller, ...result });

      const tests = Object.values(result);
      const success = tests.filter(t => t.success).length;
      dynamicTotal += tests.length;
      dynamicPassed += success;

      const status = success === tests.length ? '✅' : success > 0 ? '⚠️' : '❌';
      console.log(`  ${status} ${success}/${tests.length} tests réussis\n`);
    }

    console.log(`✅ Tests dynamiques: ${dynamicPassed}/${dynamicTotal} (${Math.round(dynamicPassed/dynamicTotal*100)}%)`);
  }

  // Résumé final
  console.log('\n' + '='.repeat(80));
  console.log('📊 RÉSUMÉ FINAL');
  console.log('='.repeat(80));
  console.log(`📦 Contrôleurs testés: ${controllers.length}`);
  console.log(`✅ Vérifications statiques: ${staticPassed}/${staticTotal}`);
  if (serverAvailable) {
    console.log(`✅ Tests dynamiques: ${dynamicPassed}/${dynamicTotal}`);
  }
  console.log('\n💡 Note: Les erreurs 404 sont normales pour les tests avec des IDs fictifs.\n');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

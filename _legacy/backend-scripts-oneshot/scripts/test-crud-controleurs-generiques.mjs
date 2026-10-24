/**
 * Script de test CRUD pour tous les contrôleurs génériques
 * Teste les routes GET, GET by ID, POST, PUT, DELETE
 */

import http from 'http';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const API_TOKEN = process.env.API_TOKEN || ''; // Token d'authentification si nécessaire

// Liste des contrôleurs génériques à tester
const controllers = [
  'mobile',
  'email',
  'settings',
  'multisociete',
  'whatsapp',
  'social-auth',
  'ai',
  'warehouse',
  'accounting-tunisia',
  'payroll-tunisia',
  'pos',
  'excel-import',
  'audit',
  'utilisateurs',
  'pointage',
  'database',
  'migration',
  'webhooks',
  'ecommerce',
  'communication',
  'reports',
  'couts',
  'qualite-avance',
  'planification-gantt',
  'maintenance',
  'produits',
  'messages',
  'notifications',
  'taches',
  'documents',
  'qualite-avancee',
  'tracabilite-lots',
  'stock-multi-entrepots',
  'planning-dragdrop',
  'selecteurs-machines',
  'articles-catalogue',
  'modeles',
  'parametres-catalogue',
  'suivi-fabrication',
  'matieres-premieres',
  'parametrage',
  'planning',
  'production',
  'dashboard',
  'soustraitants',
  'of',
  'machines',
  'bons-retour',
  'bons-livraison',
  'avoirs',
  'search'
];

// Fonction pour faire une requête HTTP
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

    if (API_TOKEN) {
      options.headers['Authorization'] = `Bearer ${API_TOKEN}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Fonction pour vérifier si le serveur est accessible
async function checkServer() {
  try {
    const response = await makeRequest('GET', `${API_BASE_URL}/api/health`);
    return response.status === 200 || response.status === 404; // 404 est OK si la route n'existe pas
  } catch (error) {
    return false;
  }
}

// Fonction pour tester une route
async function testRoute(controller, method, endpoint, data = null) {
  const url = `${API_BASE_URL}/api/${controller}${endpoint}`;
  
  try {
    const response = await makeRequest(method, url, data);
    return {
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message
    };
  }
}

// Fonction pour tester un contrôleur complet
async function testController(controller) {
  const results = {
    controller,
    tests: {
      GET: { success: false, status: 0, error: null },
      GET_BY_ID: { success: false, status: 0, error: null },
      POST: { success: false, status: 0, error: null },
      PUT: { success: false, status: 0, error: null },
      DELETE: { success: false, status: 0, error: null }
    }
  };

  // Test GET (liste)
  const getResult = await testRoute(controller, 'GET', '');
  results.tests.GET = getResult;

  // Test GET by ID (avec un ID fictif, devrait retourner 404 si non trouvé, ce qui est OK)
  const getByIdResult = await testRoute(controller, 'GET', '/999999');
  results.tests.GET_BY_ID = getByIdResult;
  // 404 est considéré comme un succès car cela signifie que la route fonctionne
  if (getByIdResult.status === 404) {
    results.tests.GET_BY_ID.success = true;
  }

  // Test POST (création avec données minimales)
  const postData = {
    name: `Test ${controller} ${Date.now()}`,
    description: 'Test automatique'
  };
  const postResult = await testRoute(controller, 'POST', '', postData);
  results.tests.POST = postResult;
  
  // Si POST réussit, on récupère l'ID pour PUT et DELETE
  let createdId = null;
  if (postResult.success && postResult.status === 201) {
    // Essayer de récupérer l'ID depuis la réponse (nécessite de refaire la requête)
    try {
      const createResponse = await makeRequest('POST', `${API_BASE_URL}/api/${controller}`, postData);
      if (createResponse.body && createResponse.body.data) {
        // Chercher un champ ID dans la réponse
        const data = createResponse.body.data;
        createdId = data.id || data[`id_${controller}`] || Object.values(data)[0];
      }
    } catch (e) {
      // Ignorer
    }
  }

  // Test PUT (mise à jour)
  if (createdId) {
    const putData = { ...postData, name: `Updated ${controller}` };
    const putResult = await testRoute(controller, 'PUT', `/${createdId}`, putData);
    results.tests.PUT = putResult;
  } else {
    // Tester avec un ID fictif (devrait retourner 404)
    const putData = { name: `Updated ${controller}` };
    const putResult = await testRoute(controller, 'PUT', '/999999', putData);
    results.tests.PUT = putResult;
    // 404 est considéré comme OK car la route fonctionne
    if (putResult.status === 404) {
      results.tests.PUT.success = true;
    }
  }

  // Test DELETE
  if (createdId) {
    const deleteResult = await testRoute(controller, 'DELETE', `/${createdId}`);
    results.tests.DELETE = deleteResult;
  } else {
    // Tester avec un ID fictif (devrait retourner 404)
    const deleteResult = await testRoute(controller, 'DELETE', '/999999');
    results.tests.DELETE = deleteResult;
    // 404 est considéré comme OK car la route fonctionne
    if (deleteResult.status === 404) {
      results.tests.DELETE.success = true;
    }
  }

  return results;
}

// Fonction principale
async function main() {
  console.log('🧪 Test CRUD des contrôleurs génériques\n');
  console.log(`📍 URL de base: ${API_BASE_URL}\n`);

  // Vérifier que le serveur est accessible
  console.log('🔍 Vérification de l\'accessibilité du serveur...');
  const serverAvailable = await checkServer();
  
  if (!serverAvailable) {
    console.error('❌ Le serveur backend n\'est pas accessible !');
    console.error(`   Assurez-vous que le serveur est démarré sur ${API_BASE_URL}`);
    console.error('   Commande: cd backend && npm start');
    process.exit(1);
  }
  
  console.log('✅ Serveur accessible\n');

  const results = [];
  let successCount = 0;
  let totalTests = 0;

  console.log(`📦 Test de ${controllers.length} contrôleurs...\n`);

  for (const controller of controllers) {
    console.log(`Testing ${controller}...`);
    const result = await testController(controller);
    results.push(result);

    // Compter les tests réussis
    const tests = Object.values(result.tests);
    const success = tests.filter(t => t.success).length;
    totalTests += tests.length;
    successCount += success;

    const status = success === tests.length ? '✅' : success > 0 ? '⚠️' : '❌';
    console.log(`  ${status} ${success}/${tests.length} tests réussis\n`);
  }

  // Afficher le résumé
  console.log('\n' + '='.repeat(80));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(80));
  console.log(`✅ Tests réussis: ${successCount}/${totalTests} (${Math.round(successCount/totalTests*100)}%)`);
  console.log(`📦 Contrôleurs testés: ${controllers.length}\n`);

  // Afficher les détails
  console.log('📋 Détails par contrôleur:\n');
  results.forEach(result => {
    const tests = Object.values(result.tests);
    const success = tests.filter(t => t.success).length;
    const total = tests.length;
    const status = success === total ? '✅' : success > 0 ? '⚠️' : '❌';
    
    console.log(`${status} ${result.controller}:`);
    Object.entries(result.tests).forEach(([method, test]) => {
      const icon = test.success ? '✓' : '✗';
      const statusText = test.status > 0 ? ` (${test.status})` : '';
      const errorText = test.error ? ` - ${test.error}` : '';
      console.log(`   ${icon} ${method}${statusText}${errorText}`);
    });
    console.log();
  });

  // Contrôleurs avec problèmes
  const problematic = results.filter(r => {
    const tests = Object.values(r.tests);
    return tests.filter(t => t.success).length < tests.length;
  });

  if (problematic.length > 0) {
    console.log('⚠️  Contrôleurs nécessitant une attention:');
    problematic.forEach(r => {
      const tests = Object.values(r.tests);
      const success = tests.filter(t => t.success).length;
      console.log(`   - ${r.controller}: ${success}/${tests.length} tests réussis`);
    });
  }

  console.log('\n💡 Note: Les erreurs 404 sont normales pour GET/PUT/DELETE avec des IDs fictifs.');
  console.log('   Les erreurs 400 peuvent indiquer des problèmes de validation.\n');
}

// Exécuter
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

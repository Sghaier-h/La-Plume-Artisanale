/**
 * Script de test CRUD après création des tables
 * Teste les routes pour vérifier que tout fonctionne avec les tables créées
 */

import http from 'http';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Liste des contrôleurs à tester (priorité aux plus utilisés)
const controllersToTest = [
  'mobile',
  'email',
  'settings',
  'qualite-avancee', // Table qui vient d'être créée
  'multisociete',
  'whatsapp',
  'social-auth',
  'ai',
  'warehouse'
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
      await makeRequest('GET', `${API_BASE_URL}/api`);
      return true;
    } catch (e) {
      return false;
    }
  }
}

async function testController(controller) {
  const results = {
    controller,
    GET: { success: false, status: 0 },
    GET_BY_ID: { success: false, status: 0 },
    POST: { success: false, status: 0 },
    PUT: { success: false, status: 0 },
    DELETE: { success: false, status: 0 }
  };

  try {
    // Test GET
    const getResponse = await makeRequest('GET', `${API_BASE_URL}/api/${controller}`);
    results.GET = {
      success: getResponse.status >= 200 && getResponse.status < 500,
      status: getResponse.status
    };

    // Test GET by ID
    const getByIdResponse = await makeRequest('GET', `${API_BASE_URL}/api/${controller}/999999`);
    results.GET_BY_ID = {
      success: getByIdResponse.status === 404 || (getByIdResponse.status >= 200 && getByIdResponse.status < 300),
      status: getByIdResponse.status
    };

    // Test POST
    const postData = { 
      name: `Test ${controller} ${Date.now()}`,
      description: 'Test automatique après création des tables'
    };
    const postResponse = await makeRequest('POST', `${API_BASE_URL}/api/${controller}`, postData);
    results.POST = {
      success: postResponse.status >= 200 && postResponse.status < 300,
      status: postResponse.status
    };

    // Si POST réussit, récupérer l'ID pour PUT et DELETE
    let createdId = null;
    if (results.POST.success && postResponse.body && postResponse.body.data) {
      const data = postResponse.body.data;
      createdId = data.id || data[`id_${controller.replace(/-/g, '_')}`] || Object.values(data)[0];
    }

    // Test PUT
    if (createdId) {
      const putData = { ...postData, name: `Updated ${controller}` };
      const putResponse = await makeRequest('PUT', `${API_BASE_URL}/api/${controller}/${createdId}`, putData);
      results.PUT = {
        success: putResponse.status >= 200 && putResponse.status < 300,
        status: putResponse.status
      };

      // Test DELETE
      const deleteResponse = await makeRequest('DELETE', `${API_BASE_URL}/api/${controller}/${createdId}`);
      results.DELETE = {
        success: deleteResponse.status >= 200 && deleteResponse.status < 300,
        status: deleteResponse.status
      };
    } else {
      // Tester avec un ID fictif
      const putResponse = await makeRequest('PUT', `${API_BASE_URL}/api/${controller}/999999`, { name: 'Test' });
      results.PUT = {
        success: putResponse.status === 404,
        status: putResponse.status
      };

      const deleteResponse = await makeRequest('DELETE', `${API_BASE_URL}/api/${controller}/999999`);
      results.DELETE = {
        success: deleteResponse.status === 404,
        status: deleteResponse.status
      };
    }

  } catch (error) {
    console.error(`  ❌ Erreur lors du test de ${controller}:`, error.message);
  }

  return results;
}

async function main() {
  console.log('🧪 Test CRUD après création des tables\n');
  console.log('='.repeat(80));

  // Vérifier que le serveur est accessible
  console.log('🔍 Vérification de l\'accessibilité du serveur...');
  const serverAvailable = await checkServer();
  
  if (!serverAvailable) {
    console.error('❌ Le serveur backend n\'est pas accessible !');
    console.error(`   URL: ${API_BASE_URL}`);
    console.error('\n💡 Pour tester les routes:');
    console.error('   1. Démarrer le serveur backend:');
    console.error('      cd backend && npm start');
    console.error('   2. Relancer ce script:');
    console.error('      node scripts/test-crud-apres-creation-tables.mjs');
    process.exit(1);
  }
  
  console.log('✅ Serveur accessible\n');

  console.log(`📦 Test de ${controllersToTest.length} contrôleurs prioritaires...\n`);

  const results = [];
  let totalTests = 0;
  let successTests = 0;

  for (const controller of controllersToTest) {
    console.log(`Testing ${controller}...`);
    const result = await testController(controller);
    results.push(result);

    const tests = Object.values(result).filter(v => typeof v === 'object' && v.status !== undefined);
    const success = tests.filter(t => t.success).length;
    totalTests += tests.length;
    successTests += success;

    const status = success === tests.length ? '✅' : success > 0 ? '⚠️' : '❌';
    console.log(`  ${status} ${success}/${tests.length} tests réussis\n`);
  }

  // Résumé
  console.log('\n' + '='.repeat(80));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(80));
  console.log(`✅ Tests réussis: ${successTests}/${totalTests} (${Math.round(successTests/totalTests*100)}%)`);
  console.log(`📦 Contrôleurs testés: ${controllersToTest.length}\n`);

  // Détails
  console.log('📋 Détails par contrôleur:\n');
  results.forEach(result => {
    const tests = Object.entries(result)
      .filter(([key]) => key !== 'controller')
      .map(([key, value]) => ({ method: key, ...value }));
    
    const success = tests.filter(t => t.success).length;
    const status = success === tests.length ? '✅' : success > 0 ? '⚠️' : '❌';
    
    console.log(`${status} ${result.controller}:`);
    tests.forEach(test => {
      const icon = test.success ? '✓' : '✗';
      console.log(`   ${icon} ${test.method}: ${test.status}`);
    });
    console.log();
  });

  // Contrôleurs avec problèmes
  const problematic = results.filter(r => {
    const tests = Object.values(r).filter(v => typeof v === 'object' && v.status !== undefined);
    return tests.filter(t => t.success).length < tests.length;
  });

  if (problematic.length > 0) {
    console.log('⚠️  Contrôleurs nécessitant une attention:');
    problematic.forEach(r => {
      const tests = Object.values(r).filter(v => typeof v === 'object' && v.status !== undefined);
      const success = tests.filter(t => t.success).length;
      console.log(`   - ${r.controller}: ${success}/${tests.length} tests réussis`);
    });
  }

  console.log('\n💡 Note: Les erreurs 404 sont normales pour les tests avec des IDs fictifs.');
  console.log('   Les erreurs 500 peuvent indiquer des problèmes avec les tables ou la connexion DB.\n');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

/**
 * Script de test CRUD détaillé avec affichage des erreurs
 * Affiche les détails des erreurs pour faciliter le débogage
 */

import http from 'http';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Liste des contrôleurs à tester
const controllersToTest = [
  'mobile',
  'email',
  'qualite-avancee'
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
            body: body ? JSON.parse(body) : {},
            rawBody: body
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: {},
            rawBody: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testController(controller) {
  console.log(`\n📦 Test de ${controller}:`);
  console.log('-'.repeat(60));

  // Test GET
  try {
    const getResponse = await makeRequest('GET', `${API_BASE_URL}/api/${controller}`);
    const getSuccess = getResponse.status >= 200 && getResponse.status < 500;
    console.log(`GET /api/${controller}: ${getResponse.status} ${getSuccess ? '✅' : '❌'}`);
    if (!getSuccess && getResponse.rawBody) {
      console.log(`   Erreur: ${getResponse.rawBody.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`GET /api/${controller}: ❌ ${error.message}`);
  }

  // Test POST
  try {
    const postData = { 
      name: `Test ${controller} ${Date.now()}`,
      description: 'Test automatique'
    };
    const postResponse = await makeRequest('POST', `${API_BASE_URL}/api/${controller}`, postData);
    const postSuccess = postResponse.status >= 200 && postResponse.status < 300;
    console.log(`POST /api/${controller}: ${postResponse.status} ${postSuccess ? '✅' : '❌'}`);
    
    if (!postSuccess) {
      console.log(`   Données envoyées:`, JSON.stringify(postData, null, 2));
      console.log(`   Réponse:`, postResponse.rawBody ? postResponse.rawBody.substring(0, 500) : 'Aucune réponse');
      if (postResponse.body && postResponse.body.message) {
        console.log(`   Message: ${postResponse.body.message}`);
      }
      if (postResponse.body && postResponse.body.error) {
        console.log(`   Erreur: ${postResponse.body.error}`);
      }
    } else {
      console.log(`   ✅ Création réussie`);
      if (postResponse.body && postResponse.body.data) {
        console.log(`   ID créé: ${postResponse.body.data.id || Object.values(postResponse.body.data)[0]}`);
      }
    }
  } catch (error) {
    console.log(`POST /api/${controller}: ❌ ${error.message}`);
  }

  // Test GET by ID
  try {
    const getByIdResponse = await makeRequest('GET', `${API_BASE_URL}/api/${controller}/999999`);
    const getByIdSuccess = getByIdResponse.status === 404 || (getByIdResponse.status >= 200 && getByIdResponse.status < 300);
    console.log(`GET /api/${controller}/999999: ${getByIdResponse.status} ${getByIdSuccess ? '✅' : '❌'}`);
  } catch (error) {
    console.log(`GET /api/${controller}/999999: ❌ ${error.message}`);
  }
}

async function main() {
  console.log('🧪 Test CRUD Détaillé\n');
  console.log('='.repeat(80));

  // Vérifier que le serveur est accessible
  try {
    await makeRequest('GET', `${API_BASE_URL}/api/health`);
    console.log('✅ Serveur accessible\n');
  } catch (error) {
    try {
      await makeRequest('GET', `${API_BASE_URL}/api`);
      console.log('✅ Serveur accessible\n');
    } catch (e) {
      console.error('❌ Le serveur backend n\'est pas accessible !');
      console.error(`   URL: ${API_BASE_URL}`);
      process.exit(1);
    }
  }

  for (const controller of controllersToTest) {
    await testController(controller);
  }

  console.log('\n' + '='.repeat(80));
  console.log('💡 Analyse des résultats:');
  console.log('   - 200/201: ✅ Succès');
  console.log('   - 404: ⚠️  Normal pour les IDs fictifs');
  console.log('   - 400: ⚠️  Erreur de validation (vérifiez les données)');
  console.log('   - 500: ❌ Erreur serveur (vérifiez les logs du serveur)');
  console.log('\n');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

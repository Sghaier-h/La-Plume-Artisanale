/**
 * Script de test CRUD avec authentification
 * S'authentifie d'abord, puis teste les routes CRUD
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
function makeRequest(method, url, data = null, token = null) {
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

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

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

// Fonction pour s'authentifier
async function authenticate() {
  try {
    // Essayer de se connecter avec des identifiants par défaut
    // En mode développement, on peut utiliser USE_MOCK_AUTH=true
    const loginData = {
      email: 'admin@system.local',
      password: 'Admin123!' // Mot de passe par défaut en mode mock
    };

    const response = await makeRequest('POST', `${API_BASE_URL}/api/auth/login`, loginData);
    
    if (response.status === 200 || response.status === 201) {
      if (response.body.token) {
        return response.body.token;
      }
      if (response.body.data && response.body.data.token) {
        return response.body.data.token;
      }
    }

    // Si l'authentification échoue, essayer de créer un token mock en développement
    if (process.env.NODE_ENV === 'development' || process.env.USE_MOCK_AUTH === 'true') {
      console.log('⚠️  Authentification échouée, utilisation d\'un token mock pour les tests');
      // En mode développement, on peut utiliser un token mock
      // Le middleware acceptera ce token si USE_MOCK_AUTH=true
      return 'mock-token-for-testing';
    }

    throw new Error('Impossible de s\'authentifier');
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error.message);
    // En mode développement, retourner un token mock
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Utilisation d\'un token mock pour les tests');
      return 'mock-token-for-testing';
    }
    throw error;
  }
}

async function testController(controller, token) {
  console.log(`\n📦 Test de ${controller}:`);
  console.log('-'.repeat(60));

  let createdId = null;

  // Test GET
  try {
    const getResponse = await makeRequest('GET', `${API_BASE_URL}/api/${controller}`, null, token);
    const getSuccess = getResponse.status >= 200 && getResponse.status < 300;
    console.log(`GET /api/${controller}: ${getResponse.status} ${getSuccess ? '✅' : '❌'}`);
    if (!getSuccess && getResponse.rawBody) {
      const errorMsg = getResponse.body?.error?.message || getResponse.rawBody.substring(0, 200);
      console.log(`   Erreur: ${errorMsg}`);
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
    const postResponse = await makeRequest('POST', `${API_BASE_URL}/api/${controller}`, postData, token);
    const postSuccess = postResponse.status >= 200 && postResponse.status < 300;
    console.log(`POST /api/${controller}: ${postResponse.status} ${postSuccess ? '✅' : '❌'}`);
    
    if (!postSuccess) {
      console.log(`   Données envoyées:`, JSON.stringify(postData, null, 2));
      const errorMsg = postResponse.body?.error?.message || postResponse.rawBody?.substring(0, 500) || 'Aucune réponse';
      console.log(`   Réponse: ${errorMsg}`);
    } else {
      console.log(`   ✅ Création réussie`);
      if (postResponse.body && postResponse.body.data) {
        const data = postResponse.body.data;
        createdId = data.id || data.id_mobile || data.id_email || data.id_qualite_avancee || Object.values(data)[0];
        console.log(`   ID créé: ${createdId}`);
      }
    }
  } catch (error) {
    console.log(`POST /api/${controller}: ❌ ${error.message}`);
  }

  // Test GET by ID (avec l'ID créé ou un ID fictif)
  try {
    const testId = createdId || 999999;
    const getByIdResponse = await makeRequest('GET', `${API_BASE_URL}/api/${controller}/${testId}`, null, token);
    const getByIdSuccess = getByIdResponse.status === 404 || (getByIdResponse.status >= 200 && getByIdResponse.status < 300);
    console.log(`GET /api/${controller}/${testId}: ${getByIdResponse.status} ${getByIdSuccess ? '✅' : '❌'}`);
    if (getByIdResponse.status === 404 && !createdId) {
      console.log(`   ⚠️  Normal (ID fictif)`);
    }
  } catch (error) {
    console.log(`GET /api/${controller}/:id: ❌ ${error.message}`);
  }
}

async function main() {
  console.log('🧪 Test CRUD avec Authentification\n');
  console.log('='.repeat(80));

  // Vérifier que le serveur est accessible
  try {
    await makeRequest('GET', `${API_BASE_URL}/api`);
    console.log('✅ Serveur accessible\n');
  } catch (error) {
    console.error('❌ Le serveur backend n\'est pas accessible !');
    console.error(`   URL: ${API_BASE_URL}`);
    process.exit(1);
  }

  // S'authentifier
  console.log('🔐 Authentification...');
  let token;
  try {
    token = await authenticate();
    console.log('✅ Authentification réussie\n');
  } catch (error) {
    console.error('❌ Impossible de s\'authentifier');
    console.error('💡 Astuce: Assurez-vous que le serveur est démarré et que USE_MOCK_AUTH=true en développement');
    console.error('   Ou créez un utilisateur avec: node src/utils/create-admin-user.js');
    process.exit(1);
  }

  // Tester chaque contrôleur
  for (const controller of controllersToTest) {
    await testController(controller, token);
  }

  console.log('\n' + '='.repeat(80));
  console.log('💡 Analyse des résultats:');
  console.log('   - 200/201: ✅ Succès');
  console.log('   - 401: ⚠️  Erreur d\'authentification (vérifiez le token)');
  console.log('   - 404: ⚠️  Normal pour les IDs fictifs');
  console.log('   - 400: ⚠️  Erreur de validation (vérifiez les données)');
  console.log('   - 500: ❌ Erreur serveur (vérifiez les logs du serveur)');
  console.log('\n');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

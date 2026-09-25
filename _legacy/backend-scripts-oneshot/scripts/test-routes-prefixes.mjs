/**
 * Script pour tester spécifiquement les routes avec préfixes
 */

import http from 'http';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Routes avec préfixes à tester
const routesToTest = [
  { path: 'account/moves', name: 'account_moves' },
  { path: 'hr/employees', name: 'hr_employees' },
  { path: 'product/templates', name: 'product_templates' },
  { path: 'sale/orders', name: 'sale_orders' },
  { path: 'stock/warehouses', name: 'stock_warehouses' },
  { path: 'crm/leads', name: 'crm_leads' }
];

function makeRequest(method, url, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000 // 5 secondes de timeout
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

    req.on('error', (error) => {
      resolve({
        status: 'ERROR',
        error: error.message,
        body: {},
        rawBody: ''
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        error: 'Request timeout',
        body: {},
        rawBody: ''
      });
    });

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function authenticate() {
  const loginData = {
    email: 'admin@system.local',
    password: 'Admin123!'
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

  throw new Error('Impossible de s\'authentifier');
}

async function testRoute(route, token) {
  console.log(`\n🔍 Test de ${route.name} (${route.path}):`);
  console.log('-'.repeat(60));
  
  // Test GET
  const getUrl = `${API_BASE_URL}/api/${route.path}`;
  console.log(`GET ${getUrl}`);
  
  const getResponse = await makeRequest('GET', getUrl, null, token);
  console.log(`Status: ${getResponse.status}`);
  
  if (getResponse.status === 'ERROR' || getResponse.status === 'TIMEOUT') {
    console.log(`❌ Erreur: ${getResponse.error || getResponse.status}`);
  } else if (getResponse.status >= 200 && getResponse.status < 300) {
    console.log(`✅ GET fonctionne`);
  } else if (getResponse.status >= 500) {
    console.log(`❌ Erreur serveur (${getResponse.status}):`);
    console.log(JSON.stringify(getResponse.body, null, 2));
  } else {
    console.log(`⚠️  Status: ${getResponse.status}`);
    console.log(JSON.stringify(getResponse.body, null, 2));
  }
  
  // Test POST
  const postUrl = `${API_BASE_URL}/api/${route.path}`;
  console.log(`\nPOST ${postUrl}`);
  
  const postData = {
    name: `Test ${route.name} ${Date.now()}`,
    description: 'Test automatique'
  };
  
  const postResponse = await makeRequest('POST', postUrl, postData, token);
  console.log(`Status: ${postResponse.status}`);
  
  if (postResponse.status === 'ERROR' || postResponse.status === 'TIMEOUT') {
    console.log(`❌ Erreur: ${postResponse.error || postResponse.status}`);
  } else if (postResponse.status >= 200 && postResponse.status < 300) {
    console.log(`✅ POST fonctionne`);
  } else if (postResponse.status >= 500) {
    console.log(`❌ Erreur serveur (${postResponse.status}):`);
    console.log(JSON.stringify(postResponse.body, null, 2));
  } else {
    console.log(`⚠️  Status: ${postResponse.status}`);
    console.log(JSON.stringify(postResponse.body, null, 2));
  }
}

async function main() {
  console.log('🔍 Test des Routes avec Préfixes\n');
  console.log('='.repeat(80));

  // Authentification
  console.log('🔐 Authentification...');
  let token;
  try {
    token = await authenticate();
    console.log('✅ Authentification réussie\n');
  } catch (error) {
    console.error('❌ Impossible de s\'authentifier');
    process.exit(1);
  }

  // Tester chaque route
  for (const route of routesToTest) {
    await testRoute(route, token);
  }

  console.log('\n' + '='.repeat(80));
  console.log('💡 Analyse:');
  console.log('   - Si erreur ECONNRESET ou TIMEOUT: problème de connexion/réseau');
  console.log('   - Si erreur 500: problème dans le contrôleur');
  console.log('   - Si erreur 404: route non trouvée (vérifier le chemin)');
  console.log('\n');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

/**
 * Script pour tester un module spécifique et voir l'erreur exacte
 */

import http from 'http';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const MODULE = process.argv[2] || 'mobile';

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

async function main() {
  console.log(`🧪 Test du module: ${MODULE}\n`);
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

  // Test GET
  console.log(`📥 GET /api/${MODULE}`);
  const getResponse = await makeRequest('GET', `${API_BASE_URL}/api/${MODULE}`, null, token);
  console.log(`Status: ${getResponse.status}`);
  if (getResponse.status >= 200 && getResponse.status < 300) {
    console.log(`✅ GET fonctionne`);
  } else {
    console.log(`❌ GET échoue:`);
    console.log(JSON.stringify(getResponse.body, null, 2));
  }

  // Test POST avec données minimales
  console.log(`\n📤 POST /api/${MODULE}`);
  const postData = {
    name: `Test ${MODULE} ${Date.now()}`,
    description: 'Test automatique'
  };
  console.log(`Données:`, JSON.stringify(postData, null, 2));
  
  const postResponse = await makeRequest('POST', `${API_BASE_URL}/api/${MODULE}`, postData, token);
  console.log(`Status: ${postResponse.status}`);
  
  if (postResponse.status >= 200 && postResponse.status < 300) {
    console.log(`✅ POST fonctionne`);
    console.log(`Réponse:`, JSON.stringify(postResponse.body, null, 2));
  } else {
    console.log(`❌ POST échoue:`);
    console.log(JSON.stringify(postResponse.body, null, 2));
    if (postResponse.rawBody && postResponse.rawBody.length < 2000) {
      console.log(`\nRaw response: ${postResponse.rawBody}`);
    }
  }

  console.log('\n' + '='.repeat(80));
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

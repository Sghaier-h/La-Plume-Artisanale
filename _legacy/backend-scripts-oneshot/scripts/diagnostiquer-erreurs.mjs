/**
 * Script pour diagnostiquer les erreurs dans les modules
 */

import http from 'http';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

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

async function diagnoseModule(module, token) {
  console.log(`\n🔍 Diagnostic de ${module}:`);
  console.log('-'.repeat(60));
  
  // Test GET
  try {
    const getResponse = await makeRequest('GET', `${API_BASE_URL}/api/${module}`, null, token);
    console.log(`GET /api/${module}: ${getResponse.status}`);
    
    if (getResponse.status >= 500) {
      console.log(`   ❌ Erreur serveur:`);
      console.log(`   ${JSON.stringify(getResponse.body, null, 2)}`);
      if (getResponse.rawBody && getResponse.rawBody.length < 1000) {
        console.log(`   Raw: ${getResponse.rawBody}`);
      }
    } else if (getResponse.status >= 400) {
      console.log(`   ⚠️  Erreur client:`);
      console.log(`   ${JSON.stringify(getResponse.body, null, 2)}`);
    } else {
      console.log(`   ✅ Succès`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }
}

async function main() {
  console.log('🔍 Diagnostic des Modules\n');
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

  // Diagnostiquer les modules problématiques
  const problematicModules = [
    'users',
    'companies',
    'partners',
    'tracabilite-lots',
    'suivi-fabrication',
    'utilisateurs',
    'taches',
    'messages',
    'commercial'
  ];

  for (const module of problematicModules) {
    await diagnoseModule(module, token);
  }

  console.log('\n' + '='.repeat(80));
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

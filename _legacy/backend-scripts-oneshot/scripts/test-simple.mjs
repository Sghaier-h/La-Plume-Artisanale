/**
 * Test simple pour vérifier la réponse du serveur
 */

import http from 'http';

const API_BASE_URL = 'http://localhost:5000';

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
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : {},
            rawBody: body
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
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

async function main() {
  console.log('🧪 Test Simple\n');
  console.log('='.repeat(80));
  
  // Authentification
  console.log('\n🔐 Authentification...');
  const loginResponse = await makeRequest('POST', `${API_BASE_URL}/api/auth/login`, {
    email: 'admin@system.local',
    password: 'Admin123!'
  });
  
  console.log('Status:', loginResponse.statusCode);
  console.log('Body:', JSON.stringify(loginResponse.body, null, 2));
  
  if (loginResponse.statusCode !== 200) {
    console.log('\n❌ Authentification échouée');
    return;
  }
  
  const token = loginResponse.body.data?.token || loginResponse.body.token;
  console.log('✅ Token obtenu:', token ? token.substring(0, 20) + '...' : 'AUCUN');
  
  // Test GET mobile
  console.log('\n📦 Test GET /api/mobile...');
  const getResponse = await makeRequest('GET', `${API_BASE_URL}/api/mobile`, null, token);
  
  console.log('Status Code:', getResponse.statusCode);
  console.log('Headers:', JSON.stringify(getResponse.headers, null, 2));
  console.log('Body:', JSON.stringify(getResponse.body, null, 2));
  console.log('Raw Body:', getResponse.rawBody.substring(0, 500));
}

main().catch(console.error);

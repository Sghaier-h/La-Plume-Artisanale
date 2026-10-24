/**
 * Script pour déboguer les routes enregistrées
 * Affiche toutes les routes enregistrées dans Express
 */

import http from 'http';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Liste des routes à tester
const routesToTest = [
  '/api/mobile',
  '/api/email',
  '/api/settings',
  '/api/qualite-avancee',
  '/api/v1/mobile', // Route alternative pour mobile
  '/api/multisociete',
  '/api/whatsapp'
];

async function testRoute(path) {
  try {
    const response = await makeRequest('GET', `${API_BASE_URL}${path}`);
    return {
      path,
      status: response.status,
      exists: response.status !== 404 || !response.rawBody.includes('Cannot GET')
    };
  } catch (error) {
    return {
      path,
      status: 0,
      exists: false,
      error: error.message
    };
  }
}

function makeRequest(method, url) {
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
    req.end();
  });
}

async function main() {
  console.log('🔍 Débogage des Routes\n');
  console.log('='.repeat(80));

  // Vérifier que le serveur est accessible
  try {
    await makeRequest('GET', `${API_BASE_URL}/api/health`);
    console.log('✅ Serveur accessible\n');
  } catch (error) {
    console.error('❌ Le serveur backend n\'est pas accessible !');
    process.exit(1);
  }

  console.log('📋 Test des routes:\n');

  for (const route of routesToTest) {
    const result = await testRoute(route);
    const status = result.exists ? '✅' : '❌';
    console.log(`${status} ${route}: ${result.status} ${result.exists ? '(existe)' : '(n\'existe pas)'}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('💡 Analyse:');
  console.log('   - Si toutes les routes retournent 404, les routes ne sont pas enregistrées');
  console.log('   - Vérifiez les logs du serveur pour voir "Route chargée: ..."');
  console.log('   - Vérifiez que les modules sont chargés sans erreur');
  console.log('\n');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

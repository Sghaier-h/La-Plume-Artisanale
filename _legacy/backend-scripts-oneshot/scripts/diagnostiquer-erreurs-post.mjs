/**
 * Script pour diagnostiquer les erreurs POST (500) en détail
 */

import http from 'http';
import { getTestData } from './ameliorer-donnees-test.mjs';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Modules avec erreurs POST 500
const modulesToDiagnose = [
  'mobile',
  'email',
  'whatsapp',
  'communication',
  'qualite-avancee',
  'qualite-avance',
  'articles-catalogue',
  'matieres-premieres',
  'devis',
  'warehouse',
  'stock-multi-entrepots',
  'of',
  'production',
  'pointage',
  'couts',
  'accounting-tunisia',
  'payroll-tunisia',
  'planning',
  'planification-gantt',
  'planning-dragdrop',
  'maintenance',
  'selecteurs-machines',
  'dashboard',
  'settings',
  'parametres-catalogue',
  'documents',
  'reports',
  'search',
  'database',
  'migration',
  'excel-import',
  'webhooks',
  'social-auth',
  'multisociete'
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
  
  // Test GET d'abord
  const getResponse = await makeRequest('GET', `${API_BASE_URL}/api/${module}`, null, token);
  console.log(`GET: ${getResponse.status}`);
  
  // Test POST avec données améliorées
  const testData = getTestData(module);
  console.log(`\n📝 Données envoyées:`);
  console.log(JSON.stringify(testData, null, 2));
  
  const postResponse = await makeRequest('POST', `${API_BASE_URL}/api/${module}`, testData, token);
  console.log(`\nPOST: ${postResponse.status}`);
  
  if (postResponse.status >= 500) {
    console.log(`❌ Erreur serveur (${postResponse.status}):`);
    console.log(JSON.stringify(postResponse.body, null, 2));
    if (postResponse.rawBody && postResponse.rawBody.length < 2000) {
      console.log(`\nRaw response: ${postResponse.rawBody}`);
    }
  } else if (postResponse.status === 400) {
    console.log(`⚠️  Erreur validation (400):`);
    console.log(JSON.stringify(postResponse.body, null, 2));
  } else if (postResponse.status >= 200 && postResponse.status < 300) {
    console.log(`✅ Succès`);
  }
}

async function main() {
  console.log('🔍 Diagnostic des Erreurs POST (500)\n');
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

  // Diagnostiquer quelques modules représentatifs
  const sampleModules = ['mobile', 'email', 'warehouse', 'dashboard', 'settings'];
  
  for (const module of sampleModules) {
    await diagnoseModule(module, token);
  }

  console.log('\n' + '='.repeat(80));
  console.log('💡 Analyse:');
  console.log('   - Si GET fonctionne mais POST échoue, le problème est dans le contrôleur POST');
  console.log('   - Vérifier les logs du serveur pour les erreurs SQL détaillées');
  console.log('   - Vérifier que les champs requis sont présents dans les données');
  console.log('\n');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

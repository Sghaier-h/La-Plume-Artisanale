/**
 * Script pour tester spécifiquement les modules avec erreurs 400
 * Utilise les données de test améliorées
 */

import http from 'http';
import { getTestData } from './ameliorer-donnees-test.mjs';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Modules avec erreurs 400 identifiés
const modules400 = [
  'articles',
  'articles-catalogue',
  'clients',
  'fournisseurs',
  'soustraitants',
  'commandes',
  'devis',
  'of',
  'machines',
  'avoirs',
  'bons-livraison',
  'bons-retour',
  'factures',
  'purchase-requests',
  'matieres-premieres',
  'modeles',
  'pointage'
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

async function testModule(module, token) {
  console.log(`\n📦 Test de ${module}:`);
  console.log('-'.repeat(60));
  
  // Obtenir les données de test améliorées
  const testData = getTestData(module);
  console.log(`📝 Données de test:`, JSON.stringify(testData, null, 2));
  
  // Test POST
  try {
    const postResponse = await makeRequest('POST', `${API_BASE_URL}/api/${module}`, testData, token);
    console.log(`POST /api/${module}: ${postResponse.status}`);
    
    if (postResponse.status >= 200 && postResponse.status < 300) {
      console.log(`   ✅ Succès`);
      if (postResponse.body && postResponse.body.data) {
        const id = extractId(postResponse.body.data, module);
        if (id) {
          console.log(`   ID créé: ${id}`);
        }
      }
    } else if (postResponse.status === 400) {
      console.log(`   ⚠️  Erreur de validation (400):`);
      console.log(`   ${JSON.stringify(postResponse.body, null, 2)}`);
    } else {
      console.log(`   ❌ Erreur (${postResponse.status}):`);
      console.log(`   ${JSON.stringify(postResponse.body, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }
}

function extractId(data, moduleName) {
  if (!data) return null;
  
  const idFields = [
    'id', 
    `id_${moduleName}`,
    `id_${moduleName.replace('-', '_')}`,
    ...Object.keys(data).filter(k => k.startsWith('id_'))
  ];
  
  for (const field of idFields) {
    if (data[field] !== undefined && data[field] !== null) {
      return data[field];
    }
  }
  
  return null;
}

async function main() {
  console.log('🧪 Test des Modules avec Erreurs 400\n');
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

  // Tester chaque module
  const results = {
    success: [],
    still400: [],
    otherError: []
  };

  for (const module of modules400) {
    const testData = getTestData(module);
    const postResponse = await makeRequest('POST', `${API_BASE_URL}/api/${module}`, testData, token);
    
    if (postResponse.status >= 200 && postResponse.status < 300) {
      results.success.push(module);
      console.log(`✅ ${module}: Succès`);
    } else if (postResponse.status === 400) {
      results.still400.push({ module, error: postResponse.body });
      console.log(`⚠️  ${module}: Toujours erreur 400`);
      console.log(`   ${JSON.stringify(postResponse.body.error || postResponse.body, null, 2)}`);
    } else {
      results.otherError.push({ module, status: postResponse.status, error: postResponse.body });
      console.log(`❌ ${module}: Erreur ${postResponse.status}`);
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(80));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(80));
  console.log(`✅ Modules corrigés: ${results.success.length}`);
  results.success.forEach(m => console.log(`   - ${m}`));
  
  console.log(`\n⚠️  Modules toujours en erreur 400: ${results.still400.length}`);
  results.still400.forEach(({ module, error }) => {
    console.log(`   - ${module}`);
    console.log(`     ${JSON.stringify(error.error || error, null, 2)}`);
  });
  
  console.log(`\n❌ Autres erreurs: ${results.otherError.length}`);
  results.otherError.forEach(({ module, status, error }) => {
    console.log(`   - ${module}: ${status}`);
  });
  
  console.log('\n');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

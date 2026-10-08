/**
 * Script de test CRUD qui vérifie d'abord si le serveur est démarré
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000
});

async function checkServer() {
  try {
    const response = await api.get('/health');
    console.log('✅ Serveur backend accessible');
    console.log(`   Status: ${response.status}`);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Serveur backend non accessible');
      console.error('   Veuillez démarrer le serveur avec: npm start');
      return false;
    }
    // Si le serveur répond mais avec une erreur, c'est OK
    console.log('⚠️  Serveur répond mais avec une erreur (normal si pas de route /health)');
    return true;
  }
}

async function testRoutes() {
  const routes = [
    { method: 'get', path: '/api/purchase-requests', name: 'Purchase Requests' },
    { method: 'get', path: '/api/product/pricelists', name: 'Product Pricelists' },
    { method: 'get', path: '/api/companies', name: 'Companies' },
    { method: 'get', path: '/api/purchase/receptions', name: 'Purchase Receptions' },
    { method: 'get', path: '/api/account/reconciliations', name: 'Bank Reconciliation' },
    { method: 'get', path: '/api/crm/campaigns', name: 'CRM Campaigns' },
    { method: 'get', path: '/api/pos/caisses', name: 'POS Caisses' },
    { method: 'get', path: '/api/ecommerce/products', name: 'E-commerce Products' },
    { method: 'get', path: '/api/ecommerce/orders', name: 'E-commerce Orders' },
    { method: 'get', path: '/api/ecommerce/settings', name: 'E-commerce Settings' },
    { method: 'get', path: '/api/commercial', name: 'Commercial' }
  ];

  console.log('\n🔍 Test des routes...\n');

  const results = {
    accessible: [],
    requiresAuth: [],
    notFound: [],
    errors: []
  };

  for (const route of routes) {
    try {
      const response = await api[route.method](route.path);
      results.accessible.push({ ...route, status: response.status });
      console.log(`✅ ${route.name} - ${route.path} (Status: ${response.status})`);
    } catch (error) {
      const status = error.response?.status;
      
      if (status === 401) {
        results.requiresAuth.push({ ...route, status });
        console.log(`⚠️  ${route.name} - ${route.path} (401 - Authentification requise)`);
      } else if (status === 404) {
        results.notFound.push({ ...route, status });
        console.log(`❌ ${route.name} - ${route.path} (404 - Route non trouvée)`);
      } else if (error.code === 'ECONNREFUSED') {
        results.errors.push({ ...route, error: 'Serveur non accessible' });
        console.log(`❌ ${route.name} - ${route.path} (Serveur non accessible)`);
      } else {
        results.errors.push({ ...route, error: error.message, status });
        console.log(`❌ ${route.name} - ${route.path} (Erreur: ${error.message})`);
      }
    }
    
    // Petite pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(60));
  console.log(`✅ Routes accessibles: ${results.accessible.length}`);
  console.log(`⚠️  Routes nécessitant auth: ${results.requiresAuth.length}`);
  console.log(`❌ Routes non trouvées: ${results.notFound.length}`);
  console.log(`❌ Erreurs: ${results.errors.length}`);

  if (results.notFound.length > 0) {
    console.log('\n⚠️  Routes non trouvées (vérifier les manifests):');
    results.notFound.forEach(r => {
      console.log(`   - ${r.path}`);
    });
  }

  if (results.errors.length > 0 && !results.errors.some(e => e.error === 'Serveur non accessible')) {
    console.log('\n❌ Erreurs:');
    results.errors.forEach(r => {
      console.log(`   - ${r.path}: ${r.error}`);
    });
  }

  console.log('\n💡 Pour tester avec authentification, utilisez:');
  console.log('   $env:TEST_TOKEN="votre-token"; node scripts/test-crud-complet.mjs\n');
}

async function main() {
  console.log('🚀 Test CRUD - Vérification du serveur\n');
  console.log(`📍 URL: ${API_BASE_URL}\n`);

  const serverOk = await checkServer();
  
  if (!serverOk) {
    console.log('\n❌ Impossible de continuer sans serveur backend');
    console.log('   Démarrez le serveur avec: cd backend && npm start\n');
    process.exit(1);
  }

  await testRoutes();
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error.message);
  process.exit(1);
});

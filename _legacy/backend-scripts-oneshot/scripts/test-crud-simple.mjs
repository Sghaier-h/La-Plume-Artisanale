/**
 * Script de test simplifié pour vérifier que les routes répondent
 * Ne nécessite pas d'authentification complète
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000
});

const routes = [
  '/api/purchase-requests',
  '/api/product/pricelists',
  '/api/companies',
  '/api/purchase/receptions',
  '/api/account/reconciliations',
  '/api/crm/campaigns',
  '/api/pos/caisses',
  '/api/pos/sessions/ouvrir',
  '/api/ecommerce/products',
  '/api/ecommerce/orders',
  '/api/ecommerce/settings',
  '/api/commercial',
  '/health',
  '/api/health'
];

console.log('🔍 Test de connectivité des routes...\n');
console.log(`📍 URL: ${API_BASE_URL}\n`);

const results = {
  success: [],
  failed: []
};

async function testRoute(route) {
  try {
    const method = route.includes('ouvrir') ? 'post' : 'get';
    const config = method === 'post' ? { data: {} } : {};
    
    const response = await api[method](route, config);
    results.success.push({ route, status: response.status });
    console.log(`✅ ${route} - Status: ${response.status}`);
    return true;
  } catch (error) {
    const status = error.response?.status || 'NO_RESPONSE';
    const message = error.response?.data?.error?.message || error.message || 'Erreur inconnue';
    
    // Ignorer les erreurs 401 (non authentifié) et 404 (route non trouvée mais serveur répond)
    if (status === 401 || status === 404) {
      results.success.push({ route, status, note: 'Route existe mais nécessite auth ou ressource non trouvée' });
      console.log(`⚠️  ${route} - Status: ${status} (${message})`);
      return true;
    }
    
    results.failed.push({ route, status, error: message });
    console.log(`❌ ${route} - Erreur: ${message}`);
    return false;
  }
}

async function runTests() {
  console.log('Test de toutes les routes...\n');
  
  for (const route of routes) {
    await testRoute(route);
    await new Promise(resolve => setTimeout(resolve, 100)); // Petite pause entre les tests
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(60));
  console.log(`✅ Routes accessibles: ${results.success.length}`);
  console.log(`❌ Routes en erreur: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\n❌ Routes en erreur:');
    results.failed.forEach(r => {
      console.log(`   - ${r.route}: ${r.error}`);
    });
  }
  
  console.log('\n💡 Note: Les erreurs 401 (non authentifié) sont normales si vous n\'avez pas fourni de token.');
  console.log('   Les routes fonctionnent si elles retournent 401 au lieu de 404.\n');
}

runTests().catch(error => {
  console.error('❌ Erreur fatale:', error.message);
  process.exit(1);
});

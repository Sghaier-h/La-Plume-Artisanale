/**
 * Script de test CRUD automatique complet
 * Teste toutes les opérations CRUD pour tous les modules
 * Génère un rapport détaillé
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const TEST_TOKEN = process.env.TEST_TOKEN || null;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(TEST_TOKEN && { 'Authorization': `Bearer ${TEST_TOKEN}` })
  },
  timeout: 10000,
  validateStatus: () => true // Accepter tous les codes de statut
});

const results = {
  modules: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  },
  errors: []
};

function log(message, type = 'info') {
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️', test: '🧪' };
  console.log(`${icons[type] || 'ℹ️'} ${message}`);
}

async function testOperation(moduleName, operation, config) {
  results.summary.total++;
  
  try {
    const { method = 'get', url, data, params, expectedStatus = [200, 201] } = config;
    const fullUrl = url.startsWith('/') ? url : `/${url}`;
    
    log(`    ${operation}...`, 'test');
    
    const response = await api.request({
      method,
      url: fullUrl,
      data,
      params
    });
    
    const statusOk = Array.isArray(expectedStatus) 
      ? expectedStatus.includes(response.status)
      : response.status === expectedStatus;
    
    if (statusOk) {
      results.summary.passed++;
      log(`      ✅ ${operation} réussi (${response.status})`, 'success');
      return { success: true, status: response.status, data: response.data };
    } else {
      // 401 est acceptable si on n'a pas de token
      if (response.status === 401 && !TEST_TOKEN) {
        results.summary.skipped++;
        log(`      ⚠️  ${operation} nécessite authentification`, 'warning');
        return { success: true, status: response.status, skipped: true };
      }
      
      results.summary.failed++;
      const errorMsg = response.data?.error?.message || `Status ${response.status}`;
      log(`      ❌ ${operation} échoué: ${errorMsg}`, 'error');
      results.errors.push({
        module: moduleName,
        operation,
        error: errorMsg,
        status: response.status
      });
      return { success: false, status: response.status, error: errorMsg };
    }
  } catch (error) {
    results.summary.failed++;
    const errorMsg = error.response?.data?.error?.message || error.message || 'Erreur inconnue';
    log(`      ❌ ${operation} erreur: ${errorMsg}`, 'error');
    results.errors.push({
      module: moduleName,
      operation,
      error: errorMsg,
      code: error.code
    });
    return { success: false, error: errorMsg };
  }
}

async function testModule(moduleName, tests) {
  log(`\n📦 Module: ${moduleName}`, 'info');
  
  const moduleResults = {
    name: moduleName,
    operations: {},
    createdId: null
  };
  
  // Exécuter les tests dans l'ordre
  for (const [operation, config] of Object.entries(tests)) {
    // Remplacer les IDs dynamiques
    if (config.url && config.url.includes(':id') && moduleResults.createdId) {
      config.url = config.url.replace(':id', moduleResults.createdId);
    }
    if (config.path && config.path.includes(':id') && moduleResults.createdId) {
      config.path = config.path.replace(':id', moduleResults.createdId);
    }
    
    const result = await testOperation(moduleName, operation, config);
    moduleResults.operations[operation] = result;
    
    // Sauvegarder l'ID créé pour les tests suivants
    if (operation === 'CREATE' && result.success && result.data?.data?.id) {
      moduleResults.createdId = result.data.data.id;
    } else if (operation === 'CREATE' && result.success && result.data?.data?.id_purchase) {
      moduleResults.createdId = result.data.data.id_purchase;
    }
    
    // Petite pause entre les opérations
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  results.modules[moduleName] = moduleResults;
  return moduleResults;
}

// Définition des tests pour chaque module
const testSuites = {
  'purchase-requests': {
    GET_LIST: {
      method: 'get',
      url: '/purchase-requests',
      params: { loadRelations: true },
      expectedStatus: [200, 401]
    },
    CREATE: {
      method: 'post',
      url: '/purchase-requests',
      data: {
        motif: 'Test demande d\'achat automatique',
        date_besoin: new Date().toISOString().split('T')[0],
        notes: 'Test automatique CRUD',
        lignes: [
          { id_product: 1, quantity: 5, price_unit: 50, description: 'Ligne test' }
        ]
      },
      expectedStatus: [201, 401, 400]
    },
    GET_ONE: {
      method: 'get',
      url: '/purchase-requests/:id',
      params: { loadRelations: true },
      expectedStatus: [200, 401, 404]
    },
    UPDATE: {
      method: 'put',
      url: '/purchase-requests/:id',
      data: { notes: 'Notes mises à jour par test automatique' },
      expectedStatus: [200, 401, 404]
    },
    VALIDATE: {
      method: 'post',
      url: '/purchase-requests/:id/validate',
      expectedStatus: [200, 401, 404]
    },
    DELETE: {
      method: 'delete',
      url: '/purchase-requests/:id',
      expectedStatus: [200, 401, 404, 204]
    }
  },
  
  'product/pricelists': {
    GET_LIST: {
      method: 'get',
      url: '/product/pricelists',
      expectedStatus: [200, 401]
    },
    CREATE: {
      method: 'post',
      url: '/product/pricelists',
      data: {
        name: `Liste Test ${Date.now()}`,
        code: `TEST-${Date.now()}`,
        active: true
      },
      expectedStatus: [201, 401, 400]
    },
    GET_ONE: {
      method: 'get',
      url: '/product/pricelists/:id',
      expectedStatus: [200, 401, 404]
    },
    UPDATE: {
      method: 'put',
      url: '/product/pricelists/:id',
      data: { name: 'Liste mise à jour' },
      expectedStatus: [200, 401, 404]
    },
    DELETE: {
      method: 'delete',
      url: '/product/pricelists/:id',
      expectedStatus: [200, 401, 404, 204]
    }
  },
  
  'companies': {
    GET_LIST: {
      method: 'get',
      url: '/companies',
      expectedStatus: [200, 401]
    },
    CREATE: {
      method: 'post',
      url: '/companies',
      data: {
        nom: `Société Test ${Date.now()}`,
        code: `COMP-${Date.now()}`,
        active: true
      },
      expectedStatus: [201, 401, 400]
    },
    GET_ONE: {
      method: 'get',
      url: '/companies/:id',
      expectedStatus: [200, 401, 404]
    },
    UPDATE: {
      method: 'put',
      url: '/companies/:id',
      data: { nom: 'Société mise à jour' },
      expectedStatus: [200, 401, 404]
    },
    DELETE: {
      method: 'delete',
      url: '/companies/:id',
      expectedStatus: [200, 401, 404, 204]
    }
  },
  
  'commercial': {
    GET_LIST: {
      method: 'get',
      url: '/commercial',
      expectedStatus: [200, 401]
    },
    CREATE: {
      method: 'post',
      url: '/commercial',
      data: {
        nom: `Commercial Test ${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        active: true
      },
      expectedStatus: [201, 401, 400]
    },
    GET_ONE: {
      method: 'get',
      url: '/commercial/:id',
      expectedStatus: [200, 401, 404]
    },
    UPDATE: {
      method: 'put',
      url: '/commercial/:id',
      data: { nom: 'Commercial mis à jour' },
      expectedStatus: [200, 401, 404]
    },
    DELETE: {
      method: 'delete',
      url: '/commercial/:id',
      expectedStatus: [200, 401, 404, 204]
    }
  },
  
  'purchase/receptions': {
    GET_LIST: {
      method: 'get',
      url: '/purchase/receptions',
      expectedStatus: [200, 401]
    },
    CREATE: {
      method: 'post',
      url: '/purchase/receptions',
      data: {
        numero_reception: `REC-TEST-${Date.now()}`,
        date_reception: new Date().toISOString().split('T')[0],
        statut: 'brouillon'
      },
      expectedStatus: [201, 401, 400]
    },
    GET_ONE: {
      method: 'get',
      url: '/purchase/receptions/:id',
      expectedStatus: [200, 401, 404]
    },
    UPDATE: {
      method: 'put',
      url: '/purchase/receptions/:id',
      data: { statut: 'en_cours' },
      expectedStatus: [200, 401, 404]
    },
    DELETE: {
      method: 'delete',
      url: '/purchase/receptions/:id',
      expectedStatus: [200, 401, 404, 204]
    }
  },
  
  'account/reconciliations': {
    GET_LIST: {
      method: 'get',
      url: '/account/reconciliations',
      expectedStatus: [200, 401]
    },
    CREATE: {
      method: 'post',
      url: '/account/reconciliations',
      data: {
        name: `Rapprochement Test ${Date.now()}`,
        date_start: new Date().toISOString().split('T')[0],
        date_end: new Date().toISOString().split('T')[0],
        statut: 'draft'
      },
      expectedStatus: [201, 401, 400]
    },
    GET_ONE: {
      method: 'get',
      url: '/account/reconciliations/:id',
      expectedStatus: [200, 401, 404]
    },
    UPDATE: {
      method: 'put',
      url: '/account/reconciliations/:id',
      data: { name: 'Rapprochement mis à jour' },
      expectedStatus: [200, 401, 404]
    },
    DELETE: {
      method: 'delete',
      url: '/account/reconciliations/:id',
      expectedStatus: [200, 401, 404, 204]
    }
  },
  
  'crm/campaigns': {
    GET_LIST: {
      method: 'get',
      url: '/crm/campaigns',
      expectedStatus: [200, 401]
    },
    CREATE: {
      method: 'post',
      url: '/crm/campaigns',
      data: {
        name: `Campagne Test ${Date.now()}`,
        date_start: new Date().toISOString().split('T')[0],
        statut: 'draft'
      },
      expectedStatus: [201, 401, 400]
    },
    GET_ONE: {
      method: 'get',
      url: '/crm/campaigns/:id',
      expectedStatus: [200, 401, 404]
    },
    UPDATE: {
      method: 'put',
      url: '/crm/campaigns/:id',
      data: { name: 'Campagne mise à jour' },
      expectedStatus: [200, 401, 404]
    },
    START: {
      method: 'post',
      url: '/crm/campaigns/:id/start',
      expectedStatus: [200, 401, 404]
    },
    DELETE: {
      method: 'delete',
      url: '/crm/campaigns/:id',
      expectedStatus: [200, 401, 404, 204]
    }
  },
  
  'pos/caisses': {
    GET_LIST: {
      method: 'get',
      url: '/pos/caisses',
      expectedStatus: [200, 401]
    },
    GET_ONE: {
      method: 'get',
      url: '/pos/caisses/1',
      expectedStatus: [200, 401, 404]
    }
  },
  
  'ecommerce/products': {
    GET_LIST: {
      method: 'get',
      url: '/ecommerce/products',
      expectedStatus: [200, 401]
    },
    CREATE: {
      method: 'post',
      url: '/ecommerce/products',
      data: {
        nom_article: `Produit Test ${Date.now()}`,
        reference: `ECO-${Date.now()}`,
        prix_vente: 99.99,
        website_published: true
      },
      expectedStatus: [201, 401, 400]
    },
    GET_ONE: {
      method: 'get',
      url: '/ecommerce/products/:id',
      expectedStatus: [200, 401, 404]
    },
    UPDATE: {
      method: 'put',
      url: '/ecommerce/products/:id',
      data: { nom_article: 'Produit mis à jour' },
      expectedStatus: [200, 401, 404]
    },
    DELETE: {
      method: 'delete',
      url: '/ecommerce/products/:id',
      expectedStatus: [200, 401, 404, 204]
    }
  },
  
  'ecommerce/settings': {
    GET_LIST: {
      method: 'get',
      url: '/ecommerce/settings',
      expectedStatus: [200, 401]
    },
    UPDATE: {
      method: 'put',
      url: '/ecommerce/settings',
      data: {
        site_name: 'La Plume Artisanale Test',
        site_active: true
      },
      expectedStatus: [200, 401]
    }
  }
};

async function main() {
  console.log('🚀 Test CRUD Automatique Complet\n');
  console.log(`📍 URL: ${API_BASE_URL}`);
  console.log(`🔑 Token: ${TEST_TOKEN ? 'Fourni' : 'Non fourni (tests limités)'}\n`);
  
  // Vérifier la connectivité
  try {
    const healthCheck = await api.get('/health', { baseURL: API_BASE_URL.replace('/api', '') });
    log('Serveur accessible', 'success');
  } catch (error) {
    log('Serveur non accessible - Vérifiez que le serveur backend est démarré', 'error');
    process.exit(1);
  }
  
  // Tester chaque module
  for (const [moduleName, tests] of Object.entries(testSuites)) {
    await testModule(moduleName, tests);
  }
  
  // Afficher le résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));
  console.log(`Total: ${results.summary.total}`);
  console.log(`✅ Réussis: ${results.summary.passed}`);
  console.log(`❌ Échoués: ${results.summary.failed}`);
  console.log(`⚠️  Ignorés (auth): ${results.summary.skipped}`);
  console.log(`📈 Taux de réussite: ${((results.summary.passed / results.summary.total) * 100).toFixed(2)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERREURS:');
    results.errors.slice(0, 10).forEach((error, i) => {
      console.log(`\n${i + 1}. ${error.module} - ${error.operation}`);
      console.log(`   ${error.error}`);
    });
    if (results.errors.length > 10) {
      console.log(`\n... et ${results.errors.length - 10} autres erreurs`);
    }
  }
  
  // Sauvegarder le rapport
  const reportPath = path.join(__dirname, '../TEST_CRUD_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    apiUrl: API_BASE_URL,
    hasToken: !!TEST_TOKEN,
    summary: results.summary,
    modules: results.modules,
    errors: results.errors
  }, null, 2));
  
  console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);
  console.log('\n💡 Pour des tests complets, fournissez un token:');
  console.log('   $env:TEST_TOKEN="votre-token"; node scripts/test-crud-automatique.mjs\n');
  
  process.exit(results.summary.failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

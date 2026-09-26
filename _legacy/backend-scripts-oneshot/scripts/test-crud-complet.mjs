/**
 * Script de test complet pour toutes les fonctionnalités CRUD
 * Teste tous les endpoints CRUD pour tous les modules
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const TEST_USER_TOKEN = process.env.TEST_TOKEN || 'test-token'; // À remplacer par un vrai token

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_USER_TOKEN}`
  },
  timeout: 10000
});

// Résultats des tests
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Fonction utilitaire pour logger
function log(message, type = 'info') {
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type] || 'ℹ️';
  console.log(`${prefix} ${message}`);
}

// Fonction pour tester une opération CRUD
async function testCRUD(moduleName, operations) {
  log(`\n📦 Test du module: ${moduleName}`, 'info');
  const moduleResults = {
    name: moduleName,
    operations: {}
  };

  for (const [operation, config] of Object.entries(operations)) {
    results.total++;
    try {
      log(`  Test ${operation}...`, 'info');
      
      let response;
      const url = config.url || `${moduleName}${config.path || ''}`;
      
      switch (operation) {
        case 'GET_LIST':
          response = await api.get(`/${url}`, { params: config.params || {} });
          if (response.status === 200 && Array.isArray(response.data.data || response.data)) {
            log(`    ✅ GET_LIST réussi (${(response.data.data || response.data).length} éléments)`, 'success');
            results.passed++;
            moduleResults.operations[operation] = { status: 'passed', count: (response.data.data || response.data).length };
          } else {
            throw new Error('Réponse invalide');
          }
          break;
          
        case 'GET_ONE':
          if (!config.id) {
            log(`    ⚠️  GET_ONE ignoré (pas d'ID de test)`, 'warning');
            results.total--;
            break;
          }
          response = await api.get(`/${url}/${config.id}`, { params: config.params || {} });
          if (response.status === 200) {
            log(`    ✅ GET_ONE réussi`, 'success');
            results.passed++;
            moduleResults.operations[operation] = { status: 'passed' };
          } else {
            throw new Error(`Status ${response.status}`);
          }
          break;
          
        case 'CREATE':
          response = await api.post(`/${url}`, config.data || {});
          if (response.status === 201 || response.status === 200) {
            const createdId = response.data.data?.id || response.data.id || response.data.data?.id_purchase || response.data.id_purchase;
            log(`    ✅ CREATE réussi (ID: ${createdId})`, 'success');
            results.passed++;
            moduleResults.operations[operation] = { status: 'passed', id: createdId };
            // Sauvegarder l'ID pour les tests suivants
            if (config.saveId) {
              operations.GET_ONE = operations.GET_ONE || {};
              operations.GET_ONE.id = createdId;
              operations.UPDATE = operations.UPDATE || {};
              operations.UPDATE.id = createdId;
              operations.DELETE = operations.DELETE || {};
              operations.DELETE.id = createdId;
            }
          } else {
            throw new Error(`Status ${response.status}: ${JSON.stringify(response.data)}`);
          }
          break;
          
        case 'UPDATE':
          if (!config.id) {
            log(`    ⚠️  UPDATE ignoré (pas d'ID de test)`, 'warning');
            results.total--;
            break;
          }
          response = await api.put(`/${url}/${config.id}`, config.data || {});
          if (response.status === 200) {
            log(`    ✅ UPDATE réussi`, 'success');
            results.passed++;
            moduleResults.operations[operation] = { status: 'passed' };
          } else {
            throw new Error(`Status ${response.status}`);
          }
          break;
          
        case 'DELETE':
          if (!config.id) {
            log(`    ⚠️  DELETE ignoré (pas d'ID de test)`, 'warning');
            results.total--;
            break;
          }
          response = await api.delete(`/${url}/${config.id}`);
          if (response.status === 200 || response.status === 204) {
            log(`    ✅ DELETE réussi`, 'success');
            results.passed++;
            moduleResults.operations[operation] = { status: 'passed' };
          } else {
            throw new Error(`Status ${response.status}`);
          }
          break;
          
        case 'CUSTOM':
          response = await api[config.method || 'post'](`/${url}${config.path || ''}`, config.data || {});
          if (response.status >= 200 && response.status < 300) {
            log(`    ✅ ${config.name || operation} réussi`, 'success');
            results.passed++;
            moduleResults.operations[operation] = { status: 'passed' };
          } else {
            throw new Error(`Status ${response.status}`);
          }
          break;
      }
    } catch (error) {
      results.failed++;
      const errorMsg = error.response?.data?.error?.message || error.message || 'Erreur inconnue';
      log(`    ❌ ${operation} échoué: ${errorMsg}`, 'error');
      moduleResults.operations[operation] = { status: 'failed', error: errorMsg };
      results.errors.push({
        module: moduleName,
        operation,
        error: errorMsg,
        status: error.response?.status,
        data: error.response?.data
      });
    }
  }

  return moduleResults;
}

// Définition des tests pour chaque module
const tests = {
  'purchase-requests': {
    GET_LIST: { url: 'purchase-requests', params: { loadRelations: true } },
    CREATE: {
      url: 'purchase-requests',
      data: {
        motif: 'Test demande d\'achat',
        date_besoin: new Date().toISOString().split('T')[0],
        notes: 'Notes de test',
        lignes: [
          { id_product: 1, quantity: 10, price_unit: 100, description: 'Ligne test 1' }
        ]
      },
      saveId: true
    },
    GET_ONE: { url: 'purchase-requests', params: { loadRelations: true } },
    UPDATE: {
      url: 'purchase-requests',
      data: { notes: 'Notes mises à jour' }
    },
    CUSTOM: {
      name: 'VALIDATE',
      url: 'purchase-requests',
      method: 'post',
      path: '/:id/validate',
      data: {}
    },
    DELETE: { url: 'purchase-requests' }
  },
  
  'product/pricelists': {
    GET_LIST: { url: 'product/pricelists' },
    CREATE: {
      url: 'product/pricelists',
      data: {
        name: 'Liste de prix test',
        code: 'TEST-PRICE',
        active: true
      },
      saveId: true
    },
    GET_ONE: { url: 'product/pricelists' },
    UPDATE: {
      url: 'product/pricelists',
      data: { name: 'Liste de prix mise à jour' }
    },
    DELETE: { url: 'product/pricelists' }
  },
  
  'companies': {
    GET_LIST: { url: 'companies' },
    CREATE: {
      url: 'companies',
      data: {
        nom: 'Société Test',
        code: 'TEST-COMP',
        active: true
      },
      saveId: true
    },
    GET_ONE: { url: 'companies' },
    UPDATE: {
      url: 'companies',
      data: { nom: 'Société Test Mise à Jour' }
    },
    DELETE: { url: 'companies' }
  },
  
  'purchase/receptions': {
    GET_LIST: { url: 'purchase/receptions' },
    CREATE: {
      url: 'purchase/receptions',
      data: {
        numero_reception: 'REC-TEST-001',
        date_reception: new Date().toISOString().split('T')[0],
        statut: 'brouillon'
      },
      saveId: true
    },
    GET_ONE: { url: 'purchase/receptions' },
    UPDATE: {
      url: 'purchase/receptions',
      data: { statut: 'en_cours' }
    },
    DELETE: { url: 'purchase/receptions' }
  },
  
  'account/reconciliations': {
    GET_LIST: { url: 'account/reconciliations' },
    CREATE: {
      url: 'account/reconciliations',
      data: {
        name: 'Rapprochement Test',
        date_start: new Date().toISOString().split('T')[0],
        date_end: new Date().toISOString().split('T')[0],
        statut: 'draft'
      },
      saveId: true
    },
    GET_ONE: { url: 'account/reconciliations' },
    UPDATE: {
      url: 'account/reconciliations',
      data: { name: 'Rapprochement Mise à Jour' }
    },
    DELETE: { url: 'account/reconciliations' }
  },
  
  'crm/campaigns': {
    GET_LIST: { url: 'crm/campaigns' },
    CREATE: {
      url: 'crm/campaigns',
      data: {
        name: 'Campagne Test',
        date_start: new Date().toISOString().split('T')[0],
        statut: 'draft'
      },
      saveId: true
    },
    GET_ONE: { url: 'crm/campaigns' },
    UPDATE: {
      url: 'crm/campaigns',
      data: { name: 'Campagne Mise à Jour' }
    },
    CUSTOM: {
      name: 'START',
      url: 'crm/campaigns',
      method: 'post',
      path: '/:id/start',
      data: {}
    },
    DELETE: { url: 'crm/campaigns' }
  },
  
  'pos/caisses': {
    GET_LIST: { url: 'pos/caisses' },
    GET_ONE: { url: 'pos/caisses', id: 1 } // Utiliser un ID existant
  },
  
  'pos/sessions': {
    CUSTOM: {
      name: 'OPEN_SESSION',
      url: 'pos/sessions',
      method: 'post',
      path: '/ouvrir',
      data: {
        id_caisse: 1,
        montant_ouverture: 1000
      }
    }
  },
  
  'ecommerce/products': {
    GET_LIST: { url: 'ecommerce/products' },
    CREATE: {
      url: 'ecommerce/products',
      data: {
        nom_article: 'Produit E-commerce Test',
        reference: 'ECO-TEST-001',
        prix_vente: 99.99,
        website_published: true
      },
      saveId: true
    },
    GET_ONE: { url: 'ecommerce/products' },
    UPDATE: {
      url: 'ecommerce/products',
      data: { nom_article: 'Produit E-commerce Mise à Jour' }
    },
    DELETE: { url: 'ecommerce/products' }
  },
  
  'ecommerce/orders': {
    GET_LIST: { url: 'ecommerce/orders' },
    GET_ONE: { url: 'ecommerce/orders', id: 1 } // Utiliser un ID existant
  },
  
  'ecommerce/settings': {
    GET_LIST: { url: 'ecommerce/settings' },
    CUSTOM: {
      name: 'UPDATE_SETTINGS',
      url: 'ecommerce/settings',
      method: 'put',
      data: {
        site_name: 'La Plume Artisanale Test',
        site_active: true
      }
    }
  },
  
  'commercial': {
    GET_LIST: { url: 'commercial' },
    CREATE: {
      url: 'commercial',
      data: {
        nom: 'Commercial Test',
        email: 'test@example.com',
        active: true
      },
      saveId: true
    },
    GET_ONE: { url: 'commercial' },
    UPDATE: {
      url: 'commercial',
      data: { nom: 'Commercial Mise à Jour' }
    },
    DELETE: { url: 'commercial' }
  }
};

// Fonction principale
async function runTests() {
  console.log('🚀 Démarrage des tests CRUD complets\n');
  console.log(`📍 URL de l'API: ${API_BASE_URL}\n`);
  
  const allResults = {};
  
  // Tester chaque module
  for (const [moduleName, operations] of Object.entries(tests)) {
    try {
      const moduleResults = await testCRUD(moduleName, operations);
      allResults[moduleName] = moduleResults;
    } catch (error) {
      log(`❌ Erreur lors du test du module ${moduleName}: ${error.message}`, 'error');
      results.errors.push({
        module: moduleName,
        operation: 'MODULE',
        error: error.message
      });
    }
  }
  
  // Afficher le résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));
  console.log(`Total de tests: ${results.total}`);
  console.log(`✅ Réussis: ${results.passed}`);
  console.log(`❌ Échoués: ${results.failed}`);
  console.log(`📈 Taux de réussite: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERREURS DÉTECTÉES:');
    results.errors.forEach((error, index) => {
      console.log(`\n${index + 1}. Module: ${error.module}`);
      console.log(`   Opération: ${error.operation}`);
      console.log(`   Erreur: ${error.error}`);
      if (error.status) {
        console.log(`   Status: ${error.status}`);
      }
    });
  }
  
  // Sauvegarder les résultats
  const reportPath = path.join(__dirname, '../TEST_CRUD_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      successRate: ((results.passed / results.total) * 100).toFixed(2) + '%'
    },
    modules: allResults,
    errors: results.errors,
    timestamp: new Date().toISOString()
  }, null, 2));
  
  console.log(`\n📄 Rapport sauvegardé dans: ${reportPath}`);
  
  // Code de sortie
  process.exit(results.failed > 0 ? 1 : 0);
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error);
  process.exit(1);
});

// Lancer les tests
runTests().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

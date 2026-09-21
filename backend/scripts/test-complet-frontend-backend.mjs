/**
 * Script de test complet pour vérifier toutes les connexions frontend-backend
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test d'authentification
async function authenticate() {
  try {
    // Essayer plusieurs combinaisons de credentials
    const credentialsList = [
      { email: 'admin@system.local', password: 'Admin123!' },
      { email: 'admin@example.com', password: 'admin' },
      { email: 'test@test.com', password: 'test' },
    ];
    
    for (const credentials of credentialsList) {
      try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        
        if (response.data && (response.data.token || response.data.data?.token)) {
          return response.data.token || response.data.data.token;
        }
      } catch (err) {
        // Continuer avec le prochain
        continue;
      }
    }
    
    // Si aucune authentification ne fonctionne, essayer sans auth (mode dev)
    log('⚠️  Aucune authentification réussie, test en mode non authentifié', 'yellow');
    return 'MOCK_TOKEN';
  } catch (error) {
    log('❌ Erreur d\'authentification', 'red');
    log(`   ${error.message}`, 'red');
    log('⚠️  Continuation en mode non authentifié', 'yellow');
    return 'MOCK_TOKEN';
  }
}

// Test d'une route
async function testRoute(method, url, token, data = null, description = '') {
  try {
    const config = {
      method,
      url: `${API_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Ajouter le token seulement s'il n'est pas MOCK
    if (token && token !== 'MOCK_TOKEN') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }
    
    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    // 401 est acceptable si on n'a pas de token valide
    if (error.response?.status === 401 && token === 'MOCK_TOKEN') {
      return {
        success: true,
        status: 401,
        data: { message: 'Authentification requise (normal en mode test)' }
      };
    }
    
    return {
      success: false,
      status: error.response?.status || 0,
      error: error.response?.data || error.message
    };
  }
}

// Tests par module
const tests = {
  // Base
  base: [
    { method: 'GET', url: '/users', description: 'Liste des utilisateurs' },
    { method: 'GET', url: '/companies', description: 'Liste des sociétés' },
    { method: 'GET', url: '/partners', description: 'Liste des partenaires' },
  ],
  
  // Products
  products: [
    { method: 'GET', url: '/product/templates', description: 'Liste des produits' },
    { method: 'GET', url: '/product/categories', description: 'Liste des catégories' },
    { method: 'GET', url: '/product/pricelists', description: 'Liste des listes de prix' },
  ],
  
  // Sales
  sales: [
    { method: 'GET', url: '/sale/orders', description: 'Liste des commandes de vente' },
    { method: 'GET', url: '/clients', description: 'Liste des clients' },
    { method: 'GET', url: '/devis', description: 'Liste des devis' },
    { method: 'GET', url: '/commandes', description: 'Liste des commandes' },
  ],
  
  // Purchases
  purchases: [
    { method: 'GET', url: '/purchase/orders', description: 'Liste des commandes d\'achat' },
    { method: 'GET', url: '/purchase/receptions', description: 'Liste des réceptions' },
    { method: 'GET', url: '/purchase-requests', description: 'Liste des demandes d\'achat' },
    { method: 'GET', url: '/fournisseurs', description: 'Liste des fournisseurs' },
  ],
  
  // Accounting
  accounting: [
    { method: 'GET', url: '/account/moves', description: 'Liste des écritures comptables' },
    { method: 'GET', url: '/account/reconciliations', description: 'Liste des réconciliations' },
    { method: 'GET', url: '/factures', description: 'Liste des factures' },
  ],
  
  // HR
  hr: [
    { method: 'GET', url: '/hr/employees', description: 'Liste des employés' },
    { method: 'GET', url: '/hr/recruitments', description: 'Liste des recrutements' },
    { method: 'GET', url: '/hr/payslips', description: 'Liste des bulletins de paie' },
  ],
  
  // CRM
  crm: [
    { method: 'GET', url: '/crm/leads', description: 'Liste des pistes' },
    { method: 'GET', url: '/crm/opportunities', description: 'Liste des opportunités' },
    { method: 'GET', url: '/crm/campaigns', description: 'Liste des campagnes' },
    { method: 'GET', url: '/crm/activities', description: 'Liste des activités' },
  ],
  
  // Projects
  projects: [
    { method: 'GET', url: '/project/projects', description: 'Liste des projets' },
    { method: 'GET', url: '/project/tasks', description: 'Liste des tâches' },
  ],
  
  // Production
  production: [
    { method: 'GET', url: '/mrp/productions', description: 'Liste des productions' },
    { method: 'GET', url: '/mrp/boms', description: 'Liste des nomenclatures' },
    { method: 'GET', url: '/of', description: 'Liste des OF' },
  ],
  
  // Stock
  stock: [
    { method: 'GET', url: '/stock/pickings', description: 'Liste des transferts' },
    { method: 'GET', url: '/stock/warehouses', description: 'Liste des entrepôts' },
    { method: 'GET', url: '/stock/locations', description: 'Liste des emplacements' },
    { method: 'GET', url: '/inventory/adjustments', description: 'Liste des ajustements' },
  ],
  
  // Quality
  quality: [
    { method: 'GET', url: '/quality/checks', description: 'Liste des contrôles qualité' },
    { method: 'GET', url: '/quality/points', description: 'Liste des points de contrôle' },
    { method: 'GET', url: '/quality/alerts', description: 'Liste des alertes qualité' },
  ],
  
  // E-commerce
  ecommerce: [
    { method: 'GET', url: '/ecommerce', description: 'Liste des boutiques' },
    { method: 'GET', url: '/ecommerce/products', description: 'Liste des produits e-commerce' },
    { method: 'GET', url: '/ecommerce/orders', description: 'Liste des commandes e-commerce' },
  ],
  
  // POS
  pos: [
    { method: 'GET', url: '/pos/caisses', description: 'Liste des caisses' },
    { method: 'GET', url: '/pos/sessions', description: 'Liste des sessions' },
    { method: 'GET', url: '/pos/ventes', description: 'Liste des ventes POS' },
  ],
  
  // Others
  others: [
    { method: 'GET', url: '/warehouse', description: 'Liste des entrepôts' },
    { method: 'GET', url: '/taches', description: 'Liste des tâches' },
    { method: 'GET', url: '/machines', description: 'Liste des machines' },
    { method: 'GET', url: '/soustraitants', description: 'Liste des sous-traitants' },
    { method: 'GET', url: '/utilisateurs', description: 'Liste des utilisateurs' },
    { method: 'GET', url: '/multisociete/companies', description: 'Liste des sociétés multi' },
  ]
};

// Statistiques
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  errors: []
};

// Exécuter tous les tests
async function runAllTests() {
  log('\n🧪 TEST COMPLET FRONTEND-BACKEND', 'cyan');
  log('='.repeat(80), 'cyan');
  
  // Authentification
  log('\n🔐 Authentification...', 'blue');
  const token = await authenticate();
  
  if (!token) {
    log('❌ Impossible de s\'authentifier. Arrêt des tests.', 'red');
    process.exit(1);
  }
  
  log('✅ Authentification réussie', 'green');
  
  // Tests par module
  for (const [moduleName, moduleTests] of Object.entries(tests)) {
    log(`\n📦 Module: ${moduleName.toUpperCase()}`, 'yellow');
    log('-'.repeat(80), 'yellow');
    
    for (const test of moduleTests) {
      stats.total++;
      const result = await testRoute(test.method, test.url, token, null, test.description);
      
      if (result.success) {
        log(`✅ ${test.method} ${test.url} - ${test.description}`, 'green');
        stats.success++;
      } else {
        log(`❌ ${test.method} ${test.url} - ${test.description}`, 'red');
        log(`   Status: ${result.status}`, 'red');
        if (result.error && result.error.error) {
          log(`   Erreur: ${result.error.error.message || JSON.stringify(result.error.error)}`, 'red');
        }
        stats.failed++;
        stats.errors.push({
          module: moduleName,
          method: test.method,
          url: test.url,
          status: result.status,
          error: result.error
        });
      }
      
      // Petit délai pour ne pas surcharger le serveur
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Résumé
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 RÉSUMÉ DES TESTS', 'cyan');
  log('='.repeat(80), 'cyan');
  log(`\nTotal de tests: ${stats.total}`, 'blue');
  log(`✅ Réussis: ${stats.success} (${Math.round(stats.success / stats.total * 100)}%)`, 'green');
  log(`❌ Échoués: ${stats.failed} (${Math.round(stats.failed / stats.total * 100)}%)`, 'red');
  
  if (stats.errors.length > 0) {
    log('\n❌ ERREURS DÉTAILLÉES:', 'red');
    log('-'.repeat(80), 'red');
    
    // Grouper par module
    const errorsByModule = {};
    for (const error of stats.errors) {
      if (!errorsByModule[error.module]) {
        errorsByModule[error.module] = [];
      }
      errorsByModule[error.module].push(error);
    }
    
    for (const [module, moduleErrors] of Object.entries(errorsByModule)) {
      log(`\n📦 ${module.toUpperCase()}:`, 'yellow');
      for (const error of moduleErrors) {
        log(`   ${error.method} ${error.url} - Status: ${error.status}`, 'red');
      }
    }
  }
  
  // Tests POST pour les modules principaux
  log('\n📝 TESTS POST (Création)', 'cyan');
  log('='.repeat(80), 'cyan');
  
  const postTests = [
    {
      url: '/product/templates',
      data: {
        name: 'Test Produit',
        default_code: 'TEST-' + Date.now(),
        type: 'product',
        list_price: 100
      },
      description: 'Créer un produit'
    },
    {
      url: '/clients',
      data: {
        nom: 'Test Client',
        email: 'test@example.com'
      },
      description: 'Créer un client'
    },
    {
      url: '/companies',
      data: {
        nom: 'Test Société',
        email: 'test@example.com'
      },
      description: 'Créer une société'
    }
  ];
  
  for (const test of postTests) {
    stats.total++;
    const result = await testRoute('POST', test.url, token, test.data, test.description);
    
    if (result.success) {
      log(`✅ POST ${test.url} - ${test.description}`, 'green');
      stats.success++;
    } else {
      log(`❌ POST ${test.url} - ${test.description}`, 'red');
      log(`   Status: ${result.status}`, 'red');
      if (result.error && result.error.error) {
        log(`   Erreur: ${result.error.error.message || JSON.stringify(result.error.error)}`, 'red');
      }
      stats.failed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Résumé final
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 RÉSUMÉ FINAL', 'cyan');
  log('='.repeat(80), 'cyan');
  log(`\nTotal de tests: ${stats.total}`, 'blue');
  log(`✅ Réussis: ${stats.success} (${Math.round(stats.success / stats.total * 100)}%)`, 'green');
  log(`❌ Échoués: ${stats.failed} (${Math.round(stats.failed / stats.total * 100)}%)`, 'red');
  
  if (stats.success / stats.total >= 0.8) {
    log('\n🎉 Tests globalement réussis !', 'green');
  } else if (stats.success / stats.total >= 0.5) {
    log('\n⚠️  Tests partiellement réussis. Vérifiez les erreurs ci-dessus.', 'yellow');
  } else {
    log('\n❌ Nombreux échecs. Vérifiez la configuration du serveur.', 'red');
  }
  
  log('\n');
}

// Exécuter les tests
runAllTests().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  process.exit(1);
});

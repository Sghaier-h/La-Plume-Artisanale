/**
 * Script de test CRUD étendu pour tous les modules
 * S'authentifie d'abord, puis teste les routes CRUD de nombreux modules
 */

import http from 'http';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Liste étendue des contrôleurs à tester
const controllersToTest = [
  // Modules de base
  'users',
  'companies',
  'partners',
  
  // Modules communication
  'mobile',
  'email',
  'whatsapp',
  'communication',
  
  // Modules qualité
  'qualite-avancee',
  'qualite-avance',
  
  // Modules produits
  'produits',
  'articles',
  'articles-catalogue',
  'matieres-premieres',
  
  // Modules vente
  'clients',
  'fournisseurs',
  'soustraitants',
  'commandes',
  'devis',
  
  // Modules stock
  'warehouse',
  'stock-multi-entrepots',
  'tracabilite-lots',
  
  // Modules production
  'of',
  'production',
  'suivi-fabrication',
  'modeles',
  
  // Modules RH
  'utilisateurs',
  'pointage',
  
  // Modules comptabilité
  'couts',
  'accounting-tunisia',
  'payroll-tunisia',
  
  // Modules projet
  'taches',
  'planning',
  'planification-gantt',
  'planning-dragdrop',
  
  // Modules maintenance
  'machines',
  'maintenance',
  'selecteurs-machines',
  
  // Modules autres
  'dashboard',
  'settings',
  'parametrage',
  'parametres-catalogue',
  'notifications',
  'messages',
  'documents',
  'reports',
  'search',
  'database',
  'migration',
  'excel-import',
  'webhooks',
  'social-auth',
  'multisociete',
  'avoirs',
  'bons-livraison',
  'bons-retour',
  'commercial',
  'factures',
  'purchase-requests'
];

// Routes avec préfixes (module/resource)
const routesWithPrefix = [
  { path: 'account/moves', name: 'account_moves' },
  { path: 'account/move_lines', name: 'account_move_lines' },
  { path: 'account/taxs', name: 'account_taxs' },
  { path: 'account/accounts', name: 'account_accounts' },
  { path: 'account/journals', name: 'account_journals' },
  { path: 'account/reconciliations', name: 'account_reconciliations' },
  { path: 'hr/employees', name: 'hr_employees' },
  { path: 'hr/departments', name: 'hr_departments' },
  { path: 'hr/leaves', name: 'hr_leaves' },
  { path: 'hr/expenses', name: 'hr_expenses' },
  { path: 'hr/recruitments', name: 'hr_recruitments' },
  { path: 'hr/payslips', name: 'hr_payslips' },
  { path: 'product/templates', name: 'product_templates' },
  { path: 'product/variants', name: 'product_variants' },
  { path: 'product/categories', name: 'product_categories' },
  { path: 'product/uom', name: 'product_uom' },
  { path: 'product/pricelists', name: 'product_pricelists' },
  { path: 'sale/orders', name: 'sale_orders' },
  { path: 'sale/order_lines', name: 'sale_order_lines' },
  { path: 'purchase/orders', name: 'purchase_orders' },
  { path: 'purchase/order_lines', name: 'purchase_order_lines' },
  { path: 'purchase/receptions', name: 'purchase_receptions' },
  { path: 'stock/warehouses', name: 'stock_warehouses' },
  { path: 'stock/locations', name: 'stock_locations' },
  { path: 'stock/moves', name: 'stock_moves' },
  { path: 'stock/pickings', name: 'stock_pickings' },
  { path: 'stock/quants', name: 'stock_quants' },
  { path: 'stock/lots', name: 'stock_lots' },
  { path: 'crm/leads', name: 'crm_leads' },
  { path: 'crm/opportunities', name: 'crm_opportunities' },
  { path: 'crm/activities', name: 'crm_activities' },
  { path: 'crm/campaigns', name: 'crm_campaigns' },
  { path: 'project/projects', name: 'project_projects' },
  { path: 'project/tasks', name: 'project_tasks' },
  { path: 'inventory/adjustments', name: 'inventory_adjustments' },
  { path: 'mrp/productions', name: 'mrp_productions' },
  { path: 'mrp/boms', name: 'mrp_boms' },
  { path: 'mrp/work_centers', name: 'mrp_work_centers' },
  { path: 'mrp/work_orders', name: 'mrp_work_orders' },
  { path: 'mrp/routings', name: 'mrp_routings' },
  { path: 'quality/points', name: 'quality_points' },
  { path: 'quality/alerts', name: 'quality_alerts' },
  { path: 'ecommerce/products', name: 'ecommerce_products' },
  { path: 'ecommerce/orders', name: 'ecommerce_orders' },
  { path: 'ecommerce/settingss', name: 'ecommerce_settings' },
  { path: 'pos/caisses', name: 'pos_caisses' },
  { path: 'pos/sessions', name: 'pos_sessions' },
  { path: 'pos/ventes', name: 'pos_ventes' },
  { path: 'multisociete/companies', name: 'multisociete_companies' }
];

// Fonction pour faire une requête HTTP
function makeRequest(method, url, data = null, token = null) {
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

// Fonction pour s'authentifier
async function authenticate() {
  try {
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
  } catch (error) {
    console.error('❌ Erreur d\'authentification:', error.message);
    throw error;
  }
}

// Fonction pour extraire l'ID depuis la réponse
function extractId(data, controllerName) {
  if (!data) return null;
  
  // Chercher les champs ID communs
  const idFields = [
    'id', 
    `id_${controllerName}`,
    `id_${controllerName.replace('-', '_')}`,
    ...Object.keys(data).filter(k => k.startsWith('id_'))
  ];
  
  for (const field of idFields) {
    if (data[field] !== undefined && data[field] !== null) {
      return data[field];
    }
  }
  
  // Si c'est un objet, prendre la première valeur
  if (typeof data === 'object' && !Array.isArray(data)) {
    const values = Object.values(data);
    if (values.length > 0 && typeof values[0] === 'number') {
      return values[0];
    }
  }
  
  return null;
}

// Fonction pour tester un contrôleur
async function testController(controller, token, isPrefixed = false) {
  const routePath = isPrefixed ? controller.path : controller;
  const displayName = isPrefixed ? controller.name : controller;
  
  const results = {
    name: displayName,
    route: routePath,
    get: { status: null, success: false },
    post: { status: null, success: false, id: null },
    getById: { status: null, success: false }
  };

  // Test GET
  try {
    const getResponse = await makeRequest('GET', `${API_BASE_URL}/api/${routePath}`, null, token);
    results.get.status = getResponse.status;
    results.get.success = getResponse.status >= 200 && getResponse.status < 300;
  } catch (error) {
    results.get.status = 'ERROR';
    results.get.error = error.message;
  }

  // Test POST
  try {
    // Importer les données de test améliorées
    const { getTestData } = await import('./ameliorer-donnees-test.mjs');
    const postData = getTestData(displayName.replace(/-/g, '_').replace(/_/g, '-'));
    
    const postResponse = await makeRequest('POST', `${API_BASE_URL}/api/${routePath}`, postData, token);
    results.post.status = postResponse.status;
    results.post.success = postResponse.status >= 200 && postResponse.status < 300;
    
    if (results.post.success && postResponse.body && postResponse.body.data) {
      results.post.id = extractId(postResponse.body.data, displayName);
    }
  } catch (error) {
    results.post.status = 'ERROR';
    results.post.error = error.message;
  }

  // Test GET by ID
  try {
    const testId = results.post.id || 999999;
    const getByIdResponse = await makeRequest('GET', `${API_BASE_URL}/api/${routePath}/${testId}`, null, token);
    results.getById.status = getByIdResponse.status;
    results.getById.success = getByIdResponse.status === 404 || (getByIdResponse.status >= 200 && getByIdResponse.status < 300);
  } catch (error) {
    results.getById.status = 'ERROR';
    results.getById.error = error.message;
  }

  return results;
}

async function main() {
  console.log('🧪 Test CRUD Étendu - Tous les Modules\n');
  console.log('='.repeat(80));

  // Vérifier que le serveur est accessible
  try {
    await makeRequest('GET', `${API_BASE_URL}/api`);
    console.log('✅ Serveur accessible\n');
  } catch (error) {
    console.error('❌ Le serveur backend n\'est pas accessible !');
    console.error(`   URL: ${API_BASE_URL}`);
    process.exit(1);
  }

  // S'authentifier
  console.log('🔐 Authentification...');
  let token;
  try {
    token = await authenticate();
    console.log('✅ Authentification réussie\n');
  } catch (error) {
    console.error('❌ Impossible de s\'authentifier');
    process.exit(1);
  }

  // Statistiques
  const stats = {
    total: 0,
    success: 0,
    partial: 0,
    failed: 0
  };

  const allResults = [];

  // Tester les routes simples
  console.log('📦 Test des routes simples...\n');
  for (const controller of controllersToTest) {
    stats.total++;
    const result = await testController(controller, token);
    allResults.push(result);
    
    const successCount = [result.get, result.post, result.getById].filter(r => r.success).length;
    if (successCount === 3) {
      stats.success++;
      console.log(`✅ ${controller.padEnd(30)} GET:${result.get.status} POST:${result.post.status} GET/:id:${result.getById.status}`);
    } else if (successCount > 0) {
      stats.partial++;
      console.log(`⚠️  ${controller.padEnd(30)} GET:${result.get.status} POST:${result.post.status} GET/:id:${result.getById.status}`);
    } else {
      stats.failed++;
      console.log(`❌ ${controller.padEnd(30)} GET:${result.get.status} POST:${result.post.status} GET/:id:${result.getById.status}`);
    }
  }

  // Tester les routes avec préfixes
  console.log('\n📦 Test des routes avec préfixes...\n');
  for (const route of routesWithPrefix) {
    stats.total++;
    const result = await testController(route, token, true);
    allResults.push(result);
    
    const successCount = [result.get, result.post, result.getById].filter(r => r.success).length;
    if (successCount === 3) {
      stats.success++;
      console.log(`✅ ${route.name.padEnd(30)} GET:${result.get.status} POST:${result.post.status} GET/:id:${result.getById.status}`);
    } else if (successCount > 0) {
      stats.partial++;
      console.log(`⚠️  ${route.name.padEnd(30)} GET:${result.get.status} POST:${result.post.status} GET/:id:${result.getById.status}`);
    } else {
      stats.failed++;
      console.log(`❌ ${route.name.padEnd(30)} GET:${result.get.status} POST:${result.post.status} GET/:id:${result.getById.status}`);
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(80));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(80));
  console.log(`Total de modules testés: ${stats.total}`);
  console.log(`✅ Totalement fonctionnels: ${stats.success} (${Math.round(stats.success/stats.total*100)}%)`);
  console.log(`⚠️  Partiellement fonctionnels: ${stats.partial} (${Math.round(stats.partial/stats.total*100)}%)`);
  console.log(`❌ Non fonctionnels: ${stats.failed} (${Math.round(stats.failed/stats.total*100)}%)`);
  console.log('\n');

  // Détails des échecs
  const failures = allResults.filter(r => 
    !r.get.success && !r.post.success && !r.getById.success
  );
  
  if (failures.length > 0) {
    console.log('❌ Modules avec problèmes:');
    failures.forEach(r => {
      console.log(`   - ${r.name} (${r.route})`);
      if (r.get.error) console.log(`     GET: ${r.get.error}`);
      if (r.post.error) console.log(`     POST: ${r.post.error}`);
      if (r.getById.error) console.log(`     GET/:id: ${r.getById.error}`);
    });
    console.log('\n');
  }
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

/**
 * Script pour diagnostiquer toutes les erreurs 500 dans les modules
 */

import http from 'http';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Modules avec erreurs 500 identifiés
const modulesToDiagnose = [
  // Routes simples
  'users', 'companies', 'partners', 'mobile', 'email', 'whatsapp', 'communication',
  'qualite-avancee', 'qualite-avance', 'articles', 'articles-catalogue', 'matieres-premieres',
  'soustraitants', 'commandes', 'devis', 'warehouse', 'stock-multi-entrepots', 'tracabilite-lots',
  'of', 'production', 'suivi-fabrication', 'modeles', 'utilisateurs', 'pointage', 'couts',
  'accounting-tunisia', 'payroll-tunisia', 'taches', 'planning', 'planification-gantt',
  'planning-dragdrop', 'machines', 'maintenance', 'selecteurs-machines', 'dashboard', 'settings',
  'parametres-catalogue', 'notifications', 'messages', 'documents', 'reports', 'search',
  'database', 'migration', 'excel-import', 'webhooks', 'social-auth', 'multisociete',
  'avoirs', 'bons-livraison', 'bons-retour', 'commercial', 'factures', 'purchase-requests',
  // Routes avec préfixes
  'account/moves', 'account/move_lines', 'account/taxs', 'account/accounts', 'account/journals',
  'account/reconciliations', 'hr/employees', 'hr/departments', 'hr/leaves', 'hr/expenses',
  'product/templates', 'product/variants', 'product/categories', 'product/uom', 'product/pricelists',
  'sale/orders', 'sale/order_lines', 'purchase/orders', 'purchase/order_lines', 'purchase/receptions',
  'stock/warehouses', 'stock/locations', 'stock/moves', 'stock/pickings', 'stock/quants', 'stock/lots',
  'crm/leads', 'crm/campaigns', 'project/projects', 'project/tasks', 'inventory/adjustments',
  'mrp/productions', 'mrp/boms', 'mrp/work_centers', 'mrp/work_orders', 'mrp/routings',
  'quality/points', 'quality/alerts', 'ecommerce/products', 'ecommerce/orders',
  'pos/caisses', 'pos/sessions', 'pos/ventes', 'multisociete/companies'
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
      },
      timeout: 5000
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

    req.on('error', (error) => {
      resolve({
        status: 'ERROR',
        error: error.message,
        body: {},
        rawBody: ''
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        error: 'Request timeout',
        body: {},
        rawBody: ''
      });
    });

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
  const url = `${API_BASE_URL}/api/${module}`;
  
  // Test GET seulement pour identifier l'erreur
  const getResponse = await makeRequest('GET', url, null, token);
  
  if (getResponse.status === 500) {
    const errorMessage = getResponse.body?.error?.message || getResponse.body?.message || getResponse.rawBody?.substring(0, 200);
    
    // Catégoriser l'erreur
    let category = 'UNKNOWN';
    if (errorMessage.includes('does not exist') || errorMessage.includes('n\'existe pas')) {
      category = 'TABLE_OR_COLUMN_NOT_EXIST';
    } else if (errorMessage.includes('Model') && errorMessage.includes('not found')) {
      category = 'MODEL_NOT_FOUND';
    } else if (errorMessage.includes('syntax error') || errorMessage.includes('syntaxe')) {
      category = 'SQL_SYNTAX_ERROR';
    } else if (errorMessage.includes('permission denied') || errorMessage.includes('permission refusée')) {
      category = 'PERMISSION_DENIED';
    }
    
    return {
      module,
      status: 500,
      category,
      error: errorMessage
    };
  }
  
  return null;
}

async function main() {
  console.log('🔍 Diagnostic des Erreurs 500\n');
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

  console.log(`📦 Diagnostic de ${modulesToDiagnose.length} modules...\n`);
  
  const errors = [];
  let processed = 0;

  for (const module of modulesToDiagnose) {
    processed++;
    if (processed % 10 === 0) {
      console.log(`   Progression: ${processed}/${modulesToDiagnose.length}...`);
    }
    
    const error = await diagnoseModule(module, token);
    if (error) {
      errors.push(error);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Résultats: ${errors.length} modules avec erreurs 500\n`);

  // Grouper par catégorie
  const byCategory = {};
  for (const error of errors) {
    if (!byCategory[error.category]) {
      byCategory[error.category] = [];
    }
    byCategory[error.category].push(error);
  }

  // Afficher par catégorie
  for (const [category, categoryErrors] of Object.entries(byCategory)) {
    console.log(`\n📋 ${category} (${categoryErrors.length} modules):`);
    console.log('-'.repeat(60));
    
    for (const error of categoryErrors.slice(0, 10)) { // Limiter à 10 par catégorie
      console.log(`  - ${error.module}`);
      console.log(`    ${error.error.substring(0, 100)}${error.error.length > 100 ? '...' : ''}`);
    }
    
    if (categoryErrors.length > 10) {
      console.log(`  ... et ${categoryErrors.length - 10} autres`);
    }
  }

  // Sauvegarder dans un fichier
  const fs = await import('fs');
  const report = {
    total: errors.length,
    byCategory,
    allErrors: errors
  };
  
  fs.writeFileSync(
    'diagnostic-erreurs-500.json',
    JSON.stringify(report, null, 2),
    'utf8'
  );
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Rapport sauvegardé dans: diagnostic-erreurs-500.json');
  console.log('\n');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

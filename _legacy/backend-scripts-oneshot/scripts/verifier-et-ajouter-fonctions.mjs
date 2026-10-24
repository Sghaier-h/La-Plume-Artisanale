/**
 * Script pour vérifier et ajouter les fonctions manquantes
 * Vérifie les services frontend et les routes backend
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendServicesPath = path.join(__dirname, '../../frontend/src/services/api.ts');
const backendModulesPath = path.join(__dirname, '../modules');

// Modules ERP principaux à vérifier
const modulesERP = [
  'sale', 'purchase', 'stock', 'account', 'product', 'mrp', 'hr', 'project',
  'crm', 'pos', 'ecommerce', 'warehouse', 'inventory', 'quality', 'maintenance',
  'purchase-requests', 'payroll-tunisia', 'accounting-tunisia'
];

// Fonctions standard à vérifier pour chaque module
const standardFunctions = [
  'get', 'getById', 'create', 'update', 'delete',
  'search', 'filter', 'export', 'import', 'validate', 'cancel'
];

function checkModuleRoutes(moduleName) {
  const modulePath = path.join(backendModulesPath, moduleName);
  if (!fs.existsSync(modulePath)) {
    return { exists: false, routes: [] };
  }

  const routesPath = path.join(modulePath, 'routes');
  if (!fs.existsSync(routesPath)) {
    return { exists: true, routes: [] };
  }

  const routeFiles = fs.readdirSync(routesPath)
    .filter(f => f.endsWith('.routes.js'));

  const routes = [];
  for (const routeFile of routeFiles) {
    const routeFilePath = path.join(routesPath, routeFile);
    try {
      const content = fs.readFileSync(routeFilePath, 'utf8');
      // Extraire les routes définies
      const routeMatches = content.matchAll(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g);
      for (const match of routeMatches) {
        routes.push({
          method: match[1].toUpperCase(),
          path: match[2],
          file: routeFile
        });
      }
    } catch (error) {
      console.error(`Erreur lecture ${routeFile}:`, error.message);
    }
  }

  return { exists: true, routes };
}

function checkFrontendService(moduleName) {
  const servicesContent = fs.readFileSync(frontendServicesPath, 'utf8');
  
  // Chercher les services pour ce module
  const servicePattern = new RegExp(`export const ${moduleName}Service = \\{[\\s\\S]*?\\};`, 'g');
  const match = servicePattern.exec(servicesContent);
  
  if (!match) {
    return { exists: false, functions: [] };
  }

  const serviceContent = match[0];
  // Extraire les fonctions
  const functionMatches = serviceContent.matchAll(/(\w+):\s*\([^)]*\)\s*=>/g);
  const functions = Array.from(functionMatches, m => m[1]);

  return { exists: true, functions };
}

console.log('🔍 Vérification du système ERP...\n');

const missingServices = [];
const incompleteServices = [];

for (const module of modulesERP) {
  const backendInfo = checkModuleRoutes(module);
  const frontendInfo = checkFrontendService(module);

  if (!backendInfo.exists) {
    console.log(`⚠️  Module backend manquant: ${module}`);
    continue;
  }

  if (!frontendInfo.exists) {
    missingServices.push({
      module,
      backendRoutes: backendInfo.routes.length,
      status: 'service_manquant'
    });
  } else {
    // Vérifier si toutes les routes backend ont des fonctions frontend
    const backendRoutePaths = backendInfo.routes.map(r => r.path);
    const frontendFunctions = frontendInfo.functions;
    
    // Vérifier les fonctions manquantes
    const missingFunctions = [];
    for (const route of backendInfo.routes) {
      const expectedFunction = getExpectedFunctionName(route.path, route.method);
      if (!frontendFunctions.includes(expectedFunction)) {
        missingFunctions.push({
          route: route.path,
          method: route.method,
          expectedFunction
        });
      }
    }

    if (missingFunctions.length > 0) {
      incompleteServices.push({
        module,
        missingFunctions,
        totalRoutes: backendInfo.routes.length,
        totalFunctions: frontendFunctions.length
      });
    }
  }
}

function getExpectedFunctionName(routePath, method) {
  if (!routePath) return 'unknown';
  
  // Convertir /api/sale/orders/:id en getSaleOrder
  const parts = routePath.split('/').filter(p => p && p !== 'api');
  const lastPart = parts[parts.length - 1] || parts[parts.length - 2] || 'unknown';
  
  // Gérer les paramètres
  const cleanPath = (lastPart || '').replace(/^:/, '');
  
  if (!cleanPath) return 'unknown';
  
  // Convertir en camelCase
  const camelCase = cleanPath
    .split('-')
    .map((word, index) => 
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');

  if (!camelCase) return 'unknown';

  // Ajouter le préfixe selon la méthode
  const capitalized = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  
  if (method === 'GET' && !lastPart.startsWith(':')) {
    return `get${capitalized}`;
  } else if (method === 'GET' && lastPart.startsWith(':')) {
    return `get${capitalized}ById`;
  } else if (method === 'POST') {
    return `create${capitalized}`;
  } else if (method === 'PUT') {
    return `update${capitalized}`;
  } else if (method === 'DELETE') {
    return `delete${capitalized}`;
  }
  
  return camelCase;
}

console.log('\n📊 Résultats de la vérification:\n');

if (missingServices.length > 0) {
  console.log('❌ Services frontend manquants:');
  missingServices.forEach(s => {
    console.log(`   - ${s.module} (${s.backendRoutes} routes backend)`);
  });
  console.log();
}

if (incompleteServices.length > 0) {
  console.log('⚠️  Services incomplets:');
  incompleteServices.forEach(s => {
    console.log(`   - ${s.module}: ${s.missingFunctions.length} fonctions manquantes sur ${s.totalRoutes} routes`);
    s.missingFunctions.slice(0, 3).forEach(f => {
      console.log(`     • ${f.expectedFunction} (${f.method} ${f.route})`);
    });
  });
  console.log();
}

if (missingServices.length === 0 && incompleteServices.length === 0) {
  console.log('✅ Tous les services sont complets!\n');
} else {
  console.log(`\n📝 Actions recommandées:`);
  console.log(`   - Ajouter ${missingServices.length} service(s) manquant(s)`);
  console.log(`   - Compléter ${incompleteServices.length} service(s) incomplet(s)`);
}

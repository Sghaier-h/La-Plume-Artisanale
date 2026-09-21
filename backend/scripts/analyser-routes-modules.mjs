/**
 * Script pour analyser les routes des modules et détecter les conflits
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, '..');

// Analyser les routes d'un fichier
function analyzeRouteFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const hasParams = /router\.(get|post|put|delete)\s*\(\s*['"]\/:/.test(content);
  const routes = [];
  
  // Extraire toutes les routes
  const routeMatches = content.matchAll(/router\.(get|post|put|delete)\s*\(\s*['"]([^'"]+)['"]/g);
  for (const match of routeMatches) {
    routes.push({
      method: match[1],
      path: match[2],
      hasParam: match[2].includes(':')
    });
  }
  
  return { hasParams, routes };
}

// Analyser les modules problématiques
const modules = ['ecommerce', 'pos', 'multisociete'];

for (const moduleName of modules) {
  const routesDir = path.join(backendDir, 'modules', moduleName, 'routes');
  
  if (!fs.existsSync(routesDir)) {
    console.log(`\n⚠️  Module ${moduleName}: routes/ n'existe pas`);
    continue;
  }
  
  const routeFiles = globSync('*.routes.js', { cwd: routesDir });
  
  console.log(`\n📦 Module: ${moduleName}`);
  console.log('='.repeat(60));
  
  for (const routeFile of routeFiles) {
    const filePath = path.join(routesDir, routeFile);
    const { hasParams, routes } = analyzeRouteFile(filePath);
    
    // Calculer le chemin API
    const routeFileName = routeFile.replace('.routes.js', '');
    let routePath_api;
    
    if (routeFileName.includes('_')) {
      const parts = routeFileName.split('_');
      const modulePart = parts[0];
      const resourcePart = parts.slice(1).join('_');
      const pluralResource = resourcePart.endsWith('e') ? resourcePart + 's' : 
                            resourcePart.endsWith('y') ? resourcePart.slice(0, -1) + 'ies' :
                            resourcePart + 's';
      routePath_api = `/api/${modulePart}/${pluralResource}`;
    } else if (routeFileName === moduleName) {
      routePath_api = `/api/${moduleName}`;
    } else {
      routePath_api = `/api/${moduleName}/${routeFileName}`;
    }
    
    const pathDepth = routePath_api.split('/').filter(s => s && s !== 'api').length;
    const hasParamsInPath = routePath_api.includes('/:');
    
    console.log(`\n  📄 ${routeFile}`);
    console.log(`     Chemin API: ${routePath_api}`);
    console.log(`     Profondeur: ${pathDepth}`);
    console.log(`     Paramètres dans chemin: ${hasParamsInPath}`);
    console.log(`     Routes définies: ${routes.length}`);
    
    routes.forEach(r => {
      console.log(`       ${r.method.toUpperCase()} ${r.path} ${r.hasParam ? '(avec param)' : ''}`);
    });
  }
}

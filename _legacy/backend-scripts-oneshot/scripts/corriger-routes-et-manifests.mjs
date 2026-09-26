/**
 * Script pour corriger les noms de contrôleurs dans les routes
 * et les chemins de modèles dans les manifests
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Fonction pour convertir un nom de classe en nom de fichier snake_case
const toSnakeCase = (str) => {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/Controller$/, '');
};

// Fonction pour obtenir le nom de fichier correct du contrôleur
const getControllerFileName = (controllerName) => {
  // Si c'est déjà en snake_case, retourner tel quel
  if (controllerName.includes('_')) {
    return controllerName.replace(/Controller$/, '') + '.controller.js';
  }
  
  // Convertir en snake_case
  const snakeCase = toSnakeCase(controllerName);
  return snakeCase + '.controller.js';
};

// Fonction pour corriger une route
const fixRoute = (routePath) => {
  const content = fs.readFileSync(routePath, 'utf8');
  let newContent = content;
  
  // Remplacer les imports de contrôleurs incorrects
  const controllerImportRegex = /from\s+['"]\.\.\/controllers\/([A-Z][a-zA-Z]*Controller)\.controller\.js['"]/g;
  
  newContent = newContent.replace(controllerImportRegex, (match, controllerName) => {
    const correctFileName = getControllerFileName(controllerName);
    return match.replace(controllerName + '.controller.js', correctFileName);
  });
  
  // Corriger le chemin du middleware si nécessaire (pour crm, inventory, quality)
  const moduleName = routePath.split(path.sep).slice(-3, -2)[0];
  if (['crm', 'inventory', 'quality'].includes(moduleName)) {
    // Vérifier si le chemin est incorrect
    if (newContent.includes("from 'D:\\") || newContent.includes('from "D:\\')) {
      newContent = newContent.replace(
        /from\s+['"]([^'"]*src\/middleware\/auth\.middleware\.js)['"]/g,
        "from '../../../src/middleware/auth.middleware.js'"
      );
    }
  }
  
  if (newContent !== content) {
    fs.writeFileSync(routePath, newContent, 'utf8');
    return true;
  }
  return false;
};

// Fonction pour corriger un manifest
const fixManifest = (manifestPath) => {
  const content = fs.readFileSync(manifestPath, 'utf8');
  let newContent = content;
  let changed = false;
  
  // Corriger les modèles qui sont juste "Name.js" au lieu de "models/Name.js"
  const modelRegex = /models:\s*\[([\s\S]*?)\]/;
  const match = content.match(modelRegex);
  
  if (match) {
    const modelsSection = match[1];
    const models = modelsSection
      .split(',')
      .map(m => m.trim().replace(/['"]/g, ''))
      .filter(m => m);
    
    const correctedModels = models.map(model => {
      // Si le modèle ne commence pas par "models/" et n'est pas un chemin complet
      if (!model.startsWith('models/') && !model.includes('/')) {
        // Vérifier si le fichier existe dans models/
        const moduleDir = path.dirname(manifestPath);
        const modelPath = path.join(moduleDir, 'models', model);
        if (fs.existsSync(modelPath)) {
          return `models/${model}`;
        }
      }
      return model;
    });
    
    if (JSON.stringify(models) !== JSON.stringify(correctedModels)) {
      const newModelsSection = correctedModels.map(m => `    '${m}'`).join(',\n');
      newContent = newContent.replace(
        modelRegex,
        `models: [\n${newModelsSection}\n  ]`
      );
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(manifestPath, newContent, 'utf8');
    return true;
  }
  return false;
};

async function fixAll() {
  console.log('🔧 Correction des routes et manifests\n');
  console.log('='.repeat(80));

  const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  let routesFixed = 0;
  let manifestsFixed = 0;

  for (const moduleName of modules) {
    const modulePath = path.join(modulesPath, moduleName);
    
    // Corriger les routes
    const routesPath = path.join(modulePath, 'routes');
    if (fs.existsSync(routesPath)) {
      const routeFiles = fs.readdirSync(routesPath, { recursive: true })
        .filter(f => f.endsWith('.routes.js'))
        .map(f => path.join(routesPath, f));
      
      for (const routeFile of routeFiles) {
        if (fixRoute(routeFile)) {
          console.log(`✅ Route corrigée: ${moduleName}/${path.relative(modulePath, routeFile)}`);
          routesFixed++;
        }
      }
    }
    
    // Corriger les routes à la racine du module (crm, inventory, quality)
    const rootRouteFiles = fs.readdirSync(modulePath)
      .filter(f => f.endsWith('.routes.js'))
      .map(f => path.join(modulePath, f));
    
    for (const routeFile of rootRouteFiles) {
      if (fixRoute(routeFile)) {
        console.log(`✅ Route corrigée: ${moduleName}/${path.basename(routeFile)}`);
        routesFixed++;
      }
    }
    
    // Corriger le manifest
    const manifestPath = path.join(modulePath, 'manifest.js');
    if (fs.existsSync(manifestPath)) {
      if (fixManifest(manifestPath)) {
        console.log(`✅ Manifest corrigé: ${moduleName}/manifest.js`);
        manifestsFixed++;
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 RÉSUMÉ DES CORRECTIONS\n');
  console.log('='.repeat(80));
  console.log(`✅ Routes corrigées: ${routesFixed}`);
  console.log(`✅ Manifests corrigés: ${manifestsFixed}`);
  console.log(`\n💡 Redémarrez le serveur pour voir les corrections.`);
  console.log('='.repeat(80));
}

fixAll().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

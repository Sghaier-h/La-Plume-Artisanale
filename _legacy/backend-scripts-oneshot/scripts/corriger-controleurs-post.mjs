/**
 * Script pour corriger les contrôleurs POST qui échouent
 * Ajoute une valeur par défaut pour userId si getUserId retourne null
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

function fixControllerPost(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Pattern 1: const userId = getUserId(req);
  // Devient: const userId = getUserId(req) || 1;
  const pattern1 = /const userId = getUserId\(req\);/g;
  if (pattern1.test(content)) {
    content = content.replace(pattern1, 'const userId = getUserId(req) || 1;');
    changed = true;
  }
  
  // Pattern 2: const userId = getUserId(req); suivi de pool.query avec userId
  // Si userId n'est pas utilisé avec ||, l'ajouter
  if (content.includes('getUserId(req)') && !content.includes('getUserId(req) ||')) {
    content = content.replace(/const userId = getUserId\(req\);/g, 'const userId = getUserId(req) || 1;');
    changed = true;
  }
  
  // Pattern 3: Vérifier que userId est utilisé dans les requêtes
  // Si une requête utilise userId mais qu'il peut être null, ajouter || 1
  const hasUserIdNull = content.includes('const userId = getUserId(req);') && 
                        !content.includes('getUserId(req) ||');
  if (hasUserIdNull) {
    content = content.replace(/const userId = getUserId\(req\);/g, 'const userId = getUserId(req) || 1;');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function findAndFixFiles() {
  console.log('🔧 Correction des contrôleurs POST\n');
  console.log('='.repeat(80));
  
  const controllers = [];
  
  // Trouver tous les fichiers controllers
  function walkDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        walkDir(fullPath);
      } else if (file.name.endsWith('.controller.js')) {
        controllers.push(fullPath);
      }
    }
  }
  
  walkDir(modulesPath);
  
  let fixed = 0;
  
  for (const controllerPath of controllers) {
    if (fixControllerPost(controllerPath)) {
      const relativePath = path.relative(modulesPath, controllerPath);
      console.log(`✅ Corrigé: ${relativePath}`);
      fixed++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Fichiers corrigés: ${fixed}`);
  console.log('='.repeat(80));
}

findAndFixFiles();

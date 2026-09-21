/**
 * Script pour corriger tous les appels à sendSuccess
 * Change l'ordre des paramètres pour correspondre à la nouvelle signature
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Nouvelle signature: sendSuccess(res, data, message, statusCode)
// Ancienne signature utilisée: sendSuccess(res, data, statusCode, message)

function fixSendSuccessCalls(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Pattern pour sendSuccess avec 4 paramètres (data, message, statusCode)
  // sendSuccess(res, data, 'message', 201)
  const pattern1 = /sendSuccess\(\s*res\s*,\s*([^,]+)\s*,\s*['"]([^'"]+)['"]\s*,\s*(\d+)\s*\)/g;
  
  content = content.replace(pattern1, (match, data, message, statusCode) => {
    changed = true;
    return `sendSuccess(res, ${data.trim()}, '${message}', ${statusCode})`;
  });
  
  // Pattern pour sendSuccess avec 3 paramètres (data, message) - déjà correct
  // sendSuccess(res, data, 'message')
  // Pas besoin de changer
  
  // Pattern pour sendSuccess avec 2 paramètres (data) - déjà correct
  // sendSuccess(res, data)
  // Pas besoin de changer
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function findAndFixFiles() {
  console.log('🔧 Correction des appels sendSuccess\n');
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
    if (fixSendSuccessCalls(controllerPath)) {
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

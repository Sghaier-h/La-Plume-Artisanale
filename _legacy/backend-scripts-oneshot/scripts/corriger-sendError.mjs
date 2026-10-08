/**
 * Script pour corriger tous les appels à sendError
 * Change l'ordre des paramètres pour correspondre à la nouvelle signature
 * sendError(res, message, statusCode, code, details)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

function fixSendErrorCalls(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Pattern 1: sendError(res, 'message', 404)
  // Devient: sendError(res, 'message', 404)
  const pattern1 = /sendError\(\s*res\s*,\s*['"]([^'"]+)['"]\s*,\s*(\d+)\s*\)/g;
  content = content.replace(pattern1, (match, message, statusCode) => {
    changed = true;
    return `sendError(res, '${message}', ${statusCode})`;
  });
  
  // Pattern 2: sendError(res, HTTP_STATUS.NOT_FOUND, 'message')
  // Devient: sendError(res, 'message', HTTP_STATUS.NOT_FOUND)
  const pattern2 = /sendError\(\s*res\s*,\s*(HTTP_STATUS\.\w+)\s*,\s*['"]([^'"]+)['"]\s*\)/g;
  content = content.replace(pattern2, (match, statusCode, message) => {
    changed = true;
    return `sendError(res, '${message}', ${statusCode})`;
  });
  
  // Pattern 3: sendError(res, HTTP_STATUS.NOT_FOUND, 'message', 'CODE')
  // Devient: sendError(res, 'message', HTTP_STATUS.NOT_FOUND, 'CODE')
  const pattern3 = /sendError\(\s*res\s*,\s*(HTTP_STATUS\.\w+)\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;
  content = content.replace(pattern3, (match, statusCode, message, code) => {
    changed = true;
    return `sendError(res, '${message}', ${statusCode}, '${code}')`;
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function findAndFixFiles() {
  console.log('🔧 Correction des appels sendError\n');
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
    if (fixSendErrorCalls(controllerPath)) {
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

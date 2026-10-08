/**
 * Script pour corriger tous les contrôleurs qui utilisent created_at au lieu de date_creation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Mapping des tables et leurs colonnes de date
const tableDateMapping = {
  'utilisateurs': { created: 'date_creation', updated: 'date_modification' },
  'clients': { created: 'date_creation', updated: 'date_modification' },
  'fournisseurs': { created: 'date_creation', updated: 'date_modification' },
  'factures': { created: 'created_at', updated: 'updated_at' },
  'employes': { created: 'created_at', updated: 'updated_at' }
};

function fixControllerDates(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Détecter la table utilisée dans le fichier
  let tableName = null;
  for (const [table, mapping] of Object.entries(tableDateMapping)) {
    if (content.includes(`FROM ${table}`) || content.includes(`INTO ${table}`) || content.includes(`UPDATE ${table}`)) {
      tableName = table;
      break;
    }
  }
  
  if (!tableName) {
    return false;
  }
  
  const mapping = tableDateMapping[tableName];
  
  // Remplacer created_at par date_creation si nécessaire
  if (mapping.created === 'date_creation' && content.includes('created_at')) {
    content = content.replace(/created_at/g, 'date_creation');
    changed = true;
  }
  
  // Remplacer updated_at par date_modification si nécessaire
  if (mapping.updated === 'date_modification' && content.includes('updated_at')) {
    content = content.replace(/updated_at/g, 'date_modification');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function findAndFixControllers() {
  console.log('🔧 Correction des colonnes de date dans les contrôleurs\n');
  console.log('='.repeat(80));
  
  const controllers = [];
  
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
    if (fixControllerDates(controllerPath)) {
      const relativePath = path.relative(modulesPath, controllerPath);
      console.log(`✅ Corrigé: ${relativePath}`);
      fixed++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Fichiers corrigés: ${fixed}`);
  console.log('='.repeat(80));
}

findAndFixControllers();

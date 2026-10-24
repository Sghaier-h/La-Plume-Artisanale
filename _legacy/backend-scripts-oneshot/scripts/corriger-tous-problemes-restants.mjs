/**
 * Script pour corriger automatiquement tous les problèmes restants
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Mapping des problèmes identifiés
const corrections = {
  // Problème 1: product/pricelists - erreur SQL "null"
  'product/controllers/product_pricelist.controller.js': {
    fix: (content) => {
      // Vérifier si getTableName retourne null
      if (content.includes('getTableName(\'product.pricelist\')')) {
        // Remplacer par le nom de table direct
        content = content.replace(
          /const tableName = getTableName\('product\.pricelist'\);/g,
          "const tableName = 'listes_prix';"
        );
        content = content.replace(
          /const idField = getIdField\('product\.pricelist'\);/g,
          "const idField = 'id_liste_prix';"
        );
      }
      return content;
    }
  },
  
  // Problème 2: mrp/boms - table articles n'existe pas
  'mrp/controllers/mrp_bom.controller.js': {
    fix: (content) => {
      // Remplacer 'articles' par 'articles_catalogue' ou vérifier la table
      content = content.replace(/FROM articles\b/g, 'FROM articles_catalogue');
      content = content.replace(/INTO articles\b/g, 'INTO articles_catalogue');
      content = content.replace(/UPDATE articles\b/g, 'UPDATE articles_catalogue');
      content = content.replace(/JOIN articles\b/g, 'JOIN articles_catalogue');
      return content;
    }
  }
};

// Problèmes spécifiques par module
const moduleSpecificFixes = {
  'suivi-fabrication': {
    checkTable: 'suivi_fabrication',
    createTable: `
      CREATE TABLE IF NOT EXISTS suivi_fabrication (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER
      );
    `
  },
  'utilisateurs': {
    // Déjà corrigé mais vérifier
    checkColumns: ['date_creation', 'date_modification']
  },
  'taches': {
    checkTable: 'taches',
    // La table existe probablement, vérifier les colonnes
  },
  'purchase-requests': {
    checkTable: 'demandes_achat',
    // Vérifier si la table existe
  }
};

function fixControllerFile(filePath, relativePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Appliquer les corrections spécifiques
  if (corrections[relativePath]) {
    const newContent = corrections[relativePath].fix(content);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }
  
  // Corrections générales
  // 1. Remplacer les références à 'articles' par 'articles_catalogue' si nécessaire
  if (content.includes('FROM articles') && !content.includes('articles_catalogue')) {
    // Vérifier si c'est dans un contexte MRP ou product
    if (relativePath.includes('mrp') || relativePath.includes('product')) {
      content = content.replace(/FROM articles\b/g, 'FROM articles_catalogue');
      content = content.replace(/INTO articles\b/g, 'INTO articles_catalogue');
      content = content.replace(/UPDATE articles\b/g, 'UPDATE articles_catalogue');
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

function findAndFixControllers() {
  console.log('🔧 Correction de tous les problèmes restants\n');
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
    const relativePath = path.relative(modulesPath, controllerPath);
    
    if (fixControllerFile(controllerPath, relativePath)) {
      console.log(`✅ Corrigé: ${relativePath}`);
      fixed++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Fichiers corrigés: ${fixed}`);
  console.log('='.repeat(80));
}

findAndFixControllers();

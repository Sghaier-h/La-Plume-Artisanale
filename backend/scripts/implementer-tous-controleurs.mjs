/**
 * Script pour implémenter automatiquement TOUS les contrôleurs génériques
 * Version directe avec remplacement précis
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Fonction pour extraire table et idField depuis le code
function extractTableInfo(content) {
  const selectMatch = content.match(/SELECT\s+\*\s+FROM\s+(\w+)/i);
  const whereMatch = content.match(/WHERE\s+(\w+)\s*=\s*\$1/i);
  
  if (selectMatch && whereMatch) {
    return {
      table: selectMatch[1],
      idField: whereMatch[1]
    };
  }
  
  return null;
}

// Fonction pour extraire le nom de la fonction
function extractFunctionName(content, operation) {
  const patterns = [
    new RegExp(`export\\s+const\\s+(\\w*${operation}\\w*)\\s*=\\s*async`, 'i'),
    new RegExp(`export\\s+const\\s+(\\w+)\\s*=\\s*async[^}]*${operation}`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Templates
function getCreateImplementation(table, idField, funcName) {
  return `export const ${funcName} = async (req, res) => {
  try {
    const userId = getUserId(req);
    const data = req.body;
    
    // Filtrer les champs non autorisés
    const excludedFields = ['${idField}', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à créer', 400);
    }
    
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    
    const query = 'INSERT INTO ${table} (' + fields.join(', ') + ', created_at, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, '${funcName}');
  }
};`;
}

function getUpdateImplementation(table, idField, funcName) {
  return `export const ${funcName} = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const data = req.body;
    
    // Filtrer les champs non autorisés
    const excludedFields = ['${idField}', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', 400);
    }
    
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    
    const query = 'UPDATE ${table} SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE ${idField} = $' + (values.length + 2) + ' RETURNING *';
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, '${funcName}');
  }
};`;

function getDeleteImplementation(table, idField, funcName) {
  return `export const ${funcName} = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    
    // Essayer d'abord la suppression logique (champ active)
    const checkActiveQuery = 'SELECT column_name FROM information_schema.columns WHERE table_name = \\'${table}\\' AND column_name = \\'active\\'';
    
    let query;
    let params;
    
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      
      if (hasActiveField) {
        query = 'UPDATE ${table} SET active = false, updated_at = NOW(), updated_by = $1 WHERE ${idField} = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM ${table} WHERE ${idField} = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM ${table} WHERE ${idField} = $1 RETURNING *';
      params = [id];
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }
    
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, '${funcName}');
  }
};`;

// Fonction pour remplacer une fonction spécifique
function replaceFunctionImplementation(content, funcName, newImplementation) {
  // Chercher la fonction complète avec son commentaire
  const functionPattern = new RegExp(
    `(//[^\\n]*\\n)?export\\s+const\\s+${funcName}\\s*=\\s*async\\s*\\([^)]*\\)\\s*\\{[^}]*return\\s+sendError\\(res,\\s*['"]Non implémenté['"],\\s*501\\);[^}]*\\}`,
    's'
  );
  
  if (functionPattern.test(content)) {
    const match = content.match(functionPattern);
    const comment = match[1] || '';
    return content.replace(functionPattern, comment + newImplementation);
  }
  
  // Pattern alternatif sans commentaire
  const simplePattern = new RegExp(
    `export\\s+const\\s+${funcName}\\s*=\\s*async\\s*\\([^)]*\\)\\s*\\{[^}]*return\\s+sendError\\(res,\\s*['"]Non implémenté['"],\\s*501\\);[^}]*\\}`,
    's'
  );
  
  if (simplePattern.test(content)) {
    return content.replace(simplePattern, newImplementation);
  }
  
  return null;
}

console.log('🚀 Implémentation automatique de TOUS les contrôleurs génériques\n');

// Trouver tous les contrôleurs
const controllersToFix = [];
function findControllers(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findControllers(filePath);
    } else if (file.endsWith('.controller.js')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (/Non implémenté|501|TODO.*Implémenter/i.test(content)) {
          const moduleName = filePath.split(path.sep).slice(-3, -2)[0];
          controllersToFix.push({ path: filePath, content, moduleName });
        }
      } catch (error) {
        // Ignorer les erreurs de lecture
      }
    }
  }
}

findControllers(modulesPath);

console.log(`📦 ${controllersToFix.length} contrôleurs à améliorer\n`);

let fixed = 0;
let skipped = 0;
const errors = [];
const fixedModules = [];

for (const { path: controllerPath, content, moduleName } of controllersToFix) {
  try {
    const tableInfo = extractTableInfo(content);
    
    if (!tableInfo) {
      skipped++;
      console.log(`⚠️  ${moduleName} - Impossible d'extraire table/idField`);
      continue;
    }
    
    const { table, idField } = tableInfo;
    let newContent = content;
    let modified = false;
    
    // Traiter CREATE
    if (/create.*Non implémenté|create.*501/i.test(content)) {
      const funcName = extractFunctionName(content, 'create') || 'create';
      const createImpl = getCreateImplementation(table, idField, funcName);
      const replaced = replaceFunctionImplementation(newContent, funcName, createImpl);
      if (replaced) {
        newContent = replaced;
        modified = true;
      }
    }
    
    // Traiter UPDATE
    if (/update.*Non implémenté|update.*501/i.test(content)) {
      const funcName = extractFunctionName(content, 'update') || 'update';
      const updateImpl = getUpdateImplementation(table, idField, funcName);
      const replaced = replaceFunctionImplementation(newContent, funcName, updateImpl);
      if (replaced) {
        newContent = replaced;
        modified = true;
      }
    }
    
    // Traiter DELETE
    if (/delete.*Non implémenté|delete.*501/i.test(content)) {
      const funcName = extractFunctionName(content, 'delete') || 'delete';
      const deleteImpl = getDeleteImplementation(table, idField, funcName);
      const replaced = replaceFunctionImplementation(newContent, funcName, deleteImpl);
      if (replaced) {
        newContent = replaced;
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(controllerPath, newContent, 'utf8');
      fixed++;
      fixedModules.push(moduleName);
      console.log(`✅ ${moduleName} - Amélioré`);
    } else {
      skipped++;
      console.log(`⚠️  ${moduleName} - Aucune fonction remplacée`);
    }
  } catch (error) {
    errors.push({ path: controllerPath, error: error.message });
    console.log(`❌ ${moduleName} - Erreur: ${error.message}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 RÉSUMÉ');
console.log('='.repeat(60));
console.log(`✅ Contrôleurs améliorés: ${fixed}`);
console.log(`⚠️  Contrôleurs ignorés: ${skipped}`);
console.log(`❌ Erreurs: ${errors.length}`);

if (fixedModules.length > 0) {
  console.log('\n✅ Modules améliorés:');
  fixedModules.forEach(m => console.log(`   - ${m}`));
}

if (errors.length > 0) {
  console.log('\n❌ Erreurs:');
  errors.slice(0, 10).forEach(e => {
    console.log(`   - ${path.basename(e.path)}: ${e.error}`);
  });
}

console.log('\n💡 Note: Vérifiez les tables et ID fields dans la base de données.');
console.log('   Certains contrôleurs peuvent nécessiter des ajustements manuels.\n');

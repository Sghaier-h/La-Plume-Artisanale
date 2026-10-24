/**
 * Script final pour implémenter automatiquement TOUS les contrôleurs génériques
 * Version simplifiée et robuste
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Fonction pour extraire table et idField
function extractTableInfo(content) {
  const selectMatch = content.match(/SELECT\s+\*\s+FROM\s+(\w+)/i);
  const whereMatch = content.match(/WHERE\s+(\w+)\s*=\s*\$1/i);
  if (selectMatch && whereMatch) {
    return { table: selectMatch[1], idField: whereMatch[1] };
  }
  return null;
}

// Templates d'implémentation (sans template strings imbriqués)
function getCreateImplementation(table, idField, funcName) {
  return 'export const ' + funcName + ' = async (req, res) => {\n' +
    '  try {\n' +
    '    const userId = getUserId(req);\n' +
    '    const data = req.body;\n' +
    '    const excludedFields = [\'' + idField + '\', \'created_at\', \'updated_at\', \'created_by\', \'updated_by\'];\n' +
    '    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));\n' +
    '    const fields = allowedFields;\n' +
    '    const values = fields.map(f => data[f]);\n' +
    '    if (fields.length === 0) return sendError(res, \'Aucune donnée à créer\', 400);\n' +
    '    const placeholders = values.map((_, i) => \'$\' + (i + 1)).join(\', \');\n' +
    '    const query = \'INSERT INTO ' + table + ' (\' + fields.join(\', \') + \', created_at, created_by) VALUES (\' + placeholders + \', NOW(), $\' + (values.length + 1) + \') RETURNING *\';\n' +
    '    const result = await pool.query(query, [...values, userId]);\n' +
    '    return sendSuccess(res, result.rows[0], \'Enregistrement créé avec succès\', 201);\n' +
    '  } catch (error) {\n' +
    '    return handleError(res, error, \'' + funcName + '\');\n' +
    '  }\n' +
    '};';
}

function getUpdateImplementation(table, idField, funcName) {
  return 'export const ' + funcName + ' = async (req, res) => {\n' +
    '  try {\n' +
    '    const { id } = req.params;\n' +
    '    const userId = getUserId(req);\n' +
    '    const data = req.body;\n' +
    '    const excludedFields = [\'' + idField + '\', \'created_at\', \'created_by\'];\n' +
    '    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));\n' +
    '    const fields = allowedFields;\n' +
    '    const values = fields.map(f => data[f]);\n' +
    '    if (fields.length === 0) return sendError(res, \'Aucune donnée à mettre à jour\', 400);\n' +
    '    const setClause = fields.map((field, i) => field + \' = $\' + (i + 1)).join(\', \');\n' +
    '    const query = \'UPDATE ' + table + ' SET \' + setClause + \', updated_at = NOW(), updated_by = $\' + (values.length + 1) + \' WHERE ' + idField + ' = $\' + (values.length + 2) + \' RETURNING *\';\n' +
    '    const result = await pool.query(query, [...values, userId, id]);\n' +
    '    if (result.rows.length === 0) return sendError(res, \'Enregistrement non trouvé\', 404);\n' +
    '    return sendSuccess(res, result.rows[0], \'Enregistrement mis à jour avec succès\');\n' +
    '  } catch (error) {\n' +
    '    return handleError(res, error, \'' + funcName + '\');\n' +
    '  }\n' +
    '};';
}

function getDeleteImplementation(table, idField, funcName) {
  return 'export const ' + funcName + ' = async (req, res) => {\n' +
    '  try {\n' +
    '    const { id } = req.params;\n' +
    '    const userId = getUserId(req);\n' +
    '    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = \'' + table + '\' AND column_name = \'active\'";\n' +
    '    let query, params;\n' +
    '    try {\n' +
    '      const checkResult = await pool.query(checkActiveQuery);\n' +
    '      const hasActiveField = checkResult.rows.length > 0;\n' +
    '      if (hasActiveField) {\n' +
    '        query = \'UPDATE ' + table + ' SET active = false, updated_at = NOW(), updated_by = $1 WHERE ' + idField + ' = $2 RETURNING *\';\n' +
    '        params = [userId, id];\n' +
    '      } else {\n' +
    '        query = \'DELETE FROM ' + table + ' WHERE ' + idField + ' = $1 RETURNING *\';\n' +
    '        params = [id];\n' +
    '      }\n' +
    '    } catch (checkError) {\n' +
    '      query = \'DELETE FROM ' + table + ' WHERE ' + idField + ' = $1 RETURNING *\';\n' +
    '      params = [id];\n' +
    '    }\n' +
    '    const result = await pool.query(query, params);\n' +
    '    if (result.rows.length === 0) return sendError(res, \'Enregistrement non trouvé\', 404);\n' +
    '    return sendSuccess(res, null, \'Enregistrement supprimé avec succès\');\n' +
    '  } catch (error) {\n' +
    '    return handleError(res, error, \'' + funcName + '\');\n' +
    '  }\n' +
    '};';
}

// Fonction pour remplacer une fonction
function replaceFunction(content, funcName, operation, table, idField) {
  // Pattern simple pour trouver la fonction
  const pattern = new RegExp(
    '(//[^\\n]*\\n)?export\\s+const\\s+' + funcName + '\\s*=\\s*async\\s*\\([^)]*\\)\\s*\\{[^}]*?return\\s+sendError\\(res,\\s*[\'"]Non implémenté[\'"],\\s*501\\);[^}]*?\\}',
    's'
  );
  
  if (!pattern.test(content)) {
    return { content, replaced: false };
  }
  
  let newImpl;
  if (operation === 'create') {
    newImpl = getCreateImplementation(table, idField, funcName);
  } else if (operation === 'update') {
    newImpl = getUpdateImplementation(table, idField, funcName);
  } else if (operation === 'delete') {
    newImpl = getDeleteImplementation(table, idField, funcName);
  }
  
  const match = content.match(pattern);
  const comment = match && match[1] ? match[1] : '';
  
  const newContent = content.replace(pattern, comment + newImpl);
  
  return { content: newContent, replaced: newContent !== content };
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
        // Ignorer les erreurs
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
const details = [];

for (const { path: controllerPath, content, moduleName } of controllersToFix) {
  try {
    const tableInfo = extractTableInfo(content);
    
    if (!tableInfo) {
      skipped++;
      continue;
    }
    
    const { table, idField } = tableInfo;
    let newContent = content;
    let modified = false;
    const operations = [];
    
    // Traiter CREATE
    if (/create.*Non implémenté|create.*501/i.test(content)) {
      const funcNameMatch = content.match(/export\s+const\s+(\w*create\w*)\s*=\s*async/i);
      if (funcNameMatch) {
        const funcName = funcNameMatch[1];
        const result = replaceFunction(newContent, funcName, 'create', table, idField);
        if (result.replaced) {
          newContent = result.content;
          modified = true;
          operations.push('CREATE');
        }
      }
    }
    
    // Traiter UPDATE
    if (/update.*Non implémenté|update.*501/i.test(content)) {
      const funcNameMatch = content.match(/export\s+const\s+(\w*update\w*)\s*=\s*async/i);
      if (funcNameMatch) {
        const funcName = funcNameMatch[1];
        const result = replaceFunction(newContent, funcName, 'update', table, idField);
        if (result.replaced) {
          newContent = result.content;
          modified = true;
          operations.push('UPDATE');
        }
      }
    }
    
    // Traiter DELETE
    if (/delete.*Non implémenté|delete.*501/i.test(content)) {
      const funcNameMatch = content.match(/export\s+const\s+(\w*delete\w*)\s*=\s*async/i);
      if (funcNameMatch) {
        const funcName = funcNameMatch[1];
        const result = replaceFunction(newContent, funcName, 'delete', table, idField);
        if (result.replaced) {
          newContent = result.content;
          modified = true;
          operations.push('DELETE');
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(controllerPath, newContent, 'utf8');
      fixed++;
      fixedModules.push(moduleName);
      details.push({ module: moduleName, operations: operations.join(', ') });
      console.log(`✅ ${moduleName} - ${operations.join(', ')}`);
    } else {
      skipped++;
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
  details.forEach(d => {
    console.log(`   - ${d.module}: ${d.operations}`);
  });
}

if (errors.length > 0) {
  console.log('\n❌ Erreurs:');
  errors.slice(0, 10).forEach(e => {
    console.log(`   - ${path.basename(e.path)}: ${e.error}`);
  });
}

console.log('\n💡 Note: Vérifiez les tables et ID fields dans la base de données.');
console.log('   Certains contrôleurs peuvent nécessiter des ajustements manuels.\n');

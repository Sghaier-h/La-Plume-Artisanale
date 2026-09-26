/**
 * Script pour implémenter directement les contrôleurs génériques
 * Version avec remplacement ligne par ligne
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

// Fonction pour extraire le nom de la fonction
function getFunctionName(content, operation) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`export const`) && lines[i].includes(operation)) {
      const match = lines[i].match(/export\s+const\s+(\w+)/);
      if (match) return match[1];
    }
  }
  return operation;
}

console.log('🚀 Implémentation directe des contrôleurs génériques\n');

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
      } catch (error) {}
    }
  }
}

findControllers(modulesPath);
console.log(`📦 ${controllersToFix.length} contrôleurs trouvés\n`);

let fixed = 0;
const fixedModules = [];

for (const { path: controllerPath, content, moduleName } of controllersToFix) {
  try {
    const tableInfo = extractTableInfo(content);
    if (!tableInfo) {
      console.log(`⚠️  ${moduleName} - Impossible d'extraire table/idField`);
      continue;
    }
    
    const { table, idField } = tableInfo;
    let newContent = content;
    let modified = false;
    
    // Remplacer CREATE
    const createPattern = new RegExp(
      `(export\\s+const\\s+\\w*create\\w*\\s*=\\s*async\\s*\\([^)]*\\)\\s*\\{[^}]*?)try\\s*\\{[^}]*?getUserId\\(req\\);[^}]*?const\\s+data\\s*=\\s*req\\.body;[^}]*?//\\s*TODO[^}]*?return\\s+sendError\\(res,\\s*['"]Non implémenté['"],\\s*501\\);[^}]*?\\}[^}]*?catch[^}]*?\\}`,
      's'
    );
    
    if (createPattern.test(newContent)) {
      const funcName = getFunctionName(newContent, 'create');
      const createImpl = `
export const ${funcName} = async (req, res) => {
  try {
    const userId = getUserId(req);
    const data = req.body;
    const excludedFields = ['${idField}', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO ${table} (' + fields.join(', ') + ', created_at, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, '${funcName}');
  }
};`;
      newContent = newContent.replace(createPattern, createImpl);
      modified = true;
    }
    
    // Remplacer UPDATE
    const updatePattern = new RegExp(
      `(export\\s+const\\s+\\w*update\\w*\\s*=\\s*async\\s*\\([^)]*\\)\\s*\\{[^}]*?)try\\s*\\{[^}]*?const\\s+\\{\\s*id\\s*\\}\\s*=\\s*req\\.params;[^}]*?getUserId\\(req\\);[^}]*?const\\s+data\\s*=\\s*req\\.body;[^}]*?//\\s*TODO[^}]*?return\\s+sendError\\(res,\\s*['"]Non implémenté['"],\\s*501\\);[^}]*?\\}[^}]*?catch[^}]*?\\}`,
      's'
    );
    
    if (updatePattern.test(newContent)) {
      const funcName = getFunctionName(newContent, 'update');
      const updateImpl = `
export const ${funcName} = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const data = req.body;
    const excludedFields = ['${idField}', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE ${table} SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE ${idField} = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, '${funcName}');
  }
};`;
      newContent = newContent.replace(updatePattern, updateImpl);
      modified = true;
    }
    
    // Remplacer DELETE
    const deletePattern = new RegExp(
      `(export\\s+const\\s+\\w*delete\\w*\\s*=\\s*async\\s*\\([^)]*\\)\\s*\\{[^}]*?)try\\s*\\{[^}]*?const\\s+\\{\\s*id\\s*\\}\\s*=\\s*req\\.params;[^}]*?//\\s*TODO[^}]*?return\\s+sendError\\(res,\\s*['"]Non implémenté['"],\\s*501\\);[^}]*?\\}[^}]*?catch[^}]*?\\}`,
      's'
    );
    
    if (deletePattern.test(newContent)) {
      const funcName = getFunctionName(newContent, 'delete');
      const deleteImpl = `
export const ${funcName} = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = 'active'";
    let query, params;
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
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, '${funcName}');
  }
};`;
      newContent = newContent.replace(deletePattern, deleteImpl);
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(controllerPath, newContent, 'utf8');
      fixed++;
      fixedModules.push(moduleName);
      console.log(`✅ ${moduleName}`);
    }
  } catch (error) {
    console.log(`❌ ${moduleName} - Erreur: ${error.message}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log(`✅ Contrôleurs améliorés: ${fixed}`);
if (fixedModules.length > 0) {
  console.log('\nModules améliorés:');
  fixedModules.forEach(m => console.log(`   - ${m}`));
}
console.log();

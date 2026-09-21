/**
 * Script V5 - Implémentation avec remplacement ligne par ligne
 * Version finale et robuste
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Extraire table et idField
function extractTableInfo(content) {
  const selectMatch = content.match(/SELECT\s+\*\s+FROM\s+(\w+)/i);
  const whereMatch = content.match(/WHERE\s+(\w+)\s*=\s*\$1/i);
  if (selectMatch && whereMatch) {
    return { table: selectMatch[1], idField: whereMatch[1] };
  }
  return null;
}

// Trouver le nom de fonction
function getFuncName(content, operation) {
  const regex = new RegExp(`export\\s+const\\s+(\\w*${operation}\\w*)\\s*=`, 'i');
  const match = content.match(regex);
  return match ? match[1] : null;
}

// Remplacer une fonction en analysant ligne par ligne
function replaceFunction(content, funcName, newImpl) {
  const lines = content.split('\n');
  const newLines = [];
  let i = 0;
  let replaced = false;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Si on trouve la déclaration de la fonction
    if (line.includes(`export const ${funcName}`)) {
      // Vérifier qu'elle contient "Non implémenté"
      let funcContent = line;
      let braceCount = 0;
      let startIdx = i;
      let endIdx = -1;
      let hasNonImpl = false;
      
      // Compter les accolades pour trouver la fin
      for (let j = i; j < lines.length; j++) {
        const currentLine = lines[j];
        funcContent += '\n' + currentLine;
        
        for (const char of currentLine) {
          if (char === '{') braceCount++;
          if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              endIdx = j;
              break;
            }
          }
        }
        
        if (endIdx !== -1) break;
      }
      
      // Vérifier si la fonction contient "Non implémenté"
      if (funcContent.includes('Non implémenté') || funcContent.includes('501')) {
        // Ajouter le commentaire si présent
        if (i > 0 && lines[i - 1].trim().startsWith('//')) {
          newLines.push(lines[i - 1]);
        }
        
        // Ajouter la nouvelle implémentation
        newLines.push(...newImpl.split('\n'));
        replaced = true;
        i = endIdx + 1;
        continue;
      }
    }
    
    newLines.push(line);
    i++;
  }
  
  return { content: newLines.join('\n'), replaced };
}

// Templates
function createImpl(table, idField, funcName) {
  return `export const ${funcName} = async (req, res) => {
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
}

function updateImpl(table, idField, funcName) {
  return `export const ${funcName} = async (req, res) => {
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
}

function deleteImpl(table, idField, funcName) {
  return `export const ${funcName} = async (req, res) => {
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
}

console.log('🚀 Implémentation automatique de TOUS les contrôleurs génériques (V5)\n');

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
console.log(`📦 ${controllersToFix.length} contrôleurs à améliorer\n`);

let fixed = 0, skipped = 0;
const errors = [], fixedModules = [], details = [];

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
    
    // CREATE
    if (content.includes('create') && (content.includes('Non implémenté') || content.includes('501'))) {
      const funcName = getFuncName(content, 'create');
      if (funcName) {
        const result = replaceFunction(newContent, funcName, createImpl(table, idField, funcName));
        if (result.replaced) {
          newContent = result.content;
          modified = true;
          operations.push('CREATE');
        }
      }
    }
    
    // UPDATE
    if (content.includes('update') && (content.includes('Non implémenté') || content.includes('501'))) {
      const funcName = getFuncName(content, 'update');
      if (funcName) {
        const result = replaceFunction(newContent, funcName, updateImpl(table, idField, funcName));
        if (result.replaced) {
          newContent = result.content;
          modified = true;
          operations.push('UPDATE');
        }
      }
    }
    
    // DELETE
    if (content.includes('delete') && (content.includes('Non implémenté') || content.includes('501'))) {
      const funcName = getFuncName(content, 'delete');
      if (funcName) {
        const result = replaceFunction(newContent, funcName, deleteImpl(table, idField, funcName));
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
  details.forEach(d => console.log(`   - ${d.module}: ${d.operations}`));
}

if (errors.length > 0) {
  console.log('\n❌ Erreurs:');
  errors.slice(0, 10).forEach(e => console.log(`   - ${path.basename(e.path)}: ${e.error}`));
}

console.log('\n');

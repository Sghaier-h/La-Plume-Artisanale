/**
 * Script amélioré pour implémenter automatiquement TOUS les contrôleurs génériques
 * Version robuste avec remplacement ligne par ligne
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Fonction pour extraire table et idField depuis le code
function extractTableInfo(content) {
  // Chercher dans SELECT ... FROM table
  const selectMatch = content.match(/SELECT\s+\*\s+FROM\s+(\w+)/i);
  // Chercher dans WHERE id_field = $1
  const whereMatch = content.match(/WHERE\s+(\w+)\s*=\s*\$1/i);
  
  if (selectMatch && whereMatch) {
    return {
      table: selectMatch[1],
      idField: whereMatch[1]
    };
  }
  
  return null;
}

// Fonction pour extraire le nom de la fonction depuis une ligne
function extractFunctionName(line) {
  const match = line.match(/export\s+const\s+(\w+)\s*=/);
  return match ? match[1] : null;
}

// Fonction pour trouver les indices de début et fin d'une fonction
function findFunctionBounds(lines, startIndex) {
  let braceCount = 0;
  let start = -1;
  let end = -1;
  let inFunction = false;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    // Compter les accolades
    for (const char of line) {
      if (char === '{') {
        if (!inFunction) {
          inFunction = true;
          start = i;
        }
        braceCount++;
      }
      if (char === '}') {
        braceCount--;
        if (braceCount === 0 && inFunction) {
          end = i;
          return { start, end };
        }
      }
    }
  }
  
  return { start: -1, end: -1 };
}

// Templates d'implémentation
function getCreateImplementation(table, idField, funcName) {
  return `export const ${funcName} = async (req, res) => {
  try {
    const userId = getUserId(req);
    const data = req.body;
    
    const excludedFields = ['${idField}', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à créer', 400);
    }
    
    const placeholders = values.map((_, i) => \`$\${i + 1}\`).join(', ');
    
    const query = \`
      INSERT INTO ${table} (\${fields.join(', ')}, created_at, created_by)
      VALUES (\${placeholders}, NOW(), $\${values.length + 1})
      RETURNING *
    \`;
    
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
    
    const excludedFields = ['${idField}', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', 400);
    }
    
    const setClause = fields.map((field, i) => \`\${field} = $\${i + 1}\`).join(', ');
    
    const query = \`
      UPDATE ${table}
      SET \${setClause}, updated_at = NOW(), updated_by = $\${values.length + 1}
      WHERE ${idField} = $\${values.length + 2}
      RETURNING *
    \`;
    
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
    
    const checkActiveQuery = \`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${table}' AND column_name = 'active'
    \`;
    
    let query;
    let params;
    
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      
      if (hasActiveField) {
        query = \`
          UPDATE ${table}
          SET active = false, updated_at = NOW(), updated_by = $1
          WHERE ${idField} = $2
          RETURNING *
        \`;
        params = [userId, id];
      } else {
        query = \`
          DELETE FROM ${table}
          WHERE ${idField} = $1
          RETURNING *
        \`;
        params = [id];
      }
    } catch (checkError) {
      query = \`
        DELETE FROM ${table}
        WHERE ${idField} = $1
        RETURNING *
      \`;
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

// Fonction principale pour remplacer une fonction dans le contenu
function replaceFunctionInContent(content, funcName, operation, table, idField) {
  const lines = content.split('\n');
  const newLines = [];
  let i = 0;
  let replaced = false;
  
  while (i < lines.length) {
    const line = lines[i];
    const extractedFuncName = extractFunctionName(line);
    
    // Si c'est la fonction qu'on cherche et qu'elle contient "Non implémenté"
    if (extractedFuncName === funcName && 
        (line.includes('create') || line.includes('update') || line.includes('delete')) &&
        content.substring(content.indexOf(line), content.indexOf(line) + 500).includes('Non implémenté')) {
      
      // Trouver les limites de la fonction
      const bounds = findFunctionBounds(lines, i);
      
      if (bounds.start !== -1 && bounds.end !== -1) {
        // Vérifier que la fonction contient bien "Non implémenté"
        const functionContent = lines.slice(bounds.start, bounds.end + 1).join('\n');
        
        if (functionContent.includes('Non implémenté') || functionContent.includes('501')) {
          // Ajouter le commentaire si présent
          if (i > 0 && lines[i - 1].trim().startsWith('//')) {
            newLines.push(lines[i - 1]);
          }
          
          // Ajouter la nouvelle implémentation
          let newImpl;
          if (operation === 'create') {
            newImpl = getCreateImplementation(table, idField, funcName);
          } else if (operation === 'update') {
            newImpl = getUpdateImplementation(table, idField, funcName);
          } else if (operation === 'delete') {
            newImpl = getDeleteImplementation(table, idField, funcName);
          }
          
          newLines.push(...newImpl.split('\n'));
          replaced = true;
          
          // Passer à la ligne après la fonction
          i = bounds.end + 1;
          continue;
        }
      }
    }
    
    newLines.push(line);
    i++;
  }
  
  return { content: newLines.join('\n'), replaced };
}

// Fonction alternative : remplacement par regex simple
function replaceFunctionSimple(content, funcName, operation, table, idField) {
  // Pattern pour trouver la fonction complète
  const pattern = new RegExp(
    `(//[^\\n]*\\n)?export\\s+const\\s+${funcName}\\s*=\\s*async\\s*\\([^)]*\\)\\s*\\{[^}]*?return\\s+sendError\\(res,\\s*['"]Non implémenté['"],\\s*501\\);[^}]*?\\}`,
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

console.log('🚀 Implémentation automatique de TOUS les contrôleurs génériques (V3)\n');

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
const details = [];

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
    const operations = [];
    
    // Traiter CREATE
    if (/create.*Non implémenté|create.*501/i.test(content)) {
      const funcNameMatch = content.match(/export\s+const\s+(\w*create\w*)\s*=\s*async/i);
      if (funcNameMatch) {
        const funcName = funcNameMatch[1];
        const result = replaceFunctionSimple(newContent, funcName, 'create', table, idField);
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
        const result = replaceFunctionSimple(newContent, funcName, 'update', table, idField);
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
        const result = replaceFunctionSimple(newContent, funcName, 'delete', table, idField);
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

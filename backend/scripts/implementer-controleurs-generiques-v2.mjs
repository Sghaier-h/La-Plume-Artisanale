/**
 * Script pour implémenter automatiquement les fonctionnalités CRUD manquantes
 * Version améliorée avec meilleure détection des patterns
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Template pour la fonction CREATE
const createTemplate = (tableName, idField, functionName = 'create') => `
// POST - Crée un enregistrement
export const ${functionName} = async (req, res) => {
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
    
    const placeholders = values.map((_, i) => \`$\${i + 1}\`).join(', ');
    
    const query = \`
      INSERT INTO ${tableName} (\${fields.join(', ')}, created_at, created_by)
      VALUES (\${placeholders}, NOW(), $\${values.length + 1})
      RETURNING *
    \`;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, '${functionName}');
  }
};`;

// Template pour la fonction UPDATE
const updateTemplate = (tableName, idField, functionName = 'update') => `
// PUT - Met à jour un enregistrement
export const ${functionName} = async (req, res) => {
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
    
    const setClause = fields.map((field, i) => \`\${field} = $\${i + 1}\`).join(', ');
    
    const query = \`
      UPDATE ${tableName}
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
    return handleError(res, error, '${functionName}');
  }
};`;

// Template pour la fonction DELETE
const deleteTemplate = (tableName, idField, functionName = 'delete') => `
// DELETE - Supprime un enregistrement
export const ${functionName} = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    
    // Essayer d'abord la suppression logique (champ active)
    // Si la table n'a pas de champ active, faire une suppression physique
    const checkActiveQuery = \`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${tableName}' AND column_name = 'active'
    \`;
    
    let query;
    let params;
    
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      
      if (hasActiveField) {
        // Suppression logique
        query = \`
          UPDATE ${tableName}
          SET active = false, updated_at = NOW(), updated_by = $1
          WHERE ${idField} = $2
          RETURNING *
        \`;
        params = [userId, id];
      } else {
        // Suppression physique
        query = \`
          DELETE FROM ${tableName}
          WHERE ${idField} = $1
          RETURNING *
        \`;
        params = [id];
      }
    } catch (checkError) {
      // En cas d'erreur, utiliser la suppression physique
      query = \`
        DELETE FROM ${tableName}
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
    return handleError(res, error, '${functionName}');
  }
};`;

// Mapping des modules vers leurs tables et ID fields (basé sur les GET existants)
const extractTableInfo = (content, moduleName) => {
  // Chercher dans les requêtes SELECT existantes
  const selectMatch = content.match(/SELECT\s+\*\s+FROM\s+(\w+)/i);
  const whereMatch = content.match(/WHERE\s+(\w+)\s*=\s*\$1/i);
  
  if (selectMatch && whereMatch) {
    return {
      table: selectMatch[1],
      idField: whereMatch[1]
    };
  }
  
  // Fallback: utiliser le nom du module
  const tableName = moduleName?.replace(/-/g, '_') || 'table';
  const idField = `id_${tableName}`;
  
  return { table: tableName, idField };
};

// Fonction pour extraire le nom de la fonction depuis le code
function extractFunctionName(content, operation) {
  // Chercher les fonctions qui contiennent "Non implémenté" ou "501"
  const patterns = [
    new RegExp(`export\\s+const\\s+(\\w+)\\s*=\\s*async.*?${operation}.*?Non implémenté`, 'is'),
    new RegExp(`export\\s+const\\s+(\\w+)\\s*=\\s*async.*?${operation}.*?501`, 'is'),
    new RegExp(`export\\s+const\\s+(\\w+${operation}\\w*)\\s*=\\s*async`, 'i'),
    new RegExp(`export\\s+const\\s+(\\w*[Cc]reate\\w*)\\s*=\\s*async`, 'i'),
    new RegExp(`export\\s+const\\s+(\\w*[Uu]pdate\\w*)\\s*=\\s*async`, 'i'),
    new RegExp(`export\\s+const\\s+(\\w*[Dd]elete\\w*)\\s*=\\s*async`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Fallback
  return operation === 'create' ? 'create' : operation === 'update' ? 'update' : 'delete';
}

// Fonction pour remplacer une fonction TODO
function replaceFunction(content, functionName, newImplementation) {
  // Pattern 1: Fonction avec TODO et return sendError
  const pattern1 = new RegExp(
    `(//\\s*(?:POST|PUT|DELETE).*?\\n)?export\\s+const\\s+${functionName}\\s*=\\s*async\\s*\\([^)]*\\)\\s*\\{[^}]*//\\s*TODO[^}]*return\\s+sendError\\(res,\\s*['"]Non implémenté['"],\\s*501\\);[^}]*\\}`,
    's'
  );
  
  if (pattern1.test(content)) {
    return content.replace(pattern1, newImplementation);
  }
  
  // Pattern 2: Fonction simple avec return sendError
  const pattern2 = new RegExp(
    `export\\s+const\\s+${functionName}\\s*=\\s*async\\s*\\([^)]*\\)\\s*\\{[^}]*return\\s+sendError\\(res,\\s*['"]Non implémenté['"],\\s*501\\);[^}]*\\}`,
    's'
  );
  
  if (pattern2.test(content)) {
    return content.replace(pattern2, newImplementation);
  }
  
  // Pattern 3: Fonction avec TODO dans le commentaire
  const pattern3 = new RegExp(
    `export\\s+const\\s+${functionName}\\s*=\\s*async\\s*\\([^)]*\\)\\s*\\{[^}]*//\\s*TODO[^}]*\\}`,
    's'
  );
  
  if (pattern3.test(content)) {
    return content.replace(pattern3, newImplementation);
  }
  
  return null;
}

console.log('🚀 Implémentation automatique des contrôleurs génériques (V2)\n');

// Trouver tous les contrôleurs avec "Non implémenté"
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
        console.error(`Erreur lecture ${filePath}:`, error.message);
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
    const { table, idField } = extractTableInfo(content, moduleName);
    
    let newContent = content;
    let modified = false;
    
    // Traiter CREATE
    if (/create.*Non implémenté|create.*501|TODO.*[Cc]ré/i.test(content)) {
      const funcName = extractFunctionName(content, 'create');
      const createImpl = createTemplate(table, idField, funcName);
      const replaced = replaceFunction(newContent, funcName, createImpl);
      if (replaced) {
        newContent = replaced;
        modified = true;
        console.log(`  ✅ ${funcName} implémenté`);
      }
    }
    
    // Traiter UPDATE
    if (/update.*Non implémenté|update.*501|TODO.*[Mm]ise/i.test(content)) {
      const funcName = extractFunctionName(content, 'update');
      const updateImpl = updateTemplate(table, idField, funcName);
      const replaced = replaceFunction(newContent, funcName, updateImpl);
      if (replaced) {
        newContent = replaced;
        modified = true;
        console.log(`  ✅ ${funcName} implémenté`);
      }
    }
    
    // Traiter DELETE
    if (/delete.*Non implémenté|delete.*501|TODO.*[Ss]upp/i.test(content)) {
      const funcName = extractFunctionName(content, 'delete');
      const deleteImpl = deleteTemplate(table, idField, funcName);
      const replaced = replaceFunction(newContent, funcName, deleteImpl);
      if (replaced) {
        newContent = replaced;
        modified = true;
        console.log(`  ✅ ${funcName} implémenté`);
      }
    }
    
    if (modified) {
      fs.writeFileSync(controllerPath, newContent, 'utf8');
      fixed++;
      fixedModules.push(moduleName);
      console.log(`✅ ${moduleName} - Amélioré`);
    } else {
      skipped++;
      console.log(`⚠️  ${moduleName} - Pattern non reconnu`);
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
  errors.forEach(e => {
    console.log(`   - ${path.basename(e.path)}: ${e.error}`);
  });
}

console.log('\n💡 Note: Vérifiez les tables et ID fields dans la base de données.');
console.log('   Certains contrôleurs peuvent nécessiter des ajustements manuels.\n');

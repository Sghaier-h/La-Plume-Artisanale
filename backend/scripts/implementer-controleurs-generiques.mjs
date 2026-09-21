/**
 * Script pour implémenter automatiquement les fonctionnalités CRUD manquantes
 * dans les 51 contrôleurs génériques
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Template pour la fonction CREATE
const createTemplate = (tableName, idField) => `
// POST - Crée un enregistrement
export const create = async (req, res) => {
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
    return handleError(res, error, 'create');
  }
};`;

// Template pour la fonction UPDATE
const updateTemplate = (tableName, idField) => `
// PUT - Met à jour un enregistrement
export const update = async (req, res) => {
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
    return handleError(res, error, 'update');
  }
};`;

// Template pour la fonction DELETE
const deleteTemplate = (tableName, idField) => `
// DELETE - Supprime un enregistrement
export const deleteRecord = async (req, res) => {
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
    return handleError(res, error, 'deleteRecord');
  }
};`;

// Mapping des modules vers leurs tables et ID fields
const moduleMappings = {
  'mobile': { table: 'mobile', idField: 'id_mobile' },
  'settings': { table: 'settings', idField: 'id_setting' },
  'email': { table: 'email', idField: 'id_email' },
  'whatsapp': { table: 'whatsapp', idField: 'id_whatsapp' },
  'social-auth': { table: 'social_auth', idField: 'id_social_auth' },
  'ai': { table: 'ai', idField: 'id_ai' },
  'warehouse': { table: 'warehouse', idField: 'id_warehouse' },
  'accounting-tunisia': { table: 'accounting_tunisia', idField: 'id' },
  'payroll-tunisia': { table: 'payroll_tunisia', idField: 'id' },
  'pos': { table: 'pos', idField: 'id_pos' },
  'excel-import': { table: 'excel_import', idField: 'id_excel' },
  'audit': { table: 'audit', idField: 'id_audit' },
  'utilisateurs': { table: 'utilisateurs', idField: 'id_utilisateur' },
  'pointage': { table: 'pointage', idField: 'id_pointage' },
  'database': { table: 'database', idField: 'id_database' },
  'migration': { table: 'migration', idField: 'id_migration' },
  'webhooks': { table: 'webhooks', idField: 'id_webhook' },
  'ecommerce': { table: 'ecommerce', idField: 'id_ecommerce' },
  'communication': { table: 'communication', idField: 'id_communication' },
  'reports': { table: 'reports', idField: 'id_report' },
  'multisociete': { table: 'multisociete', idField: 'id_multisociete' },
  'couts': { table: 'couts', idField: 'id_cout' },
  'qualite-avance': { table: 'qualite_avance', idField: 'id_qualite' },
  'planification-gantt': { table: 'planification_gantt', idField: 'id_planification' },
  'maintenance': { table: 'maintenance', idField: 'id_maintenance' },
  'produits': { table: 'produits', idField: 'id_produit' },
  'messages': { table: 'messages', idField: 'id_message' },
  'notifications': { table: 'notifications', idField: 'id_notification' },
  'taches': { table: 'taches', idField: 'id_tache' },
  'documents': { table: 'documents', idField: 'id_document' },
  'qualite-avancee': { table: 'qualite_avancee', idField: 'id_qualite' },
  'tracabilite-lots': { table: 'tracabilite_lots', idField: 'id_tracabilite' },
  'stock-multi-entrepots': { table: 'stock_multi_entrepots', idField: 'id_stock' },
  'planning-dragdrop': { table: 'planning_dragdrop', idField: 'id_planning' },
  'selecteurs-machines': { table: 'selecteurs_machines', idField: 'id_selecteur' },
  'articles-catalogue': { table: 'articles_catalogue', idField: 'id_article_catalogue' },
  'modeles': { table: 'modeles', idField: 'id_modele' },
  'parametres-catalogue': { table: 'parametres_catalogue', idField: 'id_parametre' },
  'suivi-fabrication': { table: 'suivi_fabrication', idField: 'id_suivi' },
  'matieres-premieres': { table: 'matieres_premieres', idField: 'id_matiere' },
  'parametrage': { table: 'parametrage', idField: 'id_parametrage' },
  'planning': { table: 'planning', idField: 'id_planning' },
  'production': { table: 'production', idField: 'id_production' },
  'dashboard': { table: 'dashboard', idField: 'id_dashboard' },
  'soustraitants': { table: 'soustraitants', idField: 'id_soustraitant' },
  'of': { table: 'of', idField: 'id_of' },
  'machines': { table: 'machines', idField: 'id_machine' },
  'bons-retour': { table: 'bons_retour', idField: 'id_bon_retour' },
  'bons-livraison': { table: 'bons_livraison', idField: 'id_bon_livraison' },
  'avoirs': { table: 'avoirs', idField: 'id_avoir' },
  'search': { table: 'search', idField: 'id_search' }
};

// Fonction pour extraire le nom du module depuis le chemin
function getModuleName(filePath) {
  const parts = filePath.split(path.sep);
  const modulesIndex = parts.indexOf('modules');
  if (modulesIndex !== -1 && parts[modulesIndex + 1]) {
    return parts[modulesIndex + 1];
  }
  return null;
}

// Fonction pour extraire le nom de la table depuis le contrôleur
function extractTableInfo(controllerPath, content) {
  const moduleName = getModuleName(controllerPath);
  
  // Chercher dans le mapping
  if (moduleMappings[moduleName]) {
    return moduleMappings[moduleName];
  }
  
  // Essayer d'extraire depuis le code existant
  const tableMatch = content.match(/FROM\s+(\w+)/i) || content.match(/INSERT INTO\s+(\w+)/i) || content.match(/UPDATE\s+(\w+)/i);
  const idFieldMatch = content.match(/WHERE\s+(\w+)\s*=\s*\$1/i) || content.match(/WHERE\s+(\w+)\s*=\s*\$2/i);
  
  if (tableMatch && idFieldMatch) {
    return {
      table: tableMatch[1],
      idField: idFieldMatch[1]
    };
  }
  
  // Fallback: utiliser le nom du module
  const tableName = moduleName?.replace(/-/g, '_') || 'table';
  const idField = `id_${tableName}`;
  
  return { table: tableName, idField };
}

// Fonction pour remplacer une fonction TODO
function replaceFunction(content, functionName, newImplementation) {
  // Chercher la fonction existante
  const functionRegex = new RegExp(
    `(//\\s*(?:POST|PUT|DELETE).*?\\n)?export\\s+const\\s+${functionName}\\s*=\\s*async\\s*\\([^)]*\\)\\s*\\{[^}]*//\\s*TODO[^}]*return\\s+sendError\\(res,\\s*['"]Non implémenté['"],\\s*501\\);[^}]*\\}`,
    's'
  );
  
  if (functionRegex.test(content)) {
    return content.replace(functionRegex, newImplementation);
  }
  
  // Si pas trouvé avec TODO, chercher juste la fonction
  const simpleRegex = new RegExp(
    `export\\s+const\\s+${functionName}\\s*=\\s*async\\s*\\([^)]*\\)\\s*\\{[^}]*return\\s+sendError\\(res,\\s*['"]Non implémenté['"],\\s*501\\);[^}]*\\}`,
    's'
  );
  
  if (simpleRegex.test(content)) {
    return content.replace(simpleRegex, newImplementation);
  }
  
  return null;
}

console.log('🚀 Implémentation automatique des contrôleurs génériques\n');

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
          controllersToFix.push({ path: filePath, content });
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

for (const { path: controllerPath, content } of controllersToFix) {
  try {
    const moduleName = getModuleName(controllerPath);
    const { table, idField } = extractTableInfo(controllerPath, content);
    
    let newContent = content;
    let modified = false;
    
    // Remplacer CREATE
    if (/create.*Non implémenté|create.*501/i.test(content)) {
      const createImpl = createTemplate(table, idField);
      const replaced = replaceFunction(newContent, 'create', createImpl);
      if (replaced) {
        newContent = replaced;
        modified = true;
      } else {
        // Essayer avec le nom exact de la fonction
        const funcNameMatch = content.match(/export\s+const\s+(\w+)\s*=\s*async.*?create/i);
        if (funcNameMatch) {
          const funcName = funcNameMatch[1];
          const replaced2 = replaceFunction(newContent, funcName, createImpl);
          if (replaced2) {
            newContent = replaced2;
            modified = true;
          }
        }
      }
    }
    
    // Remplacer UPDATE
    if (/update.*Non implémenté|update.*501/i.test(content)) {
      const updateImpl = updateTemplate(table, idField);
      const replaced = replaceFunction(newContent, 'update', updateImpl);
      if (replaced) {
        newContent = replaced;
        modified = true;
      } else {
        const funcNameMatch = content.match(/export\s+const\s+(\w+)\s*=\s*async.*?update/i);
        if (funcNameMatch) {
          const funcName = funcNameMatch[1];
          const replaced2 = replaceFunction(newContent, funcName, updateImpl);
          if (replaced2) {
            newContent = replaced2;
            modified = true;
          }
        }
      }
    }
    
    // Remplacer DELETE
    if (/delete.*Non implémenté|delete.*501/i.test(content)) {
      const deleteImpl = deleteTemplate(table, idField);
      const replaced = replaceFunction(newContent, 'delete', deleteImpl);
      if (replaced) {
        newContent = replaced;
        modified = true;
      } else {
        const funcNameMatch = content.match(/export\s+const\s+(\w+)\s*=\s*async.*?delete/i);
        if (funcNameMatch) {
          const funcName = funcNameMatch[1];
          const replaced2 = replaceFunction(newContent, funcName, deleteImpl);
          if (replaced2) {
            newContent = replaced2;
            modified = true;
          }
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(controllerPath, newContent, 'utf8');
      fixed++;
      console.log(`✅ ${moduleName || path.basename(controllerPath)}`);
    } else {
      skipped++;
      console.log(`⚠️  ${moduleName || path.basename(controllerPath)} - Pattern non reconnu`);
    }
  } catch (error) {
    errors.push({ path: controllerPath, error: error.message });
    console.log(`❌ ${path.basename(controllerPath)} - Erreur: ${error.message}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 RÉSUMÉ');
console.log('='.repeat(60));
console.log(`✅ Contrôleurs améliorés: ${fixed}`);
console.log(`⚠️  Contrôleurs ignorés: ${skipped}`);
console.log(`❌ Erreurs: ${errors.length}`);

if (errors.length > 0) {
  console.log('\n❌ Erreurs:');
  errors.forEach(e => {
    console.log(`   - ${path.basename(e.path)}: ${e.error}`);
  });
}

console.log('\n💡 Note: Vérifiez les tables et ID fields dans la base de données.');
console.log('   Certains contrôleurs peuvent nécessiter des ajustements manuels.\n');

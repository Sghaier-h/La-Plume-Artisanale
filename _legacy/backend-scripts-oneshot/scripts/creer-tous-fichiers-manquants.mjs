/**
 * Script pour créer automatiquement tous les fichiers manquants
 * (modèles, contrôleurs, routes, hooks)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Templates pour les fichiers
const templateModel = (moduleName, modelName, tableName, idField) => `/**
 * ${modelName} Model - Module ${moduleName}
 */

import BaseModel from '../../../src/core/BaseModel.js';
import { pool } from '../../../src/utils/db.js';

export class ${modelName} extends BaseModel {
  constructor() {
    super('${moduleName}.${modelName.toLowerCase()}', null);
    this._name = '${moduleName}.${modelName.toLowerCase()}';
    this._description = '${modelName}';
    this._table = '${tableName}';
    this._idField = '${idField}';
  }

  async search(domain = [], options = {}) {
    let query = \`SELECT * FROM ${tableName} WHERE 1=1\`;
    const params = [];
    let paramCount = 0;

    // Convertir le domaine en conditions SQL
    for (let i = 0; i < domain.length; i++) {
      const item = domain[i];
      if (Array.isArray(item) && item.length === 3) {
        const [field, operator, value] = item;
        paramCount++;
        
        switch (operator) {
          case '=':
            query += \` AND \${field} = $\${paramCount}\`;
            params.push(value);
            break;
          case '!=':
            query += \` AND \${field} != $\${paramCount}\`;
            params.push(value);
            break;
          case 'like':
          case 'ilike':
            query += \` AND \${field} ILIKE $\${paramCount}\`;
            params.push(\`%\${value}%\`);
            break;
          case 'in':
            query += \` AND \${field} = ANY($\${paramCount})\`;
            params.push(Array.isArray(value) ? value : [value]);
            break;
        }
      }
    }

    // Pagination
    if (options.limit) {
      query += \` LIMIT $\${++paramCount}\`;
      params.push(options.limit);
    }
    if (options.offset) {
      query += \` OFFSET $\${++paramCount}\`;
      params.push(options.offset);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }
}

export default ${modelName};
`;

const templateController = (moduleName, controllerName, tableName, idField) => {
  const funcName = controllerName.replace(/Controller$/, '').replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  const getFunc = `get${controllerName.replace('Controller', '')}`;
  const getByIdFunc = `get${controllerName.replace('Controller', '')}ById`;
  const createFunc = `create${controllerName.replace('Controller', '')}`;
  const updateFunc = `update${controllerName.replace('Controller', '')}`;
  const deleteFunc = `delete${controllerName.replace('Controller', '')}`;

  return `/**
 * Contrôleur ${controllerName} - Module ${moduleName}
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/${moduleName}/${funcName} - Liste tous les enregistrements
export const ${getFunc} = async (req, res) => {
  try {
    const query = \`SELECT * FROM ${tableName} ORDER BY created_at DESC\`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, '${controllerName.replace('Controller', '')} récupérés avec succès');
  } catch (error) {
    return handleError(res, error, '${getFunc}');
  }
};

// GET /api/${moduleName}/${funcName}/:id - Récupère un enregistrement
export const ${getByIdFunc} = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`SELECT * FROM ${tableName} WHERE ${idField} = $1\`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Enregistrement récupéré avec succès');
  } catch (error) {
    return handleError(res, error, '${getByIdFunc}');
  }
};

// POST /api/${moduleName}/${funcName} - Crée un enregistrement
export const ${createFunc} = async (req, res) => {
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
    return handleError(res, error, '${createFunc}');
  }
};

// PUT /api/${moduleName}/${funcName}/:id - Met à jour un enregistrement
export const ${updateFunc} = async (req, res) => {
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
    return handleError(res, error, '${updateFunc}');
  }
};

// DELETE /api/${moduleName}/${funcName}/:id - Supprime un enregistrement
export const ${deleteFunc} = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    
    // Essayer d'abord la suppression logique (champ active)
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
        query = \`
          UPDATE ${tableName}
          SET active = false, updated_at = NOW(), updated_by = $1
          WHERE ${idField} = $2
          RETURNING *
        \`;
        params = [userId, id];
      } else {
        query = \`
          DELETE FROM ${tableName}
          WHERE ${idField} = $1
          RETURNING *
        \`;
        params = [id];
      }
    } catch (checkError) {
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
    return handleError(res, error, '${deleteFunc}');
  }
};
`;
};

const templateRoute = (moduleName, routeName, controllerName) => {
  const funcName = controllerName.replace(/Controller$/, '').replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  const getFunc = `get${controllerName.replace('Controller', '')}`;
  const getByIdFunc = `get${controllerName.replace('Controller', '')}ById`;
  const createFunc = `create${controllerName.replace('Controller', '')}`;
  const updateFunc = `update${controllerName.replace('Controller', '')}`;
  const deleteFunc = `delete${controllerName.replace('Controller', '')}`;

  return `/**
 * Routes ${routeName} - Module ${moduleName}
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  ${getFunc},
  ${getByIdFunc},
  ${createFunc},
  ${updateFunc},
  ${deleteFunc}
} from '../controllers/${controllerName.replace(/\.js$/, '')}.controller.js';

const router = express.Router();

router.get('/', authenticate, ${getFunc});
router.get('/:id', authenticate, ${getByIdFunc});
router.post('/', authenticate, ${createFunc});
router.put('/:id', authenticate, ${updateFunc});
router.delete('/:id', authenticate, ${deleteFunc});

export default router;
`;
};

const templateHook = (moduleName) => `/**
 * Hook postLoad - Module ${moduleName}
 * Exécuté après le chargement du module
 */

export default async function postLoad() {
  // Hook vide pour l'instant
  // Peut être utilisé pour :
  // - Initialiser des données par défaut
  // - Enregistrer des services
  // - Configurer des permissions
  // - etc.
  console.log(\`✅ Hook postLoad du module ${moduleName} exécuté\`);
}
`;

// Mapping des noms de modèles vers les noms de tables et champs ID
const getTableMapping = (moduleName, modelPath) => {
  const modelName = modelPath.split('/').pop().replace('.js', '');
  
  // Mapping spécial pour certains modèles
  const specialMappings = {
    'AccountMoveLine': { table: 'account_move_lines', idField: 'id' },
    'AccountTax': { table: 'account_taxes', idField: 'id' },
    'AccountAccount': { table: 'account_accounts', idField: 'id' },
    'AccountJournal': { table: 'account_journals', idField: 'id' },
    'ProductVariant': { table: 'product_variants', idField: 'id' },
    'UOM': { table: 'uoms', idField: 'id' },
    'PurchaseOrderLine': { table: 'purchase_order_lines', idField: 'id' },
    'SaleOrderLine': { table: 'sale_order_lines', idField: 'id' },
    'StockQuant': { table: 'stock_quants', idField: 'id' },
    'StockLot': { table: 'stock_lots', idField: 'id' },
    'MrpWorkCenter': { table: 'mrp_work_centers', idField: 'id' },
    'MrpWorkOrder': { table: 'mrp_work_orders', idField: 'id' },
    'MrpRouting': { table: 'mrp_routings', idField: 'id' },
  };

  if (specialMappings[modelName]) {
    return specialMappings[modelName];
  }

  // Génération automatique
  const tableName = modelName
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/s$/, 's') // Garder le pluriel si présent
    .replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  
  // Convertir en nom de table SQL (snake_case, pluriel)
  const snakeCase = modelName
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
  
  const pluralTable = snakeCase.endsWith('s') ? snakeCase : snakeCase + 's';
  
  return {
    table: pluralTable,
    idField: 'id'
  };
};

// Fonction pour convertir un nom de fichier en nom de classe
const toClassName = (fileName) => {
  return fileName
    .replace(/\.js$/, '')
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

// Fonction pour obtenir le nom du contrôleur depuis le chemin
const getControllerName = (controllerPath) => {
  const fileName = controllerPath.split('/').pop().replace('.controller.js', '');
  return toClassName(fileName) + 'Controller';
};

// Fonction pour obtenir le nom de la route depuis le chemin
const getRouteName = (routePath) => {
  return routePath.split('/').pop().replace('.routes.js', '');
};

async function createMissingFiles() {
  console.log('🔧 Création de tous les fichiers manquants\n');
  console.log('='.repeat(80));

  const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  let created = {
    models: 0,
    controllers: 0,
    routes: 0,
    hooks: 0
  };

  for (const moduleName of modules) {
    const manifestPath = path.join(modulesPath, moduleName, 'manifest.js');
    
    if (!fs.existsSync(manifestPath)) {
      continue;
    }

    try {
      const manifest = await import(`../modules/${moduleName}/manifest.js`);
      const manifestData = manifest.default || manifest;

      // Créer les modèles manquants
      if (manifestData.models) {
        for (const modelPath of manifestData.models) {
          const fullPath = path.join(modulesPath, moduleName, modelPath);
          const dirPath = path.dirname(fullPath);
          
          if (!fs.existsSync(fullPath)) {
            // Créer le répertoire si nécessaire
            if (!fs.existsSync(dirPath)) {
              fs.mkdirSync(dirPath, { recursive: true });
            }
            
            const modelName = toClassName(modelPath.split('/').pop().replace('.js', ''));
            const mapping = getTableMapping(moduleName, modelPath);
            
            const content = templateModel(moduleName, modelName, mapping.table, mapping.idField);
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✅ Modèle créé: ${moduleName}/${modelPath}`);
            created.models++;
          }
        }
      }

      // Créer les contrôleurs manquants
      if (manifestData.controllers) {
        for (const controllerPath of manifestData.controllers) {
          const fullPath = path.join(modulesPath, moduleName, controllerPath);
          const dirPath = path.dirname(fullPath);
          
          if (!fs.existsSync(fullPath)) {
            // Créer le répertoire si nécessaire
            if (!fs.existsSync(dirPath)) {
              fs.mkdirSync(dirPath, { recursive: true });
            }
            
            const controllerName = getControllerName(controllerPath);
            // Essayer de trouver la table correspondante
            const modelPath = controllerPath.replace('controllers/', 'models/').replace('.controller.js', '.js');
            const modelFullPath = path.join(modulesPath, moduleName, modelPath);
            
            let tableName = 'table_name';
            let idField = 'id';
            
            if (fs.existsSync(modelFullPath)) {
              // Lire le modèle pour obtenir le nom de la table
              const modelContent = fs.readFileSync(modelFullPath, 'utf8');
              const tableMatch = modelContent.match(/_table\s*=\s*['"]([^'"]+)['"]/);
              const idFieldMatch = modelContent.match(/_idField\s*=\s*['"]([^'"]+)['"]/);
              
              if (tableMatch) tableName = tableMatch[1];
              if (idFieldMatch) idField = idFieldMatch[1];
            } else {
              // Utiliser le mapping par défaut
              const mapping = getTableMapping(moduleName, modelPath);
              tableName = mapping.table;
              idField = mapping.idField;
            }
            
            const content = templateController(moduleName, controllerName, tableName, idField);
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✅ Contrôleur créé: ${moduleName}/${controllerPath}`);
            created.controllers++;
          }
        }
      }

      // Créer les routes manquantes
      if (manifestData.routes) {
        for (const routePath of manifestData.routes) {
          const fullPath = path.join(modulesPath, moduleName, routePath);
          const dirPath = path.dirname(fullPath);
          
          if (!fs.existsSync(fullPath)) {
            // Créer le répertoire si nécessaire
            if (!fs.existsSync(dirPath)) {
              fs.mkdirSync(dirPath, { recursive: true });
            }
            
            const routeName = getRouteName(routePath);
            const controllerPath = routePath.replace('routes/', 'controllers/').replace('.routes.js', '.controller.js');
            const controllerName = getControllerName(controllerPath);
            
            const content = templateRoute(moduleName, routeName, controllerName);
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✅ Route créée: ${moduleName}/${routePath}`);
            created.routes++;
          }
        }
      }

      // Créer les hooks manquants
      if (manifestData.postLoad) {
        const fullPath = path.join(modulesPath, moduleName, manifestData.postLoad);
        const dirPath = path.dirname(fullPath);
        
        if (!fs.existsSync(fullPath)) {
          // Créer le répertoire si nécessaire
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          
          const content = templateHook(moduleName);
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`✅ Hook créé: ${moduleName}/${manifestData.postLoad}`);
          created.hooks++;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Erreur lors du traitement du module ${moduleName}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 RÉSUMÉ DE LA CRÉATION\n');
  console.log('='.repeat(80));
  console.log(`✅ Modèles créés: ${created.models}`);
  console.log(`✅ Contrôleurs créés: ${created.controllers}`);
  console.log(`✅ Routes créées: ${created.routes}`);
  console.log(`✅ Hooks créés: ${created.hooks}`);
  console.log(`\n🎉 Total: ${created.models + created.controllers + created.routes + created.hooks} fichiers créés`);
  console.log('\n💡 Redémarrez le serveur pour charger les nouveaux fichiers.');
  console.log('='.repeat(80));
}

createMissingFiles().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

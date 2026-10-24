/**
 * Script pour convertir tous les contrôleurs qui utilisent le système de modèles
 * vers des contrôleurs qui utilisent directement SQL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesPath = path.join(__dirname, '../modules');

// Mapping des modèles vers les tables et champs
const modelMapping = {
  'account.move': {
    table: 'factures',
    idField: 'id_facture',
    nameField: 'numero_facture',
    searchFields: ['numero_facture', 'reference']
  },
  'hr.employee': {
    table: 'employes',
    idField: 'id_employe',
    nameField: 'nom',
    searchFields: ['nom', 'prenom', 'email']
  },
  'product.template': {
    table: 'articles_catalogue',
    idField: 'id_article',
    nameField: 'nom',
    searchFields: ['nom', 'reference']
  },
  'sale.order': {
    table: 'commandes_clients',
    idField: 'id_commande',
    nameField: 'numero_commande',
    searchFields: ['numero_commande']
  },
  'purchase.order': {
    table: 'commandes_fournisseurs',
    idField: 'id_commande_fournisseur',
    nameField: 'numero_commande',
    searchFields: ['numero_commande']
  },
  'stock.picking': {
    table: 'livraisons',
    idField: 'id_livraison',
    nameField: 'numero_livraison',
    searchFields: ['numero_livraison']
  },
  'crm.lead': {
    table: 'pistes_crm',
    idField: 'id_piste',
    nameField: 'nom',
    searchFields: ['nom', 'email', 'telephone']
  },
  'project.project': {
    table: 'projets',
    idField: 'id_projet',
    nameField: 'nom_projet',
    searchFields: ['nom_projet']
  },
  'mrp.production': {
    table: 'ordres_fabrication',
    idField: 'id_of',
    nameField: 'numero_of',
    searchFields: ['numero_of']
  }
};

function getModelNameFromController(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const modelMatch = content.match(/env\.model\(['"]([^'"]+)['"]\)/);
  return modelMatch ? modelMatch[1] : null;
}

function needsConversion(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes('registry.createEnvironment') || 
         content.includes('env.model(');
}

function generateSQLController(modelName, filePath) {
  const mapping = modelMapping[modelName];
  if (!mapping) {
    return null;
  }

  const { table, idField, nameField, searchFields } = mapping;
  const moduleName = path.basename(path.dirname(path.dirname(filePath)));
  const controllerName = path.basename(filePath, '.controller.js');
  
  // Générer le nom de la fonction (ex: getAccountMoves, getHREmployees)
  const resourceName = controllerName.replace(/_/g, '')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
  
  const getFunction = `get${resourceName}`;
  const getByIdFunction = `get${resourceName}ById`;
  const createFunction = `create${resourceName}`;
  const updateFunction = `update${resourceName}`;
  const deleteFunction = `delete${resourceName}`;

  return `/**
 * ${resourceName} Controller - Version SQL directe
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import { getPaginationParams, buildPaginationResponse } from '../../../src/utils/pagination.helper.js';

const TABLE_NAME = '${table}';
const ID_FIELD = '${idField}';

// GET /api/${moduleName}/${controllerName.replace(/_/g, '/')} - Liste tous les enregistrements
export const ${getFunction} = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const { offset, pageSize } = getPaginationParams(page, limit);

    let query = \`SELECT * FROM \${TABLE_NAME} WHERE 1=1\`;
    const params = [];
    let paramIndex = 1;

    if (search) {
      const searchConditions = ${JSON.stringify(searchFields)}.map(field => 
        \`\${field} ILIKE $\${paramIndex}\`
      ).join(' OR ');
      query += \` AND (\${searchConditions})\`;
      params.push(\`%\${search}%\`);
      paramIndex++;
    }

    query += \` ORDER BY created_at DESC LIMIT $\${paramIndex} OFFSET $\${paramIndex + 1}\`;
    params.push(pageSize, offset);

    const result = await pool.query(query, params);
    const totalResult = await pool.query(\`SELECT COUNT(*) as total FROM \${TABLE_NAME}\`, []);
    const total = parseInt(totalResult.rows[0].total);

    return sendSuccess(res, {
      data: result.rows,
      pagination: buildPaginationResponse(page, pageSize, total)
    });
  } catch (error) {
    return handleError(res, error, '${getFunction}');
  }
};

// GET /api/${moduleName}/${controllerName.replace(/_/g, '/')}/:id - Récupère un enregistrement
export const ${getByIdFunction} = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`SELECT * FROM \${TABLE_NAME} WHERE \${ID_FIELD} = $1\`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }

    return sendSuccess(res, result.rows[0], 'Enregistrement récupéré avec succès');
  } catch (error) {
    return handleError(res, error, '${getByIdFunction}');
  }
};

// POST /api/${moduleName}/${controllerName.replace(/_/g, '/')} - Crée un enregistrement
export const ${createFunction} = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const excludedFields = [ID_FIELD, 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à créer', 400);
    }
    
    const placeholders = values.map((_, i) => \`$\${i + 1}\`).join(', ');
    const query = \`
      INSERT INTO \${TABLE_NAME} (\${fields.join(', ')}, created_at, created_by)
      VALUES (\${placeholders}, NOW(), $\${values.length + 1})
      RETURNING *
    \`;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, '${createFunction}');
  }
};

// PUT /api/${moduleName}/${controllerName.replace(/_/g, '/')}/:id - Met à jour un enregistrement
export const ${updateFunction} = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const excludedFields = [ID_FIELD, 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', 400);
    }
    
    const setClause = fields.map((field, i) => \`\${field} = $\${i + 1}\`).join(', ');
    const query = \`
      UPDATE \${TABLE_NAME}
      SET \${setClause}, updated_at = NOW(), updated_by = $\${values.length + 1}
      WHERE \${ID_FIELD} = $\${values.length + 2}
      RETURNING *
    \`;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, '${updateFunction}');
  }
};

// DELETE /api/${moduleName}/${controllerName.replace(/_/g, '/')}/:id - Supprime un enregistrement
export const ${deleteFunction} = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    // Essayer d'abord la suppression logique
    const checkActiveQuery = \`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '\${TABLE_NAME}' AND column_name = 'active'
    \`;
    
    let query;
    let params;
    
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      
      if (hasActiveField) {
        query = \`
          UPDATE \${TABLE_NAME}
          SET active = false, updated_at = NOW(), updated_by = $1
          WHERE \${ID_FIELD} = $2
          RETURNING *
        \`;
        params = [userId, id];
      } else {
        query = \`
          DELETE FROM \${TABLE_NAME}
          WHERE \${ID_FIELD} = $1
          RETURNING *
        \`;
        params = [id];
      }
    } catch (checkError) {
      query = \`
        DELETE FROM \${TABLE_NAME}
        WHERE \${ID_FIELD} = $1
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
    return handleError(res, error, '${deleteFunction}');
  }
};
`;
}

function findAndConvertControllers() {
  console.log('🔧 Conversion des contrôleurs utilisant le système de modèles\n');
  console.log('='.repeat(80));
  
  const controllers = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        walkDir(fullPath);
      } else if (file.name.endsWith('.controller.js')) {
        if (needsConversion(fullPath)) {
          const modelName = getModelNameFromController(fullPath);
          if (modelName && modelMapping[modelName]) {
            controllers.push({ path: fullPath, modelName });
          }
        }
      }
    }
  }
  
  walkDir(modulesPath);
  
  let converted = 0;
  
  for (const controller of controllers) {
    const newContent = generateSQLController(controller.modelName, controller.path);
    if (newContent) {
      // Sauvegarder l'ancien fichier
      const backupPath = controller.path + '.backup';
      fs.copyFileSync(controller.path, backupPath);
      
      // Écrire le nouveau contenu
      fs.writeFileSync(controller.path, newContent, 'utf8');
      
      const relativePath = path.relative(modulesPath, controller.path);
      console.log(`✅ Converti: ${relativePath} (${controller.modelName})`);
      converted++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n✅ Contrôleurs convertis: ${converted}`);
  console.log('='.repeat(80));
  console.log('\n💡 Les fichiers originaux ont été sauvegardés avec l\'extension .backup');
  console.log('   Vous pouvez les restaurer si nécessaire.\n');
}

findAndConvertControllers();

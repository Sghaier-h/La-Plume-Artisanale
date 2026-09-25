/**
 * Script pour créer automatiquement tous les modules manquants
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Liste des modules à créer (basée sur les routes dans server.js)
const modulesACreer = [
  { name: 'devis', category: 'Sales', depends: ['base', 'clients', 'product'] },
  { name: 'factures', category: 'Accounting', depends: ['base', 'clients', 'account', 'sale'] },
  { name: 'fournisseurs', category: 'Purchase', depends: ['base'] },
  { name: 'avoirs', category: 'Accounting', depends: ['base', 'factures'] },
  { name: 'bons-livraison', category: 'Sales', depends: ['base', 'commandes'] },
  { name: 'bons-retour', category: 'Sales', depends: ['base', 'commandes'] },
  { name: 'machines', category: 'Manufacturing', depends: ['base'] },
  { name: 'of', category: 'Manufacturing', depends: ['base', 'machines', 'product'] },
  { name: 'soustraitants', category: 'Manufacturing', depends: ['base'] },
  { name: 'dashboard', category: 'Tools', depends: ['base'] },
  { name: 'production', category: 'Manufacturing', depends: ['base', 'of'] },
  { name: 'planning', category: 'Manufacturing', depends: ['base', 'of'] },
  { name: 'parametrage', category: 'Tools', depends: ['base'] },
  { name: 'matieres-premieres', category: 'Inventory', depends: ['base', 'product'] },
  { name: 'suivi-fabrication', category: 'Manufacturing', depends: ['base', 'of'] },
  { name: 'parametres-catalogue', category: 'Sales', depends: ['base'] },
  { name: 'modeles', category: 'Sales', depends: ['base', 'product'] },
  { name: 'articles-catalogue', category: 'Sales', depends: ['base', 'product'] },
  { name: 'selecteurs-machines', category: 'Manufacturing', depends: ['base', 'machines'] },
  { name: 'planning-dragdrop', category: 'Manufacturing', depends: ['base', 'planning'] },
  { name: 'stock-multi-entrepots', category: 'Inventory', depends: ['base', 'stock'] },
  { name: 'tracabilite-lots', category: 'Inventory', depends: ['base', 'stock'] },
  { name: 'qualite-avancee', category: 'Quality', depends: ['base', 'quality'] },
  { name: 'documents', category: 'Tools', depends: ['base'] },
  { name: 'taches', category: 'Project', depends: ['base', 'project'] },
  { name: 'notifications', category: 'Tools', depends: ['base'] },
  { name: 'messages', category: 'Tools', depends: ['base'] },
  { name: 'produits', category: 'Inventory', depends: ['base', 'product'] },
  { name: 'maintenance', category: 'Manufacturing', depends: ['base', 'machines'] },
  { name: 'planification-gantt', category: 'Project', depends: ['base', 'project'] },
  { name: 'qualite-avance', category: 'Quality', depends: ['base', 'quality'] },
  { name: 'couts', category: 'Accounting', depends: ['base', 'account'] },
  { name: 'multisociete', category: 'Tools', depends: ['base'] },
  { name: 'commercial', category: 'Sales', depends: ['base', 'crm'] },
  { name: 'reports', category: 'Tools', depends: ['base'] },
  { name: 'communication', category: 'Tools', depends: ['base'] },
  { name: 'ecommerce', category: 'Sales', depends: ['base', 'product'] },
  { name: 'webhooks', category: 'Tools', depends: ['base'] },
  { name: 'migration', category: 'Tools', depends: ['base'] },
  { name: 'database', category: 'Tools', depends: ['base'] },
  { name: 'pointage', category: 'HR', depends: ['base', 'hr'] },
  { name: 'utilisateurs', category: 'Tools', depends: ['base'] },
  { name: 'audit', category: 'Tools', depends: ['base'] },
  { name: 'excel-import', category: 'Tools', depends: ['base'] },
  { name: 'pos', category: 'Sales', depends: ['base', 'product'] },
  { name: 'purchase-requests', category: 'Purchase', depends: ['base', 'purchase'] },
  { name: 'payroll-tunisia', category: 'HR', depends: ['base', 'hr'] },
  { name: 'accounting-tunisia', category: 'Accounting', depends: ['base', 'account'] },
  { name: 'warehouse', category: 'Inventory', depends: ['base', 'stock'] },
  { name: 'ai', category: 'Tools', depends: ['base'] },
  { name: 'social-auth', category: 'Tools', depends: ['base'] },
  { name: 'whatsapp', category: 'Tools', depends: ['base'] },
  { name: 'email', category: 'Tools', depends: ['base'] },
  { name: 'settings', category: 'Tools', depends: ['base'] },
  { name: 'search', category: 'Tools', depends: ['base'] },
  { name: 'mobile', category: 'Tools', depends: ['base'] }
];

const modulesDir = path.join(__dirname, '../modules');

// Fonction pour créer la structure d'un module
function creerModule(moduleInfo) {
  const modulePath = path.join(modulesDir, moduleInfo.name);
  
  // Créer les dossiers
  const dossiers = ['models', 'controllers', 'routes', 'security'];
  dossiers.forEach(dossier => {
    const dossierPath = path.join(modulePath, dossier);
    if (!fs.existsSync(dossierPath)) {
      fs.mkdirSync(dossierPath, { recursive: true });
    }
  });

  // Créer manifest.js
  const manifestPath = path.join(modulePath, 'manifest.js');
  if (!fs.existsSync(manifestPath)) {
    const manifestContent = `/**
 * Module ${moduleInfo.name.charAt(0).toUpperCase() + moduleInfo.name.slice(1)} - ${moduleInfo.category}
 */

export default {
  name: '${moduleInfo.name}',
  version: '1.0.0',
  category: '${moduleInfo.category}',
  summary: 'Gestion ${moduleInfo.name}',
  description: 'Module de gestion ${moduleInfo.name}',
  depends: ${JSON.stringify(moduleInfo.depends)},
  installable: true,
  auto_install: false,
  application: false,
  author: 'La Plume Artisanale',
  license: 'PROPRIETARY',
  models: [
    'models/${moduleInfo.name.charAt(0).toUpperCase() + moduleInfo.name.slice(1)}.js'
  ],
  controllers: [
    'controllers/${moduleInfo.name}.controller.js'
  ],
  routes: [
    'routes/${moduleInfo.name}.routes.js'
  ],
  security: [
    'security/ir.model.access.json'
  ]
};
`;
    fs.writeFileSync(manifestPath, manifestContent);
  }

  // Créer le modèle
  const modelName = moduleInfo.name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
  const modelPath = path.join(modulePath, 'models', `${modelName}.js`);
  if (!fs.existsSync(modelPath)) {
    const modelContent = `/**
 * Modèle ${modelName}
 */

import { BaseModel } from '../../../src/core/BaseModel.js';

export class ${modelName} extends BaseModel {
  constructor() {
    super('${moduleInfo.name.replace(/-/g, '_')}', 'id_${moduleInfo.name.split('-')[0]}');
  }
}
`;
    fs.writeFileSync(modelPath, modelContent);
  }

  // Créer le contrôleur
  const controllerPath = path.join(modulePath, 'controllers', `${moduleInfo.name}.controller.js`);
  if (!fs.existsSync(controllerPath)) {
    const controllerName = moduleInfo.name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
    const controllerContent = `/**
 * Contrôleur ${controllerName} - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/${moduleInfo.name} - Liste tous les enregistrements
export const get${controllerName} = async (req, res) => {
  try {
    const query = \`SELECT * FROM ${moduleInfo.name.replace(/-/g, '_')} ORDER BY created_at DESC\`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, '${controllerName} récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'get${controllerName}');
  }
};

// GET /api/${moduleInfo.name}/:id - Récupère un enregistrement
export const get${controllerName}ById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`SELECT * FROM ${moduleInfo.name.replace(/-/g, '_')} WHERE id_${moduleInfo.name.split('-')[0]} = $1\`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, '${controllerName} non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], '${controllerName} récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'get${controllerName}ById');
  }
};

// POST /api/${moduleInfo.name} - Crée un enregistrement
export const create${controllerName} = async (req, res) => {
  try {
    const userId = getUserId(req);
    const data = req.body;
    
    // TODO: Implémenter la création
    return sendError(res, 'Non implémenté', 501);
  } catch (error) {
    return handleError(res, error, 'create${controllerName}');
  }
};

// PUT /api/${moduleInfo.name}/:id - Met à jour un enregistrement
export const update${controllerName} = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const data = req.body;
    
    // TODO: Implémenter la mise à jour
    return sendError(res, 'Non implémenté', 501);
  } catch (error) {
    return handleError(res, error, 'update${controllerName}');
  }
};

// DELETE /api/${moduleInfo.name}/:id - Supprime un enregistrement
export const delete${controllerName} = async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implémenter la suppression
    return sendError(res, 'Non implémenté', 501);
  } catch (error) {
    return handleError(res, error, 'delete${controllerName}');
  }
};
`;
    fs.writeFileSync(controllerPath, controllerContent);
  }

  // Créer les routes
  const routesPath = path.join(modulePath, 'routes', `${moduleInfo.name}.routes.js`);
  if (!fs.existsSync(routesPath)) {
    const routesControllerName = moduleInfo.name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
    const routesContent = `/**
 * Routes ${routesControllerName} - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  get${routesControllerName},
  get${routesControllerName}ById,
  create${routesControllerName},
  update${routesControllerName},
  delete${routesControllerName}
} from '../controllers/${moduleInfo.name}.controller.js';

const router = express.Router();

router.get('/', authenticate, get${routesControllerName});
router.get('/:id', authenticate, get${routesControllerName}ById);
router.post('/', authenticate, create${routesControllerName});
router.put('/:id', authenticate, update${routesControllerName});
router.delete('/:id', authenticate, delete${routesControllerName});

export default router;
`;
    fs.writeFileSync(routesPath, routesContent);
  }

  // Créer le fichier de sécurité
  const securityPath = path.join(modulePath, 'security', 'ir.model.access.json');
  if (!fs.existsSync(securityPath)) {
    const securityControllerName = moduleInfo.name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
    const securityContent = {
      id: `access_${moduleInfo.name}`,
      name: `${securityControllerName} Access`,
      model_id: `${moduleInfo.name}.${moduleInfo.name.split('-')[0]}`,
      group_id: "base.group_user",
      perm_read: true,
      perm_write: true,
      perm_create: true,
      perm_unlink: true
    };
    fs.writeFileSync(securityPath, JSON.stringify(securityContent, null, 2));
  }

  console.log(`✅ Module ${moduleInfo.name} créé`);
}

// Créer tous les modules
console.log('🔄 Création des modules manquants...\n');

modulesACreer.forEach(moduleInfo => {
  try {
    creerModule(moduleInfo);
  } catch (error) {
    console.error(`❌ Erreur lors de la création du module ${moduleInfo.name}:`, error.message);
  }
});

console.log(`\n✅ ${modulesACreer.length} modules créés avec succès!`);

/**
 * Script pour ajouter les exports manquants dans les contrôleurs
 * Version corrigée avec les bonnes constantes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Exports manquants à ajouter avec les bonnes constantes
const exportsManquants = [
  {
    file: 'modules/product/controllers/product_template.controller.js',
    exportName: 'getProductMovements',
    code: `
// GET /api/product/templates/:id/movements
export const getProductMovements = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`
      SELECT * FROM mouvements_stock 
      WHERE id_article = $1 
      ORDER BY date_mouvement DESC
    \`;
    const result = await pool.query(query, [id]);
    return sendSuccess(res, result.rows, 'Mouvements récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getProductMovements');
  }
};
`
  },
  {
    file: 'modules/sale/controllers/sale_order.controller.js',
    exportName: 'cancelSaleOrder',
    code: `
// POST /api/sale/orders/:id/cancel
export const cancelSaleOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`
      UPDATE commandes_clients 
      SET statut = 'annulee', updated_at = NOW() 
      WHERE id_commande = $1
      RETURNING *
    \`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Commande non trouvée', 404);
    }
    return sendSuccess(res, result.rows[0], 'Commande annulée avec succès');
  } catch (error) {
    return handleError(res, error, 'cancelSaleOrder');
  }
};
`
  },
  {
    file: 'modules/stock/controllers/stock_picking.controller.js',
    exportName: 'assignStockPicking',
    code: `
// POST /api/stock/pickings/:id/assign
export const assignStockPicking = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const query = \`
      UPDATE transferts_stock 
      SET assigned_to = $1, state = 'assigned', updated_at = NOW() 
      WHERE id_transfert = $2
      RETURNING *
    \`;
    const result = await pool.query(query, [user_id, id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Transfert non trouvé', 404);
    }
    return sendSuccess(res, result.rows[0], 'Transfert assigné avec succès');
  } catch (error) {
    return handleError(res, error, 'assignStockPicking');
  }
};
`
  },
  {
    file: 'modules/crm/controllers/crm_lead.controller.js',
    exportName: 'convertToOpportunity',
    code: `
// POST /api/crm/leads/:id/convert
export const convertToOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const leadQuery = \`SELECT * FROM crm_leads WHERE id_lead = $1\`;
    const leadResult = await pool.query(leadQuery, [id]);
    
    if (leadResult.rows.length === 0) {
      return sendError(res, 'Piste non trouvée', 404);
    }
    
    const lead = leadResult.rows[0];
    // Créer une opportunité à partir de la piste
    const oppQuery = \`
      INSERT INTO crm_opportunities (name, partner_id, expected_revenue, probability, stage_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    \`;
    const oppResult = await pool.query(oppQuery, [
      lead.name || 'Opportunité depuis ' + lead.name,
      lead.partner_id,
      lead.expected_revenue || 0,
      lead.probability || 10,
      1 // stage_id par défaut
    ]);
    
    return sendSuccess(res, oppResult.rows[0], 'Piste convertie en opportunité avec succès');
  } catch (error) {
    return handleError(res, error, 'convertToOpportunity');
  }
};
`
  },
  {
    file: 'modules/mrp/controllers/mrp_production.controller.js',
    exportName: 'confirmMrpProduction',
    code: `
// POST /api/mrp/productions/:id/confirm
export const confirmMrpProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`
      UPDATE ordres_fabrication 
      SET statut = 'confirme', date_confirmation = NOW(), updated_at = NOW() 
      WHERE id_of = $1
      RETURNING *
    \`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Production non trouvée', 404);
    }
    return sendSuccess(res, result.rows[0], 'Production confirmée avec succès');
  } catch (error) {
    return handleError(res, error, 'confirmMrpProduction');
  }
};
`
  },
  {
    file: 'modules/purchase/controllers/purchase_order.controller.js',
    exportName: 'cancelPurchaseOrder',
    code: `
// POST /api/purchase/orders/:id/cancel
export const cancelPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`
      UPDATE commandes_fournisseurs 
      SET statut = 'annulee', updated_at = NOW() 
      WHERE id_commande = $1
      RETURNING *
    \`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Commande non trouvée', 404);
    }
    return sendSuccess(res, result.rows[0], 'Commande annulée avec succès');
  } catch (error) {
    return handleError(res, error, 'cancelPurchaseOrder');
  }
};
`
  },
];

// Exports à créer comme alias pour hr_employee_new et project_project_new
const exportsAlias = [
  {
    file: 'modules/hr/controllers/hr_employee_new.controller.js',
    exports: [
      { old: 'getHremployeenew', new: 'getHREmployees' },
      { old: 'getHremployeenewById', new: 'getHREmployee' },
      { old: 'createHremployeenew', new: 'createHREmployee' },
      { old: 'updateHremployeenew', new: 'updateHREmployee' },
      { old: 'deleteHremployeenew', new: 'deleteHREmployee' },
    ]
  },
  {
    file: 'modules/project/controllers/project_project_new.controller.js',
    exports: [
      { old: 'getProjectprojectnew', new: 'getProjects' },
      { old: 'getProjectprojectnewById', new: 'getProject' },
      { old: 'createProjectprojectnew', new: 'createProject' },
      { old: 'updateProjectprojectnew', new: 'updateProject' },
      { old: 'deleteProjectprojectnew', new: 'deleteProject' },
    ]
  },
];

async function ajouterExport(correction) {
  const filePath = path.join(backendDir, correction.file);
  
  if (!fs.existsSync(filePath)) {
    log(`  ⚠️  Fichier non trouvé: ${correction.file}`, 'yellow');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier si l'export existe déjà
  const exportRegex = new RegExp(`export\\s+(const|async function)\\s+${correction.exportName}\\b`, 'g');
  if (exportRegex.test(content)) {
    log(`  ✅ ${correction.exportName} existe déjà`, 'green');
    return false;
  }
  
  // Ajouter l'export à la fin du fichier
  content += '\n' + correction.code;
  
  fs.writeFileSync(filePath, content, 'utf8');
  log(`  ✅ ${correction.exportName} ajouté`, 'green');
  return true;
}

async function creerAlias(correction) {
  const filePath = path.join(backendDir, correction.file);
  
  if (!fs.existsSync(filePath)) {
    log(`  ⚠️  Fichier non trouvé: ${correction.file}`, 'yellow');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Ajouter les alias à la fin du fichier
  const aliases = correction.exports.map(({ old, new: newName }) => {
    return `export const ${newName} = ${old};`;
  }).join('\n');
  
  // Vérifier si les alias existent déjà
  if (content.includes(aliases.split('\n')[0])) {
    log(`  ✅ Aliases déjà présents`, 'green');
    return false;
  }
  
  content += '\n\n// Aliases pour compatibilité avec les routes\n' + aliases;
  fs.writeFileSync(filePath, content, 'utf8');
  log(`  ✅ ${correction.exports.length} alias créés`, 'green');
  return true;
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 AJOUT DES EXPORTS MANQUANTS', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let added = 0;
  
  // Ajouter les exports manquants
  for (const correction of exportsManquants) {
    log(`\n📝 ${correction.file}:`, 'blue');
    const result = await ajouterExport(correction);
    if (result) {
      added++;
    }
  }
  
  // Créer les alias
  for (const correction of exportsAlias) {
    log(`\n📝 ${correction.file}:`, 'blue');
    const result = await creerAlias(correction);
    if (result) {
      added++;
    }
  }
  
  log('\n' + '='.repeat(80), 'cyan');
  log(`✅ Exports ajoutés: ${added}`, 'green');
  log('='.repeat(80), 'cyan');
  log('\n⚠️  IMPORTANT:', 'yellow');
  log('   1. Arrêter l\'ancien serveur (Ctrl+C dans l\'autre terminal)', 'white');
  log('   2. Redémarrer: npm start', 'white');
  log('\n');
}

main().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

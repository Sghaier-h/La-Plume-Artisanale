/**
 * Script pour ajouter les exports manquants dans les contrôleurs
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

// Exports manquants à ajouter
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
      UPDATE ${TABLE_NAME} 
      SET statut = 'annulee', updated_at = NOW() 
      WHERE ${ID_FIELD} = $1
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
      UPDATE ${TABLE_NAME} 
      SET assigned_to = $1, state = 'assigned', updated_at = NOW() 
      WHERE ${ID_FIELD} = $2
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
    const leadQuery = \`SELECT * FROM ${TABLE_NAME} WHERE ${ID_FIELD} = $1\`;
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
      UPDATE ${TABLE_NAME} 
      SET state = 'confirmed', confirmed_at = NOW(), updated_at = NOW() 
      WHERE ${ID_FIELD} = $1
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
      UPDATE ${TABLE_NAME} 
      SET statut = 'annulee', updated_at = NOW() 
      WHERE ${ID_FIELD} = $1
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
  
  // Ajouter l'export à la fin du fichier (avant le dernier })
  const lines = content.split('\n');
  let insertIndex = lines.length - 1;
  
  // Trouver la dernière ligne non vide
  while (insertIndex > 0 && lines[insertIndex].trim() === '') {
    insertIndex--;
  }
  
  // Insérer le code avant la dernière ligne
  lines.splice(insertIndex, 0, correction.code);
  content = lines.join('\n');
  
  fs.writeFileSync(filePath, content, 'utf8');
  log(`  ✅ ${correction.exportName} ajouté`, 'green');
  return true;
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 AJOUT DES EXPORTS MANQUANTS', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let added = 0;
  
  for (const correction of exportsManquants) {
    log(`\n📝 ${correction.file}:`, 'blue');
    const result = await ajouterExport(correction);
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

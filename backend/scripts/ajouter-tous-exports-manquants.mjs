/**
 * Script pour ajouter TOUS les exports manquants identifiés dans les routes
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

// Tous les exports manquants
const exportsManquants = [
  // CRM Lead
  {
    file: 'modules/crm/controllers/crm_lead.controller.js',
    exports: [
      {
        name: 'getLeads',
        code: `export const getLeads = getCrmLeads;`
      },
      {
        name: 'getLead',
        code: `export const getLead = getCrmLead;`
      },
      {
        name: 'updateLead',
        code: `export const updateLead = updateCrmLead;`
      },
      {
        name: 'deleteLead',
        code: `export const deleteLead = deleteCrmLead;`
      },
    ]
  },
  // Stock Picking
  {
    file: 'modules/stock/controllers/stock_picking.controller.js',
    exports: [
      {
        name: 'doneStockPicking',
        code: `
// POST /api/stock/pickings/:id/done
export const doneStockPicking = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`
      UPDATE livraisons 
      SET statut = 'termine', date_fin = NOW(), updated_at = NOW() 
      WHERE id_livraison = $1
      RETURNING *
    \`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Transfert non trouvé', 404);
    }
    return sendSuccess(res, result.rows[0], 'Transfert terminé avec succès');
  } catch (error) {
    return handleError(res, error, 'doneStockPicking');
  }
};
`
      },
      {
        name: 'getPickingMoves',
        code: `
// GET /api/stock/pickings/:id/moves
export const getPickingMoves = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`
      SELECT * FROM mouvements_stock 
      WHERE id_livraison = $1 
      ORDER BY date_mouvement DESC
    \`;
    const result = await pool.query(query, [id]);
    return sendSuccess(res, result.rows, 'Mouvements récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getPickingMoves');
  }
};
`
      },
    ]
  },
  // MRP Production
  {
    file: 'modules/mrp/controllers/mrp_production.controller.js',
    exports: [
      {
        name: 'startMrpProduction',
        code: `
// POST /api/mrp/productions/:id/start
export const startMrpProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`
      UPDATE ordres_fabrication 
      SET statut = 'en_cours', date_debut = NOW(), updated_at = NOW() 
      WHERE id_of = $1
      RETURNING *
    \`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Production non trouvée', 404);
    }
    return sendSuccess(res, result.rows[0], 'Production démarrée avec succès');
  } catch (error) {
    return handleError(res, error, 'startMrpProduction');
  }
};
`
      },
      {
        name: 'getProductionMoves',
        code: `
// GET /api/mrp/productions/:id/moves
export const getProductionMoves = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`
      SELECT * FROM mouvements_stock 
      WHERE id_of = $1 
      ORDER BY date_mouvement DESC
    \`;
    const result = await pool.query(query, [id]);
    return sendSuccess(res, result.rows, 'Mouvements récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getProductionMoves');
  }
};
`
      },
    ]
  },
  // Sale Order Lines
  {
    file: 'modules/sale/controllers/sale_order.controller.js',
    exports: [
      {
        name: 'getSaleOrderLines',
        code: `
// GET /api/sale/orders/:id/lines
export const getSaleOrderLines = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`
      SELECT * FROM lignes_commande_client 
      WHERE id_commande = $1 
      ORDER BY ordre ASC
    \`;
    const result = await pool.query(query, [id]);
    return sendSuccess(res, result.rows, 'Lignes récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getSaleOrderLines');
  }
};
`
      },
      {
        name: 'createSaleOrderLine',
        code: `
// POST /api/sale/orders/:id/lines
export const createSaleOrderLine = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const { id_article, quantite, prix_unitaire, remise } = req.body;
    
    const query = \`
      INSERT INTO lignes_commande_client 
        (id_commande, id_article, quantite, prix_unitaire, remise, created_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    \`;
    const result = await pool.query(query, [
      id, id_article, quantite, prix_unitaire || 0, remise || 0, userId
    ]);
    
    return sendSuccess(res, result.rows[0], 'Ligne créée avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createSaleOrderLine');
  }
};
`
      },
      {
        name: 'updateSaleOrderLine',
        code: `
// PUT /api/sale/orders/:id/lines/:lineId
export const updateSaleOrderLine = async (req, res) => {
  try {
    const { id, lineId } = req.params;
    const userId = getUserId(req);
    const { quantite, prix_unitaire, remise } = req.body;
    
    const query = \`
      UPDATE lignes_commande_client 
      SET quantite = $1, prix_unitaire = $2, remise = $3, updated_by = $4, updated_at = NOW()
      WHERE id_ligne = $5 AND id_commande = $6
      RETURNING *
    \`;
    const result = await pool.query(query, [
      quantite, prix_unitaire, remise || 0, userId, lineId, id
    ]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Ligne non trouvée', 404);
    }
    return sendSuccess(res, result.rows[0], 'Ligne mise à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateSaleOrderLine');
  }
};
`
      },
      {
        name: 'deleteSaleOrderLine',
        code: `
// DELETE /api/sale/orders/:id/lines/:lineId
export const deleteSaleOrderLine = async (req, res) => {
  try {
    const { id, lineId } = req.params;
    const query = \`
      DELETE FROM lignes_commande_client 
      WHERE id_ligne = $1 AND id_commande = $2
      RETURNING *
    \`;
    const result = await pool.query(query, [lineId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Ligne non trouvée', 404);
    }
    return sendSuccess(res, null, 'Ligne supprimée avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteSaleOrderLine');
  }
};
`
      },
    ]
  },
  // Purchase Order Lines
  {
    file: 'modules/purchase/controllers/purchase_order.controller.js',
    exports: [
      {
        name: 'getPurchaseOrderLines',
        code: `
// GET /api/purchase/orders/:id/lines
export const getPurchaseOrderLines = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`
      SELECT * FROM lignes_commande_fournisseur 
      WHERE id_commande_fournisseur = $1 
      ORDER BY ordre ASC
    \`;
    const result = await pool.query(query, [id]);
    return sendSuccess(res, result.rows, 'Lignes récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getPurchaseOrderLines');
  }
};
`
      },
    ]
  },
];

async function ajouterExports(correction) {
  const filePath = path.join(backendDir, correction.file);
  
  if (!fs.existsSync(filePath)) {
    log(`  ⚠️  Fichier non trouvé: ${correction.file}`, 'yellow');
    return 0;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let added = 0;
  
  for (const exp of correction.exports) {
    // Vérifier si l'export existe déjà
    const exportRegex = new RegExp(`export\\s+(const|async function)\\s+${exp.name}\\b`, 'g');
    if (exportRegex.test(content)) {
      log(`    ✅ ${exp.name} existe déjà`, 'green');
      continue;
    }
    
    // Ajouter l'export
    content += '\n' + exp.code;
    added++;
    log(`    ✅ ${exp.name} ajouté`, 'green');
  }
  
  if (added > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return added;
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 AJOUT DE TOUS LES EXPORTS MANQUANTS', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let totalAdded = 0;
  
  for (const correction of exportsManquants) {
    log(`\n📝 ${correction.file}:`, 'blue');
    const added = await ajouterExports(correction);
    totalAdded += added;
  }
  
  log('\n' + '='.repeat(80), 'cyan');
  log(`✅ Total exports ajoutés: ${totalAdded}`, 'green');
  log('='.repeat(80), 'cyan');
  log('\n⚠️  IMPORTANT:', 'yellow');
  log('   1. Arrêter l\'ancien serveur (Ctrl+C)', 'white');
  log('   2. Libérer le port 5000: .\\.LIBERER_PORT_5000.ps1', 'white');
  log('   3. Redémarrer: npm start', 'white');
  log('\n');
}

main().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

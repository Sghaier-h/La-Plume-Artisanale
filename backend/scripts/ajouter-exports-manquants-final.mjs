/**
 * Script pour ajouter les exports manquants restants
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

// Exports manquants restants
const exportsManquants = [
  {
    file: 'modules/product/controllers/product_template.controller.js',
    exportName: 'getProductStock',
    code: `
// GET /api/product/templates/:id/stock
export const getProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`
      SELECT s.*, l.nom as location_name, w.nom as warehouse_name
      FROM stock s
      LEFT JOIN emplacements l ON s.id_emplacement = l.id_emplacement
      LEFT JOIN entrepots w ON l.id_entrepot = w.id_entrepot
      WHERE s.id_article = $1
      ORDER BY s.date_modification DESC
    \`;
    const result = await pool.query(query, [id]);
    return sendSuccess(res, result.rows, 'Stock récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getProductStock');
  }
};
`
  },
  {
    file: 'modules/sale/controllers/sale_order.controller.js',
    exportName: 'confirmSaleOrder',
    code: `
// POST /api/sale/orders/:id/confirm
export const confirmSaleOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`
      UPDATE commandes_clients 
      SET statut = 'confirmee', date_confirmation = NOW(), updated_at = NOW() 
      WHERE id_commande = $1
      RETURNING *
    \`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Commande non trouvée', 404);
    }
    return sendSuccess(res, result.rows[0], 'Commande confirmée avec succès');
  } catch (error) {
    return handleError(res, error, 'confirmSaleOrder');
  }
};
`
  },
  {
    file: 'modules/stock/controllers/stock_picking.controller.js',
    exportName: 'confirmStockPicking',
    code: `
// POST /api/stock/pickings/:id/confirm
export const confirmStockPicking = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`
      UPDATE livraisons 
      SET statut = 'confirmee', date_confirmation = NOW(), updated_at = NOW() 
      WHERE id_livraison = $1
      RETURNING *
    \`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Transfert non trouvé', 404);
    }
    return sendSuccess(res, result.rows[0], 'Transfert confirmé avec succès');
  } catch (error) {
    return handleError(res, error, 'confirmStockPicking');
  }
};
`
  },
  {
    file: 'modules/crm/controllers/crm_lead.controller.js',
    exportName: 'createLead',
    code: `
// POST /api/crm/leads
export const createLead = async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      name, partner_id, email, phone, source, expected_revenue, probability
    } = req.body;
    
    const query = \`
      INSERT INTO pistes_crm 
        (nom, id_partenaire, email, telephone, source, revenu_attendu, probabilite, statut, created_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'nouvelle', $8, NOW())
      RETURNING *
    \`;
    const result = await pool.query(query, [
      name, partner_id || null, email || null, phone || null, 
      source || 'website', expected_revenue || 0, probability || 10, userId
    ]);
    
    return sendSuccess(res, result.rows[0], 'Piste créée avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createLead');
  }
};
`
  },
  {
    file: 'modules/mrp/controllers/mrp_production.controller.js',
    exportName: 'doneMrpProduction',
    code: `
// POST /api/mrp/productions/:id/done
export const doneMrpProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`
      UPDATE ordres_fabrication 
      SET statut = 'termine', date_fin = NOW(), updated_at = NOW() 
      WHERE id_of = $1
      RETURNING *
    \`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Production non trouvée', 404);
    }
    return sendSuccess(res, result.rows[0], 'Production terminée avec succès');
  } catch (error) {
    return handleError(res, error, 'doneMrpProduction');
  }
};
`
  },
  {
    file: 'modules/purchase/controllers/purchase_order.controller.js',
    exportName: 'confirmPurchaseOrder',
    code: `
// POST /api/purchase/orders/:id/confirm
export const confirmPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`
      UPDATE commandes_fournisseurs 
      SET statut = 'confirmee', date_confirmation = NOW(), updated_at = NOW() 
      WHERE id_commande_fournisseur = $1
      RETURNING *
    \`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Commande non trouvée', 404);
    }
    return sendSuccess(res, result.rows[0], 'Commande confirmée avec succès');
  } catch (error) {
    return handleError(res, error, 'confirmPurchaseOrder');
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
  
  // Ajouter l'export à la fin du fichier
  content += '\n' + correction.code;
  
  fs.writeFileSync(filePath, content, 'utf8');
  log(`  ✅ ${correction.exportName} ajouté`, 'green');
  return true;
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 AJOUT DES EXPORTS MANQUANTS FINAUX', 'cyan');
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
  log('   1. Arrêter l\'ancien serveur (Ctrl+C)', 'white');
  log('   2. Libérer le port 5000 si nécessaire', 'white');
  log('   3. Redémarrer: npm start', 'white');
  log('\n');
}

main().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

/**
 * Script pour corriger les erreurs SQL finales
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

// Ajouter getSessions et getSession pour pos_session
async function ajouterExportsPosSession() {
  const filePath = path.join(backendDir, 'modules/pos/controllers/pos_session.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('export const getSessions')) {
    log('  ✅ getSessions existe déjà', 'green');
    return false;
  }
  
  const code = `
// GET /api/pos/sessions
export const getSessions = async (req, res) => {
  try {
    const { id_caisse, statut } = req.query;
    let query = \`SELECT * FROM sessions_caisse WHERE 1=1\`;
    const params = [];
    let paramIndex = 1;
    
    if (id_caisse) {
      query += \` AND id_caisse = $\${paramIndex}\`;
      params.push(id_caisse);
      paramIndex++;
    }
    
    if (statut) {
      query += \` AND statut = $\${paramIndex}\`;
      params.push(statut);
      paramIndex++;
    }
    
    query += \` ORDER BY date_ouverture DESC\`;
    
    const result = await pool.query(query, params);
    return sendSuccess(res, result.rows, 'Sessions récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getSessions');
  }
};

// GET /api/pos/sessions/:id
export const getSession = async (req, res) => {
  try {
    const { id } = req.params;
    const query = \`SELECT * FROM sessions_caisse WHERE id = $1\`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Session non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Session récupérée avec succès');
  } catch (error) {
    return handleError(res, error, 'getSession');
  }
};
`;
  
  content += code;
  fs.writeFileSync(filePath, content, 'utf8');
  log('  ✅ getSessions et getSession ajoutés', 'green');
  return true;
}

// Corriger pos_vente ORDER BY
async function corrigerPosVente() {
  const filePath = path.join(backendDir, 'modules/pos/controllers/pos_vente.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier si la correction est déjà faite
  if (content.includes('COALESCE(created_at::text')) {
    log('  ✅ ORDER BY déjà corrigé', 'green');
    return false;
  }
  
  // Corriger ORDER BY
  content = content.replace(
    /ORDER BY COALESCE\(created_at, id\) DESC/g,
    'ORDER BY COALESCE(created_at, NOW()) DESC'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  log('  ✅ ORDER BY corrigé', 'green');
  return true;
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION DES ERREURS SQL FINALES', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let corrected = 0;
  
  log('\n📝 pos_session.controller.js:', 'blue');
  if (await ajouterExportsPosSession()) {
    corrected++;
  }
  
  log('\n📝 pos_vente.controller.js:', 'blue');
  if (await corrigerPosVente()) {
    corrected++;
  }
  
  log('\n' + '='.repeat(80), 'cyan');
  log(`✅ Corrections appliquées: ${corrected}`, 'green');
  log('='.repeat(80), 'cyan');
  log('\n⚠️  IMPORTANT:', 'yellow');
  log('   Redémarrer le serveur pour appliquer les corrections', 'white');
  log('\n');
}

main().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

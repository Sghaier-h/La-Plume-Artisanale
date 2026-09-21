/**
 * Script pour corriger l'INSERT dans pos_vente
 */

import { pool } from '../src/utils/db.js';
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

async function verifierColonnes(tableName) {
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    return result.rows.map(r => r.column_name);
  } catch (error) {
    return [];
  }
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION INSERT pos_vente', 'cyan');
  log('='.repeat(80), 'cyan');
  
  const filePath = path.join(backendDir, 'modules/pos/controllers/pos_vente.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Vérifier colonnes lignes_vente_caisse
  const colsLignes = await verifierColonnes('lignes_vente_caisse');
  log(`\nColonnes lignes_vente_caisse: ${colsLignes.join(', ')}`, 'yellow');
  
  // Corriger INSERT lignes_vente_caisse
  if (content.includes('id_vente, id_article, quantite, prix_unitaire_ht, montant_tva')) {
    // Vérifier si montant_tva existe
    if (!colsLignes.includes('montant_tva')) {
      // Retirer montant_tva
      content = content.replace(
        /id_vente, id_article, quantite, prix_unitaire_ht, montant_tva/g,
        'id_vente, id_article, quantite, prix_unitaire_ht'
      );
      content = content.replace(
        /VALUES \(\$1, \$2, \$3, \$4, \$5\)/g,
        'VALUES ($1, $2, $3, $4)'
      );
      // Retirer le 5ème paramètre
      content = content.replace(
        /sale\.id,\s*ligne\.id_article \|\| ligne\.id_product,\s*ligne\.quantite \|\| ligne\.quantity \|\| 1,\s*ligne\.prix_unitaire_ht \|\| ligne\.price_unit \|\| 0,\s*\([^)]+\)/g,
        (match) => {
          return match.replace(/,\s*\([^)]+\)$/, '');
        }
      );
      modified = true;
      log('  ✅ montant_tva retiré de l\'INSERT', 'green');
    }
  }
  
  // Vérifier si prix_unitaire_ht existe ou si c'est prix_unitaire
  if (colsLignes.includes('prix_unitaire') && !colsLignes.includes('prix_unitaire_ht')) {
    content = content.replace(/prix_unitaire_ht/g, 'prix_unitaire');
    modified = true;
    log('  ✅ prix_unitaire_ht → prix_unitaire', 'green');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    log('\n✅ Fichier corrigé', 'green');
  } else {
    log('\n✅ Fichier déjà correct', 'green');
  }
  
  log('\n');
}

main().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await pool.end();
});

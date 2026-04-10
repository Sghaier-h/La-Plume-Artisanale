/**
 * Script final pour corriger les 3 modules non fonctionnels
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

// 1. Corriger pos_ventes - colonnes lignes_vente_caisse
async function corrigerPosVentes() {
  log('\n📝 1. Correction pos_ventes - colonnes lignes_vente_caisse', 'blue');
  
  const filePath = path.join(backendDir, 'modules/pos/controllers/pos_vente.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  const colsLignes = await verifierColonnes('lignes_vente_caisse');
  log(`  Colonnes lignes_vente_caisse: ${colsLignes.join(', ')}`, 'yellow');
  
  // Corriger les colonnes dans INSERT lignes_vente_caisse
  if (colsLignes.includes('id_article') && content.includes('id_product')) {
    content = content.replace(/id_product/g, 'id_article');
    modified = true;
    log('  ✅ id_product → id_article', 'green');
  }
  
  if (colsLignes.includes('quantite') && content.includes('quantity')) {
    content = content.replace(/quantity/g, 'quantite');
    modified = true;
    log('  ✅ quantity → quantite', 'green');
  }
  
  if (colsLignes.includes('prix_unitaire_ht') && content.includes('price_unit')) {
    content = content.replace(/price_unit/g, 'prix_unitaire_ht');
    modified = true;
    log('  ✅ price_unit → prix_unitaire_ht', 'green');
  }
  
  // Vérifier si subtotal existe ou doit être calculé
  if (!colsLignes.includes('subtotal') && content.includes('subtotal')) {
    // Retirer subtotal de l'INSERT
    content = content.replace(
      /id_vente, id_article, quantite, prix_unitaire_ht, subtotal/g,
      'id_vente, id_article, quantite, prix_unitaire_ht'
    );
    content = content.replace(
      /VALUES \(\$1, \$2, \$3, \$4, \$5\)/g,
      'VALUES ($1, $2, $3, $4)'
    );
    // Retirer le 5ème paramètre
    content = content.replace(
      /sale\.id,\s*ligne\.id_product \|\| ligne\.id_article,\s*ligne\.quantity \|\| ligne\.quantite,\s*ligne\.price_unit \|\| ligne\.prix_unitaire_ht,\s*\([^)]+\)/g,
      (match) => {
        return match.replace(/,\s*\([^)]+\)$/, '');
      }
    );
    modified = true;
    log('  ✅ subtotal retiré de l\'INSERT', 'green');
  }
  
  // Corriger UPDATE articles
  if (content.includes('UPDATE articles') && content.includes('id_product')) {
    content = content.replace(/ligne\.id_product/g, 'ligne.id_article || ligne.id_product');
    modified = true;
    log('  ✅ UPDATE articles corrigé', 'green');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    log('  ✅ Fichier corrigé', 'green');
    return true;
  }
  
  log('  ✅ Fichier déjà correct', 'green');
  return false;
}

// 2. Corriger purchase-requests - colonnes lignes_demande_achat
async function corrigerPurchaseRequests() {
  log('\n📝 2. Correction purchase-requests - colonnes lignes_demande_achat', 'blue');
  
  const filePath = path.join(backendDir, 'modules/purchase-requests/controllers/purchase-requests.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  const colsLignes = await verifierColonnes('lignes_demande_achat');
  log(`  Colonnes lignes_demande_achat: ${colsLignes.join(', ')}`, 'yellow');
  
  // Corriger id_product → id_article
  if (colsLignes.includes('id_article') && content.includes('id_product')) {
    content = content.replace(/id_product/g, 'id_article');
    modified = true;
    log('  ✅ id_product → id_article', 'green');
  }
  
  // Corriger quantity → quantite
  if (colsLignes.includes('quantite') && content.includes('quantity')) {
    content = content.replace(/quantity/g, 'quantite');
    modified = true;
    log('  ✅ quantity → quantite', 'green');
  }
  
  // Corriger price_unit → prix_unitaire
  if (colsLignes.includes('prix_unitaire') && content.includes('price_unit')) {
    content = content.replace(/price_unit/g, 'prix_unitaire');
    modified = true;
    log('  ✅ price_unit → prix_unitaire', 'green');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    log('  ✅ Fichier corrigé', 'green');
    return true;
  }
  
  log('  ✅ Fichier déjà correct', 'green');
  return false;
}

// 3. Vérifier taches - colonnes
async function verifierTaches() {
  log('\n📝 3. Vérification taches', 'blue');
  
  const filePath = path.join(backendDir, 'src/controllers/taches.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  const cols = await verifierColonnes('taches');
  log(`  Colonnes taches: ${cols.join(', ')}`, 'yellow');
  
  // Vérifier id_taches vs id_tache
  if (cols.includes('id_taches') && content.includes('t.id_tache')) {
    content = content.replace(/t\.id_tache/g, 't.id_taches');
    modified = true;
    log('  ✅ id_tache → id_taches', 'green');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    log('  ✅ Fichier corrigé', 'green');
    return true;
  }
  
  log('  ✅ Fichier déjà correct', 'green');
  return false;
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION FINALE DES 3 MODULES NON FONCTIONNELS', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let corrected = 0;
  
  if (await corrigerPosVentes()) corrected++;
  if (await corrigerPurchaseRequests()) corrected++;
  if (await verifierTaches()) corrected++;
  
  log('\n' + '='.repeat(80), 'cyan');
  log(`✅ Corrections appliquées: ${corrected} fichiers`, 'green');
  log('='.repeat(80), 'cyan');
  log('\n⚠️  IMPORTANT:', 'yellow');
  log('   Redémarrer le serveur pour appliquer les corrections', 'white');
  log('   Puis réexécuter les tests: node scripts/test-automatique.mjs', 'white');
  log('\n');
}

main().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
}).finally(async () => {
  await pool.end();
});

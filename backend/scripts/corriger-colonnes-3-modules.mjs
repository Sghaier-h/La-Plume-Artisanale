/**
 * Script pour corriger les colonnes incorrectes dans les 3 modules
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
    `);
    return result.rows.map(r => r.column_name);
  } catch (error) {
    log(`  ⚠️  Erreur vérification ${tableName}: ${error.message}`, 'yellow');
    return [];
  }
}

// 1. Corriger pos_ventes
async function corrigerPosVentes() {
  log('\n📝 1. Correction pos_ventes', 'blue');
  
  const filePath = path.join(backendDir, 'modules/pos/controllers/pos_vente.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Vérifier colonnes de ventes_caisse
  const colsVentes = await verifierColonnes('ventes_caisse');
  log(`  Colonnes ventes_caisse: ${colsVentes.join(', ')}`, 'yellow');
  
  // Vérifier colonnes de lignes_vente_caisse
  const colsLignes = await verifierColonnes('lignes_vente_caisse');
  log(`  Colonnes lignes_vente_caisse: ${colsLignes.join(', ')}`, 'yellow');
  
  // Corriger WHERE id_vente dans getSale
  if (content.includes('WHERE id = $1') && colsVentes.includes('id')) {
    // C'est correct, pas besoin de changer
    log('  ✅ WHERE id correct', 'green');
  }
  
  // Corriger lignes_vente_caisse - vérifier quelle colonne est utilisée
  if (content.includes('WHERE id = $1') && colsLignes.includes('id_vente')) {
    // La requête pour les lignes doit utiliser id_vente
    content = content.replace(
      /const linesQuery = `SELECT \* FROM lignes_vente_caisse WHERE id = \$1`;/g,
      'const linesQuery = `SELECT * FROM lignes_vente_caisse WHERE id_vente = $1`;'
    );
    modified = true;
    log('  ✅ WHERE id → id_vente pour lignes_vente_caisse', 'green');
  }
  
  // Corriger INSERT lignes_vente_caisse
  if (content.includes('id_vente, id_product')) {
    // Vérifier les colonnes réelles
    if (colsLignes.includes('id_article') && !colsLignes.includes('id_product')) {
      content = content.replace(/id_product/g, 'id_article');
      modified = true;
      log('  ✅ id_product → id_article', 'green');
    }
  }
  
  // Corriger INSERT - vérifier les colonnes
  if (content.includes('INSERT INTO ventes_caisse')) {
    // Vérifier si statut existe
    if (!colsVentes.includes('statut')) {
      // Retirer statut de l'INSERT
      content = content.replace(
        /INSERT INTO ventes_caisse \(\s*id_session, montant_total, statut, created_by\s*\)/g,
        'INSERT INTO ventes_caisse (id_session, montant_total, created_by)'
      );
      content = content.replace(
        /VALUES \(\$1, \$2, 'confirmed', \$3\)/g,
        'VALUES ($1, $2, $3)'
      );
      modified = true;
      log('  ✅ INSERT corrigé (statut retiré)', 'green');
    } else {
      // Corriger l'ordre des valeurs
      content = content.replace(
        /VALUES \(\$1, \$2, NOW\(\), 'confirmed', \$3\)/g,
        "VALUES ($1, $2, 'confirmed', $3)"
      );
      modified = true;
      log('  ✅ VALUES corrigé', 'green');
    }
  }
  
  // Corriger id_vente dans les autres endroits
  if (content.includes('sale.id_vente') && colsVentes.includes('id')) {
    content = content.replace(/sale\.id_vente/g, 'sale.id');
    modified = true;
    log('  ✅ sale.id_vente → sale.id', 'green');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    log('  ✅ Fichier corrigé', 'green');
    return true;
  }
  
  log('  ✅ Fichier déjà correct', 'green');
  return false;
}

// 2. Corriger purchase-requests
async function corrigerPurchaseRequests() {
  log('\n📝 2. Correction purchase-requests', 'blue');
  
  const filePath = path.join(backendDir, 'modules/purchase-requests/controllers/purchase-requests.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Vérifier colonnes
  const cols = await verifierColonnes('demandes_achat');
  log(`  Colonnes demandes_achat: ${cols.join(', ')}`, 'yellow');
  
  // Corriger id_demande → id
  if (content.includes('id_demande') && cols.includes('id')) {
    content = content.replace(/WHERE id_demande = \$1/g, 'WHERE id = $1');
    content = content.replace(/WHERE id_demande = \$2/g, 'WHERE id = $2');
    content = content.replace(/WHERE id_demande = \$3/g, 'WHERE id = $3');
    content = content.replace(/pr\.id_demande/g, 'pr.id');
    modified = true;
    log('  ✅ id_demande → id', 'green');
  }
  
  // Vérifier lignes_demande_achat
  const colsLignes = await verifierColonnes('lignes_demande_achat');
  log(`  Colonnes lignes_demande_achat: ${colsLignes.join(', ')}`, 'yellow');
  
  // Si lignes_demande_achat utilise id_demande, garder id_demande
  if (colsLignes.includes('id_demande')) {
    log('  ✅ id_demande correct pour lignes_demande_achat', 'green');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    log('  ✅ Fichier corrigé', 'green');
    return true;
  }
  
  log('  ✅ Fichier déjà correct', 'green');
  return false;
}

// 3. Vérifier taches
async function verifierTaches() {
  log('\n📝 3. Vérification taches', 'blue');
  
  const filePath = path.join(backendDir, 'src/controllers/taches.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier colonnes
  const cols = await verifierColonnes('taches');
  log(`  Colonnes taches: ${cols.join(', ')}`, 'yellow');
  
  // Vérifier que toutes les colonnes utilisées existent
  const colonnesUtilisees = ['id_of', 'assigne_a', 'id_utilisateur', 'assigne_par', 'id_machine', 'priorite', 'created_at'];
  const manquantes = colonnesUtilisees.filter(c => !cols.includes(c));
  
  if (manquantes.length > 0) {
    log(`  ⚠️  Colonnes manquantes: ${manquantes.join(', ')}`, 'yellow');
  } else {
    log('  ✅ Toutes les colonnes existent', 'green');
  }
  
  // Vérifier ORDER BY
  if (content.includes('COALESCE(t.created_at, t.id)')) {
    log('  ✅ ORDER BY correct', 'green');
  }
  
  return false; // Pas de modification nécessaire
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION DES COLONNES - 3 MODULES', 'cyan');
  log('='.repeat(80), 'cyan');
  
  let corrected = 0;
  
  if (await corrigerPosVentes()) corrected++;
  if (await corrigerPurchaseRequests()) corrected++;
  await verifierTaches();
  
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

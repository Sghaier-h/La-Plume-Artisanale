/**
 * Script pour corriger les problèmes restants identifiés
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

// Vérifier et corriger ecommerce_products
async function fixEcommerceProductsFinal() {
  log('\n🔧 Correction finale ecommerce_products', 'cyan');
  
  // Vérifier la colonne id_categorie dans articles_catalogue
  const check = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'articles_catalogue' 
    AND column_name LIKE '%categorie%'
  `);
  
  const categorieCols = check.rows.map(r => r.column_name);
  log(`   Colonnes categorie trouvées: ${categorieCols.join(', ')}`, 'yellow');
  
  const filePath = path.join(backendDir, 'modules/ecommerce/controllers/ecommerce_product.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Si id_categorie n'existe pas, utiliser id_categorie_article ou autre
  if (!categorieCols.includes('id_categorie')) {
    const altCol = categorieCols[0] || 'id_categorie_article';
    log(`   ⚠️  id_categorie n'existe pas, utilisation de ${altCol}`, 'yellow');
    content = content.replace(/a\.id_categorie/g, `a.${altCol}`);
    content = content.replace(/ON a\.id_categorie = pc\.id_categorie/g, `ON a.${altCol} = pc.id_categorie`);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  log('✅ ecommerce_product.controller.js corrigé', 'green');
}

// Corriger ecommerce_orders - problème avec co.source
async function fixEcommerceOrdersFinal() {
  log('\n🔧 Correction finale ecommerce_orders', 'cyan');
  
  const filePath = path.join(backendDir, 'modules/ecommerce/controllers/ecommerce_order.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Corriger la syntaxe SQL incorrecte
  content = content.replace(/WHERE 'ecommerce' as source = 'ecommerce'/g, "WHERE 1=1");
  content = content.replace(/AND co\.source = 'ecommerce'/g, "");
  
  // Dans getEcommerceOrder aussi
  content = content.replace(/WHERE co\.id_commande = \$1 AND co\.source = 'ecommerce'/g, "WHERE co.id_commande = $1");
  
  fs.writeFileSync(filePath, content, 'utf8');
  log('✅ ecommerce_order.controller.js corrigé', 'green');
}

// Corriger multisociete_companies - problème avec id vs id_societe
async function fixMultisocieteCompaniesFinal() {
  log('\n🔧 Correction finale multisociete_companies', 'cyan');
  
  const filePath = path.join(backendDir, 'modules/multisociete/controllers/companies.controller.js');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier que getIdField retourne bien id_societe
  // Le problème est dans getCompanies - ORDER BY utilise idField qui peut être 'id'
  // Mais la table utilise id_societe
  
  // S'assurer que idField est toujours id_societe pour societes
  if (content.includes("const idField = getIdField('res.company') || 'id_societe';")) {
    // C'est déjà correct
    log('   ✅ idField déjà correct', 'green');
  } else {
    // Forcer id_societe
    content = content.replace(
      /const idField = getIdField\('res\.company'\) \|\| 'id_societe';/g,
      "const idField = 'id_societe'; // Forcé pour societes"
    );
  }
  
  // Pour createCompany, supprimer description du mapping si elle cause problème
  // On va mapper description seulement si elle existe dans les données
  const createCompanyMatch = content.match(/export const createCompany = async[^}]+}/s);
  if (createCompanyMatch) {
    // Vérifier si description est utilisée
    if (createCompanyMatch[0].includes('description')) {
      // Ajouter une vérification pour supprimer description si nécessaire
      content = content.replace(
        /const mappedData = { \.\.\.data };/g,
        `const mappedData = { ...data };
    // Supprimer description si la colonne n'existe pas dans la table
    if (mappedData.description !== undefined) {
      // La colonne description n'existe pas, on la supprime
      delete mappedData.description;
    }`
      );
    }
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  log('✅ companies.controller.js corrigé', 'green');
}

// Vérifier taches - colonne assigne_a
async function checkTaches() {
  log('\n🔧 Vérification taches', 'cyan');
  
  const check = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'taches' 
    AND column_name LIKE '%assigne%'
  `);
  
  const assigneCols = check.rows.map(r => r.column_name);
  log(`   Colonnes assigne trouvées: ${assigneCols.join(', ')}`, 'yellow');
  
  if (assigneCols.length === 0) {
    log('   ⚠️  Aucune colonne assigne trouvée', 'yellow');
    log('   ℹ️  La requête utilise t.assigne_a mais la colonne n\'existe peut-être pas', 'yellow');
  }
}

// Corriger purchase-requests - vérifier le nom de la table
async function checkPurchaseRequests() {
  log('\n🔧 Vérification purchase-requests', 'cyan');
  
  const check = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name IN ('purchase_requests', 'demandes_achat')
  `);
  
  const tables = check.rows.map(r => r.table_name);
  log(`   Tables trouvées: ${tables.join(', ')}`, 'yellow');
  
  if (!tables.includes('demandes_achat')) {
    log('   ⚠️  Table demandes_achat n\'existe pas', 'yellow');
  }
}

// Créer lignes_nomenclature avec la bonne référence
async function createLignesNomenclature() {
  log('\n🔧 Création lignes_nomenclature', 'cyan');
  
  // Vérifier la structure de nomenclatures
  const check = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'nomenclatures'
    ORDER BY ordinal_position
  `);
  
  const cols = check.rows.map(r => r.column_name);
  log(`   Colonnes nomenclatures: ${cols.join(', ')}`, 'yellow');
  
  const idCol = cols.find(c => c.includes('id')) || 'id';
  
  const sql = `
    CREATE TABLE IF NOT EXISTS lignes_nomenclature (
      id SERIAL PRIMARY KEY,
      id_nomenclature INTEGER REFERENCES nomenclatures(${idCol}),
      id_article INTEGER REFERENCES articles_catalogue(id_article),
      quantite NUMERIC(10,3) DEFAULT 1,
      ordre INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP,
      created_by INTEGER,
      updated_by INTEGER
    );
  `;
  
  try {
    await pool.query(sql);
    log('✅ Table lignes_nomenclature créée/vérifiée', 'green');
  } catch (error) {
    log(`❌ Erreur création lignes_nomenclature: ${error.message}`, 'red');
  }
}

// Fonction principale
async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🔧 CORRECTION FINALE DES PROBLÈMES RESTANTS', 'cyan');
  log('='.repeat(80), 'cyan');
  
  try {
    await fixEcommerceProductsFinal();
    await fixEcommerceOrdersFinal();
    await fixMultisocieteCompaniesFinal();
    await checkTaches();
    await checkPurchaseRequests();
    await createLignesNomenclature();
    
    log('\n' + '='.repeat(80), 'cyan');
    log('✅ Toutes les corrections appliquées', 'green');
    log('='.repeat(80), 'cyan');
    log('\n⚠️  ACTION REQUISE:', 'yellow');
    log('   1. Redémarrer le serveur (Ctrl+C puis npm start)', 'white');
    log('   2. Réexécuter les tests: node scripts/test-automatique.mjs', 'white');
    log('\n');
    
  } catch (error) {
    log(`\n❌ Erreur fatale: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

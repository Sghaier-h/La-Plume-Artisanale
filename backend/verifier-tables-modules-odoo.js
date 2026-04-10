/**
 * Script de vérification des tables nécessaires pour les modules Odoo
 * Vérifie que toutes les tables requises existent dans la base de données
 */

import { pool } from './src/utils/db.js';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Mapping des modèles Odoo vers les tables SQL
const MODEL_TO_TABLE_MAPPING = {
  // Module Base
  'res.users': 'utilisateurs',
  'res.partner': 'clients', // ou fournisseurs
  
  // Module Sale
  'sale.order': 'commandes',
  'sale.order.line': 'commandes_lignes',
  
  // Module Product
  'product.template': 'articles',
  'product.category': 'categories_articles',
  
  // Module Stock
  'stock.warehouse': 'entrepots',
  'stock.location': 'emplacements',
  'stock.move': 'mouvements_stock',
  'stock.picking': 'receptions',
  
  // Module MRP
  'mrp.production': 'ordres_fabrication',
  'mrp.bom': 'nomenclatures',
  
  // Module Account
  'account.move': 'factures', // factures_clients ou factures_fournisseurs
  
  // Module Purchase
  'purchase.order': 'commandes_fournisseurs' // ou commandes_achat
};

// Tables alternatives (si plusieurs noms possibles)
const TABLE_ALTERNATIVES = {
  'res.partner': ['clients', 'fournisseurs'],
  'account.move': ['factures_clients', 'factures_fournisseurs', 'factures'],
  'purchase.order': ['commandes_fournisseurs', 'commandes_achat']
};

/**
 * Vérifie si une table existe
 */
async function tableExists(tableName) {
  try {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `;
    const result = await pool.query(query, [tableName]);
    return result.rows[0].exists;
  } catch (error) {
    return false;
  }
}

/**
 * Liste toutes les tables de la base de données
 */
async function listAllTables() {
  try {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const result = await pool.query(query);
    return result.rows.map(row => row.table_name);
  } catch (error) {
    logError(`Erreur lors de la liste des tables: ${error.message}`);
    return [];
  }
}

/**
 * Vérifie la structure d'une table
 */
async function checkTableStructure(tableName) {
  try {
    const query = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position;
    `;
    const result = await pool.query(query, [tableName]);
    return result.rows;
  } catch (error) {
    logError(`Erreur lors de la vérification de la structure: ${error.message}`);
    return [];
  }
}

/**
 * Vérifie toutes les tables nécessaires
 */
async function verifyAllTables() {
  logInfo('Vérification des tables nécessaires pour les modules Odoo...\n');

  const allTables = await listAllTables();
  logInfo(`Tables existantes dans la base: ${allTables.length}\n`);

  const results = {
    found: [],
    missing: [],
    alternatives: []
  };

  // Vérifier chaque modèle
  for (const [modelName, tableName] of Object.entries(MODEL_TO_TABLE_MAPPING)) {
    const alternatives = TABLE_ALTERNATIVES[modelName] || [];
    const tablesToCheck = [tableName, ...alternatives];
    
    let found = false;
    let foundTable = null;

    for (const table of tablesToCheck) {
      const exists = await tableExists(table);
      if (exists) {
        found = true;
        foundTable = table;
        break;
      }
    }

    if (found) {
      results.found.push({ model: modelName, table: foundTable });
      logSuccess(`${modelName} → ${foundTable}`);
      
      // Vérifier la structure
      const columns = await checkTableStructure(foundTable);
      if (columns.length > 0) {
        logInfo(`  → ${columns.length} colonnes trouvées`);
      }
    } else {
      results.missing.push({ model: modelName, expected: tableName, alternatives });
      logError(`${modelName} → ${tableName} (NON TROUVÉE)`);
      
      // Chercher des tables similaires
      const similar = allTables.filter(t => 
        t.toLowerCase().includes(tableName.substring(0, 5).toLowerCase()) ||
        tableName.substring(0, 5).toLowerCase().includes(t.substring(0, 5).toLowerCase())
      );
      
      if (similar.length > 0) {
        logWarning(`  → Tables similaires trouvées: ${similar.join(', ')}`);
        results.alternatives.push({ model: modelName, similar });
      }
    }
  }

  return results;
}

/**
 * Génère un rapport détaillé
 */
function generateReport(results, allTables) {
  console.log('\n' + '='.repeat(60));
  log('📊 RAPPORT DE VÉRIFICATION DES TABLES', 'cyan');
  console.log('='.repeat(60) + '\n');

  logInfo(`Tables trouvées: ${results.found.length}`);
  for (const item of results.found) {
    logSuccess(`  ${item.model} → ${item.table}`);
  }

  console.log('');

  if (results.missing.length > 0) {
    logWarning(`Tables manquantes: ${results.missing.length}`);
    for (const item of results.missing) {
      logError(`  ${item.model} → ${item.expected}`);
      if (item.alternatives.length > 0) {
        logInfo(`    Alternatives: ${item.alternatives.join(', ')}`);
      }
    }
  } else {
    logSuccess('Toutes les tables nécessaires sont présentes !');
  }

  console.log('');

  if (results.alternatives.length > 0) {
    logInfo('Tables similaires trouvées:');
    for (const item of results.alternatives) {
      logWarning(`  ${item.model}: ${item.similar.join(', ')}`);
    }
  }

  console.log('');
  console.log('='.repeat(60));
  log(`📈 Résultat: ${results.found.length}/${Object.keys(MODEL_TO_TABLE_MAPPING).length} tables trouvées`, 
      results.missing.length === 0 ? 'green' : 'yellow');
  console.log('='.repeat(60));
}

/**
 * Test principal
 */
async function runVerification() {
  try {
    // Test de connexion
    logInfo('Test de connexion à la base de données...');
    await pool.query('SELECT 1');
    logSuccess('Connexion réussie\n');

    // Vérifier les tables
    const results = await verifyAllTables();
    const allTables = await listAllTables();
    
    // Générer le rapport
    generateReport(results, allTables);

    // Recommandations
    if (results.missing.length > 0) {
      console.log('\n' + '='.repeat(60));
      log('💡 RECOMMANDATIONS', 'cyan');
      console.log('='.repeat(60));
      
      logInfo('Pour que tous les modules fonctionnent, vous devez:');
      console.log('');
      
      for (const item of results.missing) {
        logWarning(`1. Créer la table "${item.expected}" pour le modèle ${item.model}`);
        if (item.alternatives.length > 0) {
          logInfo(`   Ou adapter le modèle pour utiliser: ${item.alternatives.join(', ')}`);
        }
      }
      
      console.log('');
      logInfo('Vous pouvez:');
      logInfo('  - Exécuter les scripts SQL dans database/');
      logInfo('  - Adapter les modèles pour utiliser les tables existantes');
      logInfo('  - Créer les tables manquantes');
    }

    await pool.end();
    process.exit(results.missing.length === 0 ? 0 : 1);
  } catch (error) {
    logError(`Erreur fatale: ${error.message}`);
    console.error(error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      logWarning('\n💡 La base de données n\'est pas accessible.');
      logInfo('   Vérifiez que PostgreSQL est démarré et que les paramètres de connexion sont corrects.');
    }
    
    process.exit(1);
  }
}

// Exécuter la vérification
runVerification();

/**
 * Script pour vérifier l'existence des tables dans la base de données
 * Vérifie que toutes les tables correspondant aux contrôleurs génériques existent
 */

import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const { Pool } = pg;

// Configuration de la connexion à la base de données (même config que db.js)
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fouta_erp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

const pool = new Pool(poolConfig);

// Mapping des contrôleurs vers leurs tables
const controllerToTable = {
  'mobile': 'mobile',
  'email': 'email',
  'settings': 'settings',
  'multisociete': 'multisociete',
  'whatsapp': 'whatsapp',
  'social-auth': 'social_auth',
  'ai': 'ai',
  'warehouse': 'warehouse',
  'accounting-tunisia': 'accounting_tunisia',
  'payroll-tunisia': 'payroll_tunisia',
  'pos': 'pos',
  'excel-import': 'excel_import',
  'audit': 'audit',
  'utilisateurs': 'utilisateurs',
  'pointage': 'pointage',
  'database': 'database',
  'migration': 'migration',
  'webhooks': 'webhooks',
  'ecommerce': 'ecommerce',
  'communication': 'communication',
  'reports': 'reports',
  'couts': 'couts',
  'qualite-avance': 'qualite_avance',
  'planification-gantt': 'planification_gantt',
  'maintenance': 'maintenance',
  'produits': 'produits',
  'messages': 'messages',
  'notifications': 'notifications',
  'taches': 'taches',
  'documents': 'documents',
  'qualite-avancee': 'qualite_avancee',
  'tracabilite-lots': 'tracabilite_lots',
  'stock-multi-entrepots': 'stock_multi_entrepots',
  'planning-dragdrop': 'planning_dragdrop',
  'selecteurs-machines': 'selecteurs_machines',
  'articles-catalogue': 'articles_catalogue',
  'modeles': 'modeles',
  'parametres-catalogue': 'parametres_catalogue',
  'suivi-fabrication': 'suivi_fabrication',
  'matieres-premieres': 'matieres_premieres',
  'parametrage': 'parametrage',
  'planning': 'planning',
  'production': 'production',
  'dashboard': 'dashboard',
  'soustraitants': 'soustraitants',
  'of': 'of',
  'machines': 'machines',
  'bons-retour': 'bons_retour',
  'bons-livraison': 'bons_livraison',
  'avoirs': 'avoirs',
  'search': 'search'
};

// Fonction pour extraire le nom de la table depuis le contrôleur
function getTableName(controllerName) {
  return controllerToTable[controllerName] || controllerName.replace(/-/g, '_');
}

// Fonction pour extraire l'ID field depuis le contrôleur
function getTableInfo(controllerName) {
  const modulesPath = path.join(__dirname, '../modules');
  const controllerPath = path.join(modulesPath, controllerName, 'controllers', `${controllerName}.controller.js`);
  
  if (!fs.existsSync(controllerPath)) {
    return { table: getTableName(controllerName), idField: `id_${controllerName.replace(/-/g, '_')}` };
  }
  
  const content = fs.readFileSync(controllerPath, 'utf8');
  const selectMatch = content.match(/SELECT\s+\*\s+FROM\s+(\w+)/i);
  const whereMatch = content.match(/WHERE\s+(\w+)\s*=\s*\$1/i);
  
  return {
    table: selectMatch ? selectMatch[1] : getTableName(controllerName),
    idField: whereMatch ? whereMatch[1] : `id_${controllerName.replace(/-/g, '_')}`
  };
}

// Fonction pour vérifier si une table existe
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
    console.error(`Erreur lors de la vérification de la table ${tableName}:`, error.message);
    return false;
  }
}

// Fonction pour obtenir les colonnes d'une table
async function getTableColumns(tableName) {
  try {
    const query = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position;
    `;
    const result = await pool.query(query, [tableName]);
    return result.rows;
  } catch (error) {
    console.error(`Erreur lors de la récupération des colonnes de ${tableName}:`, error.message);
    return [];
  }
}

// Fonction pour vérifier si une colonne existe
async function columnExists(tableName, columnName) {
  try {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = $1
        AND column_name = $2
      );
    `;
    const result = await pool.query(query, [tableName, columnName]);
    return result.rows[0].exists;
  } catch (error) {
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🔍 Vérification des tables dans la base de données\n');
  console.log('='.repeat(80));

  // Afficher la configuration
  console.log('📊 Configuration de connexion:');
  console.log(`   Host: ${poolConfig.host}`);
  console.log(`   Port: ${poolConfig.port}`);
  console.log(`   Database: ${poolConfig.database}`);
  console.log(`   User: ${poolConfig.user}`);
  console.log(`   Password: ${poolConfig.password ? '***' : 'NON DÉFINI'}\n`);

  // Tester la connexion
  let connectionOk = false;
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion à la base de données réussie\n');
    connectionOk = true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    console.error(`   Code: ${error.code || 'N/A'}`);
    console.error('\n💡 Vérifiez:');
    console.error('   - Que PostgreSQL est démarré et accessible');
    console.error('   - Les variables d\'environnement dans .env');
    console.error('   - Les paramètres de connexion (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)');
    console.error('   - Que l\'IP est autorisée (si base distante)');
    console.error('\n⚠️  Le script va continuer avec une vérification statique uniquement.\n');
  }

  const controllers = Object.keys(controllerToTable);
  const results = [];
  let tablesExist = 0;
  let tablesMissing = 0;
  let idFieldsExist = 0;
  let idFieldsMissing = 0;

  console.log(`📦 Vérification de ${controllers.length} contrôleurs...\n`);

  if (!connectionOk) {
    // Mode statique uniquement : extraire les infos des contrôleurs
    console.log('📋 Mode statique : extraction des informations depuis les contrôleurs...\n');
    
    for (const controller of controllers) {
      const { table, idField } = getTableInfo(controller);
      
      const result = {
        controller,
        table,
        idField,
        tableExists: false, // Inconnu sans connexion
        idFieldExists: false,
        columnCount: 0,
        columns: []
      };

      results.push(result);
      console.log(`   ${controller} -> ${table} (ID: ${idField})`);
    }
    
    console.log('\n⚠️  Impossible de vérifier l\'existence des tables sans connexion à la base de données.');
    console.log('   Les informations ci-dessus sont extraites des contrôleurs.\n');
  } else {
    // Mode avec connexion : vérifier réellement
    for (const controller of controllers) {
      const { table, idField } = getTableInfo(controller);
      const exists = await tableExists(table);
      const idFieldExists = exists ? await columnExists(table, idField) : false;
      const columns = exists ? await getTableColumns(table) : [];

      const result = {
        controller,
        table,
        idField,
        tableExists: exists,
        idFieldExists,
        columnCount: columns.length,
        columns: columns.map(c => c.column_name)
      };

      results.push(result);

      if (exists) {
        tablesExist++;
        if (idFieldExists) {
          idFieldsExist++;
          console.log(`✅ ${controller} -> ${table} (${idField} existe, ${columns.length} colonnes)`);
        } else {
          idFieldsMissing++;
          console.log(`⚠️  ${controller} -> ${table} (${idField} MANQUANT, ${columns.length} colonnes)`);
        }
      } else {
        tablesMissing++;
        console.log(`❌ ${controller} -> ${table} (TABLE MANQUANTE)`);
      }
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(80));
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(80));
  console.log(`📦 Contrôleurs vérifiés: ${controllers.length}`);
  
  if (connectionOk) {
    console.log(`✅ Tables existantes: ${tablesExist}/${controllers.length} (${Math.round(tablesExist/controllers.length*100)}%)`);
    console.log(`❌ Tables manquantes: ${tablesMissing}/${controllers.length}`);
    console.log(`✅ ID Fields existants: ${idFieldsExist}/${tablesExist} (${tablesExist > 0 ? Math.round(idFieldsExist/tablesExist*100) : 0}%)`);
    console.log(`⚠️  ID Fields manquants: ${idFieldsMissing}/${tablesExist}`);
  } else {
    console.log(`⚠️  Vérification statique uniquement (pas de connexion à la base de données)`);
    console.log(`📋 Tables attendues: ${controllers.length}`);
    console.log(`\n💡 Pour une vérification complète, corrigez la connexion et relancez le script.`);
  }

  // Tables manquantes
  if (tablesMissing > 0) {
    console.log('\n❌ Tables manquantes:');
    results
      .filter(r => !r.tableExists)
      .forEach(r => {
        console.log(`   - ${r.controller} -> ${r.table}`);
      });
  }

  // ID Fields manquants
  if (idFieldsMissing > 0) {
    console.log('\n⚠️  ID Fields manquants:');
    results
      .filter(r => r.tableExists && !r.idFieldExists)
      .forEach(r => {
        console.log(`   - ${r.controller} -> ${r.table}.${r.idField}`);
        console.log(`     Colonnes disponibles: ${r.columns.slice(0, 5).join(', ')}${r.columns.length > 5 ? '...' : ''}`);
      });
  }

  // Détails par contrôleur
  console.log('\n' + '='.repeat(80));
  console.log('📋 Détails par contrôleur');
  console.log('='.repeat(80));
  
  results.forEach(result => {
    const status = result.tableExists 
      ? (result.idFieldExists ? '✅' : '⚠️') 
      : '❌';
    console.log(`\n${status} ${result.controller}:`);
    console.log(`   Table: ${result.table} ${result.tableExists ? '(existe)' : '(MANQUANTE)'}`);
    console.log(`   ID Field: ${result.idField} ${result.idFieldExists ? '(existe)' : '(MANQUANT)'}`);
    if (result.tableExists) {
      console.log(`   Colonnes: ${result.columnCount}`);
      if (result.columns.length > 0 && result.columns.length <= 10) {
        console.log(`   Liste: ${result.columns.join(', ')}`);
      } else if (result.columns.length > 10) {
        console.log(`   Liste: ${result.columns.slice(0, 10).join(', ')}... (+${result.columns.length - 10} autres)`);
      }
    }
  });

  // Générer un script SQL pour créer les tables manquantes
  if (tablesMissing > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('💡 Script SQL suggéré pour créer les tables manquantes');
    console.log('='.repeat(80));
    console.log('\n-- Tables manquantes à créer:\n');
    
    results
      .filter(r => !r.tableExists)
      .forEach(r => {
        console.log(`-- Table: ${r.table} (pour contrôleur: ${r.controller})`);
        console.log(`CREATE TABLE IF NOT EXISTS ${r.table} (`);
        console.log(`  ${r.idField} SERIAL PRIMARY KEY,`);
        console.log(`  name VARCHAR(255),`);
        console.log(`  description TEXT,`);
        console.log(`  active BOOLEAN DEFAULT true,`);
        console.log(`  created_at TIMESTAMP DEFAULT NOW(),`);
        console.log(`  updated_at TIMESTAMP,`);
        console.log(`  created_by INTEGER,`);
        console.log(`  updated_by INTEGER`);
        console.log(`);\n`);
      });
  }

  // Fermer la connexion
  await pool.end();
  
  console.log('\n✅ Vérification terminée\n');
}

// Exécuter
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

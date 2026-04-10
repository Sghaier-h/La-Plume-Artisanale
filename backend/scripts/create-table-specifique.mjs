/**
 * Script pour créer une table spécifique ou toutes les tables manquantes
 * Utile pour créer rapidement une table qui manque
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

// Configuration de la connexion
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

// Mapping des tables
const tablesConfig = {
  'qualite_avancee': { idField: 'id_qualite', controller: 'qualite-avancee' },
  'qualite_avance': { idField: 'id_qualite', controller: 'qualite-avance' },
  'mobile': { idField: 'id_mobile', controller: 'mobile' },
  'email': { idField: 'id_email', controller: 'email' },
  'settings': { idField: 'id_settings', controller: 'settings' },
  'multisociete': { idField: 'id_multisociete', controller: 'multisociete' },
  'whatsapp': { idField: 'id_whatsapp', controller: 'whatsapp' },
  'social_auth': { idField: 'id_social', controller: 'social-auth' },
  'ai': { idField: 'id_ai', controller: 'ai' },
  'warehouse': { idField: 'id_warehouse', controller: 'warehouse' },
  'accounting_tunisia': { idField: 'id_accounting', controller: 'accounting-tunisia' },
  'payroll_tunisia': { idField: 'id_payroll', controller: 'payroll-tunisia' },
  'pos': { idField: 'id_pos', controller: 'pos' },
  'excel_import': { idField: 'id_excel', controller: 'excel-import' },
  'audit': { idField: 'id_audit', controller: 'audit' },
  'utilisateurs': { idField: 'id_utilisateurs', controller: 'utilisateurs' },
  'pointage': { idField: 'id_pointage', controller: 'pointage' },
  'database': { idField: 'id_database', controller: 'database' },
  'migration': { idField: 'id_migration', controller: 'migration' },
  'webhooks': { idField: 'id_webhooks', controller: 'webhooks' },
  'ecommerce': { idField: 'id_ecommerce', controller: 'ecommerce' },
  'communication': { idField: 'id_communication', controller: 'communication' },
  'reports': { idField: 'id_reports', controller: 'reports' },
  'couts': { idField: 'id_couts', controller: 'couts' },
  'planification_gantt': { idField: 'id_planification', controller: 'planification-gantt' },
  'maintenance': { idField: 'id_maintenance', controller: 'maintenance' },
  'produits': { idField: 'id_produits', controller: 'produits' },
  'messages': { idField: 'id_messages', controller: 'messages' },
  'notifications': { idField: 'id_notifications', controller: 'notifications' },
  'taches': { idField: 'id_taches', controller: 'taches' },
  'documents': { idField: 'id_documents', controller: 'documents' },
  'tracabilite_lots': { idField: 'id_tracabilite', controller: 'tracabilite-lots' },
  'stock_multi_entrepots': { idField: 'id_stock', controller: 'stock-multi-entrepots' },
  'planning_dragdrop': { idField: 'id_planning', controller: 'planning-dragdrop' },
  'selecteurs_machines': { idField: 'id_selecteurs', controller: 'selecteurs-machines' },
  'articles_catalogue': { idField: 'id_articles', controller: 'articles-catalogue' },
  'modeles': { idField: 'id_modeles', controller: 'modeles' },
  'parametres_catalogue': { idField: 'id_parametres', controller: 'parametres-catalogue' },
  'suivi_fabrication': { idField: 'id_suivi', controller: 'suivi-fabrication' },
  'matieres_premieres': { idField: 'id_matieres', controller: 'matieres-premieres' },
  'parametrage': { idField: 'id_parametrage', controller: 'parametrage' },
  'planning': { idField: 'id_planning', controller: 'planning' },
  'production': { idField: 'id_production', controller: 'production' },
  'dashboard': { idField: 'id_dashboard', controller: 'dashboard' },
  'soustraitants': { idField: 'id_soustraitants', controller: 'soustraitants' },
  'of': { idField: 'id_of', controller: 'of' },
  'machines': { idField: 'id_machines', controller: 'machines' },
  'bons_retour': { idField: 'id_bons', controller: 'bons-retour' },
  'bons_livraison': { idField: 'id_bons', controller: 'bons-livraison' },
  'avoirs': { idField: 'id_avoirs', controller: 'avoirs' },
  'search': { idField: 'id_search', controller: 'search' }
};

function createTableSQL(tableName, idField) {
  return `CREATE TABLE IF NOT EXISTS ${tableName} (
  ${idField} SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  created_by INTEGER,
  updated_by INTEGER
);`;
}

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

async function main() {
  const tableName = process.argv[2] || 'qualite_avancee'; // Par défaut, créer qualite_avancee
  
  console.log(`🚀 Création de la table: ${tableName}\n`);
  console.log('='.repeat(80));

  // Vérifier si la table est dans la config
  if (!tablesConfig[tableName]) {
    console.error(`❌ Table "${tableName}" non trouvée dans la configuration.`);
    console.log('\nTables disponibles:');
    Object.keys(tablesConfig).forEach(t => console.log(`   - ${t}`));
    process.exit(1);
  }

  const config = tablesConfig[tableName];
  const pool = new Pool(poolConfig);

  console.log('📊 Configuration de connexion:');
  console.log(`   Host: ${poolConfig.host}`);
  console.log(`   Port: ${poolConfig.port}`);
  console.log(`   Database: ${poolConfig.database}`);
  console.log(`   User: ${poolConfig.user}\n`);

  try {
    // Tester la connexion
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion à la base de données réussie\n');

    // Vérifier si la table existe
    const exists = await tableExists(tableName);
    
    if (exists) {
      console.log(`⚠️  La table "${tableName}" existe déjà.`);
      await pool.end();
      process.exit(0);
    }

    // Créer la table
    console.log(`📦 Création de la table "${tableName}"...`);
    const sql = createTableSQL(tableName, config.idField);
    await pool.query(sql);
    console.log(`✅ Table "${tableName}" créée avec succès (ID: ${config.idField})`);

    // Vérifier
    const verified = await tableExists(tableName);
    if (verified) {
      console.log(`✅ Vérification: La table "${tableName}" existe maintenant.`);
    } else {
      console.log(`⚠️  Vérification: La table "${tableName}" n'a pas été trouvée après création.`);
    }

    await pool.end();
    console.log('\n✅ Terminé\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(`   Code: ${error.code || 'N/A'}`);
    
    if (error.code === '28P01') {
      console.error('\n💡 Erreur d\'authentification. Vérifiez les identifiants dans .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Impossible de se connecter. Vérifiez que PostgreSQL est démarré.');
    }
    
    await pool.end();
    process.exit(1);
  }
}

main();

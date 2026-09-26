/**
 * Script pour créer automatiquement toutes les tables
 * Version avec génération de script SQL et exécution optionnelle
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
const tablesConfig = [
  { controller: 'mobile', table: 'mobile', idField: 'id_mobile' },
  { controller: 'email', table: 'email', idField: 'id_email' },
  { controller: 'settings', table: 'settings', idField: 'id_settings' },
  { controller: 'multisociete', table: 'multisociete', idField: 'id_multisociete' },
  { controller: 'whatsapp', table: 'whatsapp', idField: 'id_whatsapp' },
  { controller: 'social-auth', table: 'social_auth', idField: 'id_social' },
  { controller: 'ai', table: 'ai', idField: 'id_ai' },
  { controller: 'warehouse', table: 'warehouse', idField: 'id_warehouse' },
  { controller: 'accounting-tunisia', table: 'accounting_tunisia', idField: 'id_accounting' },
  { controller: 'payroll-tunisia', table: 'payroll_tunisia', idField: 'id_payroll' },
  { controller: 'pos', table: 'pos', idField: 'id_pos' },
  { controller: 'excel-import', table: 'excel_import', idField: 'id_excel' },
  { controller: 'audit', table: 'audit', idField: 'id_audit' },
  { controller: 'utilisateurs', table: 'utilisateurs', idField: 'id_utilisateurs' },
  { controller: 'pointage', table: 'pointage', idField: 'id_pointage' },
  { controller: 'database', table: 'database', idField: 'id_database' },
  { controller: 'migration', table: 'migration', idField: 'id_migration' },
  { controller: 'webhooks', table: 'webhooks', idField: 'id_webhooks' },
  { controller: 'ecommerce', table: 'ecommerce', idField: 'id_ecommerce' },
  { controller: 'communication', table: 'communication', idField: 'id_communication' },
  { controller: 'reports', table: 'reports', idField: 'id_reports' },
  { controller: 'couts', table: 'couts', idField: 'id_couts' },
  { controller: 'qualite-avance', table: 'qualite_avance', idField: 'id_qualite' },
  { controller: 'planification-gantt', table: 'planification_gantt', idField: 'id_planification' },
  { controller: 'maintenance', table: 'maintenance', idField: 'id_maintenance' },
  { controller: 'produits', table: 'produits', idField: 'id_produits' },
  { controller: 'messages', table: 'messages', idField: 'id_messages' },
  { controller: 'notifications', table: 'notifications', idField: 'id_notifications' },
  { controller: 'taches', table: 'taches', idField: 'id_taches' },
  { controller: 'documents', table: 'documents', idField: 'id_documents' },
  { controller: 'qualite-avancee', table: 'qualite_avancee', idField: 'id_qualite' },
  { controller: 'tracabilite-lots', table: 'tracabilite_lots', idField: 'id_tracabilite' },
  { controller: 'stock-multi-entrepots', table: 'stock_multi_entrepots', idField: 'id_stock' },
  { controller: 'planning-dragdrop', table: 'planning_dragdrop', idField: 'id_planning' },
  { controller: 'selecteurs-machines', table: 'selecteurs_machines', idField: 'id_selecteurs' },
  { controller: 'articles-catalogue', table: 'articles_catalogue', idField: 'id_articles' },
  { controller: 'modeles', table: 'modeles', idField: 'id_modeles' },
  { controller: 'parametres-catalogue', table: 'parametres_catalogue', idField: 'id_parametres' },
  { controller: 'suivi-fabrication', table: 'suivi_fabrication', idField: 'id_suivi' },
  { controller: 'matieres-premieres', table: 'matieres_premieres', idField: 'id_matieres' },
  { controller: 'parametrage', table: 'parametrage', idField: 'id_parametrage' },
  { controller: 'planning', table: 'planning', idField: 'id_planning' },
  { controller: 'production', table: 'production', idField: 'id_production' },
  { controller: 'dashboard', table: 'dashboard', idField: 'id_dashboard' },
  { controller: 'soustraitants', table: 'soustraitants', idField: 'id_soustraitants' },
  { controller: 'of', table: 'of', idField: 'id_of' },
  { controller: 'machines', table: 'machines', idField: 'id_machines' },
  { controller: 'bons-retour', table: 'bons_retour', idField: 'id_bons' },
  { controller: 'bons-livraison', table: 'bons_livraison', idField: 'id_bons' },
  { controller: 'avoirs', table: 'avoirs', idField: 'id_avoirs' },
  { controller: 'search', table: 'search', idField: 'id_search' }
];

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

async function main() {
  console.log('🚀 Création des tables pour les contrôleurs génériques\n');
  console.log('='.repeat(80));

  // Générer le script SQL
  const sqlPath = path.join(__dirname, 'create-tables-generiques-executable.sql');
  let sqlContent = `-- Script SQL généré automatiquement pour créer les tables des contrôleurs génériques
-- Base de données: ${poolConfig.database}
-- Date: ${new Date().toISOString()}

-- Note: Ce script crée les tables avec une structure de base standard
-- Vous pouvez adapter les colonnes selon vos besoins métier spécifiques

`;

  tablesConfig.forEach(config => {
    sqlContent += `-- Table: ${config.table} (contrôleur: ${config.controller})\n`;
    sqlContent += createTableSQL(config.table, config.idField);
    sqlContent += '\n\n';
  });

  sqlContent += `-- Fin du script
-- Total: ${tablesConfig.length} tables créées\n`;

  // Écrire le fichier SQL
  fs.writeFileSync(sqlPath, sqlContent, 'utf8');
  console.log(`✅ Script SQL généré: ${sqlPath}\n`);

  // Essayer de se connecter et créer les tables
  const pool = new Pool(poolConfig);
  
  console.log('📊 Configuration de connexion:');
  console.log(`   Host: ${poolConfig.host}`);
  console.log(`   Port: ${poolConfig.port}`);
  console.log(`   Database: ${poolConfig.database}`);
  console.log(`   User: ${poolConfig.user}`);
  console.log(`   Password: ${poolConfig.password ? '***' : 'NON DÉFINI'}\n`);

  let connectionOk = false;
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connexion à la base de données réussie\n');
    connectionOk = true;
  } catch (error) {
    console.log('⚠️  Impossible de se connecter à la base de données automatiquement.');
    console.log(`   Erreur: ${error.message}`);
    console.log('\n💡 Instructions pour créer les tables manuellement:\n');
    console.log('   1. Via psql en ligne de commande:');
    console.log(`      psql -h ${poolConfig.host} -p ${poolConfig.port} -U ${poolConfig.user} -d ${poolConfig.database} -f ${sqlPath}`);
    console.log('\n   2. Via un client PostgreSQL (pgAdmin, DBeaver, etc.):');
    console.log(`      Ouvrir le fichier: ${sqlPath}`);
    console.log('      Exécuter le script complet');
    console.log('\n   3. Via Node.js (après correction des identifiants):');
    console.log('      node scripts/create-tables-generiques.mjs');
    console.log('\n');
  }

  if (connectionOk) {
    console.log(`📦 Création de ${tablesConfig.length} tables...\n`);

    let created = 0;
    let alreadyExists = 0;
    let errors = 0;

    for (const config of tablesConfig) {
      const { table, idField } = config;
      
      try {
        // Vérifier si la table existe
        const existsResult = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [table]);
        
        const exists = existsResult.rows[0].exists;
        
        if (exists) {
          console.log(`⚠️  ${table} existe déjà - ignorée`);
          alreadyExists++;
        } else {
          // Créer la table
          const sql = createTableSQL(table, idField);
          await pool.query(sql);
          console.log(`✅ ${table} créée (ID: ${idField})`);
          created++;
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la création de ${table}:`, error.message);
        errors++;
      }
    }

    // Résumé
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(80));
    console.log(`📦 Tables à créer: ${tablesConfig.length}`);
    console.log(`✅ Tables créées: ${created}`);
    console.log(`⚠️  Tables existantes: ${alreadyExists}`);
    console.log(`❌ Erreurs: ${errors}`);

    // Vérification finale
    if (created > 0) {
      console.log('\n🔍 Vérification finale...\n');
      
      let verified = 0;
      let missing = 0;
      
      for (const config of tablesConfig) {
        const existsResult = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [config.table]);
        
        const exists = existsResult.rows[0].exists;
        if (exists) {
          verified++;
          console.log(`✅ ${config.table} - Vérifiée`);
        } else {
          missing++;
          console.log(`❌ ${config.table} - MANQUANTE`);
        }
      }
      
      console.log(`\n✅ Tables vérifiées: ${verified}/${tablesConfig.length}`);
      if (missing > 0) {
        console.log(`❌ Tables manquantes: ${missing}/${tablesConfig.length}`);
      }
    }

    await pool.end();
  }

  console.log('\n✅ Script terminé\n');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

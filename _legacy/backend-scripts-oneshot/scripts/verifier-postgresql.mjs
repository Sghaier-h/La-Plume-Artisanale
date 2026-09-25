/**
 * Script pour vérifier la configuration PostgreSQL
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const { Client } = pg;

// Configuration depuis les variables d'environnement
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ERP_La_Plume',
  user: process.env.DB_USER || 'Aviateur',
  password: process.env.DB_PASSWORD || '',
};

console.log('🔍 Vérification de la configuration PostgreSQL\n');
console.log('='.repeat(80));
console.log('📊 Configuration actuelle:');
console.log(`   Host: ${config.host}`);
console.log(`   Port: ${config.port}`);
console.log(`   Database: ${config.database}`);
console.log(`   User: ${config.user}`);
console.log(`   Password: ${config.password ? '***' : '(non défini)'}`);
console.log('='.repeat(80));

// Test de connexion
async function testConnection() {
  console.log('\n🔌 Test de connexion...\n');
  
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connexion réussie !\n');
    
    // Vérifier la version de PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('📋 Version PostgreSQL:');
    console.log(`   ${versionResult.rows[0].version.split(',')[0]}\n`);
    
    // Vérifier si la base de données existe
    const dbResult = await client.query(
      `SELECT datname FROM pg_database WHERE datname = $1`,
      [config.database]
    );
    
    if (dbResult.rows.length > 0) {
      console.log(`✅ Base de données "${config.database}" existe\n`);
    } else {
      console.log(`⚠️  Base de données "${config.database}" n'existe pas\n`);
    }
    
    // Vérifier les tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
      LIMIT 20
    `);
    
    console.log(`📊 Tables trouvées (${tablesResult.rows.length}):`);
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    } else {
      console.log('   Aucune table trouvée');
    }
    
    await client.end();
    console.log('\n✅ Test terminé avec succès !');
    
  } catch (error) {
    console.error('\n❌ Erreur de connexion:\n');
    console.error(`   ${error.message}\n`);
    
    // Suggestions selon le type d'erreur
    if (error.message.includes('password authentication failed')) {
      console.log('💡 Solution:');
      console.log('   1. Vérifiez le mot de passe dans votre fichier .env');
      console.log('   2. Ou réinitialisez le mot de passe PostgreSQL:');
      console.log('      ALTER USER "' + config.user + '" WITH PASSWORD \'nouveau_mot_de_passe\';');
    } else if (error.message.includes('does not exist')) {
      console.log('💡 Solution:');
      console.log('   1. Créez la base de données:');
      console.log(`      CREATE DATABASE "${config.database}";`);
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Solution:');
      console.log('   1. Vérifiez que PostgreSQL est démarré');
      console.log('   2. Vérifiez le host et le port dans votre .env');
      console.log('   3. Windows: Services > PostgreSQL > Démarrer');
      console.log('   4. Linux: sudo systemctl start postgresql');
    } else if (error.message.includes('role') && error.message.includes('does not exist')) {
      console.log('💡 Solution:');
      console.log('   1. Créez l\'utilisateur PostgreSQL:');
      console.log(`      CREATE USER "${config.user}" WITH PASSWORD 'mot_de_passe';`);
      console.log(`   2. Donnez les permissions:`);
      console.log(`      ALTER DATABASE "${config.database}" OWNER TO "${config.user}";`);
    }
    
    console.log('\n');
    process.exit(1);
  }
}

testConnection();

/**
 * Script pour vérifier la connexion à PostgreSQL OVH Cloud
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

// Configuration depuis .env (avec valeurs par défaut pour OVH)
const config = {
  host: process.env.DB_HOST || 'sh131616-002.eu.clouddb.ovh.net',
  port: parseInt(process.env.DB_PORT || '35392'),
  database: process.env.DB_NAME || 'ERP_La_Plume',
  user: process.env.DB_USER || 'Aviateur',
  password: process.env.DB_PASSWORD || '',
  ssl: {
    rejectUnauthorized: false // Pour OVH Cloud
  }
};

console.log('🔍 Vérification de la connexion PostgreSQL OVH Cloud\n');
console.log('='.repeat(80));
console.log('📊 Configuration:');
console.log(`   Host: ${config.host}`);
console.log(`   Port: ${config.port}`);
console.log(`   Database: ${config.database}`);
console.log(`   User: ${config.user}`);
console.log(`   Password: ${config.password ? '***' : '(non défini)'}`);
console.log(`   SSL: Activé`);
console.log('='.repeat(80));

async function testConnection() {
  console.log('\n🔌 Test de connexion...\n');
  
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connexion réussie !\n');
    
    // Vérifier la version
    const versionResult = await client.query('SELECT version()');
    console.log('📋 Version PostgreSQL:');
    console.log(`   ${versionResult.rows[0].version.split(',')[0]}\n`);
    
    // Vérifier les tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📊 Tables existantes (${tablesResult.rows.length}):`);
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.slice(0, 30).forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
      if (tablesResult.rows.length > 30) {
        console.log(`   ... et ${tablesResult.rows.length - 30} autres`);
      }
    } else {
      console.log('   Aucune table');
    }
    
    await client.end();
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ PostgreSQL OVH Cloud est correctement configuré !');
    console.log('\n💡 Vous pouvez maintenant :');
    console.log('   1. Démarrer le serveur : npm start');
    console.log('   2. Tester les routes : node scripts/test-crud-avec-auth.mjs');
    console.log('='.repeat(80));
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur de connexion:\n');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('password authentication failed')) {
      console.log('💡 Le mot de passe est incorrect.');
      console.log('   Vérifiez votre fichier .env avec le mot de passe correct.\n');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.log('💡 Le serveur n\'est pas accessible.');
      console.log('   Vérifiez :');
      console.log('   1. Que votre IP est autorisée dans OVH Cloud');
      console.log('   2. Que le firewall n\'bloque pas le port');
      console.log('   3. Que vous utilisez le bon host et port\n');
    } else if (error.message.includes('SSL')) {
      console.log('💡 Problème SSL.');
      console.log('   Le script utilise SSL avec rejectUnauthorized: false');
      console.log('   Si le problème persiste, vérifiez la configuration SSL dans OVH\n');
    }
    
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});

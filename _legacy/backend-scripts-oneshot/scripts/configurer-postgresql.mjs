/**
 * Script pour configurer PostgreSQL
 * Crée l'utilisateur et la base de données si nécessaire
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const { Client } = pg;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Configuration depuis les variables d'environnement
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres', // On se connecte à postgres pour créer la DB
  user: process.env.DB_USER || 'postgres', // Utilisateur admin par défaut
  password: process.env.DB_PASSWORD || '',
};

const targetConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ERP_La_Plume',
  user: process.env.DB_USER || 'Aviateur',
  password: process.env.DB_PASSWORD || '',
};

console.log('🔧 Configuration PostgreSQL\n');
console.log('='.repeat(80));

async function configurePostgreSQL() {
  try {
    // Demander les informations si nécessaire
    if (!config.password) {
      console.log('⚠️  Mot de passe non défini dans .env');
      config.password = await question('Entrez le mot de passe PostgreSQL (utilisateur postgres): ');
    }
    
    if (!targetConfig.password) {
      console.log('⚠️  Mot de passe utilisateur cible non défini');
      targetConfig.password = await question(`Entrez le mot de passe pour l'utilisateur "${targetConfig.user}": `);
    }
    
    console.log('\n🔌 Connexion à PostgreSQL...');
    const adminClient = new Client(config);
    await adminClient.connect();
    console.log('✅ Connexion réussie\n');
    
    // Vérifier si l'utilisateur existe
    console.log(`👤 Vérification de l'utilisateur "${targetConfig.user}"...`);
    const userCheck = await adminClient.query(
      `SELECT 1 FROM pg_roles WHERE rolname = $1`,
      [targetConfig.user]
    );
    
    if (userCheck.rows.length === 0) {
      console.log(`   Création de l'utilisateur "${targetConfig.user}"...`);
      await adminClient.query(
        `CREATE USER "${targetConfig.user}" WITH PASSWORD $1`,
        [targetConfig.password]
      );
      console.log('   ✅ Utilisateur créé\n');
    } else {
      console.log('   ✅ Utilisateur existe déjà\n');
      
      // Mettre à jour le mot de passe
      const updatePassword = await question('Voulez-vous mettre à jour le mot de passe ? (o/n): ');
      if (updatePassword.toLowerCase() === 'o') {
        await adminClient.query(
          `ALTER USER "${targetConfig.user}" WITH PASSWORD $1`,
          [targetConfig.password]
        );
        console.log('   ✅ Mot de passe mis à jour\n');
      }
    }
    
    // Vérifier si la base de données existe
    console.log(`📊 Vérification de la base de données "${targetConfig.database}"...`);
    const dbCheck = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetConfig.database]
    );
    
    if (dbCheck.rows.length === 0) {
      console.log(`   Création de la base de données "${targetConfig.database}"...`);
      await adminClient.query(`CREATE DATABASE "${targetConfig.database}"`);
      console.log('   ✅ Base de données créée\n');
    } else {
      console.log('   ✅ Base de données existe déjà\n');
    }
    
    // Donner les permissions à l'utilisateur
    console.log(`🔐 Attribution des permissions...`);
    await adminClient.query(
      `ALTER DATABASE "${targetConfig.database}" OWNER TO "${targetConfig.user}"`
    );
    await adminClient.query(
      `GRANT ALL PRIVILEGES ON DATABASE "${targetConfig.database}" TO "${targetConfig.user}"`
    );
    console.log('   ✅ Permissions attribuées\n');
    
    await adminClient.end();
    
    // Tester la connexion avec le nouvel utilisateur
    console.log('🧪 Test de connexion avec le nouvel utilisateur...');
    const testClient = new Client(targetConfig);
    await testClient.connect();
    console.log('   ✅ Connexion réussie !\n');
    
    // Vérifier les tables
    const tablesResult = await testClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📋 Tables existantes (${tablesResult.rows.length}):`);
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
    } else {
      console.log('   Aucune table (normal pour une nouvelle base)');
    }
    
    await testClient.end();
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Configuration terminée avec succès !');
    console.log('\n💡 Prochaines étapes:');
    console.log('   1. Vérifiez que votre fichier .env contient:');
    console.log(`      DB_HOST=${targetConfig.host}`);
    console.log(`      DB_PORT=${targetConfig.port}`);
    console.log(`      DB_NAME=${targetConfig.database}`);
    console.log(`      DB_USER=${targetConfig.user}`);
    console.log(`      DB_PASSWORD=${targetConfig.password}`);
    console.log('   2. Redémarrez le serveur backend');
    console.log('   3. Exécutez les migrations si nécessaire');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration:\n');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('password authentication failed')) {
      console.log('💡 Solution:');
      console.log('   1. Vérifiez le mot de passe de l\'utilisateur postgres');
      console.log('   2. Ou modifiez pg_hba.conf pour autoriser les connexions locales');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Solution:');
      console.log('   1. Vérifiez que PostgreSQL est démarré');
      console.log('   2. Windows: Services > PostgreSQL > Démarrer');
      console.log('   3. Linux: sudo systemctl start postgresql');
    }
    
    process.exit(1);
  } finally {
    rl.close();
  }
}

configurePostgreSQL();

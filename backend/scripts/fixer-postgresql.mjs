/**
 * Script pour corriger la configuration PostgreSQL
 * Crée l'utilisateur et configure la base de données
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

// Configuration cible depuis .env
const targetConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ERP_La_Plume',
  user: process.env.DB_USER || 'Aviateur',
  password: process.env.DB_PASSWORD || '',
};

// Configuration admin (pour créer l'utilisateur)
const adminConfig = {
  host: targetConfig.host,
  port: targetConfig.port,
  database: 'postgres', // Base système
  user: 'postgres', // Super-utilisateur
  password: '', // À demander
};

console.log('🔧 Configuration PostgreSQL\n');
console.log('='.repeat(80));
console.log('📊 Configuration cible:');
console.log(`   Host: ${targetConfig.host}`);
console.log(`   Port: ${targetConfig.port}`);
console.log(`   Database: ${targetConfig.database}`);
console.log(`   User: ${targetConfig.user}`);
console.log(`   Password: ${targetConfig.password ? '***' : '(non défini)'}`);
console.log('='.repeat(80));

async function fixPostgreSQL() {
  try {
    // Demander le mot de passe admin si nécessaire
    if (!adminConfig.password) {
      console.log('\n⚠️  Mot de passe administrateur PostgreSQL requis');
      console.log('   (Utilisateur "postgres" - super-utilisateur)');
      adminConfig.password = await question('Entrez le mot de passe de "postgres": ');
    }
    
    if (!targetConfig.password) {
      console.log('\n⚠️  Mot de passe utilisateur cible requis');
      targetConfig.password = await question(`Entrez le mot de passe pour "${targetConfig.user}": `);
    }
    
    console.log('\n🔌 Connexion en tant qu\'administrateur...');
    const adminClient = new Client(adminConfig);
    await adminClient.connect();
    console.log('✅ Connexion admin réussie\n');
    
    // Vérifier/créer l'utilisateur
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
      console.log('   ✅ Utilisateur existe déjà');
      
      // Mettre à jour le mot de passe
      console.log('   Mise à jour du mot de passe...');
      await adminClient.query(
        `ALTER USER "${targetConfig.user}" WITH PASSWORD $1`,
        [targetConfig.password]
      );
      console.log('   ✅ Mot de passe mis à jour\n');
    }
    
    // Vérifier/créer la base de données
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
    
    // Attribuer les permissions
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
    console.log('\n💡 Votre fichier .env est déjà configuré correctement.');
    console.log('   Vous pouvez maintenant :');
    console.log('   1. Redémarrer le serveur : npm start');
    console.log('   2. Tester les routes : node scripts/test-crud-avec-auth.mjs');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration:\n');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('password authentication failed')) {
      console.log('💡 Solutions possibles:');
      console.log('   1. Vérifiez le mot de passe de l\'utilisateur "postgres"');
      console.log('   2. Si vous avez oublié le mot de passe postgres:');
      console.log('      - Windows: Modifiez pg_hba.conf pour autoriser les connexions locales');
      console.log('      - Ou réinitialisez le mot de passe via les services Windows');
      console.log('   3. Essayez de vous connecter manuellement avec psql:');
      console.log(`      psql -U postgres -h ${adminConfig.host} -p ${adminConfig.port}`);
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Solutions:');
      console.log('   1. Vérifiez que PostgreSQL est démarré');
      console.log('   2. Windows: Services > PostgreSQL > Démarrer');
      console.log('   3. Vérifiez le host et le port');
    }
    
    process.exit(1);
  } finally {
    rl.close();
  }
}

fixPostgreSQL();

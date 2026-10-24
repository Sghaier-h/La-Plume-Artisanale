/**
 * Script pour configurer PostgreSQL (méthode simple)
 * Essaie de se connecter directement avec l'utilisateur cible
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

// Configuration depuis .env
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ERP_La_Plume',
  user: process.env.DB_USER || 'Aviateur',
  password: process.env.DB_PASSWORD || '',
};

console.log('🔧 Configuration PostgreSQL (Méthode Simple)\n');
console.log('='.repeat(80));
console.log('📊 Configuration:');
console.log(`   Host: ${config.host}`);
console.log(`   Port: ${config.port}`);
console.log(`   Database: ${config.database}`);
console.log(`   User: ${config.user}`);
console.log(`   Password: ${config.password ? '***' : '(non défini)'}`);
console.log('='.repeat(80));

async function testDirectConnection() {
  console.log('\n🧪 Test de connexion directe...\n');
  
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
      tablesResult.rows.slice(0, 20).forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
      if (tablesResult.rows.length > 20) {
        console.log(`   ... et ${tablesResult.rows.length - 20} autres`);
      }
    } else {
      console.log('   Aucune table (normal pour une nouvelle base)');
    }
    
    await client.end();
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ PostgreSQL est correctement configuré !');
    console.log('\n💡 Vous pouvez maintenant :');
    console.log('   1. Démarrer le serveur : npm start');
    console.log('   2. Tester les routes : node scripts/test-crud-avec-auth.mjs');
    console.log('='.repeat(80));
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur de connexion:\n');
    console.error(`   ${error.message}\n`);
    
    // Analyser l'erreur et proposer des solutions
    if (error.message.includes('password authentication failed')) {
      console.log('💡 Solutions possibles:\n');
      console.log('1. Vérifier le mot de passe dans .env');
      console.log('   Votre .env contient: DB_PASSWORD=Allbyfouta007');
      console.log('   Assurez-vous que c\'est le bon mot de passe PostgreSQL.\n');
      
      console.log('2. Réinitialiser le mot de passe PostgreSQL:');
      console.log('   a. Ouvrez pgAdmin ou psql');
      console.log('   b. Connectez-vous en tant qu\'administrateur');
      console.log(`   c. Exécutez: ALTER USER "${config.user}" WITH PASSWORD 'Allbyfouta007';\n`);
      
      console.log('3. Si vous ne connaissez pas le mot de passe postgres:');
      console.log('   Windows:');
      console.log('   - Ouvrez Services (services.msc)');
      console.log('   - Trouvez "postgresql-x64-XX"');
      console.log('   - Arrêtez le service');
      console.log('   - Modifiez pg_hba.conf pour autoriser les connexions locales');
      console.log('   - Redémarrez le service\n');
      
      console.log('4. Créer l\'utilisateur manuellement:');
      console.log('   Connectez-vous à PostgreSQL (avec un compte admin) et exécutez:');
      console.log(`   CREATE USER "${config.user}" WITH PASSWORD 'Allbyfouta007';`);
      console.log(`   CREATE DATABASE "${config.database}";`);
      console.log(`   ALTER DATABASE "${config.database}" OWNER TO "${config.user}";`);
      console.log(`   GRANT ALL PRIVILEGES ON DATABASE "${config.database}" TO "${config.user}";\n`);
      
    } else if (error.message.includes('does not exist')) {
      if (error.message.includes('database')) {
        console.log('💡 La base de données n\'existe pas.\n');
        console.log('Solution: Créez-la manuellement:');
        console.log(`   CREATE DATABASE "${config.database}";`);
        console.log(`   ALTER DATABASE "${config.database}" OWNER TO "${config.user}";\n`);
      } else if (error.message.includes('role')) {
        console.log('💡 L\'utilisateur n\'existe pas.\n');
        console.log('Solution: Créez-le manuellement:');
        console.log(`   CREATE USER "${config.user}" WITH PASSWORD 'Allbyfouta007';`);
        console.log(`   CREATE DATABASE "${config.database}";`);
        console.log(`   ALTER DATABASE "${config.database}" OWNER TO "${config.user}";\n`);
      }
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 PostgreSQL n\'est pas accessible.\n');
      console.log('Solutions:');
      console.log('   1. Vérifiez que PostgreSQL est démarré');
      console.log('   2. Windows: Services > PostgreSQL > Démarrer');
      console.log('   3. Vérifiez le host et le port dans .env');
      console.log('   4. Vérifiez le firewall\n');
    }
    
    console.log('📝 Instructions complètes dans: GUIDE_CONFIGURATION_POSTGRESQL.md\n');
    
    return false;
  }
}

testDirectConnection().then(success => {
  process.exit(success ? 0 : 1);
});

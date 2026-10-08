// Script de test de connexion à la base de données
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Créer une nouvelle connexion pour le test
const testPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fouta_erp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 1,
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  console.log('🔍 Test de connexion à la base de données...\n');
  
  // Afficher les paramètres de connexion (sans le mot de passe)
  console.log('📋 Configuration de connexion:');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Port: ${process.env.DB_PORT || '5432'}`);
  console.log(`   Database: ${process.env.DB_NAME || 'fouta_erp'}`);
  console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
  console.log(`   Password: ${process.env.DB_PASSWORD ? '***' : 'NON DÉFINI'}\n`);

  try {
    // Test 1: Connexion basique
    console.log('1️⃣ Test de connexion basique...');
    const client = await testPool.connect();
    console.log('✅ Connexion réussie !\n');
    
    // Test 2: Requête simple
    console.log('2️⃣ Test de requête simple (SELECT NOW())...');
    const result = await testPool.query('SELECT NOW()');
    console.log(`✅ Requête réussie ! Heure serveur: ${result.rows[0].now}\n`);
    
    // Test 3: Vérifier les tables
    console.log('3️⃣ Vérification des tables...');
    const tablesResult = await testPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log(`✅ ${tablesResult.rows.length} tables trouvées\n`);
    
    // Test 4: Vérifier la table utilisateurs
    console.log('4️⃣ Vérification de la table utilisateurs...');
    try {
      const usersResult = await testPool.query(`
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'utilisateurs'
        ORDER BY ordinal_position
      `);
      
      if (usersResult.rows.length > 0) {
        console.log(`✅ Table 'utilisateurs' trouvée avec ${usersResult.rows.length} colonnes:`);
        usersResult.rows.forEach(col => {
          console.log(`   - ${col.column_name} (${col.data_type})`);
        });
        console.log('');
      } else {
        console.log('⚠️  Table "utilisateurs" non trouvée\n');
      }
    } catch (err) {
      console.log(`⚠️  Erreur lors de la vérification de la table: ${err.message}\n`);
    }
    
    // Test 5: Vérifier les utilisateurs
    console.log('5️⃣ Vérification des utilisateurs existants...');
    try {
      const usersCheck = await testPool.query(`
        SELECT COUNT(*) as count FROM users
      `);
      console.log(`✅ ${usersCheck.rows[0].count} utilisateur(s) trouvé(s)\n`);
      
      if (parseInt(usersCheck.rows[0].count) > 0) {
        const usersList = await testPool.query(`
          SELECT email, actif 
          FROM users 
          LIMIT 5
        `);
        console.log('📋 Utilisateurs trouvés:');
        usersList.rows.forEach(user => {
          console.log(`   - ${user.email} (actif: ${user.actif})`);
        });
        console.log('');
      }
    } catch (err) {
      console.log(`⚠️  Erreur lors de la vérification des utilisateurs: ${err.message}\n`);
    }
    
    // Test 6: Vérifier les rôles
    console.log('6️⃣ Vérification de la table roles...');
    try {
      const rolesCheck = await testPool.query(`
        SELECT COUNT(*) as count FROM roles
      `);
      console.log(`✅ ${rolesCheck.rows[0].count} rôle(s) trouvé(s)\n`);
    } catch (err) {
      console.log(`⚠️  Table "roles" non trouvée ou erreur: ${err.message}\n`);
    }
    
    client.release();
    await testPool.end();
    
    console.log('✅ Tous les tests sont passés avec succès !\n');
    console.log('💡 Vous pouvez maintenant démarrer le serveur avec: npm run dev');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('\n🔍 Détails de l\'erreur:');
    console.error('   Code:', error.code);
    console.error('   Type:', error.name);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Solution: Le serveur PostgreSQL n\'est pas accessible.');
      console.error('   - Vérifiez que l\'IP de votre PC est autorisée dans OVH');
      console.error('   - Vérifiez que le firewall n\'bloque pas le port 35392');
      console.error('   - Vérifiez la connexion internet');
    } else if (error.code === 'PAM_AUTHENTICATION') {
      console.error('\n💡 Solution: Erreur d\'authentification.');
      console.error('   - Vérifiez le nom d\'utilisateur et le mot de passe dans .env');
    } else if (error.code === '3D000') {
      console.error('\n💡 Solution: La base de données n\'existe pas.');
      console.error('   - Vérifiez le nom de la base de données dans .env');
      console.error('   - Créez la base de données si nécessaire');
    }
    
    console.error('\n📚 Voir: RESOUDRE_CONNEXION_DATABASE.md pour plus de détails\n');
    
    // Nettoyer
    try {
      await testPool.end();
    } catch (e) {
      // Ignorer les erreurs de fermeture
    }
    
    process.exit(1);
  }
}

// Exécuter le test
testConnection();

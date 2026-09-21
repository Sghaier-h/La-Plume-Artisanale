import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuration de la connexion
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fouta_erp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Augmenté à 10 secondes
  // Configuration SSL pour OVH Cloud (si host contient clouddb.ovh.net)
  ...(process.env.DB_HOST && process.env.DB_HOST.includes('clouddb.ovh.net') ? {
    ssl: {
      rejectUnauthorized: false // OVH Cloud nécessite SSL
    }
  } : {})
};

// Mode mock activé - ne pas créer le pool si on n'a pas besoin de DB
const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';

if (!useMockAuth) {
  // Afficher la configuration (sans le mot de passe)
  console.log('📊 Configuration base de données:');
  console.log(`   Host: ${poolConfig.host}`);
  console.log(`   Port: ${poolConfig.port}`);
  console.log(`   Database: ${poolConfig.database}`);
  console.log(`   User: ${poolConfig.user}`);
  console.log(`   Password: ${poolConfig.password ? '***' : 'NON DÉFINI'}`);
} else {
  console.log('⚠️  Mode développement actif - Base de données non utilisée (USE_MOCK_AUTH=true)');
}

export const pool = new Pool(poolConfig);

// Test de connexion au démarrage
pool.on('connect', (client) => {
  console.log('✅ Connecté à PostgreSQL');
});

pool.on('error', (err, client) => {
  console.error('❌ Erreur PostgreSQL:', err.message);
  console.error('   Code:', err.code);
  console.error('   Type:', err.name);
  
  // Suggestions selon le type d'erreur
  if (err.code === 'ECONNREFUSED') {
    console.error('💡 Solution: Le serveur PostgreSQL n\'est pas accessible.');
    console.error('   - Vérifiez que l\'IP de votre PC est autorisée dans PostgreSQL OVH');
    console.error('   - Vérifiez que le firewall n\'bloque pas le port');
    console.error('   - Vérifiez la connexion internet');
  } else if (err.code === '28P01') {
    console.error('💡 Solution: Erreur d\'authentification.');
    console.error('   - Vérifiez le nom d\'utilisateur et le mot de passe dans .env');
  } else if (err.code === '3D000') {
    console.error('💡 Solution: La base de données n\'existe pas.');
    console.error('   - Vérifiez le nom de la base de données dans .env');
  }
});

// Test de connexion initiale
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log(`✅ Connexion test réussie - Heure serveur: ${result.rows[0].now}`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Test de connexion échoué:', error.message);
    console.error('   Code:', error.code);
    return false;
  }
}

// Exécuter le test de connexion si ce fichier est importé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}


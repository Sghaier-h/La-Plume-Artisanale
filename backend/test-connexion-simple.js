/**
 * Test de connexion simple à PostgreSQL
 */

import pg from 'pg';
const { Pool } = pg;

// Tester les deux ports
const ports = [5432, 5433];
const database = 'ERP_La_Plume';
const user = 'Aviateur';
const password = 'Allbyfouta007';

console.log('Test de connexion PostgreSQL...\n');

for (const port of ports) {
  console.log(`Test du port ${port}...`);
  
  const pool = new Pool({
    host: 'localhost',
    port: port,
    database: database,
    user: user,
    password: password,
    connectionTimeoutMillis: 3000
  });

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW(), version()');
    console.log(`✅ Port ${port}: CONNEXION RÉUSSIE`);
    console.log(`   Heure serveur: ${result.rows[0].now}`);
    console.log(`   Version: ${result.rows[0].version.split(',')[0]}`);
    client.release();
    await pool.end();
    
    console.log(`\n✅ Port ${port} fonctionne ! Utilisez ce port dans votre .env`);
    console.log(`   DB_PORT=${port}`);
    process.exit(0);
  } catch (error) {
    console.log(`❌ Port ${port}: ${error.code || error.message}`);
    await pool.end();
  }
}

console.log('\n❌ Aucun port ne fonctionne. Vérifiez:');
console.log('   1. PostgreSQL est démarré');
console.log('   2. La base de données existe');
console.log('   3. Les identifiants sont corrects');

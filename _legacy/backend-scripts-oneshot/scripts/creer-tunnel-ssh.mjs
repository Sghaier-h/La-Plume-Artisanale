/**
 * Script pour créer un tunnel SSH vers PostgreSQL OVH Cloud
 * Utilise ssh2 pour établir le tunnel automatiquement
 */

import { Client } from 'ssh2';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const { Pool } = pg;

// Configuration SSH (depuis pgAdmin)
const sshConfig = {
  host: process.env.SSH_TUNNEL_HOST || '137.74.40.191',
  port: parseInt(process.env.SSH_TUNNEL_PORT || '22'),
  username: process.env.SSH_TUNNEL_USER || 'ubuntu',
  password: process.env.SSH_TUNNEL_PASSWORD || '', // À définir dans .env
  // Ou utiliser une clé privée :
  // privateKey: fs.readFileSync('path/to/private/key')
};

// Configuration PostgreSQL (via tunnel)
const dbConfig = {
  host: 'localhost', // Via tunnel local
  port: parseInt(process.env.DB_PORT || '35392'),
  database: process.env.DB_NAME || 'ERP_La_Plume',
  user: process.env.DB_USER || 'Aviateur',
  password: process.env.DB_PASSWORD || '',
  ssl: {
    rejectUnauthorized: false
  }
};

// Configuration PostgreSQL distante (cible du tunnel)
const remoteDbConfig = {
  host: process.env.DB_HOST || 'sh131616-002.eu.clouddb.ovh.net',
  port: parseInt(process.env.DB_PORT || '35392')
};

console.log('🔐 Création du tunnel SSH vers PostgreSQL OVH Cloud\n');
console.log('='.repeat(80));
console.log('📊 Configuration SSH:');
console.log(`   Host: ${sshConfig.host}`);
console.log(`   Port: ${sshConfig.port}`);
console.log(`   User: ${sshConfig.username}`);
console.log(`   Password: ${sshConfig.password ? '***' : '(non défini)'}`);
console.log('\n📊 Configuration PostgreSQL:');
console.log(`   Host local: ${dbConfig.host}`);
console.log(`   Port local: ${dbConfig.port}`);
console.log(`   Host distant: ${remoteDbConfig.host}`);
console.log(`   Port distant: ${remoteDbConfig.port}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   User: ${dbConfig.user}`);
console.log('='.repeat(80));

async function createTunnelAndTest() {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    
    conn.on('ready', () => {
      console.log('\n✅ Connexion SSH établie\n');
      
      // Créer le tunnel
      conn.forwardOut(
        '127.0.0.1',
        dbConfig.port,
        remoteDbConfig.host,
        remoteDbConfig.port,
        (err, stream) => {
          if (err) {
            console.error('❌ Erreur création tunnel:', err.message);
            conn.end();
            reject(err);
            return;
          }
          
          console.log('✅ Tunnel SSH créé\n');
          console.log('🧪 Test de connexion PostgreSQL via tunnel...\n');
          
          // Créer une connexion PostgreSQL via le tunnel
          const pgClient = new pg.Client({
            ...dbConfig,
            stream: stream // Utiliser le stream SSH
          });
          
          pgClient.connect((err) => {
            if (err) {
              console.error('❌ Erreur connexion PostgreSQL:', err.message);
              conn.end();
              reject(err);
              return;
            }
            
            console.log('✅ Connexion PostgreSQL réussie via tunnel !\n');
            
            // Tester une requête
            pgClient.query('SELECT version()', (err, result) => {
              if (err) {
                console.error('❌ Erreur requête:', err.message);
              } else {
                console.log('📋 Version PostgreSQL:');
                console.log(`   ${result.rows[0].version.split(',')[0]}\n`);
              }
              
              pgClient.end();
              conn.end();
              resolve(true);
            });
          });
        }
      );
    });
    
    conn.on('error', (err) => {
      console.error('\n❌ Erreur SSH:', err.message);
      console.log('\n💡 Solutions:');
      console.log('   1. Vérifiez que SSH_TUNNEL_PASSWORD est défini dans .env');
      console.log('   2. Ou configurez une clé SSH privée');
      console.log('   3. Vérifiez que le serveur SSH est accessible');
      reject(err);
    });
    
    // Se connecter
    conn.connect(sshConfig);
  });
}

// Note: Cette approche nécessite une modification de la bibliothèque pg
// Pour une solution plus simple, utilisez un tunnel SSH externe (PuTTY ou ssh)

console.log('\n⚠️  Note: Ce script nécessite une configuration spéciale.');
console.log('   Pour une solution plus simple, utilisez un tunnel SSH externe :\n');
console.log('   ssh -L 35392:sh131616-002.eu.clouddb.ovh.net:35392 ubuntu@137.74.40.191\n');
console.log('   Puis configurez .env avec DB_HOST=localhost\n');

// Pour l'instant, on ne peut pas facilement créer un tunnel SSH avec Node.js
// sans modifier la bibliothèque pg. La meilleure solution est d'utiliser
// un tunnel SSH externe ou d'autoriser l'IP dans OVH.

console.log('💡 Solution recommandée: Autoriser votre IP dans OVH Cloud');
console.log('   Voir: SOLUTION_CONNEXION_OVH.md\n');

process.exit(0);

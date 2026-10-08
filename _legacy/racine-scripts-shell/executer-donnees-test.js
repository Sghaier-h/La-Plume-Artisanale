/**
 * Script pour exécuter le fichier SQL insert_donnees_test.sql
 * Utilisation: node scripts/executer-donnees-test.js
 * 
 * Note: Ce script doit être exécuté depuis la racine du projet.
 * Il utilise les dépendances installées dans backend/node_modules
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Charger pg depuis backend/node_modules en utilisant import dynamique
const backendPath = join(process.cwd(), 'backend');
const pgPath = join(backendPath, 'node_modules', 'pg', 'index.js');

// Vérifier que le chemin existe
import { existsSync } from 'fs';
if (!existsSync(pgPath)) {
  console.error('❌ Erreur: Le package "pg" n\'est pas installé dans backend/node_modules');
  console.error('💡 Solution: Exécutez "cd backend && npm install"');
  process.exit(1);
}

// Importer pg dynamiquement
const pg = await import(`file://${pgPath.replace(/\\/g, '/')}`);

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le .env depuis le dossier backend
config({ path: join(__dirname, '..', 'backend', '.env') });

async function executerScriptSQL() {
  // Configuration de la connexion
  const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'la_plume_artisanale',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  const pool = new Pool(poolConfig);

  try {
    console.log('📖 Lecture du fichier SQL...');
    const sqlFilePath = join(__dirname, '..', 'database', 'insert_donnees_test.sql');
    const sqlContent = readFileSync(sqlFilePath, 'utf-8');
    
    console.log('🔌 Connexion à la base de données...');
    console.log(`   Host: ${poolConfig.host}`);
    console.log(`   Port: ${poolConfig.port}`);
    console.log(`   Database: ${poolConfig.database}`);
    console.log(`   User: ${poolConfig.user}`);
    
    if (!poolConfig.password) {
      console.warn('⚠️  Attention: DB_PASSWORD n\'est pas défini dans .env');
    }
    console.log('');
    
    const client = await pool.connect();
    
    try {
      console.log('⚙️  Exécution du script SQL...');
      console.log('⏳ Cela peut prendre quelques instants...\n');
      
      // Exécuter le script SQL
      await client.query(sqlContent);
      
      console.log('✅ Script SQL exécuté avec succès !');
      console.log('📊 Les données de test ont été insérées dans la base de données.');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution du script SQL:');
      console.error('Message:', error.message);
      console.error('Code:', error.code);
      console.error('Détail:', error.detail);
      console.error('Position:', error.position);
      
      if (error.position) {
        // Afficher le contexte autour de l'erreur
        const lines = sqlContent.split('\n');
        const errorLine = sqlContent.substring(0, error.position).split('\n').length;
        console.error('\n📝 Contexte de l\'erreur (ligne ' + errorLine + '):');
        const start = Math.max(0, errorLine - 3);
        const end = Math.min(lines.length, errorLine + 2);
        for (let i = start; i < end; i++) {
          const marker = i === errorLine - 1 ? '>>> ' : '    ';
          console.error(marker + (i + 1) + ': ' + lines[i]);
        }
      }
      
      process.exit(1);
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:');
    console.error('Message:', error.message);
    console.error('\n💡 Vérifiez que:');
    console.error('   - PostgreSQL est démarré');
    console.error('   - Le fichier .env dans backend/ contient les variables DB_*');
    console.error('   - La base de données "la_plume_artisanale" existe');
    console.error('\n📝 Exemple de configuration .env:');
    console.error('   DB_HOST=localhost');
    console.error('   DB_PORT=5432');
    console.error('   DB_NAME=la_plume_artisanale');
    console.error('   DB_USER=postgres');
    console.error('   DB_PASSWORD=votre_mot_de_passe');
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔌 Connexion fermée.');
  }
}

// Exécuter le script
executerScriptSQL();

import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Configuration de la connexion
// Essayer d'abord avec la connexion directe (si disponible), sinon localhost (tunnel)
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432');

// Si DB_HOST est localhost, essayer aussi la connexion directe
const poolConfig = {
  host: dbHost,
  port: dbPort,
  database: process.env.DB_NAME || 'ERP_La_Plume',
  user: process.env.DB_USER || 'Aviateur',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // Augmenté pour connexion distante
};

// Si on utilise localhost, essayer aussi la connexion directe
if (dbHost === 'localhost' && dbPort === 5433) {
  console.log('⚠️  Tentative avec localhost:5433 (tunnel SSH requis)');
  console.log('💡 Si cela échoue, le tunnel SSH n\'est pas actif');
}

const pool = new Pool(poolConfig);

async function executerSchema() {
  const client = await pool.connect();
  
  try {
    console.log('📖 Lecture du fichier schema_pointage.sql...');
    const sqlFile = path.join(__dirname, 'database', 'schema_pointage.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('🚀 Exécution du script SQL...');
    await client.query(sql);
    
    console.log('✅ Script SQL exécuté avec succès !');
    console.log('📊 Tables créées :');
    console.log('   - pointage');
    console.log('   - pointage_resume');
    console.log('   - Colonnes ajoutées à equipe : timemoto_user_id, temps_travaille_mois');
    console.log('   - Triggers et fonctions créés');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du script SQL:', error.message);
    console.error('   Code:', error.code);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

executerSchema()
  .then(() => {
    console.log('✅ Terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Échec:', error);
    process.exit(1);
  });

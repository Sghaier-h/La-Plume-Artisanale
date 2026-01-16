/**
 * Script pour exécuter le schéma de pointage directement sur le serveur de production
 * 
 * Usage:
 *   node executer-schema-production.js
 * 
 * Ce script se connecte directement à la base de données de production
 * et exécute le schéma SQL pour créer les tables de pointage TimeMoto.
 */

import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Configuration de la connexion DIRECTE à la base de données de production
// (sans tunnel SSH, depuis le serveur de production lui-même)
const poolConfig = {
  host: process.env.DB_HOST_PRODUCTION || 'sh131616-002.eu.clouddb.ovh.net',
  port: parseInt(process.env.DB_PORT_PRODUCTION || '35392'),
  database: process.env.DB_NAME || 'ERP_La_Plume',
  user: process.env.DB_USER || 'Aviateur',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  ssl: {
    rejectUnauthorized: false // Nécessaire pour les connexions OVH Cloud DB
  }
};

console.log('🚀 Exécution du schéma de pointage TimeMoto');
console.log('');
console.log('📊 Configuration de connexion:');
console.log(`   Host: ${poolConfig.host}`);
console.log(`   Port: ${poolConfig.port}`);
console.log(`   Database: ${poolConfig.database}`);
console.log(`   User: ${poolConfig.user}`);
console.log('');

const pool = new Pool(poolConfig);

async function executerSchema() {
  const client = await pool.connect();
  
  try {
    console.log('📖 Lecture du fichier schema_pointage.sql...');
    const sqlFile = path.join(__dirname, 'database', 'schema_pointage.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('🚀 Exécution du script SQL...');
    console.log('');
    
    // Exécuter le script SQL
    await client.query(sql);
    
    console.log('✅ Script SQL exécuté avec succès !');
    console.log('');
    console.log('📊 Tables créées :');
    console.log('   - pointage');
    console.log('   - pointage_resume');
    console.log('   - Colonnes ajoutées à equipe : timemoto_user_id, temps_travaille_mois');
    console.log('   - Triggers et fonctions créés');
    console.log('   - Vue v_pointage_detail créée');
    console.log('');
    console.log('✅ Terminé avec succès !');
    console.log('');
    console.log('📋 Prochaines étapes :');
    console.log('   1. Vérifier que TIMEMOTO_WEBHOOK_SECRET est dans le .env');
    console.log('   2. Redémarrer le serveur backend pour charger la clé secrète');
    console.log('   3. Tester l\'endpoint : curl https://fabrication.laplume-artisanale.tn/api/webhooks/timemoto/test');
    console.log('   4. Vérifier les webhooks dans TimeMoto (section Attempts)');
    
  } catch (error) {
    console.error('');
    console.error('❌ Erreur lors de l\'exécution du script SQL:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    if (error.detail) {
      console.error(`   Détail: ${error.detail}`);
    }
    if (error.position) {
      console.error(`   Position: ${error.position}`);
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

executerSchema()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Échec:', error);
    process.exit(1);
  });

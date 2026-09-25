/**
 * Script pour créer la table lignes_reception
 */

import { pool } from '../src/utils/db.js';

const sql = `
  CREATE TABLE IF NOT EXISTS lignes_reception (
    id SERIAL PRIMARY KEY,
    id_reception INTEGER REFERENCES receptions_fournisseurs(id),
    id_product INTEGER,
    quantite_commandee NUMERIC(10,3) DEFAULT 0,
    quantite_recue NUMERIC(10,3) DEFAULT 0,
    quantite_acceptee NUMERIC(10,3) DEFAULT 0,
    quantite_rejetee NUMERIC(10,3) DEFAULT 0,
    controle_qualite VARCHAR(50) DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER
  );
`;

async function createTable() {
  try {
    await pool.query(sql);
    console.log('✅ Table lignes_reception créée/vérifiée');
    await pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createTable();

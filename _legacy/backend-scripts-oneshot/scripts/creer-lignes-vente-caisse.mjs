/**
 * Script pour créer la table lignes_vente_caisse
 */

import { pool } from '../src/utils/db.js';

const sql = `
  CREATE TABLE IF NOT EXISTS lignes_vente_caisse (
    id SERIAL PRIMARY KEY,
    id_vente INTEGER REFERENCES ventes_caisse(id),
    id_article INTEGER,
    quantite NUMERIC(10,3) DEFAULT 1,
    prix_unitaire NUMERIC(10,2),
    montant_ht NUMERIC(12,2),
    montant_ttc NUMERIC(12,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER
  );
`;

async function createTable() {
  try {
    await pool.query(sql);
    console.log('✅ Table lignes_vente_caisse créée/vérifiée');
    await pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createTable();

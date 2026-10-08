/**
 * Script pour vérifier la structure de la table lignes_reception
 */

import { pool } from '../src/utils/db.js';

async function checkTable() {
  try {
    const check = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'lignes_reception'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Table: lignes_reception');
    if (check.rows.length > 0) {
      console.log('Colonnes:', check.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    } else {
      console.log('❌ Table n\'existe pas');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkTable();

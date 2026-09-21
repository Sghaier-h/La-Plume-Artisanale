/**
 * Script pour vérifier la structure de la table receptions
 */

import { pool } from '../src/utils/db.js';

async function checkTable() {
  try {
    // Vérifier si receptions_fournisseurs existe
    const check1 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'receptions_fournisseurs'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Table: receptions_fournisseurs');
    if (check1.rows.length > 0) {
      console.log('Colonnes:', check1.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    } else {
      console.log('❌ Table n\'existe pas');
    }
    
    // Vérifier si receptions existe
    const check2 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'receptions'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Table: receptions');
    if (check2.rows.length > 0) {
      console.log('Colonnes:', check2.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
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

/**
 * Script pour vérifier les structures des tables POS
 */

import { pool } from '../src/utils/db.js';

async function checkTables() {
  try {
    // Vérifier caisses
    const check1 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'caisses'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Table: caisses');
    if (check1.rows.length > 0) {
      console.log('Colonnes:', check1.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    } else {
      console.log('❌ Table n\'existe pas');
    }
    
    // Vérifier ventes_caisse
    const check2 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ventes_caisse'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Table: ventes_caisse');
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

checkTables();

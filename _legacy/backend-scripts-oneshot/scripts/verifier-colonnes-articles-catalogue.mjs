/**
 * Script pour vérifier les colonnes de articles_catalogue
 */

import { pool } from '../src/utils/db.js';

async function checkColumns() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'articles_catalogue'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Colonnes articles_catalogue:');
    result.rows.forEach(r => {
      console.log(`  ${r.column_name} (${r.data_type})`);
    });
    
    // Vérifier les colonnes categorie
    const categorieCols = result.rows.filter(r => r.column_name.includes('categorie'));
    console.log('\n📋 Colonnes categorie:');
    if (categorieCols.length > 0) {
      categorieCols.forEach(r => {
        console.log(`  ${r.column_name} (${r.data_type})`);
      });
    } else {
      console.log('  Aucune colonne categorie trouvée');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkColumns();

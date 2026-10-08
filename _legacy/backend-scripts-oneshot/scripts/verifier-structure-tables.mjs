/**
 * Script pour vérifier la structure réelle des tables dans la base de données
 */

import { pool } from '../src/utils/db.js';

const tablesToCheck = [
  'utilisateurs',
  'societes',
  'clients',
  'factures',
  'employes'
];

async function checkTableStructure(tableName) {
  try {
    const query = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position
    `;
    
    const result = await pool.query(query, [tableName]);
    
    console.log(`\n📋 Table: ${tableName}`);
    console.log('-'.repeat(60));
    
    if (result.rows.length === 0) {
      console.log('❌ Table n\'existe pas');
      return null;
    }
    
    console.log(`Colonnes (${result.rows.length}):`);
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    return result.rows.map(r => r.column_name);
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🔍 Vérification de la structure des tables\n');
  console.log('='.repeat(80));
  
  const structures = {};
  
  for (const table of tablesToCheck) {
    const columns = await checkTableStructure(table);
    if (columns) {
      structures[table] = columns;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Vérification terminée');
  
  // Afficher un résumé
  console.log('\n📊 Résumé:');
  for (const [table, columns] of Object.entries(structures)) {
    console.log(`  ${table}: ${columns.length} colonnes`);
  }
  
  await pool.end();
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

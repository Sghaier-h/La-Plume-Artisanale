/**
 * Script pour vérifier la structure des tables problématiques
 */

import { pool } from '../src/utils/db.js';

const tablesToCheck = [
  'nomenclatures',
  'taches',
  'commandes',
  'machines',
  'suivi_fabrication',
  'articles_catalogue',
  'soustraitants',
  'pointage',
  'utilisateurs',
  'societes'
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
    
    if (result.rows.length === 0) {
      return { exists: false, columns: [] };
    }
    
    return {
      exists: true,
      columns: result.rows.map(r => ({
        name: r.column_name,
        type: r.data_type,
        nullable: r.is_nullable === 'YES'
      }))
    };
  } catch (error) {
    return { exists: false, columns: [], error: error.message };
  }
}

async function main() {
  console.log('🔍 Vérification des tables problématiques\n');
  console.log('='.repeat(80));
  
  const results = {};
  
  for (const table of tablesToCheck) {
    const structure = await checkTableStructure(table);
    results[table] = structure;
    
    if (!structure.exists) {
      console.log(`❌ ${table}: Table n'existe pas`);
    } else {
      console.log(`\n✅ ${table}: ${structure.columns.length} colonnes`);
      console.log('   Colonnes:', structure.columns.map(c => c.name).join(', '));
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Résumé:');
  
  // Vérifier les colonnes spécifiques
  const checks = {
    'nomenclatures': ['id_article_produit', 'id_nomenclature'],
    'taches': ['id_of', 'id_taches', 'id'],
    'commandes': ['date_commande', 'id_commande'],
    'machines': ['code_machine', 'id_machine'],
    'suivi_fabrication': ['id_of', 'id'],
    'articles_catalogue': ['nb_couleurs', 'id_couleur'],
    'soustraitants': ['capacite_production'],
    'pointage': ['id_pointage', 'id'],
    'utilisateurs': ['name', 'nom_utilisateur'],
    'societes': ['name', 'nom', 'id', 'id_societe']
  };
  
  for (const [table, expectedCols] of Object.entries(checks)) {
    if (results[table] && results[table].exists) {
      const actualCols = results[table].columns.map(c => c.name);
      const missing = expectedCols.filter(col => !actualCols.includes(col));
      const present = expectedCols.filter(col => actualCols.includes(col));
      
      if (missing.length > 0) {
        console.log(`\n⚠️  ${table}:`);
        console.log(`   Colonnes attendues manquantes: ${missing.join(', ')}`);
        console.log(`   Colonnes présentes: ${present.join(', ')}`);
      }
    }
  }
  
  await pool.end();
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

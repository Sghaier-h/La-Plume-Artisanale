/**
 * Introspection du schéma articles_commande / ordres_fabrication / bom_composant / machines
 * Usage: node introspect-articles-commande.mjs
 *
 * Sortie: colonnes JSON de chaque table utilisée par la génération d'OF.
 */
import { pool } from './src/utils/db.js';

const TABLES = [
  'articles_commande',
  'ordres_fabrication',
  'articles_catalogue',
  'machines',
  'bom_master',
  'bom_composant',
  'planning_machines',
  'matieres_premieres',
];

const introspect = async () => {
  for (const table of TABLES) {
    const r = await pool.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_name = $1
       ORDER BY ordinal_position`,
      [table]
    );
    console.log(`\n=== ${table} (${r.rows.length} cols) ===`);
    for (const c of r.rows) {
      console.log(`  ${c.column_name.padEnd(35)} ${c.data_type.padEnd(20)} ${c.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    }
  }
  await pool.end();
};

introspect().catch(err => {
  console.error('Erreur introspection:', err.message);
  process.exit(1);
});

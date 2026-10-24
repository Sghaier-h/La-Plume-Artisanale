// Migration: rename modeles.id_modeles → modeles.id_modele
// + rename séquence + rename toute contrainte qui référence explicitement id_modeles
// Idempotente et reversible via --rollback

import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const isRollback = process.argv.includes('--rollback');
const client = await pool.connect();

async function columnExists(table, column) {
  const r = await client.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
    [table, column]
  );
  return r.rowCount > 0;
}

async function seqExists(name) {
  const r = await client.query(
    `SELECT 1 FROM information_schema.sequences WHERE sequence_name = $1`,
    [name]
  );
  return r.rowCount > 0;
}

try {
  await client.query('BEGIN');

  if (isRollback) {
    console.log('⏪ ROLLBACK — rename id_modele → id_modeles');
    if (await columnExists('modeles', 'id_modele')) {
      await client.query('ALTER TABLE modeles RENAME COLUMN id_modele TO id_modeles');
      console.log('  ✓ modeles.id_modele → id_modeles');
    } else {
      console.log('  — modeles.id_modele absent, skip');
    }
    if (await seqExists('modeles_id_modele_seq')) {
      await client.query('ALTER SEQUENCE modeles_id_modele_seq RENAME TO modeles_id_modeles_seq');
      console.log('  ✓ sequence renamed back');
    }
  } else {
    console.log('⏩ APPLY — rename id_modeles → id_modele');
    if (await columnExists('modeles', 'id_modeles')) {
      await client.query('ALTER TABLE modeles RENAME COLUMN id_modeles TO id_modele');
      console.log('  ✓ modeles.id_modeles → id_modele');
    } else if (await columnExists('modeles', 'id_modele')) {
      console.log('  — modeles.id_modele déjà en place, skip');
    } else {
      throw new Error('modeles n\'a ni id_modeles ni id_modele — table incohérente');
    }
    if (await seqExists('modeles_id_modeles_seq')) {
      await client.query('ALTER SEQUENCE modeles_id_modeles_seq RENAME TO modeles_id_modele_seq');
      console.log('  ✓ sequence: modeles_id_modeles_seq → modeles_id_modele_seq');
    }
  }

  // articles_catalogue.id_modele existe déjà (FK, déjà singulier)
  const fkOk = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'articles_catalogue' AND column_name IN ('id_modele', 'id_modeles')
  `);
  console.log(`  ℹ articles_catalogue FK: ${fkOk.rows.map(r => r.column_name).join(', ')} (attendu: id_modele)`);

  await client.query('COMMIT');
  console.log('✅ Migration OK');
} catch (e) {
  await client.query('ROLLBACK');
  console.error('❌ Migration ROLLBACK:', e.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}

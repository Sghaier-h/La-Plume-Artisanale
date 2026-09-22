// Inspect modeles + articles tables to plan the seed
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const q = async (label, sql, params = []) => {
  try {
    const r = await pool.query(sql, params);
    console.log(`\n=== ${label} (${r.rows.length} rows) ===`);
    console.dir(r.rows, { depth: null, maxArrayLength: 50 });
  } catch (e) {
    console.log(`\n=== ${label} ERROR: ${e.message} ===`);
  }
};

const main = async () => {
  await q('modeles schema',
    `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
      WHERE table_name = 'modeles'
      ORDER BY ordinal_position`);
  await q('modeles count', `SELECT COUNT(*)::int AS n FROM modeles`);
  await q('modeles sample', `SELECT * FROM modeles LIMIT 5`);

  await q('articles_catalogue sample',
    `SELECT id_article, code_article, designation, id_dimension, id_couleur,
            id_finition, id_modele, actif, prix_unitaire_base
       FROM articles_catalogue
      ORDER BY code_article
      LIMIT 10`);
  await q('articles_catalogue id_modele fill',
    `SELECT
        SUM(CASE WHEN id_modele IS NULL THEN 1 ELSE 0 END)::int AS null_id_modele,
        SUM(CASE WHEN id_modele IS NOT NULL THEN 1 ELSE 0 END)::int AS with_id_modele,
        COUNT(*)::int AS total
       FROM articles_catalogue`);
  await q('articles_catalogue distinct id_modele',
    `SELECT DISTINCT id_modele FROM articles_catalogue ORDER BY id_modele NULLS LAST LIMIT 20`);
  await q('distinct model prefixes (top 80)',
    `SELECT substring(code_article FROM '^[A-Z]+[0-9]+') AS prefix,
            COUNT(*)::int AS n_articles,
            MIN(designation) AS sample_designation
       FROM articles_catalogue
      WHERE code_article IS NOT NULL
      GROUP BY prefix
      ORDER BY n_articles DESC
      LIMIT 80`);
  await q('prefix null count on catalogue',
    `SELECT COUNT(*)::int AS n_missing FROM articles_catalogue
      WHERE substring(code_article FROM '^[A-Z]+[0-9]+') IS NULL`);

  // deactivate old stubs below by returning here
  await pool.end();
  return;

  await q('articles schema',
    `SELECT column_name, data_type
       FROM information_schema.columns
      WHERE table_name = 'articles'
      ORDER BY ordinal_position`);
  await q('articles count', `SELECT COUNT(*)::int AS n FROM articles`);
  await q('articles sample',
    `SELECT id_article, code_article, designation, id_dimension, code_dimension,
            id_couleur, couleur_code, id_finition, code_finition,
            largeur, longueur, actif, prix_unitaire_base
       FROM articles
      ORDER BY code_article
      LIMIT 10`);

  await q('articles has id_modele?',
    `SELECT column_name FROM information_schema.columns
      WHERE table_name = 'articles' AND column_name IN ('id_modele','id_modeles','code_modele')`);

  await q('articles_catalogue exists?',
    `SELECT column_name, data_type FROM information_schema.columns
      WHERE table_name = 'articles_catalogue' ORDER BY ordinal_position`);
  await q('articles_catalogue count',
    `SELECT COUNT(*)::int AS n FROM articles_catalogue`);

  await q('distinct model prefixes (top 60)',
    `SELECT substring(code_article FROM '^[A-Z]+[0-9]+') AS prefix,
            COUNT(*)::int AS n_articles,
            MIN(designation) AS sample_designation
       FROM articles
      WHERE code_article IS NOT NULL
      GROUP BY prefix
      ORDER BY n_articles DESC
      LIMIT 60`);

  await q('prefix null count',
    `SELECT COUNT(*)::int AS n_missing FROM articles
      WHERE substring(code_article FROM '^[A-Z]+[0-9]+') IS NULL`);

  await pool.end();
};
main().catch((e) => { console.error(e); process.exit(1); });

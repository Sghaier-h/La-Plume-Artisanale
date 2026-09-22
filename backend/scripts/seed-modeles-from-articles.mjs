// Seed modeles table from articles_catalogue.
//
// The articles_catalogue table already has id_modele populated (FK-style
// integer pointing to modeles.id_modeles) for all 1504 rows, but the modeles
// table is empty. This script creates one modeles row per distinct id_modele
// referenced in articles_catalogue, deriving code_modele + libelle + categorie
// from the representative article's code_article and designation.
//
// Safe / idempotent:
//   - Only INSERT into `modeles`.
//   - ON CONFLICT (id_modeles) DO NOTHING keeps re-runs a no-op.
//   - No DELETE, no UPDATE on articles_catalogue.

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

// "Fouta Modèle ARTHUR Couleur Beige" -> "ARTHUR"
// "Fouta Eponge Modèle MARINIERE Couleur ..." -> "MARINIERE"
// Falls back to designation if the pattern is absent.
const extractModelName = (designation) => {
  if (!designation) return null;
  const m = designation.match(/Mod[eè]le\s+(.+?)\s+Couleur/i);
  if (m) return m[1].trim();
  const m2 = designation.match(/Mod[eè]le\s+(.+)$/i);
  if (m2) return m2[1].trim();
  return designation.trim();
};

// First word of designation names the product family / catégorie.
const extractCategorie = (designation) => {
  if (!designation) return 'Fouta';
  const first = designation.trim().split(/\s+/)[0];
  const map = {
    Fouta: 'Fouta',
    Jeté: 'Jeté',
    'Jete': 'Jeté',
    Serviette: 'Serviette',
    Echarpe: 'Echarpe',
    Pack: 'Pack',
    Torchon: 'Torchon',
  };
  return map[first] || first || 'Fouta';
};

const main = async () => {
  // Pick one representative row per id_modele: prefer the shortest code_article
  // so a base variant (e.g. AR1020-B01-01) wins over stray specials.
  const { rows } = await pool.query(`
    WITH ranked AS (
      SELECT
        id_modele,
        code_article,
        designation,
        substring(code_article FROM '^[A-Z]+[0-9]+') AS prefix,
        ROW_NUMBER() OVER (
          PARTITION BY id_modele
          ORDER BY
            -- Prefer real product designations over stray "Test ..." rows.
            CASE WHEN designation ~* 'Mod[eè]le\\s+[A-Z]' THEN 0 ELSE 1 END,
            length(code_article),
            code_article
        ) AS rn
      FROM articles_catalogue
      WHERE id_modele IS NOT NULL
    )
    SELECT id_modele, code_article, designation, prefix,
           (SELECT COUNT(*)::int FROM articles_catalogue a
             WHERE a.id_modele = ranked.id_modele) AS n_variants
      FROM ranked
     WHERE rn = 1
     ORDER BY id_modele
  `);

  console.log(`Found ${rows.length} distinct id_modele values in articles_catalogue.`);

  let inserted = 0;
  let skipped = 0;
  const seenCodes = new Set();

  for (const r of rows) {
    const name = extractModelName(r.designation) || r.prefix || `MODELE_${r.id_modele}`;
    let code_modele = (r.prefix || name.replace(/\s+/g, '_').toUpperCase()).slice(0, 60);
    // Guarantee uniqueness on code_modele within this run.
    if (seenCodes.has(code_modele)) code_modele = `${code_modele}_${r.id_modele}`;
    seenCodes.add(code_modele);

    const libelle = name.slice(0, 200);
    const categorie = extractCategorie(r.designation);

    const ins = await pool.query(
      `INSERT INTO modeles
         (id_modeles, name, description, code_modele, libelle, categorie,
          active, created_at, created_by)
       VALUES ($1, $2::varchar, $3::text, $4::varchar, $5::varchar, $6::varchar,
               true, NOW(), 1)
       ON CONFLICT (id_modeles) DO NOTHING
       RETURNING id_modeles`,
      [r.id_modele, libelle, libelle, code_modele, libelle, categorie]
    );
    if (ins.rowCount > 0) inserted++;
    else skipped++;
  }

  // Bump the sequence past our max id so future INSERTs without explicit id
  // don't collide.
  const maxIdRow = await pool.query(`SELECT COALESCE(MAX(id_modeles),0) AS m FROM modeles`);
  const maxId = Number(maxIdRow.rows[0].m) || 0;
  if (maxId > 0) {
    await pool.query(`SELECT setval('modeles_id_modeles_seq', $1, true)`, [maxId]);
  }

  const total = await pool.query(`SELECT COUNT(*)::int AS n FROM modeles`);
  const linked = await pool.query(
    `SELECT COUNT(*)::int AS n FROM articles_catalogue a
       JOIN modeles m ON m.id_modeles = a.id_modele`
  );

  console.log(`\n=== SEED RESULT ===`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped (already existed): ${skipped}`);
  console.log(`Modèles total: ${total.rows[0].n}`);
  console.log(`Articles linked to a real modele row: ${linked.rows[0].n}`);
  console.log(`Sequence modeles_id_modeles_seq set to: ${maxId}`);

  await pool.end();
};

main().catch((e) => { console.error(e); process.exit(1); });

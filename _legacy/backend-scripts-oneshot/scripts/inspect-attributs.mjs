// Inspect lookup tables used by the Modeles form.
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

const PATTERN = 'dimension|couleur|finition|tissage|personnalis|nombre_couleur|type_produit|type_article';

const main = async () => {
  const r = await pool.query(
    `SELECT table_schema, table_name
       FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog','information_schema')
        AND table_name ~* $1
      ORDER BY table_schema, table_name`,
    [PATTERN]
  );

  for (const t of r.rows) {
    const fq = `"${t.table_schema}"."${t.table_name}"`;
    let cols = [];
    try {
      const c = await pool.query(
        `SELECT column_name FROM information_schema.columns
          WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position`,
        [t.table_schema, t.table_name]
      );
      cols = c.rows.map(x => x.column_name);
    } catch {}
    let count = null;
    let sample = [];
    try {
      const cnt = await pool.query(`SELECT COUNT(*)::int AS n FROM ${fq}`);
      count = cnt.rows[0].n;
      const s = await pool.query(`SELECT * FROM ${fq} LIMIT 3`);
      sample = s.rows;
    } catch (e) {
      sample = [{ error: e.message }];
    }
    console.log(`\n=== ${t.table_schema}.${t.table_name} (${count} rows) ===`);
    console.log('columns:', cols.join(', '));
    console.log('sample :', JSON.stringify(sample, null, 2));
  }
  await pool.end();
};

main().catch(async (e) => { console.error(e); try { await pool.end(); } catch {} process.exit(1); });

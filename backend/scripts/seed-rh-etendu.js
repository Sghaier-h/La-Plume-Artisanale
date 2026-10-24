#!/usr/bin/env node
/**
 * seed-rh-etendu.js — Injecte les seeds RH étendu (Phase C · §11bis + §14quater)
 *
 * Utilisation :
 *   node scripts/seed-rh-etendu.js
 *   node scripts/seed-rh-etendu.js --dry       # affiche l'ordre sans exécuter
 *
 * Chaque fichier .sql est idempotent (UPDATE WHERE, DELETE WHERE LIKE '[DEMO]%',
 * ON CONFLICT DO NOTHING/UPDATE).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

function parseArgs() {
  const out = { dry: false };
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--dry') out.dry = true;
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const seedsDir = path.resolve(__dirname, '..', 'seeds', 'rh-etendu');

  if (!fs.existsSync(seedsDir)) {
    console.error(`[seed-rh-etendu] Dossier introuvable : ${seedsDir}`);
    process.exit(1);
  }
  const files = fs.readdirSync(seedsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`[seed-rh-etendu] Dossier : ${seedsDir}`);
  console.log(`[seed-rh-etendu] Fichiers (${files.length}) :`);
  for (const f of files) console.log(`   · ${f}`);

  if (args.dry) return;

  const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT || 5432),
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME     || 'laplume',
    ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();
  let okCount = 0;
  try {
    for (const f of files) {
      const full = path.join(seedsDir, f);
      const sql = fs.readFileSync(full, 'utf8');
      const t0 = Date.now();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        okCount++;
        console.log(`[seed-rh-etendu] OK ${f}  (${Date.now() - t0} ms)`);
      } catch (e) {
        await client.query('ROLLBACK');
        console.error(`[seed-rh-etendu] FAIL ${f}  ->  ${e.message}`);
        if (process.env.SEED_STRICT === 'true') throw e;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }

  console.log(`[seed-rh-etendu] ${okCount}/${files.length} fichiers exécutés`);
}

main().catch((e) => {
  console.error('[seed-rh-etendu] Erreur fatale :', e);
  process.exit(1);
});

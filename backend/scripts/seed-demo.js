#!/usr/bin/env node
/**
 * seed-demo.js — Injecte les seeds CRM (§3) dans la base configurée par .env
 *
 * Utilisation :
 *   node scripts/seed-demo.js               # exécute tous les .sql du dossier seeds/crm-clients/
 *   node scripts/seed-demo.js --dir <path>  # exécute un autre dossier
 *   node scripts/seed-demo.js --dry         # affiche l'ordre des fichiers sans exécuter
 *
 * Chaque fichier .sql doit être idempotent (ON CONFLICT DO NOTHING ou DELETE + INSERT).
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
  const out = { dir: null, dry: false };
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a === '--dry')  out.dry = true;
    if (a === '--dir')  out.dir = process.argv[++i];
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const seedsDir = args.dir
    ? path.resolve(args.dir)
    : path.resolve(__dirname, '..', 'seeds', 'crm-clients');

  if (!fs.existsSync(seedsDir)) {
    console.error(`[seed-demo] Dossier introuvable : ${seedsDir}`);
    process.exit(1);
  }
  const files = fs.readdirSync(seedsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`[seed-demo] Dossier : ${seedsDir}`);
  console.log(`[seed-demo] Fichiers (${files.length}) :`);
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
        console.log(`[seed-demo] ✓ ${f}  (${Date.now() - t0} ms)`);
      } catch (e) {
        await client.query('ROLLBACK');
        console.error(`[seed-demo] ✗ ${f}  →  ${e.message}`);
        if (process.env.SEED_STRICT === 'true') throw e;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
  console.log(`[seed-demo] Terminé — ${okCount}/${files.length} fichiers OK.`);
  process.exit(okCount === files.length ? 0 : 2);
}

main().catch((e) => {
  console.error('[seed-demo] Erreur fatale :', e);
  process.exit(1);
});

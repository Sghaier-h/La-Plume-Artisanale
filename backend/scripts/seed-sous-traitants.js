#!/usr/bin/env node
/**
 * seed-sous-traitants.js — Phase B §14quater.3
 * Injecte les seeds Sous-traitants étendus (dossier backend/seeds/sous-traitants/).
 * Idempotent : chaque .sql utilise ON CONFLICT ou DELETE+INSERT.
 *
 * Utilisation :
 *   npm run seed:sous-traitants
 *   node scripts/seed-sous-traitants.js --dry   # affiche l'ordre d'exécution
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
  const seedsDir = path.resolve(__dirname, '..', 'seeds', 'sous-traitants');

  if (!fs.existsSync(seedsDir)) {
    console.error(`[seed-ST] Dossier introuvable : ${seedsDir}`);
    process.exit(1);
  }
  const files = fs.readdirSync(seedsDir).filter(f => f.endsWith('.sql')).sort();

  console.log(`[seed-ST] Dossier : ${seedsDir}`);
  console.log(`[seed-ST] Fichiers (${files.length}) :`);
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
      const sql = fs.readFileSync(path.join(seedsDir, f), 'utf8');
      const t0 = Date.now();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        okCount++;
        console.log(`[seed-ST] OK ${f}  (${Date.now() - t0} ms)`);
      } catch (e) {
        await client.query('ROLLBACK');
        console.error(`[seed-ST] FAIL ${f}  →  ${e.message}`);
        if (process.env.SEED_STRICT === 'true') throw e;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
  console.log(`[seed-ST] Terminé — ${okCount}/${files.length} fichiers OK.`);
  process.exit(okCount === files.length ? 0 : 2);
}

main().catch(err => { console.error('[seed-ST] Erreur fatale :', err); process.exit(1); });

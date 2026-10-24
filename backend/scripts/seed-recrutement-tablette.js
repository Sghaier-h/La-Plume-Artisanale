#!/usr/bin/env node
/**
 * seed-recrutement-tablette.js — Injecte schéma + 15 questions démo Phase H.
 *
 * Utilisation :
 *   node scripts/seed-recrutement-tablette.js
 *   node scripts/seed-recrutement-tablette.js --dry
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
  const seedsDir = path.resolve(__dirname, '..', 'seeds', 'recrutement-tablette');

  const sqlFiles = fs.readdirSync(seedsDir).filter((f) => f.endsWith('.sql')).sort();
  const jsFiles  = fs.readdirSync(seedsDir).filter((f) => f.endsWith('.js')).sort();

  console.log(`[seed-recrutement-tablette] Dossier : ${seedsDir}`);
  if (args.dry) {
    console.log(`SQL (${sqlFiles.length}) : ${sqlFiles.join(', ')}`);
    console.log(`JS  (${jsFiles.length}) : ${jsFiles.join(', ')}`);
    return;
  }

  const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT || 5432),
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME     || 'laplume',
    ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();
  try {
    for (const f of sqlFiles) {
      const sql = fs.readFileSync(path.join(seedsDir, f), 'utf8');
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`[seed-recrutement-tablette] OK ${f}`);
      } catch (e) {
        await client.query('ROLLBACK');
        console.error(`[seed-recrutement-tablette] FAIL ${f}: ${e.message}`);
        if (process.env.SEED_STRICT === 'true') throw e;
      }
    }
  } finally {
    client.release();
  }

  for (const f of jsFiles) {
    const url = pathToFileURL(path.join(seedsDir, f)).href;
    try {
      const mod = await import(url);
      if (typeof mod.default === 'function') await mod.default();
    } catch (e) {
      console.error(`[seed-recrutement-tablette] FAIL ${f}: ${e.message}`);
      if (process.env.SEED_STRICT === 'true') throw e;
    }
  }

  await pool.end();
  console.log('[seed-recrutement-tablette] Terminé.');
}

main().catch((e) => { console.error(e); process.exit(1); });

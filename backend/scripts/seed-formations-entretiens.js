#!/usr/bin/env node
/**
 * seed-formations-entretiens.js — Injecte le schéma + les seeds démo
 * Phase G2 (§11bis.10 formations + §11bis.11 entretiens annuels).
 *
 * Utilisation :
 *   node scripts/seed-formations-entretiens.js
 *   node scripts/seed-formations-entretiens.js --dry
 *
 * Étapes :
 *   1. Applique database/schema-v2/41_rh_formations_entretiens.sql (via seeds/rh-formations-entretiens/00_schema.sql, autonome)
 *   2. Lance seeds/rh-formations-entretiens/01_demo.js (5 formations + 15 participants + 10 entretiens)
 *
 * Idempotent : DELETE WHERE … LIKE '[DEMO]%' avant INSERT. Les objets de schéma
 * utilisent IF NOT EXISTS et ALTER … ADD COLUMN IF NOT EXISTS.
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
  const seedsDir = path.resolve(__dirname, '..', 'seeds', 'rh-formations-entretiens');

  if (!fs.existsSync(seedsDir)) {
    console.error(`[seed-formations-entretiens] Dossier introuvable : ${seedsDir}`);
    process.exit(1);
  }
  const sqlFiles = fs.readdirSync(seedsDir).filter(f => f.endsWith('.sql')).sort();
  const jsFiles  = fs.readdirSync(seedsDir).filter(f => f.endsWith('.js')).sort();

  console.log(`[seed-formations-entretiens] Dossier : ${seedsDir}`);
  console.log(`[seed-formations-entretiens] SQL (${sqlFiles.length}) :`);
  for (const f of sqlFiles) console.log(`   · ${f}`);
  console.log(`[seed-formations-entretiens] JS  (${jsFiles.length}) :`);
  for (const f of jsFiles)  console.log(`   · ${f}`);

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
  try {
    for (const f of sqlFiles) {
      const full = path.join(seedsDir, f);
      const sql  = fs.readFileSync(full, 'utf8');
      const t0 = Date.now();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`[seed-formations-entretiens] OK ${f}  (${Date.now() - t0} ms)`);
      } catch (e) {
        await client.query('ROLLBACK');
        console.error(`[seed-formations-entretiens] FAIL ${f}  ->  ${e.message}`);
        if (process.env.SEED_STRICT === 'true') throw e;
      }
    }
  } finally {
    client.release();
  }

  // Exécute chaque module JS exposant un `default` (async main)
  for (const f of jsFiles) {
    const full = path.join(seedsDir, f);
    const url  = pathToFileURL(full).href;
    try {
      const mod = await import(url);
      const fn  = mod?.default;
      if (typeof fn !== 'function') {
        console.warn(`[seed-formations-entretiens] ${f} n'exporte pas de default function`);
        continue;
      }
      await fn();
    } catch (e) {
      console.error(`[seed-formations-entretiens] FAIL ${f}  ->  ${e.message}`);
      if (process.env.SEED_STRICT === 'true') throw e;
    }
  }

  await pool.end();
  console.log('[seed-formations-entretiens] Terminé.');
}

main().catch((e) => {
  console.error('[seed-formations-entretiens] Erreur fatale :', e);
  process.exit(1);
});

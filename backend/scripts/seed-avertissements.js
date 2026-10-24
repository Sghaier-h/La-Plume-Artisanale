#!/usr/bin/env node
/**
 * seed-avertissements.js — Injecte le schéma + les règles démo Phase H
 * (§11bis avertissements auto + §14ter.17c alertes).
 *
 * Utilisation :
 *   node scripts/seed-avertissements.js
 *   node scripts/seed-avertissements.js --dry
 *
 * Étapes :
 *   1. Applique seeds/avertissements/00_schema.sql
 *   2. Lance seeds/avertissements/01_regles_demo.js
 *
 * Idempotent : DELETE WHERE … LIKE '[DEMO]%' avant INSERT.
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
  const seedsDir = path.resolve(__dirname, '..', 'seeds', 'avertissements');

  if (!fs.existsSync(seedsDir)) {
    console.error(`[seed-avertissements] Dossier introuvable : ${seedsDir}`);
    process.exit(1);
  }
  const sqlFiles = fs.readdirSync(seedsDir).filter((f) => f.endsWith('.sql')).sort();
  const jsFiles  = fs.readdirSync(seedsDir).filter((f) => f.endsWith('.js')).sort();

  console.log(`[seed-avertissements] Dossier : ${seedsDir}`);
  console.log(`[seed-avertissements] SQL (${sqlFiles.length}) :`);
  for (const f of sqlFiles) console.log(`   · ${f}`);
  console.log(`[seed-avertissements] JS  (${jsFiles.length}) :`);
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
        console.log(`[seed-avertissements] OK ${f}  (${Date.now() - t0} ms)`);
      } catch (e) {
        await client.query('ROLLBACK');
        console.error(`[seed-avertissements] FAIL ${f}  ->  ${e.message}`);
        if (process.env.SEED_STRICT === 'true') throw e;
      }
    }
  } finally {
    client.release();
  }

  for (const f of jsFiles) {
    const full = path.join(seedsDir, f);
    const url  = pathToFileURL(full).href;
    try {
      const mod = await import(url);
      const fn  = mod?.default;
      if (typeof fn !== 'function') {
        console.warn(`[seed-avertissements] ${f} n'exporte pas de default function`);
        continue;
      }
      await fn();
    } catch (e) {
      console.error(`[seed-avertissements] FAIL ${f}  ->  ${e.message}`);
      if (process.env.SEED_STRICT === 'true') throw e;
    }
  }

  await pool.end();
  console.log('[seed-avertissements] Terminé.');
}

main().catch((e) => {
  console.error('[seed-avertissements] Erreur fatale :', e);
  process.exit(1);
});

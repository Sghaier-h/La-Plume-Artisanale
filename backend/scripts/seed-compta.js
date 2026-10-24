#!/usr/bin/env node
/**
 * seed-compta.js — Charge le schéma v2 Phase A (34 + 37) puis les seeds démo
 *                  comptabilité étendue (§14quater).
 *
 * Usage :
 *   node scripts/seed-compta.js            # exécute schémas + seeds
 *   node scripts/seed-compta.js --dry      # affiche l'ordre, n'exécute rien
 *   node scripts/seed-compta.js --no-schema  # saute l'application des schémas
 *
 * Chaque fichier .sql est idempotent (CREATE/ALTER IF NOT EXISTS, ON CONFLICT).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const SCHEMA_FILES = [
  path.join(PROJECT_ROOT, 'database', 'schema-v2', '34_comptabilite_etendue.sql'),
  path.join(PROJECT_ROOT, 'database', 'schema-v2', '37_documents_archive.sql'),
];
const SEEDS_DIR = path.resolve(__dirname, '..', 'seeds', 'comptabilite-etendue');

function parseArgs() {
  const out = { dry: false, skipSchema: false };
  for (const a of process.argv.slice(2)) {
    if (a === '--dry')       out.dry = true;
    if (a === '--no-schema') out.skipSchema = true;
  }
  return out;
}

async function execSqlFile(client, label, fullPath, dry) {
  if (!fs.existsSync(fullPath)) {
    console.warn(`[seed-compta] ⚠ ${label} introuvable : ${fullPath}`);
    return false;
  }
  console.log(`[seed-compta] ${dry ? '· (dry)' : '→ exécution'} ${label}`);
  if (dry) return true;
  const sql = fs.readFileSync(fullPath, 'utf8');
  const t0  = Date.now();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log(`[seed-compta] ✓ ${label}  (${Date.now() - t0} ms)`);
    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(`[seed-compta] ✗ ${label}  →  ${e.message}`);
    if (process.env.SEED_STRICT === 'true') throw e;
    return false;
  }
}

async function main() {
  const args = parseArgs();

  const seedFiles = fs.existsSync(SEEDS_DIR)
    ? fs.readdirSync(SEEDS_DIR).filter((f) => f.endsWith('.sql')).sort()
    : [];

  console.log('[seed-compta] Plan :');
  if (!args.skipSchema) {
    for (const s of SCHEMA_FILES) console.log(`   · schema  : ${path.basename(s)}`);
  }
  for (const f of seedFiles)      console.log(`   · seed    : ${f}`);

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
  let ok = 0;
  let ko = 0;
  try {
    if (!args.skipSchema) {
      for (const s of SCHEMA_FILES) {
        if (await execSqlFile(client, `schema ${path.basename(s)}`, s, false)) ok++; else ko++;
      }
    }
    for (const f of seedFiles) {
      const full = path.join(SEEDS_DIR, f);
      if (await execSqlFile(client, `seed ${f}`, full, false)) ok++; else ko++;
    }
  } finally {
    client.release();
    await pool.end();
  }
  console.log(`[seed-compta] Terminé : ${ok} ok, ${ko} erreurs`);
  process.exit(ko === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('[seed-compta] Fatal :', e);
  process.exit(2);
});

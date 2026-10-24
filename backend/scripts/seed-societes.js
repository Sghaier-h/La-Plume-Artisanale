#!/usr/bin/env node
/**
 * seed-societes.js — Injecte les 5 sociétés du groupe (§14quater.1 Phase E1)
 *
 * Utilisation :
 *   node scripts/seed-societes.js             # exécute vraiment
 *   node scripts/seed-societes.js --dry       # prévisualise sans écrire
 *
 * Idempotent : ON CONFLICT (code_societe) DO UPDATE côté SQL.
 */
import 'dotenv/config';
import pg from 'pg';
import { SOCIETES_SEED, applySocietesSeed } from '../seeds/multi-societes/01_societes.js';

const { Pool } = pg;

function parseArgs() {
  const out = { dry: false };
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--dry' || process.argv[i] === '--dry-run') out.dry = true;
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const header = args.dry
    ? '[seed-societes] MODE DRY-RUN — aucune écriture en base'
    : '[seed-societes] Démarrage';
  console.log(header);
  console.log(`[seed-societes] ${SOCIETES_SEED.length} sociétés à injecter :`);
  for (const s of SOCIETES_SEED) {
    console.log(`   · ${s.code_societe.padEnd(8)} ${s.raison_sociale}  (${s.type_societe})`);
  }

  if (args.dry) {
    console.log('[seed-societes] Fin (dry-run)');
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
    await client.query('BEGIN');
    const stats = await applySocietesSeed(client);
    await client.query('COMMIT');
    console.log(
      `[seed-societes] OK — ${stats.inserted} insérée(s), ${stats.updated} mise(s) à jour, total ${stats.total}`
    );
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(`[seed-societes] FAIL ->  ${e.message}`);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error('[seed-societes] Erreur fatale :', e);
  process.exit(1);
});

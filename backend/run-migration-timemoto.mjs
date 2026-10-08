#!/usr/bin/env node
/**
 * Runner : exécute migrations/20260921_timemoto.sql
 * Usage: node run-migration-timemoto.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './src/utils/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, 'migrations', '20260921_timemoto.sql');

(async () => {
  try {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`[migration] Exécution de ${path.basename(sqlPath)}...`);
    await pool.query(sql);
    console.log('[migration] OK — TimeMoto (colonnes pointage + config parametrage).');
    process.exit(0);
  } catch (err) {
    console.error('[migration] ÉCHEC:', err.message);
    process.exit(1);
  }
})();

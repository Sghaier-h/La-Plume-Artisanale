#!/usr/bin/env node
/**
 * Runner: migrations/20260921_portail_client.sql
 * Usage: node run-migration-portail-client.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './src/utils/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, 'migrations', '20260921_portail_client.sql');

(async () => {
  try {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`[migration] Exécution de ${path.basename(sqlPath)}...`);
    await pool.query(sql);
    console.log('[migration] OK — portail_client prêt.');
    process.exit(0);
  } catch (err) {
    console.error('[migration] ÉCHEC:', err.message);
    process.exit(1);
  }
})();

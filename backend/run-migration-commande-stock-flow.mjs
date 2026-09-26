#!/usr/bin/env node
/**
 * Runner: migrations/20260922_commande_stock_flow.sql
 * Usage: node run-migration-commande-stock-flow.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './src/utils/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, 'migrations', '20260922_commande_stock_flow.sql');

(async () => {
  try {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`[migration] Exécution de ${path.basename(sqlPath)}...`);
    await pool.query(sql);
    console.log('[migration] OK — commande_stock_flow prêt.');
    process.exit(0);
  } catch (err) {
    console.error('[migration] ÉCHEC:', err.message);
    process.exit(1);
  }
})();

#!/usr/bin/env node
/**
 * Runner : exécute migrations/20260921_hr_and_crm_tables.sql
 * Usage: node run-migration-hr-crm.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './src/utils/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, 'migrations', '20260921_hr_and_crm_tables.sql');

(async () => {
  try {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`[migration] Exécution de ${path.basename(sqlPath)}...`);
    await pool.query(sql);
    console.log('[migration] OK — tables HR & CRM créées / à jour.');
    process.exit(0);
  } catch (err) {
    console.error('[migration] ÉCHEC:', err.message);
    process.exit(1);
  }
})();

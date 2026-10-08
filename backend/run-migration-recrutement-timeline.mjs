#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './src/utils/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, 'migrations', '20260921_recrutement_timeline.sql');

(async () => {
  try {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`[migration] Exécution de ${path.basename(sqlPath)}...`);
    await pool.query(sql);
    console.log('[migration] OK — recrutement timeline appliquée.');
    process.exit(0);
  } catch (err) {
    console.error('[migration] ÉCHEC:', err.message);
    process.exit(1);
  }
})();

/**
 * migrate.js
 *
 * Script de migration idempotent pour ERP La Plume Artisanale.
 *
 * Fonctionnement :
 *   1. Assure que la table `schema_migrations` existe (execute
 *      database/schema-v2/00_migrations.sql en premier).
 *   2. Enumere tous les fichiers SQL de database/schema-v2/*.sql
 *      puis database/seeds-v2/*.sql, tries alphabetiquement
 *      (numerotation NN_...).
 *   3. Pour chaque fichier, calcule un SHA-256 du contenu.
 *   4. Compare a schema_migrations :
 *        - Deja applique + meme checksum       -> skip
 *        - Deja applique + checksum different  -> warning + skip
 *                                                 (sauf --force)
 *        - Pas applique                        -> execute
 *   5. Execute chaque nouveau fichier dans SA propre transaction.
 *      En cas d'erreur : rollback local, log, on stoppe. Les fichiers
 *      deja appliques restent commit.
 *   6. Enregistre dans schema_migrations :
 *      filename, checksum, duration_ms, applied_by, success, error_message.
 *
 * CLI :
 *   --dry-run            Liste sans executer
 *   --force              Reapplique meme si le checksum a change
 *   --only=<pattern>     Ne considere que les fichiers matchant le glob
 *   --backup-first       Lance scripts/backup.sh avant migration
 *
 * Variables d'environnement :
 *   DATABASE_URL                       (prod, prioritaire)
 *   DB_HOST/DB_PORT/DB_NAME/
 *   DB_USER/DB_PASSWORD                (dev)
 *   MIGRATION_APPLIED_BY               (surcharge le champ applied_by)
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { execSync, spawnSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// --------------------------------------------------------------------
// Racines projet
// --------------------------------------------------------------------
const PROJECT_ROOT   = path.resolve(__dirname, '..', '..', '..');
const SCHEMA_DIR     = path.join(PROJECT_ROOT, 'database', 'schema-v2');
const SEEDS_DIR      = path.join(PROJECT_ROOT, 'database', 'seeds-v2');
const BOOTSTRAP_FILE = path.join(SCHEMA_DIR, '00_migrations.sql');
const BACKUP_SCRIPT  = path.join(PROJECT_ROOT, 'scripts', 'backup.sh');

// --------------------------------------------------------------------
// Couleurs terminal
// --------------------------------------------------------------------
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  cyan:   '\x1b[36m',
};

const log     = (msg) => process.stdout.write(msg + '\n');
const info    = (msg) => log(`${C.cyan}${msg}${C.reset}`);
const ok      = (msg) => log(`${C.green}${msg}${C.reset}`);
const warn    = (msg) => log(`${C.yellow}${msg}${C.reset}`);
const errLog  = (msg) => log(`${C.red}${msg}${C.reset}`);
const dim     = (msg) => log(`${C.dim}${msg}${C.reset}`);

// --------------------------------------------------------------------
// CLI parse
// --------------------------------------------------------------------
const argv = process.argv.slice(2);
const flags = {
  dryRun:      argv.includes('--dry-run'),
  force:       argv.includes('--force'),
  backupFirst: argv.includes('--backup-first'),
  only:        null,
};
for (const a of argv) {
  if (a.startsWith('--only=')) flags.only = a.slice('--only='.length);
}

// Glob tres simple : *, ?, prefix/suffix. Suffisant pour --only=28_*
function matchesGlob(name, pattern) {
  if (!pattern) return true;
  const rx = new RegExp(
    '^' +
      pattern
        .split('')
        .map((c) => {
          if (c === '*') return '.*';
          if (c === '?') return '.';
          return c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
        })
        .join('') +
      '$',
  );
  return rx.test(name);
}

// --------------------------------------------------------------------
// Config Postgres
// --------------------------------------------------------------------
function buildPgConfig() {
  if (process.env.DATABASE_URL) {
    const ssl =
      process.env.PGSSLMODE === 'disable'
        ? false
        : /clouddb\.ovh\.net|render\.com|neon\.tech|supabase\.co/.test(
            process.env.DATABASE_URL,
          )
        ? { rejectUnauthorized: false }
        : undefined;
    return {
      connectionString: process.env.DATABASE_URL,
      ...(ssl !== undefined ? { ssl } : {}),
    };
  }
  const host = process.env.PGHOST || process.env.DB_HOST || 'localhost';
  const cfg = {
    host,
    port: parseInt(process.env.PGPORT || process.env.DB_PORT || '5432', 10),
    database:
      process.env.PGDATABASE || process.env.DB_NAME || 'fouta_erp',
    user: process.env.PGUSER || process.env.DB_USER || 'postgres',
    password: process.env.PGPASSWORD || process.env.DB_PASSWORD,
  };
  if (host && host.includes('clouddb.ovh.net')) {
    cfg.ssl = { rejectUnauthorized: false };
  }
  return cfg;
}

function whoAmI() {
  return (
    process.env.MIGRATION_APPLIED_BY ||
    process.env.USER ||
    process.env.USERNAME ||
    'system'
  );
}

// --------------------------------------------------------------------
// Enumeration des fichiers
// --------------------------------------------------------------------
function listSqlFiles(dir, label) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.sql'))
    .sort()
    .map((f) => ({
      filename: `${label}/${f}`,     // ex: schema-v2/01_core.sql
      absPath:  path.join(dir, f),
      label,
      basename: f,
    }));
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

// --------------------------------------------------------------------
// Backup preliminaire
// --------------------------------------------------------------------
function runBackupScript() {
  if (!fs.existsSync(BACKUP_SCRIPT)) {
    errLog(`[ERREUR] scripts/backup.sh introuvable a ${BACKUP_SCRIPT}`);
    return false;
  }
  info('[BACKUP] Lancement de scripts/backup.sh ...');
  const r = spawnSync('bash', [BACKUP_SCRIPT], {
    stdio: 'inherit',
    env: process.env,
  });
  if (r.status !== 0) {
    errLog(`[BACKUP] Echec (exit=${r.status})`);
    return false;
  }
  ok('[BACKUP] Termine avec succes');
  return true;
}

// --------------------------------------------------------------------
// Assure la presence de schema_migrations
// --------------------------------------------------------------------
async function ensureMigrationsTable(client) {
  // Chemin bootstrap : le fichier 00_migrations.sql est idempotent.
  if (!fs.existsSync(BOOTSTRAP_FILE)) {
    throw new Error(
      `Fichier bootstrap introuvable : ${BOOTSTRAP_FILE}`,
    );
  }
  const sql = fs.readFileSync(BOOTSTRAP_FILE, 'utf8');
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
}

// --------------------------------------------------------------------
// Lecture historique
// --------------------------------------------------------------------
async function fetchApplied(client) {
  const r = await client.query(
    `SELECT filename, checksum_sha256, success
       FROM schema_migrations`,
  );
  const map = new Map();
  for (const row of r.rows) map.set(row.filename, row);
  return map;
}

// --------------------------------------------------------------------
// Execution d'une migration
// --------------------------------------------------------------------
async function applyMigration(client, file, checksum) {
  const sql = fs.readFileSync(file.absPath, 'utf8');
  const started = Date.now();
  await client.query('BEGIN');
  try {
    await client.query(sql);
    // Enregistrer avant COMMIT pour rester dans la meme TX
    await client.query(
      `INSERT INTO schema_migrations
         (filename, checksum_sha256, applied_by, duration_ms, success)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (filename) DO UPDATE SET
         checksum_sha256 = EXCLUDED.checksum_sha256,
         applied_at      = NOW(),
         applied_by      = EXCLUDED.applied_by,
         duration_ms     = EXCLUDED.duration_ms,
         success         = TRUE,
         error_message   = NULL`,
      [file.filename, checksum, whoAmI(), Date.now() - started],
    );
    await client.query('COMMIT');
    return { ok: true, ms: Date.now() - started };
  } catch (e) {
    await client.query('ROLLBACK');
    // Trace de l'echec HORS transaction pour garder trace
    try {
      await client.query(
        `INSERT INTO schema_migrations
           (filename, checksum_sha256, applied_by, duration_ms,
            success, error_message)
         VALUES ($1, $2, $3, $4, FALSE, $5)
         ON CONFLICT (filename) DO UPDATE SET
           success       = FALSE,
           error_message = EXCLUDED.error_message,
           applied_at    = NOW(),
           applied_by    = EXCLUDED.applied_by,
           duration_ms   = EXCLUDED.duration_ms`,
        [
          file.filename,
          checksum,
          whoAmI(),
          Date.now() - started,
          String(e && e.message ? e.message : e).slice(0, 4000),
        ],
      );
    } catch (_) {
      /* ignore secondary error */
    }
    return { ok: false, ms: Date.now() - started, error: e };
  }
}

// --------------------------------------------------------------------
// Mode dry-run OFFLINE : si la DB n'est pas atteignable, on montre
// quand meme ce qui SERAIT applique en s'appuyant uniquement sur les
// fichiers du disque.
// --------------------------------------------------------------------
function dryRunOffline(files, reason) {
  warn(
    `[DRY-RUN] Base de donnees inaccessible (${reason}). Affichage sans etat DB.`,
  );
  log('');
  log(`${C.bold}Fichiers detectes (${files.length}) :${C.reset}`);
  for (const f of files) {
    const buf = fs.readFileSync(f.absPath);
    const cs  = sha256(buf).slice(0, 12);
    log(
      `  ${C.dim}[${cs}]${C.reset} ${f.filename} ` +
        `${C.dim}(${buf.length} bytes)${C.reset}`,
    );
  }
  log('');
  info(
    '[DRY-RUN] Aucune verification checksum possible sans DB. ' +
      'Reessayez avec DATABASE_URL configure pour comparer.',
  );
}

// --------------------------------------------------------------------
// Main
// --------------------------------------------------------------------
async function main() {
  log(`${C.bold}${C.blue}== ERP La Plume Artisanale : migrate.js ==${C.reset}`);
  if (flags.dryRun)      info('Mode: DRY-RUN (aucune modification)');
  if (flags.force)       warn('/!\\ FORCE actif : les checksums differents seront reappliques.');
  if (flags.only)        info(`Filtre --only=${flags.only}`);
  if (flags.backupFirst) info('Backup prealable demande (--backup-first)');

  // 1) Enumeration disque
  const schemaFiles = listSqlFiles(SCHEMA_DIR, 'schema-v2');
  const seedFiles   = listSqlFiles(SEEDS_DIR,  'seeds-v2');

  // schema en premier, seeds ensuite ; l'ordre alphabetique garantit
  // que 00_migrations.sql passe en premier dans le lot schema.
  let allFiles = [...schemaFiles, ...seedFiles];

  if (flags.only) {
    allFiles = allFiles.filter((f) => matchesGlob(f.basename, flags.only));
    info(`Filtre applique : ${allFiles.length} fichier(s) retenu(s).`);
  }

  if (allFiles.length === 0) {
    warn('Aucun fichier SQL trouve (verifiez database/schema-v2 et seeds-v2).');
    process.exit(0);
  }

  // 2) Backup si demande (avant tout le reste)
  if (flags.backupFirst && !flags.dryRun) {
    const okBackup = runBackupScript();
    if (!okBackup) {
      errLog('[ABORT] Backup echoue, migration annulee.');
      process.exit(2);
    }
  }

  // 3) Connexion PG (dry-run gracieux si echec)
  const pgConfig = buildPgConfig();
  const client   = new pg.Client(pgConfig);
  try {
    await client.connect();
  } catch (e) {
    if (flags.dryRun) {
      dryRunOffline(allFiles, e.message);
      process.exit(0);
    }
    errLog(`[ERREUR] Connexion Postgres impossible : ${e.message}`);
    dim(`   host=${pgConfig.host || '(connectionString)'}`);
    dim('   Passez --dry-run pour lister sans DB.');
    process.exit(1);
  }

  info(
    `[DB] Connecte a ${
      pgConfig.database || '(via DATABASE_URL)'
    } sur ${pgConfig.host || '(via DATABASE_URL)'}`,
  );

  try {
    // 4) Bootstrap table de tracking
    await ensureMigrationsTable(client);

    // 5) Etat courant
    const applied = await fetchApplied(client);

    // 6) Determiner les actions
    const plan = [];   // { action, file, checksum, prev }
    for (const f of allFiles) {
      // NB : 00_migrations.sql doit tout de meme etre trace pour son
      // propre checksum. On l'inclut normalement dans la boucle.
      const buf = fs.readFileSync(f.absPath);
      const cs  = sha256(buf);
      const prev = applied.get(f.filename);

      if (!prev) {
        plan.push({ action: 'apply', file: f, checksum: cs });
      } else if (prev.checksum_sha256 === cs && prev.success) {
        plan.push({ action: 'skip-same', file: f, checksum: cs, prev });
      } else if (!prev.success) {
        plan.push({ action: 'retry-failed', file: f, checksum: cs, prev });
      } else if (flags.force) {
        plan.push({ action: 'force-reapply', file: f, checksum: cs, prev });
      } else {
        plan.push({ action: 'checksum-mismatch', file: f, checksum: cs, prev });
      }
    }

    // 7) Affichage plan
    log('');
    log(`${C.bold}Plan :${C.reset}`);
    for (const step of plan) {
      const short = step.checksum.slice(0, 12);
      switch (step.action) {
        case 'apply':
          info(`  [APPLY]  ${step.file.filename}  (${short})`);
          break;
        case 'skip-same':
          dim(`  [SKIP]   ${step.file.filename}  (${short})`);
          break;
        case 'retry-failed':
          warn(`  [RETRY]  ${step.file.filename} (echec precedent)`);
          break;
        case 'force-reapply':
          warn(`  [FORCE]  ${step.file.filename}  (checksum a change)`);
          break;
        case 'checksum-mismatch':
          errLog(
            `  [WARN!]  ${step.file.filename} checksum different ` +
              `(prev=${step.prev.checksum_sha256.slice(0, 12)} ` +
              `now=${short}) - passez --force pour reappliquer`,
          );
          break;
      }
    }
    log('');

    if (flags.dryRun) {
      info('[DRY-RUN] Fin sans modifications.');
      return;
    }

    // 8) Execution
    let applied_count = 0;
    let failed = null;
    for (const step of plan) {
      if (
        step.action === 'skip-same' ||
        step.action === 'checksum-mismatch'
      ) {
        continue;
      }
      const label = step.action.toUpperCase();
      info(`[${label}] ${step.file.filename} ...`);
      const r = await applyMigration(client, step.file, step.checksum);
      if (r.ok) {
        ok(`  -> OK (${r.ms} ms)`);
        applied_count++;
      } else {
        errLog(`  -> ECHEC (${r.ms} ms) : ${r.error.message}`);
        failed = { file: step.file.filename, error: r.error };
        break;
      }
    }

    log('');
    if (failed) {
      errLog(
        `[FAIL] Migration interrompue sur ${failed.file}. ` +
          `Les fichiers precedemment appliques restent commit.`,
      );
      errLog(
        '       Corrigez le SQL, relancez : ' +
          "les fichiers OK seront skippes automatiquement.",
      );
      process.exit(3);
    } else {
      ok(`[DONE] ${applied_count} migration(s) appliquee(s).`);
    }
  } finally {
    try { await client.end(); } catch (_) { /* ignore */ }
  }
}

main().catch((e) => {
  errLog(`[FATAL] ${e.stack || e.message || e}`);
  process.exit(10);
});

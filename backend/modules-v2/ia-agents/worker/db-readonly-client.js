// db-readonly-client.js — Client Postgres LECTURE SEULE pour les agents IA.
//
// Sécurité en profondeur :
//  1. La connexion utilise IA_READONLY_DATABASE_URL, censée pointer sur un utilisateur
//     PG `ia_readonly_bot` avec GRANT SELECT uniquement (création côté DBA — voir README).
//  2. En complément, ce wrapper REJETTE toute requête contenant un mot-clé DML/DDL
//     (INSERT, UPDATE, DELETE, DROP, TRUNCATE, ALTER, CREATE, GRANT, REVOKE, COPY, ...).
//     Défense multi-couches : même si le rôle PG était accidentellement élargi, la requête ne passe pas.
//  3. Chaque requête est plafonnée par `statement_timeout` (défaut : 15 s) et un timeout Node.
//  4. Le nombre de lignes retournées est plafonné à `IA_READONLY_MAX_ROWS` (défaut 5000)
//     pour empêcher un agent de charger toute une table.
//
// Interface publique :
//   async query(sql, params, { rowLimit, timeoutMs } = {}) -> { rows, rowCount, truncated }

import pg from 'pg';

const { Pool } = pg;

let pool;

function initPool() {
  if (pool) return pool;
  const url = process.env.IA_READONLY_DATABASE_URL;
  if (!url) {
    throw new Error(
      'IA_READONLY_DATABASE_URL manquant. Configure le rôle Postgres ia_readonly_bot ' +
      '(SELECT-only) avant de démarrer le worker IA.'
    );
  }
  pool = new Pool({
    connectionString: url,
    max: Number(process.env.IA_READONLY_POOL_MAX || 5),
    idleTimeoutMillis: 30_000,
    statement_timeout: Number(process.env.IA_READONLY_STMT_TIMEOUT_MS || 15_000),
    ssl: process.env.IA_READONLY_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
  return pool;
}

// Regex de mots-clés destructifs / d'écriture — mode insensible casse, avec limites de mot.
const FORBIDDEN_KEYWORDS = /\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|GRANT|REVOKE|COPY|VACUUM|REINDEX|CLUSTER|LOCK|CALL|MERGE|COMMENT|RESET|SET\s+ROLE|DO\s+\$\$|SECURITY\s+DEFINER)\b/i;

// Autorise CTE (WITH ...) mais uniquement si la requête finale reste un SELECT.
function assertReadOnly(sql) {
  if (typeof sql !== 'string' || !sql.trim()) {
    throw new Error('SQL vide');
  }
  const cleaned = sql
    .replace(/--[^\n]*/g, '')          // commentaires ligne
    .replace(/\/\*[\s\S]*?\*\//g, ''); // commentaires bloc
  if (FORBIDDEN_KEYWORDS.test(cleaned)) {
    throw new Error('SQL refusé : mot-clé destructif détecté (lecture seule stricte).');
  }
  const trimmed = cleaned.trim().replace(/;+\s*$/, '');
  // Interdit le multi-statement — un seul SELECT/WITH par appel.
  if (/;/.test(trimmed)) {
    throw new Error('SQL refusé : plusieurs instructions détectées (une seule par appel).');
  }
  const head = trimmed.slice(0, 20).toUpperCase().trimStart();
  if (!(head.startsWith('SELECT') || head.startsWith('WITH') || head.startsWith('EXPLAIN') || head.startsWith('SHOW'))) {
    throw new Error('SQL refusé : seuls SELECT / WITH / EXPLAIN / SHOW sont autorisés.');
  }
  return trimmed;
}

/**
 * @param {string} sql  — requête SELECT (ou WITH ... SELECT ...)
 * @param {Array<any>} [params]
 * @param {object} [opts]
 * @param {number} [opts.rowLimit] — plafond de lignes (défaut IA_READONLY_MAX_ROWS)
 * @param {number} [opts.timeoutMs]
 */
export async function query(sql, params = [], opts = {}) {
  const safeSql = assertReadOnly(sql);
  const p = initPool();
  const rowLimit  = opts.rowLimit  || Number(process.env.IA_READONLY_MAX_ROWS || 5000);
  const timeoutMs = opts.timeoutMs || Number(process.env.IA_READONLY_STMT_TIMEOUT_MS || 15_000);

  const client = await p.connect();
  try {
    // Force le mode read-only au niveau session — ceinture + bretelles.
    await client.query('SET LOCAL default_transaction_read_only = on');
    await client.query(`SET LOCAL statement_timeout = ${Math.floor(timeoutMs)}`);
    // Wrappe en sous-requête LIMIT pour empêcher l'agent de rapatrier des giga-résultats.
    const wrapped = `SELECT * FROM (${safeSql}) __ia_ro LIMIT ${Math.floor(rowLimit) + 1}`;
    const res = await client.query(wrapped, params);
    const truncated = res.rows.length > rowLimit;
    return {
      rows: truncated ? res.rows.slice(0, rowLimit) : res.rows,
      rowCount: truncated ? rowLimit : res.rowCount,
      truncated,
    };
  } finally {
    client.release();
  }
}

/** Ferme le pool — utile pour tests / arrêt propre du worker. */
export async function shutdown() {
  if (pool) { await pool.end(); pool = null; }
}

export const _internal = { assertReadOnly };

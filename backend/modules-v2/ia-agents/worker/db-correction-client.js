// db-correction-client.js — Exécution transactionnelle des corrections VALIDÉES.
//
// Cet utilitaire est utilisé UNIQUEMENT depuis les endpoints
//   POST /findings/:id_finding/valider-correction
//   POST /findings/:id_finding/rollback-correction
// (jamais depuis l'agent-runner directement).
//
// Un utilisateur humain (rôle ADMIN) doit avoir validé le finding. La fonction
// `applyValidatedCorrection` :
//  1. Charge le SQL proposé du finding (persisté par l'agent dans `sql_correction_proposee`)
//  2. Exige un `id_utilisateur_validation` non-null (le controller le remplit depuis req.user)
//  3. Refuse tout SQL contenant DROP/TRUNCATE (destruction physique interdite §14bis.6bis.7)
//  4. Exécute le SQL dans une transaction avec snapshots avant/après
//  5. Insère la ligne d'audit dans `agents_ia_corrections_appliquees` (rollback 24h)
//
// La connexion pointe sur IA_CORRECTION_DATABASE_URL — user PG `ia_correction_bot`
// avec GRANT UPDATE / INSERT granulaires (pas de DROP/DELETE).

import pg from 'pg';
import { getPool as getAppPool } from '../../_shared/db.js';

const { Pool } = pg;

let correctionPool;

function initCorrectionPool() {
  if (correctionPool) return correctionPool;
  const url = process.env.IA_CORRECTION_DATABASE_URL;
  if (!url) {
    throw new Error(
      'IA_CORRECTION_DATABASE_URL manquant. Configure le rôle Postgres ia_correction_bot ' +
      '(UPDATE / INSERT granulaires, PAS de DROP/TRUNCATE) avant tout appel à applyValidatedCorrection.'
    );
  }
  correctionPool = new Pool({
    connectionString: url,
    max: Number(process.env.IA_CORRECTION_POOL_MAX || 2),
    idleTimeoutMillis: 30_000,
    statement_timeout: Number(process.env.IA_CORRECTION_STMT_TIMEOUT_MS || 30_000),
    ssl: process.env.IA_CORRECTION_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
  return correctionPool;
}

// Sur ce chemin on autorise UPDATE / INSERT / WITH, on interdit strictement la destruction.
const HARD_FORBIDDEN = /\b(DROP|TRUNCATE|GRANT|REVOKE|ALTER\s+ROLE|SECURITY\s+DEFINER)\b/i;

function assertNonDestructive(sql) {
  if (typeof sql !== 'string' || !sql.trim()) throw new Error('SQL vide');
  const cleaned = sql.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  if (HARD_FORBIDDEN.test(cleaned)) {
    throw new Error('SQL destructif refusé (DROP/TRUNCATE/GRANT/REVOKE interdits — §14bis.6bis.7).');
  }
  return cleaned.trim().replace(/;+\s*$/, '');
}

/**
 * Applique une correction validée. Non idempotent — à n'appeler qu'une fois par finding.
 *
 * @param {number|string} idFinding
 * @param {string} sql                          — requête à jouer (fournie/validée)
 * @param {number} idUtilisateurValidation      — user ADMIN qui valide (obligatoire)
 * @param {object} [opts]
 * @param {string} [opts.sqlRollback]           — SQL de rollback pré-calculé (facultatif)
 * @param {object} [opts.snapshotAvant]         — état avant, sérialisable JSON
 * @returns {Promise<{id_correction:number, resultat:'succes'|'echec', erreur?:string}>}
 */
export async function applyValidatedCorrection(idFinding, sql, idUtilisateurValidation, opts = {}) {
  if (!idFinding) throw new Error('id_finding requis');
  if (!idUtilisateurValidation) {
    throw new Error('Validation humaine obligatoire : id_utilisateur_validation manquant.');
  }
  const safeSql = assertNonDestructive(sql);

  const appPool = getAppPool();
  // 1. Vérifie que le finding existe ET que la proposition n'a pas été appliquée.
  const { rows: findingRows } = await appPool.query(
    `SELECT id_finding, id_agent, id_run, sql_correction_proposee, statut
       FROM agents_findings WHERE id_finding = $1`,
    [idFinding]
  );
  if (!findingRows[0]) throw new Error(`Finding #${idFinding} introuvable`);
  const finding = findingRows[0];
  if (finding.statut === 'traite') {
    throw new Error(`Finding #${idFinding} déjà traité — correction non ré-appliquable.`);
  }
  // Si le SQL passé diverge de celui stocké, on force le user à passer par la route dédiée.
  if (finding.sql_correction_proposee && finding.sql_correction_proposee.trim() !== safeSql) {
    throw new Error('SQL fourni ≠ SQL proposé par l\'agent. Utilise la proposition stockée.');
  }

  const pool = initCorrectionPool();
  const client = await pool.connect();
  let id_correction = null;
  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL statement_timeout = ${Number(process.env.IA_CORRECTION_STMT_TIMEOUT_MS || 30_000)}`);

    // 2. Exécute la correction.
    const execRes = await client.query(safeSql);

    // 3. Snapshot après (métadonnées : rowCount, timestamp).
    const snapshotApres = {
      rowCount: execRes.rowCount ?? null,
      command:  execRes.command  ?? null,
      applique_a: new Date().toISOString(),
    };

    // 4. Trace audit — via le pool "app" (l'INSERT dans agents_ia_corrections_appliquees
    //    est faite sur le rôle applicatif classique, pas via ia_correction_bot).
    const auditRes = await appPool.query(
      `INSERT INTO agents_ia_corrections_appliquees
         (id_finding, sql_execute, sql_rollback, snapshot_avant, snapshot_apres, id_utilisateur_validation)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6)
       RETURNING id_correction, date_application, date_rollback_limite`,
      [
        idFinding,
        safeSql,
        opts.sqlRollback || null,
        JSON.stringify(opts.snapshotAvant || {}),
        JSON.stringify(snapshotApres),
        idUtilisateurValidation,
      ]
    );
    id_correction = auditRes.rows[0].id_correction;

    // 5. Marque le finding comme traité.
    await appPool.query(
      `UPDATE agents_findings
         SET statut = 'traite',
             id_utilisateur_traitement = $1,
             date_traitement = NOW(),
             notes_traitement = COALESCE(notes_traitement,'') || $2
       WHERE id_finding = $3`,
      [idUtilisateurValidation, `\n[correction #${id_correction} appliquée]`, idFinding]
    );

    await client.query('COMMIT');
    return {
      id_correction,
      resultat: 'succes',
      date_application:      auditRes.rows[0].date_application,
      date_rollback_limite:  auditRes.rows[0].date_rollback_limite,
    };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    return { id_correction, resultat: 'echec', erreur: err.message || String(err) };
  } finally {
    client.release();
  }
}

/**
 * Annule une correction dans la fenêtre 24h en jouant le SQL de rollback pré-calculé.
 * Au-delà, la fonction lève — la remise en état passe par une écriture manuelle (§14bis.6bis.7).
 */
export async function rollbackCorrection(idCorrection, idUtilisateurRollback, motif) {
  if (!idCorrection) throw new Error('id_correction requis');
  if (!idUtilisateurRollback) throw new Error('id_utilisateur_rollback requis');

  const appPool = getAppPool();
  const { rows } = await appPool.query(
    `SELECT id_correction, id_finding, sql_rollback, date_rollback_limite, rollback_effectue
       FROM agents_ia_corrections_appliquees WHERE id_correction = $1`,
    [idCorrection]
  );
  const c = rows[0];
  if (!c) throw new Error(`Correction #${idCorrection} introuvable`);
  if (c.rollback_effectue) throw new Error(`Correction #${idCorrection} déjà rollbackée`);
  if (new Date(c.date_rollback_limite) < new Date()) {
    throw new Error('Fenêtre rollback 24h dépassée — passer par une écriture manuelle.');
  }
  if (!c.sql_rollback) {
    throw new Error('Aucun SQL de rollback pré-calculé pour cette correction.');
  }
  const safeSql = assertNonDestructive(c.sql_rollback);

  const pool = initCorrectionPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(safeSql);
    await appPool.query(
      `UPDATE agents_ia_corrections_appliquees
          SET rollback_effectue = TRUE, date_rollback = NOW(), raison_rollback = $1
        WHERE id_correction = $2`,
      [motif || null, idCorrection]
    );
    await appPool.query(
      `UPDATE agents_findings SET statut = 'vu', notes_traitement = COALESCE(notes_traitement,'') || $1
        WHERE id_finding = $2`,
      [`\n[correction #${idCorrection} rollback par user #${idUtilisateurRollback}]`, c.id_finding]
    );
    await client.query('COMMIT');
    return { id_correction: idCorrection, rollback: 'succes' };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function shutdown() {
  if (correctionPool) { await correctionPool.end(); correctionPool = null; }
}

export const _internal = { assertNonDestructive };

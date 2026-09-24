// service.js — findings
// Business logic layer. Delegates to model.js; add invariants, calculs & side-effects here.
import * as model from './model.js';
import { getPool } from '../../_shared/db.js';
import { applyValidatedCorrection, rollbackCorrection } from '../worker/db-correction-client.js';

export async function list(query = {}){
  const { limit = 100, offset = 0, ...filters } = query;
  return model.findAll({ limit: +limit, offset: +offset, filters });
}

export async function getOne(id){
  return model.findById(id);
}

export async function create(payload, user){
  return model.insert(payload, user);
}

export async function update(id, payload, user){
  return model.updateById(id, payload, user);
}

export async function remove(id, user){
  return model.deleteById(id, user);
}

// ---------------------------------------------------------------------------
// Workflow correction validée (§14bis.6bis)
// ---------------------------------------------------------------------------

/**
 * Un finding existe (créé par l'agent ou par un humain). On y attache une proposition
 * SQL — elle sera exécutée UNIQUEMENT après validation humaine ADMIN.
 * Pas d'exécution ici.
 */
export async function proposerCorrection(id, { sql_correction_proposee, action_suggeree }, user) {
  if (!sql_correction_proposee || typeof sql_correction_proposee !== 'string') {
    const err = new Error('sql_correction_proposee (chaîne non vide) requis'); err.code = 'BAD_REQUEST'; throw err;
  }
  // Interdit ici aussi les mots-clés destructifs pour éviter qu'un compte non-admin ne stocke un DROP.
  if (/\b(DROP|TRUNCATE|GRANT|REVOKE)\b/i.test(sql_correction_proposee)) {
    const err = new Error('Proposition destructive refusée'); err.code = 'DESTRUCTIVE_SQL'; throw err;
  }
  const pool = getPool();
  const { rows } = await pool.query(
    `UPDATE agents_findings
        SET sql_correction_proposee = $1,
            action_suggeree = COALESCE($2, action_suggeree),
            statut = CASE WHEN statut = 'nouveau' THEN 'vu' ELSE statut END
      WHERE id_finding = $3
      RETURNING *`,
    [sql_correction_proposee, action_suggeree || null, id]
  );
  if (!rows[0]) { const e = new Error('Finding introuvable'); e.code = 'NOT_FOUND'; throw e; }
  return rows[0];
}

/**
 * Validation humaine ADMIN → applique la correction via ia_correction_bot.
 * Le controller doit avoir vérifié que req.user.role === 'ADMIN'.
 */
export async function validerCorrection(id, { sql_override, sql_rollback, snapshot_avant }, user) {
  if (!user?.id) { const e = new Error('Authentification requise'); e.code = 'UNAUTHORIZED'; throw e; }
  const finding = await model.findById(id);
  if (!finding) { const e = new Error('Finding introuvable'); e.code = 'NOT_FOUND'; throw e; }
  const sql = sql_override || finding.sql_correction_proposee;
  if (!sql) { const e = new Error('Aucun SQL de correction associé'); e.code = 'NO_PROPOSAL'; throw e; }
  return applyValidatedCorrection(id, sql, user.id, { sqlRollback: sql_rollback, snapshotAvant: snapshot_avant });
}

/**
 * Rollback dans la fenêtre 24 h. Le controller vérifie ADMIN.
 */
export async function annulerCorrection(idFinding, { id_correction, motif }, user) {
  if (!user?.id) { const e = new Error('Authentification requise'); e.code = 'UNAUTHORIZED'; throw e; }
  if (!id_correction) { const e = new Error('id_correction requis'); e.code = 'BAD_REQUEST'; throw e; }
  return rollbackCorrection(id_correction, user.id, motif);
}

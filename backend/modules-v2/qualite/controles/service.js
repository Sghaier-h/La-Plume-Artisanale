import * as model from './model.js';
import { getPool } from '../../../src/config/database.js';

export const list   = (o) => model.findAll(o);
export const detail = (id) => model.findById(id);

/** Enregistre un contrôle. Si `est_bloquant` → OF passe `statut='bloque_qc'`. */
export async function enregistrer(ctrl, { id_utilisateur } = {}) {
  const created = await model.insert({ ...ctrl, id_controleur: ctrl.id_controleur ?? id_utilisateur });
  if (created.est_bloquant) {
    await getPool().query(
      `UPDATE ordres_fabrication SET statut = 'bloque_qc', updated_at = NOW() WHERE id_of = $1`,
      [created.id_of]);
  }
  return created;
}

export async function decider(id, { decision, motif, id_utilisateur }) {
  const c = await model.update(id, { decision });
  if (!c) return null;
  // Si laisser_passer_1c → OF débloqué
  if (decision === 'laisser_passer_1c' || decision === 'passer_2c') {
    await getPool().query(
      `UPDATE ordres_fabrication SET statut = 'controle', updated_at = NOW() WHERE id_of = $1 AND statut = 'bloque_qc'`,
      [c.id_of]);
  }
  return c;
}

/**
 * Phase F2 — Taux de conformité sur une période (30j par défaut).
 * total = nombre de contrôles non bloquants + bloquants
 * conformes = contrôles non bloquants
 * taux = round(conformes / total * 1000) / 10 (une décimale)
 */
export async function tauxConformite({ periode = '30j' } = {}) {
  const days = /^(\d+)j$/.test(periode) ? Math.max(1, parseInt(periode, 10)) : 30;
  try {
    const { rows } = await getPool().query(
      `SELECT
         COUNT(*)::int                                              AS total,
         COUNT(*) FILTER (WHERE est_bloquant = false)::int          AS conformes,
         COUNT(*) FILTER (WHERE est_bloquant = true)::int           AS non_conformes
       FROM controles_qualite
       WHERE date_controle >= NOW() - ($1 || ' days')::interval`,
      [String(days)]
    );
    const r = rows[0] || { total: 0, conformes: 0, non_conformes: 0 };
    const taux = r.total > 0 ? Math.round((r.conformes / r.total) * 1000) / 10 : 0;
    return { periode, periode_jours: days, total: r.total, conformes: r.conformes, non_conformes: r.non_conformes, taux };
  } catch {
    return { periode, periode_jours: days, total: 0, conformes: 0, non_conformes: 0, taux: 0 };
  }
}

/** Phase F2 — Derniers contrôles qualité (DashboardControleCentral). */
export async function recents({ limit = 20 } = {}) {
  try {
    const { rows } = await getPool().query(
      `SELECT c.id_ctrl, c.date_controle, c.id_of, c.id_controleur,
              c.est_bloquant, c.decision, c.type_controle, c.observations,
              o.numero_of
         FROM controles_qualite c
         LEFT JOIN ordres_fabrication o ON o.id_of = c.id_of
        ORDER BY c.date_controle DESC
        LIMIT $1`, [limit]
    );
    return rows;
  } catch {
    return [];
  }
}

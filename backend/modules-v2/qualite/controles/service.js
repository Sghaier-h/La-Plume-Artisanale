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

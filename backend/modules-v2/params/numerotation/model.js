import { getPool } from '../../_shared/db.js';

export async function listByCompany(idSociete) {
  const { rows } = await getPool().query(
    `SELECT * FROM parametres_numerotation WHERE id_societe = $1 ORDER BY code_document`,
    [idSociete]);
  return rows;
}
export async function findByCode(idSociete, code) {
  const { rows } = await getPool().query(
    `SELECT * FROM parametres_numerotation WHERE id_societe = $1 AND code_document = $2`,
    [idSociete, code]);
  return rows[0] || null;
}
export async function updateConfig(idSociete, code, patch) {
  const cols = ['prefixe','suffixe','format_annee','format_mois','separateur',
    'longueur_sequence','reset_sequence','template','visible_menu_params','verrouille'];
  const set = [], params = [];
  for (const c of cols) if (patch[c] !== undefined) { params.push(patch[c]); set.push(`${c} = $${params.length}`); }
  if (!set.length) return { updated: 0 };
  params.push(patch.updated_by || null);
  params.push(idSociete); params.push(code);
  await getPool().query(
    `UPDATE parametres_numerotation
        SET ${set.join(', ')}, updated_by = $${params.length - 2}, updated_at = NOW()
      WHERE id_societe = $${params.length - 1} AND code_document = $${params.length}`, params);
  return { updated: 1 };
}
export async function resetSequence(idSociete, code, userId) {
  await getPool().query(
    `UPDATE parametres_numerotation
        SET sequence_courante = 0, annee_reset = NULL, mois_reset = NULL,
            updated_by = $3, updated_at = NOW()
      WHERE id_societe = $1 AND code_document = $2`, [idSociete, code, userId || null]);
}

export async function audit(idNum, ancienneSeq, nouvelleSeq, numero, contexte, idUser, resetFlag = false) {
  await getPool().query(
    `INSERT INTO audit_numerotation (id_num, ancienne_seq, nouvelle_seq, numero_emis, contexte, id_user, reset_effectue)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [idNum, ancienneSeq, nouvelleSeq, numero, contexte || null, idUser || null, resetFlag]);
}

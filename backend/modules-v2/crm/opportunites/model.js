import { getPool } from '../../_shared/db.js';

const STATUTS = ['ACTIVE','GAGNEE','PERDUE','ANNULEE'];
const ETAPES  = ['NOUVEAU','QUALIFICATION','PROPOSITION','NEGOCIATION','CLOTURE_GAGNEE','CLOTURE_PERDUE'];

export async function list({ q, statut, etape, id_client, id_commercial, limit = 50, offset = 0 }) {
  const wh = ['1=1']; const p = [];
  if (statut)        { p.push(statut);        wh.push(`o.statut = $${p.length}`); }
  if (etape)         { p.push(etape);         wh.push(`o.etape  = $${p.length}`); }
  if (id_client)     { p.push(id_client);     wh.push(`o.id_client = $${p.length}`); }
  if (id_commercial) { p.push(id_commercial); wh.push(`o.id_commercial = $${p.length}`); }
  if (q) {
    p.push(`%${q}%`);
    wh.push(`(o.libelle ILIKE $${p.length} OR o.numero_opportunite ILIKE $${p.length})`);
  }
  const where = `WHERE ${wh.join(' AND ')}`;
  p.push(limit); p.push(offset);
  const sql = `
    SELECT o.*
      FROM opportunites o
      ${where}
     ORDER BY o.id_opportunite DESC
     LIMIT $${p.length - 1} OFFSET $${p.length}`;
  const cnt = await getPool().query(
    `SELECT COUNT(*)::int AS n FROM opportunites o ${where}`,
    p.slice(0, p.length - 2));
  const { rows } = await getPool().query(sql, p);
  return { rows, total: cnt.rows[0].n };
}

export async function stats() {
  const { rows } = await getPool().query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE statut = 'ACTIVE')::int  AS actives,
       COUNT(*) FILTER (WHERE statut = 'GAGNEE')::int  AS gagnees,
       COUNT(*) FILTER (WHERE statut = 'PERDUE')::int  AS perdues,
       COALESCE(SUM(montant_estime) FILTER (WHERE statut = 'ACTIVE'), 0)::numeric AS ca_previsionnel,
       COALESCE(SUM(montant_estime) FILTER (WHERE statut = 'GAGNEE'), 0)::numeric AS ca_gagne
       FROM opportunites`);
  return rows[0];
}

export async function findById(id) {
  const { rows } = await getPool().query(`SELECT * FROM opportunites WHERE id_opportunite = $1`, [id]);
  return rows[0] || null;
}

export async function create(o) {
  const num = o.numero_opportunite || `OPP-${Date.now()}`;
  const { rows } = await getPool().query(
    `INSERT INTO opportunites (numero_opportunite, libelle, id_client, id_contact, id_commercial,
       etape, montant_estime, probabilite, date_cloture_prevue,
       source_opportunite, statut, description, notes)
     VALUES ($1,$2,$3,$4,$5,COALESCE($6,'NOUVEAU'),COALESCE($7,0),COALESCE($8,0),$9,$10,COALESCE($11,'ACTIVE'),$12,$13)
     RETURNING id_opportunite`,
    [num, o.libelle, o.id_client || null, o.id_contact || null, o.id_commercial || 1,
     o.etape, o.montant_estime, o.probabilite, o.date_cloture_prevue || null,
     o.source_opportunite || null, o.statut, o.description || null, o.notes || null]);
  return rows[0].id_opportunite;
}

export async function update(id, patch) {
  const cols = ['libelle','id_client','id_contact','id_commercial','etape','montant_estime',
                'probabilite','date_cloture_prevue','date_cloture_reelle','source_opportunite',
                'statut','motif_perte','description','notes'];
  const set = [], p = [];
  for (const c of cols) if (patch[c] !== undefined) { p.push(patch[c]); set.push(`${c} = $${p.length}`); }
  if (!set.length) return { updated: 0 };
  p.push(id);
  await getPool().query(
    `UPDATE opportunites SET ${set.join(', ')}, updated_at = NOW() WHERE id_opportunite = $${p.length}`, p);
  return { updated: 1 };
}

export async function remove(id) {
  await getPool().query(`DELETE FROM opportunites WHERE id_opportunite = $1`, [id]);
  return { deleted: 1 };
}

export const ENUMS = { STATUTS, ETAPES };

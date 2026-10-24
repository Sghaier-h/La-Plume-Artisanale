// model.js — rh/entretiens
// Data-access layer pour `entretiens_annuels`.
import { getPool } from '../../_shared/db.js';
const pool = getPool();

const TABLE = 'entretiens_annuels';
const PK    = 'id_entretien';

const ALLOWED_COLS = new Set([
  'id_employe','id_evaluateur','date_entretien','type',
  'score_global','objectifs_atteints','objectifs_prochains',
  'besoins_formation','statut','signature_svg','id_societe','cree_par',
]);

function toJSONB(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v); } catch { return null; }
}

function sanitize(payload = {}) {
  const out = {};
  for (const [k, v] of Object.entries(payload)) {
    if (!ALLOWED_COLS.has(k)) continue;
    if (k === 'objectifs_atteints' || k === 'objectifs_prochains') out[k] = toJSONB(v);
    else out[k] = v;
  }
  return out;
}

export async function findAll({ limit = 100, offset = 0, filters = {} } = {}) {
  const where = [];
  const values = [];
  let i = 1;
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue;
    if (!ALLOWED_COLS.has(k)) continue;
    where.push(`e.${k} = $${i++}`);
    values.push(v);
  }
  const sql = `SELECT e.*,
                      emp.nom AS employe_nom, emp.prenom AS employe_prenom, emp.matricule
                 FROM ${TABLE} e
                 LEFT JOIN employes emp ON emp.id_employe = e.id_employe
                ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                ORDER BY e.date_entretien DESC, e.${PK} DESC
                LIMIT $${i++} OFFSET $${i}`;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT e.*,
            emp.nom AS employe_nom, emp.prenom AS employe_prenom, emp.matricule,
            ev.nom  AS evaluateur_nom, ev.prenom AS evaluateur_prenom
       FROM ${TABLE} e
       LEFT JOIN employes emp ON emp.id_employe = e.id_employe
       LEFT JOIN employes ev  ON ev.id_employe  = e.id_evaluateur
      WHERE e.${PK} = $1
      LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function insert(payload, user) {
  const clean = sanitize({ ...payload, cree_par: payload.cree_par ?? user?.id ?? null });
  const cols = Object.keys(clean);
  if (cols.length === 0) throw new Error('Payload vide');
  const vals = Object.values(clean);
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO ${TABLE} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const { rows } = await pool.query(sql, vals);
  return rows[0];
}

export async function updateById(id, payload) {
  const clean = sanitize(payload);
  const cols = Object.keys(clean);
  if (cols.length === 0) return findById(id);
  const set = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const sql = `UPDATE ${TABLE} SET ${set}, updated_at = NOW() WHERE ${PK} = $${cols.length + 1} RETURNING *`;
  const { rows } = await pool.query(sql, [...Object.values(clean), id]);
  return rows[0] || null;
}

export async function deleteById(id) {
  const { rowCount } = await pool.query(`DELETE FROM ${TABLE} WHERE ${PK} = $1`, [id]);
  return { deleted: rowCount };
}

// KPI / Dashboard ------------------------------------------------------
export async function kpi() {
  try {
    const { rows } = await pool.query(
      `SELECT
         COUNT(*)::int                                                           AS total,
         COUNT(*) FILTER (WHERE statut = 'planifie')::int                        AS planifies,
         COUNT(*) FILTER (WHERE statut = 'realise')::int                         AS realises,
         COUNT(*) FILTER (WHERE statut = 'valide')::int                          AS valides,
         COUNT(*) FILTER (WHERE statut = 'planifie' AND date_entretien < CURRENT_DATE)::int
                                                                                  AS en_retard,
         COUNT(*) FILTER (WHERE date_entretien >= CURRENT_DATE
                           AND date_entretien <  CURRENT_DATE + INTERVAL '30 days')::int
                                                                                  AS a_venir_30j,
         ROUND(AVG(score_global) FILTER (WHERE statut IN ('realise','valide')), 1)
                                                                                  AS score_moyen
       FROM ${TABLE}`
    );
    const r = rows[0] || {};
    return {
      total:         Number(r.total || 0),
      planifies:     Number(r.planifies || 0),
      realises:      Number(r.realises || 0),
      valides:       Number(r.valides || 0),
      en_retard:     Number(r.en_retard || 0),
      a_venir_30j:   Number(r.a_venir_30j || 0),
      score_moyen:   r.score_moyen != null ? Number(r.score_moyen) : null,
    };
  } catch {
    return { total: 0, planifies: 0, realises: 0, valides: 0, en_retard: 0, a_venir_30j: 0, score_moyen: null };
  }
}

export async function parMois({ annee = new Date().getFullYear() } = {}) {
  try {
    const { rows } = await pool.query(
      `SELECT TO_CHAR(DATE_TRUNC('month', date_entretien), 'YYYY-MM') AS mois,
              COUNT(*)::int                                            AS nb,
              COUNT(*) FILTER (WHERE statut = 'realise')::int          AS realises,
              COUNT(*) FILTER (WHERE statut = 'valide')::int           AS valides
         FROM ${TABLE}
        WHERE EXTRACT(YEAR FROM date_entretien) = $1
        GROUP BY 1
        ORDER BY 1`,
      [annee]
    );
    return rows.map(r => ({
      mois: r.mois,
      nb: Number(r.nb || 0),
      realises: Number(r.realises || 0),
      valides: Number(r.valides || 0),
    }));
  } catch { return []; }
}

export async function upcoming({ limit = 10 } = {}) {
  try {
    const { rows } = await pool.query(
      `SELECT e.id_entretien, e.date_entretien, e.type, e.statut, e.score_global,
              emp.id_employe, emp.nom AS employe_nom, emp.prenom AS employe_prenom, emp.matricule,
              ev.nom  AS evaluateur_nom, ev.prenom AS evaluateur_prenom
         FROM ${TABLE} e
         LEFT JOIN employes emp ON emp.id_employe = e.id_employe
         LEFT JOIN employes ev  ON ev.id_employe  = e.id_evaluateur
        WHERE e.statut = 'planifie'
          AND e.date_entretien >= CURRENT_DATE
        ORDER BY e.date_entretien ASC
        LIMIT $1`,
      [limit]
    );
    return rows;
  } catch { return []; }
}

export async function enRetard({ limit = 20 } = {}) {
  try {
    const { rows } = await pool.query(
      `SELECT e.id_entretien, e.date_entretien, e.type, e.statut,
              emp.id_employe, emp.nom AS employe_nom, emp.prenom AS employe_prenom, emp.matricule,
              ev.nom  AS evaluateur_nom, ev.prenom AS evaluateur_prenom,
              (CURRENT_DATE - e.date_entretien)::int AS jours_retard
         FROM ${TABLE} e
         LEFT JOIN employes emp ON emp.id_employe = e.id_employe
         LEFT JOIN employes ev  ON ev.id_employe  = e.id_evaluateur
        WHERE e.statut = 'planifie'
          AND e.date_entretien < CURRENT_DATE
        ORDER BY e.date_entretien ASC
        LIMIT $1`,
      [limit]
    );
    return rows;
  } catch { return []; }
}

// model.js — rh/formations
// Data-access layer pour `formations` + `formations_participants`.
import { getPool } from '../../_shared/db.js';
const pool = getPool();

const TABLE = 'formations';
const PK    = 'id_formation';

const ALLOWED_COLS = new Set([
  'titre','description','type','duree_heures','cout_tnd',
  'formateur','organisme','date_debut','date_fin','statut',
  'id_societe','cree_par',
]);

function sanitize(payload = {}) {
  const out = {};
  for (const [k, v] of Object.entries(payload)) {
    if (ALLOWED_COLS.has(k)) out[k] = v;
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
    where.push(`${k} = $${i++}`);
    values.push(v);
  }
  const sql = `SELECT * FROM ${TABLE} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY date_debut DESC NULLS LAST, ${PK} DESC LIMIT $${i++} OFFSET $${i}`;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(`SELECT * FROM ${TABLE} WHERE ${PK} = $1 LIMIT 1`, [id]);
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

// ─── Participants ────────────────────────────────────────────────────
export async function listParticipants(id_formation) {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, e.nom, e.prenom, e.matricule
         FROM formations_participants p
         LEFT JOIN employes e ON e.id_employe = p.id_employe
        WHERE p.id_formation = $1
        ORDER BY p.id_participant ASC`,
      [id_formation]
    );
    return rows;
  } catch { return []; }
}

export async function insertParticipant(payload) {
  const { id_formation, id_employe, statut = 'inscrit', note_satisfaction = null, attestation_url = null, commentaire = null } = payload;
  const { rows } = await pool.query(
    `INSERT INTO formations_participants
       (id_formation, id_employe, statut, note_satisfaction, attestation_url, commentaire)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id_formation, id_employe)
       DO UPDATE SET statut = EXCLUDED.statut,
                     note_satisfaction = EXCLUDED.note_satisfaction,
                     attestation_url = EXCLUDED.attestation_url,
                     commentaire = EXCLUDED.commentaire,
                     updated_at = NOW()
     RETURNING *`,
    [id_formation, id_employe, statut, note_satisfaction, attestation_url, commentaire]
  );
  return rows[0];
}

export async function removeParticipant(id_participant) {
  const { rowCount } = await pool.query(
    `DELETE FROM formations_participants WHERE id_participant = $1`, [id_participant]
  );
  return { deleted: rowCount };
}

// ─── KPI / Dashboard ─────────────────────────────────────────────────
export async function kpi({ id_societe } = {}) {
  try {
    const annee = new Date().getFullYear();
    const whereSoc = id_societe ? `AND (id_societe = $1 OR id_societe IS NULL)` : '';
    const params = id_societe ? [id_societe] : [];
    const { rows } = await pool.query(
      `SELECT
         COUNT(*)::int                                                     AS total,
         COUNT(*) FILTER (WHERE statut = 'planifiee')::int                  AS planifiees,
         COUNT(*) FILTER (WHERE statut = 'en_cours')::int                   AS en_cours,
         COUNT(*) FILTER (WHERE statut = 'terminee')::int                   AS terminees,
         COUNT(*) FILTER (WHERE statut = 'annulee')::int                    AS annulees,
         COALESCE(SUM(cout_tnd) FILTER (WHERE EXTRACT(YEAR FROM date_debut) = ${annee}),0)::numeric
                                                                            AS cout_annee,
         COALESCE(SUM(duree_heures) FILTER (WHERE EXTRACT(YEAR FROM date_debut) = ${annee}),0)::numeric
                                                                            AS heures_annee
       FROM ${TABLE}
       WHERE 1=1 ${whereSoc}`,
      params
    );
    const r = rows[0] || {};
    // compte participants annee
    const { rows: pr } = await pool.query(
      `SELECT COUNT(*)::int AS total_participants
         FROM formations_participants p
         JOIN ${TABLE} f ON f.id_formation = p.id_formation
        WHERE EXTRACT(YEAR FROM f.date_debut) = ${annee}`
    );
    return {
      annee,
      total: Number(r.total || 0),
      planifiees: Number(r.planifiees || 0),
      en_cours: Number(r.en_cours || 0),
      terminees: Number(r.terminees || 0),
      annulees: Number(r.annulees || 0),
      cout_annee_tnd: Number(r.cout_annee || 0),
      heures_annee: Number(r.heures_annee || 0),
      total_participants: Number(pr[0]?.total_participants || 0),
    };
  } catch {
    return { annee: new Date().getFullYear(), total: 0, planifiees: 0, en_cours: 0, terminees: 0, annulees: 0, cout_annee_tnd: 0, heures_annee: 0, total_participants: 0 };
  }
}

export async function parMois({ annee = new Date().getFullYear() } = {}) {
  try {
    const { rows } = await pool.query(
      `SELECT TO_CHAR(DATE_TRUNC('month', date_debut), 'YYYY-MM') AS mois,
              COUNT(*)::int                                        AS nb_sessions,
              COALESCE(SUM(cout_tnd),0)::numeric                   AS cout,
              COALESCE(SUM(duree_heures),0)::numeric               AS heures
         FROM ${TABLE}
        WHERE EXTRACT(YEAR FROM date_debut) = $1
        GROUP BY 1
        ORDER BY 1`,
      [annee]
    );
    return rows.map(r => ({
      mois: r.mois,
      nb_sessions: Number(r.nb_sessions || 0),
      cout_tnd: Number(r.cout || 0),
      heures: Number(r.heures || 0),
    }));
  } catch { return []; }
}

export async function upcoming({ limit = 10 } = {}) {
  try {
    const { rows } = await pool.query(
      `SELECT f.*,
              (SELECT COUNT(*)::int FROM formations_participants p WHERE p.id_formation = f.id_formation) AS nb_participants
         FROM ${TABLE} f
        WHERE f.statut IN ('planifiee','en_cours')
          AND (f.date_debut IS NULL OR f.date_debut >= CURRENT_DATE - INTERVAL '7 days')
        ORDER BY f.date_debut ASC NULLS LAST, f.id_formation DESC
        LIMIT $1`,
      [limit]
    );
    return rows;
  } catch { return []; }
}

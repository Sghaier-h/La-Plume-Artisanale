// model.js — rh/primes-scores
// Table `primes_scores_journaliers`. score_global est GENERATED : on n'insère
// que les 5 sous-scores. Calcul massif agrégeant pointages + qualité pour un
// atelier / une date.
import { getPool, withTransaction } from '../../_shared/db.js';

const pool  = getPool();
const TABLE = 'primes_scores_journaliers';
const PK    = 'id_score';

const INSERT_COLS = new Set([
  'id_employe','date_journee','atelier',
  'score_quantite','score_qualite','score_presence','score_absences','score_discipline',
  'metriques_json',
]);

function pickInsert(payload) {
  const out = {};
  for (const [k, v] of Object.entries(payload || {})) {
    if (INSERT_COLS.has(k) && v !== undefined) out[k] = v;
  }
  return out;
}

export async function findAll({ limit = 100, offset = 0, filters = {} } = {}) {
  const where = [];
  const values = [];
  let i = 1;
  const ALLOWED = new Set(['id_employe','date_journee','atelier']);
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue;
    if (!ALLOWED.has(k)) continue;
    where.push(`${k} = $${i++}`);
    values.push(v);
  }
  const sql = `SELECT * FROM ${TABLE}
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY date_journee DESC, atelier, id_employe
               LIMIT $${i++} OFFSET $${i}`;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(`SELECT * FROM ${TABLE} WHERE ${PK} = $1 LIMIT 1`, [id]);
  return rows[0] || null;
}

export async function insert(payload) {
  const data = pickInsert(payload);
  if (!data.id_employe || !data.date_journee || !data.atelier) {
    throw new Error('id_employe, date_journee, atelier requis');
  }
  const cols = Object.keys(data);
  const vals = Object.values(data);
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO ${TABLE} (${cols.join(', ')})
               VALUES (${placeholders})
               ON CONFLICT (id_employe, date_journee) DO UPDATE
                 SET score_quantite   = EXCLUDED.score_quantite,
                     score_qualite    = EXCLUDED.score_qualite,
                     score_presence   = EXCLUDED.score_presence,
                     score_absences   = EXCLUDED.score_absences,
                     score_discipline = EXCLUDED.score_discipline,
                     atelier          = EXCLUDED.atelier,
                     metriques_json   = EXCLUDED.metriques_json,
                     date_calcul      = NOW()
               RETURNING *`;
  const { rows } = await pool.query(sql, vals);
  return rows[0];
}

export async function updateById(id, payload) {
  const data = pickInsert(payload);
  const cols = Object.keys(data);
  if (!cols.length) return findById(id);
  const set = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const sql = `UPDATE ${TABLE} SET ${set}, date_calcul = NOW()
               WHERE ${PK} = $${cols.length + 1} RETURNING *`;
  const { rows } = await pool.query(sql, [...Object.values(data), id]);
  return rows[0] || null;
}

export async function deleteById(id) {
  const { rowCount } = await pool.query(`DELETE FROM ${TABLE} WHERE ${PK} = $1`, [id]);
  return { deleted: rowCount };
}

/**
 * Cumul semaine (ISO week) pour un employé donné.
 */
export async function cumulSemaineEmploye(idEmploye, annee, numeroSemaine) {
  const { rows } = await pool.query(
    `SELECT id_employe,
            COUNT(*)::int AS nb_jours,
            COALESCE(SUM(score_quantite),   0)::numeric(10,3) AS somme_quantite,
            COALESCE(SUM(score_qualite),    0)::numeric(10,3) AS somme_qualite,
            COALESCE(SUM(score_presence),   0)::numeric(10,3) AS somme_presence,
            COALESCE(SUM(score_absences),   0)::numeric(10,3) AS somme_absences,
            COALESCE(SUM(score_discipline), 0)::numeric(10,3) AS somme_discipline,
            COALESCE(SUM(score_global),     0)::numeric(10,3) AS score_global_semaine,
            COALESCE(AVG(score_global),     0)::numeric(10,3) AS score_global_moyen,
            MIN(atelier) AS atelier
       FROM ${TABLE}
      WHERE id_employe = $1
        AND EXTRACT(ISOYEAR FROM date_journee) = $2
        AND EXTRACT(WEEK    FROM date_journee) = $3
      GROUP BY id_employe`,
    [idEmploye, annee, numeroSemaine]
  );
  return rows[0] || {
    id_employe: Number(idEmploye), nb_jours: 0,
    somme_quantite: 0, somme_qualite: 0, somme_presence: 0,
    somme_absences: 0, somme_discipline: 0,
    score_global_semaine: 0, score_global_moyen: 0,
    atelier: null,
  };
}

/**
 * Calcule (ou recalcule) les scores journaliers d'un atelier pour une date.
 *
 * Sources agrégées :
 *   - score_presence     : pointages.heures_travaillees / 8h  → % (cap 100)
 *   - score_absences     : 100 - (nb_absences_injustifiees * 50) sur la journée
 *   - score_qualite      : 100 * qte_1er_choix / (qte_1er + qte_2e + qte_rebut)
 *                          sur les contrôles qualité du jour où l'employé est
 *                          référencé (id_operateur via defauts_signales,
 *                          sinon fallback 100 s'il n'y a aucun défaut).
 *   - score_quantite     : ratio quantités OK / cible standard (défaut : 100 si
 *                          rendement inconnu — TODO câbler `of_postes`).
 *   - score_discipline   : 100 par défaut, -25 par retard > 15 min sur pointages.
 *
 * Retourne la liste des lignes insérées / mises à jour.
 */
export async function bulkCalculJournalier({ date_journee, atelier, id_employes = null }) {
  if (!date_journee || !atelier) throw new Error('date_journee et atelier requis');

  return withTransaction(async (client) => {
    // Cible : employés actifs (filtre optionnel sur liste explicite).
    const empParams = [];
    let empWhere = `statut = 'actif'`;
    if (Array.isArray(id_employes) && id_employes.length) {
      empParams.push(id_employes);
      empWhere += ` AND id_employe = ANY($${empParams.length}::bigint[])`;
    }
    const emp = await client.query(
      `SELECT id_employe FROM employes WHERE ${empWhere}`,
      empParams
    );

    // Agrégats journée
    const [ptg, abs, ctrl, dfs, hs] = await Promise.all([
      client.query(
        `SELECT id_employe, heures_travaillees, heures_retard
           FROM pointages WHERE date_pointage = $1`,
        [date_journee]
      ),
      client.query(
        `SELECT id_employe, type_absence, justifiee, duree_h
           FROM absences WHERE date_absence = $1`,
        [date_journee]
      ),
      client.query(
        `SELECT id_controleur,
                COALESCE(SUM(qte_1er_choix), 0)::numeric AS q1,
                COALESCE(SUM(qte_2e_choix),  0)::numeric AS q2,
                COALESCE(SUM(qte_rebut),     0)::numeric AS qr
           FROM controles_qualite
          WHERE date_controle::date = $1
          GROUP BY id_controleur`,
        [date_journee]
      ),
      client.query(
        `SELECT id_operateur,
                COUNT(*) FILTER (WHERE ds.id_defaut_type IN
                  (SELECT id_defaut_type FROM defauts_types WHERE severite_defaut IN ('majeur','critique'))
                )::int AS nb_defauts_graves,
                COUNT(*)::int AS nb_defauts_total
           FROM defauts_signales ds
          WHERE date_signalement::date = $1
            AND id_operateur IS NOT NULL
          GROUP BY id_operateur`,
        [date_journee]
      ),
      // Heures supp — bonus discipline (facultatif)
      client.query(
        `SELECT 1 WHERE FALSE`, []
      ),
    ]);

    const byEmp = new Map();
    for (const r of ptg.rows) byEmp.set(String(r.id_employe), { ...(byEmp.get(String(r.id_employe))||{}), pointage: r });
    for (const r of abs.rows) {
      const k = String(r.id_employe);
      const acc = byEmp.get(k) || {};
      acc.absence = r;
      byEmp.set(k, acc);
    }
    for (const r of ctrl.rows) byEmp.set(String(r.id_controleur), { ...(byEmp.get(String(r.id_controleur))||{}), qualite: r });
    for (const r of dfs.rows) byEmp.set(String(r.id_operateur), { ...(byEmp.get(String(r.id_operateur))||{}), defauts: r });

    const results = [];
    for (const { id_employe } of emp.rows) {
      const src = byEmp.get(String(id_employe)) || {};

      // Presence
      const h = Number(src.pointage?.heures_travaillees || 0);
      const score_presence = Math.max(0, Math.min(100, (h / 8) * 100));

      // Absences (0 = pas d'absence → 100 ; injust = -50 ; justif = -20)
      let score_absences = 100;
      if (src.absence) {
        const t = src.absence.type_absence;
        const dh = Number(src.absence.duree_h || 8);
        const factor = Math.min(1, dh / 8);
        if (t === 'injustifiee') score_absences -= 50 * factor;
        else if (t === 'maladie') score_absences -= 20 * factor;
        else score_absences -= 10 * factor;
        score_absences = Math.max(0, score_absences);
      }

      // Discipline (retards)
      const retard = Number(src.pointage?.heures_retard || 0);
      let score_discipline = 100;
      if (retard > 0.25) score_discipline -= 25;
      if (retard > 0.5)  score_discipline -= 25;
      if (src.defauts?.nb_defauts_graves) score_discipline -= Math.min(50, src.defauts.nb_defauts_graves * 10);
      score_discipline = Math.max(0, score_discipline);

      // Qualite : ratio 1er choix sur volume contrôlé + pénalité défauts
      let score_qualite = 100;
      if (src.qualite) {
        const q1 = Number(src.qualite.q1 || 0);
        const q2 = Number(src.qualite.q2 || 0);
        const qr = Number(src.qualite.qr || 0);
        const tot = q1 + q2 + qr;
        if (tot > 0) score_qualite = (q1 / tot) * 100;
      }
      if (src.defauts?.nb_defauts_total) {
        score_qualite = Math.max(0, score_qualite - Math.min(30, src.defauts.nb_defauts_total * 5));
      }

      // Quantité : à défaut de rendement standard câblé, fallback 100 quand
      // présence > 0, sinon 0. Placeholder documenté.
      const score_quantite = h > 0 ? 100 : 0;

      // Skip si aucune donnée signifiante pour économiser des lignes
      if (!src.pointage && !src.absence && !src.qualite && !src.defauts) continue;

      const metriques = {
        heures_travaillees: h,
        heures_retard: retard,
        absence: src.absence?.type_absence || null,
        qualite: src.qualite ? {
          q1: Number(src.qualite.q1), q2: Number(src.qualite.q2), qr: Number(src.qualite.qr),
        } : null,
        defauts: src.defauts ? {
          total: src.defauts.nb_defauts_total, graves: src.defauts.nb_defauts_graves,
        } : null,
        source: 'bulk-calcul-journalier',
      };

      const up = await client.query(
        `INSERT INTO ${TABLE}
           (id_employe, date_journee, atelier,
            score_quantite, score_qualite, score_presence,
            score_absences, score_discipline, metriques_json)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
         ON CONFLICT (id_employe, date_journee) DO UPDATE SET
           atelier          = EXCLUDED.atelier,
           score_quantite   = EXCLUDED.score_quantite,
           score_qualite    = EXCLUDED.score_qualite,
           score_presence   = EXCLUDED.score_presence,
           score_absences   = EXCLUDED.score_absences,
           score_discipline = EXCLUDED.score_discipline,
           metriques_json   = EXCLUDED.metriques_json,
           date_calcul      = NOW()
         RETURNING *`,
        [
          id_employe, date_journee, atelier,
          Number(score_quantite.toFixed(2)),
          Number(score_qualite.toFixed(2)),
          Number(score_presence.toFixed(2)),
          Number(score_absences.toFixed(2)),
          Number(score_discipline.toFixed(2)),
          JSON.stringify(metriques),
        ]
      );
      results.push(up.rows[0]);
    }
    return { atelier, date_journee, nb_scores: results.length, scores: results };
  });
}

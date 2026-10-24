// model.js — rh/recrutement-tablette
import { getPool } from '../../_shared/db.js';
const pool = getPool();

export async function questionsActives(poste) {
  const where = ['actif = TRUE'];
  const values = [];
  if (poste) { where.push(`poste_cible = $${values.length + 1}`); values.push(poste); }
  const { rows } = await pool.query(
    `SELECT * FROM questions_recrutement
      WHERE ${where.join(' AND ')}
      ORDER BY ordre ASC, id_question ASC`,
    values
  );
  return rows;
}

/** Scoring : pour `test_logique`, compare bonne_reponse ; pour `note`, somme pondérée. */
export function computeScore(questions, reponses, testLogique) {
  let score = 0;
  const map = new Map(questions.map((q) => [String(q.id_question), q]));
  for (const r of (reponses || [])) {
    const q = map.get(String(r.id_question));
    if (!q) continue;
    if (q.question_type === 'test_logique') {
      if (String(r.reponse).trim().toLowerCase() === String(q.bonne_reponse || '').trim().toLowerCase()) {
        score += Number(q.poids || 1);
      }
    } else if (q.question_type === 'note') {
      const v = Number(r.reponse);
      if (!Number.isNaN(v)) score += v * Number(q.poids || 1);
    }
  }
  for (const r of (testLogique || [])) {
    const q = map.get(String(r.id_question));
    if (!q) continue;
    if (String(r.reponse).trim().toLowerCase() === String(q.bonne_reponse || '').trim().toLowerCase()) {
      score += Number(q.poids || 1);
    }
  }
  return Math.round(score * 100) / 100;
}

export async function createCandidature({
  identite = {}, parcours = {}, poste_cible,
  reponses = [], test_logique = [], attentes_salariales,
  signature_svg, photo_cv_url, duree_minutes,
  ip_source, user_agent,
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Trouver ou créer un poste_ouvert correspondant au `poste_cible`
    let idPosteOuvert = null;
    if (poste_cible) {
      const { rows } = await client.query(
        `SELECT id_poste_ouvert FROM postes_ouverts
          WHERE code = $1 OR intitule ILIKE $2
          ORDER BY id_poste_ouvert DESC LIMIT 1`,
        [poste_cible, `%${poste_cible}%`]
      );
      if (rows[0]) idPosteOuvert = rows[0].id_poste_ouvert;
    }
    if (!idPosteOuvert) {
      const { rows } = await client.query(
        `INSERT INTO postes_ouverts (code, intitule, description, statut, canaux, date_publication)
         VALUES ($1, $2, $3, 'publie', $4::jsonb, CURRENT_DATE)
         RETURNING id_poste_ouvert`,
        [
          poste_cible || 'TABLETTE',
          poste_cible || 'Candidature tablette',
          'Créé automatiquement par la tablette recrutement (Phase H).',
          JSON.stringify(['tablette']),
        ]
      );
      idPosteOuvert = rows[0].id_poste_ouvert;
    }

    // Score
    const questions = await questionsActives(poste_cible);
    const score = computeScore(questions, reponses, test_logique);

    // Insérer la candidature legacy (`candidatures`)
    const nom = identite.nom || 'Candidat';
    const prenom = identite.prenom || 'Tablette';
    const { rows: candRows } = await client.query(
      `INSERT INTO candidatures
         (id_poste_ouvert, nom, prenom, email, telephone, cv_url, source, statut, score_matching, notes)
       VALUES ($1,$2,$3,$4,$5,$6,'tablette','reçue',$7,$8)
       RETURNING id_candidature`,
      [
        idPosteOuvert, nom, prenom,
        identite.email || null, identite.telephone || null,
        photo_cv_url || null,
        score,
        `[DEMO] Candidature tablette · poste=${poste_cible || 'n/d'} · durée=${duree_minutes || '?'}min`,
      ]
    );
    const idCandidature = candRows[0].id_candidature;

    // Insérer le détail tablette
    const { rows: detailRows } = await client.query(
      `INSERT INTO candidatures_tablette_detail
         (id_candidature, poste_cible, identite_json, parcours_json,
          reponses_json, test_logique_json,
          attentes_salariales, photo_cv_url, signature_svg,
          score_total, duree_minutes, ip_source, user_agent)
       VALUES ($1,$2,$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        idCandidature, poste_cible || null,
        JSON.stringify(identite), JSON.stringify(parcours),
        JSON.stringify(reponses), JSON.stringify(test_logique),
        attentes_salariales || null, photo_cv_url || null, signature_svg || null,
        score, duree_minutes || null, ip_source || null, user_agent || null,
      ]
    );

    await client.query('COMMIT');
    return { id_candidature: idCandidature, detail: detailRows[0], score_total: score };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function listCandidatures({ limit = 100, offset = 0, filters = {} } = {}) {
  const where = ["c.source = 'tablette'"];
  const values = [];
  let i = 1;
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue;
    where.push(`c.${k} = $${i++}`); values.push(v);
  }
  const sql = `
    SELECT c.*, d.poste_cible AS poste_cible_tablette, d.score_total AS score_tablette,
           d.identite_json, d.parcours_json, d.date_passage, d.duree_minutes
      FROM candidatures c
 LEFT JOIN candidatures_tablette_detail d ON d.id_candidature = c.id_candidature
     WHERE ${where.join(' AND ')}
     ORDER BY c.created_at DESC
     LIMIT $${i++} OFFSET $${i}`;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function getCandidatureDetail(id) {
  const { rows } = await pool.query(
    `SELECT c.*, d.*
       FROM candidatures c
  LEFT JOIN candidatures_tablette_detail d ON d.id_candidature = c.id_candidature
      WHERE c.id_candidature = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

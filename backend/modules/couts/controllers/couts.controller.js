/**
 * Contrôleur Couts — coûts de production par OF
 *
 * Endpoints :
 *   GET    /api/couts                       — Liste (filtres)
 *   GET    /api/couts/stats/global          — Statistiques
 *   GET    /api/couts/of/:id_of             — Dernier calcul pour un OF
 *   GET    /api/couts/:id                   — Détail
 *   POST   /api/couts                       — Créer (auto-calcul cout_total)
 *   POST   /api/couts/:id_of/recalculer     — Recalcul depuis suivi + mouvements
 *   PUT    /api/couts/:id                   — Mise à jour (recalcul cout_total)
 *   DELETE /api/couts/:id
 */

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';

let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try { _io = (await import('../../../src/server.js')).io; } catch {}
  return _io;
};

const authorId = (req) => req.user?.id || req.user?.userId || null;
const num = (v) => (v === null || v === undefined || v === '' ? 0 : Number(v) || 0);

const C_SELECT = `
  SELECT
    c.*,
    c.id_couts AS id,
    of_.numero_of         AS of_numero,
    of_.cout_estime       AS of_cout_estime,
    a.designation         AS article_designation,
    a.code_article        AS code_article
  FROM couts c
  LEFT JOIN ordres_fabrication of_ ON c.id_of       = of_.id_of
  LEFT JOIN articles_catalogue a   ON of_.id_article = a.id_article
`;

// ─── GET /api/couts ──────────────────────────────────────────────
export const getCouts = async (req, res) => {
  try {
    const { id_of } = req.query;
    const params = [];
    const where = ['(c.active IS NULL OR c.active = true)'];
    if (id_of) { params.push(id_of); where.push(`c.id_of = $${params.length}`); }

    const sql = `${C_SELECT} WHERE ${where.join(' AND ')} ORDER BY c.date_calcul DESC`;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getCouts');
  }
};

// ─── GET /api/couts/stats/global ─────────────────────────────────
export const getCoutsStats = async (req, res) => {
  try {
    const period = await pool.query(`
      SELECT COALESCE(SUM(cout_total), 0)::numeric AS cout_total_periode,
             COALESCE(AVG(marge_reelle), 0)::numeric AS marge_moyenne
      FROM couts
      WHERE (active IS NULL OR active = true)
        AND date_calcul >= NOW() - INTERVAL '30 days'
    `);
    const top = await pool.query(`
      ${C_SELECT}
      WHERE (c.active IS NULL OR c.active = true)
      ORDER BY c.cout_total DESC NULLS LAST
      LIMIT 5
    `);
    return sendSuccess(res, {
      ...period.rows[0],
      top_5_of_couts_eleves: top.rows,
    });
  } catch (error) {
    return handleError(res, error, 'getCoutsStats');
  }
};

// ─── GET /api/couts/of/:id_of ────────────────────────────────────
export const getCoutsByOf = async (req, res) => {
  try {
    const r = await pool.query(
      `${C_SELECT}
       WHERE c.id_of = $1 AND (c.active IS NULL OR c.active = true)
       ORDER BY c.date_calcul DESC LIMIT 1`,
      [req.params.id_of]
    );
    if (!r.rows[0]) return sendError(res, 'Aucun calcul de coût pour cet OF', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getCoutsByOf');
  }
};

// ─── GET /api/couts/:id ──────────────────────────────────────────
export const getCoutsById = async (req, res) => {
  try {
    const r = await pool.query(`${C_SELECT} WHERE c.id_couts = $1 LIMIT 1`, [req.params.id]);
    if (!r.rows[0]) return sendError(res, 'Coût introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getCoutsById');
  }
};

// Helpers marge
const computeMargins = async (id_of, cout_total) => {
  try {
    const r = await pool.query(
      `SELECT cout_estime, quantite_a_produire FROM ordres_fabrication WHERE id_of = $1`,
      [id_of]
    );
    if (!r.rows[0] || r.rows[0].cout_estime == null) return { marge_prevue: null, marge_reelle: null };
    const est = num(r.rows[0].cout_estime);
    return {
      marge_prevue: est,               // référence
      marge_reelle: est - num(cout_total),
    };
  } catch {
    return { marge_prevue: null, marge_reelle: null };
  }
};

// ─── POST /api/couts ─────────────────────────────────────────────
export const createCouts = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const {
      id_of, cout_matieres = 0, cout_main_oeuvre = 0, cout_machine = 0, cout_indirect = 0,
      temps_main_oeuvre = 0, temps_machine = 0, name, description,
    } = req.body || {};

    if (!id_of) return sendError(res, 'id_of requis', 400);

    const cm = num(cout_matieres), cmo = num(cout_main_oeuvre);
    const cma = num(cout_machine), ci = num(cout_indirect);
    const cout_total = cm + cmo + cma + ci;
    const { marge_prevue, marge_reelle } = await computeMargins(id_of, cout_total);

    const r = await pool.query(
      `INSERT INTO couts
         (name, description, id_of, cout_matieres, cout_main_oeuvre, cout_machine, cout_indirect,
          cout_total, temps_main_oeuvre, temps_machine, marge_prevue, marge_reelle,
          date_calcul, active, created_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), true, NOW(), $13)
       RETURNING *`,
      [name || `Coût OF-${id_of}`, description || null, id_of, cm, cmo, cma, ci,
       cout_total, num(temps_main_oeuvre), num(temps_machine), marge_prevue, marge_reelle, userId]
    );

    try {
      const io = await getIo();
      if (io) io.emit('couts:updated', { id_of, cout_total });
    } catch {}

    return sendSuccess(res, r.rows[0], 'Coût créé', 201);
  } catch (error) {
    return handleError(res, error, 'createCouts');
  }
};

// ─── PUT /api/couts/:id ──────────────────────────────────────────
export const updateCouts = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const cur = await pool.query(`SELECT * FROM couts WHERE id_couts = $1`, [req.params.id]);
    if (!cur.rows[0]) return sendError(res, 'Coût introuvable', 404);

    const b = { ...cur.rows[0], ...req.body };
    const cm = num(b.cout_matieres), cmo = num(b.cout_main_oeuvre);
    const cma = num(b.cout_machine), ci = num(b.cout_indirect);
    const cout_total = cm + cmo + cma + ci;
    const { marge_prevue, marge_reelle } = await computeMargins(b.id_of, cout_total);

    const r = await pool.query(
      `UPDATE couts SET
         cout_matieres = $1, cout_main_oeuvre = $2, cout_machine = $3, cout_indirect = $4,
         cout_total = $5, temps_main_oeuvre = $6, temps_machine = $7,
         marge_prevue = $8, marge_reelle = $9,
         name = COALESCE($10, name), description = COALESCE($11, description),
         updated_at = NOW(), updated_by = $12
       WHERE id_couts = $13 RETURNING *`,
      [cm, cmo, cma, ci, cout_total, num(b.temps_main_oeuvre), num(b.temps_machine),
       marge_prevue, marge_reelle, req.body?.name ?? null, req.body?.description ?? null,
       userId, req.params.id]
    );

    try {
      const io = await getIo();
      if (io) io.emit('couts:updated', { id_of: r.rows[0].id_of, cout_total });
    } catch {}

    return sendSuccess(res, r.rows[0], 'Coût mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateCouts');
  }
};

// ─── DELETE /api/couts/:id ───────────────────────────────────────
export const deleteCouts = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const r = await pool.query(
      `UPDATE couts SET active = false, updated_at = NOW(), updated_by = $2
       WHERE id_couts = $1 RETURNING id_couts`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Coût introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id_couts }, 'Coût supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteCouts');
  }
};

// ─── POST /api/couts/:id_of/recalculer ───────────────────────────
export const recalculerCouts = async (req, res) => {
  try {
    const userId = authorId(req) || 1;
    const id_of = parseInt(req.params.id_of, 10);
    if (!id_of) return sendError(res, 'id_of invalide', 400);

    // Matières : somme depuis mouvements_mp (best effort)
    let cout_matieres = 0;
    try {
      const mp = await pool.query(
        `SELECT COALESCE(SUM(COALESCE(cout_total, quantite * COALESCE(prix_unitaire, 0))), 0)::numeric AS c
         FROM mouvements_mp WHERE id_of = $1 AND type_mouvement = 'sortie'`,
        [id_of]
      );
      cout_matieres = num(mp.rows[0]?.c);
    } catch { cout_matieres = 0; }

    // Temps + main d'œuvre + machine : depuis suivi_fabrication (best effort)
    let temps_main_oeuvre = 0, temps_machine = 0, cout_main_oeuvre = 0, cout_machine = 0;
    try {
      const sf = await pool.query(
        `SELECT
           COALESCE(SUM(EXTRACT(EPOCH FROM (COALESCE(date_fin, NOW()) - date_debut))/3600), 0)::numeric AS heures
         FROM suivi_fabrication WHERE id_of = $1 AND date_debut IS NOT NULL`,
        [id_of]
      );
      const h = num(sf.rows[0]?.heures);
      temps_main_oeuvre = h;
      temps_machine = h;
      cout_main_oeuvre = h * 15;  // taux horaire par défaut
      cout_machine     = h * 10;
    } catch { /* fallback zéros */ }

    const cout_indirect = (cout_matieres + cout_main_oeuvre + cout_machine) * 0.10;
    const cout_total    = cout_matieres + cout_main_oeuvre + cout_machine + cout_indirect;
    const { marge_prevue, marge_reelle } = await computeMargins(id_of, cout_total);

    // Upsert : dernière ligne active pour cet OF
    const existing = await pool.query(
      `SELECT id_couts FROM couts WHERE id_of = $1 AND (active IS NULL OR active = true)
       ORDER BY date_calcul DESC LIMIT 1`,
      [id_of]
    );

    let row;
    if (existing.rows[0]) {
      const r = await pool.query(
        `UPDATE couts SET
           cout_matieres=$1, cout_main_oeuvre=$2, cout_machine=$3, cout_indirect=$4,
           cout_total=$5, temps_main_oeuvre=$6, temps_machine=$7,
           marge_prevue=$8, marge_reelle=$9, date_calcul=NOW(),
           updated_at=NOW(), updated_by=$10
         WHERE id_couts=$11 RETURNING *`,
        [cout_matieres, cout_main_oeuvre, cout_machine, cout_indirect, cout_total,
         temps_main_oeuvre, temps_machine, marge_prevue, marge_reelle, userId, existing.rows[0].id_couts]
      );
      row = r.rows[0];
    } else {
      const r = await pool.query(
        `INSERT INTO couts
           (name, id_of, cout_matieres, cout_main_oeuvre, cout_machine, cout_indirect,
            cout_total, temps_main_oeuvre, temps_machine, marge_prevue, marge_reelle,
            date_calcul, active, created_at, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), true, NOW(), $12)
         RETURNING *`,
        [`Coût OF-${id_of}`, id_of, cout_matieres, cout_main_oeuvre, cout_machine, cout_indirect,
         cout_total, temps_main_oeuvre, temps_machine, marge_prevue, marge_reelle, userId]
      );
      row = r.rows[0];
    }

    try {
      const io = await getIo();
      if (io) io.emit('couts:recalcule', { id_of, cout_total });
    } catch {}

    return sendSuccess(res, row, 'Coût recalculé');
  } catch (error) {
    return handleError(res, error, 'recalculerCouts');
  }
};

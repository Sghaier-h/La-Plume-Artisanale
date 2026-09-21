/**
 * Contrôleur Matières Premières — gestion du catalogue MP
 *
 * Endpoints:
 *   GET    /api/matieres-premieres                  — Liste (filtrable, ?stock_bas)
 *   GET    /api/matieres-premieres/stats/global     — Statistiques globales
 *   GET    /api/matieres-premieres/alertes/stock    — MP en alerte de stock
 *   GET    /api/matieres-premieres/code/:code       — Lookup par code_mp (QR)
 *   GET    /api/matieres-premieres/:id              — Détail
 *   POST   /api/matieres-premieres                  — Créer
 *   PUT    /api/matieres-premieres/:id              — Modifier
 *   PUT    /api/matieres-premieres/:id/restaurer    — Réactiver
 *   DELETE /api/matieres-premieres/:id              — Soft delete
 */

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, handleError, sendError } from '../../../src/utils/error.helper.js';

const authorId = (req) => req.user?.id || req.user?.userId || null;

// Colonnes MP éditables via POST/PUT
const EDITABLE_COLS = [
  'code_mp', 'designation', 'id_type_mp', 'id_fournisseur', 'composition',
  'titre_numerateur', 'titre_denominateur', 'unite_titre', 'couleur',
  'reference_fournisseur', 'poids_cone_standard', 'prix_unitaire', 'unite_achat',
  'stock_minimum', 'stock_alerte', 'delai_approvisionnement', 'qr_code_mp',
];

// Sous-requête défensive de stock (mouvements_mp: type ∈ {entree,sortie}, quantite)
// Si la structure diffère, la fonction essaie plusieurs formes.
// La table stock_matieres_premieres n'existe pas dans le schéma actuel — stock_actuel = 0.
// À implémenter quand la traçabilité stock MP sera complète (Phase 2).
const STOCK_SUBQUERY = `0::numeric AS stock_actuel`;

// Cache : la table mouvements_mp est-elle interrogeable ?
let _mouvementsAvailable = null;
const checkMouvementsTable = async () => {
  if (_mouvementsAvailable !== null) return _mouvementsAvailable;
  try {
    await pool.query('SELECT 1 FROM mouvements_mp LIMIT 1');
    _mouvementsAvailable = true;
  } catch {
    _mouvementsAvailable = false;
  }
  return _mouvementsAvailable;
};

// ─── GET /api/matieres-premieres ──────────────────────────────────
export const getMatieresPremieres = async (req, res) => {
  try {
    const { id_type_mp, id_fournisseur, search, actif, stock_bas } = req.query;
    const params = [];
    const where = [];

    if (id_type_mp) { params.push(id_type_mp); where.push(`mp.id_type_mp = $${params.length}`); }
    if (id_fournisseur) { params.push(id_fournisseur); where.push(`mp.id_fournisseur = $${params.length}`); }
    if (actif === 'true' || actif === true) where.push('mp.actif = true');
    else if (actif === 'false' || actif === false) where.push('mp.actif = false');
    if (search) {
      params.push(`%${search}%`);
      where.push(`(mp.designation ILIKE $${params.length} OR mp.code_mp ILIKE $${params.length} OR mp.composition ILIKE $${params.length})`);
    }

    const filterStockBas = stock_bas === 'true' || stock_bas === true;
    const hasMouvements = await checkMouvementsTable();

    const stockSelect = hasMouvements ? STOCK_SUBQUERY : '0::numeric AS stock_actuel';

    let sql = `
      SELECT mp.*, ${stockSelect},
             f.nom AS fournisseur_nom, f.code_fournisseur,
             t.libelle AS type_mp_libelle
      FROM matieres_premieres mp
      LEFT JOIN fournisseurs f ON mp.id_fournisseur = f.id_fournisseur
      LEFT JOIN types_matieres_premieres t ON mp.id_type_mp = t.id_type_mp
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY mp.designation ASC
    `;

    let r;
    try {
      r = await pool.query(sql, params);
    } catch {
      // Fallback si l'un des LEFT JOIN échoue (table absente)
      sql = `
        SELECT mp.*, ${stockSelect}
        FROM matieres_premieres mp
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY mp.designation ASC
      `;
      r = await pool.query(sql, params);
    }

    let rows = r.rows;
    if (filterStockBas) {
      rows = rows.filter((row) => {
        const stock = Number(row.stock_actuel) || 0;
        const alerte = Number(row.stock_alerte) || 0;
        return stock < alerte;
      });
    }

    return sendSuccess(res, { matieres_premieres: rows, total: rows.length });
  } catch (error) {
    return handleError(res, error, 'getMatieresPremieres');
  }
};

// ─── GET /api/matieres-premieres/stats/global ─────────────────────
export const getMatieresPremieresStats = async (req, res) => {
  try {
    const hasMouvements = await checkMouvementsTable();
    const stockSelect = hasMouvements ? STOCK_SUBQUERY : '0::numeric AS stock_actuel';

    const sql = `
      SELECT mp.stock_alerte, mp.actif, mp.prix_unitaire, ${stockSelect}
      FROM matieres_premieres mp
    `;
    const r = await pool.query(sql);

    let total = 0, actifs = 0, stock_bas = 0, en_rupture = 0, valeur = 0;
    for (const row of r.rows) {
      total++;
      const actif = row.actif === true;
      if (actif) actifs++;
      const stock = Number(row.stock_actuel) || 0;
      const alerte = Number(row.stock_alerte) || 0;
      const prix = Number(row.prix_unitaire) || 0;
      if (actif && stock <= 0) en_rupture++;
      else if (actif && stock < alerte) stock_bas++;
      valeur += stock * prix;
    }

    return sendSuccess(res, {
      total,
      actifs,
      stock_bas,
      en_rupture,
      valeur_stock_totale: Math.round(valeur * 100) / 100,
    });
  } catch (error) {
    return handleError(res, error, 'getMatieresPremieresStats');
  }
};

// ─── GET /api/matieres-premieres/alertes/stock ────────────────────
export const getAlertesStock = async (req, res) => {
  try {
    const hasMouvements = await checkMouvementsTable();
    const stockSelect = hasMouvements ? STOCK_SUBQUERY : '0::numeric AS stock_actuel';

    let sql = `
      SELECT mp.*, ${stockSelect},
             f.nom AS fournisseur_nom
      FROM matieres_premieres mp
      LEFT JOIN fournisseurs f ON mp.id_fournisseur = f.id_fournisseur
      WHERE mp.actif = true
    `;
    let r;
    try {
      r = await pool.query(sql);
    } catch {
      r = await pool.query(`SELECT mp.*, ${stockSelect} FROM matieres_premieres mp WHERE mp.actif = true`);
    }
    const rows = r.rows.filter((row) => {
      const stock = Number(row.stock_actuel) || 0;
      const alerte = Number(row.stock_alerte) || 0;
      return stock < alerte;
    });
    return sendSuccess(res, { alertes: rows, total: rows.length });
  } catch (error) {
    return handleError(res, error, 'getAlertesStock');
  }
};

// ─── GET /api/matieres-premieres/code/:code ───────────────────────
export const getMatiereByCode = async (req, res) => {
  try {
    const code = req.params.code;
    const hasMouvements = await checkMouvementsTable();
    const stockSelect = hasMouvements ? STOCK_SUBQUERY : '0::numeric AS stock_actuel';

    let sql = `
      SELECT mp.*, ${stockSelect},
             f.nom AS fournisseur_nom,
             t.libelle AS type_mp_libelle
      FROM matieres_premieres mp
      LEFT JOIN fournisseurs f ON mp.id_fournisseur = f.id_fournisseur
      LEFT JOIN types_matieres_premieres t ON mp.id_type_mp = t.id_type_mp
      WHERE mp.code_mp = $1 OR mp.qr_code_mp = $1
      LIMIT 1
    `;
    let r;
    try {
      r = await pool.query(sql, [code]);
    } catch {
      r = await pool.query(
        `SELECT mp.*, ${stockSelect} FROM matieres_premieres mp WHERE mp.code_mp = $1 OR mp.qr_code_mp = $1 LIMIT 1`,
        [code]
      );
    }
    if (!r.rows[0]) return sendError(res, 'Matière première introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getMatiereByCode');
  }
};

// ─── GET /api/matieres-premieres/:id ──────────────────────────────
export const getMatierePremiereById = async (req, res) => {
  try {
    const hasMouvements = await checkMouvementsTable();
    const stockSelect = hasMouvements ? STOCK_SUBQUERY : '0::numeric AS stock_actuel';

    let sql = `
      SELECT mp.*, ${stockSelect},
             f.nom AS fournisseur_nom, f.code_fournisseur, f.email AS fournisseur_email,
             t.libelle AS type_mp_libelle
      FROM matieres_premieres mp
      LEFT JOIN fournisseurs f ON mp.id_fournisseur = f.id_fournisseur
      LEFT JOIN types_matieres_premieres t ON mp.id_type_mp = t.id_type_mp
      WHERE mp.id_mp = $1
      LIMIT 1
    `;
    let r;
    try {
      r = await pool.query(sql, [req.params.id]);
    } catch {
      r = await pool.query(
        `SELECT mp.*, ${stockSelect} FROM matieres_premieres mp WHERE mp.id_mp = $1 LIMIT 1`,
        [req.params.id]
      );
    }
    if (!r.rows[0]) return sendError(res, 'Matière première introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getMatierePremiereById');
  }
};

// Génère un code MP-XXXXX unique
const generateCodeMp = async () => {
  const r = await pool.query(
    `SELECT code_mp FROM matieres_premieres
     WHERE code_mp ~ '^MP-[0-9]+$'
     ORDER BY CAST(SUBSTRING(code_mp FROM 4) AS INTEGER) DESC
     LIMIT 1`
  );
  let next = 1;
  if (r.rows[0]) next = parseInt(r.rows[0].code_mp.substring(3), 10) + 1;
  return `MP-${String(next).padStart(5, '0')}`;
};

// ─── POST /api/matieres-premieres ─────────────────────────────────
export const createMatierePremiere = async (req, res) => {
  try {
    const userId = authorId(req);
    const body = req.body || {};

    if (!body.designation) return sendError(res, 'Désignation requise', 400);

    if (!body.code_mp) body.code_mp = await generateCodeMp();

    const cols = ['code_mp', 'designation'];
    const vals = [body.code_mp, body.designation];
    const placeholders = ['$1', '$2'];

    for (const col of EDITABLE_COLS) {
      if (col === 'code_mp' || col === 'designation') continue;
      if (body[col] !== undefined) {
        vals.push(body[col]);
        cols.push(col);
        placeholders.push(`$${vals.length}`);
      }
    }
    // actif, dates, created_by
    cols.push('actif', 'date_creation');
    placeholders.push('true', 'CURRENT_TIMESTAMP');
    if (userId) {
      vals.push(userId);
      cols.push('created_by');
      placeholders.push(`$${vals.length}`);
    }

    const sql = `
      INSERT INTO matieres_premieres (${cols.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    const r = await pool.query(sql, vals);
    return sendSuccess(res, r.rows[0], 'Matière première créée', 201);
  } catch (error) {
    return handleError(res, error, 'createMatierePremiere');
  }
};

// ─── PUT /api/matieres-premieres/:id ──────────────────────────────
export const updateMatierePremiere = async (req, res) => {
  try {
    const userId = authorId(req);
    const body = req.body || {};
    const sets = [];
    const vals = [];

    for (const col of EDITABLE_COLS) {
      if (body[col] !== undefined) {
        vals.push(body[col]);
        sets.push(`${col} = $${vals.length}`);
      }
    }
    if (body.actif !== undefined) {
      vals.push(!!body.actif);
      sets.push(`actif = $${vals.length}`);
    }
    if (!sets.length) return sendError(res, 'Aucun champ à modifier', 400);

    if (userId) {
      vals.push(userId);
      sets.push(`updated_by = $${vals.length}`);
    }
    vals.push(req.params.id);

    const sql = `
      UPDATE matieres_premieres SET ${sets.join(', ')}
      WHERE id_mp = $${vals.length}
      RETURNING *
    `;
    const r = await pool.query(sql, vals);
    if (!r.rows[0]) return sendError(res, 'Matière première introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Matière première mise à jour');
  } catch (error) {
    return handleError(res, error, 'updateMatierePremiere');
  }
};

// ─── DELETE /api/matieres-premieres/:id (soft) ────────────────────
export const deleteMatierePremiere = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `UPDATE matieres_premieres SET actif = false, updated_by = COALESCE($2, updated_by)
       WHERE id_mp = $1
       RETURNING id_mp, code_mp, actif`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Matière première introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Matière première désactivée');
  } catch (error) {
    return handleError(res, error, 'deleteMatierePremiere');
  }
};

// ─── PUT /api/matieres-premieres/:id/restaurer ────────────────────
export const restaurerMatierePremiere = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `UPDATE matieres_premieres SET actif = true, updated_by = COALESCE($2, updated_by)
       WHERE id_mp = $1
       RETURNING id_mp, code_mp, actif`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Matière première introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Matière première restaurée');
  } catch (error) {
    return handleError(res, error, 'restaurerMatierePremiere');
  }
};

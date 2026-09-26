/**
 * Contrôleur Machines — parc machines de production
 *
 * Endpoints:
 *   GET    /api/machines                              — Liste (filtrable)
 *   GET    /api/machines/stats/global                 — Stats
 *   GET    /api/machines/numero/:numero               — Lookup
 *   GET    /api/machines/:id                          — Détail
 *   POST   /api/machines                              — Créer
 *   PUT    /api/machines/:id                          — Modifier
 *   PUT    /api/machines/:id/statut                   — Changer statut
 *   PUT    /api/machines/:id/maintenance              — début / fin maintenance
 *   DELETE /api/machines/:id                          — Soft delete
 *   GET    /api/machines/:id/historique-arrets        — 30 derniers jours
 */

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, handleError, sendError } from '../../../src/utils/error.helper.js';

// Lazy import io
let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try {
    const m = await import('../../../src/server.js');
    _io = m.io;
  } catch {}
  return _io;
};

const authorId = (req) => req.user?.id || req.user?.userId || null;

const STATUTS_VALIDES = ['operationnelle', 'en_maintenance', 'en_panne', 'arret', 'reservee'];

const EDITABLE_COLS = [
  'numero_machine', 'id_type_machine', 'marque', 'modele', 'numero_serie',
  'annee_fabrication', 'date_mise_service', 'statut', 'vitesse_nominale',
  'largeur_utile', 'capacite_production', 'id_selecteur_actuel', 'emplacement',
  'observations', 'date_derniere_maintenance', 'date_prochaine_maintenance',
];

let _arretsAvailable = null;
const checkArretsTable = async () => {
  if (_arretsAvailable !== null) return _arretsAvailable;
  try {
    await pool.query('SELECT 1 FROM arrets_production LIMIT 1');
    _arretsAvailable = true;
  } catch {
    _arretsAvailable = false;
  }
  return _arretsAvailable;
};

// ─── GET /api/machines ────────────────────────────────────────────
export const getMachines = async (req, res) => {
  try {
    const { statut, id_type_machine, actif, search } = req.query;
    const params = [];
    const where = [];

    if (statut) { params.push(statut); where.push(`m.statut = $${params.length}`); }
    if (id_type_machine) { params.push(id_type_machine); where.push(`m.id_type_machine = $${params.length}`); }
    if (actif === 'true' || actif === true) where.push('m.actif = true');
    else if (actif === 'false' || actif === false) where.push('m.actif = false');
    if (search) {
      params.push(`%${search}%`);
      where.push(`(m.numero_machine ILIKE $${params.length} OR m.marque ILIKE $${params.length} OR m.modele ILIKE $${params.length} OR m.numero_serie ILIKE $${params.length})`);
    }

    let sql = `
      SELECT m.*, t.libelle AS type_machine_libelle
      FROM machines m
      LEFT JOIN types_machines t ON m.id_type_machine = t.id_type_machine
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY m.numero_machine ASC
    `;
    let r;
    try {
      r = await pool.query(sql, params);
    } catch {
      sql = `
        SELECT m.* FROM machines m
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY m.numero_machine ASC
      `;
      r = await pool.query(sql, params);
    }
    return sendSuccess(res, { machines: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getMachines');
  }
};

// ─── GET /api/machines/stats/global ───────────────────────────────
export const getMachinesStats = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT statut, COUNT(*)::int AS n FROM machines WHERE actif = true GROUP BY statut`
    );
    const counts = {};
    let total_actives = 0;
    for (const row of r.rows) {
      counts[row.statut || 'inconnu'] = row.n;
      total_actives += row.n;
    }
    const operationnelles = counts.operationnelle || 0;
    const taux = total_actives ? Math.round((operationnelles / total_actives) * 10000) / 100 : 0;

    return sendSuccess(res, {
      total_actives,
      operationnelle: counts.operationnelle || 0,
      en_maintenance: counts.en_maintenance || 0,
      en_panne: counts.en_panne || 0,
      arret: counts.arret || 0,
      reservee: counts.reservee || 0,
      taux_disponibilite: taux,
    });
  } catch (error) {
    return handleError(res, error, 'getMachinesStats');
  }
};

// ─── GET /api/machines/numero/:numero ─────────────────────────────
export const getMachineByNumero = async (req, res) => {
  try {
    let r;
    try {
      r = await pool.query(
        `SELECT m.*, t.libelle AS type_machine_libelle
         FROM machines m
         LEFT JOIN types_machines t ON m.id_type_machine = t.id_type_machine
         WHERE m.numero_machine = $1 LIMIT 1`,
        [req.params.numero]
      );
    } catch {
      r = await pool.query(`SELECT * FROM machines WHERE numero_machine = $1 LIMIT 1`, [req.params.numero]);
    }
    if (!r.rows[0]) return sendError(res, 'Machine introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getMachineByNumero');
  }
};

// ─── GET /api/machines/:id ────────────────────────────────────────
export const getMachineById = async (req, res) => {
  try {
    let r;
    try {
      r = await pool.query(
        `SELECT m.*,
                t.libelle AS type_machine_libelle,
                s.code_selecteur AS selecteur_actuel_code,
                s.description AS selecteur_actuel_description
         FROM machines m
         LEFT JOIN types_machines t ON m.id_type_machine = t.id_type_machine
         LEFT JOIN selecteurs s ON m.id_selecteur_actuel = s.id_selecteur
         WHERE m.id_machine = $1 LIMIT 1`,
        [req.params.id]
      );
    } catch {
      r = await pool.query(`SELECT * FROM machines WHERE id_machine = $1 LIMIT 1`, [req.params.id]);
    }
    if (!r.rows[0]) return sendError(res, 'Machine introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getMachineById');
  }
};

// ─── POST /api/machines ───────────────────────────────────────────
export const createMachine = async (req, res) => {
  try {
    const userId = authorId(req);
    const body = req.body || {};
    if (!body.numero_machine) return sendError(res, 'numero_machine requis', 400);

    const cols = [];
    const vals = [];
    const placeholders = [];

    for (const col of EDITABLE_COLS) {
      if (body[col] !== undefined) {
        vals.push(body[col]);
        cols.push(col);
        placeholders.push(`$${vals.length}`);
      }
    }
    cols.push('actif', 'date_creation');
    placeholders.push('true', 'CURRENT_TIMESTAMP');
    if (userId) {
      vals.push(userId);
      cols.push('created_by');
      placeholders.push(`$${vals.length}`);
    }

    const sql = `INSERT INTO machines (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
    const r = await pool.query(sql, vals);
    return sendSuccess(res, r.rows[0], 'Machine créée', 201);
  } catch (error) {
    return handleError(res, error, 'createMachine');
  }
};

// ─── PUT /api/machines/:id ────────────────────────────────────────
export const updateMachine = async (req, res) => {
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

    const sql = `UPDATE machines SET ${sets.join(', ')} WHERE id_machine = $${vals.length} RETURNING *`;
    const r = await pool.query(sql, vals);
    if (!r.rows[0]) return sendError(res, 'Machine introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Machine mise à jour');
  } catch (error) {
    return handleError(res, error, 'updateMachine');
  }
};

// ─── PUT /api/machines/:id/statut ─────────────────────────────────
export const updateMachineStatut = async (req, res) => {
  try {
    const userId = authorId(req);
    const { statut } = req.body || {};
    if (!statut || !STATUTS_VALIDES.includes(statut)) {
      return sendError(res, `Statut invalide (attendu: ${STATUTS_VALIDES.join(', ')})`, 400);
    }

    const prev = await pool.query(`SELECT statut FROM machines WHERE id_machine = $1`, [req.params.id]);
    if (!prev.rows[0]) return sendError(res, 'Machine introuvable', 404);
    const previous_statut = prev.rows[0].statut;

    const r = await pool.query(
      `UPDATE machines SET statut = $2, updated_by = COALESCE($3, updated_by)
       WHERE id_machine = $1
       RETURNING id_machine, numero_machine, statut`,
      [req.params.id, statut, userId]
    );

    try {
      const io = await getIo();
      if (io) io.emit('machine:status', { id_machine: r.rows[0].id_machine, statut, previous_statut });
    } catch {}

    return sendSuccess(res, { ...r.rows[0], previous_statut }, 'Statut mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateMachineStatut');
  }
};

// ─── PUT /api/machines/:id/maintenance ────────────────────────────
export const updateMachineMaintenance = async (req, res) => {
  try {
    const userId = authorId(req);
    const { type, interval_jours } = req.body || {};
    if (!['debut', 'fin'].includes(type)) return sendError(res, "type doit être 'debut' ou 'fin'", 400);

    const prev = await pool.query(`SELECT statut FROM machines WHERE id_machine = $1`, [req.params.id]);
    if (!prev.rows[0]) return sendError(res, 'Machine introuvable', 404);
    const previous_statut = prev.rows[0].statut;

    let sql, params;
    if (type === 'debut') {
      sql = `UPDATE machines
             SET statut = 'en_maintenance',
                 date_derniere_maintenance = CURRENT_DATE,
                 updated_by = COALESCE($2, updated_by)
             WHERE id_machine = $1
             RETURNING id_machine, numero_machine, statut, date_derniere_maintenance`;
      params = [req.params.id, userId];
    } else {
      const jours = parseInt(interval_jours, 10) || 90;
      sql = `UPDATE machines
             SET statut = 'operationnelle',
                 date_prochaine_maintenance = COALESCE(date_derniere_maintenance, CURRENT_DATE) + ($3 || ' days')::interval,
                 updated_by = COALESCE($2, updated_by)
             WHERE id_machine = $1
             RETURNING id_machine, numero_machine, statut, date_derniere_maintenance, date_prochaine_maintenance`;
      params = [req.params.id, userId, jours];
    }
    const r = await pool.query(sql, params);
    if (!r.rows[0]) return sendError(res, 'Machine introuvable', 404);

    try {
      const io = await getIo();
      if (io) io.emit('machine:status', {
        id_machine: r.rows[0].id_machine,
        statut: r.rows[0].statut,
        previous_statut,
      });
    } catch {}

    return sendSuccess(res, r.rows[0], type === 'debut' ? 'Maintenance démarrée' : 'Maintenance terminée');
  } catch (error) {
    return handleError(res, error, 'updateMachineMaintenance');
  }
};

// ─── DELETE /api/machines/:id (soft) ──────────────────────────────
export const deleteMachine = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `UPDATE machines SET actif = false, updated_by = COALESCE($2, updated_by)
       WHERE id_machine = $1
       RETURNING id_machine, numero_machine, actif`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Machine introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Machine désactivée');
  } catch (error) {
    return handleError(res, error, 'deleteMachine');
  }
};

// ─── GET /api/machines/:id/historique-arrets ──────────────────────
export const getHistoriqueArrets = async (req, res) => {
  try {
    const hasArrets = await checkArretsTable();
    if (!hasArrets) {
      return sendSuccess(res, {
        arrets: [],
        total: 0,
        note: 'Table arrets_production non disponible',
      });
    }
    let r;
    try {
      r = await pool.query(
        `SELECT id_arret, id_machine, date_debut, date_fin, motif
         FROM arrets_production
         WHERE id_machine = $1
           AND date_debut >= CURRENT_DATE - INTERVAL '30 days'
         ORDER BY date_debut DESC`,
        [req.params.id]
      );
    } catch {
      return sendSuccess(res, {
        arrets: [],
        total: 0,
        note: 'Colonnes attendues absentes dans arrets_production',
      });
    }
    return sendSuccess(res, { arrets: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getHistoriqueArrets');
  }
};

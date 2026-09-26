/**
 * Contrôleur TimeMoto — synchronisation avec les pointeuses Safescan TimeMoto.
 *
 * Modes supportés :
 *   • Import bulk JSON       (POST /api/pointage/timemoto/import)
 *   • Import CSV USB export  (POST /api/pointage/timemoto/csv)
 *   • Sync cloud TimeMoto    (POST /api/pointage/timemoto/sync)
 *   • Configuration          (GET/PUT /api/pointage/timemoto/config)
 *   • Mapping badges -> user (GET /api/pointage/timemoto/mapping, PUT .../:id)
 *
 * Persistance :
 *   • Table pointage (colonnes ajoutées par migration 20260921_timemoto.sql :
 *     source, device_id, imported_at)
 *   • Table parametrage (préfixe timemoto.*)
 *
 * Le badge TimeMoto est stocké dans utilisateurs.numero_employe. La colonne
 * timemoto_id de pointage conserve la valeur exacte reçue de la pointeuse.
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import fs from 'fs';

// ─── Socket.IO lazy loader ────────────────────────────────────────
let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try {
    const m = await import('../../../src/server.js');
    _io = m.io;
  } catch {}
  return _io;
};
const emit = async (event, payload) => {
  try {
    const io = await getIo();
    if (io) io.emit(event, payload);
  } catch {}
};

// ─── Configuration : lit toutes les clés timemoto.* + defaults ────
const DEFAULT_CONFIG = {
  start_time: '08:00',
  tolerance_minutes: 5,
  break_minimum_minutes: 30,
  timezone: 'Africa/Tunis',
};

const loadConfig = async () => {
  try {
    const r = await pool.query(
      `SELECT cle, valeur, type_valeur FROM parametrage
       WHERE cle LIKE 'timemoto.%'`
    );
    const cfg = { ...DEFAULT_CONFIG };
    for (const row of r.rows) {
      const key = row.cle.replace(/^timemoto\./, '');
      let v = row.valeur;
      if (row.type_valeur === 'number') v = Number(v);
      cfg[key] = v;
    }
    return cfg;
  } catch {
    return { ...DEFAULT_CONFIG };
  }
};

// ─── Utilitaires internes ─────────────────────────────────────────

// Calcule les minutes de retard vs. l'heure de début configurée.
// checkInTs : Date ; startHHmm : "HH:MM" ; tolerance : minutes
const computeRetardMinutes = (checkInTs, startHHmm, tolerance) => {
  if (!checkInTs) return 0;
  const [hh, mm] = String(startHHmm || '08:00').split(':').map(Number);
  const start = new Date(checkInTs);
  start.setHours(hh || 0, mm || 0, 0, 0);
  const diffMin = Math.round((checkInTs.getTime() - start.getTime()) / 60000);
  const tol = Number(tolerance) || 0;
  return diffMin > tol ? diffMin : 0;
};

const parseDateISO = (v) => {
  if (!v) return null;
  const d = new Date(v);
  if (!isNaN(d.getTime())) return d;
  // "YYYY-MM-DD HH:MM:SS" -> convert
  const s = String(v).replace(' ', 'T');
  const d2 = new Date(s);
  return isNaN(d2.getTime()) ? null : d2;
};

const toDateOnly = (dt) => {
  if (!dt) return null;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Résout timemoto_id (badge) -> user_id via utilisateurs.numero_employe
const resolveUserId = async (timemotoId) => {
  if (!timemotoId) return null;
  try {
    const r = await pool.query(
      `SELECT id_utilisateur FROM users WHERE numero_employe = $1 LIMIT 1`,
      [String(timemotoId)]
    );
    return r.rows[0]?.id_utilisateur || null;
  } catch {
    return null;
  }
};

// Insère ou met à jour la ligne pointage du jour pour (user_id, date).
// - punch_type "in"  -> pose check_in si absent
// - punch_type "out" -> pose check_out et recalcule heures_travaillees
// - punch_type null  -> on infère : pas de check_in ? in, sinon out.
const applyPunch = async ({
  timemoto_id, user_id, punch_time, punch_type, device_id, source, cfg, actorId,
}) => {
  const dt = punch_time instanceof Date ? punch_time : parseDateISO(punch_time);
  if (!dt) throw new Error('punch_time invalide');
  const dateStr = toDateOnly(dt);

  const existing = await pool.query(
    `SELECT id, check_in, check_out FROM pointage
     WHERE user_id = $1 AND date = $2
     ORDER BY id ASC LIMIT 1`,
    [user_id, dateStr]
  );
  const row = existing.rows[0];

  let type = (punch_type || '').toLowerCase();
  if (!['in', 'out'].includes(type)) {
    type = row && row.check_in && !row.check_out ? 'out' : 'in';
  }

  if (!row) {
    if (type === 'out') {
      // Check-out sans check-in : on pose quand même check_out (edge case)
      const r = await pool.query(
        `INSERT INTO pointage
           (timemoto_id, user_id, date, check_out, present,
            retard_minutes, source, device_id, imported_at, created_at, created_by)
         VALUES ($1,$2,$3,$4,true,0,$5,$6,NOW(),NOW(),$7)
         RETURNING *`,
        [timemoto_id || null, user_id, dateStr, dt, source, device_id || null, actorId]
      );
      return { row: r.rows[0], action: 'created_out_only' };
    }
    const retard = computeRetardMinutes(dt, cfg.start_time, cfg.tolerance_minutes);
    const r = await pool.query(
      `INSERT INTO pointage
         (timemoto_id, user_id, date, check_in, present,
          retard_minutes, source, device_id, imported_at, created_at, created_by)
       VALUES ($1,$2,$3,$4,true,$5,$6,$7,NOW(),NOW(),$8)
       RETURNING *`,
      [timemoto_id || null, user_id, dateStr, dt, retard, source, device_id || null, actorId]
    );
    return { row: r.rows[0], action: 'created_in' };
  }

  // Ligne existante
  if (type === 'in') {
    if (row.check_in) {
      // Déjà pointé : on garde le plus tôt
      const existDt = new Date(row.check_in);
      if (dt < existDt) {
        const retard = computeRetardMinutes(dt, cfg.start_time, cfg.tolerance_minutes);
        const u = await pool.query(
          `UPDATE pointage
             SET check_in = $1, retard_minutes = $2, source = $3,
                 device_id = COALESCE($4, device_id), imported_at = NOW(),
                 updated_at = NOW(), updated_by = $5
           WHERE id = $6 RETURNING *`,
          [dt, retard, source, device_id || null, actorId, row.id]
        );
        return { row: u.rows[0], action: 'updated_in' };
      }
      return { row, action: 'skipped_duplicate_in' };
    }
    const retard = computeRetardMinutes(dt, cfg.start_time, cfg.tolerance_minutes);
    const u = await pool.query(
      `UPDATE pointage
         SET check_in = $1, present = true, retard_minutes = $2,
             source = $3, device_id = COALESCE($4, device_id),
             timemoto_id = COALESCE(timemoto_id, $5),
             imported_at = NOW(), updated_at = NOW(), updated_by = $6
       WHERE id = $7 RETURNING *`,
      [dt, retard, source, device_id || null, timemoto_id || null, actorId, row.id]
    );
    return { row: u.rows[0], action: 'set_in' };
  }

  // type === 'out'
  if (row.check_out) {
    const existOut = new Date(row.check_out);
    if (dt > existOut) {
      const u = await pool.query(
        `UPDATE pointage
           SET check_out = $1,
               heures_travaillees = CASE
                 WHEN check_in IS NOT NULL
                   THEN ROUND(EXTRACT(EPOCH FROM ($1 - check_in))::numeric / 3600.0, 2)
                 ELSE heures_travaillees END,
               source = $2, device_id = COALESCE($3, device_id),
               imported_at = NOW(), updated_at = NOW(), updated_by = $4
         WHERE id = $5 RETURNING *`,
        [dt, source, device_id || null, actorId, row.id]
      );
      return { row: u.rows[0], action: 'updated_out' };
    }
    return { row, action: 'skipped_earlier_out' };
  }
  const u = await pool.query(
    `UPDATE pointage
       SET check_out = $1,
           heures_travaillees = CASE
             WHEN check_in IS NOT NULL
               THEN ROUND(EXTRACT(EPOCH FROM ($1 - check_in))::numeric / 3600.0, 2)
             ELSE heures_travaillees END,
           source = $2, device_id = COALESCE($3, device_id),
           imported_at = NOW(), updated_at = NOW(), updated_by = $4
     WHERE id = $5 RETURNING *`,
    [dt, source, device_id || null, actorId, row.id]
  );
  return { row: u.rows[0], action: 'set_out' };
};

// ─── CSV parser minimaliste (pas de dépendance externe) ──────────
// Attend un header comme : EmployeeID, Date, Time, Direction[, Location]
// Ou format compact TimeMoto : No, Date, Time, In/Out, Terminal
const parseCsv = (text) => {
  const clean = text.replace(/^﻿/, '').replace(/\r\n/g, '\n').trim();
  const lines = clean.split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  // Détecte séparateur
  const first = lines[0];
  const sep = first.includes(';') && !first.includes(',') ? ';'
    : first.includes('\t') ? '\t'
    : ',';
  const split = (line) => line.split(sep).map(s => s.trim().replace(/^"|"$/g, ''));
  const header = split(lines[0]).map(h => h.toLowerCase());

  // Résout indexes tolérants
  const idx = (aliases) => header.findIndex(h => aliases.some(a => h.includes(a)));
  const iEmp   = idx(['employeeid', 'employee id', 'employee', 'no.', 'no', 'badge', 'user id', 'userid', 'id']);
  const iDate  = idx(['date']);
  const iTime  = idx(['time']);
  const iDir   = idx(['direction', 'in/out', 'inout', 'type', 'punch']);
  const iLoc   = idx(['location', 'terminal', 'device']);
  const iDT    = idx(['datetime', 'timestamp']);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = split(lines[i]);
    const employeeId = iEmp >= 0 ? cols[iEmp] : null;
    let dtStr = null;
    if (iDT >= 0) dtStr = cols[iDT];
    else if (iDate >= 0 && iTime >= 0) dtStr = `${cols[iDate]} ${cols[iTime]}`;
    else if (iDate >= 0) dtStr = cols[iDate];
    const rawDir = iDir >= 0 ? (cols[iDir] || '').toLowerCase() : '';
    let punchType = null;
    if (['in', 'entrée', 'entree', 'entry', '0'].some(v => rawDir === v)) punchType = 'in';
    else if (['out', 'sortie', 'exit', '1'].some(v => rawDir === v)) punchType = 'out';
    else if (rawDir.startsWith('in')) punchType = 'in';
    else if (rawDir.startsWith('out')) punchType = 'out';
    const deviceId = iLoc >= 0 ? cols[iLoc] : null;
    rows.push({
      timemoto_id: employeeId,
      punch_time: dtStr,
      punch_type: punchType,
      device_id: deviceId,
    });
  }
  return rows;
};

// ─── POST /api/pointage/timemoto/import ───────────────────────────
export const importPunches = async (req, res) => {
  try {
    const actorId = getUserId(req) || null;
    const { punches } = req.body || {};
    if (!Array.isArray(punches) || punches.length === 0) {
      return sendError(res, 'punches (array non vide) requis', 400);
    }
    const cfg = await loadConfig();
    const source = 'timemoto';
    let imported = 0;
    const errors = [];
    const skipped = [];
    const processed = [];

    for (let i = 0; i < punches.length; i++) {
      const p = punches[i] || {};
      try {
        const userId = p.user_id || await resolveUserId(p.timemoto_id);
        if (!userId) {
          errors.push({ index: i, timemoto_id: p.timemoto_id, error: 'utilisateur introuvable' });
          continue;
        }
        const r = await applyPunch({
          timemoto_id: p.timemoto_id || null,
          user_id: userId,
          punch_time: p.punch_time,
          punch_type: p.punch_type,
          device_id: p.device_id || null,
          source,
          cfg,
          actorId,
        });
        if (r.action.startsWith('skipped')) {
          skipped.push({ index: i, reason: r.action });
        } else {
          imported++;
          processed.push(r.row);
        }
      } catch (err) {
        errors.push({ index: i, timemoto_id: p.timemoto_id, error: err.message });
      }
    }

    // Émission Socket.IO groupée
    if (processed.length > 0) {
      await emit('pointage:updated', { source: 'timemoto', count: processed.length });
    }

    return sendSuccess(
      res,
      { imported, errors, skipped, total: punches.length },
      `Import TimeMoto : ${imported}/${punches.length}`
    );
  } catch (error) {
    return handleError(res, error, 'timemoto.importPunches');
  }
};

// ─── POST /api/pointage/timemoto/csv ──────────────────────────────
// Multer met le fichier sur disque (req.file.path). On lit puis on
// délègue au chemin `importPunches` en passant par la même logique.
export const importCsv = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 'Fichier CSV requis (champ "file")', 400);
    const filePath = req.file.path;
    let text = '';
    try {
      text = fs.readFileSync(filePath, 'utf8');
    } finally {
      try { fs.unlinkSync(filePath); } catch {}
    }
    const punches = parseCsv(text);
    if (punches.length === 0) {
      return sendSuccess(res, { imported: 0, errors: [], skipped: [], total: 0 }, 'CSV vide');
    }
    // Réutilise la logique en réécrivant req.body
    req.body = { punches };
    return importPunches(req, res);
  } catch (error) {
    return handleError(res, error, 'timemoto.importCsv');
  }
};

// ─── GET /api/pointage/timemoto/config ────────────────────────────
export const getConfig = async (req, res) => {
  try {
    const cfg = await loadConfig();
    return sendSuccess(res, cfg, 'Configuration TimeMoto');
  } catch (error) {
    return handleError(res, error, 'timemoto.getConfig');
  }
};

// ─── PUT /api/pointage/timemoto/config ────────────────────────────
export const updateConfig = async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return sendError(res, 'Réservé aux administrateurs', 403);
    }
    const allowed = ['start_time', 'tolerance_minutes', 'break_minimum_minutes', 'timezone'];
    const types   = { start_time: 'string', tolerance_minutes: 'number', break_minimum_minutes: 'number', timezone: 'string' };
    const body = req.body || {};
    for (const k of allowed) {
      if (body[k] === undefined || body[k] === null) continue;
      const cle = `timemoto.${k}`;
      const valeur = String(body[k]);
      const existing = await pool.query(`SELECT 1 FROM parametrage WHERE cle = $1`, [cle]);
      if (existing.rows[0]) {
        await pool.query(
          `UPDATE parametrage SET valeur=$1, type_valeur=$2, categorie='timemoto',
                                   editable_ui=true, date_modification=NOW() WHERE cle=$3`,
          [valeur, types[k], cle]
        );
      } else {
        await pool.query(
          `INSERT INTO parametrage (cle, valeur, type_valeur, categorie, editable_ui, date_creation)
           VALUES ($1,$2,$3,'timemoto',true,NOW())`,
          [cle, valeur, types[k]]
        );
      }
    }
    const cfg = await loadConfig();
    return sendSuccess(res, cfg, 'Configuration TimeMoto mise à jour');
  } catch (error) {
    return handleError(res, error, 'timemoto.updateConfig');
  }
};

// ─── GET /api/pointage/timemoto/mapping ───────────────────────────
export const getMapping = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT u.id_utilisateur, u.prenom, u.nom, u.email, u.numero_employe,
              u.role, u.actif
       FROM users u
       WHERE COALESCE(u.actif, true) = true
       ORDER BY u.nom NULLS LAST, u.prenom NULLS LAST`
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length }, 'Mapping TimeMoto');
  } catch (error) {
    return handleError(res, error, 'timemoto.getMapping');
  }
};

// ─── PUT /api/pointage/timemoto/mapping/:id_utilisateur ───────────
export const updateMapping = async (req, res) => {
  try {
    const { id_utilisateur } = req.params;
    const { numero_employe } = req.body || {};
    if (numero_employe !== null && numero_employe !== undefined && String(numero_employe).length > 32) {
      return sendError(res, 'numero_employe trop long (32 max)', 400);
    }
    const r = await pool.query(
      `UPDATE users SET numero_employe = $1 WHERE id_utilisateur = $2
       RETURNING id_utilisateur, prenom, nom, email, numero_employe`,
      [numero_employe || null, id_utilisateur]
    );
    if (!r.rows[0]) return sendError(res, 'Utilisateur introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Mapping mis à jour');
  } catch (error) {
    return handleError(res, error, 'timemoto.updateMapping');
  }
};

// ─── POST /api/pointage/timemoto/sync ─────────────────────────────
// Placeholder pour la synchronisation TimeMoto Cloud.
export const syncCloud = async (req, res) => {
  try {
    const url = process.env.TIMEMOTO_CLOUD_URL;
    const token = process.env.TIMEMOTO_CLOUD_TOKEN;
    if (!url || !token) {
      return sendSuccess(
        res,
        { mocked: true, imported: 0 },
        'TimeMoto Cloud non configuré (TIMEMOTO_CLOUD_URL / TIMEMOTO_CLOUD_TOKEN vides)'
      );
    }
    // Depuis quand ? on prend le dernier imported_at TimeMoto
    let since = null;
    try {
      const r = await pool.query(
        `SELECT MAX(imported_at) AS last FROM pointage WHERE source = 'timemoto'`
      );
      since = r.rows[0]?.last || null;
    } catch {}

    // Appel HTTP
    let punches = [];
    try {
      const qs = since ? `?since=${encodeURIComponent(new Date(since).toISOString())}` : '';
      const resp = await fetch(`${url}${qs}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!resp.ok) {
        return sendError(res, `TimeMoto Cloud HTTP ${resp.status}`, 502);
      }
      const data = await resp.json();
      punches = Array.isArray(data) ? data : (data.punches || data.items || []);
    } catch (err) {
      return sendError(res, `TimeMoto Cloud injoignable: ${err.message}`, 502);
    }

    if (punches.length === 0) {
      return sendSuccess(res, { imported: 0, errors: [], skipped: [], total: 0 }, 'Aucun nouveau punch');
    }
    req.body = { punches };
    return importPunches(req, res);
  } catch (error) {
    return handleError(res, error, 'timemoto.syncCloud');
  }
};

// ─── GET /api/pointage/timemoto/history ───────────────────────────
// Historique des lignes importées (source='timemoto') triées par imported_at.
export const getHistory = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const r = await pool.query(
      `SELECT p.id, p.timemoto_id, p.user_id, p.date, p.check_in, p.check_out,
              p.heures_travaillees, p.retard_minutes, p.present, p.source,
              p.device_id, p.imported_at, u.prenom, u.nom, u.numero_employe
         FROM pointage p
         LEFT JOIN users u ON u.id_utilisateur = p.user_id
        WHERE p.source = 'timemoto'
        ORDER BY p.imported_at DESC NULLS LAST, p.id DESC
        LIMIT $1`,
      [limit]
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length }, 'Historique TimeMoto');
  } catch (error) {
    return handleError(res, error, 'timemoto.getHistory');
  }
};

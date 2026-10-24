// routes.js — pointage
//
// Montage canonique v2 : /api/v2/rh/pointages (voir modules-v2/index.js, slug
// `pointage: 'pointages'`).
// Alias legacy : server.js monte aussi ce routeur sur /api/pointage pour la
// compatibilité des pages consommatrices qui appellent `api.get('/pointage/...')`
// directement (Pointage.tsx, PointageTimeMoto.tsx, Equipe.tsx) avant leur
// migration vers un service dédié.
//
// §14quater.5 — Pointeuse tablette : POST /evenements pour entrée/sortie/pauses.
// Les handlers riches (CRUD détaillé + stats/global + user/today + user/month +
// check-in/out + TimeMoto import/CSV/config/mapping/sync/history) proviennent
// du legacy backend/modules/pointage/controllers/ et sont désormais hébergés ici
// après la suppression du module pointage legacy.
import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import * as ctrl from './controller.js';
import { getPool } from '../../_shared/db.js';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getPointage,
  getPointageById,
  createPointage,
  updatePointage,
  deletePointage,
  setCheckIn,
  setCheckOut,
  quickCheckIn,
  quickCheckOut,
  getStatsGlobal,
  getPointageUserToday,
  getPointageUserMonth,
} from './legacy-pointage-handlers.js';
import {
  importPunches as timemotoImport,
  importCsv as timemotoImportCsv,
  getConfig as timemotoGetConfig,
  updateConfig as timemotoUpdateConfig,
  getMapping as timemotoGetMapping,
  updateMapping as timemotoUpdateMapping,
  syncCloud as timemotoSyncCloud,
  getHistory as timemotoHistory,
} from './legacy-timemoto-handlers.js';

const router = Router();

// ─── Multer CSV upload (TimeMoto USB export) ──────────────────────
const TIMEMOTO_TMP = path.resolve(process.cwd(), 'uploads', 'timemoto');
try { fs.mkdirSync(TIMEMOTO_TMP, { recursive: true }); } catch {}
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TIMEMOTO_TMP),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.csv';
    cb(null, `timemoto_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const csvUpload = multer({
  storage: csvStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(csv|txt|tsv)$/i.test(file.originalname);
    if (!ok) {
      const err = new Error('Extension non supportée (csv/txt/tsv)');
      err.status = 400;
      return cb(err);
    }
    cb(null, true);
  },
});
const handleMulter = (mw) => (req, res, next) => mw(req, res, (err) => {
  if (err) return res.status(err.status || 400).json({ success: false, error: { message: err.message } });
  next();
});

// ─── §14quater.5 — Événements horodatés (tablette pointeuse) ──────
// Route native v2 pour la pointeuse PIN ; cohabite avec les routes legacy.
router.post('/evenements', async (req, res) => {
  try {
    const { id_employe, type_evt, photo_url, source = 'tablette_pin', id_appareil, notes } = req.body || {};
    if (!id_employe || !type_evt) {
      return res.status(400).json({ success: false, data: null, error: { message: 'id_employe et type_evt requis', code: 'BAD_REQUEST' } });
    }
    const { rows } = await getPool().query(
      `INSERT INTO pointages_evenements
         (id_employe, type_evt, photo_url, source, id_appareil, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id_employe, type_evt, photo_url || null, source, id_appareil || null, notes || null]
    );
    res.json({ success: true, data: rows[0], error: null });
  } catch (e) {
    res.status(500).json({ success: false, data: null, error: { message: e?.message, code: 'ERR' } });
  }
});

// ─── TimeMoto (AVANT /:id pour éviter conflits) ───────────────────
router.post('/timemoto/import',                             authenticate, timemotoImport);
router.post('/timemoto/csv',    authenticate, handleMulter(csvUpload.single('file')), timemotoImportCsv);
router.get ('/timemoto/config',                             authenticate, timemotoGetConfig);
router.put ('/timemoto/config',                             authenticate, timemotoUpdateConfig);
router.get ('/timemoto/mapping',                            authenticate, timemotoGetMapping);
router.put ('/timemoto/mapping/:id_utilisateur(\\d+)',      authenticate, timemotoUpdateMapping);
router.post('/timemoto/sync',                               authenticate, timemotoSyncCloud);
router.get ('/timemoto/history',                            authenticate, timemotoHistory);

// Routes spécifiques AVANT /:id
router.get('/stats/global', authenticate, getStatsGlobal);
router.get('/user/:user_id(\\d+)/today', authenticate, getPointageUserToday);
router.get('/user/:user_id(\\d+)/month/:mois', authenticate, getPointageUserMonth);

router.post('/check-in', authenticate, quickCheckIn);
router.post('/check-out', authenticate, quickCheckOut);
router.put('/:id(\\d+)/check-in', authenticate, setCheckIn);
router.put('/:id(\\d+)/check-out', authenticate, setCheckOut);

// CRUD standard (legacy — table pointage legacy)
router.get('/', authenticate, getPointage);
router.post('/', authenticate, createPointage);
router.get('/:id(\\d+)', authenticate, getPointageById);
router.put('/:id(\\d+)', authenticate, updatePointage);
router.delete('/:id(\\d+)', authenticate, deletePointage);

// NB : les handlers CRUD v2 (ctrl.list / ctrl.getOne / ctrl.create / ctrl.update
// / ctrl.remove) opèrent sur la table v2 (générique BaseModel) ; les routes
// legacy ci-dessus opèrent sur la table legacy `pointage`. On conserve la
// cohabitation pour ne pas casser les pages — un futur consolidation unifiera
// la table.

export default router;

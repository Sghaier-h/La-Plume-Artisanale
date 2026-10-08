/**
 * Routes Pointage
 */

import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
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
} from '../controllers/pointage.controller.js';
import {
  importPunches as timemotoImport,
  importCsv as timemotoImportCsv,
  getConfig as timemotoGetConfig,
  updateConfig as timemotoUpdateConfig,
  getMapping as timemotoGetMapping,
  updateMapping as timemotoUpdateMapping,
  syncCloud as timemotoSyncCloud,
  getHistory as timemotoHistory,
} from '../controllers/timemoto.controller.js';

const router = express.Router();

router.use(authenticate);

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

// ─── TimeMoto (AVANT /:id pour éviter conflits) ───────────────────
router.post('/timemoto/import',                             timemotoImport);
router.post('/timemoto/csv',    handleMulter(csvUpload.single('file')), timemotoImportCsv);
router.get ('/timemoto/config',                             timemotoGetConfig);
router.put ('/timemoto/config',                             timemotoUpdateConfig);
router.get ('/timemoto/mapping',                            timemotoGetMapping);
router.put ('/timemoto/mapping/:id_utilisateur(\\d+)',      timemotoUpdateMapping);
router.post('/timemoto/sync',                               timemotoSyncCloud);
router.get ('/timemoto/history',                            timemotoHistory);

// Routes spécifiques AVANT /:id
router.get('/stats/global', getStatsGlobal);
router.get('/user/:user_id(\\d+)/today', getPointageUserToday);
router.get('/user/:user_id(\\d+)/month/:mois', getPointageUserMonth);

router.post('/check-in', quickCheckIn);
router.post('/check-out', quickCheckOut);
router.put('/:id(\\d+)/check-in', setCheckIn);
router.put('/:id(\\d+)/check-out', setCheckOut);

// CRUD standard
router.get('/', getPointage);
router.post('/', createPointage);
router.get('/:id(\\d+)', getPointageById);
router.put('/:id(\\d+)', updatePointage);
router.delete('/:id(\\d+)', deletePointage);

export default router;

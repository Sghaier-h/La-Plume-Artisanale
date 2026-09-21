/**
 * Routes Audit — Journal d'audit
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getAudit,
  getAuditById,
  createAudit,
  deleteAudit,
  getStatsGlobal,
  getByEntity,
  getRecentByUser,
} from '../controllers/audit.controller.js';

const router = express.Router();

router.use(authenticate);

// Routes spécifiques avant /:id
router.get('/stats/global', getStatsGlobal);
router.get('/entity/:type/:id(\\d+)', getByEntity);
router.get('/user/:id_user(\\d+)/recent', getRecentByUser);

// CRUD
router.get('/', getAudit);
router.post('/', createAudit);
router.get('/:id(\\d+)', getAuditById);
router.delete('/:id(\\d+)', deleteAudit);

export default router;
